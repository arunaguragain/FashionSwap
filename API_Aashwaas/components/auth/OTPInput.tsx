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
    if (!/^\d*$/.test(value)) return; // Only digits
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
      <div className={cn('flex gap-2 justify-center', className)}>
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
          className={cn('w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-all focus:outline-none focus:border-blue-500', otp[idx] ? 'border-blue-300 bg-blue-50' : 'border-gray-300')}
        />
      ))}
    </div>
  );
}
