"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cartApi } from "./api";
import type { ICartItem, IOrderQuote } from "@/types";

const COUPON_KEY = "shopora_coupon";

const readCoupon = () => {
  try {
    return localStorage.getItem(COUPON_KEY) ?? "";
  } catch {
    return "";
  }
};

const writeCoupon = (code: string) => {
  try {
    if (code) localStorage.setItem(COUPON_KEY, code);
    else localStorage.removeItem(COUPON_KEY);
  } catch {
    // storage unavailable: coupon just won't persist across pages
  }
};

/**
 * Server-priced order summary for the current cart (subtotal, coupon, delivery, total).
 * The applied coupon persists between the cart and checkout pages.
 */
export function useOrderQuote(items: ICartItem[]) {
  const [couponCode, setCouponCode] = useState<string>(readCoupon);
  const [quote, setQuote] = useState<IOrderQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      items
        .filter((i) => i.isAvailable && i.inStock)
        .map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
    [items]
  );
  const linesKey = JSON.stringify(lines);

  useEffect(() => {
    let ignore = false;
    const parsed = JSON.parse(linesKey) as typeof lines;
    const t = setTimeout(() => {
      if (parsed.length === 0) {
        setQuote(null);
        return;
      }
      setLoading(true);
      cartApi
        .quote(parsed, couponCode || undefined)
        .then((q) => {
          if (ignore) return;
          setQuote(q);
          setError(null);
        })
        .catch((e: unknown) => {
          if (!ignore) setError(e instanceof Error ? e.message : "Couldn't calculate totals");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [linesKey, couponCode]);

  const applyCoupon = useCallback((code: string) => {
    const normalized = code.trim().toUpperCase();
    writeCoupon(normalized);
    setCouponCode(normalized);
  }, []);

  const removeCoupon = useCallback(() => {
    writeCoupon("");
    setCouponCode("");
  }, []);

  return {
    quote,
    loading,
    error,
    couponCode,
    /** True when a code was entered but the server rejected it */
    couponRejected: !!couponCode && !!quote && !quote.coupon,
    applyCoupon,
    removeCoupon,
    lines,
  };
}
