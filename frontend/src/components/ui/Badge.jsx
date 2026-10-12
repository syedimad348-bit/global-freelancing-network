import React from 'react';

const tones = {
  brand:   'bg-brand-50 text-brand-700 border border-brand-200',
  mint:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  amber:   'bg-amber-50 text-amber-700 border border-amber-200',
  rose:    'bg-rose-50 text-rose-700 border border-rose-200',
  sky:     'bg-sky-50 text-sky-700 border border-sky-200',
  violet:  'bg-purple-50 text-purple-700 border border-purple-200',
  neutral: 'bg-surface-subtle text-ink-muted border border-line',
  purple:  'bg-brand-50 text-brand-600 border border-brand-100 font-medium',
};

export default function Badge({ tone = 'brand', children, className = '', dot = false }) {
  return (
    <span className={['inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide', tones[tone] || tones.brand, className].join(' ')}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />}
      <span>{children}</span>
    </span>
  );
}
