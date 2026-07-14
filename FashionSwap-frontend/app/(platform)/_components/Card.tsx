import type { CSSProperties, ReactNode } from "react";

export default function Card({
  children,
  className = "",
  style,
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  noPadding?: boolean;
}) {
  const base = `rounded-[var(--radius-xl)] border border-[#ead8c5] bg-white/85 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${className}`;
  const padded = noPadding ? base : `${base} p-6`;
  return (
    <div className={padded} style={style}>
      {children}
    </div>
  );
}
