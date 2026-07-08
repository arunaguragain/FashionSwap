"use client";

import React, { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { createListing } from '../../../lib/api';
import { useToast } from '@/app/(platform)/_components/ToastProvider';
import { useRouter } from 'next/navigation';

import Protected from '../../../components/common/Protected';

export default function CreateListing() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return pushToast({ title: 'Title required', tone: 'error' });
    if (!price) return pushToast({ title: 'Price required', tone: 'error' });
    setLoading(true);
    setFieldErrors({});
    try {
      const res = await createListing({ title, price, location });
      pushToast({ title: 'Listing created', tone: 'success' });
      setTitle(''); setPrice(''); setLocation('');
      const id = res?.data?.id || res?.id || res?.data?._id;
      if (id) {
        try { await router.prefetch(`/listings/${id}`); } catch {}
        router.push(`/listings/${id}`);
        return;
      }
      console.log('created', res);
    } catch (e: any) {
      const data = e?.data;
      if (data?.errors && typeof data.errors === 'object') setFieldErrors(data.errors);
      pushToast({ title: 'Create failed', description: e?.message, tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Protected>
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <Input name="title" label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input name="price" type="number" label="Price" required value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')} />
        <Input name="location" label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
      </form>
    </div>
    </Protected>
  );
}
