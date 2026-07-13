"use client";

import React from 'react';
import Protected from '@/components/common/Protected';

export default function VolunteerDashboardPage() {
  return (
    <Protected>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-semibold">Welcome to FashionSwap</h1>
        <p className="mt-2 text-sm text-slate-500">You can browse listings, manage offers, and keep track of your activity here.</p>
      </div>
    </Protected>
  );
}
