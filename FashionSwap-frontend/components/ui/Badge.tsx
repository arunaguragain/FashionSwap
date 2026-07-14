import type { ReactNode } from 'react';
import cx from 'clsx';

export default function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold bg-secondary/10 text-secondary',
        className,
      )}
    >
      {children}
    </span>
  );
}
