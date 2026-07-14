"use client";

import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Link from 'next/link';
import { register } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useToast();
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    if (!name) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    try {
      const res = await register(name, email, password);
      pushToast({ title: 'Account created', tone: 'success' });
      const needsMfa = res?.data?.mfaRequired;
      const path = needsMfa ? '/auth/mfa' : '/login';
      try { await router.prefetch(path); } catch {}
      router.push(path);
    } catch (err: any) {
      const data = err?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      setError(err.message || 'Registration failed');
      pushToast({ title: 'Registration failed', description: err?.message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-outline/15 bg-surface-container-lowest shadow-[0_24px_80px_rgba(27,28,25,0.08)]">
        <div className="hidden w-[46%] lg:block">
          <div className="relative h-full min-h-[560px]">
            <Image src="/images/landingpage.png" alt="FashionSwap editorial scene" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Build trust from day one
              </div>
              <h2 className="mt-5 text-3xl font-semibold">Create an account and start curating your next find.</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/80">Your new profile, offers, and listings all stay connected to the rest of the marketplace experience.</p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center bg-surface-container-lowest p-6 sm:p-10 lg:w-[54%] lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Create account</p>
              <h1 className="mt-2 font-headline text-3xl text-on-surface">Join FashionSwap</h1>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">Set up your profile and start buying or selling in a calm, secure environment.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" type="text" label="Full name" required value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name || undefined} />
              <Input name="email" type="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email || undefined} />
              <Input name="password" type="password" label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password || undefined} />
              {error && <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create account'}
              </Button>
            </form>
            <div className="mt-6 flex items-center justify-center text-sm text-on-surface-variant">
              <span>Already have an account?</span>
              <Link href="/login" className="ml-2 font-semibold text-primary">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
