const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    savedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    avatar: {
      type: String,
      default: "",
    },
    interests: {
      type: [String],
      default: [],
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
    magicLoginTokenHash: {
      type: String,
      default: null,
    },
    magicLoginExpiresAt: {
      type: Date,
      default: null,
    },
    usage: {
      resumeAnalyses: { type: Number, default: 0 },
      aiFeatureCalls: { type: Number, default: 0 },
      jobViews: { type: Number, default: 0 },
    },
    emailAlertsEnabled: {
      type: Boolean,
      default: false,
    },
    lastAlertSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);