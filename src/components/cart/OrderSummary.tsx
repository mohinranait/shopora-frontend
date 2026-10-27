"use client";

import React, { useState } from "react";
import { Loader2, ShieldCheck, Tag, Truck, RotateCcw, X } from "lucide-react";
import type { IOrderQuote } from "@/types";
import { formatTaka } from "./CartParts";

function Row({
  label,
  value,
  muted,
  accent,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  muted?: boolean;
  accent?: "green";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className={muted ? "text-slate-500" : "text-slate-600"}>{label}</span>
      <span className={`font-semibold tabular-nums ${accent === "green" ? "text-emerald-600" : "text-slate-900"}`}>
        {value}
      </span>
    </div>
  );
}

export function CouponField({
  couponCode,
  quote,
  rejected,
  loading,
  onApply,
  onRemove,
}: {
  couponCode: string;
  quote: IOrderQuote | null;
  rejected: boolean;
  loading: boolean;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  const [value, setValue] = useState("");
  const applied = quote?.coupon;

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-emerald-700">{applied.code}</span>
          <span className="text-emerald-700">applied</span>
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-1 text-emerald-700 hover:bg-emerald-100"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Not a <form>: this field also lives inside the checkout form */}
      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Coupon code</span>
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (value.trim()) onApply(value);
              }
            }}
            placeholder="Coupon code"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </label>
        <button
          type="button"
          onClick={() => value.trim() && onApply(value)}
          disabled={!value.trim() || loading}
          className="rounded-xl border border-slate-900 px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:opacity-40"
        >
          Apply
        </button>
      </div>
      {rejected && quote?.couponMessage && (
        <p className="mt-1.5 flex items-center justify-between text-xs text-rose-600">
          <span>
            <strong>{couponCode}</strong>: {quote.couponMessage}
          </span>
          <button type="button" onClick={onRemove} className="font-semibold underline">
            Clear
          </button>
        </p>
      )}
    </div>
  );
}

export function OrderTotals({
  quote,
  fallbackSubtotal,
  loading,
}: {
  quote: IOrderQuote | null;
  fallbackSubtotal: number;
  loading: boolean;
}) {
  const subtotal = quote?.subtotal ?? fallbackSubtotal;
  return (
    <div className="space-y-2.5">
      <Row label={`Subtotal${quote ? ` (${quote.itemCount} ${quote.itemCount === 1 ? "item" : "items"})` : ""}`} value={formatTaka(subtotal)} />
      {quote && quote.savings > 0 && <Row label="Product savings" value={`−${formatTaka(quote.savings)}`} accent="green" muted />}
      {quote && quote.discount > 0 && (
        <Row label={`Coupon (${quote.coupon?.code})`} value={`−${formatTaka(quote.discount)}`} accent="green" />
      )}
      <Row
        label="Delivery"
        value={quote ? (quote.shippingFee === 0 ? "Free" : formatTaka(quote.shippingFee)) : "—"}
        accent={quote?.shippingFee === 0 ? "green" : undefined}
      />
      <div className="flex items-end justify-between border-t border-dashed border-slate-200 pt-3">
        <span className="text-base font-bold text-slate-900">Total</span>
        <span className="flex items-center gap-2 text-xl font-extrabold tabular-nums text-slate-900">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {formatTaka(quote?.totalAmount ?? subtotal)}
        </span>
      </div>
      <p className="text-right text-[11px] text-slate-400">VAT included where applicable</p>
    </div>
  );
}

export function TrustBadges() {
  const items = [
    { icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />, label: "Secure checkout" },
    { icon: <Truck className="h-4 w-4 text-brand" />, label: "Cash on delivery" },
    { icon: <RotateCcw className="h-4 w-4 text-amber-600" />, label: "7-day returns" },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2 text-center">
      {items.map((i) => (
        <li key={i.label} className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 px-1 py-2.5 text-[11px] font-medium text-slate-600">
          {i.icon}
          {i.label}
        </li>
      ))}
    </ul>
  );
}
