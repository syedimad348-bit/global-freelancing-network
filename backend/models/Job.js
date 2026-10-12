const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true },
    company:  { type: String, default: 'Company' },
    location: { type: String, default: 'Remote' },
    url:      { type: String, required: true, unique: true },
    source:   { type: String, default: 'Unknown' },
    type:     { type: String, default: 'Full-time' },
    category: { type: String, default: 'Tech' },
    folder:   { type: String, default: 'General' },
    tags:     { type: [String], default: [] },
    salary:   { type: String, default: '' },
    postedAt: { type: Date, default: null },
    fetchedAt: { type: Date, default: Date.now },
    remoteType: { type: String, default: 'remote' },
    country:    { type: String, default: '' },
    sourceHealth: { type: Number, default: 1 },
    sourceFailures: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ fetchedAt: -1 });
jobSchema.index({ postedAt: -1 });
jobSchema.index({ source: 1 });
jobSchema.index({ remoteType: 1 });
jobSchema.index({ country: 1 });

module.exports = mongoose.model('Job', jobSchema);