"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAdminOrdersQuery } from "@/redux";
import {
  AdminPaymentBadge,
  AdminStatusBadge,
  relativeTime,
  taka,
} from "@/components/admin/orders/adminOrderUi";

const TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-lg font-black text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, refetch } = useGetAdminOrdersQuery(
    { status, paymentStatus, search, page, limit: 20 },
    { refetchOnMountOrArgChange: true, pollingInterval: 60_000 }
  );
  const orders = data?.orders ?? [];
  const meta = data?.meta;
  const counts = meta?.counts ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Orders</h1>
          <p className="mt-1 text-xs text-slate-400">
            Confirm, pack, ship and deliver orders. Cash on delivery is marked paid automatically on delivery.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<ShoppingCart className="h-5 w-5 text-sky-400" />} tone="bg-sky-500/15" label="All orders" value={String(counts.ALL ?? 0)} />
        <StatCard icon={<Clock className="h-5 w-5 text-amber-400" />} tone="bg-amber-500/15" label="Needs action" value={String((counts.PENDING ?? 0) + (counts.CONFIRMED ?? 0) + (counts.PROCESSING ?? 0))} />
        <StatCard icon={<Truck className="h-5 w-5 text-purple-400" />} tone="bg-purple-500/15" label="In transit" value={String(counts.SHIPPED ?? 0)} />
        <StatCard icon={<Banknote className="h-5 w-5 text-emerald-400" />} tone="bg-emerald-500/15" label="Delivered revenue" value={taka(meta?.revenue ?? 0)} />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="flex w-max items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs font-semibold">
            {TABS.map((t) => {
              const active = status === t.value;
              const count = t.value ? counts[t.value] ?? 0 : counts.ALL ?? 0;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setStatus(t.value);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                    active ? (t.value === "CANCELLED" ? "bg-rose-600 text-white" : "bg-brand text-white") : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                  <span className={`rounded px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-slate-800"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
            aria-label="Payment status"
          >
            <option value="">All payments</option>
            <option value="PENDING">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Order no., customer, phone, email…"
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 font-semibold text-slate-400">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Store(s)</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Placed</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-800/80 text-slate-300 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded bg-slate-800/60" />
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-rose-400">
                      Couldn&apos;t load orders.{" "}
                      <button type="button" onClick={() => refetch()} className="underline">
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-slate-400">
                      <PackageCheck className="mx-auto mb-2 h-6 w-6 text-slate-500" />
                      {search ? `No orders match “${search}”` : "No orders here yet"}
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const name = o.customer?.name ?? o.shippingAddress?.fullName ?? "Guest";
                    const stores = [...new Set(o.subOrders.map((s) => s.store?.storeName ?? "Shopora Direct"))];
                    return (
                      <tr key={o.id} className="transition-colors hover:bg-slate-900/50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${o.id}`} className="font-mono font-bold text-sky-400 hover:underline">
                            {o.orderNumber}
                          </Link>
                          <p className="text-[10px] text-slate-500">{o.itemCount} items</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-white">
                            {name}
                            {!o.userId && <span className="ml-1.5 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">GUEST</span>}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {o.shippingAddress?.city} • {o.shippingAddress?.phone}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-[180px] truncate text-slate-200" title={stores.join(", ")}>
                            {stores[0]}
                          </p>
                          {stores.length > 1 && <p className="text-[10px] text-slate-500">+{stores.length - 1} more</p>}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-white">{taka(o.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <AdminPaymentBadge status={o.paymentStatus} />
                          <p className="mt-0.5 text-[10px] text-slate-400">{o.paymentMethod}</p>
                        </td>
                        <td className="px-4 py-3">
                          <AdminStatusBadge status={o.orderStatus} />
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{relativeTime(o.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                          >
                            <Eye className="h-4 w-4" /> Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-xs text-slate-400">
              <span>
                Page {meta.page} of {meta.totalPages} · {meta.total} orders
              </span>
              <div className="flex items-center gap-1.5">
                {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="rounded-md border border-slate-700 p-1.5 hover:bg-slate-800 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  className="rounded-md border border-slate-700 p-1.5 hover:bg-slate-800 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
