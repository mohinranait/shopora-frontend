"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Store,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Ban,
  Mail,
  Phone,
  Building2,
  Calendar,
  Wallet,
  TrendingUp,
  Package,
  ShoppingBag,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Edit2,
  Loader2,
  Check,
  X,
  Send,
  Star,
  FileText,
  DollarSign,
  AlertCircle,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminSellerDetailsQuery,
  useReviewSellerApplicationMutation,
  useSendAdminSellerNoticeMutation,
} from "@/redux";
import type { SellerStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminSellerDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const sellerId = id;

  const { data, isLoading, isError, refetch } = useGetAdminSellerDetailsQuery(sellerId, {
    skip: !sellerId,
  });

  const [reviewSeller, { isLoading: isUpdatingStatus }] = useReviewSellerApplicationMutation();
  const [sendNotice, { isLoading: isSendingNotice }] = useSendAdminSellerNoticeMutation();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "financials">("overview");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // Form states for Review / Edit
  const [editStatus, setEditStatus] = useState<SellerStatus>("APPROVED");
  const [editCommission, setEditCommission] = useState<number>(10);
  const [editVerified, setEditVerified] = useState<boolean>(false);
  const [editReason, setEditReason] = useState<string>("");

  // Form states for Notice
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-xs">Loading comprehensive vendor profile & performance metrics…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400 shadow-xs">
        <AlertCircle className="mx-auto mb-2 h-8 w-8" />
        <h3 className="text-base font-bold text-white">Vendor Not Found</h3>
        <p className="text-xs text-rose-300 mt-1">
          The requested vendor profile does not exist or failed to load.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
            <Link href="/admin/sellers">Back to Sellers</Link>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => refetch()}
            className="bg-brand font-semibold text-white hover:bg-brand-deep"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const { seller, owner, wallet, performance, recentProducts, recentOrders, payouts } = data;

  const openEditModal = () => {
    setEditStatus(seller.status);
    setEditCommission(seller.commissionRate ?? 10);
    setEditVerified(seller.isVerified);
    setEditReason(seller.rejectionReason ?? "");
    setIsEditModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reviewSeller({
        id: seller.id,
        data: {
          status: editStatus,
          commissionRate: editCommission,
          isVerified: editVerified,
          rejectionReason: editStatus === "REJECTED" ? editReason : undefined,
        },
      }).unwrap();

      toast.success(`Store settings updated for "${seller.storeName}"`);
      setIsEditModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message || "Failed to update vendor settings";
      toast.error(msg);
    }
  };

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      toast.error("Please provide both a title and message for the vendor notice");
      return;
    }

    try {
      await sendNotice({
        id: seller.id,
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
      }).unwrap();

      toast.success("Official notice sent to vendor successfully");
      setIsNoticeModalOpen(false);
      setNoticeTitle("");
      setNoticeMessage("");
    } catch {
      toast.error("Failed to deliver notice to vendor");
    }
  };

  // Reputation styling
  const getReputationBadge = (rep: string) => {
    switch (rep) {
      case "EXCELLENT":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          label: "Excellent Merchant",
          icon: ShieldCheck,
        };
      case "GOOD":
        return {
          bg: "bg-brand/10 text-brand border-brand/30",
          label: "Good Standing",
          icon: CheckCircle2,
        };
      case "AVERAGE":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          label: "Needs Improvement",
          icon: AlertTriangle,
        };
      case "RISKY":
        return {
          bg: "bg-orange-500/10 text-orange-400 border-orange-500/30",
          label: "High Risk Flags",
          icon: AlertCircle,
        };
      case "CRITICAL":
      default:
        return {
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          label: "Critical / Suspended",
          icon: XCircle,
        };
    }
  };

  const repStyle = getReputationBadge(performance.reputation);
  const RepIcon = repStyle.icon;

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. Header & Navigation Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <Link
            href="/admin/sellers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Vendors</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-lg font-bold text-brand overflow-hidden">
              {seller.storeLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.storeLogo}
                  alt={seller.storeName}
                  className="h-full w-full object-cover"
                />
              ) : (
                seller.storeName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  {seller.storeName}
                </h1>
                {seller.isVerified ? (
                  <Badge variant="outline" className="gap-1 border-brand/30 bg-brand/10 text-[11px] font-bold text-brand">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 border-slate-700 bg-slate-800 text-[11px] font-bold text-slate-400">
                    Unverified
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={`text-[11px] font-bold uppercase ${
                    seller.status === "APPROVED"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : seller.status === "PENDING"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {seller.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                <Link
                  href={`/vendors/${seller.storeSlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-brand font-mono"
                >
                  <span>shopora.com/vendors/{seller.storeSlug}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
                <span>•</span>
                <span>Commission: <strong className="text-white">{seller.commissionRate}%</strong></span>
                <span>•</span>
                <span>Joined: {new Date(seller.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsNoticeModalOpen(true)}
            className="gap-1.5 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
            <span>Send Notice / Warning</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={openEditModal}
            className="gap-1.5 bg-brand font-bold text-white hover:bg-brand-deep"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Manage Status &amp; Commission</span>
          </Button>
        </div>
      </div>

      {/* 2. Key Performance Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <div className="text-lg font-black text-white mt-1">
            ৳{Math.round(performance.grossSales).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <TrendingUp className="h-3 w-3" />
            Gross Sales
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders Handled</span>
          <div className="text-lg font-black text-white mt-1">
            {performance.totalOrders}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {performance.deliveredOrders} delivered
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
          <div className="text-lg font-black text-white mt-1">
            {performance.totalProducts}
          </div>
          <span className="text-[11px] text-brand mt-0.5 block">
            {performance.approvedProducts} approved catalog
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfillment</span>
          <div className="text-lg font-black text-emerald-400 mt-1">
            {performance.fulfillmentRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Delivery success rate
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cancellation</span>
          <div className={`text-lg font-black mt-1 ${performance.cancellationRate > 5 ? "text-rose-400" : "text-white"}`}>
            {performance.cancellationRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Order drop rate
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seller Health</span>
          <div className="flex items-center gap-1.5 mt-1">
            <RepIcon className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">{performance.reputation}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Platform rating
          </span>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(
          [
            { id: "overview", label: "Business & Identity", icon: Building2 },
            { id: "products", label: `Catalog (${performance.totalProducts})`, icon: Package },
            { id: "orders", label: `Sub-Orders (${performance.totalOrders})`, icon: ShoppingBag },
            { id: "financials", label: "Wallet & Payouts", icon: Wallet },
          ] as const
        ).map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={
                isActive
                  ? "gap-2 bg-brand text-white hover:bg-brand-deep"
                  : "gap-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              }
            >
              <TabIcon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Button>
          );
        })}
      </div>

      {/* 4. Tab 1: Business Overview & KYC Profile */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Business & Store Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Rejection / Suspension Notice Banner */}
            {seller.status === "REJECTED" && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
                <div className="flex items-center gap-2 font-bold text-rose-200">
                  <XCircle className="h-4 w-4" />
                  <span>Merchant Application Rejected</span>
                </div>
                <p className="mt-1 text-xs">{seller.rejectionReason || "No rejection reason provided."}</p>
              </div>
            )}

            {seller.status === "SUSPENDED" && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
                <div className="flex items-center gap-2 font-bold text-amber-200">
                  <Ban className="h-4 w-4" />
                  <span>Store Operations Suspended</span>
                </div>
                <p className="mt-1 text-xs">{seller.rejectionReason || "Storefront temporarily deactivated by administrators."}</p>
              </div>
            )}

            {/* Business & Legal Information */}
            <Card className="border-slate-800 bg-slate-900 shadow-sm">
              <CardHeader className="border-b border-slate-800 p-5 pb-3">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand" />
                  <span>Legal, Business &amp; KYC Verification Details</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Business Address</span>
                    <p className="text-white font-semibold mt-0.5">{seller.businessAddress || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Store Phone</span>
                    <p className="text-white font-mono font-semibold mt-0.5">{seller.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">TIN / Tax Number</span>
                    <p className="text-white font-mono font-semibold mt-0.5">{seller.taxNumber || "Not submitted"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">NID / Trade License</span>
                    <p className="text-white font-mono font-semibold mt-0.5">{seller.nidOrTradeLicense || "Not submitted"}</p>
                  </div>
                </div>

                {/* Description */}
                {seller.storeDescription && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 text-xs font-medium">Store Description</span>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">{seller.storeDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Owner & Banking Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Account Owner Card */}
            <Card className="border-slate-800 bg-slate-900 shadow-sm">
              <CardHeader className="border-b border-slate-800 p-5 pb-3">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Store className="h-4 w-4 text-brand" />
                  <span>Account Owner Identity</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5">
                {owner ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400">Full Name</span>
                      <p className="text-sm font-bold text-white mt-0.5">{owner.name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Email Address</span>
                      <p className="text-white font-mono font-semibold mt-0.5 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        <a href={`mailto:${owner.email}`} className="hover:text-brand transition">{owner.email}</a>
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Mobile Phone</span>
                      <p className="text-white font-mono font-semibold mt-0.5 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <a href={`tel:${owner.phone || seller.phone}`} className="hover:text-brand transition">{owner.phone || seller.phone || "Not set"}</a>
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
                      <span className="text-slate-400">Account Status</span>
                      <Badge variant="outline" className={owner.isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-rose-500/20 bg-rose-500/10 text-rose-400"}>
                        {owner.isActive ? "Active User" : "Deactivated"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">User ID</span>
                      <span className="font-mono text-slate-300">#{owner.id}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Owner record unlinked or deleted.</p>
                )}
              </CardContent>
            </Card>

            {/* Banking & Payout Credentials Card */}
            <Card className="border-slate-800 bg-slate-900 shadow-sm">
              <CardHeader className="border-b border-slate-800 p-5 pb-3">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span>Bank &amp; Payout Accounts</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Bank Name</span>
                  <p className="text-white font-semibold mt-0.5">{seller.bankName || "No bank connected"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Account Number</span>
                  <p className="text-white font-mono font-semibold mt-0.5">{seller.bankAccountNumber || "N/A"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Routing Number</span>
                  <p className="text-white font-mono font-semibold mt-0.5">{seller.bankRouting || "N/A"}</p>
                </div>
                <div className="border-t border-slate-800 pt-2">
                  <span className="text-slate-400">bKash / Nagad Mobile Wallet</span>
                  <p className="text-emerald-400 font-mono font-bold mt-0.5">{seller.bkashOrNagad || "Not configured"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Products Catalog */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Vendor Products Catalog ({performance.totalProducts} items)
            </h3>
            <Link
              href={`/admin/products`}
              className="text-xs font-semibold text-brand hover:underline"
            >
              View in Products Manager &rarr;
            </Link>
          </div>

          {recentProducts.length > 0 ? (
            <Card className="overflow-hidden border-slate-800 bg-slate-900 shadow-sm">
              <Table>
                <TableHeader className="border-b border-slate-800 bg-slate-800/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Product</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SKU</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Price</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approval</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-800/70 text-slate-300">
                  {recentProducts.map((p) => (
                    <TableRow key={p.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                            {p.mainImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.mainImage} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white line-clamp-1">{p.name}</p>
                            <span className="text-[11px] text-slate-400 font-mono">ID: #{p.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-slate-400">{p.sku || "N/A"}</TableCell>
                      <TableCell className="font-bold text-white">৳{p.basePrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={p.stock <= 5 ? "font-bold text-rose-400" : "text-slate-300"}>
                          {p.stock} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            p.approvalStatus === "APPROVED"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : p.approvalStatus === "PENDING"
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                              : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                          }
                        >
                          {p.approvalStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block h-2 w-2 rounded-full ${p.status === "ACTIVE" ? "bg-emerald-400" : "bg-slate-600"}`} />
                        <span className="ml-1.5 text-xs text-slate-400">{p.status === "ACTIVE" ? "Published" : "Draft"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 border-slate-800 bg-slate-800/60 px-2.5 text-xs text-slate-300 hover:border-brand hover:text-brand"
                        >
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <span>Edit</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="border-slate-800 bg-slate-900 p-8 text-center text-xs text-slate-500">
              No products found in this vendor&apos;s inventory.
            </Card>
          )}
        </div>
      )}

      {/* 6. Tab 3: Recent Orders */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Vendor Sub-Orders ({performance.totalOrders} total)
            </h3>
          </div>

          {recentOrders.length > 0 ? (
            <Card className="overflow-hidden border-slate-800 bg-slate-900 shadow-sm">
              <Table>
                <TableHeader className="border-b border-slate-800 bg-slate-800/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order ID</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subtotal</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Commission (Cut)</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payout Net</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-800/70 text-slate-300">
                  {recentOrders.map((so) => (
                    <TableRow key={so.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="font-mono font-bold text-brand">
                        <Link href={`/admin/orders/${so.orderId}`} className="hover:underline">
                          #{so.orderId}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-300 font-medium">{so.customerName || "Customer"}</TableCell>
                      <TableCell className="font-bold text-white">৳{so.totalAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-amber-400 font-mono">৳{so.commissionAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-emerald-400 font-mono font-bold">৳{so.sellerEarnings.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            so.status === "DELIVERED"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : so.status === "CANCELLED"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                              : so.status === "RETURNED"
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                              : "border-brand/20 bg-brand/10 text-brand"
                          }
                        >
                          {so.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-400 font-mono text-[11px]">
                        {new Date(so.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Card className="border-slate-800 bg-slate-900 p-8 text-center text-xs text-slate-500">
              No orders have been fulfilled by this vendor yet.
            </Card>
          )}
        </div>
      )}

      {/* 7. Tab 4: Financials & Payouts */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          {/* Balance Breakdown Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-slate-800 bg-slate-900 p-4">
              <span className="text-xs font-bold uppercase text-slate-400">Available For Payout</span>
              <div className="text-2xl font-black text-white mt-2">
                ৳{Math.round(wallet?.balance || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Cleared balance ready to be transferred</p>
            </Card>

            <Card className="border-slate-800 bg-slate-900 p-4">
              <span className="text-xs font-bold uppercase text-slate-400">Pending In Escrow</span>
              <div className="text-2xl font-black text-amber-400 mt-2">
                ৳{Math.round(wallet?.pendingBalance || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Held until return window completes</p>
            </Card>

            <Card className="border-slate-800 bg-slate-900 p-4">
              <span className="text-xs font-bold uppercase text-slate-400">Total Lifetime Withdrawn</span>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                ৳{Math.round(wallet?.totalWithdrawn || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total successfully settled payouts</p>
            </Card>
          </div>

          {/* Payout History Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Recent Payout Requests</h3>
            {payouts && payouts.length > 0 ? (
              <Card className="overflow-hidden border-slate-800 bg-slate-900 shadow-sm">
                <Table>
                  <TableHeader className="border-b border-slate-800 bg-slate-800/60">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payout ID</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Amount</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Method</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reference</TableHead>
                      <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                      <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-800/70 text-slate-300">
                    {payouts.map((pay) => (
                      <TableRow key={pay.id} className="border-slate-800 hover:bg-slate-800/40">
                        <TableCell className="font-mono font-bold text-white">#{pay.id}</TableCell>
                        <TableCell className="font-bold text-white">৳{pay.amount.toLocaleString()}</TableCell>
                        <TableCell className="uppercase font-semibold text-slate-400">{pay.paymentMethod}</TableCell>
                        <TableCell className="font-mono text-slate-400">{pay.transactionReference || "Pending"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              pay.status === "PAID"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : pay.status === "REJECTED"
                                ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            }
                          >
                            {pay.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-400 font-mono text-[11px]">
                          {new Date(pay.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            ) : (
              <Card className="border-slate-800 bg-slate-900 p-8 text-center text-xs text-slate-500">
                No payout withdrawal requests recorded for this seller.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* 8. Shadcn Dialog: Review / Status / Commission Controller */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg border-slate-800 bg-slate-900 text-slate-100 sm:rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/20 text-brand">
                <Store className="h-4 w-4" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-white">Manage Vendor Status</DialogTitle>
                <DialogDescription className="text-xs text-slate-400">{seller.storeName}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveReview} className="space-y-4">
            {/* Account Status Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Account Status</Label>
              <Select value={editStatus} onValueChange={(val) => setEditStatus(val as SellerStatus)}>
                <SelectTrigger className="border-slate-800 bg-slate-800/80 text-white focus:ring-brand">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-white">
                  <SelectItem value="APPROVED">APPROVED (Active Storefront &amp; Sales)</SelectItem>
                  <SelectItem value="PENDING">PENDING (Awaiting Verification)</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED (Temporarily Blocked)</SelectItem>
                  <SelectItem value="REJECTED">REJECTED (Application Denied)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commission Rate Input */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-commission" className="text-xs font-semibold text-slate-300">
                Platform Commission Rate (%)
              </Label>
              <div className="relative">
                <Input
                  id="edit-commission"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={editCommission}
                  onChange={(e) => setEditCommission(Number(e.target.value))}
                  className="border-slate-800 bg-slate-800/80 pr-9 text-white focus-visible:ring-brand"
                />
                <Percent className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              </div>
              <p className="text-[11px] text-slate-500">
                Default platform rate is 10%. You can configure custom rates for VIP sellers.
              </p>
            </div>

            {/* KYC Verified Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3">
              <div className="pr-4">
                <Label htmlFor="modal-verified" className="text-xs font-bold text-white cursor-pointer">
                  Official Verified Merchant Badge
                </Label>
                <p className="text-[11px] text-slate-400">Display blue verification checkmark on store and products</p>
              </div>
              <Switch
                id="modal-verified"
                checked={editVerified}
                onCheckedChange={setEditVerified}
              />
            </div>

            {/* Reason for rejection/suspension */}
            {(editStatus === "REJECTED" || editStatus === "SUSPENDED") && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-reason" className="text-xs font-semibold text-rose-400">
                  Reason for {editStatus} (Visible in notification to seller)
                </Label>
                <Textarea
                  id="edit-reason"
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="Provide detailed explanation for this administrative action…"
                  className="border-rose-500/30 bg-slate-800/80 text-white placeholder:text-slate-500 focus-visible:ring-rose-500"
                />
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUpdatingStatus}
                className="gap-1.5 bg-brand font-bold text-white hover:bg-brand-deep"
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 9. Shadcn Dialog: Send Direct Warning / Official Notice */}
      <Dialog open={isNoticeModalOpen} onOpenChange={setIsNoticeModalOpen}>
        <DialogContent className="max-w-lg border-slate-800 bg-slate-900 text-slate-100 sm:rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div>
                <DialogTitle className="text-base font-bold text-white">Send Notice to Vendor</DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Will be delivered to {seller.storeName} in-app dashboard
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSendNotice} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notice-title" className="text-xs font-semibold text-slate-300">
                Notice Subject / Title
              </Label>
              <Input
                id="notice-title"
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="e.g., Warning: High Order Cancellation Rate"
                className="border-slate-800 bg-slate-800/80 text-white placeholder:text-slate-500 focus-visible:ring-brand"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notice-message" className="text-xs font-semibold text-slate-300">
                Notice Message / Action Required
              </Label>
              <Textarea
                id="notice-message"
                rows={4}
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="Explain the required compliance action, policy warning, or document request…"
                className="border-slate-800 bg-slate-800/80 text-white placeholder:text-slate-500 focus-visible:ring-brand"
                required
              />
            </div>

            {/* Quick Template Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Quick Templates:</span>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNoticeTitle("Warning: Order Cancellation Rate Exceeds Limit");
                    setNoticeMessage("Your cancellation rate is currently above acceptable thresholds. Please ensure inventory is strictly synchronized to prevent store suspension.");
                  }}
                  className="h-6 border-slate-700 bg-slate-800 px-2 py-0 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  High Cancellations
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNoticeTitle("Action Required: Submit Updated KYC Documents");
                    setNoticeMessage("Please upload your updated Trade License and bank details to keep your merchant payouts active.");
                  }}
                  className="h-6 border-slate-700 bg-slate-800 px-2 py-0 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  KYC Request
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNoticeTitle("Important: Customer Complaints Received");
                    setNoticeMessage("We have received multiple complaints regarding late packaging or product discrepancies. Please review your recent order dispatches.");
                  }}
                  className="h-6 border-slate-700 bg-slate-800 px-2 py-0 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Customer Complaint
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsNoticeModalOpen(false)}
                className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSendingNotice}
                className="gap-1.5 bg-amber-500 font-bold text-slate-950 hover:bg-amber-400"
              >
                {isSendingNotice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Deliver Notice</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
