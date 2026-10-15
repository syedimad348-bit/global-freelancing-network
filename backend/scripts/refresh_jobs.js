#!/usr/bin/env node
/**
 * Quick job refresh: delete old jobs, fetch new ones
 */
const mongoose = require('mongoose');
const { fetchAllJobs, expireOldJobs } = require('../controllers/fetchJobs');
const { refreshLiveJobCache } = require('../services/liveJobCache');

async function main() {
  const mongoUri = process.env.MONGO_URL || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌ No MONGO_URL set');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');

  // Delete jobs older than 20 hours
  const cutoff = new Date(Date.now() - 20 * 60 * 60 * 1000);
  const result = await mongoose.connection.db.collection('freelance_network').deleteMany({
    fetchedAt: { $lt: cutoff }
  });
  console.log(`🗑️ Deleted ${result.deletedCount} jobs older than 20 hours`);

  // Fetch new jobs
  await fetchAllJobs();

  // Show total count
  const total = await mongoose.connection.db.collection('freelance_network').countDocuments();
  console.log(`📊 Total jobs in DB: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});