import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../lib/api';
import { trackApply, appliesToday } from '../../lib/usage';
import { limitFor } from '../../lib/tiers';

const PAGE_SIZE = 24;

const SOURCE_COLOR = {
  LinkedIn:       { bg: 'bg-sky-500/15',     text: 'text-sky-300',     ring: 'ring-sky-400/30'     },
  Indeed:         { bg: 'bg-indigo-500/15',  text: 'text-indigo-300',  ring: 'ring-indigo-400/30'  },
  Upwork:         { bg: 'bg-emerald-500/15', text: 'text-emerald-300', ring: 'ring-emerald-400/30' },
  Remotive:       { bg: 'bg-violet-500/15',  text: 'text-violet-300',  ring: 'ring-violet-400/30'  },
  RemoteOK:       { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', ring: 'ring-fuchsia-400/30' },
  WeWorkRemotely: { bg: 'bg-teal-500/15',    text: 'text-teal-300',    ring: 'ring-teal-400/30'    },
  Arbeitnow:      { bg: 'bg-amber-500/15',   text: 'text-amber-300',   ring: 'ring-amber-400/30'   },
  Jobicy:         { bg: 'bg-lime-500/15',    text: 'text-lime-300',    ring: 'ring-lime-400/30'    },
  TheMuse:        { bg: 'bg-pink-500/15',    text: 'text-pink-300',    ring: 'ring-pink-400/30'    },
  Adzuna:         { bg: 'bg-rose-500/15',    text: 'text-rose-300',    ring: 'ring-rose-400/30'    },
  Freelancer:     { bg: 'bg-cyan-500/15',    text: 'text-cyan-300',    ring: 'ring-cyan-400/30'    },
  Glassdoor:      { bg: 'bg-green-500/15',   text: 'text-green-300',   ring: 'ring-green-400/30'   },
  ZipRecruiter:   { bg: 'bg-orange-500/15',  text: 'text-orange-300',  ring: 'ring-orange-400/30'  },
};

function srcColor(source) {
  return SOURCE_COLOR[source] || { bg: 'bg-slate-500/15', text: 'text-slate-300', ring: 'ring-slate-400/30' };
}

export function formatRelative(iso) {
  if (!iso) return 'recently';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function JobHunter({ user }) {
  const dailyCap = limitFor('appliesPerDay', user);
  const usedToday = appliesToday();
  const remaining = Math.max(0, dailyCap - usedToday);

  const [jobs,       setJobs]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [warning,    setWarning]    = useState(null);
  const [syncState,  setSyncState]  = useState(null);
  const [lastFetch,  setLastFetch]  = useState(null);

  const [search,  setSearch]  = useState('');
  const [source,  setSource]  = useState('All');
  const [folder,  setFolder]  = useState('All');
  const [type,    setType]    = useState('All');
  const [remote,  setRemote]  = useState('any');
  const [country, setCountry] = useState('All');
  const [sort,    setSort]    = useState('newest');
  const [page,    setPage]    = useState(1);
  const [saved,   setSaved]   = useState(() => new Set());
  const [active,  setActive]  = useState(null);

  const [allSources, setAllSources] = useState([]);
  const [allFolders, setAllFolders] = useState([]);

  const searchDebounce = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, source, folder, type, remote, country, sort]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
        maxAgeHours: 0,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (source !== 'All') params.set('source', source);
      if (folder !== 'All') params.set('folder', folder);
      if (type !== 'All') params.set('type', type);
      if (remote !== 'any') params.set('remote', remote);
      if (country !== 'All') params.set('country', country);
      if (sort !== 'newest') params.set('sort', sort);
      const data = await apiFetch(`/api/jobs?${params}`);
      let list = data.jobs || [];

      if (sort === 'newest') {
        list.sort((a, b) => {
          const ta = a.postedAt || a.fetchedAt || 0;
          const tb = b.postedAt || b.fetchedAt || 0;
          return new Date(tb) - new Date(ta);
        });
      } else if (sort === 'company') {
        list.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
      }

      setJobs(list);
      setTotal(data.total || list.length);
      setPages(data.pages || 1);
      setWarning(data.warning || null);
      setSyncState(data.sync || null);
      setLastFetch(new Date());

      const srcSet = [...new Set(list.map((j) => j.source).filter(Boolean))].sort();
      if (srcSet.length > allSources.length) setAllSources(srcSet);

      const folderSet = [...new Set(list.map((j) => j.folder).filter(Boolean))].sort();
      if (folderSet.length > allFolders.length) setAllFolders(folderSet);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, source, folder, type, remote, country, sort]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    apiFetch('/api/jobs/folders').then((d) => {
      if (d.folders?.length) setAllFolders(d.folders);
    }).catch(() => {});
  }, []);

  // Keep the Find Jobs bookmarks in sync with the API, including offline
  // sessions where the backend stores only the saved job IDs in memory.
  useEffect(() => {
    apiFetch('/api/jobs/saved').then((data) => {
      const ids = data.ids || (data.savedJobs || []).map((job) => job._id || job.url);
      setSaved(new Set(ids.filter(Boolean)));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => fetchJobs(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchJobs]);

  const toggleSave = async (id) => {
    const wasSaved = saved.has(id);
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      const result = await apiFetch(`/api/jobs/save/${encodeURIComponent(id)}`, { method: 'POST' });
      setSaved((prev) => {
        const next = new Set(prev);
        result.isSaved ? next.add(id) : next.delete(id);
        return next;
      });
    } catch (err) {
      // Restore the previous state if this was an authenticated API failure.
      setSaved((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(id) : next.delete(id);
        return next;
      });
    }
  };

  const freshCount = useMemo(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    return jobs.filter((j) => {
      const t = j.postedAt || j.fetchedAt;
      return t && new Date(t).getTime() >= cutoff;
    }).length;
  }, [jobs]);

  const sourceCount = useMemo(() => new Set(jobs.map((j) => j.source)).size, [jobs]);

  const TYPE_LIST = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Internship', 'On-site', 'Hybrid'];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-300/30 bg-gradient-to-r from-emerald-50 via-white to-emerald-100 text-ink p-6 sm:p-8 shadow-[0_10px_40px_-15px_rgba(16,185,129,0.3)]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(5,150,105,0.1), transparent 40%)',
          }}
        />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-300/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live feed
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
              {loading ? '…' : total.toLocaleString()} live jobs ready for you.
            </h1>
            <p className="mt-2 text-ink-muted max-w-xl">
              Aggregated from Remotive, RemoteOK, WeWorkRemotely, Arbeitnow, Jobicy, Remote.co, Skip The Drive, Working Nomads, Jobspresso, Wellfound, Adzuna, LinkedIn, Upwork & more — refreshed every 6 hours.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Sources"     value={loading ? '…' : sourceCount || '9+'} />
            <Stat label="Fresh &lt;1h" value={loading ? '…' : freshCount.toLocaleString()} />
            <Stat
              label="Applies left"
              value={dailyCap === Infinity ? '∞' : remaining}
            />
          </div>
        </div>
        {lastFetch && (
          <p className="relative mt-3 text-[11px] text-white/40">
            Last updated: {lastFetch.toLocaleTimeString()}
            {syncState?.endedAt && (
              <> · Synced {formatRelative(syncState.endedAt)}</>
            )}
          </p>
        )}
      </div>

      {warning && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          ⚠ {warning}
        </div>
      )}

      {/* Toolbar */}
      <div className="card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
            <input
              type="search"
              placeholder="Search role, company, skill…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 h-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <Pill active={remote === 'any'}    onClick={() => setRemote('any')}>All</Pill>
            <Pill active={remote === 'remote'} onClick={() => setRemote('remote')}>Remote</Pill>
            <Pill active={remote === 'onsite'} onClick={() => setRemote('onsite')}>Onsite</Pill>
          </div>
          <div className="flex items-center gap-2">
            <Pill active={country === 'All' || country === 'Worldwide'}    onClick={() => setCountry('Worldwide')}>Worldwide</Pill>
            <Pill active={country === 'Pakistan'} onClick={() => setCountry('Pakistan')}>Pakistan</Pill>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input h-11 max-w-[180px]"
            aria-label="Sort jobs"
          >
            <option value="newest">Sort: Newest</option>
            <option value="company">Sort: Company A→Z</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <FilterSelect
            label="Source"
            value={source}
            onChange={setSource}
            options={['All', ...allSources]}
          />
          <FilterSelect
            label="Department"
            value={folder}
            onChange={setFolder}
            options={['All', ...allFolders]}
          />
          <FilterSelect
            label="Type"
            value={type}
            onChange={setType}
            options={['All', ...TYPE_LIST]}
          />
          <button
            onClick={() => { setSearch(''); setSource('All'); setFolder('All'); setType('All'); setRemote('any'); setSort('newest'); }}
            className="ml-auto text-xs font-semibold text-ink-subtle hover:text-ink"
          >
            Reset filters
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>
            Showing <span className="font-bold text-ink">{jobs.length.toLocaleString()}</span> of{' '}
            <span className="font-bold text-ink">{total.toLocaleString()}</span> jobs
            {saved.size > 0 && <> · <span className="font-bold text-ink">{saved.size}</span> saved</>}
          </span>
          <span>Page {page} of {pages}</span>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <div className="card text-center py-16 space-y-3">
          <p className="text-ink-muted">{error}</p>
          <button onClick={fetchJobs} className="text-sm font-semibold text-brand-300 hover:text-brand-200">
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-36 bg-surface/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job._id || job.url}
              job={job}
              saved={saved.has(job._id || job.url)}
              onSave={() => toggleSave(job._id || job.url)}
              onOpen={() => setActive(job)}
            />
          ))}
          {jobs.length === 0 && (
            <div className="col-span-full card text-center py-16 text-ink-muted">
              No jobs match those filters. Try resetting them.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-lg border border-line bg-surface text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-ink-muted px-3">{page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-2 rounded-lg border border-line bg-surface text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {active && (
          <JobDrawer
            job={active}
            saved={saved.has(active._id || active.url)}
            onSave={() => toggleSave(active._id || active.url)}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="px-4 py-3 rounded-xl bg-surface/8 border border-white/10 backdrop-blur min-w-[90px]">
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">{label}</p>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-2 text-xs font-semibold rounded-full border transition-colors',
        active
          ? 'bg-ink text-white border-ink'
          : 'bg-surface text-ink-muted border-line hover:text-ink hover:border-ink/30',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5">
      <span className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-semibold text-ink focus:outline-none"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function JobCard({ job, saved, onSave, onOpen }) {
  const c = srcColor(job.source);
  const timeLabel = formatRelative(job.postedAt || job.fetchedAt);
  const isRemote = /(remote|worldwide|global)/i.test(job.location || '');
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="group relative card hover:shadow-cardHover transition-shadow cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center font-black text-ink-muted shrink-0">
            {(job.company || 'C').slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink-subtle truncate">{job.company}</p>
            <h3 className="text-base font-bold text-ink leading-snug truncate">{job.title}</h3>
            <p className="text-xs text-ink-muted mt-0.5 truncate">
              {job.location} · {job.type}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          className={[
            'shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center transition-colors',
            saved ? 'bg-amber-500/15 border-amber-400/30 text-amber-300' : 'border-line text-ink-subtle hover:text-ink hover:border-ink/30',
          ].join(' ')}
          aria-label={saved ? 'Unsave job' : 'Save job'}
          title={saved ? 'Saved' : 'Save'}
        >
          <BookmarkIcon className="w-4 h-4" filled={saved} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className={['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1', c.bg, c.text, c.ring].join(' ')}>
          {job.source}
        </span>
        {isRemote && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
            Remote
          </span>
        )}
        {(job.tags || []).slice(0, 3).map((t) => (
          <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-canvas border border-line text-ink-muted">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-bold text-ink">{job.salary || ''}</span>
        <span className="text-xs text-ink-subtle">{timeLabel}</span>
      </div>
    </motion.div>
  );
}

function JobDrawer({ job, saved, onSave, onClose }) {
  const c = srcColor(job.source);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] h-full bg-surface shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between">
          <span className={['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1', c.bg, c.text, c.ring].join(' ')}>
            {job.source}
          </span>
          <button onClick={onClose} className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas" aria-label="Close">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center font-black text-ink-muted text-xl">
              {(job.company || 'C').slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-subtle">{job.company}</p>
              <h2 className="text-xl font-black text-ink leading-tight">{job.title}</h2>
              <p className="text-sm text-ink-muted mt-1">{job.location} · {job.type}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {job.salary && <Info label="Salary"   value={job.salary} />}
            <Info label="Posted"   value={formatRelative(job.postedAt || job.fetchedAt)} />
            <Info label="Source"   value={job.source} />
            <Info label="Category" value={job.folder || job.category || '—'} />
          </div>

          {(job.tags || []).length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-canvas border border-line text-ink">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackApply(job)}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-brand-gradient text-white font-bold shadow-glow hover:brightness-110 transition-all"
            >
              Apply on {job.source} →
            </a>
            <button
              onClick={onSave}
              className={[
                'h-11 px-4 rounded-xl border font-semibold inline-flex items-center gap-2',
                saved ? 'bg-amber-500/15 border-amber-400/30 text-amber-300' : 'border-line text-ink-muted hover:text-ink',
              ].join(' ')}
            >
              <BookmarkIcon className="w-4 h-4" filled={saved} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-canvas px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-subtle">{label}</p>
      <p className="text-sm font-bold text-ink mt-0.5">{value}</p>
    </div>
  );
}

function SearchIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>; }
function BookmarkIcon({ filled, ...p }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" {...p}>
      <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
    </svg>
  );
}
function XIcon(p) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6l-12 12"/></svg>; }
