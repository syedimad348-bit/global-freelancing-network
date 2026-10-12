// Admin metrics — reads from a seeded dataset and the live local usage tracker.
// In production you'd swap this for a real /api/admin/* call.

import { loadUsage } from './usage';

let DATASET_CACHE = null;
async function getDataset() {
  if (DATASET_CACHE) return DATASET_CACHE;
  try {
    const res = await fetch('/dataset/users_dataset.json');
    DATASET_CACHE = await res.json();
  } catch { DATASET_CACHE = { users: [], payments: [], events: [] }; }
  return DATASET_CACHE;
}

export async function getAdminMetrics() {
  const ds  = await getDataset();
  const me  = loadUsage();
  const now = Date.now();
  const d24 = now - 24 * 3600 * 1000;
  const d7  = now - 7 * 24 * 3600 * 1000;

  const users = ds.users || [];
  const payments = ds.payments || [];
  const events = ds.events || [];

  const activeUsers24h = users.filter((u) => (u.lastActiveAt || 0) >= d24).length;
  const activeUsers7d  = users.filter((u) => (u.lastActiveAt || 0) >= d7).length;
  const totalUsers     = users.length;
  const proUsers       = users.filter((u) => u.plan === 'pro' || u.plan === 'premium').length;
  const blockedUsers   = users.filter((u) => u.status === 'blocked').length;

  const totalApplies = users.reduce((s, u) => s + (u.applies || 0), 0) + me.applies.length;
  const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const last24Revenue = payments.filter((p) => p.ts >= d24).reduce((s, p) => s + (p.amount || 0), 0);

  // Trending sections
  const sectionCounts = {};
  events.forEach((e) => { sectionCounts[e.section] = (sectionCounts[e.section] || 0) + 1; });
  const trending = Object.entries(sectionCounts)
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalUsers, activeUsers24h, activeUsers7d, proUsers, blockedUsers,
    totalApplies, totalRevenue, last24Revenue,
    trending,
    users: users.slice(0, 200),
    payments: payments.slice(0, 100),
  };
}

export async function blockUserLocal(userId) {
  const ds = await getDataset();
  const u = (ds.users || []).find((x) => x.id === userId);
  if (u) u.status = 'blocked';
  return ds;
}
export async function unblockUserLocal(userId) {
  const ds = await getDataset();
  const u = (ds.users || []).find((x) => x.id === userId);
  if (u) u.status = 'active';
  return ds;
}
