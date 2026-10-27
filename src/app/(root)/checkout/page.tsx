"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  Banknote,
  Check,
  ChevronRight,
  Loader2,
  Lock,
  MapPin,
  ShoppingBag,
  Smartphone,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cartApi } from "@/lib/cart/api";
import { useOrderQuote } from "@/lib/cart/useOrderQuote";
import { formatTaka } from "@/components/cart/CartParts";
import { CouponField, OrderTotals, TrustBadges } from "@/components/cart/OrderSummary";
import type { PaymentMethod } from "@/types";

const DIVISIONS = ["Dhaka", "Chattogram", "Khulna", "Rajshahi", "Barishal", "Sylhet", "Rangpur", "Mymensingh"];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string; icon: React.ReactNode }[] = [
  {
    value: "COD",
    label: "Cash on delivery",
    hint: "Pay in cash when your order arrives",
    icon: <Banknote className="h-5 w-5 text-emerald-600" />,
  },
  {
    value: "BKASH",
    label: "bKash",
    hint: "We'll send payment instructions after you order",
    icon: <Smartphone className="h-5 w-5 text-pink-600" />,
  },
  {
    value: "NAGAD",
    label: "Nagad",
    hint: "We'll send payment instructions after you order",
    icon: <Smartphone className="h-5 w-5 text-orange-600" />,
  },
];

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => /^(?:\+?88)?01[3-9]\d{8}$/.test(v), "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]),
  state: z.string().min(1, "Choose your division"),
  city: z.string().trim().min(2, "Enter your city or district"),
  postalCode: z.string().trim().optional(),
  streetAddress: z.string().trim().min(5, "Enter your house, road and area"),
  notes: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD"]),
});

type CheckoutForm = z.input<typeof checkoutSchema>;
type CheckoutValues = z.output<typeof checkoutSchema>;

const SAVED_ADDRESS_KEY = "shopora_checkout_address";

function Section({
  step,
  title,
  icon,
  children,
}: {
  step: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-base font-bold text-slate-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white">
          {step}
        </span>
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  optional,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="text-xs font-normal text-slate-400">Optional</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
    hasError ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-brand focus:ring-brand/10"
  }`;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, subtotal, totalItems, status, refresh, clear } = useCart();
  const { quote, loading, couponCode, couponRejected, applyCoupon, removeCoupon, lines } = useOrderQuote(items);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutForm, unknown, CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      state: "",
      city: "",
      postalCode: "",
      streetAddress: "",
      notes: "",
      paymentMethod: "COD",
    },
  });

  // Prefill from the last used address, then the signed-in user's profile
  useEffect(() => {
    let saved: Partial<CheckoutForm> = {};
    try {
      saved = JSON.parse(localStorage.getItem(SAVED_ADDRESS_KEY) || "{}");
    } catch {
      saved = {};
    }
    reset((current) => ({
      ...current,
      ...saved,
      fullName: saved.fullName || user?.name || current.fullName,
      phone: saved.phone || user?.phone || current.phone,
      email: saved.email || user?.email || current.email,
      paymentMethod: current.paymentMethod,
    }));
  }, [user, reset]);

  const paymentMethod = watch("paymentMethod");
  const purchasable = items.filter((i) => i.isAvailable && i.inStock);
  const blockingIssue = quote?.issues?.[0]?.message;

  const onSubmit = async (values: CheckoutValues) => {
    if (lines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setSubmitting(true);
    try {
      const order = await cartApi.checkout({
        items: lines,
        shippingAddress: {
          fullName: values.fullName,
          phone: values.phone,
          streetAddress: values.streetAddress,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode || undefined,
          country: "Bangladesh",
        },
        paymentMethod: values.paymentMethod,
        couponCode: quote?.coupon?.code,
        notes: values.notes || undefined,
        guestEmail: !isAuthenticated && values.email ? values.email : undefined,
        guestPhone: values.phone,
      });

      try {
        const { notes: _notes, paymentMethod: _pm, ...address } = values;
        void _notes;
        void _pm;
        localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(address));
        sessionStorage.setItem(
          "shopora_last_order",
          JSON.stringify({
            ...order,
            itemCount: lines.reduce((s, l) => s + l.quantity, 0),
            phone: values.phone,
            address: `${values.streetAddress}, ${values.city}, ${values.state}`,
          })
        );
      } catch {
        // storage unavailable: confirmation page falls back to the order number
      }

      setPlaced(true);
      removeCoupon();
      await clear();
      router.replace(`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't place your order");
      void refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-brand" />
      </div>
    );
  }

  if (!placed && (status === "error" || totalItems === 0)) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
          <ShoppingBag className="h-9 w-9 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Nothing to check out yet</h1>
        <p className="mt-1.5 text-sm text-slate-500">Add some products to your cart first.</p>
        <Link
          href="/products"
          className="mt-6 rounded-xl bg-brand-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-16 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="transition hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link href="/cart" className="transition hover:text-brand">
          Cart
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-slate-800">Checkout</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Lock className="h-3.5 w-3.5 text-emerald-600" /> Secure checkout
        </span>
      </div>

      {!isAuthenticated && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-brand-deep">
          <span>Have an account? Sign in to track your orders and check out faster.</span>
          <Link href="/login?redirect=/checkout" className="font-semibold underline underline-offset-2">
            Sign in
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Section step={1} title="Contact information" icon={<User className="h-4 w-4 text-slate-400" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <input {...register("fullName")} autoComplete="name" placeholder="e.g. Rahim Uddin" className={inputClass(!!errors.fullName)} />
              </Field>
              <Field label="Mobile number" error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  className={inputClass(!!errors.phone)}
                />
              </Field>
              <Field label="Email" optional error={errors.email?.message} className="sm:col-span-2">
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="For order updates"
                  readOnly={isAuthenticated}
                  className={`${inputClass(!!errors.email)} ${isAuthenticated ? "bg-slate-50 text-slate-500" : ""}`}
                />
              </Field>
            </div>
          </Section>

          <Section step={2} title="Delivery address" icon={<MapPin className="h-4 w-4 text-slate-400" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Division" error={errors.state?.message}>
                <select {...register("state")} autoComplete="address-level1" className={inputClass(!!errors.state)}>
                  <option value="">Select division</option>
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="City / District" error={errors.city?.message}>
                <input {...register("city")} autoComplete="address-level2" placeholder="e.g. Dhaka" className={inputClass(!!errors.city)} />
              </Field>
              <Field label="Address" error={errors.streetAddress?.message} className="sm:col-span-2">
                <textarea
                  {...register("streetAddress")}
                  rows={2}
                  autoComplete="street-address"
                  placeholder="House, road, area / thana"
                  className={`${inputClass(!!errors.streetAddress)} resize-none`}
                />
              </Field>
              <Field label="Postal code" optional>
                <input {...register("postalCode")} inputMode="numeric" autoComplete="postal-code" placeholder="e.g. 1212" className={inputClass()} />
              </Field>
              <Field label="Delivery note" optional error={errors.notes?.message}>
                <input {...register("notes")} placeholder="e.g. Call before delivery" className={inputClass(!!errors.notes)} />
              </Field>
            </div>
          </Section>

          <Section step={3} title="Payment method" icon={<Banknote className="h-4 w-4 text-slate-400" />}>
            <div className="grid gap-3" role="radiogroup">
              {PAYMENT_OPTIONS.map((opt) => {
                const selected = paymentMethod === opt.value;
                // The server decides which methods are live (COD for now)
                const enabled = (quote?.paymentMethods ?? ["COD"]).includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                      !enabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                        : selected
                          ? "cursor-pointer border-brand bg-brand-light/60 ring-2 ring-brand/20"
                          : "cursor-pointer border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input type="radio" value={opt.value} disabled={!enabled} {...register("paymentMethod")} className="sr-only" />
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                      {opt.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        {opt.label}
                        {!enabled && (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                            Coming soon
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-slate-500">{enabled ? opt.hint : "Available soon"}</span>
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? "border-brand bg-brand text-white" : "border-slate-300"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                  </label>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-32">
          <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Your order</h2>
              <Link href="/cart" className="text-sm font-semibold text-brand hover:text-brand-deep">
                Edit cart
              </Link>
            </div>

            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {purchasable.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="relative shrink-0">
                    <span className="block h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.variant?.image || item.product?.mainImage}
                        alt={item.product?.name ?? ""}
                        className="h-full w-full object-contain p-1"
                      />
                    </span>
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-medium text-slate-800">{item.product?.name}</span>
                    {item.variant && <span className="block text-xs text-slate-500">{item.variant.title}</span>}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">{formatTaka(item.itemTotal)}</span>
                </li>
              ))}
            </ul>

            <CouponField
              couponCode={couponCode}
              quote={quote}
              rejected={couponRejected}
              loading={loading}
              onApply={applyCoupon}
              onRemove={removeCoupon}
            />

            <OrderTotals quote={quote} fallbackSubtotal={subtotal} loading={loading} />

            {blockingIssue && (
              <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {blockingIssue}. <Link href="/cart" className="font-semibold underline">Update your cart</Link>
                </span>
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !!blockingIssue || lines.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Placing order…
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Place order · {formatTaka(quote?.totalAmount ?? subtotal)}
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              By placing your order you agree to Shopora&apos;s terms and return policy.
            </p>
          </div>
          <TrustBadges />
        </aside>
      </form>
    </div>
  );
}
