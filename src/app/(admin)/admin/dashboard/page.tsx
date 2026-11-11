"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Store,
  Package,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  ChevronRight,
  SlidersHorizontal,
  CreditCard,
  ShieldCheck,
  Boxes,
  BarChart3,
  LineChart as LineChartIcon,
  AlertTriangle,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  useGetAdminProductsQuery,
  useReviewProductApprovalMutation,
  useGetAdminAnalyticsQuery,
} from "@/redux";
import { toast } from "sonner";

const chartConfig: ChartConfig = {
  gmv: {
    label: "Sales (৳)",
    color: "#3890d0",
  },
  orders: {
    label: "Orders",
    color: "#8b5cf6",
  },
};

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<"today" | "7d" | "30d" | "year">("7d");
  const [chartType, setChartType] = useState<"bar" | "area">("bar");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Rejection Dialog State
  const [rejectingProductId, setRejectingProductId] = useState<string | number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

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

  const handleOpenReject = (id: string | number) => {
    setRejectingProductId(id);
    setRejectionReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectingProductId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason for the seller.");
      return;
    }
    try {
      setIsRejecting(true);
      await reviewProductApproval({
        id: rejectingProductId,
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      }).unwrap();
      toast.info("Product marked as rejected.");
      setRejectingProductId(null);
      setRejectionReason("");
      refetchAdminProducts();
      refetchAnalytics();
    } catch {
      toast.error("Failed to reject product");
    } finally {
      setIsRejecting(false);
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

  // Weekly Revenue Chart Data
  const weeklyRevenue = [
    { day: "Sat", gmv: 52000, orders: 135 },
    { day: "Sun", gmv: 68000, orders: 172 },
    { day: "Mon", gmv: 49000, orders: 120 },
    { day: "Tue", gmv: 84000, orders: 210 },
    { day: "Wed", gmv: 71000, orders: 185 },
    { day: "Thu", gmv: 63000, orders: 154 },
    { day: "Fri", gmv: 98000, orders: 245 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Marketplace Command Center
            </h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              Live Production
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time hybrid sales telemetry, multi-vendor splits, inventory, and fulfillment operations.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range pills */}
          <div className="flex items-center bg-muted/60 border border-border rounded-lg p-0.5 text-xs font-semibold">
            {(["today", "7d", "30d", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
 timeRange === range
 ? "bg-brand text-white "
 : "text-muted-foreground hover:text-foreground"
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
            className="text-xs gap-1.5 cursor-pointer"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-brand" : "text-muted-foreground"}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button size="sm" variant="outline" className="text-xs gap-1.5 cursor-pointer">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total GMV */}
        <Card className="hover:border-brand/40 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Gross Merchandise Value
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-foreground tracking-tight">
                ৳ {(analytics?.revenue?.grossSales ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-emerald-500 flex items-center">
                  Direct: ৳ {(analytics?.revenue?.directSalesRevenue ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Platform Commission:</span>
              <span className="font-bold text-brand">
                ৳ {(analytics?.revenue?.platformCommission ?? 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Net Platform Profit */}
        <Card className="hover:border-brand/40 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Platform Net Profit
              </span>
              <div className="h-8 w-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-foreground tracking-tight">
                ৳ {(analytics?.revenue?.netPlatformProfit ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-emerald-500 flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {analytics?.revenue?.profitMarginPercent ?? 0}% Margin
                </span>
                <span className="text-[11px] text-muted-foreground">Realized Profit</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Direct Retail Profit:</span>
              <span className="font-bold text-emerald-500">
                ৳ {(analytics?.revenue?.directSalesProfit ?? 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Active Stock Investment */}
        <Card className="hover:border-brand/40 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Active Stock Investment
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-foreground tracking-tight">
                ৳ {(analytics?.revenue?.activeStockInvestment ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-amber-500">
                  Shopora Direct Inventory
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Total Ecosystem Capital:</span>
              <span className="font-bold text-brand">
                ৳ {(analytics?.revenue?.totalCatalogInvestment ?? 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Total Orders */}
        <Card className="hover:border-brand/40 transition">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Orders
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-foreground tracking-tight">
                {(analytics?.orders?.total ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold text-emerald-500 flex items-center">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  {analytics?.orders?.delivered ?? 0} Delivered
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Pending Fulfillment:</span>
              <span className="font-bold text-amber-500">
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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Weekly Revenue & Sales Volume</span>
                <Badge variant="brand" className="text-[10px] font-mono">
                  BDT (৳)
                </Badge>
              </CardTitle>
              <CardDescription>
                Gross sales progression across direct and vendor channels over the last 7 days.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted/60 border border-border rounded-lg p-0.5">
                <button
                  onClick={() => setChartType("bar")}
                  className={`p-1.5 rounded cursor-pointer transition ${
 chartType === "bar" ? "bg-background text-foreground " : "text-muted-foreground hover:text-foreground"
 }`}
                  title="Bar View"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setChartType("area")}
                  className={`p-1.5 rounded cursor-pointer transition ${
 chartType === "area" ? "bg-background text-foreground " : "text-muted-foreground hover:text-foreground"
 }`}
                  title="Area View"
                >
                  <LineChartIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-right pl-2 hidden sm:block">
                <p className="text-base font-black text-foreground">৳ 4,85,000</p>
                <p className="text-[10px] text-emerald-500 font-semibold">
                  Avg ৳ 69,285 / day
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {/* shadcn Recharts Chart Container */}
            <ChartContainer config={chartConfig} className="h-64 w-full">
              {chartType === "bar" ? (
                <BarChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    className="text-xs"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="gmv"
                    fill="var(--color-brand, #3890d0)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              ) : (
                <AreaChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gmvArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3890d0" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3890d0" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    className="text-xs"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="gmv"
                    stroke="#3890d0"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gmvArea)"
                  />
                </AreaChart>
              )}
            </ChartContainer>

            {/* Chart Legend & Insights */}
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  <span>Platform Revenue (42%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span>Vendor Marketplace (58%)</span>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Peak Sales Day: <strong className="text-foreground">Friday (৳ 98,000)</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Vendor vs Direct Platform Split Breakdown (1 Col) */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground">
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
                <span className="text-brand">Shopora Direct (Self)</span>
                <span className="text-purple-500">Vendor Network (3rd Party)</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                <div className="h-full bg-brand" style={{ width: `${directPercent}%` }} />
                <div className="h-full bg-purple-500" style={{ width: `${vendorPercent}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                <span>৳ {directSales.toLocaleString()} ({directPercent}%)</span>
                <span>৳ {vendorSales.toLocaleString()} ({vendorPercent}%)</span>
              </div>
            </div>

            {/* Split 2: Order Fulfillment */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-foreground">Central Warehouse</span>
                <span className="text-foreground">Seller Drop-ship</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: "65%" }} />
                <div className="h-full bg-amber-500" style={{ width: "35%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1 font-mono">
                <span>811 orders (65%)</span>
                <span>437 orders (35%)</span>
              </div>
            </div>

            {/* Payment Gateway Distribution */}
            <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-brand" />
                Payment Gateways Breakdown
              </p>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-card p-2 rounded border border-border">
                  <p className="text-[10px] text-muted-foreground">bKash</p>
                  <p className="text-xs font-bold text-pink-500 mt-0.5">54%</p>
                </div>
                <div className="bg-card p-2 rounded border border-border">
                  <p className="text-[10px] text-muted-foreground">Cash on Del</p>
                  <p className="text-xs font-bold text-emerald-500 mt-0.5">36%</p>
                </div>
                <div className="bg-card p-2 rounded border border-border">
                  <p className="text-[10px] text-muted-foreground">Cards/SSL</p>
                  <p className="text-xs font-bold text-brand mt-0.5">10%</p>
                </div>
              </div>
            </div>
          </CardContent>
          <div className="p-4 border-t border-border bg-muted/20 rounded-b-xl flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Net Profit Margin:</span>
            <span className="font-bold text-emerald-500">
              {analytics?.revenue?.profitMarginPercent ?? 0}% (Healthy)
            </span>
          </div>
        </Card>
      </div>

      {/* Product Moderation & Verification Queue (Converted to shadcn Table) */}
      <Card className="border-amber-500/20 bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">
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
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            <span>View All Pending ({realPendingProducts.length})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Details</TableHead>
                <TableHead>Vendor Store</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price / MSRP</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Moderation Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {realPendingProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                    <p className="font-semibold text-foreground">No products awaiting approval</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">All vendor submitted products have been reviewed.</p>
                  </TableCell>
                </TableRow>
              ) : (
                realPendingProducts.slice(0, 5).map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.mainImage?.media?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={prod.mainImage?.media?.url}
                              alt={prod.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate max-w-xs sm:max-w-md">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            SKU: {prod.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Store className="h-3 w-3 text-purple-500" />
                        {prod.seller?.storeName || "Vendor"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{prod.category?.name || "General"}</TableCell>
                    <TableCell>
                      <p className="font-bold text-foreground">
                        ৳ {prod.basePrice.toLocaleString()}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-[11px]">
                      {new Date(prod.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
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
                          onClick={() => handleOpenReject(prod.id)}
                          className="gap-1 cursor-pointer"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Orders Live Table (Converted to shadcn Table) */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Recent Marketplace Orders
            </CardTitle>
            <CardDescription>
              Live stream of customer purchases across Shopora Direct and verified vendor stores.
            </CardDescription>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            <span>View All 1,248 Orders</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Fulfillment Source</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((ord) => (
                <TableRow key={ord.id}>
                  <TableCell className="font-mono font-bold text-brand">
                    {ord.id}
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-foreground">{ord.customer}</p>
                    <p className="text-[11px] text-muted-foreground">{ord.email}</p>
                  </TableCell>
                  <TableCell>
                    {ord.isPlatform ? (
                      <Badge variant="brand" className="text-[10px]">
                        Shopora Direct
                      </Badge>
                    ) : (
                      <Badge variant="purple" className="text-[10px]">
                        {ord.store}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-foreground font-mono">
                    ৳ {ord.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <Badge
                        variant={
                          ord.paymentStatus === "paid" ? "success" : "warning"
                        }
                        className="text-[10px]"
                      >
                        {ord.paymentStatus.toUpperCase()}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground">{ord.paymentMethod}</p>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-[11px]">
                    {ord.date}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted inline-flex transition"
                      title="View Order Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Administrative Operations Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/products/new"
          className="p-4 rounded-xl border border-border bg-card hover:border-brand/40 hover: transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-brand">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-brand transition">Add New Product</p>
            <p className="text-[11px] text-muted-foreground">Direct or vendor upload</p>
          </div>
        </Link>

        <Link
          href="/admin/attributes"
          className="p-4 rounded-xl border border-border bg-card hover:border-brand/40 hover: transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-brand transition">Attribute Combinations</p>
            <p className="text-[11px] text-muted-foreground">Cartesian variant generator</p>
          </div>
        </Link>

        <Link
          href="/admin/sellers"
          className="p-4 rounded-xl border border-border bg-card hover:border-brand/40 hover: transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-brand transition">KYC Verification</p>
            <p className="text-[11px] text-muted-foreground">Vendor account approvals</p>
          </div>
        </Link>

        <Link
          href="/admin/payouts"
          className="p-4 rounded-xl border border-border bg-card hover:border-brand/40 hover: transition flex items-center gap-3.5 group"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground group-hover:text-brand transition">Vendor Payouts</p>
            <p className="text-[11px] text-muted-foreground">Process wallet withdrawals</p>
          </div>
        </Link>
      </div>

      {/* shadcn Rejection Dialog Modal */}
      <Dialog
        open={Boolean(rejectingProductId)}
        onOpenChange={(open) => !open && setRejectingProductId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              <span>Reject Submitted Product</span>
            </DialogTitle>
            <DialogDescription>
              Please provide clear feedback explaining why this product is rejected so the seller can revise and resubmit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="rejection-reason" className="text-xs">
              Rejection Reason & Compliance Notes <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g. Incomplete specifications, low image resolution, or trademark violation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectingProductId(null)}
              disabled={isRejecting}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmReject}
              disabled={isRejecting}
              className="text-xs font-bold cursor-pointer"
            >
              {isRejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
