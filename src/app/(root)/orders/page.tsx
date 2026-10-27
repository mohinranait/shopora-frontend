"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Package, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/cart/api";
import type { IOrder, IPaginationMeta } from "@/types";
import { formatTaka } from "@/components/cart/CartParts";
import { OrderStatusBadge } from "@/components/orders/OrderDetailView";
import { formatDate } from "@/components/orders/orderStatus";
import { SignInPrompt } from "@/components/orders/SignInPrompt";
import { useIsClient } from "@/components/orders/useIsClient";

const TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

function OrderCard({ order }: { order: IOrder }) {
  const preview = order.items.slice(0, 4);
  return (
    <Link
      href={`/orders/${order.orderNumber}`}
      className="group block rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-brand/40 hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-bold text-slate-900">{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex -space-x-3">
          {preview.map((item) => (
            <span key={item.id} className="block h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-slate-50 ring-1 ring-slate-200">
              {item.productImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.productImage} alt={item.productName} className="h-full w-full object-contain p-1" />
              )}
            </span>
          ))}
          {order.items.length > preview.length && (
            <span className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-slate-100 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
              +{order.items.length - preview.length}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-lg font-extrabold tabular-nums text-slate-900">{formatTaka(order.totalAmount)}</p>
        </div>
      </div>
      <p className="mt-4 flex items-center justify-end gap-1 text-sm font-semibold text-brand group-hover:text-brand-deep">
        View details <ChevronRight className="h-4 w-4" />
      </p>
    </Link>
  );
}

export default function MyOrdersPage() {
  const isClient = useIsClient();
  const { isAuthenticated, token } = useAuth();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ orders: IOrder[]; meta?: IPaginationMeta } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let ignore = false;
    ordersApi
      .mine({ status: status || undefined, page })
      .then(({ data, meta }) => {
        if (!ignore) {
          setResult({ orders: data ?? [], meta });
          setError(null);
        }
      })
      .catch((e: unknown) => !ignore && setError(e instanceof Error ? e.message : "Couldn't load orders"))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token, status, page]);

  const changeTab = (value: string) => {
    setLoading(true);
    setStatus(value);
    setPage(1);
  };

  const changePage = (p: number) => {
    setLoading(true);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isClient) return <div className="min-h-[60vh]" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="transition hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-slate-800">My orders</span>
      </nav>

      {!isAuthenticated ? (
        <SignInPrompt redirect="/orders" />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My orders</h1>
            <Link href="/track-order" className="text-sm font-semibold text-brand hover:text-brand-deep">
              Track a guest order
            </Link>
          </div>

          <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-2">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => changeTab(t.value)}
                  aria-pressed={status === t.value}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    status === t.value ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-700">{error}</p>
          ) : result && result.orders.length > 0 ? (
            <>
              <div className="space-y-4">
                {result.orders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </div>
              {result.meta && result.meta.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <span className="text-sm text-slate-500">
                    Page {page} of {result.meta.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => changePage(page + 1)}
                    disabled={page >= result.meta.totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
                {status ? <Package className="h-6 w-6 text-slate-400" /> : <ShoppingBag className="h-6 w-6 text-slate-400" />}
              </div>
              <p className="text-base font-bold text-slate-900">{status ? "No orders in this status" : "No orders yet"}</p>
              <p className="mt-1 text-sm text-slate-500">When you place an order, it will show up here.</p>
              <Link href="/products" className="mt-5 rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand">
                Start shopping
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
