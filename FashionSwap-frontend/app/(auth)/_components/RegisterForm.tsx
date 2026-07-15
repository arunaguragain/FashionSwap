"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import GoogleSignIn from "./GoogleSignIn";
import { registerSchema, RegisterData } from "../schema";
import { handleRegister, handleVerifyEmail } from "@/lib/actions/auth-actions";
import { useToast } from "@/app/(platform)/_components/ToastProvider";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Props {
  userType: "Admin" | "User";
  onSubmit?: (values: RegisterData) => void;
  loginLink?: string;
}

export default function RegisterForm({ userType, onSubmit, loginLink }: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpPending, setOtpPending] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [pending, startTransition] = useTransition();

  let pushToast = (notification: any) => {};
  try {
    pushToast = useToast;
  } catch (e) {
    pushToast = (notification: any) => console.log('toast', notification);
  }

  const [passwordValue, setPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting, touchedFields, isSubmitted }
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", location: "", password: "", confirmPassword: "", tos: false }
  });

  const watchedPassword = watch("password", "");

  const passwordStrength = useMemo(() => {
    const value = watchedPassword || passwordValue;
    if (!value) return { label: "", color: "text-ink/60" };

    const checks = [
      value.length >= 12,
      /[A-Z]/.test(value),
      /[a-z]/.test(value),
      /[0-9]/.test(value),
      /[^A-Za-z0-9]/.test(value),
    ];

    const score = checks.filter(Boolean).length;
    if (score <= 2) return { label: "Weak", color: "text-red-600" };
    if (score <= 4) return { label: "Medium", color: "text-amber-600" };
    return { label: "Strong", color: "text-emerald-600" };
  }, [watchedPassword, passwordValue]);

  const onSubmitForm = async (data: RegisterData) => {
    setErrorMessage("");
    try {
      // Minimal: send form data; backend should treat new users as allowed to buy and create listings
      const res = await handleRegister(data);
      if (!res.success) {
        try { pushToast({ title: res.message || 'Registration failed', tone: 'error' }); } catch(e) {}
        throw new Error(res.message || "Registration failed");
      }
      try { pushToast({ title: res.message || 'Registration successful', tone: 'success' }); } catch(e) {}
      // If backend queued verification, show OTP entry UI instead of redirecting
      setSubmittedEmail(data.email);
      setOtpPending(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration failed");
      try { pushToast({ title: err?.message || 'Registration failed', tone: 'error' }); } catch(e) {}
    }
  };

  const verifyOtp = async () => {
    setOtpMessage("");
    try {
      const res = await handleVerifyEmail(submittedEmail, otpValue);
      if (!res.success) {
        setOtpMessage(res.message || 'Verification failed');
        return;
      }
      try { pushToast({ title: res.message || 'Verification successful', tone: 'success' }); } catch(e) {}
      // after verification redirect to login
      startTransition(() => {
        if (loginLink) router.push(loginLink);
        else router.push('/login');
      });
    } catch (err: any) {
      setOtpMessage(err?.message || 'Verification failed');
    }
  };

  if (otpPending) {
    return (
      <div className="space-y-2.5">
        <div className="text-sm text-ink">A verification code was sent to <strong>{submittedEmail}</strong>. Enter the 6-digit code below.</div>
        <div>
          <label className="font-medium text-charcoal text-xs">Verification code</label>
          <div className="relative">
            <input value={otpValue} onChange={(e) => setOtpValue(e.target.value)} placeholder="123456" className="w-full bg-white border px-3 py-2 rounded-[10px]" />
          </div>
          {otpMessage && <p className="mt-1 text-xs text-red-600">{otpMessage}</p>}
        </div>
        <div className="flex gap-2">
          <Button onClick={verifyOtp} size="md">Verify</Button>
          <Button onClick={() => { setOtpPending(false); setOtpValue(''); }} size="md" variant="secondary">Back</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-2.5">
      {errorMessage && <div className="text-red-500 text-xs mb-1">{errorMessage}</div>}
      
      <div className="grid grid-cols-2 gap-2">
        <Input 
          label="First name" 
          type="text" 
          compact
          {...register("firstName")} 
          onBlur={() => trigger("firstName")}
          error={errors.firstName?.message} 
          placeholder="Priya" 
          leftIcon={<User size={14} />} 
        />
        <Input 
          label="Last name" 
          type="text" 
          compact
          {...register("lastName")} 
          onBlur={() => trigger("lastName")}
          error={errors.lastName?.message} 
          placeholder="Maharjan" 
        />
      </div>
      
      <Input 
        label="Email address" 
        type="email" 
        compact
        {...register("email")} 
        onBlur={() => trigger("email")}
        error={errors.email?.message} 
        placeholder="priya@example.com" 
        leftIcon={<Mail size={14} />} 
      />
      
      <div className="grid grid-cols-2 gap-2">
        <Input 
          label="Phone number" 
          type="tel" 
          compact
          {...register("phone")} 
          onBlur={() => trigger("phone")}
          error={errors.phone?.message} 
          placeholder="9800000000" 
        />
        <Input
          label="Location"
          type="text"
          compact
          {...register("location")}
          onBlur={() => trigger("location")}
          error={errors.location?.message}
          placeholder="Kathmandu, Nepal"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            compact
            {...register("password", {
              onChange: (event) => {
                setPasswordValue(event.target.value);
              },
            })}
            onBlur={() => trigger("password")}
            error={errors.password?.message}
            placeholder="Min. 12 characters"
            leftIcon={<Lock size={14} />}
            rightElement={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink hover:text-charcoal transition-colors">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          {passwordStrength.label && (
            <p className={`mt-1 text-[11px] font-medium ${passwordStrength.color}`}>
              Strength: {passwordStrength.label}
            </p>
          )}
        </div>
        <Input
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          compact
          {...register("confirmPassword")}
          onBlur={() => trigger("confirmPassword")}
          error={errors.confirmPassword?.message}
          placeholder="Re-enter password"
          leftIcon={<Lock size={14} />}
          rightElement={
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-ink hover:text-charcoal transition-colors">
              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
      </div>
      
      <div>
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input type="checkbox" {...register("tos")} className="w-3.5 h-3.5 rounded border-border text-terracotta focus:ring-terracotta/30" />
          <span className="text-[11px] text-ink">I agree to the <a href="/terms" className="text-terracotta font-medium hover:text-terracotta-dark">Terms & Conditions</a> and <a href="/privacy" className="text-terracotta font-medium hover:text-terracotta-dark">Privacy Policy</a></span>
        </label>
        {errors.tos && <p className="mt-1 text-xs text-red-600">{errors.tos.message}</p>}
      </div>

      <Button type="submit" fullWidth size="lg" disabled={isSubmitting || pending}>
        {(isSubmitting || pending) ? "Creating..." : "Create account"}
      </Button>

      <div className="my-3 flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-[11px] text-ink">or sign up with</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <GoogleSignIn userType={userType} autoLogin={false} />
    </form>
  );
}