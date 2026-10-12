import React from 'react';

export default function Card({ as: As = 'div', className = '', children, padded = true, hover = false, ...rest }) {
  return (
    <As
      {...rest}
      className={[
        'card',
        padded ? 'p-5 sm:p-6' : '',
        hover ? 'transition-shadow hover:shadow-cardHover' : '',
        className,
      ].join(' ')}
    >
      {children}
    </As>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={['flex items-start justify-between gap-4', className].join(' ')}>
      <div>
        {title && <h3 className="text-base font-bold text-ink tracking-tight">{title}</h3>}
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
