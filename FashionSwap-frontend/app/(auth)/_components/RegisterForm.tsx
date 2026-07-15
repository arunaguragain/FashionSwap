"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import GoogleSignIn from "./GoogleSignIn";
import { registerSchema, RegisterData } from "../schema";
import { handleRegister } from "@/lib/actions/auth-actions";
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
  const [pending, startTransition] = useTransition();

  let pushToast = (notification: any) => {};
  try {
    pushToast = useToast;
  } catch (e) {
    pushToast = (notification: any) => console.log('toast', notification);
  }

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, touchedFields, isSubmitted }
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", location: "", password: "", confirmPassword: "", tos: false }
  });

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
      startTransition(() => {
        if (loginLink) {
          router.push(loginLink);
        } else if (userType === "User") {
          router.push("/login");
        } else {
          router.push("/");
        }
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration failed");
      try { pushToast({ title: err?.message || 'Registration failed', tone: 'error' }); } catch(e) {}
    }
  };

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
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          compact
          {...register("password")}
          onBlur={() => trigger("password")}
          error={errors.password?.message}
          placeholder="Min. 8 characters"
          leftIcon={<Lock size={14} />}
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink hover:text-charcoal transition-colors">
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
        />
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