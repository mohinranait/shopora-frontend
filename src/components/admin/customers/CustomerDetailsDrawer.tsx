"use client";

import React, { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CustomerDetailsDrawerProps {
  customerId: string | number | null;
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
      <Sheet open={isOpen && Boolean(customerId)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-card">
          {/* Header */}
          <SheetHeader className="border-b border-border px-6 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <ShoppingBag className="h-4 w-4" />
              </span>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">
                  Customer Profile
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  ID #{customerId}
                </SheetDescription>
              </div>
            </div>
            {customerId && (
              <div className="flex items-center gap-2 pr-6">
                <Link
                  href={`/admin/customers/${customerId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-brand hover:text-brand"
                  title="Open full page view"
                >
                  <span>Full Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </SheetHeader>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
                <p className="text-sm">Loading customer information...</p>
              </div>
            ) : isError || !user ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-500">
                <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                <h3 className="font-bold text-foreground">Failed to load customer details</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Customer record could not be retrieved.
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                {/* 1. Profile Overview Card */}
                <Card className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-deep to-sky-600 text-lg font-black text-white shadow-xs">
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                          <h3 className="text-lg font-bold text-foreground">{user.name}</h3>
                          <CustomerRoleBadge role={user.role} />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
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
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                      className="text-xs gap-1.5"
                    >
                      <UserCog className="h-3.5 w-3.5 text-brand" />
                      Edit Profile
                    </Button>

                    <Button
                      type="button"
                      variant={user.isActive ? "destructive" : "brand"}
                      size="sm"
                      onClick={handleToggleStatus}
                      disabled={isToggling}
                      className="text-xs gap-1.5"
                    >
                      {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : user.isActive ? (
                        <XCircle className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {user.isActive ? "Suspend Account" : "Activate Account"}
                    </Button>
                  </div>
                </Card>

                {/* 2. Stat Highlights Grid */}
                {stats && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Card className="p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-muted-foreground">Total Orders</p>
                      <p className="mt-1 text-lg font-black text-foreground">{stats.totalOrders}</p>
                    </Card>
                    <Card className="p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-muted-foreground">Total Spent</p>
                      <p className="mt-1 text-lg font-black text-brand">
                        {formatTaka(stats.totalSpent)}
                      </p>
                    </Card>
                    <Card className="p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-emerald-500">Delivered</p>
                      <p className="mt-1 text-lg font-black text-foreground">{stats.deliveredOrders}</p>
                    </Card>
                    <Card className="p-3.5 text-center">
                      <p className="text-[11px] font-semibold text-rose-500">Cancelled</p>
                      <p className="mt-1 text-lg font-black text-foreground">{stats.cancelledOrders}</p>
                    </Card>
                  </div>
                )}

                {/* 3. Saved Addresses */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <MapPin className="h-4 w-4 text-brand" />
                      Saved Delivery Addresses ({addresses.length})
                    </h4>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      No addresses saved for this customer yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="rounded-xl border border-border bg-card p-3.5 text-xs text-foreground transition hover:border-brand/40"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand border border-brand/20">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-muted-foreground">
                            {addr.streetAddress}, {addr.city}
                            {addr.state ? `, ${addr.state}` : ""}
                            {addr.postalCode ? ` - ${addr.postalCode}` : ""}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
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
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Package className="h-4 w-4 text-brand" />
                      Order History ({orders.length})
                    </h4>
                  </div>

                  {orders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      This customer has not placed any orders yet.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                      <div className="divide-y divide-border">
                        {orders.map((ord) => (
                          <div
                            key={ord.id}
                            className="flex items-center justify-between p-3.5 transition hover:bg-muted/40"
                          >
                            <div>
                              <Link
                                href={`/admin/orders/${ord.id}`}
                                className="font-mono text-xs font-bold text-brand hover:underline"
                              >
                                {ord.orderNumber}
                              </Link>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {formatCustomerDate(ord.createdAt)} &bull; {ord.itemsCount} item
                                {ord.itemsCount !== 1 ? "s" : ""}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs font-bold text-foreground">
                                  {formatTaka(ord.totalAmount)}
                                </p>
                                <span
                                  className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                    ord.orderStatus === "DELIVERED"
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : ord.orderStatus === "CANCELLED"
                                      ? "bg-rose-500/10 text-rose-500"
                                      : "bg-amber-500/10 text-amber-500"
                                  }`}
                                >
                                  {ord.orderStatus}
                                </span>
                              </div>
                              <Link
                                href={`/admin/orders/${ord.id}`}
                                className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
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
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Star className="h-4 w-4 text-amber-500" />
                      Product Reviews ({reviews.length})
                    </h4>
                    <div className="space-y-2">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-xl border border-border bg-card p-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">
                              {rev.product?.name || "Product"}
                            </span>
                            <span className="flex items-center text-amber-500 font-bold">
                              {rev.rating} ★
                            </span>
                          </div>
                          <p className="mt-1 text-muted-foreground">&ldquo;{rev.comment}&rdquo;</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
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
        </SheetContent>
      </Sheet>

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
