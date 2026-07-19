import React from 'react';
import { cn } from './cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}; 

export const Button: React.FC<Props> = ({ variant = 'primary', loading, className, children, ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-on-primary shadow-[0_10px_30px_rgba(114,68,40,0.16)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(114,68,40,0.2)]',
    secondary: 'border border-outline/40 bg-surface-container-low text-primary hover:bg-surface-container',
    outline: 'border border-outline/40 bg-white/80 text-on-surface hover:bg-surface-container-low'
  };

  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
