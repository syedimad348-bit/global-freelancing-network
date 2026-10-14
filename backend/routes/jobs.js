const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Job = require('../models/Job');
const { getSyncState } = require('../services/jobSyncState');
const { getLiveJobCache } = require('../services/liveJobCache');
const { protect } = require('../middleware/authMiddleware');
const { isMongoObjectId } = require('../utils/mongoId');

// GET available filter options
router.get('/filters', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const live = getLiveJobCache();
      const sources = [...new Set((live.jobs || []).map((j) => j.source).filter(Boolean))].sort();
      const types = [...new Set((live.jobs || []).map((j) => j.type).filter(Boolean))];
      const remoteTypes = [...new Set((live.jobs || []).map((j) => j.remoteType).filter(Boolean))];
      const countries = [...new Set((live.jobs || []).map((j) => j.country).filter(Boolean))];
      return res.json({ sources, types, remoteTypes, countries, cached: true });
    }
    const [sources, types, folders, remoteTypes, countries] = await Promise.all([
      Job.distinct('source'),
      Job.distinct('type'),
      Job.distinct('folder'),
      Job.distinct('remoteType'),
      Job.distinct('country'),
    ]);
    res.json({
      sources: [...new Set(sources)].filter(Boolean).sort(),
      types: [...new Set(types)].filter(Boolean),
      folders: [...new Set(folders)].filter(Boolean).sort(),
      remoteTypes: [...new Set(remoteTypes)].filter(Boolean),
      countries: [...new Set(countries)].filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET distinct job folders (category buckets) for filters
router.get('/folders', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const folders = await Job.distinct('folder');
      return res.json({ folders: [...new Set(folders)].filter(Boolean).sort((a, b) => a.localeCompare(b)) });
    }
    const live = getLiveJobCache();
    const set = new Set((live.jobs || []).map((j) => j.folder).filter(Boolean));
    return res.json({ folders: [...set].sort((a, b) => a.localeCompare(b)), cached: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET job statistics
router.get('/stats', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const total = await Job.countDocuments();
      const sources = await Job.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      return res.json({ total, sources, cached: false });
    }
    const live = getLiveJobCache();
    const sources = {};
    (live.jobs || []).forEach((j) => {
      const src = j.source || 'Unknown';
      sources[src] = (sources[src] || 0) + 1;
    });
    return res.json({
      total: live.jobs?.length || 0,
      sources: Object.entries(sources).map(([name, count]) => ({ _id: name, count })),
      cached: true,
      updatedAt: live.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET enhanced filters with counts
router.get('/filters/enhanced', async (req, res) => {
  try {
    let sources = [];
    let types = [];
    let folders = [];
    let remoteTypes = [];
    let countries = [];
    
    if (mongoose.connection.readyState === 1) {
      // Get counts from MongoDB
      const [sourceCounts, typeCounts, folderCounts, remoteTypeCounts, countryCounts] = await Promise.all([
        Job.aggregate([
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Job.aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Job.aggregate([
          { $group: { _id: "$folder", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Job.aggregate([
          { $group: { _id: "$remoteType", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Job.aggregate([
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);
      
      sources = sourceCounts.map(item => ({ 
        name: item._id || 'Unknown', 
        count: item.count 
      })).filter(item => item.name);
      
      types = typeCounts.map(item => ({ 
        name: item._id || 'Unknown', 
        count: item.count 
      })).filter(item => item.name);
      
      folders = folderCounts.map(item => ({ 
        name: item._id || 'Unknown', 
        count: item.count 
      })).filter(item => item.name);
      
      remoteTypes = remoteTypeCounts.map(item => ({ 
        name: item._id || 'Unknown', 
        count: item.count 
      })).filter(item => item.name);
      
      countries = countryCounts.map(item => ({ 
        name: item._id || 'Unknown', 
        count: item.count 
      })).filter(item => item.name);
    } else {
      // Fallback to live cache
      const live = getLiveJobCache();
      const sourceCounts = {};
      const typeCounts = {};
      const folderCounts = {};
      const remoteTypeCounts = {};
      const countryCounts = {};
      
      (live.jobs || []).forEach((job) => {
        const src = job.source || 'Unknown';
        const typ = job.type || 'Unknown';
        const fol = job.folder || 'Unknown';
        const rem = job.remoteType || 'Unknown';
        const cnt = job.country || 'Unknown';
        
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        typeCounts[typ] = (typeCounts[typ] || 0) + 1;
        folderCounts[fol] = (folderCounts[fol] || 0) + 1;
        remoteTypeCounts[rem] = (remoteTypeCounts[rem] || 0) + 1;
        countryCounts[cnt] = (countryCounts[cnt] || 0) + 1;
      });
      
      sources = Object.entries(sourceCounts).map(([name, count]) => ({ name, count })).filter(item => item.name);
      types = Object.entries(typeCounts).map(([name, count]) => ({ name, count })).filter(item => item.name);
      folders = Object.entries(folderCounts).map(([name, count]) => ({ name, count })).filter(item => item.name);
      remoteTypes = Object.entries(remoteTypeCounts).map(([name, count]) => ({ name, count })).filter(item => item.name);
      countries = Object.entries(countryCounts).map(([name, count]) => ({ name, count })).filter(item => item.name);
    }
    
    res.json({
      sources: sources.map(item => item.name),
      types: types.map(item => item.name),
      folders: folders.map(item => item.name),
      remoteTypes: remoteTypes.map(item => item.name),
      countries: countries.map(item => item.name),
      sourceCounts: sources,
      typeCounts: types,
      folderCounts: folders,
      remoteTypeCounts: remoteTypes,
      countryCounts: countries,
      cached: mongoose.connection.readyState !== 1
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error getting enhanced filters' });
  }
});

// GET live cache status for dashboard
router.get('/live-cache-status', (req, res) => {
  const live = getLiveJobCache();
  const sourceMap = {};
  (live.jobs || []).forEach((j) => {
    const src = j.source || 'Unknown';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  res.json({
    total: live.jobs?.length || 0,
    sources: Object.entries(sourceMap).map(([name, count]) => ({ _id: name, count })),
    updatedAt: live.updatedAt,
    warning: live.warning || null,
  });
});

// GET all jobs with pagination, search and filter
router.get('/', async (req, res) => {
  try {
    const page      = parseInt(req.query.page)    || 1;
    const limit     = parseInt(req.query.limit)   || 50;
    const search    = req.query.search  || '';
    const source    = req.query.source  || '';
    const folder    = req.query.folder || '';
    const remote    = req.query.remote || '';
    const country   = req.query.country || '';
    const type      = req.query.type || '';
    const sortBy    = req.query.sort || 'newest';
    const skip      = (page - 1) * limit;

    // Default: show all jobs but prioritize recently fetched
    const maxAgeHours = 168; // 7 days - keep all valid jobs in the system
    const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;

    const query = {};

    const cursor    = req.query.cursor  || '';  // Keyset pagination cursor (fetchedAt timestamp)

    if (search) {
      query.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    if (source && source !== 'all') {
      query.source = { $regex: source, $options: 'i' };
    }
    if (folder && folder !== 'all') {
      query.folder = folder;
    }
    if (remote && remote !== 'any') {
      query.remoteType = remote;
    }
    if (country && country !== 'all') {
      query.country = new RegExp(country, 'i');
    }
    if (type && type !== 'all') {
      query.type = new RegExp(type, 'i');
    }

    // Only exclude onsite when no specific remote filter is set
    if (!remote || remote === 'any') {
      query.remoteType = { $ne: 'onsite' };
    }

    // No fetchedAt filter - show all valid jobs.
    // Freshness is conveyed via sort order and freshness labels.

    let jobs = [];
    let total = 0;
    let nextCursor = null;

    if (mongoose.connection.readyState === 1) {
      total = await Job.countDocuments(query);

      // Keyset pagination using fetchedAt as cursor:
      // - Without cursor: fetch first page (newest jobs)
      // - With cursor: fetch jobs with fetchedAt newer than cursor (avoids offset shifting)
      // This keeps similar-age jobs grouped together (no age mixing on a page)
      let findQuery = { ...query };

      if (cursor) {
        findQuery.fetchedAt = { $gt: new Date(cursor) };
      }

      jobs = await Job.find(findQuery)
        .sort({ fetchedAt: -1, postedAt: -1, createdAt: -1, _id: -1 })
        .limit(limit + 1);

      if (jobs.length > limit) {
        jobs = jobs.slice(0, limit);
        nextCursor = jobs[jobs.length - 1].fetchedAt
          ? jobs[jobs.length - 1].fetchedAt.toISOString()
          : null;
      }
    } else {
      // Fallback to live cache
      const live = getLiveJobCache();
      let filtered = live.jobs || [];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((job) => `${job.title} ${job.company}`.toLowerCase().includes(s));
      }
      if (source && source !== 'all') {
        filtered = filtered.filter((job) => String(job.source || '').toLowerCase().includes(source.toLowerCase()));
      }
      if (folder && folder !== 'all') {
        filtered = filtered.filter((job) => job.folder === folder);
      }
      if (remote && remote !== 'any') {
        filtered = filtered.filter((job) => job.remoteType === remote);
      }
      if (country && country !== 'all') {
        filtered = filtered.filter((job) => {
          const loc = (job.location || '').toLowerCase();
          const cnt = (job.country || '').toLowerCase();
          return loc.includes(country.toLowerCase()) || cnt.includes(country.toLowerCase());
        });
      }
      if (type && type !== 'all') {
        filtered = filtered.filter((job) => (job.type || '').toLowerCase().includes(type.toLowerCase()));
      }

      if (remote && remote !== 'any') {
        filtered = filtered.filter((job) => job.remoteType !== 'onsite');
      }

      // Sort: newest first by fetchedAt, then postedAt, then _id for stability
      filtered.sort((a, b) => {
        const ta = a.fetchedAt ? new Date(a.fetchedAt).getTime() : 0;
        const tb = b.fetchedAt ? new Date(b.fetchedAt).getTime() : 0;
        if (ta !== tb) return tb - ta;
        const pa = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const pb = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        if (pa !== pb) return pb - pa;
        return String(b._id).localeCompare(String(a._id));
      });

      // Keyset-style slicing: skip jobs at or before cursor
      let startIdx = 0;
      if (cursor) {
        const cursorDate = new Date(cursor);
        startIdx = filtered.findIndex((j) => {
          const jDate = j.fetchedAt ? new Date(j.fetchedAt) : null;
          return jDate && jDate <= cursorDate;
        });
        if (startIdx < 0) startIdx = filtered.length;
      }

      jobs = filtered.slice(startIdx, startIdx + limit);
      total = filtered.length;
    }

    // Add freshness label
    const now = Date.now();
    const labeledJobs = jobs.map((j) => {
      const fetchTime = j.fetchedAt ? new Date(j.fetchedAt).getTime() : 0;
      const ageHours = Math.max(0, (now - fetchTime) / (1000 * 60 * 60));
      let freshness = 'Older';
      if (ageHours < 1) freshness = 'New';
      else if (ageHours < 24) freshness = `${Math.round(ageHours)}h old`;
      else freshness = `${Math.ceil(ageHours / 24)}d old`;
      return { ...j.toObject ? j.toObject() : j, freshness };
    });

    // Determine next cursor for keyset pagination
    if (jobs.length > 0) {
      const lastJob = jobs[jobs.length - 1];
      nextCursor = lastJob.fetchedAt ? lastJob.fetchedAt.toISOString() : null;
    }

    res.json({
      page,
      pages: Math.ceil(total / limit),
      total,
      jobs: labeledJobs,
      nextCursor,
      cursorBased: true,  // Indicates keyset pagination is in use
      maxAgeHours,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single job by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!isMongoObjectId(id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    if (mongoose.connection.readyState === 1) {
      const job = await Job.findById(id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      return res.json(job);
    }

    // Fallback to live cache
    const live = getLiveJobCache();
    const job = (live.jobs || []).find((j) => (j.url || j._id) === id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET source health status
router.get('/sources/status', (req, res) => {
  try {
    const live = getLiveJobCache();
    const sync = getSyncState();
    const health = {};
    
    const sources = [
      "Remotive", "RemoteOK", "WeWorkRemotely", "Arbeitnow", "Jobicy", 
      "Remote.co", "Skip The Drive", "Working Nomads", "Jobspresso", "Wellfound", 
      "JSearch", "Himalayas", "AI Dev Jobs", "Artificial Intelligence Jobs", 
      "USAJOBS", "Careerjet", "Jooble", "Findwork"
    ];
    
    sources.forEach(name => {
      const jobsFromSource = (live.jobs || []).filter(j => j.source === name);
      const lastAttempt = jobsFromSource.length > 0 ? jobsFromSource[jobsFromSource.length - 1].fetchedAt : 0;
      const consecutiveFailures = 0;
      
      let status = 'Healthy';
      if (!jobsFromSource.length) {
        status = name.includes('USAJOBS') || name.includes('Careerjet') || name.includes('Jooble') || name.includes('Findwork') ? 'Authentication Required' : 'Degraded';
      }
      
      health[name] = {
        status,
        lastAttempt,
        jobsContributed: jobsFromSource.length,
        circuitState: 'Closed',
        consecutiveFailures,
        lastError: null
      };
    });
    
    res.json({ 
      sources: health,
      ...sync,
      warning: live.warning || null,
      updatedAt: live.updatedAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error getting source health' });
  }
});

// GET sync state
router.get('/sync-state', (req, res) => {
  res.json(getSyncState());
});

// POST save job to user profile
router.post('/save-job', protect, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId required' });

    if (mongoose.connection.readyState === 1 && isMongoObjectId(req.user.id)) {
      const user = await User.findById(req.user.id);
      if (!user.savedJobs.includes(jobId)) {
        user.savedJobs.push(jobId);
        await user.save();
      }
      return res.json({ saved: true });
    }
    res.json({ saved: true, degradedMode: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
