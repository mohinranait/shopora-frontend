"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/services/api";

/* ========================================================================== */
/* Zod Validation Schema                                                      */
/* ========================================================================== */

const customerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CustomerFormValues = z.infer<typeof customerSchema>;

/* ========================================================================== */
/* Customer Registration Form Component                                       */
/* ========================================================================== */

function CustomerRegisterForm() {
  const router = useRouter();
  const { registerCustomer } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: true,
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      await registerCustomer({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
      });

      const msg = "Customer account registered successfully! Welcome to Shopora.";
      setSuccessBanner(msg);
      toast.success(msg);

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = getApiErrorMessage(err);
      setErrorBanner(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorBanner && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <p className="leading-relaxed">{errorBanner}</p>
        </div>
      )}

      {successBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <p className="leading-relaxed font-semibold">{successBanner}</p>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="e.g. Tanzim Rahman"
            {...register("name")}
            className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
              errors.name
                ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                : "border-slate-200 bg-white focus:ring-brand focus:border-brand"
            }`}
          />
        </div>
        {errors.name && (
          <p className="text-[11px] text-rose-600 font-medium pl-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              placeholder="email@example.com"
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

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              placeholder="+8801711..."
              {...register("phone")}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
            />
          </div>
        </div>
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min 6 characters"
              {...register("password")}
              className={`w-full h-10 pl-9 pr-8 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.password
                  ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                  : "border-slate-200 bg-white focus:ring-brand focus:border-brand"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-600 font-medium pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Repeat password"
              {...register("confirmPassword")}
              className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.confirmPassword
                  ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                  : "border-slate-200 bg-white focus:ring-brand focus:border-brand"
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-600 font-medium pl-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
          <input
            type="checkbox"
            {...register("agreeTerms")}
            className="h-4 w-4 mt-0.5 rounded border-slate-300 text-brand focus:ring-brand shrink-0"
          />
          <span className="leading-relaxed">
            I agree to Shopora&apos;s{" "}
            <Link href="/terms" className="text-brand font-semibold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand font-semibold hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="text-[11px] text-rose-600 font-medium pl-1 mt-1">
            {errors.agreeTerms.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={isSubmitting}
        className="w-full font-bold text-xs gap-2 h-11 rounded-xl shadow-md shadow-brand/20 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Creating Customer Account...</span>
          </>
        ) : (
          <>
            <span>Create Customer Account</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

/* ========================================================================== */
/* Main Registration Page                                                     */
/* ========================================================================== */

export default function StorefrontRegisterPage() {
  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4 sm:p-6 py-12 select-none">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-deep text-xs font-semibold mb-1">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>Join the Shopora Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Sign up to track orders, save items to your wishlist, and enjoy exclusive deals across Bangladesh.
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <CustomerRegisterForm />
        </div>

        {/* Existing User Link */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-600">
          <span>Already have an account? </span>
          <Link href="/login" className="font-bold text-brand hover:underline">
            Sign In Here →
          </Link>
        </div>

        {/* Separate Vendor Registration Notice */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-xs text-purple-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Want to sell products on Shopora?</p>
              <p className="text-[11px] text-slate-600">Apply to become a verified vendor with your store profile.</p>
            </div>
          </div>
          <Link
            href="/seller/register"
            className="w-full sm:w-auto text-center shrink-0 px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition text-xs shadow-sm shadow-purple-600/20"
          >
            Register as Vendor →
          </Link>
        </div>
      </div>
    </div>
  );
}
