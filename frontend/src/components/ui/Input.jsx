import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, hint, error, leftIcon, rightSlot, className = '', id, ...rest },
  ref
) {
  const inputId = id || rest.name || Math.random().toString(36).slice(2);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          id={inputId}
          ref={ref}
          className={[
            'input',
            leftIcon ? 'pl-9' : '',
            rightSlot ? 'pr-10' : '',
            error ? 'border-accent-rose focus-visible:ring-accent-rose/15' : '',
          ].join(' ')}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>
      {hint && !error && <p className="text-xs text-ink-subtle mt-1.5">{hint}</p>}
      {error && <p className="text-xs text-accent-rose mt-1.5">{error}</p>}
    </div>
  );
});

export default Input;
