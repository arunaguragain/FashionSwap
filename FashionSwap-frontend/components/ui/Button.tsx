import type { ButtonHTMLAttributes } from 'react';
import cx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ variant = 'primary', className, children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-[10px] px-4 py-2 text-sm font-medium transition-colors';
  const variants: Record<string, string> = {
    primary: 'bg-terracotta text-white hover:bg-terracotta-dark',
    secondary: 'bg-muted text-muted-foreground hover:bg-muted',
    ghost: 'bg-transparent text-ink hover:bg-parchment-dark',
  };
  return (
    <button className={cx(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
