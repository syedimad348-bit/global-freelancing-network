const mongoose = require('mongoose');

const whatsAppRequestSchema = new mongoose.Schema(
  {
    toolId: {
      type: String,
      required: true,
      trim: true,
    },
    toolName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedNumber: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      default: '+1',
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
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index to prevent duplicate flood within a short window
whatsAppRequestSchema.index({ normalizedNumber: 1, toolId: 1, requestedAt: -1 });

module.exports = mongoose.model('WhatsAppRequest', whatsAppRequestSchema);
