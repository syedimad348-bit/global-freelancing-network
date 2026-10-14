const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const User = require("../models/User");

const ROOT = path.join(__dirname, "..", "data", "total_users");

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

// GET /api/admin/dashboard - Admin dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    // Read user registry
    const jsonlPath = path.join(ROOT, "registry.jsonl");
    let registry = [];
    if (fs.existsSync(jsonlPath)) {
      const data = fs.readFileSync(jsonlPath, "utf8").split("\n").filter(Boolean);
      registry = data.map((line) => JSON.parse(line));
    }

    // Get all users from DB if available
    let dbUsers = [];
    if (mongoose.connection.readyState === 1) {
      dbUsers = await User.find({}, "name email plan createdAt").lean().sort({ createdAt: -1 });
    }

    // Calculate stats
    const totalUsers = dbUsers.length + registry.length;
    const newUsersLast7Days = registry.filter(
      (r) => new Date(r.registeredAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    // Sources breakdown
    const sourceBreakdown = {};
    registry.forEach((r) => {
      sourceBreakdown[r.email] = (sourceBreakdown[r.email] || 0) + 1;
    });

    // Daily registrations (last 30 days)
    const dailyRegistrations = {};
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      dailyRegistrations[dateKey] = 0;
    }
    registry.forEach((r) => {
      const dateKey = new Date(r.registeredAt).toISOString().split("T")[0];
      if (dailyRegistrations[dateKey] !== undefined) {
        dailyRegistrations[dateKey]++;
      }
    });

    res.json({
      dashboard: {
        totalUsers,
        newUsersLast7Days,
        dailyRegistrations,
        sourceBreakdown: Object.entries(sourceBreakdown).length,
      },
      registry: registry.slice(0, 100),  // Last 100 registrations
      dbUsersCount: dbUsers.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error getting admin dashboard' });
  }
});

// GET /api/admin/users - All user details
router.get("/users", async (req, res) => {
  try {
    let users = [];
    if (mongoose.connection.readyState === 1) {
      users = await User.find({}, "name email plan createdAt jobViews aiFeatureCalls resumeAnalyses").lean().sort({ createdAt: -1 });
    }
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error getting users' });
  }
});

// GET /api/admin/registry - Raw user registration registry
router.get("/registry", async (req, res) => {
  try {
    const jsonlPath = path.join(ROOT, "registry.jsonl");
    let registry = [];
    if (fs.existsSync(jsonlPath)) {
      const data = fs.readFileSync(jsonlPath, "utf8").split("\n").filter(Boolean);
      registry = data.map((line) => JSON.parse(line));
    }
    res.json({ registry });
  } catch (err) {
    res.status(500).json({ message: 'Server error getting registry' });
  }
});

module.exports = router;