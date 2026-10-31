"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Package,
  Truck,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/services/api";

const sellerLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid vendor email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type SellerLoginFormValues = z.infer<typeof sellerLoginSchema>;

function SellerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/seller/dashboard";
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SellerLoginFormValues>({
    resolver: zodResolver(sellerLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const handleAutoFillVendor = () => {
    setValue("email", "bytetech@shopora.com", { shouldValidate: true });
    setValue("password", "Seller@123456", { shouldValidate: true });
    setErrorBanner(null);
    toast.info("Vendor demo credentials auto-filled.");
  };

  const onSubmit = async (data: SellerLoginFormValues) => {
    setErrorBanner(null);

    try {
      const res = await login(data.email.trim(), data.password);

      if (res.user.role === "SELLER") {
        toast.success(`Welcome back, ${res.user.name}! Opening Seller Portal...`);
        const target = redirectUrl.startsWith("/seller") ? redirectUrl : "/seller/dashboard";
        router.push(target);
      } else if (res.user.role === "ADMIN") {
        toast.success(`Welcome Admin ${res.user.name}! Accessing Seller Central view...`);
        const target = redirectUrl.startsWith("/seller") ? redirectUrl : "/seller/dashboard";
        router.push(target);
      } else {
        const warning = "This account is a Customer account. You need a Vendor account to access Seller Central.";
        setErrorBanner(warning);
        toast.warning(warning);
      }
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err);
      setErrorBanner(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-[85vh] bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 py-12 select-none relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-75 bg-brand-deep/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-brand-300 font-semibold mb-1 shadow-sm">
            <Store className="h-3.5 w-3.5 text-brand-400" />
            <span>Shopora Merchant Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vendor Portal Login
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Manage your catalog, orders, logistics dispatches, and daily sales earnings.
          </p>
        </div>

        {/* Demo Fast Fill Pill */}
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="text-slate-300 truncate">
              Demo Vendor: <strong className="text-white">bytetech@shopora.com</strong>
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAutoFillVendor}
            className="text-[11px] h-7 border-slate-700 hover:bg-slate-800 text-brand-300 shrink-0 font-semibold"
          >
            Auto-fill
          </Button>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          {errorBanner && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium leading-relaxed">{errorBanner}</p>
                {errorBanner.includes("Customer account") && (
                  <div className="flex items-center gap-3 pt-1">
                    <Link
                      href="/seller/register"
                      className="text-white font-bold underline hover:text-brand-300"
                    >
                      Register as Vendor
                    </Link>
                    <span>•</span>
                    <Link
                      href="/dashboard"
                      className="text-slate-400 hover:text-white underline"
                    >
                      Go to Customer Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Vendor Email</span>
              </label>
              <input
                type="email"
                placeholder="store-owner@shopora.com"
                {...register("email")}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950/80 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                  errors.email ? "border-rose-500" : "border-slate-800"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-brand-400 hover:text-brand-300 transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs bg-slate-950/80 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                    errors.password ? "border-rose-500" : "border-slate-800"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl bg-linear-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-900/30 gap-2 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating Merchant...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Merchant Central</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Action Links */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3 text-center text-xs">
            <p className="text-slate-400">
              Don&apos;t have a vendor account?{" "}
              <Link
                href="/seller/register"
                className="text-brand-400 font-bold hover:text-brand-300 underline inline-flex items-center gap-1"
              >
                Register your Store
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-slate-500 text-[11px]">
              <Link href="/login" className="hover:text-slate-300 transition">
                Customer Sign In
              </Link>
              <span>•</span>
              <Link href="/" className="hover:text-slate-300 transition">
                Back to Storefront
              </Link>
            </div>
          </div>
        </div>

        {/* Value Proposition Pills */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] text-slate-400">
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center gap-1">
            <Package className="h-3.5 w-3.5 text-sky-400" />
            <span>Product Catalog</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Automated Logistics</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-amber-400" />
            <span>Fast Wallet Payout</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] bg-slate-950 flex flex-col items-center justify-center text-white">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading Vendor Portal...</p>
        </div>
      }
    >
      <SellerLoginForm />
    </Suspense>
  );
}
