"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordData } from "../../(auth)/schema";
import { resetPassword } from "@/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  token?: string;
}

export default function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectiveToken = token || searchParams?.get("token") || undefined;
  const from = searchParams?.get("from") || "/";
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const buttonGradient = "from-blue-600 via-cyan-600 to-blue-700";

  const onSubmit = async (data: ResetPasswordData) => {
    setError("");
    try {
      if (!effectiveToken) throw new Error("Reset token not found");
      await resetPassword(effectiveToken, data.password);
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => router.push(from), 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Set a new password</h1>
        <p className="text-slate-500 text-sm">Create a secure password for your account.</p>
      </div>

      {message && <div className="mb-4 text-green-600">{message}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
            placeholder="New password"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            {...register("confirmPassword")}
            className="w-full h-12 px-4 pr-12 rounded-lg border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
            placeholder="Confirm password"
          />
          <button
            type="button"
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-12 text-sm font-bold rounded-lg bg-gradient-to-r ${buttonGradient} text-white shadow-lg hover:scale-[1.01] transition-transform`}
        >
          {isSubmitting ? "Resetting..." : "RESET PASSWORD"}
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
