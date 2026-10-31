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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetSellerDashboardStatsQuery,
  useUpdateSellerProfileMutation,
} from "@/redux";
import { toast } from "sonner";

export default function SellerDashboardPage() {
  const { data: dashboard, isLoading, refetch } = useGetSellerDashboardStatsQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateSellerProfileMutation();

  const metrics = dashboard?.metrics;
  const profile = dashboard?.profile;
  const recentOrders = dashboard?.recentOrders || [];

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
        <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="h-64 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Holiday Mode Notice Banner (if active) */}
      {profile?.isHolidayMode && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Palmtree className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">Vacation Mode is Active</h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {profile.holidayMessage || "Your products are temporarily paused from storefront searches and new orders."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleHolidayMode}
            disabled={isUpdatingProfile}
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold shrink-0"
          >
            End Vacation Mode
          </Button>
        </div>
      )}

      {/* Hero Welcome & Quick Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {profile?.storeName || "My Store"}
            </h1>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
              Active Merchant
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
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
            <Button size="sm" variant="outline" className="border-slate-700 text-xs">
              View Orders
            </Button>
          </Link>
          {profile?.storeSlug && (
            <Link href={`/stores/${profile.storeSlug}`} target="_blank">
              <Button size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-white gap-1">
                Storefront
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Available Balance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              ৳{metrics?.availableBalance ? metrics.availableBalance.toLocaleString() : 0}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500">Ready for withdrawal</span>
              <Link
                href="/seller/wallet"
                className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                Withdraw <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* 7-Day Escrow Balance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">7-Day Escrow Hold</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-300">
              ৳{metrics?.pendingBalance ? metrics.pendingBalance.toLocaleString() : 0}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500">Delivered & maturing</span>
              <Link
                href="/seller/wallet"
                className="text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-1"
              >
                Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Shipments & Orders</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {metrics?.totalOrders || 0}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-amber-400 font-semibold">
                {metrics?.pendingOrders || 0} requiring fulfillment
              </span>
              <Link
                href="/seller/orders"
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Catalog Products</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {metrics?.totalProducts || 0}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-emerald-400">
                {metrics?.approvedProducts || 0} live approved
              </span>
              <Link
                href="/seller/products"
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                Catalog <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Highlights: Courier Logistics & Vacation Quick Switch */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Logistics Automation Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Automated Courier Dispatch</h3>
                <p className="text-xs text-slate-400">
                  Direct consignment booking with Steadfast & Pathao. Generate shipping labels and tracking codes in 1 click.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="font-semibold text-slate-300">Daraz-Style Split Shipping</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Customers pay shipping per vendor package. Your packages are tracked independently.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="font-semibold text-slate-300">Thermal Packaging Slips</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Ready-to-print 4x6" thermal labels with barcode, customer address, and vendor manifest.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <Link href="/seller/orders">
              <Button size="sm" variant="outline" className="text-xs border-slate-700">
                Process Shipments
              </Button>
            </Link>
          </div>
        </div>

        {/* Store Autonomy & Holiday Mode */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Palmtree className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Vacation Mode</h3>
                <p className="text-xs text-slate-400">
                  Planning a holiday or temporary break?
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Enabling vacation mode temporarily removes your listings from search so your fulfillment score isn&apos;t penalized.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              {profile?.isHolidayMode ? "Active" : "Disabled"}
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
        </div>
      </div>

      {/* Recent SubOrders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Recent Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              SubOrders assigned to your shop
            </p>
          </div>
          <Link href="/seller/orders">
            <Button size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-white">
              View All Orders
            </Button>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <ShoppingBag className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            No customer orders received yet. Keep your catalog updated to drive sales!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Net Earnings</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      {order.subOrderNumber || order.orderNumber || order.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {order.customerName || "Customer"}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      ৳{order.sellerEarnings ? order.sellerEarnings.toLocaleString() : 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          order.status === "DELIVERED"
                            ? "success"
                            : order.status === "CANCELLED"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/seller/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] border-slate-700">
                          Manage
                        </Button>
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
  );
}
