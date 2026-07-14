import React from 'react';
import { cn } from './cn';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export const Input: React.FC<Props> = ({ label, error, className, ...rest }) => {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant">{label}</span>}
      <input
        className={cn('w-full rounded-2xl border border-outline/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15', error ? 'border-error/60 ring-error/10' : '', className)}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </label>
  );
};

export default Input;
