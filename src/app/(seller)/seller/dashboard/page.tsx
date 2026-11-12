"use client";

import React from "react";
import Link from "next/link";
import {
  Wallet,
  Clock,
  TrendingUp,
  Package,
  ShoppingBag,
  Plus,
  ArrowRight,
  Palmtree,
  CheckCircle2,
  AlertCircle,
  Truck,
  ExternalLink,
  ShieldAlert,
  Boxes,
  DollarSign,
  ArrowUpRight,
  BadgeAlert,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  useGetSellerDashboardStatsQuery,
  useUpdateSellerProfileMutation,
  useGetNotificationsQuery,
} from "@/redux";
import { toast } from "sonner";
import { formatTaka } from "@/lib/money";

export default function SellerDashboardPage() {
  const { data: dashboard, isLoading, refetch } = useGetSellerDashboardStatsQuery();
  const { data: notifData } = useGetNotificationsQuery({ limit: 10, isRead: false });
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateSellerProfileMutation();

  const metrics = dashboard?.metrics;
  const profile = dashboard?.profile;
  const recentOrders = dashboard?.recentOrders || [];

  const unreadNotifs = notifData?.notifications || [];
  const adminNotices = unreadNotifs.filter((n) => n.type === "SYSTEM");

  const handleToggleHolidayMode = async () => {
    if (!profile) return;
    try {
      const nextMode = !profile.isHolidayMode;
      await updateProfile({
        isHolidayMode: nextMode,
        holidayMessage: nextMode
          ? profile.holidayMessage || "Our store is taking a short holiday break. We will resume shipping shortly."
          : null,
      }).unwrap();
      toast.success(
        nextMode
          ? "Vacation Mode enabled. Products are temporarily hidden from storefront."
          : "Vacation Mode disabled. Products are now live on the storefront!"
      );
      refetch();
    } catch {
      toast.error("Failed to update vacation mode status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-card rounded-2xl border border-border" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card rounded-2xl border border-border" />
          ))}
        </div>
        <div className="h-64 bg-card rounded-2xl border border-border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Official Admin Notices & Warnings Alert Banner */}
      {adminNotices.length > 0 && (
        <div className="space-y-3">
          {adminNotices.map((notice) => (
            <Card
              key={notice.id}
              className="border-2 border-amber-500/40 bg-amber-500/10 animate-in fade-in"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider"
                      >
                        ⚠️ Official Admin Notice / Warning
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{notice.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {notice.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link href="/seller/notifications">
                    <Button size="sm" variant="brand" className="text-xs h-8">
                      View In Notices
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Account Pending Approval Notice Banner */}
      {profile && profile.status === "PENDING" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-300">
                  Seller Account Pending Approval
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your store registration has been submitted and is currently pending review by platform administrators.
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs px-2.5 py-1 shrink-0"
            >
              Under Review
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Holiday Mode Notice Banner (if active) */}
      {profile?.isHolidayMode && (
        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
                <Palmtree className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-300">
                  Vacation Mode is Active
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile.holidayMessage || "Your products are temporarily paused from storefront searches and new orders."}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleHolidayMode}
              disabled={isUpdatingProfile}
              className="border-amber-500/40 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-semibold shrink-0"
            >
              End Vacation Mode
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hero Welcome & Quick Actions */}
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                {profile?.storeName || "My Store"}
              </h1>
              {profile?.status === "APPROVED" ? (
                <Badge
                  variant="outline"
                  className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]"
                >
                  Active Merchant
                </Badge>
              ) : profile?.status === "PENDING" ? (
                <Badge
                  variant="outline"
                  className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px]"
                >
                  Pending Approval
                </Badge>
              ) : profile?.status === "REJECTED" ? (
                <Badge variant="destructive" className="text-[10px]">
                  Application Rejected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground border-border bg-muted text-[10px]">
                  {profile?.status || "Partner"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your inventory, fulfill customer orders, and track your escrow earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/seller/products/new">
              <Button size="sm" variant="brand" className="gap-1.5 text-xs font-bold">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Link href="/seller/orders">
              <Button size="sm" variant="outline" className="border-border text-xs">
                View Orders
              </Button>
            </Link>
            {profile?.storeSlug && (
              <Link href={`/vendors/${profile.storeSlug}`} target="_blank">
                <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground gap-1">
                  Storefront
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Investment & Profit Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Stock Investment */}
        <Card className="border-border bg-card hover:border-brand/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Active Stock Investment
              </span>
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Boxes className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                ৳{metrics?.activeStockInvestment ? metrics.activeStockInvestment.toLocaleString() : 0}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px]">
                <span className="text-muted-foreground">Capital tied in inventory</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">Asset Value</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gross Sales Revenue */}
        <Card className="border-border bg-card hover:border-purple-500/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Gross Sales Revenue
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                ৳{metrics?.grossSales ? metrics.grossSales.toLocaleString() : 0}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px]">
                <span className="text-muted-foreground">COGS (মালের কেনা দাম):</span>
                <span className="font-bold text-foreground">
                  ৳{metrics?.costOfGoodsSold ? metrics.costOfGoodsSold.toLocaleString() : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Realized Net Profit */}
        <Card className="border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Shop Net Profit (আসল লাভ)
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ৳{metrics?.netProfit ? metrics.netProfit.toLocaleString() : 0}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                <span className="text-muted-foreground">Net Profit Margin:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {metrics?.profitMarginPercent ? `${metrics.profitMarginPercent}% Margin` : "0% Margin"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <Card className="border-border bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Available Balance</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                {formatTaka(metrics?.availableBalance)}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground">Ready for payout</span>
                <Link
                  href="/seller/wallet"
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  Withdraw <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Escrow Balance */}
        <Card className="border-border bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">7-Day Escrow Hold</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatTaka(metrics?.pendingBalance)}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground">Maturing orders</span>
                <Link
                  href="/seller/wallet"
                  className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                >
                  Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-border bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Shipments & Orders</span>
              <div className="p-2 rounded-xl bg-brand/10 text-brand">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                {metrics?.totalOrders || 0}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  {metrics?.pendingOrders || 0} pending fulfillment
                </span>
                <Link
                  href="/seller/orders"
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Products */}
        <Card className="border-border bg-card hover:border-border/80 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Catalog Products</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-foreground">
                {metrics?.totalProducts || 0}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {metrics?.approvedProducts || 0} live approved
                </span>
                <Link
                  href="/seller/products"
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  Catalog <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Highlights: Courier Logistics & Vacation Quick Switch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Logistics Automation Card */}
        <Card className="border-border bg-card md:col-span-2 flex flex-col justify-between">
          <CardContent className="p-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Automated Courier Dispatch</h3>
                  <p className="text-xs text-muted-foreground">
                    Direct consignment booking with Steadfast & Pathao. Generate shipping labels and tracking codes in 1 click.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="font-semibold text-foreground">Daraz-Style Split Shipping</div>
                  <div className="text-muted-foreground text-[11px] mt-1">
                    Customers pay shipping per vendor package. Your packages are tracked independently.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <div className="font-semibold text-foreground">Thermal Packaging Slips</div>
                  <div className="text-muted-foreground text-[11px] mt-1">
                    Ready-to-print 4x6" thermal labels with barcode, customer address, and vendor manifest.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <Link href="/seller/orders">
                <Button size="sm" variant="outline" className="text-xs border-border">
                  Process Shipments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Store Autonomy & Holiday Mode */}
        <Card className="border-border bg-card flex flex-col justify-between">
          <CardContent className="p-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Palmtree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Vacation Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Planning a holiday or temporary break?
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Enabling vacation mode temporarily removes your listings from search so your fulfillment score isn&apos;t penalized.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Status: {profile?.isHolidayMode ? "Active" : "Disabled"}
              </span>
              <Button
                size="sm"
                variant={profile?.isHolidayMode ? "destructive" : "outline"}
                onClick={handleToggleHolidayMode}
                disabled={isUpdatingProfile}
                className="text-xs"
              >
                {profile?.isHolidayMode ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent SubOrders Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/20">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Recent Orders</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              SubOrders assigned to your shop
            </CardDescription>
          </div>
          <Link href="/seller/orders">
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground">
              View All Orders
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs space-y-2">
              <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="font-semibold text-foreground">No customer orders received yet</p>
              <p className="text-[11px]">Keep your catalog updated to drive sales and visibility!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border">
                    <TableHead className="text-xs font-semibold">Order Number</TableHead>
                    <TableHead className="text-xs font-semibold">Customer</TableHead>
                    <TableHead className="text-xs font-semibold">Net Earnings</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-border hover:bg-muted/40 transition-colors">
                      <TableCell className="font-bold text-foreground">
                        {order.subOrderNumber || order.orderNumber || order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {order.customerName || "Customer"}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatTaka(order.sellerEarnings)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "DELIVERED"
                              ? "success"
                              : order.status === "CANCELLED"
                              ? "destructive"
                              : order.status === "SHIPPED"
                              ? "brand"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/seller/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-[11px] border-border hover:bg-muted">
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
