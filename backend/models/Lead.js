const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['facebook', 'tricks', 'apply', 'share_number', 'whatsapp', 'other'],
      required: true,
      index: true,
    },
    niche: {
      type: String,
      trim: true,
      default: '',
    },
    toolId: {
      type: String,
      trim: true,
      default: '',
    },
    toolName: {
      type: String,
      trim: true,
      default: '',
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    normalizedNumber: {
      type: String,
      trim: true,
      default: '',
    },
    countryCode: {
      type: String,
      default: '+1',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: String,
      default: 'anonymous',
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'processed', 'failed'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['unconfigured_provider', 'queued', 'sent', 'failed'],
      default: 'unconfigured_provider',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

leadSchema.index({ normalizedNumber: 1, toolId: 1, submittedAt: -1 });
leadSchema.index({ email: 1, type: 1 });

module.exports = mongoose.model('Lead', leadSchema);