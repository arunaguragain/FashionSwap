import React from 'react';
import { cn } from './cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
};

export const Button: React.FC<Props> = ({ variant = 'primary', loading, className, children, ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-transform';
  const variants: Record<string, string> = {
    primary: 'bg-primary-900 text-white hover:bg-primary-800',
    secondary: 'bg-transparent text-primary-900 border border-primary-900',
    outline: 'bg-white text-neutral-700 border border-neutral-200'
  };

  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
