"use client";

import React, { useEffect, useState } from 'react';
import { setupMfa, confirmMfaSetup } from '@/lib/api';
import OTPInput from '@/components/auth/OTPInput';
import Button from '@/components/common/Button';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import Image from 'next/image';
import { Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SetupForm() {
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { pushToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await setupMfa();
        if (!mounted) return;
        setSecret(res?.secret || null);
        setQr(res?.qrCode || null);
      } catch (e: any) {
        pushToast({ title: 'Failed to start setup', description: e?.message || 'Could not generate secret', tone: 'error' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [pushToast]);

  const handleComplete = (code: string) => {
    setOtp(code);
  };

  const handleConfirm = async () => {
    if (!secret || !otp) return pushToast({ title: 'Enter code', description: 'Please enter the 6-digit code', tone: 'info' });
    setVerifying(true);
    try {
      await confirmMfaSetup(secret, otp);
      pushToast({ title: 'MFA enabled', description: 'Two-step verification enabled', tone: 'success' });
      router.push('/settings');
    } catch (e: any) {
      pushToast({ title: 'Verification failed', description: e?.message || 'Invalid code', tone: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[1.5rem] border border-outline/15 bg-surface-container-low p-6">
        {loading ? (
          <p className="text-sm text-on-surface-variant">Generating secret...</p>
        ) : (
          <>
            {qr && (
              <div className="mb-4 flex items-center justify-center">
                <img src={qr} alt="QR code" className="h-44 w-44 rounded-md" />
              </div>
            )}

            {secret && (
              <div className="mb-4 rounded-lg border border-outline/10 bg-surface px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Secret</div>
                  <button type="button" className="inline-flex items-center gap-2 text-sm text-primary" onClick={() => navigator.clipboard?.writeText?.(secret)}>
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                </div>
                <div className="mt-2 text-xs text-on-surface-variant break-all">{secret}</div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-on-surface-variant">Open your authenticator app and scan the QR code, then enter the 6-digit code below to confirm.</p>
              <div className="mt-4">
                <OTPInput length={6} onComplete={handleComplete} />
              </div>
              <div className="mt-4">
                <Button onClick={handleConfirm} disabled={verifying} className="w-full">{verifying ? 'Verifying...' : 'Confirm and enable'}</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
