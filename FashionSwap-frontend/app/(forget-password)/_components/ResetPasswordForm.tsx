"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordData } from "../../(auth)/schema";
import { resetPassword } from "@/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Check } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface Props {
  token?: string;
}

export default function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectiveToken = token || searchParams?.get("token") || undefined;
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  const onSubmit = async (data: ResetPasswordData) => {
    setError("");
    try {
      if (!effectiveToken) throw new Error("Reset token not found");
      await resetPassword(effectiveToken, data.password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    }
  };

  if (done) {
    return (
      <div>
        <div className="w-16 h-16 rounded-full bg-sage/15 flex items-center justify-center mb-6">
          <Check size={28} className="text-sage" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal mb-3" style={{ letterSpacing: "-0.02em" }}>Password updated</h2>
        <p className="text-ink text-sm mb-8">Your password has been changed successfully. You can now sign in with your new password.</p>
        <Link href="/login">
          <Button fullWidth>Back to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-2" style={{ letterSpacing: "-0.02em" }}>Reset password</h1>
      <p className="text-ink text-sm mb-6">Choose a new password for your account.</p>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          label="New password"
          type={showPassword ? "text" : "password"}
          compact
          placeholder="Min. 8 characters"
          {...register("password")}
          error={errors.password?.message}
          leftIcon={<Lock size={14} />}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink hover:text-charcoal transition-colors">
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
        <Input
          label="Confirm new password"
          type={showConfirm ? "text" : "password"}
          compact
          placeholder="Repeat your new password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          leftIcon={<Lock size={14} />}
          rightElement={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-ink hover:text-charcoal transition-colors">
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Resetting..." : "Set new password"}
        </Button>
      </form>
    </div>
  );
}
