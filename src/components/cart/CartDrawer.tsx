"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useIsClient } from "@/hooks/useIsClient";
import { useGetWebsiteSettingsQuery } from "@/redux";
import {
  CartItemImage,
  FreeShippingProgress,
  QuantityStepper,
  RemoveButton,
  StockNote,
  estimateShipping,
  formatTaka,
} from "./CartParts";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const isClient = useIsClient();
  const { items, subtotal, totalItems, status } = useCart();
  const { data: settings } = useGetWebsiteSettingsQuery(undefined, { skip: !isOpen });
  const shipping = estimateShipping(subtotal, items);
  const hasUnavailable = items.some((i) => !i.isAvailable || !i.inStock);

  // Lock body scroll when cart drawer is open without layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const isScrollbarGutterSupported =
        typeof window !== "undefined" && window.CSS && CSS.supports("scrollbar-gutter", "stable");

      document.body.style.overflow = "hidden";
      if (!isScrollbarGutterSupported && scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isClient) return null;
  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand" />
            <h2 className="text-base font-bold text-slate-900">Your cart</h2>
            {totalItems > 0 && (
              <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-deep">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length > 0 && (
          <div className="border-b border-slate-100 px-5 py-3">
            <FreeShippingProgress subtotal={subtotal} compact threshold={settings?.free_shipping_threshold} enabled={settings?.enable_free_shipping_promo !== false} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5">
          {status === "loading" ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <ShoppingBag className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-800">Your cart is empty</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">Find something you love and add it here.</p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <li key={item.id} className={`flex gap-3 py-4 ${!item.isAvailable || !item.inStock ? "opacity-60" : ""}`}>
                  <CartItemImage item={item} />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div>
                      <Link
                        href={item.product ? `/products/${item.product.slug}` : "#"}
                        onClick={onClose}
                        className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 hover:text-brand-deep"
                      >
                        {item.product?.name ?? "Unavailable product"}
                      </Link>
                      {item.variant && <p className="mt-0.5 text-xs text-slate-500">{item.variant.title}</p>}
                      <StockNote item={item} />
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantityStepper item={item} size="sm" />
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-extrabold text-slate-900">{formatTaka(item.itemTotal)}</span>
                        <RemoveButton item={item} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-5">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatTaka(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Delivery</span>
              <span className={shipping === 0 ? "font-semibold text-emerald-600" : "font-semibold text-slate-900"}>
                {shipping === 0 ? "Free" : formatTaka(shipping)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
              <span>Total</span>
              <span>{formatTaka(subtotal + shipping)}</span>
            </div>
            {hasUnavailable && (
              <p className="text-xs text-amber-700">Unavailable items aren&apos;t included in the total.</p>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/cart"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-deep"
              >
                View cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                aria-disabled={totalItems === 0}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-deep py-3 text-sm font-semibold text-white transition hover:bg-brand ${
                  totalItems === 0 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
