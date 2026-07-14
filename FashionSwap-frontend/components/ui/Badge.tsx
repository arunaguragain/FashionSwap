import type { ReactNode } from 'react';
import cx from 'clsx';

type BadgeVariant = 'default' | 'terracotta' | 'sage' | 'sand' | 'charcoal' | 'outline';

export default function Badge({ children, variant = 'default', className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-parchment-dark text-charcoal-soft',
    terracotta: 'bg-terracotta/12 text-terracotta-dark',
    sage: 'bg-sage/12 text-sage-dark',
    sand: 'bg-sand text-ink',
    charcoal: 'bg-charcoal text-parchment',
    outline: 'border border-border text-ink bg-transparent',
  };

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
