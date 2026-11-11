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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
    <Card className="hover:border-brand/40 transition">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-lg font-black text-foreground">{value}</p>
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
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Confirm, pack, ship and deliver orders. Cash on delivery is marked paid automatically on delivery.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-brand" : "text-muted-foreground"}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<ShoppingCart className="h-5 w-5 text-brand" />} tone="bg-sky-500/15 border border-sky-500/20" label="All orders" value={String(counts.ALL ?? 0)} />
        <StatCard icon={<Clock className="h-5 w-5 text-amber-500" />} tone="bg-amber-500/15 border border-amber-500/20" label="Needs action" value={String((counts.PENDING ?? 0) + (counts.CONFIRMED ?? 0) + (counts.PROCESSING ?? 0))} />
        <StatCard icon={<Truck className="h-5 w-5 text-purple-500" />} tone="bg-purple-500/15 border border-purple-500/20" label="In transit" value={String(counts.SHIPPED ?? 0)} />
        <StatCard icon={<Banknote className="h-5 w-5 text-emerald-500" />} tone="bg-emerald-500/15 border border-emerald-500/20" label="Delivered revenue" value={taka(meta?.revenue ?? 0)} />
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="flex w-max items-center gap-1 rounded-lg border border-border bg-muted/60 p-1 text-xs font-semibold">
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
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition cursor-pointer ${
 active
 ? t.value === "CANCELLED"
 ? "bg-rose-600 text-white "
 : "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground"
 }`}
                >
                  {t.label}
                  <span className={`rounded px-1.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              value={paymentStatus}
              onValueChange={(val) => {
                setPaymentStatus(val === "ALL" ? "" : val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All payments">
                  {paymentStatus === "PENDING"
                    ? "Unpaid"
                    : paymentStatus === "PAID"
                    ? "Paid"
                    : paymentStatus === "FAILED"
                    ? "Failed"
                    : paymentStatus === "REFUNDED"
                    ? "Refunded"
                    : "All payments"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All payments</SelectItem>
                <SelectItem value="PENDING">Unpaid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Order no., customer, phone, email…"
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Store(s)</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? "opacity-60" : ""}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8} className="py-4">
                    <div className="h-8 animate-pulse rounded bg-muted/60" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-rose-500">
                  Couldn&apos;t load orders.{" "}
                  <button type="button" onClick={() => refetch()} className="underline cursor-pointer">
                    Try again
                  </button>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-14 text-center text-muted-foreground">
                  <PackageCheck className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  {search ? `No orders match “${search}”` : "No orders here yet"}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => {
                const name = o.customer?.name ?? o.shippingAddress?.fullName ?? "Guest";
                const stores = [...new Set(o.subOrders.map((s) => s.store?.storeName ?? "Shopora Direct"))];
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono font-bold text-brand hover:underline">
                        {o.orderNumber}
                      </Link>
                      <p className="text-[10px] text-muted-foreground">{o.itemCount} items</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-foreground">
                        {name}
                        {!o.userId && <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">GUEST</span>}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {o.shippingAddress?.city} • {o.shippingAddress?.phone}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[180px] truncate text-foreground" title={stores.join(", ")}>
                        {stores[0]}
                      </p>
                      {stores.length > 1 && <p className="text-[10px] text-muted-foreground">+{stores.length - 1} more</p>}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">{taka(o.totalAmount)}</TableCell>
                    <TableCell>
                      <AdminPaymentBadge status={o.paymentStatus} />
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{o.paymentMethod}</p>
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={o.orderStatus} />
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{relativeTime(o.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" /> Manage
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} · {meta.total} orders
            </span>
            <div className="flex items-center gap-1.5">
              {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />}
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
