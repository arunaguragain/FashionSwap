import type { InputHTMLAttributes } from 'react';
import cx from 'clsx';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className, ...rest }: Props) {
  return (
    <label className={cx('block', className)}>
      {label ? <span className="mb-2 block text-sm font-medium text-ink">{label}</span> : null}
      <input className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" {...rest} />
    </label>
  );
}
