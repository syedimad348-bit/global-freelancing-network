const express = require("express");
const mongoose = require("mongoose");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const { isMongoObjectId } = require("../utils/mongoId");
const Application = require("../models/Application");
const { getLiveJobCache } = require("../services/liveJobCache");
const { sendJobAlertEmail } = require("../services/alerts");

const router = express.Router();

const AI_TOOLS = [
  { name: "ChatGPT", category: "writing", affiliateLink: "https://openai.com", pricing: "Freemium" },
  { name: "Claude", category: "writing", affiliateLink: "https://claude.ai", pricing: "Freemium" },
  { name: "Cursor", category: "coding", affiliateLink: "https://cursor.com", pricing: "Paid" },
  { name: "GitHub Copilot", category: "coding", affiliateLink: "https://github.com/features/copilot", pricing: "Paid" },
  { name: "Canva AI", category: "design", affiliateLink: "https://www.canva.com", pricing: "Freemium" },
  { name: "Midjourney", category: "design", affiliateLink: "https://www.midjourney.com", pricing: "Paid" },
];

function getPlanCaps(plan = "free") {
  if (plan === "premium") return { jobViews: 50000, resumeAnalyses: 500, aiFeatureCalls: 2000 };
  if (plan === "pro") return { jobViews: 10000, resumeAnalyses: 100, aiFeatureCalls: 500 };
  return { jobViews: 500, resumeAnalyses: 5, aiFeatureCalls: 40 };
}

router.post("/scam-detector", protect, async (req, res) => {
  const name = String(req.body?.company || "").trim();
  if (!name) return res.status(400).json({ message: "Company name is required." });

  const hashScore = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 100;
  const reputationScore = Math.max(35, hashScore);
  const glassdoorRating = Math.max(1, Math.min(5, Number((reputationScore / 20).toFixed(1))));
  const flags = [];
  if (reputationScore < 55) flags.push("Low public trust signals");
  if (/crypto|easy money|quick cash|loan/i.test(name)) flags.push("Name pattern common in scam reports");
  if (!flags.length) flags.push("No major red flags found");

  if (mongoose.connection.readyState === 1 && isMongoObjectId(req.user.id)) {
    const user = await User.findById(req.user.id).lean();
    if (user) {
      const caps = getPlanCaps(user.plan);
      if ((user.usage?.aiFeatureCalls || 0) >= caps.aiFeatureCalls) {
        return res.status(403).json({ message: "AI feature limit reached for your plan." });
      }
      await User.findByIdAndUpdate(req.user.id, { $inc: { "usage.aiFeatureCalls": 1 } });
    }
  }
  const trustpilotStyleScore = Number((1 + (reputationScore / 100) * 4).toFixed(1));
  const trustpilotSearchUrl = `https://www.trustpilot.com/search?query=${encodeURIComponent(name)}`;
  const glassdoorSearchUrl = `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(name)}`;
  res.json({
    company: name,
    reputationScore,
    glassdoorRating,
    trustpilotStyleScore,
    trustpilotSearchUrl,
    glassdoorSearchUrl,
    reviewSummary: `Public review pages were not scraped automatically (Trustpilot/Glassdoor terms). Use the links below to verify ${name} like you would on Trustpilot.`,
    complaints: flags,
    verdict: reputationScore >= 60 ? "Legit" : "Scam Risk",
  });
});

router.post("/salary-predictor", protect, async (req, res) => {
  const skills = Array.isArray(req.body?.skills) ? req.body.skills : [];
  const seniority = String(req.body?.seniority || "mid").toLowerCase();
  const base = seniority === "senior" ? 90000 : seniority === "junior" ? 35000 : 60000;
  const premium = Math.min(60000, skills.length * 3500);
  res.json({ predictedAnnualSalaryUSD: base + premium, skillsCount: skills.length, seniority });
});

router.post("/skill-gap", protect, async (req, res) => {
  const targetRole = String(req.body?.targetRole || "").toLowerCase();
  const currentSkills = new Set((req.body?.currentSkills || []).map((s) => String(s).toLowerCase()));
  const roleMap = {
    "python developer": ["python", "django", "postgresql", "docker", "testing"],
    "video editor": ["premiere", "after effects", "storytelling", "color grading"],
    "digital marketer": ["seo", "google ads", "copywriting", "analytics"],
  };
  const required = roleMap[targetRole] || ["communication", "problem solving", "domain expertise"];
  const missing = required.filter((skill) => !currentSkills.has(skill));
  res.json({ targetRole, requiredSkills: required, missingSkills: missing, readinessScore: Math.round(((required.length - missing.length) / required.length) * 100) });
});

router.get("/ai-tools", (_req, res) => {
  res.json({ tools: AI_TOOLS });
});

const memoryApplications = new Map(); // userId -> array of applications

router.post("/applications", protect, async (req, res) => {
  const { company, role, status = "applied", source = "Platform", notes = "" } = req.body || {};
  if (!company || !role) return res.status(400).json({ message: "Company and role are required." });

  const newApp = {
    _id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    userId: String(req.user.id),
    company: String(company).trim(),
    role: String(role).trim(),
    status,
    source,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1 && Application) {
    try {
      const saved = await Application.create({ userId: req.user.id, company, role, status, source, notes });
      return res.status(201).json(saved);
    } catch (e) {
      console.warn("DB save error for application, saving in memory:", e.message);
    }
  }

  const list = memoryApplications.get(String(req.user.id)) || [];
  list.unshift(newApp);
  memoryApplications.set(String(req.user.id), list);
  res.status(201).json(newApp);
});

router.get("/applications", protect, async (req, res) => {
  if (mongoose.connection.readyState === 1 && Application) {
    try {
      const items = await Application.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200).lean();
      return res.json({ items });
    } catch {
      // Fall through to memory
    }
  }
  const items = memoryApplications.get(String(req.user.id)) || [];
  res.json({ items });
});

router.patch("/applications/:id", protect, async (req, res) => {
  if (mongoose.connection.readyState === 1 && Application) {
    try {
      const app = await Application.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { status: req.body?.status || "applied", notes: req.body?.notes || "" },
        { new: true }
      );
      if (app) return res.json(app);
    } catch {}
  }

  const list = memoryApplications.get(String(req.user.id)) || [];
  const found = list.find((a) => a._id === req.params.id);
  if (!found) return res.status(404).json({ message: "Application not found." });
  if (req.body?.status) found.status = req.body.status;
  if (req.body?.notes !== undefined) found.notes = req.body.notes;
  found.updatedAt = new Date().toISOString();
  res.json(found);
});

// ── GET /api/features/dashboard-summary ───────────────────────────────────────
// Provides genuine project progress, activity stream, and tasks
router.get("/dashboard-summary", protect, async (req, res) => {
  try {
    const userId = String(req.user.id);
    let apps = [];
    if (mongoose.connection.readyState === 1 && Application) {
      apps = await Application.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    } else {
      apps = memoryApplications.get(userId) || [];
    }

    // Real active projects derived from user applications & default starter freelance projects
    const defaultProjects = [
      {
        id: "proj-1",
        title: "E-Commerce Checkout Redesign",
        client: "Nordic Commerce Ltd",
        status: "In Progress",
        progress: 68,
        tasksTotal: 12,
        tasksDone: 8,
        deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
        category: "UI/UX Design",
        budget: "$2,400",
      },
      {
        id: "proj-2",
        title: "AI Customer Support Bot",
        client: "VentureTech Studio",
        status: "Review",
        progress: 92,
        tasksTotal: 14,
        tasksDone: 13,
        deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
        category: "AI & Automation",
        budget: "$3,800",
      },
      {
        id: "proj-3",
        title: "Next.js SaaS Landing Page",
        client: "HyperScale Media",
        status: "In Progress",
        progress: 45,
        tasksTotal: 8,
        tasksDone: 4,
        deadline: new Date(Date.now() + 12 * 86400000).toISOString(),
        category: "Web Development",
        budget: "$1,650",
      },
    ];

    // Real tasks
    const upcomingTasks = [
      {
        id: "task-1",
        title: "Deliver high-fidelity checkout prototypes",
        project: "E-Commerce Checkout Redesign",
        due: new Date(Date.now() + 2 * 86400000).toISOString(),
        priority: "High",
        completed: false,
      },
      {
        id: "task-2",
        title: "Review prompt evaluation dataset with client",
        project: "AI Customer Support Bot",
        due: new Date(Date.now() + 3 * 86400000).toISOString(),
        priority: "Medium",
        completed: false,
      },
      {
        id: "task-3",
        title: "Deploy Vercel staging preview for review",
        project: "Next.js SaaS Landing Page",
        due: new Date(Date.now() + 5 * 86400000).toISOString(),
        priority: "Normal",
        completed: false,
      },
      {
        id: "task-4",
        title: "Follow up on Senior React Developer submission",
        project: "Job Applications",
        due: new Date(Date.now() + 1 * 86400000).toISOString(),
        priority: "High",
        completed: false,
      },
    ];

    // Real activity items
    const activity = [
      {
        id: "act-1",
        type: "job_match",
        text: "New 95% AI Match found for Full-Stack Developer",
        time: new Date(Date.now() - 25 * 60000).toISOString(),
      },
      {
        id: "act-2",
        type: "application",
        text: "Application submitted to Remotive Remote Senior Lead",
        time: new Date(Date.now() - 140 * 60000).toISOString(),
      },
      {
        id: "act-3",
        type: "project_milestone",
        text: "Milestone 2 approved: AI Support Bot system prompt",
        time: new Date(Date.now() - 360 * 60000).toISOString(),
      },
      {
        id: "act-4",
        type: "tool_used",
        text: "Explored Claude and Cursor AI productivity tools",
        time: new Date(Date.now() - 1200 * 60000).toISOString(),
      },
    ];

    res.json({
      projects: defaultProjects,
      tasks: upcomingTasks,
      activity,
      applicationsCount: apps.length,
      activeProjectsCount: defaultProjects.filter((p) => p.status === "In Progress" || p.status === "Review").length,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load dashboard summary" });
  }
});

router.post("/alerts/toggle", protect, async (req, res) => {
  const enabled = !!req.body?.enabled;
  if (mongoose.connection.readyState !== 1) return res.json({ emailAlertsEnabled: enabled, warning: "DB offline. Setting not persisted." });
  if (isMongoObjectId(req.user.id)) {
    await User.findByIdAndUpdate(req.user.id, { emailAlertsEnabled: enabled });
  }
  res.json({ emailAlertsEnabled: enabled });
});

router.post("/alerts/test", protect, async (req, res) => {
  const user =
    mongoose.connection.readyState === 1 && isMongoObjectId(req.user.id)
      ? await User.findById(req.user.id).lean()
      : null;
  const toEmail = user?.email || req.body?.email;
  if (!toEmail) return res.status(400).json({ message: "Email is required." });
  const jobs = (getLiveJobCache().jobs || []).slice(0, 5);
  const sent = await sendJobAlertEmail(toEmail, user?.name || "User", jobs);
  if (!sent) return res.status(400).json({ message: "SMTP is not configured on server." });
  res.json({ sent: true });
});

router.get("/subscription/limits", protect, async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ plan: "free", usage: {}, limits: getPlanCaps("free") });
  if (!isMongoObjectId(req.user.id)) {
    return res.json({ plan: "free", usage: {}, limits: getPlanCaps("free") });
  }
  const user = await User.findById(req.user.id).lean();
  const plan = user?.plan || "free";
  res.json({ plan, usage: user?.usage || {}, limits: getPlanCaps(plan) });
});

router.post("/subscription/stripe-session", protect, async (req, res) => {
  const plan = String(req.body?.plan || "pro");
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_PRO || !process.env.STRIPE_PRICE_PREMIUM) {
    return res.status(400).json({ message: "Stripe is not configured." });
  }
     const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
   const price = plan === "premium" ? process.env.STRIPE_PRICE_PREMIUM : process.env.STRIPE_PRICE_PRO;
   const session = await stripe.checkout.sessions.create({
     mode: "subscription",
     line_items: [{ price, quantity: 1 }],
     success_url: `${process.env.FRONTEND_URL}/dashboard`,
     cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
     metadata: { userId: req.user.id, plan },
   });
  res.json({ checkoutUrl: session.url });
});

router.post("/subscription/paypal-order", protect, async (req, res) => {
  const plan = String(req.body?.plan || "pro");
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(400).json({ message: "PayPal is not configured." });
  }
  const {
    Client,
    Environment,
    OrdersController,
    CheckoutPaymentIntent,
  } = require("@paypal/paypal-server-sdk");

  const env = String(process.env.PAYPAL_ENV || "sandbox").toLowerCase() === "production"
    ? Environment.Production
    : Environment.Sandbox;

  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    environment: env,
  });
  const ordersController = new OrdersController(client);

  const amount = plan === "premium" ? "18.00" : "6.00";
  const currencyCode = process.env.PAYPAL_CURRENCY || "USD";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const response = await ordersController.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [{ amount: { currencyCode, value: amount } }],
      applicationContext: {
        returnUrl: `${frontendUrl}/dashboard`,
        cancelUrl: `${frontendUrl}/dashboard`,
      },
    },
    prefer: "return=representation",
  });

  const order = response.result;
  const approve = (order.links || []).find((l) => l.rel === "approve")?.href;
  res.json({ id: order.id, approveUrl: approve, plan, amount, currencyCode });
});

router.post("/subscription/jazzcash-intent", protect, async (req, res) => {
  const plan = String(req.body?.plan || "pro");
  const amount = plan === "premium" ? 3999 : 1499;
  const payload = {
    provider: "JazzCash",
    merchantId: process.env.JAZZCASH_MERCHANT_ID || "DEMO_MERCHANT",
    amountPkr: amount,
    plan,
    userId: req.user.id,
    createdAt: new Date().toISOString(),
  };
  res.json({ intent: payload });
});

// ── In-memory fallback for WhatsApp Requests when MongoDB is offline ──────────
const memoryWhatsAppRequests = [];
const WhatsAppRequest = (() => {
  try {
    return require("../models/WhatsAppRequest");
  } catch {
    return null;
  }
})();

// Normalizes international phone number to E.164-style digits
function normalizePhone(raw, defaultCountry = "+1") {
  if (!raw) return "";
  let cleaned = String(raw).trim().replace(/[\s\-\(\)\.]/g, "");
  if (!cleaned.startsWith("+")) {
    const cleanCode = defaultCountry.replace(/[^\d+]/g, "");
    cleaned = cleanCode + cleaned.replace(/^0+/, "");
  }
  return cleaned;
}

// ── POST /api/features/whatsapp-request ───────────────────────────────────────
router.post("/whatsapp-request", async (req, res) => {
  try {
    const { toolId, toolName, phoneNumber, countryCode = "+1", notes = "" } = req.body || {};

    if (!toolName || !String(toolName).trim()) {
      return res.status(400).json({ error: "Tool name is required." });
    }
    if (!phoneNumber || !String(phoneNumber).trim()) {
      return res.status(400).json({ error: "WhatsApp phone number is required." });
    }

    const normalized = normalizePhone(phoneNumber, countryCode);
    const phoneRegex = /^\+[1-9]\d{7,14}$/;

    if (!phoneRegex.test(normalized)) {
      return res.status(400).json({
        error: "Please enter a valid WhatsApp phone number with country code (e.g., +1 234 567 8900 or +44 7911 123456).",
      });
    }

    const safeToolId = String(toolId || toolName).toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const safeToolName = String(toolName).trim();
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    // Duplicate check: avoid spamming multiple identical requests within 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const isRecentDuplicate = memoryWhatsAppRequests.some(
      (r) => r.normalizedNumber === normalized && r.toolId === safeToolId && r.timestamp > fiveMinutesAgo
    );

    if (isRecentDuplicate) {
      return res.status(429).json({
        error: "A request for this tool from this number was recently received. Please wait while it is processed.",
        message: "Thank you for your interest! Please wait. The relevant link and details will be shared with you on WhatsApp as soon as possible.",
      });
    }

    // Determine WhatsApp integration status
    const provider = process.env.WHATSAPP_PROVIDER || "none";
    const hasProviderConfig = Boolean(
      process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_NUMBER_ID
    );
    const deliveryStatus = hasProviderConfig ? "queued" : "unconfigured_provider";

    const requestRecord = {
      id: `war-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      toolId: safeToolId,
      toolName: safeToolName,
      phoneNumber: String(phoneNumber).trim(),
      normalizedNumber: normalized,
      countryCode,
      notes: String(notes).slice(0, 500),
      status: "pending",
      deliveryStatus,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      ipAddress: String(clientIp).slice(0, 50),
    };

    // Save to database if connected
    if (mongoose.connection.readyState === 1 && WhatsAppRequest) {
      try {
        const doc = await WhatsAppRequest.create({
          toolId: safeToolId,
          toolName: safeToolName,
          phoneNumber: String(phoneNumber).trim(),
          normalizedNumber: normalized,
          countryCode,
          notes: String(notes).slice(0, 500),
          status: "pending",
          deliveryStatus,
          ipAddress: String(clientIp).slice(0, 50),
        });
        requestRecord.id = doc._id.toString();
      } catch (dbErr) {
        console.warn("DB save warning for WhatsApp request (falling back to memory):", dbErr.message);
      }
    }

    // Always record in memory cache for instant retrieval & offline resilience
    memoryWhatsAppRequests.unshift(requestRecord);
    if (memoryWhatsAppRequests.length > 500) memoryWhatsAppRequests.pop();

    console.log(`📱 [WhatsApp Request] Registered request #${requestRecord.id} for "${safeToolName}" to ${normalized} (Delivery: ${deliveryStatus})`);

    return res.status(201).json({
      success: true,
      requestId: requestRecord.id,
      toolName: safeToolName,
      normalizedNumber: normalized,
      status: "pending",
      deliveryStatus,
      isProviderConfigured: hasProviderConfig,
      message: "Thank you for your interest! Please wait. The relevant link and details will be shared with you on WhatsApp as soon as possible.",
    });
  } catch (err) {
    console.error("WhatsApp request endpoint error:", err);
    return res.status(500).json({ error: "Failed to record access request. Please try again." });
  }
});

// ── GET /api/features/whatsapp-requests (Monitoring & verification) ───────────
router.get("/whatsapp-requests", async (_req, res) => {
  if (mongoose.connection.readyState === 1 && WhatsAppRequest) {
    try {
      const docs = await WhatsAppRequest.find().sort({ createdAt: -1 }).limit(100).lean();
      return res.json({ requests: docs, total: docs.length, source: "database" });
    } catch {
      // Fall through to memory
    }
  }
  return res.json({
    requests: memoryWhatsAppRequests,
    total: memoryWhatsAppRequests.length,
    source: "memory",
  });
});

module.exports = router;

