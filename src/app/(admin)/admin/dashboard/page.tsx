"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Store,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  MoreVertical,
  ChevronRight,
  Filter,
  Sparkles,
  SlidersHorizontal,
  CreditCard,
  Building2,
  ShieldCheck,
  Boxes,
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
  useGetAdminProductsQuery,
  useReviewProductApprovalMutation,
  useGetAdminAnalyticsQuery,
} from "@/redux";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "year">("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real backend products & analytics query for admin
  const { data: adminProductsData, refetch: refetchAdminProducts } = useGetAdminProductsQuery({ limit: 100 });
  const { data: analytics, refetch: refetchAnalytics } = useGetAdminAnalyticsQuery();
  const [reviewProductApproval] = useReviewProductApprovalMutation();

  const allAdminProducts = adminProductsData?.products || [];
  const realPendingProducts = allAdminProducts.filter((p) => p.approvalStatus === "PENDING");

  const grossSales = analytics?.revenue?.grossSales || 0;
  const directSales = analytics?.revenue?.directSalesRevenue || 0;
  const vendorSales = Math.max(0, grossSales - directSales);
  const directPercent = grossSales > 0 ? Math.round((directSales / grossSales) * 100) : 50;
  const vendorPercent = grossSales > 0 ? 100 - directPercent : 50;

  const handleApprove = async (id: string | number) => {
    try {
      await reviewProductApproval({ id, status: "APPROVED" }).unwrap();
      toast.success("Product approved and published successfully.");
      refetchAdminProducts();
      refetchAnalytics();
    } catch {
      toast.error("Failed to approve product");
    }
  };

  const handleReject = async (id: string | number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await reviewProductApproval({ id, status: "REJECTED", rejectionReason: reason }).unwrap();
      toast.info("Product marked as rejected.");
      refetchAdminProducts();
      refetchAnalytics();
    } catch {
      toast.error("Failed to reject product");
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchAdminProducts();
    refetchAnalytics();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Recent Orders Data
  const recentOrders = [
    {
      id: "SHP-9842",
      customer: "Rahim Chowdhury",
      email: "rahim@shopora.com",
      itemsCount: 2,
      store: "Shopora Direct (Platform)",
      isPlatform: true,
      total: 4699,
      paymentMethod: "bKash",
      paymentStatus: "paid",
      orderStatus: "processing",
      date: "12 mins ago",
    },
    {
      id: "SHP-9841",
      customer: "Sadia Akter",
      email: "sadia.akter@shopora.com",
      itemsCount: 1,
      store: "Apex Tech & Gadgets",
      isPlatform: false,
      total: 6200,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending",
      orderStatus: "shipped",
      date: "45 mins ago",
    },
    {
      id: "SHP-9840",
      customer: "Tanvir Hasan",
      email: "tanvir.h@gmail.com",
      itemsCount: 3,
      store: "ByteTech Official",
      isPlatform: false,
      total: 3850,
      paymentMethod: "SSLCommerz / Card",
      paymentStatus: "paid",
      orderStatus: "delivered",
      date: "2 hours ago",
    },
    {
      id: "SHP-9839",
      customer: "Mehnaz Parveen",
      email: "mehnaz@yahoo.com",
      itemsCount: 1,
      store: "Apparel Studio BD",
      isPlatform: false,
      total: 2100,
      paymentMethod: "bKash",
      paymentStatus: "paid",
      orderStatus: "delivered",
      date: "4 hours ago",
    },
    {
      id: "SHP-9838",
      customer: "Farhan Ahmed",
      email: "farhan.a@gmail.com",
      itemsCount: 4,
      store: "Shopora Direct (Platform)",
      isPlatform: true,
      total: 8950,
      paymentMethod: "Nagad",
      paymentStatus: "paid",
      orderStatus: "processing",
      date: "5 hours ago",
    },
  ];

  // Weekly Revenue Chart Bars
  const weeklyRevenue = [
    { day: "Sat", gmv: 52000, orders: 135, height: "65%" },
    { day: "Sun", gmv: 68000, orders: 172, height: "82%" },
    { day: "Mon", gmv: 49000, orders: 120, height: "58%" },
    { day: "Tue", gmv: 84000, orders: 210, height: "100%" },
    { day: "Wed", gmv: 71000, orders: 185, height: "85%" },
    { day: "Thu", gmv: 63000, orders: 154, height: "75%" },
    { day: "Fri", gmv: 98000, orders: 245, height: "115%" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Marketplace Command Center
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Live Production
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time hybrid sales telemetry, multi-vendor splits, inventory, and fulfillment operations.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range pills */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            {(["today", "7d", "30d", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeRange === range
                    ? "bg-brand text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {range === "today"
                  ? "Today"
                  : range === "7d"
                  ? "Last 7D"
                  : range === "30d"
                  ? "Last 30D"
                  : "Year"}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="text-xs gap-1.5"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total GMV */}
        <Card className="hover:border-slate-700 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Gross Merchandise Value
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-white tracking-tight">
                ৳ {(analytics?.revenue?.grossSales ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  Direct: ৳ {(analytics?.revenue?.directSalesRevenue ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Platform Commission:</span>
              <span className="font-bold text-sky-400">
                ৳ {(analytics?.revenue?.platformCommission ?? 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Net Platform Profit */}
        <Card className="hover:border-slate-700 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Platform Net Profit
              </span>
              <div className="h-8 w-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-white tracking-tight">
                ৳ {(analytics?.revenue?.netPlatformProfit ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {analytics?.revenue?.profitMarginPercent ?? 0}% Margin
                </span>
                <span className="text-[11px] text-slate-400">Realized Profit</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Direct Retail Profit:</span>
              <span className="font-bold text-emerald-400">
                ৳ {(analytics?.revenue?.directSalesProfit ?? 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Active Stock Investment */}
        <Card className="hover:border-slate-700 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Active Stock Investment
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-white tracking-tight">
                ৳ {(analytics?.revenue?.activeStockInvestment ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-amber-400">
                  Shopora Direct Inventory
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Total Ecosystem Capital:</span>
              <span className="font-bold text-sky-400">
                ৳ {(analytics?.revenue?.totalCatalogInvestment ?? 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Total Orders */}
        <Card className="hover:border-slate-700 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Orders
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {(analytics?.orders?.total ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  {analytics?.orders?.delivered ?? 0} Delivered
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Pending Fulfillment:</span>
              <span className="font-bold text-amber-400">
                {analytics?.orders?.pending ?? 0} Orders
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts & Hybrid Split Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Visual Chart (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <span>Weekly Revenue & Sales Volume</span>
                <Badge variant="brand" className="text-[10px] font-mono">
                  BDT (৳)
                </Badge>
              </CardTitle>
              <CardDescription>
                Gross sales progression across direct and vendor channels over the last 7 days.
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">৳ 4,85,000</p>
              <p className="text-[10px] text-emerald-400 font-semibold">
                Avg ৳ 69,285 / day
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {/* Visual Bar Chart */}
            <div className="h-56 pt-6 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-800">
              {weeklyRevenue.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded text-center pointer-events-none whitespace-nowrap">
                    <p className="font-bold text-white">৳{item.gmv.toLocaleString()}</p>
                    <p className="text-slate-400">{item.orders} orders</p>
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end group-hover:bg-slate-700 transition">
                    <div
                      style={{ height: item.height }}
                      className="w-full bg-gradient-to-t from-brand-deep to-brand rounded-t-lg transition-all duration-500 group-hover:from-sky-500 group-hover:to-cyan-400"
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-white transition">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Chart Legend & Insights */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-brand" />
                  <span>Platform Revenue (42%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-brand-deep" />
                  <span>Vendor Marketplace (58%)</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">
                Peak Sales Day: <strong className="text-white">Friday (৳ 98,000)</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Vendor vs Direct Platform Split Breakdown (1 Col) */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-white">
              Marketplace Model Split
            </CardTitle>
            <CardDescription>
              Hybrid balance between Shopora Direct retail and 3rd-party sellers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Split 1: Channel Revenue */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-sky-400">Shopora Direct (Self)</span>
                <span className="text-purple-400">Vendor Network (3rd Party)</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-brand" style={{ width: `${directPercent}%` }} />
                <div className="h-full bg-purple-500" style={{ width: `${vendorPercent}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>৳ {directSales.toLocaleString()} ({directPercent}%)</span>
                <span>৳ {vendorSales.toLocaleString()} ({vendorPercent}%)</span>
              </div>
            </div>

            {/* Split 2: Order Fulfillment */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-300">Central Warehouse</span>
                <span className="text-slate-300">Seller Drop-ship</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: "65%" }} />
                <div className="h-full bg-amber-500" style={{ width: "35%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>811 orders (65%)</span>
                <span>437 orders (35%)</span>
              </div>
            </div>

            {/* Payment Gateway Distribution */}
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 space-y-2">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-brand" />
                Payment Gateways Breakdown
              </p>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-950 p-2 rounded border border-slate-850">
                  <p className="text-[10px] text-slate-400">bKash</p>
                  <p className="text-xs font-bold text-pink-400 mt-0.5">54%</p>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-850">
                  <p className="text-[10px] text-slate-400">Cash on Del</p>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">36%</p>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-850">
                  <p className="text-[10px] text-slate-400">Cards/SSL</p>
                  <p className="text-xs font-bold text-sky-400 mt-0.5">10%</p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 rounded-b-xl flex items-center justify-between text-xs">
            <span className="text-slate-400">Net Profit Margin:</span>
            <span className="font-bold text-emerald-400">
              {analytics?.revenue?.profitMarginPercent ?? 0}% (Healthy)
            </span>
          </div>
        </Card>
      </div>

      {/* Product Moderation & Verification Queue (Crucial Multi-Vendor Feature) */}
      <Card className="border-amber-500/20 bg-slate-950/90">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-white">
                Seller Product Moderation Queue
              </CardTitle>
              <Badge variant="warning" className="text-[10px] font-bold">
                Action Required
              </Badge>
            </div>
            <CardDescription>
              Review and approve or reject products submitted by verified sellers before they appear on the customer storefront.
            </CardDescription>
          </div>
          <Link
            href="/admin/products?filter=pending"
            className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>View All Pending ({realPendingProducts.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">Vendor Store</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price / MSRP</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {realPendingProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1.5" />
                      <p className="font-semibold text-white">No products awaiting approval</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">All vendor submitted products have been reviewed.</p>
                    </td>
                  </tr>
                ) : (
                  realPendingProducts.slice(0, 5).map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {prod.mainImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prod.mainImage}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-xs sm:max-w-md">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              SKU: {prod.sku || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                          <Store className="h-3 w-3 text-purple-400" />
                          {prod.seller?.storeName || "Vendor"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{prod.category?.name || "General"}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">
                          ৳ {prod.basePrice.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(prod.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="xs"
                            variant="brand"
                            onClick={() => handleApprove(prod.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => handleReject(prod.id)}
                            className="gap-1 cursor-pointer"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders Live Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-white">
              Recent Marketplace Orders
            </CardTitle>
            <CardDescription>
              Live stream of customer purchases across Shopora Direct and verified vendor stores.
            </CardDescription>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>View All 1,248 Orders</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fulfillment Source</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Placed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {recentOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {ord.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{ord.customer}</p>
                      <p className="text-[11px] text-slate-400">{ord.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {ord.isPlatform ? (
                        <Badge variant="brand" className="text-[10px]">
                          Shopora Direct
                        </Badge>
                      ) : (
                        <Badge variant="purple" className="text-[10px]">
                          {ord.store}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ৳ {ord.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <Badge
                          variant={
                            ord.paymentStatus === "paid" ? "success" : "warning"
                          }
                          className="text-[10px]"
                        >
                          {ord.paymentStatus.toUpperCase()}
                        </Badge>
                        <p className="text-[10px] text-slate-400">{ord.paymentMethod}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ord.orderStatus === "delivered"
                            ? "success"
                            : ord.orderStatus === "shipped"
                            ? "brand"
                            : "warning"
                        }
                        className="text-[10px] capitalize"
                      >
                        {ord.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {ord.date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 inline-flex transition"
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Administrative Operations Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/products/new"
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Add New Product</p>
            <p className="text-[11px] text-slate-400">Direct or vendor upload</p>
          </div>
        </Link>

        <Link
          href="/admin/attributes"
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Attribute Combinations</p>
            <p className="text-[11px] text-slate-400">Cartesian variant generator</p>
          </div>
        </Link>

        <Link
          href="/admin/sellers/kyc"
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">KYC Verification</p>
            <p className="text-[11px] text-slate-400">3 vendors awaiting review</p>
          </div>
        </Link>

        <Link
          href="/admin/payouts"
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700 transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Vendor Payouts</p>
            <p className="text-[11px] text-slate-400">Process wallet withdrawals</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
