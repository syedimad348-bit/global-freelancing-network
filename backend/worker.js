#!/usr/bin/env node
/**
 * Global Freelancing Network - Job Fetching Worker
 * 
 * This script runs the job fetching process every 6 hours on VPS.
 * It uses the same logic as the backend server but runs as a standalone worker.
 * 
 * Usage:
 *   node worker.js          # Run once and exit
 *   node worker.js --watch  # Run continuously (runs every 6 hours)
 *   npm run worker:start    # Start as systemd service
 */

const { fetchAllJobs, expireOldJobs, expireOldSavedJobs } = require('./controllers/fetchJobs');
const { refreshLiveJobCache } = require('./services/liveJobCache');
const { processEmailAlerts } = require('./services/alerts');
const mongoose = require('mongoose');
const cron = require('node-cron');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuration
const JOB_MAX_AGE_HOURS = 48; // Jobs older than 48 hours are removed
const INTERVAL_HOURS = 6;     // Run every 6 hours

/**
 * Run the complete job fetching cycle
 */
async function runJobFetchCycle() {
  console.log(`[${new Date().toISOString()}] Starting job fetch cycle...`);
  
  try {
    // Refresh live job cache from all sources
    const liveCache = await refreshLiveJobCache();
    console.log(`✅ Live cache updated: ${liveCache.jobs.length} jobs`);
    
    // If MongoDB is connected, perform additional operations
    if (mongoose.connection.readyState === 1) {
      console.log('📊 MongoDB connected - performing database operations...');
      
      // Fetch and store new jobs from sources
      await fetchAllJobs();
      console.log('✅ New jobs fetched and stored');
      
      // Expire old jobs (older than 48 hours)
      const expiredCount = await expireOldJobs();
      if (expiredCount > 0) {
        console.log(`🗑️  Removed ${expiredCount} expired jobs`);
      }
      
      // Expire old saved jobs (older than 48 hours)
      const expiredSavedCount = await expireOldSavedJobs();
      if (expiredSavedCount > 0) {
        console.log(`🗑️  Removed ${expiredSavedCount} expired saved jobs`);
      }
      
      // Process email alerts
      await processEmailAlerts();
      console.log('✅ Email alerts processed');
    } else {
      console.log('⚠️  MongoDB not connected - running in cache-only mode');
    }
    
    console.log(`[${new Date().toISOString()}] Job fetch cycle completed successfully`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Job fetch cycle failed:`, error.message);
    return false;
  }
}

/**
 * Main function - handles command line arguments
 */
async function main() {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch') || args.includes('-w');
  
  console.log('🔧 Global Freelancing Network - Job Fetching Worker');
  console.log('====================================================');
  
  // Connect to MongoDB (non-fatal - worker can run in cache-only mode)
  if (process.env.MONGO_URL || process.env.MONGO_URI) {
    try {
      const uri = process.env.MONGO_URL || process.env.MONGO_URI;
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected');
    } catch (err) {
      console.log('⚠️  MongoDB connection failed (continuing in cache-only mode):', err.message);
    }
  } else {
    console.log('⚠️  No MONGO_URI configured - running in cache-only mode');
  }
  
  if (watchMode) {
    // Run continuously with scheduled intervals
    console.log(`⏰ Starting worker in watch mode (runs every ${INTERVAL_HOURS} hours)`);
    
    // Run immediately on start
    await runJobFetchCycle();
    
    // Schedule recurring runs
    cron.schedule(`0 */${INTERVAL_HOURS} * * *`, async () => {
      await runJobFetchCycle();
    });
    
    console.log('✅ Worker started - will run every 6 hours');
    console.log('   Press Ctrl+C to stop');
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Worker shutting down...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Worker shutting down...');
      process.exit(0);
    });
  } else {
    // Run once and exit
    console.log('🔄 Running single job fetch cycle...');
    const success = await runJobFetchCycle();
    process.exit(success ? 0 : 1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the worker continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Don't exit - let the worker continue
});

// Start the worker
main().catch(err => {
  console.error('💥 Fatal error in worker:', err);
  process.exit(1);
});