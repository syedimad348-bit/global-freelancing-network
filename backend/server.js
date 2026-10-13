const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { fetchAllJobs, expireOldJobs, expireOldSavedJobs } = require('./controllers/fetchJobs');
const { refreshLiveJobCache } = require('./services/liveJobCache');
const { processEmailAlerts } = require('./services/alerts');

dotenv.config();

const app = express();

// Track MongoDB connection promise for health checks
let mongoConnectionPromise = null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
    const isVercel    = /\.vercel\.app$/.test(origin);
    const allowed     = process.env.FRONTEND_URL || '';
    if (isLocalhost || isVercel || (allowed && origin === allowed)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes (registered before DB — serve from cache when DB unavailable) ──────
app.get('/', (_req, res) => res.json({ message: 'JobRadar API is running.' }));
app.get('/api/health', async (_req, res) => {
  if (mongoConnectionPromise && mongoose.connection.readyState === 2) {
    await Promise.race([mongoConnectionPromise, new Promise((resolve) => setTimeout(resolve, 3000))]);
  }
  const live = require('./services/liveJobCache').getLiveJobCache();
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  res.json({
    ok: true,
    database: dbStatus,
    jobs: {
      liveCount: live.jobs?.length || 0,
      updatedAt: live.updatedAt,
      warning: live.warning || null,
      target: Number(process.env.JOB_TARGET_SIZE || 800),
    },
    aiEngine: { configuredUrl: process.env.AI_ENGINE_URL || undefined },
  });
});
app.use('/api/jobs',     require('./routes/jobs'));
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/features', require('./routes/features'));

// ── Serve frontend in production ──────────────────────────────────────────────
const fs = require('fs');
const buildPath = path.resolve(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

// ── Start server immediately ──────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;

// ── Export the Express app for Vercel serverless deployment ───────────────────
// Vercel requires the server module to export a callable handler (module.exports = app).
module.exports = app;
module.exports.app = app;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  // Warm live cache on startup (always works, no DB needed)
  refreshLiveJobCache()
    .then((c) => console.log(`✅ Live cache ready: ${c.jobs.length} jobs`))
    .catch((e) => console.log('Cache warm error:', e.message));
});

// ── Database connection (non-fatal) ───────────────────────────────────────────
function encodeMongoURI(uri) {
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@(.+)$/);
    if (!match) return uri;
    const [, scheme, user, pass, rest] = match;
    return `${scheme}${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${rest}`;
  } catch {
    return uri;
  }
}

if (process.env.MONGO_URL) {
  const safeURI = encodeMongoURI(process.env.MONGO_URL);
  mongoConnectionPromise = mongoose.connect(safeURI)
    .then(async () => {
      console.log('✅ MongoDB connected');
      await fetchAllJobs();
    })
    .catch((err) => {
      console.error('⚠️  MongoDB connection error:', err.message);
      // Don't exit - let routes fall back to live cache
    });
} else if (process.env.MONGO_URI) {
  // Allow MONGO_URI as temporary fallback during migration
  const safeURI = encodeMongoURI(process.env.MONGO_URI);
  mongoConnectionPromise = mongoose.connect(safeURI)
    .then(async () => {
      console.log('✅ MongoDB connected via MONGO_URI (fallback)');
      await fetchAllJobs();
    })
    .catch((err) => {
      console.error('⚠️  MongoDB connection error via MONGO_URI:', err.message);
    });
} else {
  console.warn('⚠️  No MONGO_URL or MONGO_URI — routes will fall back to live cache');
}

// A six-hour refresh keeps the optional JSearch source inside its free-tier
// request budget. The cache is also warmed when the server starts.
cron.schedule('0 */3 * * *', async () => {
  console.log('⏰ Scheduled maintenance: refresh cache, expiry cleanup...');
  await refreshLiveJobCache().catch((e) => console.log('Cache refresh error:', e.message));
  if (mongoose.connection.readyState === 1) {
    await expireOldJobs();
    await expireOldSavedJobs();
    await fetchAllJobs().catch(() => {});
    await processEmailAlerts().catch(() => {});
  }
});

process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
process.on('uncaughtException',  (error)  => console.error('Uncaught exception:',  error));

// Worker mode for VPS - runs fetch jobs cron without HTTP server
if (process.argv.includes('--worker')) {
  console.log('🔧 Starting in worker mode (VPS scheduled job fetcher)...');
  
  // Warm cache on startup
  refreshLiveJobCache()
    .then((c) => console.log(`✅ Live cache ready: ${c.jobs.length} jobs`))
    .catch((e) => console.log('Cache warm error:', e.message));
  
  // Run initial fetch if MongoDB is connected
  if (mongoose.connection.readyState === 1) {
    fetchAllJobs().catch((err) => console.log('Initial fetch error:', err.message));
  }
  
  // Six-hour refresh keeps JSearch inside free-tier request budget
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ [Worker] Six-hour maintenance: refresh cache, expiry cleanup...');
    try {
      await refreshLiveJobCache().catch((e) => console.log('Cache refresh error:', e.message));
      
      if (mongoose.connection.readyState === 1) {
        await expireOldJobs();
        await expireOldSavedJobs();
        await fetchAllJobs().catch((err) => console.log('Fetch jobs error:', err.message));
        await processEmailAlerts().catch((err) => console.log('Process alerts error:', err.message));
      }
    } catch (err) {
      console.error('Worker cron error:', err.message);
    }
  });
  
  console.log('✅ Worker started - will run every 6 hours');
  console.log('   (Use Ctrl+C to stop)');
}
