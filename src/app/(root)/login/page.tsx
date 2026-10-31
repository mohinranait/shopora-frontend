"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  Store,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/services/api";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // Quick Demo Auto-fill for Customer
  const handleAutoFillCustomer = () => {
    setValue("email", "rahim@shopora.com", { shouldValidate: true });
    setValue("password", "Customer@123456", { shouldValidate: true });
    setErrorBanner(null);
    toast.info("Customer demo credentials auto-filled.");
  };

  const onSubmit = async (data: LoginFormValues) => {
    setErrorBanner(null);

    try {
      const res = await login(data.email.trim(), data.password);

      // Block SELLER accounts from customer login
      if (res.user.role === "SELLER") {
        // Clear auth tokens since this portal is customer-only
        localStorage.removeItem("shopora_token");
        localStorage.removeItem("shopora_refresh_token");
        localStorage.removeItem("shopora_user");
        document.cookie = "shopora_token=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "shopora_role=; path=/; max-age=0; SameSite=Lax";

        const warning = "Vendor accounts cannot sign in through the customer login portal. Please use the dedicated Seller Login page.";
        setErrorBanner(warning);
        toast.warning(warning);
        return;
      }

      toast.success(`Welcome back, ${res.user.name}!`);

      // Smart Redirect based on user role
      if (res.user.role === "ADMIN") {
        router.push(redirectUrl.startsWith("/admin") ? redirectUrl : "/admin");
      } else {
        const target =
          redirectUrl.startsWith("/admin") || redirectUrl.startsWith("/seller")
            ? "/dashboard"
            : redirectUrl === "/"
            ? "/dashboard"
            : redirectUrl;
        router.push(target);
      }
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err);
      setErrorBanner(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4 sm:p-6 py-12 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-deep text-xs font-semibold mb-1">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>Welcome to Shopora</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Manage your orders, fast-track checkout, and discover verified deals.
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          {errorBanner && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="leading-relaxed font-medium">{errorBanner}</p>
                {errorBanner.includes("Vendor accounts") && (
                  <div className="pt-1">
                    <Link
                      href="/seller/login"
                      className="inline-flex items-center gap-1.5 font-bold text-purple-700 hover:text-purple-800 underline"
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>Go to Seller Login Portal →</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email")}
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                    errors.email
                      ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                      : "border-slate-200 bg-white focus:ring-brand focus:border-brand"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-medium pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-brand hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full h-10 pl-9 pr-10 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                    errors.password
                      ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                      : "border-slate-200 bg-white focus:ring-brand focus:border-brand"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600 font-medium pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="brand"
              size="lg"
              disabled={isSubmitting}
              className="w-full font-bold text-xs gap-2 shadow-md shadow-brand/20 h-11 rounded-xl cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Customer Login */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick Demo Account
            </p>
            <button
              type="button"
              onClick={handleAutoFillCustomer}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-brand bg-slate-50 hover:bg-brand-light/40 text-left transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-sky-100 text-brand flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Demo Customer</p>
                  <p className="text-[10px] text-slate-500">rahim@shopora.com • Customer@123456</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-brand group-hover:underline pr-1">
                Auto-fill
              </span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-600">
          <span>New to Shopora? </span>
          <Link href="/register" className="font-bold text-brand hover:underline">
            Create a Customer Account →
          </Link>
        </div>

        {/* Vendor Portal Link */}
        <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-3.5 text-center text-xs text-purple-900 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 text-left">
            <Store className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="font-medium text-slate-700">Are you a merchant?</span>
          </div>
          <Link
            href="/seller/login"
            className="font-bold text-purple-700 hover:text-purple-800 hover:underline shrink-0"
          >
            Vendor Portal Login →
          </Link>
        </div>

        {/* Benefits Trust Row */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500 pt-1">
          <div className="flex flex-col items-center gap-1">
            <Truck className="h-4 w-4 text-brand" />
            <span>Fast Nationwide Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Genuine Products</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <RotateCcw className="h-4 w-4 text-purple-600" />
            <span>Easy 7-Day Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 text-brand animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
