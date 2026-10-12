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
app.get('/api/health', (_req, res) => {
  const live = require('./services/liveJobCache').getLiveJobCache();
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'offline-cache-mode',
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

if (process.env.MONGO_URL || process.env.MONGO_URI) {
  const safeURI = encodeMongoURI(process.env.MONGO_URL || process.env.MONGO_URI);
  mongoose.connect(safeURI)
    .then(async () => {
      console.log('✅ MongoDB connected');
      await fetchAllJobs();
    })
    .catch((err) => console.log('⚠️  MongoDB unavailable — running on live cache only:', err.message));
} else {
  console.log('⚠️  No MONGO_URI — running on live cache only');
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
