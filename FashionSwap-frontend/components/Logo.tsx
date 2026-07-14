import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 } as const;
  const textSizes: Record<string, string> = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };
  const s = sizes[size];
  const fill = variant === 'light' ? '#FAF7F2' : '#C4622D';
  const textColor = variant === 'light' ? 'text-parchment' : 'text-on-surface';

  return (
    <Link href="/" aria-label="FashionSwap home" className="inline-flex items-center gap-2.5">
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill={fill} opacity={variant === 'light' ? 0.15 : 0.12} />
        <path d="M10 13C10 11.343 11.343 10 13 10H17C17 10 17 14 13 14C11.343 14 10 14 10 13Z" fill={fill} />
        <path d="M26 23C26 24.657 24.657 26 23 26H19C19 26 19 22 23 22C24.657 22 26 22 26 23Z" fill={fill} />
        <path d="M13 10L26 10M23 26L10 26" stroke={fill} strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        <path d="M10 10L26 26" stroke={fill} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="2.5" fill={fill} />
        <circle cx="26" cy="26" r="2.5" fill={fill} />
      </svg>
      <span className={`font-headline font-bold tracking-tight ${textSizes[size]} ${textColor}`} style={{ letterSpacing: '-0.02em' }}>
        FashionSwap
      </span>
    </Link>
  );
}
