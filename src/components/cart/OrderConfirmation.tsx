"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, MapPin, Package, Phone, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatTaka } from "./CartParts";

interface StoredOrder {
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  paymentMethod: string;
  itemCount?: number;
  phone?: string;
  address?: string;
}

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Cash on delivery",
  BKASH: "bKash",
  NAGAD: "Nagad",
};

const subscribe = () => () => {};
const readStored = () => {
  try {
    return sessionStorage.getItem("shopora_last_order");
  } catch {
    return null;
  }
};

export function OrderConfirmation({ orderNumber }: { orderNumber: string }) {
  const raw = useSyncExternalStore(subscribe, readStored, () => null);
  let order: StoredOrder | null = null;
  try {
    const parsed = raw ? (JSON.parse(raw) as StoredOrder) : null;
    order = parsed && parsed.orderNumber === orderNumber ? parsed : null;
  } catch {
    order = null;
  }

  const copy = () => {
    navigator.clipboard?.writeText(orderNumber).then(
      () => toast.success("Order number copied"),
      () => undefined
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="h-11 w-11 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Thank you! Your order is placed.</h1>
        <p className="mt-2 text-sm text-slate-500">
          We&apos;ve received your order and our sellers are getting it ready. You&apos;ll get updates by SMS.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div>
            <p className="text-xs text-slate-500">Order number</p>
            <p className="font-mono text-lg font-bold text-slate-900">{orderNumber || "—"}</p>
          </div>
          {orderNumber && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          )}
        </div>

        {order ? (
          <div className="space-y-5 p-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="text-xs text-slate-500">Payment</dt>
                  <dd className="font-semibold text-slate-900">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</dd>
                </div>
              </div>
              {order.phone && (
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Contact</dt>
                    <dd className="font-semibold text-slate-900">{order.phone}</dd>
                  </div>
                </div>
              )}
              {order.address && (
                <div className="flex gap-3 sm:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-500">Delivering to</dt>
                    <dd className="font-semibold text-slate-900">{order.address}</dd>
                  </div>
                </div>
              )}
            </dl>

            <div className="space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal{order.itemCount ? ` (${order.itemCount} items)` : ""}</span>
                <span className="font-semibold text-slate-900">{formatTaka(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="font-semibold text-emerald-600">−{formatTaka(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-semibold text-slate-900">
                  {order.shippingFee === 0 ? "Free" : formatTaka(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-base font-extrabold text-slate-900">
                <span>{order.paymentMethod === "COD" ? "Pay on delivery" : "Total"}</span>
                <span>{formatTaka(order.totalAmount)}</span>
              </div>
            </div>

            {order.paymentMethod !== "COD" && (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
                We&apos;ll contact you shortly with {PAYMENT_LABEL[order.paymentMethod] ?? "payment"} instructions to
                complete your payment.
              </p>
            )}
          </div>
        ) : (
          <p className="p-6 text-sm text-slate-500">
            Keep your order number handy — you&apos;ll need it if you contact support.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand"
        >
          <ShoppingBag className="h-4 w-4" /> Continue shopping
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
