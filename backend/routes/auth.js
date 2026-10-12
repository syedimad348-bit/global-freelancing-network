const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/appError");
const { createAccessToken, createRefreshToken, hashToken } = require("../utils/tokens");
const { jwtRefreshSecret } = require("../config/secrets");
const { recordRegisteredUser } = require("../services/userRegistryExport");

const router = express.Router();
const INTERESTS = ["Video Editing", "Python", "AI", "Marketing", "Health", "Graphics"];
const volatileUsers = new Map();

function setRefreshCookie(res, refreshToken) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    interests: user.interests || [],
  };
}

function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMagicLinkEmail({ to, name, link }) {
  const transporter = getTransport();
  if (!transporter) return false;
  const safeName = name || "there";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>Hi ${safeName},</h2>
      <p>Click the button below to log in to your DailyRadar dashboard:</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 16px;background:#6D28D9;color:#fff;text-decoration:none;border-radius:10px;font-weight:700">Log in to DailyRadar</a></p>
      <p style="color:#666;font-size:12px">This link expires in 15 minutes. If you didn’t request it, you can ignore this email.</p>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Your DailyRadar login link",
    html,
  });
  return true;
}

async function issueSession(user, res) {
  const accessToken = createAccessToken(user._id.toString());
  const refreshToken = createRefreshToken(user._id.toString());
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setRefreshCookie(res, refreshToken);
  return { accessToken, user: sanitizeUser(user) };
}

router.get("/onboarding-options", (_req, res) => {
  res.json({ interests: INTERESTS });
});

router.post("/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new AppError("Please fill all fields", 400, "VALIDATION_ERROR");
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400, "WEAK_PASSWORD");
  }

  const normalizedEmail = email.toLowerCase();
  if (mongoose.connection.readyState !== 1) {
    if (volatileUsers.has(normalizedEmail)) {
      throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
    }
    const fallbackUser = {
      _id: `offline-${Date.now()}`,
      name,
      email: normalizedEmail,
      plan: "free",
      interests: [],
    };
    volatileUsers.set(normalizedEmail, { ...fallbackUser, password });
    const accessToken = createAccessToken(fallbackUser._id);
    recordRegisteredUser({ name, email: normalizedEmail, plan: "free", degradedMode: true });
    return res.status(201).json({ accessToken, user: fallbackUser, degradedMode: true });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, password: hashed });
  recordRegisteredUser({ name, email: normalizedEmail, plan: user.plan || "free", degradedMode: false });
  const session = await issueSession(user, res);
  // Optional: send a magic login link via email if SMTP is configured
  try {
    const rawToken = crypto.randomBytes(24).toString("hex");
    user.magicLoginTokenHash = hashToken(rawToken);
    user.magicLoginExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const link = `${frontendUrl}/magic-login?token=${encodeURIComponent(rawToken)}`;
    await sendMagicLinkEmail({ to: user.email, name: user.name, link });
  } catch (_e) {
    // ignore email failures; normal login still works
  }
  res.status(201).json(session);
}));

router.post("/request-login-link", asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError("Magic link requires database connection.", 503, "DB_REQUIRED");
  }
  const email = String(req.body?.email || "").toLowerCase().trim();
  if (!email) throw new AppError("Email is required", 400, "VALIDATION_ERROR");
  const user = await User.findOne({ email });
  if (!user) {
    // Avoid account enumeration: pretend success
    return res.json({ ok: true });
  }
  const transporter = getTransport();
  if (!transporter) {
    throw new AppError("SMTP is not configured on server.", 400, "SMTP_NOT_CONFIGURED");
  }
  const rawToken = crypto.randomBytes(24).toString("hex");
  user.magicLoginTokenHash = hashToken(rawToken);
  user.magicLoginExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const link = `${frontendUrl}/magic-login?token=${encodeURIComponent(rawToken)}`;
  await sendMagicLinkEmail({ to: user.email, name: user.name, link });
  res.json({ ok: true });
}));

router.post("/magic-login", asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError("Magic link requires database connection.", 503, "DB_REQUIRED");
  }
  const token = String(req.body?.token || "").trim();
  if (!token) throw new AppError("Token is required", 400, "VALIDATION_ERROR");
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    magicLoginTokenHash: tokenHash,
    magicLoginExpiresAt: { $gt: new Date() },
  });
  if (!user) throw new AppError("Magic link is invalid or expired.", 401, "MAGIC_LINK_INVALID");
  user.magicLoginTokenHash = null;
  user.magicLoginExpiresAt = null;
  const session = await issueSession(user, res);
  res.json(session);
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Email and password are required", 400, "VALIDATION_ERROR");
  }

  const normalizedEmail = email.toLowerCase();
  if (mongoose.connection.readyState !== 1) {
    const fallbackUser = volatileUsers.get(normalizedEmail);
    if (!fallbackUser || fallbackUser.password !== password) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }
    const accessToken = createAccessToken(fallbackUser._id);
    return res.json({
      accessToken,
      user: sanitizeUser(fallbackUser),
      degradedMode: true,
      warning: "Running in offline mode because database is unavailable.",
    });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const session = await issueSession(user, res);
  res.json(session);
}));

router.post("/refresh", asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError("Session refresh unavailable in offline mode. Please log in again.", 401, "OFFLINE_REFRESH_UNAVAILABLE");
  }
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) {
    throw new AppError("Refresh token missing", 401, "REFRESH_REQUIRED");
  }

  const payload = jwt.verify(token, jwtRefreshSecret);
  if (payload.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH");
  }

  const user = await User.findById(payload.id);
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    throw new AppError("Refresh token invalid", 401, "INVALID_REFRESH");
  }

  const session = await issueSession(user, res);
  res.json(session);
}));

router.post("/logout", asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const payload = jwt.decode(token);
    if (payload?.id) {
      await User.findByIdAndUpdate(payload.id, { refreshTokenHash: null });
    }
  }
  res.clearCookie("refreshToken");
  res.json({ ok: true });
}));

router.put("/interests", protect, asyncHandler(async (req, res) => {
  const incoming = Array.isArray(req.body?.interests) ? req.body.interests : [];
  const unique = [...new Set(incoming.map((item) => String(item).trim()).filter(Boolean))];
  if (mongoose.connection.readyState !== 1) {
    const fallback = [...volatileUsers.values()].find((u) => u._id === req.user.id);
    if (!fallback) throw new AppError("User not found in offline mode", 404, "USER_NOT_FOUND");
    fallback.interests = unique;
    volatileUsers.set(fallback.email, fallback);
    return res.json({ user: sanitizeUser(fallback), degradedMode: true });
  }
  if (!/^[a-fA-F0-9]{24}$/.test(String(req.user.id))) {
    throw new AppError("Interests sync requires a full account (database mode).", 400, "INVALID_USER_ID");
  }
  const user = await User.findByIdAndUpdate(req.user.id, { interests: unique }, { new: true });
  res.json({ user: sanitizeUser(user) });
}));

router.get("/me", protect, asyncHandler(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const fallback = [...volatileUsers.values()].find((u) => u._id === req.user.id);
    if (!fallback) throw new AppError("User not found in offline mode", 404, "USER_NOT_FOUND");
    return res.json(sanitizeUser(fallback));
  }
  if (!/^[a-fA-F0-9]{24}$/.test(String(req.user.id))) {
    const fallback = [...volatileUsers.values()].find((u) => u._id === req.user.id);
    if (!fallback) throw new AppError("User not found in offline mode", 404, "USER_NOT_FOUND");
    return res.json(sanitizeUser(fallback));
  }
  const user = await User.findById(req.user.id).select("-password -refreshTokenHash");
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  res.json(user);
}));

module.exports = router;