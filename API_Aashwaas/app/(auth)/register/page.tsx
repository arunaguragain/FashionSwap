"use client";

import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Link from 'next/link';
import { register } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/(platform)/_components/ToastProvider';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useToast();
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // basic client-side validation
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
      console.log('register success', res);
      pushToast({ title: 'Account created', tone: 'success' });
      // redirect to MFA if required, else to login
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" type="text" label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          <Input name="email" type="email" label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          <Input name="password" type="password" label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          {error && <div className="text-red-600">{error}</div>}
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
