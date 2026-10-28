"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/services/api";

const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please provide a valid administrative email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
  rememberMe: z.boolean(),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // 1-Click Auto-fill Demo Admin Credentials
  const handleAutoFill = () => {
    setValue("email", "admin@shopora.com", { shouldValidate: true });
    setValue("password", "Admin@123456", { shouldValidate: true });
    setErrorBanner(null);
    toast.info("Super Admin demo credentials auto-filled.");
  };

  const onSubmit = async (data: AdminLoginFormValues) => {
    setErrorBanner(null);

    try {
      const res = await login(data.email.trim(), data.password);

      // Verify Admin Role Enforcement
      if (res.user.role !== "ADMIN") {
        const errorMsg = "Access Denied: Only accounts with Super Admin privileges can access this portal.";
        setErrorBanner(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success(`Welcome back, ${res.user.name}! Access granted.`);
      router.push(redirectUrl);
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err);
      setErrorBanner(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-deep/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand & Security Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-sky-400 font-semibold mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Shopora Security Protocol</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-brand-deep flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Shopora</span>
            <Badge variant="brand" className="text-[10px] font-bold px-1.5 py-0.5">
              ADMIN
            </Badge>
          </div>

          <h1 className="text-lg font-bold text-white tracking-tight pt-1">
            Sign In to Command Center
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized administrative staff only. Multi-vendor governance &amp; platform audit.
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 space-y-5">
          {/* Error Banner */}
          {errorBanner && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <p className="leading-relaxed">{errorBanner}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-200">
                Administrator Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="admin@shopora.com"
                  className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 font-mono transition ${
                    errors.email
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:ring-brand"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-200">
                  Security Password <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">2FA Verified</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••••••"
                  className={`w-full h-10 pl-9 pr-10 rounded-lg border bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 font-mono transition ${
                    errors.password
                      ? "border-rose-500 focus:ring-rose-500"
                      : "border-slate-700 focus:ring-brand"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-brand"
                />
                <span>Remember this terminal session</span>
              </label>

              <span className="text-[11px] text-slate-500">Encrypted</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="brand"
              size="lg"
              disabled={isSubmitting}
              className="w-full font-bold text-xs gap-2 h-11 rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Enter Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill Pill */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleAutoFill}
              className="w-full py-2 px-3 rounded-lg border border-slate-800 hover:border-sky-500/50 bg-slate-950/60 hover:bg-slate-950 text-xs text-slate-300 hover:text-white transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-medium">Auto-fill Super Admin Demo Credentials</span>
              </div>
              <Badge variant="warning" className="text-[9px] py-0 px-1 font-mono">
                Admin@123456
              </Badge>
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
