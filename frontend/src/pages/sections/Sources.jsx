import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle,
  Shield,
  Activity,
  Clock,
  RefreshCw,
  Info,
  Server,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from 'lucide-react';
import { apiFetch, API_BASE_URL } from '../../lib/api';
import Badge from '../../components/ui/Badge';

const STATUS_CONFIG = {
  Healthy: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100', label: 'Healthy', description: 'Source responding normally' },
  Degraded: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-100', label: 'Degraded', description: 'Source responding with errors' },
  Retrying: { icon: Loader2, color: 'text-blue-600 bg-blue-100 animate-spin', label: 'Retrying', description: 'Circuit breaker half-open, testing recovery' },
  'Authentication Required': { icon: Shield, color: 'text-purple-600 bg-purple-100', label: 'Auth Required', description: 'API credentials needed' },
  Disabled: { icon: XCircle, color: 'text-slate-500 bg-slate-100', label: 'Disabled', description: 'Source manually disabled' },
  Unknown: { icon: Minus, color: 'text-slate-500 bg-slate-100', label: 'Unknown', description: 'Status not available' },
};

const SOURCE_INFO = {
  'Remotive': { type: 'API', rateLimit: '100 req/min', endpoint: 'remotive.com/api' },
  'RemoteOK': { type: 'API', rateLimit: '60 req/min', endpoint: 'remoteok.com/api' },
  'WeWorkRemotely': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'weworkremotely.com/*.rss' },
  'Arbeitnow': { type: 'API', rateLimit: '30 req/min', endpoint: 'arbeitnow.com/api' },
  'Jobicy': { type: 'API', rateLimit: '100 req/min', endpoint: 'jobicy.com/api' },
  'Remote.co': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'remote.co/feed/' },
  'Skip The Drive': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'skipthedrive.com/feed.xml' },
  'Working Nomads': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'workingnomads.com/jobs/feed/' },
  'Jobspresso': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'jobspresso.co/feed/' },
  'Wellfound': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'wellfound.com/jobs/feed/rss' },
  'Adzuna': { type: 'API (Paid)', rateLimit: 'Custom', endpoint: 'api.adzuna.com' },
  'JSearch': { type: 'API (RapidAPI)', rateLimit: '185/month', endpoint: 'jsearch.p.rapidapi.com' },
  'Himalayas': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'himalayas.jobs/feed' },
  'AI Dev Jobs': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'ai-devs.com/feed/' },
  'Artificial Intelligence Jobs': { type: 'RSS', rateLimit: '10 req/min', endpoint: 'artificialintelligencejobs.co/feed/' },
  'USAJOBS': { type: 'API (Gov)', rateLimit: 'Custom', endpoint: 'api.usajobs.com', auth: true },
  'Careerjet': { type: 'API', rateLimit: 'Custom', endpoint: 'careerjet.com', auth: true },
  'Jooble': { type: 'API', rateLimit: 'Custom', endpoint: 'api.jooble.org', auth: true },
  'Findwork': { type: 'API', rateLimit: 'Custom', endpoint: 'api.findwork.io', auth: true },
};

export default function Sources() {
  const [sourceHealth, setSourceHealth] = useState({});
  const [syncState, setSyncState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchHealth = async () => {
    try {
      const [healthRes, syncRes] = await Promise.all([
        apiFetch('/jobs/sources/health'),
        apiFetch('/jobs/sync-state'),
      ]);
      setSourceHealth(healthRes.sources || {});
      setSyncState(syncRes);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch source health:', err);
      // Fallback to local cache if backend endpoint not ready
      try {
        const liveCache = await apiFetch('/jobs/live-cache-status');
        if (liveCache.sources) {
          const health = {};
          liveCache.sources.forEach(s => {
            health[s._id] = { status: 'Healthy', jobsContributed: s.count };
          });
          setSourceHealth(health);
        }
      } catch (e) {
        console.error('Fallback also failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const allSources = useMemo(() => {
    const sources = Object.keys(SOURCE_INFO);
    return sources.map(name => {
      const info = SOURCE_INFO[name];
      const health = sourceHealth[name] || { status: 'Unknown', circuitState: 'Unknown', consecutiveFailures: 0, lastAttempt: 0 };
      const config = STATUS_CONFIG[health.status] || STATUS_CONFIG.Unknown;
      return { name, ...info, ...health, config };
    });
  }, [sourceHealth]);

  const stats = useMemo(() => {
    const total = allSources.length;
    const healthy = allSources.filter(s => s.status === 'Healthy').length;
    const degraded = allSources.filter(s => s.status === 'Degraded').length;
    const retrying = allSources.filter(s => s.status === 'Retrying').length;
    const authRequired = allSources.filter(s => s.status === 'Authentication Required').length;
    const disabled = allSources.filter(s => s.status === 'Disabled').length;
    const totalJobs = allSources.reduce((sum, s) => sum + (s.jobsContributed || 0), 0);
    return { total, healthy, degraded, retrying, authRequired, disabled, totalJobs };
  }, [allSources]);

  const handleManualSync = async () => {
    try {
      await apiFetch('/jobs/sync', { method: 'POST' });
      await fetchHealth();
    } catch (err) {
      console.error('Manual sync failed:', err);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (ts) => {
    if (!ts) return 'Never';
    const date = new Date(ts);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight">Job Sources</h1>
          <p className="text-sm text-ink-muted mt-1">
            Monitor health, sync status, and performance of all {stats.total} job aggregation sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="emerald" icon={Activity} className="flex items-center gap-1.5">
            {stats.healthy} Healthy
          </Badge>
          {stats.degraded > 0 && <Badge tone="amber" icon={AlertTriangle} className="flex items-center gap-1.5">{stats.degraded} Degraded</Badge>}
          {stats.retrying > 0 && <Badge tone="blue" icon={Loader2} className="flex items-center gap-1.5">{stats.retrying} Retrying</Badge>}
          {stats.authRequired > 0 && <Badge tone="purple" icon={Shield} className="flex items-center gap-1.5">{stats.authRequired} Auth Required</Badge>}
          <button
            onClick={handleManualSync}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Now
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <SummaryCard label="Total Sources" value={stats.total} icon={Globe} tone="slate" />
        <SummaryCard label="Healthy" value={stats.healthy} icon={CheckCircle2} tone="emerald" />
        <SummaryCard label="Degraded" value={stats.degraded} icon={AlertTriangle} tone="amber" />
        <SummaryCard label="Retrying" value={stats.retrying} icon={Loader2} tone="blue" />
        <SummaryCard label="Auth Required" value={stats.authRequired} icon={Shield} tone="purple" />
        <SummaryCard label="Disabled" value={stats.disabled} icon={XCircle} tone="slate" />
        <SummaryCard label="Jobs in Cache" value={stats.totalJobs} icon={Server} tone="cyan" />
      </div>

      {/* Last Sync Info */}
      {syncState && (
        <div className="card p-4 border-emerald-100">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-3 text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Last Sync: <span className="font-medium text-ink">{formatDateTime(syncState.endedAt || syncState.startedAt)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Duration: <span className="font-medium text-ink">
                  {syncState.endedAt && syncState.startedAt
                    ? `${((new Date(syncState.endedAt) - new Date(syncState.startedAt)) / 1000).toFixed(1)}s`
                    : 'In progress...'}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                Inserted: <span className="font-medium text-ink">{syncState.insertedCount || 0} new jobs</span>
              </span>
            </div>
            {syncState.failedSources?.length > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Failed: {syncState.failedSources.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-subtle border-b border-line">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Source</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Circuit</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Failures</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Jobs</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Last Attempt</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Rate Limit</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-muted uppercase tracking-wider text-[11px]">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              <AnimatePresence mode="popLayout">
                {allSources.map((source, idx) => (
                  <motion.tr
                    key={source.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-surface-subtle/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      <div className="flex items-center gap-2">
                        {source.auth && <Shield className="w-4 h-4 text-purple-500" title="Requires authentication" />}
                        {source.type.startsWith('RSS') && <WifiOff className="w-4 h-4 text-slate-400" title="RSS Feed" />}
                        {source.type.startsWith('API') && !source.auth && <Server className="w-4 h-4 text-brand-500" title="API Endpoint" />}
                        {source.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200">
                        {source.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={source.config.color.includes('emerald') ? 'emerald' : source.config.color.includes('amber') ? 'amber' : source.config.color.includes('blue') ? 'blue' : source.config.color.includes('purple') ? 'purple' : 'slate'} icon={source.config.icon}>
                        {source.config.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {source.circuitState || 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {source.consecutiveFailures > 0 ? (
                        <span className="flex items-center gap-1 text-amber-600 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {source.consecutiveFailures}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink">
                      {source.jobsContributed || 0}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {source.lastAttempt ? formatTime(source.lastAttempt) : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-ink-muted font-mono text-[11px]">
                      {source.rateLimit}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://${source.endpoint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-[11px] font-medium truncate max-w-[200px]"
                        title={source.endpoint}
                      >
                        {source.endpoint}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <Info className="w-5 h-5 text-brand-600" />
            Status Definitions
          </h3>
          <div className="space-y-2 text-sm">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2 text-ink-muted">
                <config.icon className={`w-4 h-4 ${config.color}`} />
                <span className="font-medium text-ink">{config.label}</span>
                <span className="text-[12px]">— {config.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Circuit Breaker Logic
          </h3>
          <div className="space-y-2 text-sm text-ink-muted">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span><strong>Closed:</strong> Normal operation, requests pass through</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span><strong>Open:</strong> Too many failures, requests blocked, backoff active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span><strong>Half-Open:</strong> Test request allowed to verify recovery</span>
            </div>
            <div className="text-[12px] text-slate-500 mt-2">
              Backoff: exponential with jitter (1s → 2s → 4s → 8s → 16s → 32s → 60s max)
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>Auto-refreshes every 30s • Last updated: {lastRefresh ? formatTime(lastRefresh) : '—'}</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  const toneColors = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  };

  return (
    <div className={`card p-4 border ${toneColors[tone] || toneColors.slate}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
          <p className="text-2xl font-black mt-1">{value}</p>
        </div>
        <Icon className="w-6 h-6 mt-1 shrink-0 opacity-50" />
      </div>
    </div>
  );
}