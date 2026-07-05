"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function ForgetPasswordLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-50 overflow-hidden">
      <header className="w-full bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="logo" className="h-10" />
          </div>

          <div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="flex items-start justify-center w-full py-4 px-0">
        {children}
      </main>
    </div>
  );
}
