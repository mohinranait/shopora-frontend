"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  Search,
  CreditCard,
  ExternalLink,
  CheckCircle2,
  Phone,
  Mail,
  RefreshCw,
  Loader2,
  AlertCircle,
  Package,
  X,
  Edit2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminSellersQuery,
  useReviewSellerApplicationMutation,
} from "@/redux";
import type { ISeller, SellerStatus } from "@/types";

interface ReviewModalState {
  isOpen: boolean;
  seller: ISeller | null;
}

function ReviewSellerModal({
  seller,
  onClose,
  onUpdated,
}: {
  seller: ISeller;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [commissionRate, setCommissionRate] = useState<number>(seller.commissionRate ?? 10);
  const [status, setStatus] = useState<SellerStatus>(seller.status);
  const [isVerified, setIsVerified] = useState<boolean>(seller.isVerified);
  const [rejectionReason, setRejectionReason] = useState<string>(seller.rejectionReason ?? "");

  const [reviewSeller, { isLoading }] = useReviewSellerApplicationMutation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reviewSeller({
        id: seller.id,
        data: {
          status,
          commissionRate,
          isVerified,
          rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
        },
      }).unwrap();

      toast.success(`Seller "${seller.storeName}" updated successfully`);
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to update seller";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/20 text-brand">
              <Store className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Review &amp; Edit Seller</h3>
              <p className="text-xs text-slate-400">{seller.storeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SellerStatus)}
              className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand"
            >
              <option value="APPROVED">APPROVED (Active &amp; Selling)</option>
              <option value="PENDING">PENDING (Under Review)</option>
              <option value="SUSPENDED">SUSPENDED (Temporarily Disabled)</option>
              <option value="REJECTED">REJECTED (Declined Application)</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Platform Commission Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-brand"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                %
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Percentage retained by platform on this vendor&apos;s delivered sales.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
            <div>
              <p className="text-xs font-bold text-white">Verified Merchant Badge</p>
              <p className="text-[11px] text-slate-400">
                Displays trusted checkmark icon on the public store and products.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsVerified(!isVerified)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                isVerified ? "bg-brand" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ${
                  isVerified ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {status === "REJECTED" && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-rose-400">
                Rejection Reason (Sent to Vendor)
              </label>
              <textarea
                rows={2}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what documents or information need correction..."
                className="w-full rounded-xl border border-rose-500/30 bg-slate-800/80 p-3 text-xs text-white outline-none focus:border-rose-400"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-deep px-5 py-2 text-xs font-bold text-white transition hover:bg-brand disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSellersPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "APPROVED" | "PENDING" | "SUSPENDED">("ALL");
  const [search, setSearch] = useState("");
  const [reviewModal, setReviewModal] = useState<ReviewModalState>({ isOpen: false, seller: null });

  const { data: sellers = [], isLoading, isError, refetch } = useGetAdminSellersQuery(
    activeTab === "ALL" ? undefined : activeTab,
    { refetchOnMountOrArgChange: true }
  );

  const [reviewSeller] = useReviewSellerApplicationMutation();

  // Quick action: quick approve
  const handleQuickApprove = async (seller: ISeller) => {
    try {
      await reviewSeller({
        id: seller.id,
        data: {
          status: "APPROVED",
          isVerified: true,
        },
      }).unwrap();
      toast.success(`"${seller.storeName}" approved and verified!`);
      void refetch();
    } catch {
      toast.error("Failed to approve seller");
    }
  };

  // Quick action: quick suspend
  const handleQuickSuspend = async (seller: ISeller) => {
    try {
      await reviewSeller({
        id: seller.id,
        data: {
          status: "SUSPENDED",
        },
      }).unwrap();
      toast.info(`"${seller.storeName}" has been suspended.`);
      void refetch();
    } catch {
      toast.error("Failed to suspend seller");
    }
  };

  // Client search filter
  const filteredSellers = useMemo(() => {
    if (!search.trim()) return sellers;
    const q = search.toLowerCase();
    return sellers.filter(
      (s) =>
        s.storeName.toLowerCase().includes(q) ||
        s.storeSlug.toLowerCase().includes(q) ||
        (s.userName && s.userName.toLowerCase().includes(q)) ||
        (s.userEmail && s.userEmail.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
    );
  }, [sellers, search]);

  // Dynamic Statistics
  const metrics = useMemo(() => {
    const total = sellers.length;
    const approved = sellers.filter((s) => s.status === "APPROVED").length;
    const pending = sellers.filter((s) => s.status === "PENDING").length;
    const totalProducts = sellers.reduce((sum, s) => sum + (s.productCount || 0), 0);
    const totalWalletBalance = sellers.reduce(
      (sum, s) => sum + (s.wallet?.balance || 0),
      0
    );
    return { total, approved, pending, totalProducts, totalWalletBalance };
  }, [sellers]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Marketplace Vendors
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Manage registered sellers, configure commission agreements, audit store KYC, and manage active store status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/sellers/kyc"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand/40 bg-brand/10 px-3.5 py-2 text-xs font-bold text-brand transition hover:bg-brand/20"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>KYC Verification Portal</span>
          </Link>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Vendors</span>
            <span className="rounded-lg bg-slate-800 p-2 text-slate-300">
              <Store className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{metrics.total}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across all onboarding stages</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Approved Stores</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">{metrics.approved}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active &amp; selling publicly</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Pending Review</span>
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400">{metrics.pending}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting audit &amp; approval</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400">Vendor Balance</span>
            <span className="rounded-lg bg-sky-500/10 p-2 text-brand">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">
            ৳{Math.round(metrics.totalWalletBalance).toLocaleString("en-US")}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Total seller wallet reserves</p>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "APPROVED", "PENDING", "SUSPENDED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === tab
                  ? "bg-brand text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab === "ALL" && "All Sellers"}
              {tab === "APPROVED" && "Approved"}
              {tab === "PENDING" && "Pending Review"}
              {tab === "SUSPENDED" && "Suspended"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores, owner, phone…"
            className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand"
          />
        </div>
      </div>

      {/* Sellers List Table */}
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading marketplace sellers…</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-bold text-white">Failed to load sellers</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
          <Store className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm font-bold text-white">No sellers found</p>
          <p className="text-xs text-slate-500 mt-1">
            {search ? "Try adjusting your search keywords" : "No vendors in this status category"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Store Details</th>
                  <th className="px-4 py-3.5">Owner / Contact</th>
                  <th className="px-4 py-3.5">Commission</th>
                  <th className="px-4 py-3.5">Products</th>
                  <th className="px-4 py-3.5">Wallet Balance</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filteredSellers.map((seller) => {
                  const isApproved = seller.status === "APPROVED";
                  const isPending = seller.status === "PENDING";
                  const isSuspended = seller.status === "SUSPENDED";

                  return (
                    <tr key={seller.id} className="hover:bg-slate-800/40 transition">
                      {/* Store */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 font-bold text-brand overflow-hidden">
                            {seller.storeLogo ? (
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
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/admin/sellers/${seller.id}`}
                                className="font-bold text-white hover:text-brand transition flex items-center gap-1.5"
                              >
                                <span>{seller.storeName}</span>
                                {seller.isVerified && (
                                  <span title="Verified Merchant">
                                    <ShieldCheck className="h-3.5 w-3.5 text-brand" />
                                  </span>
                                )}
                              </Link>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Link
                                href={`/vendors/${seller.storeSlug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-brand transition"
                              >
                                <span>/{seller.storeSlug}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-200">
                          {seller.userName || "Merchant"}
                        </p>
                        <div className="mt-0.5 space-y-0.5 text-[11px] text-slate-400">
                          {seller.phone && (
                            <p className="flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-slate-500" />
                              {seller.phone}
                            </p>
                          )}
                          {seller.userEmail && (
                            <p className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-500" />
                              <span className="truncate max-w-[150px]">{seller.userEmail}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Commission */}
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setReviewModal({ isOpen: true, seller })}
                          className="group inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-bold text-brand ring-1 ring-slate-700 hover:bg-slate-700 transition"
                          title="Click to change commission"
                        >
                          <span>{seller.commissionRate ?? 10}%</span>
                          <Edit2 className="h-3 w-3 text-slate-400 group-hover:text-white" />
                        </button>
                      </td>

                      {/* Products */}
                      <td className="px-4 py-3.5 font-bold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-slate-500" />
                          <span>{seller.productCount || 0}</span>
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-white">
                          ৳{Math.round(seller.wallet?.balance || 0).toLocaleString("en-US")}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Earned: ৳{Math.round(seller.wallet?.totalEarnings || 0).toLocaleString("en-US")}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 ring-1 ring-amber-500/20">
                            <ShieldAlert className="h-3 w-3" />
                            Pending KYC
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 ring-1 ring-rose-500/20">
                            <Ban className="h-3 w-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-bold text-slate-400 ring-1 ring-slate-500/20">
                            {seller.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(seller)}
                              className="rounded-lg bg-emerald-600/20 px-2.5 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                            >
                              Approve
                            </button>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleQuickSuspend(seller)}
                              className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-600 hover:text-white transition"
                            >
                              Suspend
                            </button>
                          )}

                          <Link
                            href={`/admin/sellers/${seller.id}`}
                            className="rounded-lg bg-brand/10 border border-brand/20 px-2.5 py-1 text-xs font-bold text-brand hover:bg-brand hover:text-white transition"
                            title="View comprehensive vendor performance & analytics"
                          >
                            Details
                          </Link>

                          <button
                            type="button"
                            onClick={() => setReviewModal({ isOpen: true, seller })}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                          >
                            Review
                          </button>

                          <Link
                            href="/admin/sellers/kyc"
                            className="rounded-lg border border-slate-700 bg-slate-800 p-1 text-slate-400 hover:bg-slate-700 hover:text-brand transition"
                            title="Audit KYC documents"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Commission Dialog */}
      {reviewModal.isOpen && reviewModal.seller && (
        <ReviewSellerModal
          seller={reviewModal.seller}
          onClose={() => setReviewModal({ isOpen: false, seller: null })}
          onUpdated={() => void refetch()}
        />
      )}
    </div>
  );
}
