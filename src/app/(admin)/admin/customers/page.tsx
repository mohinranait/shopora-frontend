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
    <Card className="hover:border-brand/40 transition">
      <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-black text-foreground">{value}</p>
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
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

  const { data, isLoading, isFetching, isError, refetch } = useGetAdminCustomersQuery({
    page,
    limit,
    search: search || undefined,
    isActive: isActiveFilter,
    isVerified: isVerifiedFilter,
  });

  const [toggleStatus, { isLoading: isToggling }] = useToggleCustomerStatusMutation();

  const customers = data?.users ?? [];
  const meta = data?.meta;
  const counts = (data as unknown as { counts?: Record<string, number> })?.counts;
  const totalPages = meta?.totalPages ?? 1;

  const handleQuickToggle = async (customer: ICustomerItem) => {
    try {
      const nextActive = !customer.isActive;
      await toggleStatus({ id: customer.id, isActive: nextActive }).unwrap();
      toast.success(
        `Customer ${customer.name} ${nextActive ? "activated" : "suspended"} successfully`
      );
      void refetch();
    } catch {
      toast.error("Failed to update customer status");
    }
  };

  const handleQuickView = (id: string | number) => {
    setSelectedCustomerId(id);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Customer Directory
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Manage buyer accounts, verified profiles, order histories, and platform access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-brand" : "text-muted-foreground"}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={counts?.total?.toLocaleString() ?? "—"}
          tone="bg-brand/10 text-brand border border-brand/20"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Active Accounts"
          value={counts?.active?.toLocaleString() ?? "—"}
          tone="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Verified Emails"
          value={counts?.verified?.toLocaleString() ?? "—"}
          tone="bg-sky-500/10 text-sky-500 border border-sky-500/20"
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Lifetime GMV"
          value={counts?.totalRevenue ? formatTaka(counts.totalRevenue) : "৳ 0"}
          tone="bg-amber-500/10 text-amber-500 border border-amber-500/20"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or phone number…"
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer z-10"
            >
              &times;
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-muted/60 p-1 border border-border">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilterTab(tab.value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterTab === tab.value
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Customers Table (shadcn Table) */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-xs">Loading customer directory…</p>
          </div>
        ) : isError ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 p-6 text-center text-rose-500">
            <AlertCircle className="h-8 w-8" />
            <p className="font-bold text-foreground">Failed to load customers</p>
            <p className="text-xs text-muted-foreground">Please verify your connection and permissions.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2 text-xs"
            >
              Retry
            </Button>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Users className="h-6 w-6" />
            </div>
            <p className="font-bold text-foreground">No customers found</p>
            <p className="text-xs text-muted-foreground">
              {search
                ? `No customers matched “${search}”.`
                : "No customer records currently exist under this filter."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Orders &amp; Spend</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c: ICustomerItem) => (
                <TableRow key={c.id}>
                  {/* 1. Customer Name & Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-deep to-sky-600 font-bold text-white shadow-xs">
                        {c.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                            className="font-bold text-foreground hover:text-brand transition cursor-pointer"
                            onClick={() => handleQuickView(c.id)}
                          >
                            {c.name}
                          </span>
                          <CustomerRoleBadge role={c.role} />
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          ID #{c.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Contact Details */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="flex items-center gap-1.5 text-foreground">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>{c.email}</span>
                      </p>
                      {c.phone ? (
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{c.phone}</span>
                        </p>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">No phone</span>
                      )}
                    </div>
                  </TableCell>

                  {/* 3. Orders & Spend */}
                  <TableCell>
                    <div>
                      <span className="font-bold text-foreground font-mono">
                        {formatTaka(c.totalSpent)}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {c.ordersCount} order{c.ordersCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </TableCell>

                  {/* 4. Location */}
                  <TableCell>
                    {c.defaultAddress ? (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span>
                          {c.defaultAddress.city}
                          {c.defaultAddress.state ? `, ${c.defaultAddress.state}` : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>

                  {/* 5. Status & Verified */}
                  <TableCell>
                    <div className="flex flex-col gap-1.5 items-start">
                      <CustomerStatusBadge isActive={c.isActive} />
                      <CustomerVerifiedBadge isVerified={c.isVerified} />
                    </div>
                  </TableCell>

                  {/* 6. Joined Date */}
                  <TableCell className="whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                    {formatCustomerDate(c.createdAt)}
                  </TableCell>

                  {/* 7. Action Controls */}
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleQuickView(c.id)}
                        title="Quick View Profile"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setEditingCustomer(c)}
                        title="Edit Customer"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="icon-sm"
                        variant={c.isActive ? "destructive" : "outline"}
                        onClick={() => handleQuickToggle(c)}
                        disabled={isToggling}
                        title={c.isActive ? "Suspend Customer" : "Activate Customer"}
                      >
                        {c.isActive ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                      </Button>

                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition"
                        title="Open Full Profile Page"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination Bar */}
        {!isLoading && customers.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-bold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-bold text-foreground">
                {Math.min(page * limit, meta?.total ?? customers.length)}
              </span>{" "}
              of <span className="font-bold text-foreground">{meta?.total ?? customers.length}</span>{" "}
              customers
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <span className="px-2 text-xs font-bold text-foreground">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="text-xs gap-1"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Quick View Drawer (shadcn Sheet) */}
      <CustomerDetailsDrawer
        customerId={selectedCustomerId}
        isOpen={isDrawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCustomerId(null);
        }}
      />

      {/* Edit Customer Dialog (shadcn Dialog) */}
      <EditCustomerDialog
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onSuccess={() => void refetch()}
      />
    </div>
  );
}
