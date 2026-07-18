"use client";

import React, { useState, useEffect } from 'react';
import OTPInput from '@/components/auth/OTPInput';
import Button from '@/components/ui/Button';
import { handleVerifyMfa } from '@/lib/actions/auth-actions';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function VerifyForm() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [csrfReady, setCsrfReady] = useState(false);
  const { pushToast } = useToast();
  const router = useRouter();
  const { checkAuth } = useAuth();

  const ensureCsrf = async () => {
    if (csrfReady) return;
    try {
      await fetch('/api/csrf', { credentials: 'include' });
    } catch {
      // continue even if CSRF endpoint fails, backend will enforce strict validation.
    } finally {
      setCsrfReady(true);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    ensureCsrf();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('mfaSessionToken');
    setSessionToken(token);
  }, []);

  const handleComplete = async (code: string) => {
    if (!sessionToken) {
      pushToast({ title: 'Session error', description: 'Missing MFA session token. Please login again.', tone: 'error' });
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      if (!csrfReady) {
        await ensureCsrf();
      }

      const res = await handleVerifyMfa(sessionToken, code);
      if (!res.success) {
        throw new Error(res.message || 'MFA verification failed');
      }
      window.localStorage.removeItem('mfaSessionToken');
      await checkAuth(true);
      pushToast({ title: 'Verified', description: 'MFA verified', tone: 'success' });
      router.push('/profile');
    } catch (e: unknown) {
      pushToast({ title: 'Verification failed', description: e instanceof Error ? e.message : 'Invalid code', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[1.5rem] border border-border bg-parchment-dark/40 p-6">
        <p className="text-sm text-ink">Enter the 6-digit code from your authenticator app.</p>
        <div className="mt-4">
          <OTPInput length={6} onChange={setCode} />
        </div>
        <div className="mt-4">
          <Button disabled={loading || code.length !== 6} className="w-full" onClick={() => handleComplete(code)}>
            {loading ? 'Verifying…' : 'Verify code'}
          </Button>
        </div>
      </div>
    </div>
  );
}
