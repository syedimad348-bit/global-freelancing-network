const express = require("express");
const multer = require("multer");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const FormData = require("form-data");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const { isMongoObjectId } = require("../utils/mongoId");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function fallbackResumeAnalysis(text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasLinkedIn = /linkedin/.test(text.toLowerCase());
  const hasGithub = /github/.test(text.toLowerCase());
  const score = Math.max(35, Math.min(90, Math.round(words.length / 8) + (hasEmail ? 10 : 0) + (hasLinkedIn ? 10 : 0) + (hasGithub ? 8 : 0)));

  const strengths = [];
  const weaknesses = [];
  if (words.length > 220) strengths.push("Resume has adequate content depth.");
  else weaknesses.push("Resume is too short; add detailed achievements.");
  if (hasEmail) strengths.push("Contact email is present.");
  else weaknesses.push("Missing email contact information.");
  if (hasLinkedIn) strengths.push("LinkedIn profile detected.");
  else weaknesses.push("Add LinkedIn profile URL.");
  if (hasGithub) strengths.push("GitHub profile detected.");
  else weaknesses.push("Add GitHub/project portfolio links.");

  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : score >= 50 ? "C+" : score >= 40 ? "C" : "D";
  return {
    score,
    grade,
    breakdown: {
      skills: Math.min(30, Math.max(5, Math.round(score * 0.3))),
      education: Math.min(20, Math.max(4, Math.round(score * 0.2))),
      experience: Math.min(25, Math.max(5, Math.round(score * 0.25))),
      contact: Math.min(15, (hasEmail ? 5 : 0) + (hasLinkedIn ? 5 : 0) + (hasGithub ? 5 : 0)),
      content: Math.min(10, Math.max(2, Math.round(score * 0.1))),
    },
    strengths,
    weaknesses,
    tech_skills: [],
    soft_skills: [],
    contact: {
      email: hasEmail,
      phone: /\d{7,}/.test(text),
      linkedin: hasLinkedIn,
      github: hasGithub,
    },
    suggestions: [
      "Quantify impact with metrics (for example: improved X by 25%).",
      "Tailor keywords for each role and ATS systems.",
      "Keep sections concise and highlight top projects first.",
    ],
    source: "fallback",
  };
}

router.post("/resume-analyze", protect, upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file || file.mimetype !== "application/pdf") {
    return res.status(400).json({ message: "Please upload a PDF resume." });
  }

  try {
    if (isMongoObjectId(req.user.id)) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { "usage.resumeAnalyses": 1 } });
    }
    let attempts = 0;
    let lastError = null;
    while (attempts < 3) {
      attempts += 1;
      try {
        const form = new FormData();
        form.append("file", file.buffer, { filename: file.originalname, contentType: "application/pdf" });
          const response = await axios.post(
            process.env.AI_ENGINE_URL,
            form,
            { timeout: 30000, headers: form.getHeaders ? form.getHeaders() : {} }
          );
        const normalized = {
          score: response.data.score ?? 0,
          grade: response.data.grade || "C",
          breakdown: response.data.breakdown || { skills: 0, education: 0, experience: 0, contact: 0, content: 0 },
          tech_skills: response.data.tech_skills || [],
          soft_skills: response.data.soft_skills || [],
          contact: response.data.contact || { email: false, phone: false, linkedin: false, github: false },
          suggestions: response.data.suggestions || [],
          strengths: response.data.strengths || [],
          weaknesses: response.data.weaknesses || [],
          source: "ai-engine",
        };
        return res.json(normalized);
      } catch (error) {
        lastError = error;
      }
    }

    const parsed = await pdfParse(file.buffer);
    const fallback = fallbackResumeAnalysis(parsed.text || "");
    return res.status(200).json({
      ...fallback,
      warning: "AI engine temporarily unavailable. Fallback analysis used.",
      error: lastError?.message || "AI unavailable",
    });
  } catch (error) {
    return res.status(500).json({ message: "Resume analysis failed", error: error.message });
  }
});

module.exports = router;
