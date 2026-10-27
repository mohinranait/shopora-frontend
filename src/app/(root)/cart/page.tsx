"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, ChevronRight, Lock, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useOrderQuote } from "@/lib/cart/useOrderQuote";
import {
  CartItemImage,
  FreeShippingProgress,
  QuantityStepper,
  RemoveButton,
  StockNote,
  formatTaka,
  groupByStore,
} from "@/components/cart/CartParts";
import { CouponField, OrderTotals, TrustBadges } from "@/components/cart/OrderSummary";

function CartSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="h-16 rounded-2xl bg-slate-100" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 rounded-2xl border border-slate-200 p-4">
            <div className="h-24 w-24 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
              <div className="h-9 w-28 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-96 rounded-3xl bg-slate-100" />
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xs ring-1 ring-slate-200">
        <ShoppingBag className="h-9 w-9 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Looks like you haven&apos;t added anything yet. Explore products from our verified vendors.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand"
        >
          Start shopping <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/categories"
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          Browse categories
        </Link>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, subtotal, totalItems, status, clear } = useCart();
  const { quote, loading, couponCode, couponRejected, applyCoupon, removeCoupon } = useOrderQuote(items);
  const groups = groupByStore(items);
  const unavailableCount = items.filter((i) => !i.isAvailable || !i.inStock).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-16">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="transition hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-slate-800">Cart</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Shopping cart
          {totalItems > 0 && <span className="ml-2 text-base font-semibold text-slate-400">({totalItems} items)</span>}
        </h1>
        {items.length > 0 && (
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep">
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
        )}
      </div>

      {status === "loading" ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-5">
            <FreeShippingProgress subtotal={quote?.subtotal ?? subtotal} />

            {unavailableCount > 0 && (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {unavailableCount === 1 ? "1 item is" : `${unavailableCount} items are`} unavailable and won&apos;t be
                included in your order.
              </p>
            )}

            {groups.map((group) => (
              <section key={group.key} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <Store className="h-4 w-4 shrink-0 text-slate-400" />
                    {group.href ? (
                      <Link href={group.href} className="truncate font-semibold text-slate-900 hover:text-brand-deep">
                        {group.name}
                      </Link>
                    ) : (
                      <span className="truncate font-semibold text-slate-900">{group.name}</span>
                    )}
                    {group.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Verified" />}
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    {group.items.length} {group.items.length === 1 ? "item" : "items"}
                  </span>
                </header>

                <ul className="divide-y divide-slate-100">
                  {group.items.map((item) => {
                    const off = !item.isAvailable || !item.inStock;
                    return (
                      <li key={item.id} className={`flex gap-4 p-4 sm:p-5 ${off ? "bg-slate-50/50" : ""}`}>
                        <CartItemImage item={item} className={`h-20 w-20 sm:h-24 sm:w-24 ${off ? "opacity-50" : ""}`} />
                        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <Link
                              href={item.product ? `/products/${item.product.slug}` : "#"}
                              className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 hover:text-brand-deep sm:text-base"
                            >
                              {item.product?.name ?? "Unavailable product"}
                            </Link>
                            {item.variant && <p className="text-xs text-slate-500">{item.variant.title}</p>}
                            <p className="flex items-baseline gap-2 text-sm">
                              <span className="font-semibold text-slate-900">{formatTaka(item.unitPrice)}</span>
                              {item.comparePrice && item.comparePrice > item.unitPrice && (
                                <span className="text-xs text-slate-400 line-through">{formatTaka(item.comparePrice)}</span>
                              )}
                              {item.product?.isFreeShipping && (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Free delivery
                                </span>
                              )}
                            </p>
                            <StockNote item={item} />
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <span className="text-base font-extrabold tabular-nums text-slate-900">
                              {formatTaka(item.itemTotal)}
                            </span>
                            <div className="flex items-center gap-2">
                              <QuantityStepper item={item} />
                              <RemoveButton item={item} />
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Remove all items from your cart?")) void clear();
                }}
                className="text-sm font-medium text-slate-500 underline-offset-2 hover:text-rose-600 hover:underline"
              >
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="space-y-4 lg:sticky lg:top-32">
            <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
              <CouponField
                couponCode={couponCode}
                quote={quote}
                rejected={couponRejected}
                loading={loading}
                onApply={applyCoupon}
                onRemove={removeCoupon}
              />
              <OrderTotals quote={quote} fallbackSubtotal={subtotal} loading={loading} />
              <Link
                href="/checkout"
                aria-disabled={totalItems === 0}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-brand ${
                  totalItems === 0 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <Lock className="h-4 w-4" /> Proceed to checkout
              </Link>
            </div>
            <TrustBadges />
          </aside>
        </div>
      )}

      {/* Mobile sticky checkout bar */}
      {status === "ready" && totalItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div>
            <p className="text-[11px] text-slate-500">Total</p>
            <p className="text-lg font-extrabold tabular-nums text-slate-900">{formatTaka(quote?.totalAmount ?? subtotal)}</p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-5 py-3 text-sm font-bold text-white"
          >
            Checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
