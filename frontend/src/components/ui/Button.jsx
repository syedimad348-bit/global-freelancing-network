import React from 'react';

const variants = {
  primary:
    'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-sm shadow-brand-500/20 active:scale-[0.98]',
  secondary:
    'bg-white text-ink-soft border border-line hover:bg-surface-subtle hover:text-ink active:scale-[0.98]',
  ghost:
    'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-subtle',
  danger:
    'bg-accent-rose text-white hover:brightness-105 active:scale-[0.98]',
  outline:
    'bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 hover:border-brand-300',
  purple:
    'bg-gradient-to-r from-brand-600 to-accent-violet text-white shadow-sm hover:brightness-105 active:scale-[0.98]',
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-11 px-5 text-base rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  leftIcon = null,
  rightIcon = null,
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-150 focus-ring cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
