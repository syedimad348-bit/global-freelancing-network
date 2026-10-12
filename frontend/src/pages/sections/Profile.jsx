import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { loadUsage, updateProfile, addSkill, removeSkill, addExperience, removeExperience } from '../../lib/usage';
import { getTier } from '../../lib/tiers';

export default function Profile({ user }) {
  const [usage, setUsage] = useState(loadUsage());
  const fileRef = useRef(null);
  const tier = getTier(user);

  useEffect(() => {
    const r = () => setUsage(loadUsage());
    window.addEventListener('usage-changed', r);
    return () => window.removeEventListener('usage-changed', r);
  }, []);

  const p = usage.profile;

  const onPick = () => fileRef.current?.click();
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!/^image\//.test(f.type)) return alert('Please pick an image file.');
    if (f.size > 2 * 1024 * 1024) return alert('Max 2 MB please.');
    const r = new FileReader();
    r.onload = () => updateProfile({ dpUrl: String(r.result) });
    r.readAsDataURL(f);
  };

  const setField = (key) => (e) => updateProfile({ [key]: e.target.value });
  const setLink = (key) => (e) => updateProfile({ links: { ...p.links, [key]: e.target.value } });

  const completeness = (() => {
    let n = 0; const checks = [p.dpUrl, p.headline, p.bio, p.location, p.skills.length > 0, p.experience.length > 0, p.links.portfolio || p.links.github || p.links.linkedin];
    checks.forEach((c) => { if (c) n++; });
    return Math.round((n / checks.length) * 100);
  })();

  return (
    <div className="space-y-6">
      {/* Cover + avatar header */}
      <div className="card-glow !p-0 overflow-hidden">
        <div className="relative h-44">
          <div aria-hidden className="absolute inset-0 grid-bg opacity-20" />
          <div aria-hidden className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-neon-cyan/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-neon-violet/30 blur-3xl" />
        </div>
        <div className="px-6 pb-6 -mt-16 flex flex-col md:flex-row items-start md:items-end gap-5">
          <div className="relative">
            {p.dpUrl ? (
              <img src={p.dpUrl} alt="avatar" className="w-32 h-32 rounded-2xl object-cover border-4 border-surface shadow-glow" />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-brand-gradient text-white text-5xl font-black grid place-items-center border-4 border-surface shadow-glow">
                {(p.name || user?.name || 'U')[0]}
              </div>
            )}
            <button onClick={onPick} className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-neon-cyan text-canvas grid place-items-center font-bold shadow-glow-cyan border-4 border-surface" title="Upload photo">📷</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-ink truncate">{p.name || user?.name || 'Your Name'}</h1>
            <p className="text-sm text-ink-muted">{p.headline || 'Add a professional headline →'}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {p.location && <span className="chip glass text-ink-soft">📍 {p.location}</span>}
              {tier?.badge && <span className="chip bg-amber-500/15 text-amber-300 border border-amber-400/30">⭐ {tier.badge.toUpperCase()}</span>}
              <span className="chip glass text-ink-soft">👥 {usage.followers.length} followers · {usage.following.length} following</span>
            </div>
          </div>
          <div className="text-center min-w-[140px]">
            <p className="text-[10px] uppercase font-bold tracking-wider text-ink-subtle">Profile strength</p>
            <p className="text-3xl font-black text-cyan-violet">{completeness}%</p>
            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-cyan-violet" style={{ width: `${completeness}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic info */}
        <div className="card lg:col-span-2 space-y-4">
          <h3 className="text-lg font-black text-ink">Basics</h3>
          <Field label="Display name" value={p.name} onChange={setField('name')} placeholder="e.g. Aisha Khan" />
          <Field label="Headline" value={p.headline} onChange={setField('headline')} placeholder="Senior Frontend Engineer · open to remote" />
          <Field label="Location" value={p.location} onChange={setField('location')} placeholder="Karachi, PK" />
          <div>
            <label className="label">About</label>
            <textarea rows={4} value={p.bio} onChange={setField('bio')} placeholder="Short, public bio (1–3 sentences)…" className="input" />
          </div>
        </div>

        {/* Links */}
        <div className="card space-y-3">
          <h3 className="text-lg font-black text-ink">Links</h3>
          <Field label="Portfolio URL" value={p.links.portfolio} onChange={setLink('portfolio')} placeholder="https://yoursite.com" />
          <Field label="GitHub" value={p.links.github} onChange={setLink('github')} placeholder="https://github.com/you" />
          <Field label="LinkedIn" value={p.links.linkedin} onChange={setLink('linkedin')} placeholder="https://linkedin.com/in/you" />
          <p className="text-[11px] text-ink-subtle pt-2">🔒 Email & phone stay private. Only the fields above are public on your profile.</p>
        </div>
      </div>

      {/* Skills */}
      <SkillsCard skills={p.skills} />

      {/* Experience */}
      <ExperienceCard list={p.experience} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input value={value || ''} onChange={onChange} placeholder={placeholder} className="input" />
    </div>
  );
}

function SkillsCard({ skills }) {
  const [val, setVal] = useState('');
  const add = () => { addSkill(val); setVal(''); };
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black text-ink">Skills</h3>
        <span className="text-xs text-ink-subtle">{skills.length} added</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
        {skills.length === 0 && <p className="text-sm text-ink-muted">Add the tools, languages, and frameworks you know.</p>}
        {skills.map((s) => (
          <span key={s} className="chip bg-brand-500/15 text-brand-300 border border-brand-400/30">
            {s} <button onClick={() => removeSkill(s)} className="ml-1 text-ink-subtle hover:text-rose-300">✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="React, Python, Figma…" className="input h-10 flex-1" />
        <button onClick={add} className="btn-primary h-10">+ Add</button>
      </div>
    </div>
  );
}

function ExperienceCard({ list }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ role: '', company: '', period: '', desc: '' });
  const submit = () => {
    if (!form.role || !form.company) return;
    addExperience(form); setForm({ role: '', company: '', period: '', desc: '' }); setOpen(false);
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-black text-ink">Experience</h3>
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost h-9 text-sm">{open ? 'Cancel' : '+ Add experience'}</button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 rounded-xl border border-brand-400/30 bg-brand-500/5">
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role · e.g. Senior Frontend Engineer" className="input h-10" />
          <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company · e.g. Acme Inc." className="input h-10" />
          <input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="Period · e.g. 2022 — Present" className="input h-10 md:col-span-2" />
          <textarea rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="What you built / impact (1–3 lines)" className="input md:col-span-2" />
          <div className="md:col-span-2 flex gap-2">
            <button onClick={submit} className="btn-primary h-10">Save</button>
          </div>
        </motion.div>
      )}
      {list.length === 0 ? (
        <p className="text-sm text-ink-muted">Nothing here yet. Add roles you've held — appears on your public profile.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((x) => (
            <li key={x.id} className="rounded-xl border border-line bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{x.role}</p>
                  <p className="text-xs text-ink-muted">{x.company} · {x.period}</p>
                </div>
                <button onClick={() => removeExperience(x.id)} className="text-xs text-rose-300 hover:underline shrink-0">Remove</button>
              </div>
              {x.desc && <p className="mt-2 text-sm text-ink-soft leading-relaxed">{x.desc}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
