"use client";

import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Link from 'next/link';
import { login } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { pushToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }
    try {
      const res = await login(email, password);
      pushToast({ title: 'Signed in', tone: 'success' });
      const role = res?.data?.role?.toLowerCase?.();
      let path = '/listings';
      if (role === 'admin') path = '/admin/dashboard';
      else if (role === 'buyer' || role === 'seller') path = '/profile';
      try { await router.prefetch(path); } catch {}
      router.push(path);
    } catch (err: any) {
      const data = err?.data;
      if (data?.errors && typeof data.errors === 'object') {
        setFieldErrors(data.errors);
      }
      setError(err.message || 'Login failed');
      pushToast({ title: 'Sign in failed', description: err?.message, tone: 'error' });
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
                Secure, trusted exchanges
              </div>
              <h2 className="mt-5 text-3xl font-semibold">A calm marketplace made for modern wardrobes.</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/80">Sign in to browse, make offers, and manage every handoff with the same confidence as the rest of FashionSwap.</p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center bg-surface-container-lowest p-6 sm:p-10 lg:w-[54%] lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Welcome back</p>
              <h1 className="mt-2 font-headline text-3xl text-on-surface">Sign in to FashionSwap</h1>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">Continue exploring curated finds and managing your orders with confidence.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="email" type="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email || undefined} />
              <Input name="password" type="password" label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password || undefined} />
              {error && <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <div className="mt-6 flex items-center justify-center text-sm text-on-surface-variant">
              <span>Don&apos;t have an account?</span>
              <Link href="/register" className="ml-2 font-semibold text-primary">Create one</Link>
            </div>
            <div className="mt-8 rounded-[1.25rem] border border-outline/15 bg-surface-container-low p-4 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2 font-semibold text-on-surface">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure access stays protected with your existing account checks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
