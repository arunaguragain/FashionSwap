"use client";

import React from 'react';
import DonationForm from './_components/DonationForm';
import Protected from '@/components/common/Protected';

export default function DonationPage() {
  return (
    <Protected>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">Create a donation</h1>
        <p className="mb-6 text-sm text-slate-500">Share a piece of fashion with the marketplace.</p>
        <DonationForm />
      </div>
    </Protected>
  );
}
