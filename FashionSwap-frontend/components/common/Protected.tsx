"use client";

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const router = useRouter();
  const checkAuthCalledRef = useRef(false);

  useEffect(() => {
    // Only force check auth once when entering protected route
    if (!checkAuthCalledRef.current) {
      checkAuthCalledRef.current = true;
      checkAuth(true);
    }
    // Note: Intentionally no dependencies - ref guard prevents double calls
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated (after loading completes)
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show nothing while loading or not authenticated
  if (loading || !isAuthenticated) return null;

  return <>{children}</>;
}
