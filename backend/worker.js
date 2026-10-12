#!/usr/bin/env node
/**
 * Global Freelancing Network - Job Fetching Worker
 * 
 * This script runs the job fetching process on demand or continuously.
 * It uses the same logic as the backend server.
 * 
 * Usage:
 *   node worker.js          # Run once and exit
 *   node worker.js --watch  # Run continuously (runs every 6 hours)
 * 
 * Environment Variables:
 *   MONGO_URI  - MongoDB connection string (required)
 *   MONGO_URL  - Alternative MongoDB connection string (fallback if MONGO_URI not set)
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
const INTERVAL_HOURS = 6;     // Run every 6 hours in watch mode

/**
 * Resolve MongoDB connection string from environment variables.
 * Prefers MONGO_URI (matches existing server.js convention).
 * Falls back to MONGO_URL for backward compatibility.
 * Returns null if neither is set.
 */
function resolveMongoURI() {
  return process.env.MONGO_URI || process.env.MONGO_URL || null;
}

/**
 * Run the complete job fetching cycle
 * Returns true only if MongoDB was connected and operations succeeded.
 * Returns false if MongoDB was not connected or operations failed.
 */
async function runJobFetchCycle() {
  console.log(`[${new Date().toISOString()}] Starting job fetch cycle...`);
  
  // Verify MongoDB is connected before proceeding
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ FATAL: MongoDB is not connected. Cannot fetch jobs.');
    console.error('   Set MONGO_URI (or MONGO_URL) environment variable with your MongoDB connection string.');
    return false;
  }
  
  try {
    // Refresh live job cache from all sources
    const liveCache = await refreshLiveJobCache();
    console.log(`✅ Live cache updated: ${liveCache.jobs.length} jobs`);
    
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
  
  // Resolve MongoDB connection string
  const mongoURI = resolveMongoURI();
  
  if (!mongoURI) {
    console.error('❌ FATAL: No MongoDB connection string configured.');
    console.error('   Set the MONGO_URI (or MONGO_URL) environment variable.');
    console.error('   Example: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db');
    process.exit(1);
  }
  
  // Connect to MongoDB (required - worker cannot run without it)
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ FATAL: MongoDB connection failed:', err.message);
    console.error('   Verify your MONGO_URI is correct and the cluster is accessible.');
    process.exit(1);
  }
  
  // Verify connection is actually established
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ FATAL: MongoDB connection not established after connect attempt.');
    process.exit(1);
  }
  
  if (watchMode) {
    // Run continuously with scheduled intervals
    console.log(`⏰ Starting worker in watch mode (runs every ${INTERVAL_HOURS} hours)`);
    
    // Run immediately on start
    const initialSuccess = await runJobFetchCycle();
    if (!initialSuccess) {
      console.error('❌ Initial job fetch cycle failed. Exiting.');
      process.exit(1);
    }
    
    // Schedule recurring runs
    cron.schedule(`0 */${INTERVAL_HOURS} * * *`, async () => {
      const success = await runJobFetchCycle();
      if (!success) {
        console.error('❌ Scheduled job fetch cycle failed.');
        // Don't exit - let the worker retry on next schedule
      }
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