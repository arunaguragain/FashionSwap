"use client";

import { Suspense } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordFormSuspense() {
  return (
    <Suspense fallback={<div className="bg-white rounded-[24px] border border-border p-8 text-sm text-ink animate-pulse">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
