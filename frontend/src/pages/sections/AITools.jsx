import React, { useMemo, useState } from 'react';
import { TOOLS, TOOL_CATEGORIES } from '../../lib/aiTools';
import { canUse } from '../../lib/tiers';

const PAGE_SIZE = 24;
const REELS = [
  { id: 'r1', title: '3 ChatGPT prompts that cut my resume-writing time by 70%', author: 'Aisha Khan', likes: 2410, plays: 18200, tag: 'Resume',    cover: 'from-emerald-500 to-emerald-400' },
  { id: 'r2', title: 'I ranked the top 5 free AI image tools — winner surprised me', author: 'Sara Iqbal', likes: 1890, plays: 14400, tag: 'Design',  cover: 'from-emerald-500 to-emerald-300' },
  { id: 'r3', title: 'Notion AI vs Mem AI: which one I actually kept', author: 'Mehak Raza', likes: 1620, plays: 12100, tag: 'Productivity', cover: 'from-emerald-500 to-cyan-500' },
  { id: 'r4', title: 'How I built a job-tracker in 9 minutes with v0.dev', author: 'Hamza Ali', likes: 3110, plays: 22800, tag: 'No-code',     cover: 'from-amber-500 to-orange-500' },
  { id: 'r5', title: 'Cold-email script + ChatGPT = 12 interviews in a week', author: 'Layla Raza', likes: 2780, plays: 19600, tag: 'Career',  cover: 'from-emerald-500 to-emerald-300' },
  { id: 'r6', title: 'My favorite under-rated AI tool of the month', author: 'Global Freelancing Network', likes: 1990, plays: 15300, tag: 'Picks',           cover: 'from-sky-500 to-indigo-500' },
];

export default function AITools({ user }) {
  const [cat, setCat] = useState('All');
  const [q, setQ]     = useState('');
  const [sort, setSort] = useState('rank');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('directory'); // directory | reels
  const reelsAllowed = canUse('reels', user);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = TOOLS.filter((t) =>
      (cat === 'All' || t.category === cat) &&
      (s === '' || `${t.name} ${t.desc} ${t.category}`.toLowerCase().includes(s))
    );
    if (sort === 'rank')   list = [...list].sort((a, b) => a.rank - b.rank);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'name')   list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [cat, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const view = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [cat, q, sort]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setTab('directory')} className={['px-4 py-2 rounded-xl text-sm font-bold border', tab === 'directory' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40' : 'border-line text-ink-muted hover:text-ink'].join(' ')}>Directory</button>
        <button onClick={() => setTab('reels')}    className={['px-4 py-2 rounded-xl text-sm font-bold border inline-flex items-center gap-1.5', tab === 'reels' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40' : 'border-line text-ink-muted hover:text-ink'].join(' ')}>
          🎬 Reels
          {!reelsAllowed && <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 rounded">PRO</span>}
        </button>
      </div>

      {tab === 'reels' ? (
        reelsAllowed ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {REELS.map((r) => (
              <div key={r.id} className={['rounded-2xl bg-gradient-to-br p-5 text-white aspect-[9/14] relative flex flex-col justify-between overflow-hidden', r.cover].join(' ')}>
                <div aria-hidden className="absolute inset-0 bg-black/20" />
                <div className="relative flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur">{r.tag}</span>
                  <span>▶ {r.plays.toLocaleString()}</span>
                </div>
                <div className="relative">
                  <p className="text-base font-black leading-tight">{r.title}</p>
                  <p className="mt-1 text-xs opacity-90">@{r.author} · ❤ {r.likes.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <span className="text-5xl">🎬</span>
            <h2 className="mt-3 text-xl font-black text-ink">Reels are a Pro feature</h2>
            <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">Short, fast videos from creators showing exactly how to use top AI tools. Upgrade to Pro to unlock the full Reels feed.</p>
          </div>
        )
      ) : (
      <>
      <div className="card relative overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Curated · {TOOLS.length} AI tools</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Updated daily
              </span>
            </div>
            <h2 className="text-2xl font-black text-ink mt-1">The AI tool directory that actually pays off.</h2>
            <p className="text-sm text-ink-muted mt-1 max-w-xl">{TOOLS.length} hand-picked tools across {TOOL_CATEGORIES.length - 1} categories. Fresh picks every 24 hours. Filter by what you do.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 200+ tools…"
              className="input h-11 w-56"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input h-11 w-44">
              <option value="rank">Sort: Editor rank</option>
              <option value="rating">Sort: Rating</option>
              <option value="name">Sort: A → Z</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 max-h-24 overflow-auto scrollbar-thin">
          {TOOL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap',
                cat === c ? 'bg-surface text-ink border-white' : 'bg-surface/[0.04] text-ink-muted border-line hover:text-ink hover:border-line-strong',
              ].join(' ')}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-ink-subtle">
          Showing <span className="font-bold text-ink">{filtered.length}</span> of {TOOLS.length} · Page {page} of {totalPages}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {view.map((t) => (
          <a
            key={t.name + t.site}
            href={t.site}
            target="_blank"
            rel="noopener noreferrer"
            className="card hover:shadow-cardHover hover:border-line-strong transition-all block"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/30 grid place-items-center font-black text-white shrink-0">{t.name[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-ink truncate">{t.name}</h3>
                  {t.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30 uppercase tracking-wider">{t.badge}</span>}
                </div>
                <p className="text-xs text-ink-subtle">#{t.rank} · {t.category} · {t.pricing}</p>
              </div>
              <div className="text-xs font-bold text-amber-300 inline-flex items-center gap-0.5 shrink-0">
                ★ {t.rating}
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-muted">{t.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-subtle truncate">{t.site.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              <span className="text-xs font-bold text-brand-300">Visit ↗</span>
            </div>
          </a>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 rounded-lg border border-line bg-surface/5 text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-40">← Prev</button>
          <span className="text-sm text-ink-muted px-3">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 rounded-lg border border-line bg-surface/5 text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-40">Next →</button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
