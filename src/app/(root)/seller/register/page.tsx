"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Building2,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Truck,
  Headphones,
  DollarSign,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useRegisterSellerMutation } from "@/redux";
import type { IRegisterSellerPayload, IRegisterSellerResponse } from "@/types";

export default function SellerRegisterPage() {
  const [registerSeller, { isLoading }] = useRegisterSellerMutation();

  const [formData, setFormData] = useState<IRegisterSellerPayload & { confirmPassword: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    storeName: "",
    storeDescription: "",
    businessAddress: "",
    taxNumber: "",
    nidOrTradeLicense: "",
    bankName: "",
    bankAccountNumber: "",
    bankRouting: "",
    bkashOrNagad: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submittedSeller, setSubmittedSeller] = useState<IRegisterSellerResponse["seller"] | null>(null);

  const autoSlug = formData.storeName
    ? formData.storeName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "your-store";

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Please agree to the Shopora Merchant Agreement and Terms.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).");
      return;
    }

    try {
      const payload: IRegisterSellerPayload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: cleanPhone,
        storeName: formData.storeName.trim(),
        storeDescription: formData.storeDescription?.trim() || undefined,
        businessAddress: formData.businessAddress.trim(),
        taxNumber: formData.taxNumber?.trim() || undefined,
        nidOrTradeLicense: formData.nidOrTradeLicense?.trim() || undefined,
        bankName: formData.bankName?.trim() || undefined,
        bankAccountNumber: formData.bankAccountNumber?.trim() || undefined,
        bankRouting: formData.bankRouting?.trim() || undefined,
        bkashOrNagad: formData.bkashOrNagad?.trim() || undefined,
      };

      const result = await registerSeller(payload).unwrap();
      setSubmittedSeller(result.seller);
      toast.success("Seller registration application submitted!");
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to register seller account. Please check your information.";
      toast.error(msg);
    }
  };

  // Success Screen
  if (submittedSeller) {
    const isApproved = submittedSeller.status === "APPROVED";
    return (
      <div className="min-h-[80vh] bg-slate-50/60 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-lg border border-slate-200 p-6 sm:p-8 text-center space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {isApproved ? "Welcome to Shopora!" : "Application Submitted!"}
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isApproved
                ? `Congratulations! Your store "${submittedSeller.storeName}" has been auto-approved and is ready to start publishing products.`
                : `Thank you for applying to sell on Shopora. Your application for "${submittedSeller.storeName}" is under verification by our merchant onboarding team.`}
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Store Name:</span>
              <strong className="text-slate-900 font-semibold">{submittedSeller.storeName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Store URL Preview:</span>
              <span className="font-mono text-brand font-medium">
                shopora.com/vendors/{submittedSeller.storeSlug}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Account Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                  isApproved
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {submittedSeller.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <Link
              href="/seller/login"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-deep px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand"
            >
              <span>Go to Seller Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Join 500+ Verified Bangladeshi Merchants</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Apply to Become a Shopora Vendor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Reach millions of shoppers nationwide with 48-hour delivery, guaranteed transparent platform commissions, and rapid payouts to bank or bKash.
          </p>
        </div>

        {/* Benefits Grid (matching DashboardStats card style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-slate-300">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-brand">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Massive Reach</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Access buyers across 64 districts</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-slate-300">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <Truck className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">48h Delivery</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Express nationwide courier network</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-slate-300">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Weekly Payouts</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct to Bank, bKash or Nagad</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-slate-300">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-600">
              <Headphones className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Dedicated Support</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Merchant account manager</p>
          </div>
        </div>

        {/* Application Form Card (matching ProfileManageTab card style) */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-white p-5 sm:p-8 space-y-8"
        >
          {/* SECTION 1: STORE PROFILE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-brand">
                <Store className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">1. Store & Business Identity</h3>
                <p className="text-xs text-slate-500">Your public storefront details on Shopora</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Store / Shop Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Apex Tech & Gadgets"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Storefront preview:{" "}
                  <span className="font-mono text-brand font-medium">
                    shopora.com/vendors/{autoSlug}
                  </span>
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Physical Business Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.businessAddress}
                  onChange={(e) => handleChange("businessAddress", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Shop 42, Level 3, Multiplan Center, Dhaka"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Store Description / Brand Introduction
              </label>
              <textarea
                rows={2}
                value={formData.storeDescription}
                onChange={(e) => handleChange("storeDescription", e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Briefly describe the categories or genuine products you sell..."
              />
            </div>
          </div>

          {/* SECTION 2: OWNER CREDENTIALS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-brand">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">2. Owner & Merchant Account</h3>
                <p className="text-xs text-slate-500">Login credentials for the seller dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Full Name of Business Owner <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Mohammad Rahim"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="017XXXXXXXX"
                />
                <p className="mt-1 text-[11px] text-slate-400">Used for order alerts and OTP verification</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="merchant@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="w-full h-10 rounded-md border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                      placeholder="Min 6 chars"
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
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Confirm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: KYC & LEGAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-brand">
                <FileCheck2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">3. Verification &amp; Legal Compliance</h3>
                <p className="text-xs text-slate-500">Government identity &amp; trade license information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  National ID (NID) or Trade License No.
                </label>
                <input
                  type="text"
                  value={formData.nidOrTradeLicense}
                  onChange={(e) => handleChange("nidOrTradeLicense", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. 19901234567890 or TL-DH-12345"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Tax Identification Number (TIN / BIN)
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => handleChange("taxNumber", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. 123456789012"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: PAYOUT & BANK */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-brand">
                <CreditCard className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">4. Payout &amp; Bank Account Details</h3>
                <p className="text-xs text-slate-500">Where Shopora will disburse your wallet withdrawals</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. City Bank / Brac Bank / Dutch-Bangla"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. 150293847501"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Branch Name or Routing Number
                </label>
                <input
                  type="text"
                  value={formData.bankRouting}
                  onChange={(e) => handleChange("bankRouting", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Gulshan Branch / Routing 225261452"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  bKash / Nagad Merchant or Personal Number
                </label>
                <input
                  type="text"
                  value={formData.bkashOrNagad}
                  onChange={(e) => handleChange("bkashOrNagad", e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="e.g. 017XXXXXXXX (bKash)"
                />
              </div>
            </div>
          </div>

          {/* AGREEMENT & SUBMIT */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the{" "}
                <Link href="/vendor-rules" className="font-semibold text-brand hover:underline">
                  Shopora Vendor Agreement
                </Link>
                , platform commission structure, and confirm that all submitted documents and information are accurate.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">
                Already registered as a vendor?{" "}
                <Link href="/seller/login" className="font-semibold text-brand hover:underline">
                  Sign in here
                </Link>
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-brand-deep px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-brand disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                <span>Submit Vendor Application</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
