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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminSellerDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const sellerId = Number(id);

  const { data, isLoading, isError, refetch } = useGetAdminSellerDetailsQuery(sellerId, {
    skip: isNaN(sellerId),
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
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
        <AlertCircle className="mx-auto mb-2 h-8 w-8" />
        <h3 className="text-base font-bold text-white">Vendor Not Found</h3>
        <p className="text-xs text-rose-300 mt-1">
          The requested vendor profile does not exist or failed to load.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            href="/admin/sellers"
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
          >
            Back to Sellers
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-deep transition"
          >
            Retry
          </button>
        </div>
      </div>
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
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 border border-brand/30 px-2 py-0.5 text-[11px] font-bold text-brand">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-bold text-slate-400">
                    Unverified
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                    seller.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : seller.status === "PENDING"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {seller.status}
                </span>
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
          <button
            type="button"
            onClick={() => setIsNoticeModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
            <span>Send Notice / Warning</span>
          </button>

          <button
            type="button"
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-deep transition cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Manage Status &amp; Commission</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Vendor Health Score (Good vs Bad assessment) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Vendor Health &amp; Trust
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${repStyle.bg}`}>
              <RepIcon className="h-3 w-3" />
              {repStyle.label}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tabular-nums">
              {performance.healthScore}
            </span>
            <span className="text-xs text-slate-500 font-bold">/ 100 Score</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Fulfillment: <strong className="text-white">{performance.fulfillmentRate}%</strong></span>
            <span>Cancellations: <strong className={performance.cancellationRate > 10 ? "text-rose-400" : "text-emerald-400"}>{performance.cancellationRate}%</strong></span>
          </div>
        </div>

        {/* Card 2: Financial Sales Volume */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gross Sales (GMV)
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tabular-nums">
              ৳{Math.round(performance.grossSales).toLocaleString("en-US")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Net Earning: <strong className="text-emerald-400">৳{Math.round(performance.netEarnings).toLocaleString("en-US")}</strong></span>
            <span>Platform Fee: <strong className="text-brand">৳{Math.round(performance.platformCommission).toLocaleString("en-US")}</strong></span>
          </div>
        </div>

        {/* Card 3: Wallet Available Balance */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Wallet Balance
            </span>
            <Wallet className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white tabular-nums">
              ৳{Math.round(wallet?.balance || 0).toLocaleString("en-US")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Pending: <strong className="text-amber-400">৳{Math.round(wallet?.pendingBalance || 0).toLocaleString("en-US")}</strong></span>
            <span>Withdrawn: <strong className="text-slate-300">৳{Math.round(wallet?.totalWithdrawn || 0).toLocaleString("en-US")}</strong></span>
          </div>
        </div>

        {/* Card 4: Orders & Ratings */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Orders &amp; Satisfaction
            </span>
            <ShoppingBag className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-white tabular-nums">
                {performance.totalOrders}
              </span>
              <span className="text-xs text-slate-500 ml-1">Orders</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{performance.avgRating ? performance.avgRating.toFixed(1) : "5.0"}</span>
              <span className="text-slate-500 text-xs">({performance.totalReviews})</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Delivered: <strong className="text-emerald-400">{performance.deliveredOrders}</strong></span>
            <span>Returns: <strong className={performance.returnedOrders > 0 ? "text-rose-400" : "text-slate-400"}>{performance.returnedOrders}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Health & Owner Info", icon: Store },
            { id: "products", label: `Products (${performance.totalProducts})`, icon: Package },
            { id: "orders", label: `Order History (${performance.totalOrders})`, icon: ShoppingBag },
            { id: "financials", label: "Financials & Payouts", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition cursor-pointer shrink-0 ${
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Tab 1: Health & Owner Info */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Vendor Quality & Risk Audit (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Health & Risk Diagnosis Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RepIcon className="h-4 w-4 text-brand" />
                    <span>Vendor Integrity &amp; Risk Diagnosis</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automated trust audit based on fulfillment, customer feedback, and cancellations.
                  </p>
                </div>
                <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${repStyle.bg}`}>
                  Score: {performance.healthScore} / 100
                </span>
              </div>

              {/* Risk Flags Checklist */}
              {performance.riskFlags && performance.riskFlags.length > 0 ? (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Attention Needed ({performance.riskFlags.length} warnings detected):
                  </span>
                  <ul className="space-y-1.5 pl-5 text-xs text-slate-300 list-disc">
                    {performance.riskFlags.map((flag, idx) => (
                      <li key={idx} className="text-amber-200/90">{flag}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center gap-2.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Clean Merchant Record. No operational alerts or excessive cancellations detected.</span>
                </div>
              )}

              {/* Performance Checklist Matrix */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Fulfillment Rate</span>
                  <div className="text-base font-extrabold text-white mt-1">
                    {performance.fulfillmentRate}%
                  </div>
                  <p className="text-[10px] text-slate-500">Benchmark: &ge; 90%</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cancellation Rate</span>
                  <div className={`text-base font-extrabold mt-1 ${performance.cancellationRate > 10 ? "text-rose-400" : "text-emerald-400"}`}>
                    {performance.cancellationRate}%
                  </div>
                  <p className="text-[10px] text-slate-500">Benchmark: &le; 5%</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Customer Return Rate</span>
                  <div className={`text-base font-extrabold mt-1 ${performance.returnRate > 10 ? "text-rose-400" : "text-emerald-400"}`}>
                    {performance.returnRate}%
                  </div>
                  <p className="text-[10px] text-slate-500">Benchmark: &le; 5%</p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Average Rating</span>
                  <div className="text-base font-extrabold text-amber-400 mt-1 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{performance.avgRating ? performance.avgRating.toFixed(1) : "5.0"}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Benchmark: &ge; 4.0</p>
                </div>
              </div>
            </div>

            {/* Business & Legal Information */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <FileText className="h-4 w-4 text-brand" />
                <span>Legal, Business &amp; KYC Verification Details</span>
              </h3>

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
            </div>
          </div>

          {/* Right Column: Owner & Banking Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Account Owner Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <Store className="h-4 w-4 text-brand" />
                <span>Account Owner Identity</span>
              </h3>

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
                    <span className={`inline-flex items-center gap-1 font-bold ${owner.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                      {owner.isActive ? "Active User" : "Deactivated"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">User ID</span>
                    <span className="font-mono text-slate-300">#{owner.id}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Owner record unlinked or deleted.</p>
              )}
            </div>

            {/* Banking & Payout Credentials Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span>Bank &amp; Payout Accounts</span>
              </h3>

              <div className="space-y-3 text-xs">
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
              </div>
            </div>
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
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Approval</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {recentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
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
                            <span className="text-[11px] text-slate-500">ID: #{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{p.sku || "N/A"}</td>
                      <td className="px-4 py-3 font-bold text-white">৳{p.basePrice.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${p.stock > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {p.stock > 0 ? `${p.stock} units` : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          p.approvalStatus === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : p.approvalStatus === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {p.approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-400">{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-white transition"
                          title="View on Storefront"
                        >
                          <ExternalLink className="h-3.5 w-3.5 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500 text-xs">
              This vendor has not published any products yet.
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Order History */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Vendor SubOrders Fulfillment History ({performance.totalOrders} total)
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-brand hover:underline"
            >
              All Platform Orders &rarr;
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">SubOrder #</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Total Amount</th>
                    <th className="px-4 py-3">Vendor Earning</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {recentOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        <Link href={`/admin/orders/${so.orderId}`} className="hover:text-brand transition">
                          {so.subOrderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{so.customerName}</p>
                        {so.customerPhone && (
                          <span className="text-[11px] font-mono text-slate-500">{so.customerPhone}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">৳{Math.round(so.totalAmount).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">৳{Math.round(so.sellerEarnings).toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-brand">৳{Math.round(so.commissionAmount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          so.status === "DELIVERED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : so.status === "CANCELLED"
                            ? "bg-rose-500/10 text-rose-400"
                            : so.status === "RETURNED"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-brand/10 text-brand"
                        }`}>
                          {so.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(so.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500 text-xs">
              No orders have been fulfilled by this vendor yet.
            </div>
          )}
        </div>
      )}

      {/* 7. Tab 4: Financials & Payouts */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          {/* Balance Breakdown Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <span className="text-xs font-bold uppercase text-slate-400">Available For Payout</span>
              <div className="text-2xl font-black text-white mt-2">
                ৳{Math.round(wallet?.balance || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Cleared balance ready to be transferred</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <span className="text-xs font-bold uppercase text-slate-400">Pending In Escrow</span>
              <div className="text-2xl font-black text-amber-400 mt-2">
                ৳{Math.round(wallet?.pendingBalance || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Held until return window completes</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <span className="text-xs font-bold uppercase text-slate-400">Total Lifetime Withdrawn</span>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                ৳{Math.round(wallet?.totalWithdrawn || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total successfully settled payouts</p>
            </div>
          </div>

          {/* Payout History Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Recent Payout Requests</h3>
            {payouts && payouts.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Payout ID</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-300">
                    {payouts.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-mono font-bold text-white">#{pay.id}</td>
                        <td className="px-4 py-3 font-bold text-white">৳{pay.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 uppercase font-semibold text-slate-400">{pay.paymentMethod}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{pay.transactionReference || "Pending"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            pay.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : pay.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(pay.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-500 text-xs">
                No payout withdrawal requests recorded for this seller.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Modal: Review / Status / Commission Controller */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/20 text-brand">
                  <Store className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Manage Vendor Status</h3>
                  <p className="text-xs text-slate-400">{seller.storeName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Account Status Select */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as SellerStatus)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-2.5 text-xs text-white outline-none focus:border-brand"
                >
                  <option value="APPROVED">APPROVED (Active Storefront &amp; Product Sales)</option>
                  <option value="PENDING">PENDING (Awaiting Document Verification)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily Blocked from Selling)</option>
                  <option value="REJECTED">REJECTED (Application Denied)</option>
                </select>
              </div>

              {/* Commission Rate Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Platform Commission Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={editCommission}
                    onChange={(e) => setEditCommission(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-2.5 text-xs text-white outline-none focus:border-brand"
                  />
                  <Percent className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default platform rate is 10%. You can configure custom rates for VIP sellers.
                </p>
              </div>

              {/* KYC Verified Toggle */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                <input
                  type="checkbox"
                  id="modal-verified"
                  checked={editVerified}
                  onChange={(e) => setEditVerified(e.target.checked)}
                  className="h-4 w-4 rounded accent-brand"
                />
                <label htmlFor="modal-verified" className="text-xs text-slate-300 cursor-pointer">
                  <strong className="text-white block">Official Verified Merchant Badge</strong>
                  Display blue verification checkmark on store and products
                </label>
              </div>

              {/* Reason for rejection/suspension */}
              {(editStatus === "REJECTED" || editStatus === "SUSPENDED") && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-rose-400">
                    Reason for {editStatus} (Visible in notification to seller)
                  </label>
                  <textarea
                    rows={3}
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Provide detailed explanation for this administrative action…"
                    className="w-full rounded-xl border border-rose-500/30 bg-slate-800/80 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-deep disabled:opacity-50"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Modal: Send Direct Warning / Official Notice */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Send Notice to Vendor</h3>
                  <p className="text-xs text-slate-400">Will be delivered to {seller.storeName} in-app dashboard</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Notice Subject / Title
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g., Warning: High Order Cancellation Rate"
                  className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Notice Message / Action Required
                </label>
                <textarea
                  rows={4}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Explain the required compliance action, policy warning, or document request…"
                  className="w-full rounded-xl border border-slate-800 bg-slate-800/80 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-brand"
                  required
                />
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">Quick Templates:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeTitle("Warning: Order Cancellation Rate Exceeds Limit");
                      setNoticeMessage("Your cancellation rate is currently above acceptable thresholds. Please ensure inventory is strictly synchronized to prevent store suspension.");
                    }}
                    className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                  >
                    High Cancellations
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNoticeTitle("Action Required: Submit Updated KYC Documents");
                      setNoticeMessage("Please upload your updated Trade License and bank details to keep your merchant payouts active.");
                    }}
                    className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                  >
                    KYC Request
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNoticeTitle("Important: Customer Complaints Received");
                      setNoticeMessage("We have received multiple complaints regarding late packaging or product discrepancies. Please review your recent order dispatches.");
                    }}
                    className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                  >
                    Customer Complaint
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingNotice}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
                >
                  {isSendingNotice ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Deliver Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
