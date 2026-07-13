"use client";

import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Link from 'next/link';
import { login } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const { pushToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // basic client-side validation
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
      console.log('login success', res);
      pushToast({ title: 'Signed in', tone: 'success' });
      // redirect based on role if available
      const role = res?.data?.role?.toLowerCase?.();
      let path = '/listings';
      if (role === 'admin') path = '/admin/dashboard';
      else if (role === 'buyer' || role === 'seller') path = '/profile';
      try { await router.prefetch(path); } catch {}
      router.push(path);
    } catch (err: any) {
      const data = err?.data;
      if (data?.errors && typeof data.errors === 'object') {
        // assume { field: message }
        setFieldErrors(data.errors);
      }
      setError(err.message || 'Login failed');
      pushToast({ title: 'Sign in failed', description: err?.message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="email" type="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          <Input name="password" type="password" label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          {error && <div className="text-red-600">{error}</div>}
          <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account? <Link href="/register" className="text-blue-600">Register</Link>
        </p>
      </div>
    </div>
  );
}
