import React from 'react';
import { cn } from './cn';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export const Input: React.FC<Props> = ({ label, error, className, ...rest }) => {
  return (
    <label className="block">
      {label && <span className="text-sm text-neutral-700 mb-1 block">{label}</span>}
      <input
        className={cn('w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2', error ? 'border-danger-500 ring-danger-200' : 'border-neutral-200 ring-primary-200', className)}
        {...rest}
      />
      {error && <p className="text-sm text-danger-500 mt-1">{error}</p>}
    </label>
  );
};

export default Input;
