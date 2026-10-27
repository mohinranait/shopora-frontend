"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  ShoppingBag,
  Star,
  UserCog,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetAdminCustomerQuery,
  useToggleCustomerStatusMutation,
} from "@/redux";
import {
  CustomerRoleBadge,
  CustomerStatusBadge,
  CustomerVerifiedBadge,
  formatCustomerDate,
  formatTaka,
} from "@/components/admin/customers/CustomerBadges";
import { EditCustomerDialog } from "@/components/admin/customers/EditCustomerDialog";

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

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const customerId = Number(resolvedParams.id);

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAdminCustomerQuery(customerId, {
    skip: !customerId || isNaN(customerId),
  });

  const [toggleStatus, { isLoading: isToggling }] = useToggleCustomerStatusMutation();

  if (isNaN(customerId)) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-rose-400" />
        <h2 className="text-lg font-bold text-white">Invalid Customer ID</h2>
        <Link
          href="/admin/customers"
          className="rounded-xl bg-brand-deep px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Customer Directory
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm">Loading customer profile details…</p>
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
        <AlertCircle className="mx-auto mb-3 h-10 w-10" />
        <h2 className="text-lg font-bold text-white">Customer Not Found</h2>
        <p className="mt-1 text-xs text-slate-400">
          The requested customer profile could not be found or has been removed.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/admin/customers"
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Back to Customers
          </Link>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-brand-deep px-4 py-2 text-xs font-semibold text-white hover:bg-brand"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, addresses, orders, reviews, stats } = data;

  const handleToggleStatus = async () => {
    try {
      const nextActive = !user.isActive;
      await toggleStatus({ id: user.id, isActive: nextActive }).unwrap();
      toast.success(
        `Customer account ${nextActive ? "activated" : "suspended"} successfully`
      );
      void refetch();
    } catch {
      toast.error("Failed to update account status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customer Directory</span>
        </Link>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-md">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-deep to-sky-600 text-2xl font-black text-white shadow-lg ring-4 ring-white/10">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Main Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-white sm:text-3xl">
                  {user.name}
                </h1>
                <CustomerRoleBadge role={user.role} />
                <CustomerStatusBadge isActive={user.isActive} />
                <CustomerVerifiedBadge isVerified={user.isVerified} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <a href={`mailto:${user.email}`} className="hover:text-brand transition">
                    {user.email}
                  </a>
                </span>
                {user.phone ? (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <a href={`tel:${user.phone}`} className="hover:text-brand transition">
                      {user.phone}
                    </a>
                  </span>
                ) : (
                  <span className="text-slate-600 italic">No phone provided</span>
                )}
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Customer since {formatCustomerDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setEditDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand shadow-sm"
            >
              <UserCog className="h-4 w-4" />
              <span>Edit Customer</span>
            </button>

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition disabled:opacity-50 ${
                user.isActive
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user.isActive ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{user.isActive ? "Suspend Account" : "Activate Account"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Total Orders"
          value={String(stats.totalOrders)}
          tone="bg-brand-deep/20 text-brand ring-1 ring-brand/30"
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Total Spend"
          value={formatTaka(stats.totalSpent)}
          tone="bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
        />
        <StatCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="Delivered Orders"
          value={String(stats.deliveredOrders)}
          tone="bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Cancelled Orders"
          value={String(stats.cancelledOrders)}
          tone="bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
        />
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (1 / 3): Customer Info & Addresses */}
        <div className="space-y-6 lg:col-span-1">
          {/* Account Meta Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Overview
            </h2>
            <dl className="divide-y divide-slate-800/80 text-xs">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-400">Account ID</dt>
                <dd className="font-mono font-bold text-white">#{user.id}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-400">Role</dt>
                <dd>
                  <CustomerRoleBadge role={user.role} />
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-400">Account Status</dt>
                <dd>
                  <CustomerStatusBadge isActive={user.isActive} />
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-400">Email Verification</dt>
                <dd>
                  <CustomerVerifiedBadge isVerified={user.isVerified} />
                </dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-400">Registration Date</dt>
                <dd className="text-slate-300">{formatCustomerDate(user.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-slate-400">Last Profile Update</dt>
                <dd className="text-slate-300">{formatCustomerDate(user.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Saved Addresses Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="h-4 w-4 text-brand" />
                Delivery Addresses ({addresses.length})
              </h2>
            </div>

            {addresses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                No delivery addresses on file.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 text-xs text-slate-300 transition hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="rounded-md bg-brand-deep/20 px-2 py-0.5 text-[10px] font-bold text-brand ring-1 ring-brand/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-slate-400">
                      {addr.streetAddress}, {addr.city}
                      {addr.state ? `, ${addr.state}` : ""}
                      {addr.postalCode ? ` - ${addr.postalCode}` : ""}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-slate-500">
                      <Phone className="h-3 w-3" />
                      {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Reviews Card (if any) */}
          {reviews.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Star className="h-4 w-4 text-amber-400" />
                Recent Product Reviews ({reviews.length})
              </h2>
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {rev.product?.name || "Product"}
                      </span>
                      <span className="font-bold text-amber-400">{rev.rating} ★</span>
                    </div>
                    <p className="mt-1.5 text-slate-300">&ldquo;{rev.comment}&rdquo;</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {formatCustomerDate(rev.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2 / 3): Order History */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-base font-bold text-white">Order History</h2>
                <p className="text-xs text-slate-400">
                  All transactions placed by {user.name}
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No orders placed yet</p>
                <p className="mt-1 text-xs">This customer has not completed any purchases.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th scope="col" className="px-5 py-3">Order Number</th>
                      <th scope="col" className="px-4 py-3">Date</th>
                      <th scope="col" className="px-4 py-3">Items</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Payment</th>
                      <th scope="col" className="px-4 py-3">Amount</th>
                      <th scope="col" className="px-5 py-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="transition hover:bg-slate-800/30">
                        <td className="px-5 py-3.5 font-mono font-bold text-brand">
                          <Link href={`/admin/orders/${ord.id}`} className="hover:underline">
                            {ord.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">
                          {formatCustomerDate(ord.createdAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          {ord.itemsCount} item{ord.itemsCount !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              ord.orderStatus === "DELIVERED"
                                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                                : ord.orderStatus === "CANCELLED"
                                ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-300">
                            {ord.paymentMethod}
                          </span>
                          <span className="ml-1.5 text-[10px] text-slate-500">
                            ({ord.paymentStatus})
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white">
                          {formatTaka(ord.totalAmount)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-brand hover:text-brand transition"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        customer={user}
        onSuccess={() => void refetch()}
      />
    </div>
  );
}
