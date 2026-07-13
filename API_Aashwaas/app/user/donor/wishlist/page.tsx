"use client";

import React from 'react';
import Protected from '@/components/common/Protected';

export default function WishlistPage() {
  return (
    <Protected>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <p className="mt-2 text-sm text-slate-500">Your saved fashion ideas and next steps will appear here.</p>
      </div>
    </Protected>
  );
}
