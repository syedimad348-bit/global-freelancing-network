#!/usr/bin/env node
/**
 * Migration script to copy jobs from test database to freelance_network database
 * and deduplicate by URL
 */

const mongoose = require('mongoose');

async function migrateJobs() {
  let testConn = null;
  let fnConn = null;
  
  try {
    console.log('Starting migration from test to freelance_network...');
    
    // Connect to source database (test)
    testConn = await mongoose.createConnection(
      'mongodb+srv://syedimad348_db_user:imad2005@cluster0.kutnn5h.mongodb.net/test'
    );
    console.log('✅ Connected to test database');
    
    // Connect to destination database (freelance_network)
    fnConn = await mongoose.createConnection(
      'mongodb+srv://syedimad348_db_user:imad2005@cluster0.kutnn5h.mongodb.net/freelance_network'
    );
    console.log('✅ Connected to freelance_network database');
    
    const testJobs = testConn.collection('jobs');
    const fnJobs = fnConn.collection('jobs');
    
    // Get all URLs from freelance_network to avoid duplicates
    const fnUrls = await fnJobs.distinct('url');
    const fnUrlSet = new Set(fnUrls.filter(url => url));
    console.log(`Found ${fnUrlSet.size} existing jobs in freelance_network`);
    
    // Get all jobs from test
    const testJobDocs = await testJobs.find({}).toArray();
    console.log(`Found ${testJobDocs.length} jobs in test database`);
    
    // Filter out jobs that already exist in freelance_network
    const newJobs = testJobDocs.filter(job => {
      const url = job.url;
      return url && !fnUrlSet.has(url);
    });
    
    console.log(`Found ${newJobs.length} new jobs to migrate`);
    
    if (newJobs.length === 0) {
      console.log('No new jobs to migrate.');
      return;
    }
    
    // Insert new jobs
    const result = await fnJobs.insertMany(newJobs, { ordered: false });
    const insertedCount = result.insertedIds ? Object.keys(result.insertedIds).length : 0;
    console.log(`✅ Successfully migrated ${insertedCount} jobs to freelance_network`);
    
    // Show final counts
    const finalFnCount = await fnJobs.countDocuments({});
    console.log(`Final count - freelance_network: ${finalFnCount}`);
    
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    // Close connections
    if (testConn) await testConn.close();
    if (fnConn) await fnConn.close();
    console.log('Database connections closed.');
  }
}

migrateJobs();