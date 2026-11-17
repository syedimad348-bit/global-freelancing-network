import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ThumbsUp,
  Video,
  PenSquare,
  Megaphone,
  Scissors,
  Users,
  Palette,
  Clapperboard,
  Film,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import WhatsAppRequestModal from '../../components/WhatsAppRequestModal';

const FACEBOOK_NICHES = [
  { id: 'video-editing', name: 'Video Editing', icon: 'Video', color: 'from-emerald-500 to-teal-600', desc: 'Short-form & long-form video editing gigs and client requests.' },
  { id: 'script-writing', name: 'Script Writing', icon: 'PenSquare', color: 'from-amber-500 to-orange-600', desc: 'Scripts, outlines, and storyboards for creators and brands.' },
  { id: 'content-creation', name: 'Content Creation', icon: 'Megaphone', color: 'from-emerald-600 to-cyan-600', desc: 'Original content creation for pages, groups, and brands.' },
  { id: 'reels-editing', name: 'Reels Editing', icon: 'Scissors', color: 'from-rose-500 to-pink-600', desc: 'Fast-paced reels, shorts, and vertical content editing.' },
  { id: 'smm', name: 'Social Media Management', icon: 'Users', color: 'from-indigo-500 to-violet-600', desc: 'Manage pages, schedule posts, and grow communities.' },
  { id: 'graphic-design', name: 'Graphic Design', icon: 'Palette', color: 'from-sky-500 to-blue-600', desc: 'Thumbnails, banners, posts, and brand design assets.' },
  { id: 'ai-video', name: 'AI Video Creation', icon: 'Clapperboard', color: 'from-emerald-500 to-cyan-600', desc: 'AI-generated video content for pages and creators.' },
  { id: 'yt-automation', name: 'YouTube Automation', icon: 'Film', color: 'from-red-500 to-rose-600', desc: 'Faceless channels, automation, and growth workflows.' },
  { id: 'others', name: 'Others', icon: 'ExternalLink', color: 'from-slate-600 to-slate-800', desc: 'Any other Facebook service or niche request.' },
];

const ICON_MAP = { Video, PenSquare, Megaphone, Scissors, Users, Palette, Clapperboard, Film, ExternalLink };

export default function FacebookSection() {
  const [activeNiche, setActiveNiche] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const filteredNiches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FACEBOOK_NICHES;
    return FACEBOOK_NICHES.filter(
      (n) => n.name.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const openNiche = (niche) => setActiveNiche(niche);

  const closeNiche = () => {
    setActiveNiche(null);
  };

  const handleSuccess = (info) => {
    setSubmitted(info);
    setActiveNiche(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#052E22] via-[#064E3B] to-[#052E22] text-white p-7 sm:p-9 shadow-elevated overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 -bottom-10 w-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 text-emerald-200 border border-white/15">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-300" />
            Facebook Services
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Facebook Niches & Services
          </h2>
          <p className="text-sm sm:text-base text-emerald-50/80 leading-relaxed">
            Select a niche below to submit your information. Our team will reach out with next steps.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search niches or services…"
          className="input pl-11 h-11 text-sm bg-white"
        />
      </div>

      {/* Niche Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNiches.map((niche) => {
          const IconComponent = ICON_MAP[niche.icon] || ExternalLink;
          return (
            <motion.button
              key={niche.id}
              onClick={() => openNiche(niche)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative text-left rounded-2xl bg-white border border-line p-5 shadow-sm hover:shadow-elevated transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${niche.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Facebook
                </span>
              </div>
              <h3 className="mt-3 text-base font-black text-ink group-hover:text-emerald-700 transition-colors">
                {niche.name}
              </h3>
              <p className="mt-1 text-xs text-ink-muted leading-relaxed line-clamp-2">
                {niche.desc}
              </p>
              <div className="mt-4 pt-3 border-t border-line/60">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  Submit Info <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {filteredNiches.length === 0 && (
        <div className="card py-10 text-center text-ink-muted text-sm">
          No niches found for “{searchQuery}”.
        </div>
      )}

      {/* Success Confirmation */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-emerald-200 bg-emerald-50"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black text-emerald-800">Request submitted!</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Thank you! Your information for <strong>{submitted.nicheName}</strong> was received.
              </p>
              <div className="mt-3 rounded-xl bg-white/70 border border-emerald-200 p-3 text-xs text-ink space-y-1">
                <p><span className="font-semibold">Name:</span> {submitted.name}</p>
                <p><span className="font-semibold">Email:</span> {submitted.email}</p>
                <p><span className="font-semibold">Phone:</span> {submitted.phone}</p>
                {submitted.notes && <p><span className="font-semibold">Notes:</span> {submitted.notes}</p>}
              </div>
              <button
                onClick={() => setSubmitted(null)}
                className="mt-3 h-9 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal for niche submission */}
      {activeNiche && (
        <FacebookNicheModal
          niche={activeNiche}
          onClose={closeNiche}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

function FacebookNicheModal({ niche, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in your name, email, and phone number.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/features/facebook-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          niche: niche.name,
          nicheId: niche.id,
          name,
          email,
          phone,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || 'Submission failed. Please try again.');
      onSuccess({ nicheName: niche.name, name, email, phone, notes });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white border border-line shadow-elevated overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                {niche.name}
              </span>
              <h3 className="mt-2 text-lg font-black text-ink">Submit Your Info</h3>
              <p className="mt-1 text-xs text-ink-muted">We will contact you about this niche. No pricing yet.</p>
            </div>
            <button onClick={onClose} className="text-ink-subtle hover:text-ink p-1" aria-label="Close">
              ✕
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="input h-11"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input h-11"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+92 300 1234567"
                className="input h-11"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle block mb-1.5">
                Notes <span className="text-ink-subtle/60">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Tell us about your need…"
                className="input py-2 resize-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
            >
              {busy ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}