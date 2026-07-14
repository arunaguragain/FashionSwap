"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordData } from "../../(auth)/schema";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "/";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setError("");
    try {
      await forgotPassword(data.email);
      setMessage("We have sent a reset link.");
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email");
    }
  };

  const buttonGradient = "from-blue-600 via-cyan-600 to-blue-700";

  return (
    <div className="p-6 w-full">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Forgot Your Password?</h1>
        <p className="text-slate-500 text-sm">Enter your email address and we'll send a link so you can create a new password.</p>
      </div>

      {message && <div className="mb-4 text-green-600">{message}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            {...register("email")}
            className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
            placeholder="Email Address"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-12 text-sm font-bold rounded-lg bg-gradient-to-r ${buttonGradient} text-white shadow-lg hover:scale-[1.01] active:scale-100 transition-transform`}
        >
          {isSubmitting ? "Sending..." : "SEND LINK"}
        </button>

        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => router.push(from)}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
