"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Building2,
  CreditCard,
  Search,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  FileText,
  BadgeAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminSellersQuery,
  useReviewSellerApplicationMutation,
} from "@/redux";
import type { ISeller } from "@/types";

interface RejectModalState {
  isOpen: boolean;
  seller: ISeller | null;
}

interface InspectModalState {
  isOpen: boolean;
  seller: ISeller | null;
}

function RejectKycModal({
  seller,
  onClose,
  onUpdated,
}: {
  seller: ISeller;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [reason, setReason] = useState("");
  const [reviewSeller, { isLoading }] = useReviewSellerApplicationMutation();

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please explain the reason for KYC rejection.");
      return;
    }

    try {
      await reviewSeller({
        id: seller.id,
        data: {
          status: "REJECTED",
          isVerified: false,
          rejectionReason: reason.trim(),
        },
      }).unwrap();

      toast.success(`KYC rejected for "${seller.storeName}". Notice dispatched.`);
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to reject KYC application");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-left space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <BadgeAlert className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Reject KYC Verification</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Specify why the KYC application for <strong className="text-white">{seller.storeName}</strong> is deficient. This notification will be displayed in the vendor&apos;s portal.
        </p>

        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-rose-400">
              Deficiency / Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Trade license expired or NID name does not match the bank account holder name..."
              className="w-full rounded-xl border border-rose-500/30 bg-slate-800/80 p-3 text-xs text-white outline-none focus:border-rose-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Reject Application</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InspectKycModal({
  seller,
  onClose,
  onApprove,
  onReject,
}: {
  seller: ISeller;
  onClose: () => void;
  onApprove: (seller: ISeller) => void;
  onReject: (seller: ISeller) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-left space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/20 text-brand">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">KYC Document Dossier</h3>
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

        {/* 1. Identity & Business Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-brand" />
            <span>Business Entity &amp; Operating Address</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-500">Store Name:</p>
              <p className="font-bold text-white">{seller.storeName}</p>
            </div>
            <div>
              <p className="text-slate-500">Registered Owner:</p>
              <p className="font-bold text-white">{seller.userName || "Merchant"}</p>
            </div>
            <div>
              <p className="text-slate-500">Hotline / Mobile Phone:</p>
              <p className="font-mono text-slate-200">{seller.phone || "None"}</p>
            </div>
            <div>
              <p className="text-slate-500">Official Email:</p>
              <p className="text-slate-200">{seller.userEmail || "None"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-slate-500">Physical Business Address:</p>
              <p className="text-slate-200">{seller.businessAddress || "None provided"}</p>
            </div>
          </div>
        </div>

        {/* 2. KYC Identifiers */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>Statutory Compliance Numbers</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-500">National ID (NID) or Trade License:</p>
              <p className="font-mono font-bold text-emerald-400 text-sm">
                {seller.nidOrTradeLicense || "Not submitted"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Tax Identification Number (TIN):</p>
              <p className="font-mono font-bold text-slate-200">
                {seller.taxNumber || "Not submitted"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bank & Payout Destination */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-purple-400" />
            <span>Disbursement Bank &amp; MFS Details</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-500">Designated Bank:</p>
              <p className="font-bold text-white">{seller.bankName || "None"}</p>
            </div>
            <div>
              <p className="text-slate-500">Bank Account Number:</p>
              <p className="font-mono font-bold text-slate-200">{seller.bankAccountNumber || "None"}</p>
            </div>
            <div>
              <p className="text-slate-500">Branch Name / Routing No:</p>
              <p className="font-mono text-slate-300">{seller.bankRouting || "None"}</p>
            </div>
            <div>
              <p className="text-slate-500">bKash / Nagad Number:</p>
              <p className="font-mono font-bold text-pink-400">{seller.bkashOrNagad || "None"}</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Status:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                seller.isVerified
                  ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
              }`}
            >
              {seller.isVerified ? "Verified Merchant" : "Unverified"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onReject(seller);
              }}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition"
            >
              Reject KYC
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onApprove(seller);
              }}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
            >
              Approve &amp; Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSellersKycPage() {
  const [filterTab, setFilterTab] = useState<"PENDING" | "VERIFIED" | "ALL">("PENDING");
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState<RejectModalState>({ isOpen: false, seller: null });
  const [inspectModal, setInspectModal] = useState<InspectModalState>({ isOpen: false, seller: null });

  const { data: sellers = [], isLoading, isError, refetch } = useGetAdminSellersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [reviewSeller] = useReviewSellerApplicationMutation();

  const handleApproveKyc = async (seller: ISeller) => {
    try {
      await reviewSeller({
        id: seller.id,
        data: {
          status: "APPROVED",
          isVerified: true,
        },
      }).unwrap();
      toast.success(`"${seller.storeName}" verified successfully!`);
      void refetch();
    } catch {
      toast.error("Failed to approve KYC verification");
    }
  };

  // Filter logic
  const filteredSellers = useMemo(() => {
    let list = sellers;
    if (filterTab === "PENDING") {
      list = list.filter((s) => !s.isVerified || s.status === "PENDING");
    } else if (filterTab === "VERIFIED") {
      list = list.filter((s) => s.isVerified);
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (s) =>
        s.storeName.toLowerCase().includes(q) ||
        (s.nidOrTradeLicense && s.nidOrTradeLicense.toLowerCase().includes(q)) ||
        (s.taxNumber && s.taxNumber.toLowerCase().includes(q)) ||
        (s.userName && s.userName.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.bankName && s.bankName.toLowerCase().includes(q))
    );
  }, [sellers, filterTab, search]);

  const metrics = useMemo(() => {
    const pending = sellers.filter((s) => !s.isVerified || s.status === "PENDING").length;
    const verified = sellers.filter((s) => s.isVerified).length;
    const rejected = sellers.filter((s) => s.status === "REJECTED").length;
    return { pending, verified, rejected };
  }, [sellers]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/sellers"
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              ← All Sellers
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-bold text-brand">KYC Portal</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Merchant KYC Verification &amp; Compliance
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Audit Trade Licenses, National IDs, TINs, and disbursement bank accounts before authorizing public selling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Pending Verification</span>
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400">{metrics.pending}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting compliance review</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Verified Merchants</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">{metrics.verified}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Full compliance verified</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">Rejected / Deficient</span>
            <span className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <XCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-400">{metrics.rejected}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Notice issued to vendor</p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterTab("PENDING")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filterTab === "PENDING"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            Pending Audit ({metrics.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("VERIFIED")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filterTab === "VERIFIED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            Verified ({metrics.verified})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filterTab === "ALL"
                ? "bg-brand text-white shadow-xs"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            All Submissions
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Trade License, NID, Bank…"
            className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand"
          />
        </div>
      </div>

      {/* KYC Applications Table */}
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading KYC applications…</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-bold text-white">Failed to load KYC applications</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
          <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm font-bold text-white">No KYC applications in this queue</p>
          <p className="text-xs text-slate-500 mt-1">All merchant documents are up-to-date.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Store / Owner</th>
                  <th className="px-4 py-3.5">Trade License / NID</th>
                  <th className="px-4 py-3.5">Tax No (TIN)</th>
                  <th className="px-4 py-3.5">Bank &amp; Payout Account</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-800/40 transition">
                    {/* Store & Owner */}
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white">{seller.storeName}</p>
                      <p className="text-[11px] text-slate-400">{seller.userName || "Merchant"}</p>
                      <p className="font-mono text-[10px] text-slate-500 mt-0.5">{seller.phone}</p>
                    </td>

                    {/* Trade License / NID */}
                    <td className="px-4 py-3.5">
                      {seller.nidOrTradeLicense ? (
                        <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                          <FileCheck2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{seller.nidOrTradeLicense}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Not provided</span>
                      )}
                    </td>

                    {/* TIN */}
                    <td className="px-4 py-3.5">
                      {seller.taxNumber ? (
                        <span className="font-mono text-slate-300 font-semibold">
                          {seller.taxNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>

                    {/* Bank & Payout */}
                    <td className="px-4 py-3.5">
                      {seller.bankName ? (
                        <div>
                          <p className="font-semibold text-slate-200">{seller.bankName}</p>
                          <p className="font-mono text-[11px] text-slate-400">
                            A/C: {seller.bankAccountNumber || "N/A"}
                          </p>
                        </div>
                      ) : seller.bkashOrNagad ? (
                        <div>
                          <p className="text-[11px] font-semibold text-pink-400">MFS Direct</p>
                          <p className="font-mono text-[11px] text-slate-300">{seller.bkashOrNagad}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No payout details</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {seller.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      ) : seller.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 ring-1 ring-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          Deficient
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 ring-1 ring-amber-500/20">
                          <ShieldAlert className="h-3 w-3" />
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectModal({ isOpen: true, seller })}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                        >
                          View Dossier
                        </button>

                        {!seller.isVerified && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveKyc(seller)}
                              className="rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModal({ isOpen: true, seller })}
                              className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-600 hover:text-white transition"
                              title="Reject KYC"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && rejectModal.seller && (
        <RejectKycModal
          seller={rejectModal.seller}
          onClose={() => setRejectModal({ isOpen: false, seller: null })}
          onUpdated={() => void refetch()}
        />
      )}

      {/* Inspect Dossier Modal */}
      {inspectModal.isOpen && inspectModal.seller && (
        <InspectKycModal
          seller={inspectModal.seller}
          onClose={() => setInspectModal({ isOpen: false, seller: null })}
          onApprove={handleApproveKyc}
          onReject={(s) => setRejectModal({ isOpen: true, seller: s })}
        />
      )}
    </div>
  );
}
