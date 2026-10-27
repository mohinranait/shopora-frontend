"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Minus, Plus, Trash2, Truck } from "lucide-react";
import type { ICartItem } from "@/types";
import { useCart } from "@/context/CartContext";

export const SHIPPING_FREE_THRESHOLD = 1500;
export const SHIPPING_FLAT_FEE = 70;

export const formatTaka = (n: number) => `৳${Math.round(n).toLocaleString("en-US")}`;

/** Mirrors the backend rule; the quote endpoint stays the source of truth at checkout */
export const estimateShipping = (subtotal: number, items: ICartItem[]) => {
  const purchasable = items.filter((i) => i.isAvailable && i.inStock);
  if (purchasable.length === 0) return 0;
  if (purchasable.every((i) => i.product?.isFreeShipping)) return 0;
  return subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT_FEE;
};

export function QuantityStepper({ item, size = "md" }: { item: ICartItem; size?: "sm" | "md" }) {
  const { updateQuantity, pendingIds } = useCart();
  const disabled = !item.isAvailable || !item.inStock;
  const pending = pendingIds.has(item.id);
  const btn = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-slate-200 bg-white ${pending ? "opacity-70" : ""}`}
      aria-busy={pending}
    >
      <button
        type="button"
        onClick={() => updateQuantity(item.id, item.quantity - 1)}
        disabled={disabled}
        className={`${btn} flex items-center justify-center rounded-l-xl text-slate-600 transition hover:bg-slate-50 hover:text-brand-deep disabled:opacity-40`}
        aria-label={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={`min-w-8 text-center font-bold tabular-nums text-slate-900 ${size === "sm" ? "text-xs" : "text-sm"}`}>
        {item.quantity}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(item.id, item.quantity + 1)}
        disabled={disabled || item.quantity >= item.maxAvailableStock}
        className={`${btn} flex items-center justify-center rounded-r-xl text-slate-600 transition hover:bg-slate-50 hover:text-brand-deep disabled:opacity-40`}
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function StockNote({ item }: { item: ICartItem }) {
  if (!item.isAvailable) {
    return (
      <p className="flex items-center gap-1 text-xs font-medium text-rose-600">
        <AlertCircle className="h-3.5 w-3.5" /> No longer available
      </p>
    );
  }
  if (!item.inStock) {
    return (
      <p className="flex items-center gap-1 text-xs font-medium text-rose-600">
        <AlertCircle className="h-3.5 w-3.5" /> Out of stock
      </p>
    );
  }
  if (item.quantity > item.maxAvailableStock) {
    return (
      <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
        <AlertCircle className="h-3.5 w-3.5" /> Only {item.maxAvailableStock} available
      </p>
    );
  }
  if (item.maxAvailableStock <= 5) {
    return <p className="text-xs font-medium text-amber-600">Only {item.maxAvailableStock} left</p>;
  }
  return null;
}

export function CartItemImage({ item, className = "h-20 w-20" }: { item: ICartItem; className?: string }) {
  const src = item.variant?.image || item.product?.mainImage;
  return (
    <Link
      href={item.product ? `/products/${item.product.slug}` : "#"}
      className={`block shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={item.product?.name ?? "Product"} className="h-full w-full object-contain p-1" />
      ) : null}
    </Link>
  );
}

export function RemoveButton({ item, label = false }: { item: ICartItem; label?: boolean }) {
  const { removeItem } = useCart();
  return (
    <button
      type="button"
      onClick={() => removeItem(item.id)}
      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
      aria-label={`Remove ${item.product?.name ?? "item"}`}
    >
      <Trash2 className="h-4 w-4" />
      {label && <span>Remove</span>}
    </button>
  );
}

export function FreeShippingProgress({
  subtotal,
  compact = false,
  threshold = SHIPPING_FREE_THRESHOLD,
  enabled = true,
}: {
  subtotal: number;
  compact?: boolean;
  threshold?: number;
  enabled?: boolean;
}) {
  if (!enabled) return null;
  const effectiveThreshold = threshold > 0 ? threshold : SHIPPING_FREE_THRESHOLD;
  const remaining = Math.max(0, effectiveThreshold - subtotal);
  const pct = Math.min(100, (subtotal / effectiveThreshold) * 100);
  return (
    <div className={compact ? "" : "rounded-2xl border border-sky-100 bg-sky-50/70 p-4"}>
      <p className="flex items-center gap-2 text-xs text-brand-deep">
        <Truck className="h-4 w-4 shrink-0" />
        {remaining > 0 ? (
          <span>
            Add <strong>{formatTaka(remaining)}</strong> more for <strong>free delivery</strong>
          </span>
        ) : (
          <span>
            You&apos;ve unlocked <strong>free delivery</strong> 🎉
          </span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-100" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Group cart lines by vendor (platform-owned products go under Shopora) */
export function groupByStore(items: ICartItem[]) {
  const groups = new Map<string, { key: string; name: string; href: string | null; verified: boolean; items: ICartItem[] }>();
  for (const item of items) {
    const key = item.seller ? `seller-${item.seller.id}` : "platform";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: item.seller?.storeName ?? "Shopora Direct",
        href: item.seller ? `/vendors/${item.seller.storeSlug}` : null,
        verified: item.seller ? Boolean(item.seller.isVerified) : true,
        items: [],
      });
    }
    groups.get(key)!.items.push(item);
  }
  return [...groups.values()];
}
