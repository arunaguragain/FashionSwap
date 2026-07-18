"use client";

import { useRef, useState } from 'react';
import { cn } from '../common/cn';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  className?: string;
  inputClassName?: string;
}

export default function OTPInput({ length = 6, onComplete, onChange, className, inputClassName }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = '';
    const digits = value.slice(0, length - index).split('');
    digits.forEach((digit, offset) => {
      newOtp[index + offset] = digit;
    });
    setOtp(newOtp);
    const code = newOtp.join('');
    onChange?.(code);

    if (digits.length) {
      inputRefs.current[Math.min(index + digits.length, length - 1)]?.focus();
    }

    if (newOtp.every((d) => d !== '')) onComplete?.(code);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={cn('grid grid-cols-6 gap-2 sm:gap-3', className)}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(r) => { inputRefs.current[idx] = r; }}
          type="text"
          inputMode="numeric"
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${idx + 1} of ${length}`}
          maxLength={1}
          value={otp[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={cn('h-14 min-w-0 w-full rounded-xl border border-border bg-white text-center text-lg font-semibold text-charcoal shadow-sm outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/15', otp[idx] ? 'border-terracotta/50 bg-terracotta/5' : '', inputClassName)}
        />
      ))}
    </div>
  );
}
