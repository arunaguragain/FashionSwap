"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/(platform)/_components/ToastProvider';

export default function DonationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!itemName.trim()) nextErrors.itemName = 'Item name is required.';
    if (!quantity || Number.isNaN(Number(quantity))) nextErrors.quantity = 'Quantity must be a number.';
    if (!pickupLocation.trim()) nextErrors.pickupLocation = 'Pickup location is required.';
    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    pushToast({ title: 'Donation added successfully!', tone: 'success' });
    const wishlistId = searchParams?.get?.('wishlistId');
    if (wishlistId) {
      router.push('/user/donor/wishlist');
      return;
    }
    router.push('/profile');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="itemName" className="mb-1 block text-sm font-medium text-slate-700">Item name</label>
        <input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.itemName ? <p className="mt-1 text-sm text-red-600">{errors.itemName}</p> : null}
      </div>
      <div>
        <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-700">Quantity</label>
        <input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.quantity ? <p className="mt-1 text-sm text-red-600">{errors.quantity}</p> : null}
      </div>
      <div>
        <label htmlFor="pickupLocation" className="mb-1 block text-sm font-medium text-slate-700">Pickup location</label>
        <input id="pickupLocation" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        {errors.pickupLocation ? <p className="mt-1 text-sm text-red-600">{errors.pickupLocation}</p> : null}
      </div>
      <div>
        <label htmlFor="uploadImage" className="mb-1 block text-sm font-medium text-slate-700">Upload Image</label>
        <input id="uploadImage" type="file" accept="image/*" onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Add Donation</button>
    </form>
  );
}
