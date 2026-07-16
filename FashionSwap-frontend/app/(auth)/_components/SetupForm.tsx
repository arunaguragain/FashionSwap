"use client";

import React, { useEffect, useState } from 'react';
import { setupMfa, confirmMfaSetup } from '@/lib/api';
import OTPInput from '@/components/auth/OTPInput';
import Button from '@/components/common/Button';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Copy, KeyRound, QrCode, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SetupForm() {
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { pushToast } = useToast();
  const router = useRouter();
  const { checkAuth } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await setupMfa();
        if (!mounted) return;
        const data = res?.data || res;
        setSecret(data?.secret || null);
        setQr(data?.qrCode || null);
      } catch (e: unknown) {
        pushToast({ title: 'Failed to start setup', description: e instanceof Error ? e.message : 'Could not generate secret', tone: 'error' });
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
      await checkAuth(true);
      router.push('/settings');
    } catch (e: unknown) {
      pushToast({ title: 'Verification failed', description: e instanceof Error ? e.message : 'Invalid code', tone: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid w-full gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        {loading ? (
          <div className="col-span-full flex min-h-[320px] items-center justify-center rounded-2xl bg-parchment/70">
            <p className="text-sm font-medium text-ink">Generating secret...</p>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-col gap-3">
              {qr && (
                <div className="rounded-2xl border border-border bg-parchment/45 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                      <QrCode className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-charcoal">Scan QR code</h2>
                      <p className="text-sm text-ink">Use Google Authenticator, Authy, or your password manager.</p>
                    </div>
                  </div>
                  <div className="mx-auto aspect-square w-full max-w-[220px] rounded-2xl bg-white p-3 shadow-sm">
                    <Image src={qr} alt="QR code" width={220} height={220} unoptimized className="h-full w-full object-contain" />
                  </div>
                </div>
              )}

              {secret && (
                <div className="rounded-2xl border border-border bg-parchment/45 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal/10 text-charcoal">
                        <KeyRound className="h-5 w-5" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-charcoal">Secret fallback</div>
                        <p className="mt-0.5 text-xs text-ink">Reveal only if you cannot scan the QR.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-parchment-dark"
                      onClick={() => setShowSecret((prev) => !prev)}
                    >
                      {showSecret ? 'Hide secret' : 'Show secret'}
                    </button>
                  </div>

                  {showSecret && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-2">
                      <div className="min-w-0 flex-1 truncate rounded-lg bg-parchment px-3 py-2 font-mono text-xs text-charcoal" title={secret}>
                        {secret}
                      </div>
                      <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-charcoal transition-colors hover:bg-parchment-dark"
                        onClick={() => navigator.clipboard?.writeText(secret)}
                      >
                        <Copy className="h-4 w-4" /> Copy
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="flex h-full flex-col rounded-2xl border border-border bg-parchment/45 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-charcoal">Confirm setup</h2>
                    <p className="mt-1.5 text-sm leading-6 text-ink">Enter the 6-digit code from your authenticator app to verify the link.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <OTPInput
                    length={6}
                    onComplete={handleComplete}
                    className="grid grid-cols-6 gap-2 sm:gap-3"
                    inputClassName="h-11 w-full rounded-xl border-border bg-white text-base text-charcoal sm:h-12"
                  />
                </div>

                <div className="mt-4 border-t border-border/70 pt-4">
                  <Button
                    onClick={handleConfirm}
                    disabled={verifying}
                    className="w-full rounded-xl !bg-terracotta-dark py-3.5 !text-white shadow-[0_14px_28px_rgba(91,45,22,0.28)] hover:!bg-charcoal"
                  >
                    {verifying ? 'Verifying...' : 'Confirm and enable'}
                  </Button>
                  <p className="mt-3 text-center text-xs text-ink">
                    You can disable this later from account settings.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
