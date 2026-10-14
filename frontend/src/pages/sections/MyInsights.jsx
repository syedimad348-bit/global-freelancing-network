import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getInsights, loadUsage } from '../../lib/usage';
import { Briefcase, BarChart3, FileText, Mic } from 'lucide-react';

export default function MyInsights({ user }) {
  const [insights, setInsights] = useState(getInsights());
  const [usage, setUsage] = useState(loadUsage());

  useEffect(() => {
    const r = () => { setInsights(getInsights()); setUsage(loadUsage()); };
    window.addEventListener('usage-changed', r);
    return () => window.removeEventListener('usage-changed', r);
  }, []);

  const empty = insights.totalApplies === 0 && insights.interviewsCount === 0 && insights.resumeAnalysesCount === 0;
  const p = usage.profile;

  if (empty) {
    return (
      <div className="card text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 grid place-items-center text-2xl"><BarChart3 className="w-8 h-8 text-emerald-600" /></div>
        <h2 className="mt-4 text-2xl font-black text-ink">Your insights start at zero — and grow with you.</h2>
        <p className="mt-2 text-sm text-ink-muted max-w-lg mx-auto">
          Apply to a job, run a resume analysis, or finish an interview round — every action you take fills these charts in real time.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          <Hint icon={Briefcase} label="Apply to your first job" sub="Find Jobs →" />
          <Hint icon={FileText} label="Score your resume"     sub="AI Resume →" />
          <Hint icon={Mic} label="Run a mock interview"      sub="Interview Coach →" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile + headline KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card lg:col-span-1 flex items-center gap-4">
          {p.dpUrl ? (
            <img src={p.dpUrl} alt="dp" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-gradient text-white text-2xl font-black grid place-items-center">{(p.name || user?.name || 'U')[0]}</div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-black text-ink truncate">{p.name || user?.name || 'You'}</p>
            <p className="text-xs text-ink-muted truncate">{p.headline || 'Add your headline →'}</p>
            <p className="text-[10px] text-ink-subtle mt-0.5">{p.location || '—'}</p>
          </div>
        </div>
        <BigCard tone="cyan" label="Total Applies" value={insights.totalApplies.toLocaleString()} sub={`${insights.last7Count} in last 7 days`} />
        <BigCard tone="violet" label="Mock Interviews" value={insights.interviewsCount} sub={insights.avgInterview ? `Avg ${insights.avgInterview}/100` : 'No score yet'} />
        <BigCard tone="amber" label="Resume Score" value={insights.bestResume || '—'} sub={insights.resumeAnalysesCount ? `${insights.resumeAnalysesCount} analyses` : 'Run your first'} />
      </div>

      {/* Big area chart + gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 relative overflow-hidden">
          <div aria-hidden className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-neon-cyan/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Activity overview</p>
                <h3 className="text-lg font-black text-ink">Applies over the past 7 days</h3>
              </div>
              <span className="stat-pill bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">Live</span>
            </div>
            <AreaChart data={insights.week} />
          </div>
        </div>

        <div className="card relative overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Effort score</p>
          <h3 className="text-lg font-black text-ink mb-4">Your career engine</h3>
          <Gauge value={Math.min(100, insights.totalApplies * 2 + insights.interviewsCount * 5 + insights.resumeAnalysesCount * 4)} />
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Mini label="Avg salary" value={insights.avgSalary ? `$${Math.round(insights.avgSalary / 1000)}k` : '—'} />
            <Mini label="Followers" value={insights.followers} />
          </div>
        </div>
      </div>

      {/* Bar chart sources + pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Top sources</p>
          <h3 className="text-lg font-black text-ink mb-4">Where your applies go</h3>
          {insights.topSources.length === 0 ? (
            <p className="text-sm text-ink-muted">Apply to a few jobs to see your top sources here.</p>
          ) : (
            <div className="space-y-3">
              {insights.topSources.map((s) => {
                const max = insights.topSources[0].value;
                const pct = (s.value / max) * 100;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-ink">{s.name}</span>
                      <span className="text-ink-muted">{s.value} applies</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full bg-cyan-blue rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Pipeline</p>
          <h3 className="text-lg font-black text-ink mb-4">Application stages</h3>
          {[
            { label: 'Saved',   v: 0, color: 'bg-white/10' },
            { label: 'Applied', v: insights.totalApplies, color: 'bg-brand-500' },
            { label: 'Phone',   v: 0, color: 'bg-emerald-500' },
            { label: 'Onsite',  v: 0, color: 'bg-amber-500' },
            { label: 'Offer',   v: 0, color: 'bg-emerald-500' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 py-2">
              <span className={['w-2 h-8 rounded-full', s.color].join(' ')} />
              <div className="flex-1">
                <p className="text-xs text-ink-muted">{s.label}</p>
                <p className="text-base font-black text-ink">{s.v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent applies */}
      {usage.applies.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-black text-ink mb-3">Recent applies</h3>
          <div className="divide-y divide-line max-h-64 overflow-y-auto scrollbar-thin">
            {usage.applies.slice(0, 12).map((a) => (
              <div key={a.id} className="py-2 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{a.title}</p>
                  <p className="text-xs text-ink-muted truncate">{a.company} · {a.source}</p>
                </div>
                <span className="text-xs text-ink-subtle shrink-0 ml-3">{new Date(a.ts).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BigCard({ tone, label, value, sub }) {
  const styles = {
    cyan:   'from-cyan-500 to-blue-600',
    violet: 'from-emerald-500 to-emerald-300',
    amber:  'from-emerald-500 to-emerald-300',
    pink:   'from-emerald-500 to-emerald-300',
  }[tone] || 'from-emerald-500 to-emerald-300';
  return (
    <div className={['rounded-2xl p-5 text-white relative overflow-hidden bg-gradient-to-br shadow-card', styles].join(' ')}>
      <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-90 relative">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight relative">{value}</p>
      <p className="mt-1 text-xs opacity-90 relative">{sub}</p>
    </div>
  );
}

function AreaChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.applications));
  const w = 100, h = 38, step = w / (data.length - 1 || 1);
  const points = data.map((d, i) => `${i * step},${h - (d.applications / max) * (h - 4) - 2}`).join(' ');
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <div className="mt-5">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-44">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#ag)" />
        <polyline points={points} fill="none" stroke="#22D3EE" strokeWidth="0.7" />
        {data.map((d, i) => (
          <circle key={i} cx={i * step} cy={h - (d.applications / max) * (h - 4) - 2} r="0.9" fill="#A855F7" />
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-7 text-center text-[10px] text-ink-subtle">
        {data.map((d) => <div key={d.day}>{d.day}<div className="font-bold text-ink">{d.applications}</div></div>)}
      </div>
    </div>
  );
}

function Gauge({ value }) {
  const r = 50, c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative w-full grid place-items-center py-2">
      <svg viewBox="-60 -60 120 120" className="w-44 h-44 -rotate-90">
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle r={r} fill="none" stroke="url(#gg)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`} />
        <defs>
          <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-3xl font-black text-ink">{value}</p>
          <p className="text-[10px] uppercase tracking-wider text-ink-subtle font-bold">/ 100</p>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold">{label}</p>
      <p className="text-sm font-bold text-ink">{value}</p>
    </div>
  );
}
function Hint({ icon, label, sub }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.03] px-4 py-3">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-sm font-bold text-ink">{label}</p>
      <p className="text-xs text-neon-cyan mt-0.5">{sub}</p>
    </div>
  );
}
