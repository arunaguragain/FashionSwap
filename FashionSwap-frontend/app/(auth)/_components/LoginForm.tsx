"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, LoginData } from "../schema";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import GoogleSignIn from "./GoogleSignIn";
import { handleLogin } from "@/lib/actions/auth-actions";
import { reactivateAccount } from '@/lib/api';
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
  const { checkAuth } = useAuth();
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { pushToast } = useToast();

  useEffect(() => {
    // Ensure CSRF token is set before user submits the form
    fetch('/api/csrf').catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting, touchedFields, isSubmitted }
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" }
  });

  const [reactivating, setReactivating] = useState(false);

  const onSubmitForm = async (data: LoginData) => {
    setError("");
    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }
    try {
      const res = await handleLogin({ ...data, captchaToken });
      if (!res.success) {
        try { pushToast({ title: res.message || 'Login failed', tone: 'error' }); } catch(e) {}
        throw new Error(res.message || "Login failed");
      }

      if (res.data?.mfaRequired) {
        try { pushToast({ title: 'MFA required', description: 'Enter the code from your authenticator app.', tone: 'info' }); } catch(e) {}
        if (typeof window !== 'undefined' && res.data.sessionToken) {
          window.localStorage.setItem('mfaSessionToken', res.data.sessionToken);
        }
        router.push('/mfa/verify');
        return;
      }

      try { pushToast({ title: res.message || 'Login successful', tone: 'success' }); } catch(e) {}
      
      // Update global auth state immediately with response data
      if (res.data) {
        // checkAuth will be forced after navigation
        await checkAuth(true);
      }

      if (onSubmit) onSubmit(data);
      
      let redirectPath = "/listings";
      const userRole = res.data?.role?.toLowerCase();
      
      if (userRole === "user") {
        redirectPath = "/profile";
      } else if (userRole === "admin") {
        redirectPath = "/admin";
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

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      const email = getValues('email');
      const pw = getValues('password') || '';
      if (!email || !pw) {
        setError('Please enter your email and password to reactivate');
        setReactivating(false);
        return;
      }
      const res = await reactivateAccount(email, pw);
      if (!res || !res.success) {
        setError(res?.message || 'Reactivation failed');
        setReactivating(false);
        return;
      }
      try { pushToast({ title: res.message || 'Account reactivated. Please log in.', tone: 'success' }); } catch(e) {}
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Reactivation failed');
    } finally {
      setReactivating(false);
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

      {/* Show reactivate option when account is deactivated */}
      {error && error.toLowerCase().includes('deactivated') && (
        <div className="mt-2">
          <Button type="button" fullWidth size="md" onClick={handleReactivate} disabled={reactivating} className="!bg-amber-600">
            {reactivating ? 'Reactivating...' : 'Reactivate account'}
          </Button>
        </div>
      )}

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