"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Star,
  UserCog,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
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
} from "./CustomerBadges";
import { EditCustomerDialog } from "./EditCustomerDialog";

interface CustomerDetailsDrawerProps {
  customerId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailsDrawer({
  customerId,
  isOpen,
  onClose,
}: CustomerDetailsDrawerProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch full customer details when opened
  const { data, isLoading, isError, refetch } = useGetAdminCustomerQuery(customerId!, {
    skip: !customerId || !isOpen,
  });

  const [toggleStatus, { isLoading: isToggling }] = useToggleCustomerStatusMutation();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !customerId) return null;

  const user = data?.user;
  const addresses = data?.addresses ?? [];
  const orders = data?.orders ?? [];
  const reviews = data?.reviews ?? [];
  const stats = data?.stats;

  const handleToggleStatus = async () => {
    if (!user) return;
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
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-label="Customer profile details"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Slide-over Drawer Panel */}
        <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-slate-900 text-slate-100 shadow-2xl transition-transform">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-brand ring-1 ring-slate-700">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white">Customer Profile</h2>
                <p className="text-xs text-slate-400">ID #{customerId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/customers/${customerId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-brand hover:text-brand"
                title="Open full page view"
              >
                <span>Full Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-sm">Loading customer information...</p>
              </div>
            ) : isError || !user ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-400">
                <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                <h3 className="font-bold text-white">Failed to load customer details</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Customer record could not be retrieved.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* 1. Profile Overview Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-deep to-sky-600 text-lg font-black text-white shadow-md ring-2 ring-white/10">
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
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{user.name}</h3>
                          <CustomerRoleBadge role={user.role} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-500" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-500" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <CustomerStatusBadge isActive={user.isActive} />
                      <CustomerVerifiedBadge isVerified={user.isVerified} />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-700/60 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditDialogOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                    >
                      <UserCog className="h-3.5 w-3.5 text-brand" />
                      Edit Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        user.isActive
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : user.isActive ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {user.isActive ? "Suspend Account" : "Activate Account"}
                    </button>
                  </div>
                </div>

                {/* 2. Stat Highlights Grid */}
                {stats && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-slate-400">Total Orders</p>
                      <p className="mt-1 text-lg font-black text-white">{stats.totalOrders}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-slate-400">Total Spent</p>
                      <p className="mt-1 text-lg font-black text-brand">
                        {formatTaka(stats.totalSpent)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-emerald-400">Delivered</p>
                      <p className="mt-1 text-lg font-black text-white">{stats.deliveredOrders}</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-rose-400">Cancelled</p>
                      <p className="mt-1 text-lg font-black text-white">{stats.cancelledOrders}</p>
                    </div>
                  </div>
                )}

                {/* 3. Saved Addresses */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <MapPin className="h-4 w-4 text-brand" />
                      Saved Delivery Addresses ({addresses.length})
                    </h4>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                      No addresses saved for this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 text-xs text-slate-300 transition hover:border-slate-700"
                        >
                          <div className="flex items-center justify-between font-semibold text-white">
                            <span>{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="rounded-md bg-brand-deep/20 px-2 py-0.5 text-[10px] font-bold text-brand ring-1 ring-brand/30">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-slate-400">
                            {addr.streetAddress}, {addr.city}
                            {addr.state ? `, ${addr.state}` : ""}
                            {addr.postalCode ? ` - ${addr.postalCode}` : ""}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-slate-500">
                            <Phone className="h-3 w-3" />
                            {addr.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Recent Orders Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Package className="h-4 w-4 text-brand" />
                      Order History ({orders.length})
                    </h4>
                  </div>

                  {orders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                      This customer has not placed any orders yet.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-800/30">
                      <div className="divide-y divide-slate-800/60">
                        {orders.map((ord) => (
                          <div
                            key={ord.id}
                            className="flex items-center justify-between p-3.5 transition hover:bg-slate-800/50"
                          >
                            <div>
                              <Link
                                href={`/admin/orders/${ord.id}`}
                                className="font-mono text-xs font-bold text-brand hover:underline"
                              >
                                {ord.orderNumber}
                              </Link>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {formatCustomerDate(ord.createdAt)} &bull; {ord.itemsCount} item
                                {ord.itemsCount !== 1 ? "s" : ""}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs font-bold text-white">
                                  {formatTaka(ord.totalAmount)}
                                </p>
                                <span
                                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    ord.orderStatus === "DELIVERED"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : ord.orderStatus === "CANCELLED"
                                      ? "bg-rose-500/10 text-rose-400"
                                      : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {ord.orderStatus}
                                </span>
                              </div>
                              <Link
                                href={`/admin/orders/${ord.id}`}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                                title="View Order"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Product Reviews (if any) */}
                {reviews.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Star className="h-4 w-4 text-amber-400" />
                      Product Reviews ({reviews.length})
                    </h4>
                    <div className="space-y-2">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-xl border border-slate-800 bg-slate-800/30 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">
                              {rev.product?.name || "Product"}
                            </span>
                            <span className="flex items-center text-amber-400">
                              {rev.rating} ★
                            </span>
                          </div>
                          <p className="mt-1 text-slate-300">&ldquo;{rev.comment}&rdquo;</p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {formatCustomerDate(rev.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {user && (
        <EditCustomerDialog
          isOpen={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          customer={user}
          onSuccess={() => void refetch()}
        />
      )}
    </>
  );
}
