"use client";

import React, { useState } from 'react';
import OTPInput from '@/components/auth/OTPInput';
import Button from '@/components/common/Button';
import { verifyOtp } from '@/lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function VerifyForm() {
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();
  const router = useRouter();

  const handleComplete = async (code: string) => {
    setLoading(true);
    try {
      await verifyOtp(code);
      pushToast({ title: 'Verified', description: 'MFA verified', tone: 'success' });
      router.push('/profile');
    } catch (e: any) {
      pushToast({ title: 'Verification failed', description: e?.message || 'Invalid code', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[1.5rem] border border-outline/15 bg-surface-container-low p-6">
        <p className="text-sm text-on-surface-variant">Enter the 6-digit code from your authenticator app.</p>
        <div className="mt-4">
          <OTPInput length={6} onComplete={handleComplete} />
        </div>
        <div className="mt-4">
          <Button disabled={loading} className="w-full" onClick={() => pushToast({ title: 'Use the input', description: 'Finish entering the code to verify', tone: 'info' })}>
            {loading ? 'Verifying…' : 'Verify code'}
          </Button>
        </div>
      </div>
    </div>
  );
}
