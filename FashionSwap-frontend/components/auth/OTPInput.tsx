"use client";

import { useRef, useState } from 'react';
import { cn } from '../common/cn';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  className?: string;
}

export default function OTPInput({ length = 6, onComplete, className }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '')) onComplete(newOtp.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={cn('flex flex-wrap justify-center gap-3', className)}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(r) => { inputRefs.current[idx] = r; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={cn('h-14 w-12 rounded-2xl border border-outline/30 bg-surface-container-lowest text-center text-lg font-semibold text-on-surface shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-14', otp[idx] ? 'border-primary/35 bg-primary/5' : '')}
        />
      ))}
    </div>
  );
}
