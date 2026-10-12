import React from 'react';

export default function Logo({ size = 'md', inverted = false, collapsed = false }) {
  const sizes = {
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-sm' },
    md: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-base' },
    lg: { box: 'w-11 h-11', icon: 'w-6 h-6', text: 'text-xl' },
  };
  const s = sizes[size] || sizes.md;

  if (collapsed) {
    return (
      <div className={`${s.box} rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white shadow-sm ring-1 ring-white/20`} title="Global Freelancing Network">
        <svg className={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div className={`${s.box} rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white shadow-sm ring-1 ring-white/10 shrink-0`}>
        <svg className={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`font-black tracking-tight ${inverted ? 'text-white' : 'text-ink'} ${s.text}`}>
          Global<span className="text-brand-400 font-extrabold">Freelance</span>
        </span>
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${inverted ? 'text-sidebar-muted' : 'text-ink-subtle'}`}>
          Network
        </span>
      </div>
    </div>
  );
}
