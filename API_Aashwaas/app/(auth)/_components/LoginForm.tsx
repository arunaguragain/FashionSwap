"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, LoginData } from "../schema";
import { Shield, Heart, Users, Eye, EyeOff } from "lucide-react";
import GoogleSignIn from "./GoogleSignIn";
import { handleLogin } from "@/lib/actions/auth-actions";
import { useToast } from "@/app/(platform)/_components/ToastProvider";

interface LoginFormProps {
  userType: "Admin" | "Donor" | "Volunteer";
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

  const iconMap = { Admin: Shield, Donor: Heart, Volunteer: Users } as const;
  const gradientMap: Record<string, string> = {
    Admin: "from-purple-600 to-violet-600",
    Donor: "from-blue-600 to-cyan-600",
    Volunteer: "from-green-600 to-emerald-600",
  };

  const buttonGradientMap: Record<string, string> = {
    Admin: "from-purple-600 via-violet-600 to-purple-700",
    Donor: "from-blue-600 via-cyan-600 to-blue-700",
    Volunteer: "from-green-600 via-emerald-600 to-green-700",
  };

  const IconComponent = iconMap[userType];
  const headerGradient = gradientMap[userType];
  const buttonGradient = buttonGradientMap[userType];

  const onSubmitForm = async (data: LoginData) => {
    setError("");
    try {
      const res = await handleLogin(data);
      if (!res.success) {
        try { useToast({ title: res.message || 'Login failed', tone: 'error' }); } catch(e) {}
        throw new Error(res.message || "Login failed");
      }
      try { pushToast({ title: res.message || 'Login successful', tone: 'success' }); } catch(e) {}
      if (onSubmit) onSubmit(data);
      
      // Determine redirect path based on user role
      let redirectPath = "/auth/dashboard";
      const userRole = res.data?.role?.toLowerCase();
      
      if (userRole === "donor") {
        redirectPath = "/user/donor/dashboard";
      } else if (userRole === "volunteer") {
        redirectPath = "/user/volunteer/dashboard";
      } else if (userRole === "admin") {
        redirectPath = "/admin/dashboard";
      }
      
      // prefetch the destination so dashboard/home loads faster after login
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
    <div className="w-full max-w-lg mx-auto relative px-4 sm:px-6 lg:px-0">
      <div className="absolute -top-40 -left-40 w-120 h-120 bg-gradient-to-br from-sky-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse hidden md:block"></div>
      <div className="absolute -bottom-40 -right-40 w-104 h-104 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse hidden md:block" style={{ animationDelay: '1.5s' }}></div>
        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
          <div className="h-1.5 bg-gradient-to-r from-sky-400 to-indigo-400"></div>

         
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-sky-100 to-blue-200 rounded-2xl opacity-40 blur-xl transform rotate-12 pointer-events-none"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl opacity-30 blur-xl transform -rotate-12 pointer-events-none"></div>

        <div className="p-5">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${headerGradient} flex items-center justify-center shadow-md transform transition-all hover:scale-105`}>
                <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>

            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 tracking-tight">{userType} Login</h1>
            <p className="text-gray-600 text-xs">
              {userType === "Admin" ? "Secure portal for authorized personnel" : `Sign in to your ${userType.toLowerCase()} account`}
            </p>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmitForm)}>
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder={`${userType.toLowerCase()}@gmail.com`}
                {...register("email")}
                onBlur={() => trigger("email")}
                className={`w-full h-10 px-4 text-xs rounded-xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                  errors.email && (touchedFields.email || isSubmitted) ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-500 focus:ring-2'
                }`}
              />
              {errors.email && (touchedFields.email || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  onBlur={() => trigger("password")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(onSubmitForm)();
                    }
                  }}
                  className={`w-full h-10 px-4 pr-12 text-xs rounded-xl border-2 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white transition-all ${
                    errors.password && (touchedFields.password || isSubmitted) ? 'border-red-400 focus:ring-2 focus:ring-red-500' : 'border-gray-500 focus:ring-2'
                  }`}
                />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (touchedFields.password || isSubmitted) && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div />
              {forgotPasswordLink && (
                <Link href={forgotPasswordLink} className="text-sm text-blue-600">Forgot Password?</Link>
              )}
            </div>

            <button type="submit" disabled={isSubmitting || pending} className={`w-full h-10 text-xs font-bold rounded-xl bg-gradient-to-r ${buttonGradient} text-white focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-transform transform hover:scale-[1.02] active:scale-[0.98] shadow-lg`}>
              {(isSubmitting || pending) ? 'Signing in...' : 'Sign In'}
            </button>

            {userType === "Admin" && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                <div className="flex gap-3 items-start">
                  <div className="bg-purple-600 p-2 rounded-lg shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900 mb-1">Secure Access</p>
                    <p className="text-xs text-gray-600 leading-relaxed">This portal is protected and monitored.</p>
                  </div>
                </div>
              </div>
            )}

            {userType === "Donor" && "volunteer" && (
              <div className="flex items-center gap-3 my-4">
              <span className="h-px bg-gray-500 flex-1"></span>
              <span className="text-sm text-gray-500">Or continue with</span>
              <span className="h-px bg-gray-500 flex-1"></span>
            </div>
            )}
         
            {showGoogleSignIn && <GoogleSignIn userType={userType} autoLogin={true} />}

            {registerLink && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">New to आश्वास? <Link href={registerLink} className="font-bold text-blue-600">Create an account</Link></p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}