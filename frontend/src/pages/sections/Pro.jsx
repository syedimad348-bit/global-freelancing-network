import React, { useState } from 'react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0, yearly: 0,
    blurb: 'Get started — see what DailyRadar can do.',
    features: [
      '1,000+ live jobs (1h refresh)',
      'Basic resume score',
      '3 mock interview questions / day',
      'Limited AI tools directory',
    ],
    cta: 'Current plan',
    accent: 'border-line',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 6, yearly: 5,
    blurb: 'For active job seekers who want every edge.',
    features: [
      'Everything in Free',
      'Unlimited AI usage (resume, cover letters, rewrites)',
      'Priority job alerts (instant email)',
      'AI Cover Letter generator',
      'Save unlimited jobs & searches',
      'No ads',
    ],
    cta: 'Upgrade to Pro',
    accent: 'ring-2 ring-brand-500 border-transparent shadow-glow',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: 18, yearly: 15,
    blurb: 'Land your next role 2× faster, with a full coaching stack.',
    features: [
      'Everything in Pro',
      'AI Interview Coach (voice + text)',
      'Career Roadmap planner',
      'LinkedIn profile optimizer',
      'Salary Negotiation Coach',
      '1:1 monthly review (human)',
    ],
    cta: 'Go Premium',
    accent: 'border-line',
  },
];

const PAYMENTS = [
  { name: 'Stripe',     desc: 'Credit & debit cards worldwide',        icon: '💳' },
  { name: 'JazzCash',   desc: 'Send to 03184798281',                   icon: '📱' },
  { name: 'EasyPaisa',  desc: 'Send to 03184798281',                   icon: '💚' },
  { name: 'NayaPay',    desc: 'Send to m03184798281@nayapay',          icon: '🟣' },
  { name: 'PayPal',     desc: 'PayPal balance & cards',                icon: '🅿️' },
  { name: 'Bank Transfer', desc: 'IBAN provided after checkout',       icon: '🏦' },
];

const FAQ = [
  { q: 'Can I cancel anytime?',          a: 'Yes — one click in Settings. Your access stays until the end of the billing period.' },
  { q: 'Do you offer student discounts?', a: 'Yes, 50% off Pro with a verified .edu / student ID.' },
  { q: 'Which payment methods work in Pakistan?', a: 'JazzCash, EasyPaisa, and bank cards via Stripe — all supported.' },
  { q: 'Is my data private?',            a: 'Always. Your resume is processed in memory and never sold or shared.' },
];

const COMPARE = [
  { label: 'Live jobs/day',          free: '50',          pro: 'Unlimited',     premium: 'Unlimited' },
  { label: 'Apply tracking/day',     free: '10',          pro: 'Unlimited',     premium: 'Unlimited' },
  { label: 'Resume analyses',        free: '2 / month',   pro: 'Unlimited',     premium: 'Unlimited' },
  { label: 'Mock interviews',        free: '3 / month',   pro: 'Unlimited',     premium: 'Unlimited' },
  { label: 'AI-text detection',      free: '—',           pro: '✓',             premium: '✓' },
  { label: 'Best-fit job match',     free: '3 jobs',      pro: '50+',           premium: '50+' },
  { label: 'AI Tools Reels',         free: '—',           pro: '✓',             premium: '✓' },
  { label: 'Send messages',          free: '—',           pro: '✓',             premium: '✓' },
  { label: 'Export CSV',             free: '—',           pro: '✓',             premium: '✓' },
  { label: '1:1 human review',       free: '—',           pro: '—',             premium: '✓ monthly' },
];

export default function Pro() {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 text-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wider">
          ⚡ Limited launch pricing — 1,200+ users upgraded this month
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-ink">
          Land your next role <span className="text-gradient">2× faster</span>.
        </h1>
        <p className="mt-3 text-ink-muted text-base">
          On Free you get a taste. On Pro you get the unfair advantage — unlimited resume scoring, unlimited mock interviews, AI-text detection, 50+ best-fit jobs after every upload, Reels, and DMs to recruiters.
        </p>
        <p className="mt-2 text-ink-muted text-sm">Cancel anytime · 14-day money-back · Local payment methods supported.</p>

        <div className="mt-6 inline-flex p-1 rounded-full bg-surface border border-line shadow-card">
          <button
            onClick={() => setYearly(false)}
            className={['px-4 py-1.5 text-xs font-semibold rounded-full', !yearly ? 'bg-ink text-white' : 'text-ink-muted'].join(' ')}
          >Monthly</button>
          <button
            onClick={() => setYearly(true)}
            className={['px-4 py-1.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5', yearly ? 'bg-ink text-white' : 'text-ink-muted'].join(' ')}
          >
            Yearly <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/15 px-1.5 py-0.5 rounded">−17%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {PLANS.map((p) => (
          <div key={p.id} className={['card relative flex flex-col', p.accent].join(' ')}>
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-brand-gradient text-white shadow-glow">
                Most popular
              </div>
            )}
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">{p.name}</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-black text-ink">${yearly ? p.yearly : p.monthly}</span>
              <span className="text-sm text-ink-muted">/mo</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">{p.blurb}</p>

            <ul className="mt-5 space-y-2.5 text-sm text-ink flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-300 grid place-items-center text-[10px] font-black shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={[
                'mt-6 h-11 rounded-xl font-bold text-sm transition-all',
                p.highlight
                  ? 'bg-brand-gradient text-white shadow-glow hover:brightness-110'
                  : p.id === 'free'
                    ? 'bg-canvas text-ink-muted border border-line cursor-not-allowed'
                    : 'border border-ink/10 bg-surface text-ink hover:bg-canvas',
              ].join(' ')}
              disabled={p.id === 'free'}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="card max-w-5xl mx-auto overflow-x-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Side-by-side</p>
        <h3 className="text-lg font-black text-ink">Free vs Pro vs Premium</h3>
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold border-b border-line">
              <th className="text-left py-2">Feature</th>
              <th className="text-center py-2">Free</th>
              <th className="text-center py-2 text-brand-300">Pro</th>
              <th className="text-center py-2 text-violet-300">Premium</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.label} className="border-b border-line/60 last:border-0">
                <td className="py-2.5 text-ink font-semibold">{r.label}</td>
                <td className="py-2.5 text-center text-ink-muted">{r.free}</td>
                <td className="py-2.5 text-center text-ink font-bold">{r.pro}</td>
                <td className="py-2.5 text-center text-ink font-bold">{r.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Pay your way</p>
        <h3 className="text-lg font-black text-ink">Local & global payment methods supported</h3>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 px-3 py-1 text-xs font-semibold">
          🇵🇰 Pakistan: send to <span className="font-mono font-bold">03184798281</span> on JazzCash / EasyPaisa / NayaPay
        </div>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
          {PAYMENTS.map((p) => (
            <div key={p.name} className="rounded-xl border border-line bg-surface p-4 flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <p className="text-sm font-bold text-ink">{p.name}</p>
                <p className="text-xs text-ink-muted">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card max-w-3xl mx-auto">
        <h3 className="text-lg font-black text-ink">Frequently asked</h3>
        <div className="mt-4 divide-y divide-line">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-ink list-none">
                {f.q}
                <span className="text-ink-subtle group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-2 text-sm text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
