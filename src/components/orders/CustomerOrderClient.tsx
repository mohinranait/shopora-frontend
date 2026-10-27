"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/cart/api";
import type { IOrder } from "@/types";
import { OrderDetailSkeleton, OrderDetailView } from "./OrderDetailView";
import { SignInPrompt } from "./SignInPrompt";
import { useIsClient } from "./useIsClient";

export function CustomerOrderClient({ orderNumber }: { orderNumber: string }) {
  const isClient = useIsClient();
  const { isAuthenticated, token } = useAuth();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    ordersApi
      .detail(orderNumber)
      .then((o) => !ignore && setOrder(o))
      .catch((e: unknown) => !ignore && setError(e instanceof Error ? e.message : "Couldn't load this order"));
    return () => {
      ignore = true;
    };
  }, [orderNumber, token]);

  if (!isClient) return <OrderDetailSkeleton />;
  if (!isAuthenticated) return <SignInPrompt redirect={`/orders/${orderNumber}`} />;

  return (
    <>
      <Link href="/orders" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      {error ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-base font-bold text-slate-900">{error === "Order not found" ? "We couldn't find this order" : error}</p>
          <p className="mt-1 text-sm text-slate-500">It may belong to a different account.</p>
          <Link href="/track-order" className="mt-5 inline-block text-sm font-semibold text-brand underline">
            Track a guest order instead
          </Link>
        </div>
      ) : order ? (
        <OrderDetailView order={order} />
      ) : (
        <OrderDetailSkeleton />
      )}
    </>
  );
}
