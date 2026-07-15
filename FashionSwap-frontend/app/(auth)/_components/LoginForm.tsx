"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, LoginData } from "../schema";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import GoogleSignIn from "./GoogleSignIn";
import { handleLogin } from "@/lib/actions/auth-actions";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ReCaptcha from "@/components/ui/ReCaptcha";

interface LoginFormProps {
  userType: "Admin" | "User";
  onSubmit?: (values: LoginData) => void;
  registerLink?: string;
  forgotPasswordLink?: string;
  showGoogleSignIn?: boolean;
}

export default function LoginForm({
  userType,
  onSubmit,
  registerLink,
  forgotPasswordLink = "/forgot-password",
  showGoogleSignIn = false
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  let pushToast: any = () => {};
  try {
    pushToast = useToast;
  } catch (e) {
    pushToast = (t: any) => console.log('toast', t);
  }

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, touchedFields, isSubmitted }
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" }
  });

  const onSubmitForm = async (data: LoginData) => {
    setError("");
    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }
    try {
      const res = await handleLogin({ ...data, captchaToken });
      if (!res.success) {
        try { useToast({ title: res.message || 'Login failed', tone: 'error' }); } catch(e) {}
        throw new Error(res.message || "Login failed");
      }
      try { pushToast({ title: res.message || 'Login successful', tone: 'success' }); } catch(e) {}
      if (onSubmit) onSubmit(data);
      
      let redirectPath = "/listings";
      const userRole = res.data?.role?.toLowerCase();
      
      if (userRole === "buyer" || userRole === "seller") {
        redirectPath = "/profile";
      } else if (userRole === "admin") {
        redirectPath = "/admin/dashboard";
      }
      
      await router.prefetch(redirectPath);
      startTransition(() => {
        router.push(redirectPath);
      });
    } catch (err: any) {
      setError(err?.message || "Login failed");
      try { pushToast({ title: err?.message || 'Login failed', tone: 'error' }); } catch(e) {}
    }
  };

  return (
    <form className="space-y-2.5" onSubmit={handleSubmit(onSubmitForm)}>
      {error && <div className="text-red-500 text-xs mb-1">{error}</div>}
      
      <Input
        label="Email address"
        type="email"
        compact
        placeholder="priya@example.com"
        {...register("email")}
        onBlur={() => trigger("email")}
        error={errors.email?.message}
        leftIcon={<Mail size={14} />}
      />
      
      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        compact
        placeholder="Your password"
        {...register("password")}
        onBlur={() => trigger("password")}
        error={errors.password?.message}
        leftIcon={<Lock size={14} />}
        rightElement={
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink hover:text-charcoal transition-colors">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        }
      />
      
      <div className="flex justify-end">
        {forgotPasswordLink && (
          <Link href={forgotPasswordLink} className="text-xs text-ink hover:text-terracotta transition-colors">
            Forgot password?
          </Link>
        )}
      </div>

      <div className="flex justify-start w-full">
        <ReCaptcha 
          onVerify={(token) => { setCaptchaToken(token); setError(""); }} 
          onExpire={() => setCaptchaToken(null)}
          onError={() => setError("CAPTCHA error. Please try again.")}
        />
      </div>

      <Button type="submit" fullWidth size="lg" disabled={isSubmitting || pending || !captchaToken}>
        {(isSubmitting || pending) ? "Signing in..." : "Sign in"}
      </Button>

      {userType !== "Admin" && (
        <div className="my-4 flex items-center gap-4">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-ink">or continue with</span>
          <div className="flex-1 border-t border-border" />
        </div>
      )}

      {showGoogleSignIn && userType !== "Admin" && <GoogleSignIn userType={userType} autoLogin={true} />}
    </form>
  );
}