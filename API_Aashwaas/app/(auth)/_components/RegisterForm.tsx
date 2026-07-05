"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Users, Eye, EyeOff } from "lucide-react";
import GoogleSignIn from "./GoogleSignIn";
import { registerSchema, RegisterData } from "../schema";
import { handleRegister } from "@/lib/actions/auth-actions";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

interface Props {
  userType: "Admin" | "Donor" | "Volunteer";
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
    watch,
    trigger,
    setError,
    formState: { errors, isSubmitting, touchedFields, isSubmitted }
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", tos: false }
  });

  const buttonGradientMap: Record<string, string> = {
    Admin: "from-purple-600 via-violet-600 to-purple-700",
    Donor: "from-blue-600 via-cyan-600 to-blue-700",
    Volunteer: "from-green-600 via-emerald-600 to-green-700",
  };

  const buttonGradient = buttonGradientMap[userType];

  const onSubmitForm = async (data: RegisterData) => {
    setErrorMessage("");
    try {
      // Ensure role is set for Volunteer
      const res = await handleRegister(
        userType === "Volunteer" ? { ...data, role: "volunteer" } : data
      );
      if (!res.success) {
        // show error toast and set error message
        try { pushToast({ title: res.message || 'Registration failed', tone: 'error' }); } catch(e) {}
        throw new Error(res.message || "Registration failed");
      }
      try { pushToast({ title: res.message || 'Registration successful', tone: 'success' }); } catch(e) {}
      startTransition(() => {
        if (loginLink) {
          router.push(loginLink);
        } else if (userType === "Donor") {
          router.push("/donor_login");
        } else if (userType === "Volunteer") {
          router.push("/volunteer_login");
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
    <div className="w-full max-w-xl mx-auto relative px-4 sm:px-6 lg:px-0">
      <div className="absolute -top-44 -left-44 w-40 h-40 bg-gradient-to-br from-sky-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-45 animate-pulse hidden lg:block"></div>
      <div className="absolute -bottom-40 -right-40 w-36 h-36 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-pulse hidden lg:block" style={{ animationDelay: '1.5s' }}></div>
      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-sky-400 to-indigo-400"></div>
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl opacity-40 blur-2xl transform rotate-12 pointer-events-none hidden lg:block"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl opacity-30 blur-2xl transform -rotate-12 pointer-events-none hidden lg:block"></div>
        <div className="p-5 lg:p-6">
          <div className="text-center mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 tracking-tight">Create {userType} Account</h1>
            <p className="text-gray-600 text-xs">Fill in details to get started</p>
          </div>

          {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmitForm)}>
            <div>
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</label>
              <input id="name" {...register("name")} onBlur={() => trigger("name")} className={`w-full h-10 px-4 text-xs rounded-xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.name && (touchedFields.name || isSubmitted) ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-600 focus:ring-2'}`} placeholder="Aruna Guragain" />
              {errors.name && (touchedFields.name || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.name?.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
              <input id="email" type="email" {...register("email")} onBlur={() => trigger("email")} className={`w-full h-10 px-4 text-xs rounded-xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.email && (touchedFields.email || isSubmitted) ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-600 focus:ring-2'}`} placeholder="abc@example.com" />
              {errors.email && (touchedFields.email || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.email?.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</label>
              <input id="phone" type="tel" {...register("phone")} onBlur={() => trigger("phone")} className={`w-full h-10 px-4 text-xs rounded-xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.phone && (touchedFields.phone || isSubmitted) ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-600 focus:ring-2'}`} placeholder="9800000000" />
              {errors.phone && (touchedFields.phone || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.phone?.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} {...register("password")} onBlur={() => trigger("password")} className={`w-full h-10 px-4 pr-12 text-xs rounded-xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.password && (touchedFields.password || isSubmitted) ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-600 focus:ring-2'}`} placeholder="Create a strong password" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
              {errors.password && (touchedFields.password || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.password?.message}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-2 block">Confirm Password</label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} onBlur={() => trigger("confirmPassword")} className={`w-full h-10 px-4 pr-12 text-xs rounded-xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${errors.confirmPassword && (touchedFields.confirmPassword || isSubmitted) ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-600 focus:ring-2'}`} placeholder="Re-enter your password" />
                <button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (touchedFields.confirmPassword || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword?.message}</p>}
            </div>
            <div>
              <label className="flex items-start gap-3">
                <input id="tos" type="checkbox" {...register("tos")} className="mt-1 w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-600">I agree to the <a href="/terms" className="text-blue-600 font-medium">Terms & Conditions</a> and <a href="/privacy" className="text-blue-600 font-medium">Privacy Policy</a></span>
              </label>
              {errors.tos && (touchedFields.tos || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.tos?.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <button type="submit" disabled={isSubmitting || pending} className={`w-full h-10 text-xs font-bold rounded-xl bg-gradient-to-r ${buttonGradient} text-white focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}>{(isSubmitting || pending) ? 'Creating...' : 'Create Account'}</button>
            </div>

            <div className="flex items-center gap-3 my-4">
              <span className="h-px bg-gray-500 flex-1"></span>
              <span className="text-sm text-gray-500">Or continue with</span>
              <span className="h-px bg-gray-500 flex-1"></span>
            </div>

            <GoogleSignIn userType={userType} autoLogin={false} />

            {loginLink && (
              <div className="mt-4 text-center text-sm text-gray-600">Already have an account? <a href={loginLink} className="text-blue-600 font-medium">Login</a></div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}