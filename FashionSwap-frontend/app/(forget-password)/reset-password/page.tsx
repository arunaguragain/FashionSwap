"use client";
import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ResetPasswordFormSuspense from "../_components/ResetPasswordFormSuspense";

export default function Page() {
  return (
    <div className="h-screen bg-parchment flex overflow-hidden">
      {/* Left panel — image */}
      <div className="hidden lg:block lg:w-[45%] h-full relative bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=1200&fit=crop&auto=format"
          alt="Fashion"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-display text-2xl font-bold text-parchment leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Pre-loved fashion, new stories.
          </p>
          <p className="text-parchment/60 text-sm mt-3">Buy and sell second-hand fashion directly in your city.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="flex flex-col justify-center min-h-full px-6 py-8 max-w-md mx-auto w-full">
          <div className="mb-6">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>

          <ResetPasswordFormSuspense />
        </div>
      </div>
    </div>
  );
}
