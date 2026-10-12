const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const User = require("../models/User");
const Job = require("../models/Job");
const { getLiveJobCache } = require("./liveJobCache");

function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function getMatchingJobs(interests) {
  const regex = interests?.length ? new RegExp(interests.join("|"), "i") : null;
  if (mongoose.connection.readyState === 1) {
    const query = regex ? { $or: [{ title: regex }, { category: regex }, { folder: regex }, { tags: regex }] } : {};
    return Job.find(query).sort({ fetchedAt: -1 }).limit(10).lean();
  }
  const live = getLiveJobCache().jobs || [];
  return (regex ? live.filter((job) => regex.test(`${job.title} ${job.category} ${job.folder}`)) : live).slice(0, 10);
}

async function sendJobAlertEmail(email, name, jobs) {
  const transporter = getTransport();
  if (!transporter) return false;
  const html = `
    <h2>Hello ${name || "there"}, new matching jobs are waiting for you</h2>
    <ul>
      ${jobs.map((j) => `<li><a href="${j.url}">${j.title}</a> - ${j.company} (${j.source})</li>`).join("")}
    </ul>
    <p>Open your dashboard to apply now.</p>
  `;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "DailyRadar job alerts",
    html,
  });
  return true;
}

async function processEmailAlerts() {
  if (mongoose.connection.readyState !== 1) return;
  const users = await User.find({ emailAlertsEnabled: true }).limit(100).lean();
  for (const user of users) {
    const jobs = await getMatchingJobs(user.interests || []);
    if (!jobs.length) continue;
    try {
      const ok = await sendJobAlertEmail(user.email, user.name, jobs);
      if (ok) await User.findByIdAndUpdate(user._id, { lastAlertSentAt: new Date() });
    } catch (_error) {
      // keep queue resilient
    }
  }
}

module.exports = { processEmailAlerts, sendJobAlertEmail };
