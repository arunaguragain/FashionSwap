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
      setSentEmail(data.email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email");
    }
  };

  if (sent) {
    return (
      <div>
        <div className="w-14 h-14 rounded-full bg-sage/15 flex items-center justify-center mb-5">
          <Mail size={24} className="text-sage" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal mb-2" style={{ letterSpacing: "-0.02em" }}>Check your email</h2>
        <p className="text-ink text-sm mb-2">We sent a reset link to</p>
        <p className="font-medium text-charcoal mb-6">{sentEmail}</p>
        <p className="text-xs text-ink mb-6">
          Didn't get it? Check your spam folder, or{" "}
          <button onClick={() => setSent(false)} className="text-terracotta hover:text-terracotta-dark font-medium">try a different email</button>.
        </p>
        <Link href="/login">
          <Button variant="outline" fullWidth>Back to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-2" style={{ letterSpacing: "-0.02em" }}>Forgot your password?</h1>
      <p className="text-ink text-sm mb-6 leading-relaxed">
        Enter your email address and we'll send you a link to reset your password.
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
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  );
}
