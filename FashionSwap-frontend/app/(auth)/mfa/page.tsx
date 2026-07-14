"use client";

import React, { useState } from 'react';
import OTPInput from '../../../components/auth/OTPInput';
import Button from '../../../components/common/Button';
import { verifyOtp } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { BadgeCheck, Copy } from 'lucide-react';

export default function MFAChallenge() {
  const [completedOtp, setCompletedOtp] = useState<string | null>(null);
  const { pushToast } = useToast();

  const handleComplete = (code: string) => {
    setCompletedOtp(code);
    (async () => {
      try {
        const res = await verifyOtp(code);
        pushToast({ title: 'Verified', description: 'MFA verified', tone: 'success' });
        console.log('OTP verify', res);
      } catch (e: any) {
        pushToast({ title: 'Verification failed', description: e?.message || 'Invalid code', tone: 'error' });
      }
    })();
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col justify-center rounded-[2rem] border border-outline/15 bg-surface-container-lowest p-8 shadow-[0_24px_80px_rgba(27,28,25,0.08)] sm:p-10 lg:flex-row lg:items-center lg:gap-10 lg:p-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
            <BadgeCheck className="h-4 w-4" />
            Two-step verification
          </div>
          <h2 className="mt-5 font-headline text-3xl text-on-surface">Enter the 6-digit code</h2>
          <p className="mt-3 text-sm leading-7 text-on-surface-variant">We sent a code to your device. Use the same secure flow you already rely on to verify your identity.</p>
          <div className="mt-8 rounded-[1.5rem] border border-outline/15 bg-surface-container-low p-5 text-left">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Recovery code</p>
                <p className="mt-2 text-sm text-on-surface-variant">Copy your setup secret when you need to restore your authenticator.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-outline/20 bg-surface-container-lowest px-3 py-2 text-sm font-semibold text-primary" type="button" onClick={() => navigator.clipboard?.writeText?.('FashionSwap-auth-secret')}>
                <Copy className="h-4 w-4" />
                Copy code
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 flex-1 rounded-[1.5rem] border border-outline/15 bg-surface-container-low p-7 lg:mt-0">
          <OTPInput length={6} onComplete={handleComplete} />
          <div className="mt-6">
            <Button onClick={() => console.log('Resend')} className="w-full">Resend code</Button>
          </div>
          {completedOtp && <p className="mt-4 text-sm text-secondary">Code entered: {completedOtp}</p>}
        </div>
      </div>
    </div>
  );
}
