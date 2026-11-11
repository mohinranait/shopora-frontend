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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Card className="border-border bg-card">
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

export default function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;

  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAdminCustomerQuery(customerId, {
    skip: !customerId,
  });

  const [toggleStatus, { isLoading: isToggling }] = useToggleCustomerStatusMutation();

  if (!customerId) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <h2 className="text-lg font-bold text-foreground">Invalid Customer ID</h2>
        <Button asChild className="bg-brand-deep font-semibold text-white hover:bg-brand">
          <Link href="/admin/customers">Return to Customer Directory</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm">Loading customer profile details…</p>
      </div>
    );
  }

  if (isError || !data?.user) {
    return (
      <Card className="mx-auto max-w-lg border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-500">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-foreground">Customer Not Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The requested customer profile could not be found or has been removed.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/customers">Back to Customers</Link>
          </Button>
          <Button
            size="sm"
            onClick={() => refetch()}
            className="bg-brand-deep font-semibold text-white hover:bg-brand"
          >
            Retry
          </Button>
        </div>
      </Card>
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customer Directory</span>
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Customer Header Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-deep to-sky-600 text-2xl font-black text-white ring-4 ring-black/5 dark:ring-white/10">
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
                  <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                    {user.name}
                  </h1>
                  <CustomerRoleBadge role={user.role} />
                  <CustomerStatusBadge isActive={user.isActive} />
                  <CustomerVerifiedBadge isVerified={user.isVerified} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`mailto:${user.email}`} className="hover:text-brand transition">
                      {user.email}
                    </a>
                  </span>
                  {user.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <a href={`tel:${user.phone}`} className="hover:text-brand transition">
                        {user.phone}
                      </a>
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">No phone provided</span>
                  )}
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Customer since {formatCustomerDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2 bg-brand-deep font-bold text-white hover:bg-brand"
              >
                <UserCog className="h-4 w-4" />
                <span>Edit Customer</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={`gap-2 font-bold transition ${
 user.isActive
 ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
 : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
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
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Total Orders"
          value={String(stats.totalOrders)}
          tone="bg-brand-deep/15 text-brand ring-1 ring-brand/30"
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Total Spend"
          value={formatTaka(stats.totalSpent)}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20"
        />
        <StatCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="Delivered Orders"
          value={String(stats.deliveredOrders)}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Cancelled Orders"
          value={String(stats.cancelledOrders)}
          tone="bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20"
        />
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (1 / 3): Customer Info & Addresses */}
        <div className="space-y-6 lg:col-span-1">
          {/* Account Meta Card */}
          <Card className="border-border bg-card">
            <CardHeader className="p-5 pb-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <dl className="divide-y divide-border text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Account ID</dt>
                  <dd className="font-mono font-bold text-foreground">#{user.id}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd>
                    <CustomerRoleBadge role={user.role} />
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Account Status</dt>
                  <dd>
                    <CustomerStatusBadge isActive={user.isActive} />
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Email Verification</dt>
                  <dd>
                    <CustomerVerifiedBadge isVerified={user.isVerified} />
                  </dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Registration Date</dt>
                  <dd className="text-foreground">{formatCustomerDate(user.createdAt)}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-muted-foreground">Last Profile Update</dt>
                  <dd className="text-foreground">{formatCustomerDate(user.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Saved Addresses Card */}
          <Card className="border-border bg-card">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-4 w-4 text-brand" />
                Delivery Addresses ({addresses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {addresses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No delivery addresses on file.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-foreground transition hover:border-border/80"
                    >
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>{addr.fullName}</span>
                        {addr.isDefault && (
                          <Badge variant="outline" className="border-brand/30 bg-brand-deep/15 text-[10px] font-bold text-brand">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {addr.streetAddress}, {addr.city}
                        {addr.state ? `, ${addr.state}` : ""}
                        {addr.postalCode ? ` - ${addr.postalCode}` : ""}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Reviews Card (if any) */}
          {reviews.length > 0 && (
            <Card className="border-border bg-card">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Star className="h-4 w-4 text-amber-500" />
                  Recent Product Reviews ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {rev.product?.name || "Product"}
                      </span>
                      <span className="font-bold text-amber-500">{rev.rating} ★</span>
                    </div>
                    <p className="mt-1.5 text-foreground/90">&ldquo;{rev.comment}&rdquo;</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatCustomerDate(rev.createdAt)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (2 / 3): Order History */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border p-5">
              <div>
                <CardTitle className="text-base font-bold text-foreground">Order History</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  All transactions placed by {user.name}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="px-3 py-1 text-xs font-bold">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">No orders placed yet</p>
                  <p className="mt-1 text-xs">This customer has not completed any purchases.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="border-b border-border bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Order Number</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Items</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {orders.map((ord) => (
                      <TableRow key={ord.id} className="border-border hover:bg-muted/40">
                        <TableCell className="font-mono font-bold text-brand">
                          <Link href={`/admin/orders/${ord.id}`} className="hover:underline">
                            {ord.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatCustomerDate(ord.createdAt)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {ord.itemsCount} item{ord.itemsCount !== 1 ? "s" : ""}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ord.orderStatus === "DELIVERED"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : ord.orderStatus === "CANCELLED"
                                ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }
                          >
                            {ord.orderStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-foreground">
                            {ord.paymentMethod}
                          </span>
                          <span className="ml-1.5 text-[10px] text-muted-foreground">
                            ({ord.paymentStatus})
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {formatTaka(ord.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 px-2.5 text-xs hover:border-brand hover:text-brand"
                          >
                            <Link href={`/admin/orders/${ord.id}`}>
                              <span>Inspect</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
