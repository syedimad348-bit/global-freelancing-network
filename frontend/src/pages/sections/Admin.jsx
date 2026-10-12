import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAdminMetrics, blockUserLocal, unblockUserLocal } from '../../lib/admin';
import { isOwner, OWNER_EMAIL } from '../../lib/tiers';

export default function Admin({ user }) {
  const [m, setM] = useState(null);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (!isOwner(user)) return;
    getAdminMetrics().then(setM);
  }, [user]);

  if (!isOwner(user)) {
    return (
      <div className="card max-w-xl mx-auto text-center py-12">
        <span className="text-4xl">🔒</span>
        <h2 className="mt-3 text-xl font-black text-ink">Owner only</h2>
        <p className="mt-2 text-sm text-ink-muted">
          This control panel is restricted to the platform owner ({OWNER_EMAIL}).
        </p>
      </div>
    );
  }
  if (!m) return <div className="card py-16 text-center text-ink-muted">Loading admin metrics…</div>;

  return (
    <div className="space-y-6">
      <div className="card relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-3 py-1 text-xs font-bold uppercase tracking-wider">
            🛡 Owner Console
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-ink">Welcome back, owner.</h1>
          <p className="mt-2 text-sm text-ink-muted">Live metrics, payments, trending sections, and user controls.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total users"        value={m.totalUsers}         delta={`${m.activeUsers24h} active 24h`} tone="brand" />
        <Kpi label="Pro / Premium"      value={m.proUsers}           delta={`${Math.round((m.proUsers / Math.max(1, m.totalUsers)) * 100)}% conversion`} tone="violet" />
        <Kpi label="Total applies"      value={m.totalApplies.toLocaleString()} delta="lifetime" tone="emerald" />
        <Kpi label="Revenue (lifetime)" value={`$${m.totalRevenue}`} delta={`+$${m.last24Revenue} in 24h`} tone="amber" />
      </div>

      {/* Trending */}
      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">What's trending</p>
        <h3 className="text-lg font-black text-ink">Most-used sections (last 30 days)</h3>
        <div className="mt-5 space-y-3">
          {m.trending.map((t, i) => {
            const max = Math.max(...m.trending.map((x) => x.count));
            const pct = Math.round((t.count / max) * 100);
            return (
              <div key={t.section}>
                <div className="flex justify-between text-xs font-semibold text-ink mb-1">
                  <span>#{i + 1} {t.section}</span>
                  <span className="text-ink-muted">{t.count.toLocaleString()} events</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-brand-gradient" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Tab active={tab === 'users'} onClick={() => setTab('users')}>Users ({m.totalUsers})</Tab>
        <Tab active={tab === 'payments'} onClick={() => setTab('payments')}>Payments ({m.payments.length})</Tab>
      </div>

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold border-b border-line">
                <th className="text-left py-2 px-2">User</th>
                <th className="text-left py-2 px-2">Plan</th>
                <th className="text-left py-2 px-2">Country</th>
                <th className="text-left py-2 px-2">Applies</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {m.users.map((u) => (
                <UserRow key={u.id} u={u} onChange={(updated) => setM({ ...m, users: m.users.map((x) => x.id === u.id ? { ...x, ...updated } : x) })} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payments' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold border-b border-line">
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">User</th>
                <th className="text-left py-2 px-2">Plan</th>
                <th className="text-left py-2 px-2">Method</th>
                <th className="text-right py-2 px-2">Amount</th>
                <th className="text-right py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {m.payments.map((p) => {
                const u = m.users.find((x) => x.id === p.userId);
                return (
                  <tr key={p.id} className="border-b border-line/60 last:border-0">
                    <td className="py-2 px-2 text-ink-muted">{new Date(p.ts).toLocaleDateString()}</td>
                    <td className="py-2 px-2 text-ink font-semibold">{u?.name || p.userId}</td>
                    <td className="py-2 px-2"><Badge tone={p.plan === 'premium' ? 'violet' : 'brand'}>{p.plan}</Badge></td>
                    <td className="py-2 px-2 text-ink">{p.method}</td>
                    <td className="py-2 px-2 text-right font-bold text-ink">${p.amount}</td>
                    <td className="py-2 px-2 text-right"><Badge tone="emerald">{p.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({ u, onChange }) {
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    if (u.status === 'blocked') await unblockUserLocal(u.id);
    else await blockUserLocal(u.id);
    onChange({ status: u.status === 'blocked' ? 'active' : 'blocked' });
    setBusy(false);
  };
  return (
    <tr className="border-b border-line/60 last:border-0 hover:bg-white/[0.02]">
      <td className="py-2 px-2">
        <p className="text-ink font-semibold">{u.name}</p>
        <p className="text-[11px] text-ink-subtle">{u.email}</p>
      </td>
      <td className="py-2 px-2"><Badge tone={u.plan === 'premium' ? 'violet' : u.plan === 'pro' ? 'brand' : 'slate'}>{u.plan}</Badge></td>
      <td className="py-2 px-2 text-ink-muted">{u.country}</td>
      <td className="py-2 px-2 text-ink font-bold">{u.applies}</td>
      <td className="py-2 px-2"><Badge tone={u.status === 'blocked' ? 'rose' : 'emerald'}>{u.status}</Badge></td>
      <td className="py-2 px-2 text-right">
        <button onClick={toggle} disabled={busy} className={['text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors', u.status === 'blocked' ? 'border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/15' : 'border-rose-400/40 text-rose-300 hover:bg-rose-500/15'].join(' ')}>
          {busy ? '…' : u.status === 'blocked' ? 'Unblock' : 'Block'}
        </button>
      </td>
    </tr>
  );
}

function Kpi({ label, value, delta, tone }) {
  const dot = { brand:'bg-brand-500', violet:'bg-violet-500', emerald:'bg-emerald-500', amber:'bg-amber-500' }[tone] || 'bg-brand-500';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wider font-semibold text-ink-subtle">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-muted">
        <span className={['w-1.5 h-1.5 rounded-full', dot].join(' ')} /> {delta}
      </p>
    </div>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={['px-4 py-2 rounded-xl text-sm font-bold border transition-colors', active ? 'bg-brand-500/15 text-brand-300 border-brand-400/40' : 'border-line text-ink-muted hover:text-ink'].join(' ')}>
      {children}
    </button>
  );
}

function Badge({ tone, children }) {
  const cls = {
    brand:   'bg-brand-500/15 text-brand-300 border-brand-400/30',
    violet:  'bg-violet-500/15 text-violet-300 border-violet-400/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    amber:   'bg-amber-500/15 text-amber-300 border-amber-400/30',
    rose:    'bg-rose-500/15 text-rose-300 border-rose-400/30',
    slate:   'bg-white/[0.07] text-ink-soft border-line',
  }[tone] || 'bg-white/[0.07] text-ink-soft border-line';
  return <span className={['inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border', cls].join(' ')}>{children}</span>;
}
