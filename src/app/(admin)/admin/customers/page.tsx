"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  useGetAdminCustomersQuery,
  useToggleCustomerStatusMutation,
} from "@/redux";
import type { ICustomerItem } from "@/types";
import {
  CustomerRoleBadge,
  CustomerStatusBadge,
  CustomerVerifiedBadge,
  formatCustomerDate,
  formatTaka,
} from "@/components/admin/customers/CustomerBadges";
import { CustomerDetailsDrawer } from "@/components/admin/customers/CustomerDetailsDrawer";
import { EditCustomerDialog } from "@/components/admin/customers/EditCustomerDialog";

const FILTER_TABS = [
  { value: "all", label: "All Customers" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
];

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/60 shadow-xs">
      <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-xl font-black text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminCustomersPage() {
  const [filterTab, setFilterTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Drawer & Edit Dialog state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<ICustomerItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Derive filter flags
  const isActiveFilter =
    filterTab === "active" ? true : filterTab === "suspended" ? false : undefined;
  const isVerifiedFilter =
    filterTab === "verified" ? true : filterTab === "unverified" ? false : undefined;

  const { data, isLoading, isFetching, isError, refetch } = useGetAdminCustomersQuery(
    {
      role: "CUSTOMER",
      isActive: isActiveFilter,
      isVerified: isVerifiedFilter,
      search: search || undefined,
      page,
      limit,
    },
    { refetchOnMountOrArgChange: true, pollingInterval: 60_000 }
  );

  const [toggleStatus, { isLoading: isToggling }] = useToggleCustomerStatusMutation();

  const customers = data?.users ?? [];
  const meta = data?.meta;
  const counts = meta?.counts;

  const totalPages = meta?.totalPages ?? 1;

  // Calculate gross spend of visible customers or lifetime sum
  const totalRevenueSum = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  const handleQuickView = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setDrawerOpen(true);
  };

  const handleQuickToggle = async (customer: ICustomerItem) => {
    try {
      const nextStatus = !customer.isActive;
      await toggleStatus({ id: customer.id, isActive: nextStatus }).unwrap();
      toast.success(
        `Customer “${customer.name}” ${nextStatus ? "activated" : "suspended"} successfully`
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Manage customer accounts, review orders &amp; spend, and control account permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Customers"
          value={counts?.totalCustomers !== undefined ? String(counts.totalCustomers) : "—"}
          tone="bg-brand-deep/20 text-brand ring-1 ring-brand/30"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Active Accounts"
          value={counts?.activeCustomers !== undefined ? String(counts.activeCustomers) : "—"}
          tone="bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Verified Customers"
          value={counts?.verifiedCustomers !== undefined ? String(counts.verifiedCustomers) : "—"}
          tone="bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20"
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Visible Revenue"
          value={formatTaka(totalRevenueSum)}
          tone="bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
        />
      </div>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or phone number…"
            className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2 pl-9 pr-8 text-xs text-white placeholder-slate-400 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-800/60 p-1 scrollbar-none">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilterTab(tab.value);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                filterTab === tab.value
                  ? "bg-brand text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
        {isLoading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-xs">Loading customer directory…</p>
          </div>
        ) : isError ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 p-6 text-center text-rose-400">
            <AlertCircle className="h-8 w-8" />
            <p className="font-bold text-white">Failed to load customers</p>
            <p className="text-xs text-slate-400">Please verify your connection and permissions.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <Users className="h-6 w-6" />
            </div>
            <p className="font-bold text-white">No customers found</p>
            <p className="text-xs text-slate-400">
              {search
                ? `No customers matched “${search}”.`
                : "No customer records currently exist under this filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Customer</th>
                  <th scope="col" className="px-4 py-3.5">Contact</th>
                  <th scope="col" className="px-4 py-3.5">Orders &amp; Spend</th>
                  <th scope="col" className="px-4 py-3.5">Location</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Joined</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="transition hover:bg-slate-800/30"
                  >
                    {/* 1. Customer Name & Avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-deep to-sky-600 font-bold text-white shadow-xs">
                          {c.avatar ? (
                            <img
                              src={c.avatar}
                              alt={c.name}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            c.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-bold text-white hover:text-brand transition cursor-pointer"
                              onClick={() => handleQuickView(c.id)}
                            >
                              {c.name}
                            </span>
                            <CustomerRoleBadge role={c.role} />
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            ID #{c.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Contact Details */}
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{c.email}</span>
                        </p>
                        {c.phone ? (
                          <p className="flex items-center gap-1.5 text-slate-400">
                            <Phone className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>{c.phone}</span>
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-600 italic">No phone</span>
                        )}
                      </div>
                    </td>

                    {/* 3. Orders & Spend */}
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-bold text-white">
                          {formatTaka(c.totalSpent)}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {c.ordersCount} order{c.ordersCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </td>

                    {/* 4. Location */}
                    <td className="px-4 py-4">
                      {c.defaultAddress ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>
                            {c.defaultAddress.city}
                            {c.defaultAddress.state ? `, ${c.defaultAddress.state}` : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">—</span>
                      )}
                    </td>

                    {/* 5. Status & Verified */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <CustomerStatusBadge isActive={c.isActive} />
                        <CustomerVerifiedBadge isVerified={c.isVerified} />
                      </div>
                    </td>

                    {/* 6. Joined Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-slate-400">
                      {formatCustomerDate(c.createdAt)}
                    </td>

                    {/* 7. Action Controls */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickView(c.id)}
                          className="rounded-lg border border-slate-800 bg-slate-800/80 p-1.5 text-slate-300 transition hover:border-brand hover:bg-brand/10 hover:text-brand"
                          title="Quick View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingCustomer(c)}
                          className="rounded-lg border border-slate-800 bg-slate-800/80 p-1.5 text-slate-300 transition hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-400"
                          title="Edit Customer"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>

                        {/* Toggle Status Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickToggle(c)}
                          disabled={isToggling}
                          className={`rounded-lg border p-1.5 transition ${
                            c.isActive
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                          title={c.isActive ? "Suspend Customer" : "Activate Customer"}
                        >
                          {c.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>

                        {/* Full Profile Page Link */}
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="rounded-lg border border-slate-800 bg-slate-800/80 p-1.5 text-slate-300 transition hover:border-white hover:text-white"
                          title="Open Full Profile Page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!isLoading && customers.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800 px-5 py-3 sm:flex-row">
            <p className="text-xs text-slate-400">
              Showing <span className="font-bold text-white">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-bold text-white">
                {Math.min(page * limit, meta?.total ?? customers.length)}
              </span>{" "}
              of <span className="font-bold text-white">{meta?.total ?? customers.length}</span>{" "}
              customers
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <span className="px-2 text-xs font-bold text-white">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick View Drawer */}
      <CustomerDetailsDrawer
        customerId={selectedCustomerId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCustomerId(null);
        }}
      />

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onSuccess={() => void refetch()}
      />
    </div>
  );
}
