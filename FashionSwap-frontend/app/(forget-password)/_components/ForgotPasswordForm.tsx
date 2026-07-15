"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordData } from "../../(auth)/schema";
import { forgotPassword } from "@/lib/api/auth";
import { Mail, Check } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
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
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-2" style={{ letterSpacing: "-0.02em" }}>Forgot your password?</h1>
      <p className="text-ink text-sm mb-6 leading-relaxed">
        Enter your email address and we'll send you a 6-digit OTP to reset your password.
      </p>
      
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          label="Email address"
          type="email"
          compact
          placeholder="priya@example.com"
          {...register("email")}
          error={errors.email?.message}
          leftIcon={<Mail size={14} />}
        />
        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send OTP"}
        </Button>
      </form>
    </div>
  );
}
