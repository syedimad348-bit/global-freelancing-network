const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, enum: ["applied", "review", "interview", "offer", "rejected"], default: "applied" },
    source: { type: String, default: "Platform" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
