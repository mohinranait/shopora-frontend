"use client";

import React, { useState } from "react";
import { Loader2, PackageSearch, Search } from "lucide-react";
import { ordersApi } from "@/lib/cart/api";
import type { IOrder } from "@/types";
import { OrderDetailView } from "./OrderDetailView";

/** Guest order lookup: order number + the phone used at checkout (kept out of the URL) */
export function TrackOrderClient({ initialOrderNumber = "" }: { initialOrderNumber?: string }) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setOrder(await ordersApi.detail(orderNumber.trim().toUpperCase(), phone.trim()));
    } catch (err) {
      setOrder(null);
      setError(
        err instanceof Error && err.message === "Order not found"
          ? "We couldn't find an order with that number and phone. Please check and try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong"
      );
    } finally {
      setBusy(false);
    }
  };

  if (order) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setOrder(null)}
          className="text-sm font-semibold text-brand hover:text-brand-deep"
        >
          ← Track another order
        </button>
        <OrderDetailView order={order} phone={phone.trim()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light">
          <PackageSearch className="h-6 w-6 text-brand-deep" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Track your order</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your order number and the phone number you used at checkout.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Order number</span>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. SHO-20261027-1234"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono text-sm uppercase outline-none placeholder:font-sans placeholder:normal-case focus:border-brand focus:ring-4 focus:ring-brand/10"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Mobile number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            required
          />
        </label>
        {error && <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3 text-sm font-bold text-white transition hover:bg-brand disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Track order
        </button>
      </form>
    </div>
  );
}
