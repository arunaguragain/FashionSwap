"use client";

import React, { useState } from 'react';
import OTPInput from '../../../components/auth/OTPInput';
import Button from '../../../components/common/Button';
import { verifyOtp } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow text-center">
        <h2 className="text-xl font-semibold mb-4">Enter the 6-digit code</h2>
        <p className="text-sm text-gray-600 mb-6">We sent a code to your device</p>
        <OTPInput length={6} onComplete={handleComplete} />

        <div className="mt-6">
          <Button onClick={() => console.log('Resend')}>Resend</Button>
        </div>

        {completedOtp && <p className="mt-4 text-sm text-green-600">Code entered: {completedOtp}</p>}
      </div>
    </div>
  );
}
