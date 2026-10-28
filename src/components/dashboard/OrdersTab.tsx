"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { IOrder, IPaginationMeta } from "@/types";
import { ordersApi } from "@/lib/cart/api";
import { formatTaka } from "@/components/cart/CartParts";
import { OrderStatusBadge, OrderDetailView } from "@/components/orders/OrderDetailView";
import { formatDate } from "@/components/orders/orderStatus";

const STATUS_TABS = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function OrdersTab() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ orders: IOrder[]; meta?: IPaginationMeta } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected order for inline detail view inside dashboard
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    ordersApi
      .mine({ status: status || undefined, page })
      .then(({ data, meta }) => {
        setResult({ orders: data ?? [], meta });
        setError(null);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Couldn't load orders");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const handleSelectOrder = async (orderNumber: string) => {
    setLoadingDetail(true);
    try {
      const order = await ordersApi.detail(orderNumber);
      setSelectedOrder(order);
    } catch {
      // Fallback: find from current list
      const fallback = result?.orders.find((o) => o.orderNumber === orderNumber);
      if (fallback) setSelectedOrder(fallback);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOrderUpdated = (updated: IOrder) => {
    setSelectedOrder(updated);
    fetchOrders();
  };

  // If viewing an order's detail inside dashboard
  if (selectedOrder) {
    return (
      <div className="space-y-4">
        {/* Navigation Bar inside tab */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5">
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Orders List</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900">
              #{selectedOrder.orderNumber}
            </span>
            <OrderStatusBadge status={selectedOrder.orderStatus} />
            <Link
              href={`/orders/${selectedOrder.orderNumber}`}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-brand hover:text-brand-deep hover:bg-sky-50 transition"
              title="Open in full standalone page"
            >
              <span>Full Page</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Order Detail View embedded cleanly */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <OrderDetailView order={selectedOrder} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Orders
            </h2>
            <p className="text-xs text-slate-500">
              View order status, items, shipment tracking and details directly here.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh orders"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand hover:border-brand transition"
              title="Open full orders page"
            >
              <span>/orders page</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </div>
        </div>

        {/* 2. Filter Status Tabs */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const isSelected = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-brand-deep text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Orders List or Detail Loading */}
      {loadingDetail && (
        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <span className="ml-2 text-xs font-semibold text-slate-600">
            Loading order details...
          </span>
        </div>
      )}

      {loading && !loadingDetail ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchOrders}
            className="mt-3 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : result && result.orders.length > 0 ? (
        <div className="space-y-3">
          {result.orders.map((order) => {
            const preview = order.items.slice(0, 4);
            return (
              <div
                key={order.id}
                className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand/40"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"} · Payment: {order.paymentMethod} ({order.paymentStatus})
                    </p>
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>

                {/* Items preview & Total */}
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {preview.map((item) => (
                      <span
                        key={item.id}
                        className="block h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                        title={item.productName}
                      >
                        {item.productImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-contain p-1"
                          />
                        )}
                      </span>
                    ))}
                    {order.items.length > preview.length && (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
                        +{order.items.length - preview.length}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400">Total Amount</p>
                    <p className="text-base font-extrabold tabular-nums text-slate-900">
                      {formatTaka(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Actions row */}
                <div className="mt-3 flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 transition"
                  >
                    <span>Full Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSelectOrder(order.orderNumber)}
                    className="inline-flex items-center gap-1 rounded-md bg-brand-deep px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand cursor-pointer"
                  >
                    <span>View Details Here</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {result.meta && result.meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-xs text-slate-500 font-medium px-2">
                Page {page} of {result.meta.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= result.meta.totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-400">
            {status ? <Package className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
          </div>
          <p className="mt-3 text-sm font-bold text-slate-900">
            {status ? "No orders found in this status" : "No orders yet"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 max-w-sm">
            {status
              ? "Try selecting another status tab above to see your other orders."
              : "When you purchase items, your order and tracking info will appear here."}
          </p>
          <Link
            href="/products"
            className="mt-4 rounded-md bg-brand-deep px-4 py-2 text-xs font-semibold text-white hover:bg-brand transition"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
