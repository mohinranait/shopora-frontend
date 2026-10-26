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
  Store,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/services/api";

/* ========================================================================== */
/* Zod Validation Schemas                                                     */
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

const sellerSchema = z
  .object({
    name: z.string().min(2, "Merchant name must be at least 2 characters long"),
    email: z.string().min(1, "Email is required").email("Please enter a valid business email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    storeName: z.string().min(3, "Store name must be at least 3 characters long"),
    businessAddress: z.string().min(5, "Business address must be at least 5 characters long"),
    storeDescription: z.string().optional(),
    nidOrTradeLicense: z.string().optional(),
    bkashOrNagad: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Vendor Terms and Commission guidelines",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SellerFormValues = z.infer<typeof sellerSchema>;

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
        className="w-full font-bold text-xs gap-2 h-11 rounded-xl shadow-md shadow-brand/20"
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
/* Seller Registration Form Component                                         */
/* ========================================================================== */

function SellerRegisterForm() {
  const router = useRouter();
  const { registerSeller } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      storeName: "",
      businessAddress: "",
      storeDescription: "",
      nidOrTradeLicense: "",
      bkashOrNagad: "",
      password: "",
      confirmPassword: "",
      agreeTerms: true,
    },
  });

  const onSubmit = async (data: SellerFormValues) => {
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      await registerSeller({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone.trim(),
        storeName: data.storeName.trim(),
        businessAddress: data.businessAddress.trim(),
        storeDescription: data.storeDescription?.trim() || undefined,
        nidOrTradeLicense: data.nidOrTradeLicense?.trim() || undefined,
        bkashOrNagad: data.bkashOrNagad?.trim() || undefined,
      });

      const msg = "Vendor store registered successfully! Verification status: Pending.";
      setSuccessBanner(msg);
      toast.success(msg);

      setTimeout(() => {
        router.push("/admin");
      }, 1200);
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

      {/* Owner Full Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Merchant / Owner Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="e.g. Asif Mahmud"
            {...register("name")}
            className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
              errors.name
                ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                : "border-purple-200 bg-white focus:ring-purple-500 focus:border-purple-500"
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
            Business Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              placeholder="store@domain.com"
              {...register("email")}
              className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                  : "border-purple-200 bg-white focus:ring-purple-500 focus:border-purple-500"
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
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              placeholder="+8801711..."
              {...register("phone")}
              className={`w-full h-10 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.phone
                  ? "border-rose-300 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20"
                  : "border-purple-200 bg-white focus:ring-purple-500 focus:border-purple-500"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] text-rose-600 font-medium pl-1">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Store Profile & KYC Box */}
      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3.5 animate-in fade-in duration-150">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-900 border-b border-purple-200 pb-2">
          <Store className="h-4 w-4 text-purple-600" />
          <span>Store Profile &amp; KYC Verification</span>
        </div>

        {/* Store Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Store / Brand Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Apex Tech & Gadgets"
              {...register("storeName")}
              className={`w-full h-9 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.storeName
                  ? "border-rose-300 focus:ring-rose-400 bg-rose-50/20"
                  : "border-purple-200 bg-white focus:ring-purple-500"
              }`}
            />
          </div>
          {errors.storeName && (
            <p className="text-[11px] text-rose-600 font-medium pl-1">
              {errors.storeName.message}
            </p>
          )}
        </div>

        {/* Business Address */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Business / Warehouse Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Shop 412, Multiplan Center, Elephant Road, Dhaka"
              {...register("businessAddress")}
              className={`w-full h-9 pl-9 pr-3 rounded-lg border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                errors.businessAddress
                  ? "border-rose-300 focus:ring-rose-400 bg-rose-50/20"
                  : "border-purple-200 bg-white focus:ring-purple-500"
              }`}
            />
          </div>
          {errors.businessAddress && (
            <p className="text-[11px] text-rose-600 font-medium pl-1">
              {errors.businessAddress.message}
            </p>
          )}
        </div>

        {/* Trade License & Payout Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              NID / Trade License No. (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. TRAD/DSCC/019284"
              {...register("nidOrTradeLicense")}
              className="w-full h-9 px-3 rounded-lg border border-purple-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              bKash / Nagad Wallet for Payouts (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. +8801711..."
              {...register("bkashOrNagad")}
              className="w-full h-9 px-3 rounded-lg border border-purple-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-mono"
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
                  : "border-purple-200 bg-white focus:ring-purple-500 focus:border-purple-500"
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
                  : "border-purple-200 bg-white focus:ring-purple-500 focus:border-purple-500"
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
            className="h-4 w-4 mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 shrink-0"
          />
          <span className="leading-relaxed">
            I agree to Shopora&apos;s{" "}
            <Link href="/terms" className="text-purple-600 font-semibold hover:underline">
              Merchant Agreement
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-purple-600 font-semibold hover:underline">
              Privacy Policy
            </Link>{" "}
            including vendor commission guidelines (8-12%).
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
        size="lg"
        disabled={isSubmitting}
        className="w-full font-bold text-xs gap-2 h-11 rounded-xl shadow-md bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Registering Vendor Store...</span>
          </>
        ) : (
          <>
            <span>Register as Verified Vendor</span>
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
  const [accountType, setAccountType] = useState<"customer" | "seller">("customer");

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
            Choose whether you want to register as a shopper or open a verified vendor store.
          </p>
        </div>

        {/* Account Type Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setAccountType("customer")}
            className={`p-3 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold ${
              accountType === "customer"
                ? "bg-white text-brand shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Customer (Shopper)</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("seller")}
            className={`p-3 rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold ${
              accountType === "seller"
                ? "bg-white text-purple-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Merchant (Be a Vendor)</span>
          </button>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          {accountType === "customer" ? (
            <CustomerRegisterForm />
          ) : (
            <SellerRegisterForm />
          )}
        </div>

        {/* Existing User Link */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-600">
          <span>Already have an account? </span>
          <Link href="/login" className="font-bold text-brand hover:underline">
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
}
