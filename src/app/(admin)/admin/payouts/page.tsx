"use client";

import React, { useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminPayoutsQuery,
  useProcessPayoutMutation,
} from "@/redux";
import type { IPayoutRequest } from "@/types";

interface ProcessModalState {
  isOpen: boolean;
  type: "PAY" | "REJECT";
  payout: IPayoutRequest | null;
}

function ProcessPayoutModal({
  payout,
  type,
  onClose,
  onUpdated,
}: {
  payout: IPayoutRequest;
  type: "PAY" | "REJECT";
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [transactionReference, setTransactionReference] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processPayout, { isLoading }] = useProcessPayoutMutation();

  const isPay = type === "PAY";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPay && !transactionReference.trim()) {
      toast.error("Please enter a bank transaction reference or MFS TrxID.");
      return;
    }

    if (!isPay && !rejectionReason.trim()) {
      toast.error("Please state the reason for rejecting this payout request.");
      return;
    }

    try {
      await processPayout({
        id: payout.id,
        data: {
          status: isPay ? "PAID" : "REJECTED",
          transactionReference: isPay ? transactionReference.trim() : undefined,
          rejectionReason: !isPay ? rejectionReason.trim() : undefined,
        },
      }).unwrap();

      toast.success(
        isPay
          ? `Payout of ৳${payout.amount} marked as PAID. Wallet balance deducted.`
          : `Payout request of ৳${payout.amount} rejected.`
      );
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to process payout";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-left space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isPay
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isPay ? "Disburse Payout & Mark Settled" : "Reject Payout Request"}
              </h3>
              <p className="text-xs text-slate-400">
                Request #{payout.id} • {payout.seller?.storeName ?? "Vendor"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Breakdown Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Vendor Store:</span>
            <strong className="text-white">{payout.seller?.storeName ?? "Unknown"}</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Withdrawal Amount:</span>
            <span className="font-bold text-emerald-400 text-sm">
              ৳{Math.round(payout.amount).toLocaleString("en-US")}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Disbursement Method:</span>
            <span className="font-semibold text-slate-200">{payout.paymentMethod}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Recipient Account:</span>
            <span className="font-mono text-slate-300">
              {payout.accountDetails
                ? String(
                    payout.accountDetails.number ||
                      payout.accountDetails.accountNumber ||
                      payout.accountDetails.bankName ||
                      "Provided on profile"
                  )
                : "Profile records"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isPay ? (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-emerald-400">
                Bank / MFS Transaction Reference (TrxID) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g. BKASH-9A8B7C6D or BEFTN-20261027001"
                className="w-full rounded-xl border border-slate-800 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-emerald-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Deducts ৳{Math.round(payout.amount).toLocaleString("en-US")} from the vendor&apos;s available wallet and records an immutable ledger withdrawal.
              </p>
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-rose-400">
                Rejection Reason (Dispatched to Vendor) <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incorrect bank account number or minimum threshold not reached..."
                className="w-full rounded-xl border border-rose-500/30 bg-slate-800/80 p-3 text-xs text-white outline-none focus:border-rose-400"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
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
              className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 ${
                isPay
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-rose-600 hover:bg-rose-500"
              }`}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isPay ? "Confirm Settlement (PAID)" : "Reject Payout"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPayoutsPage() {
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "PAID" | "REJECTED">("ALL");
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<ProcessModalState>({
    isOpen: false,
    type: "PAY",
    payout: null,
  });

  const { data: payouts = [], isLoading, isError, refetch } = useGetAdminPayoutsQuery(
    filterTab === "ALL" ? undefined : filterTab,
    { refetchOnMountOrArgChange: true }
  );

  // Client search filter
  const filteredPayouts = useMemo(() => {
    if (!search.trim()) return payouts;
    const q = search.toLowerCase();
    return payouts.filter(
      (p) =>
        String(p.id).includes(q) ||
        (p.seller?.storeName && p.seller.storeName.toLowerCase().includes(q)) ||
        p.paymentMethod.toLowerCase().includes(q) ||
        (p.transactionReference && p.transactionReference.toLowerCase().includes(q))
    );
  }, [payouts, search]);

  // Statistics
  const metrics = useMemo(() => {
    const pendingRequests = payouts.filter((p) => p.status === "PENDING");
    const paidRequests = payouts.filter((p) => p.status === "PAID");
    const rejectedRequests = payouts.filter((p) => p.status === "REJECTED");

    const pendingTotal = pendingRequests.reduce((sum, p) => sum + p.amount, 0);
    const paidTotal = paidRequests.reduce((sum, p) => sum + p.amount, 0);

    return {
      pendingCount: pendingRequests.length,
      pendingTotal,
      paidCount: paidRequests.length,
      paidTotal,
      rejectedCount: rejectedRequests.length,
    };
  }, [payouts]);

  const handleExportStatement = () => {
    if (payouts.length === 0) {
      toast.info("No payout transactions to export");
      return;
    }
    const headers = "ID,Store,Method,Amount,Status,Reference,Date\n";
    const rows = payouts
      .map(
        (p) =>
          `"${p.id}","${p.seller?.storeName || ""}","${p.paymentMethod}",${p.amount},"${p.status}","${p.transactionReference || ""}","${p.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shopora-payouts-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payout statement exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Vendor Payouts &amp; Disbursements
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Review vendor withdrawal requests, settle bank and bKash disbursements, and record bank transaction references.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportStatement}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Statement</span>
          </button>

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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Pending Requests</span>
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400">{metrics.pendingCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Total: ৳{Math.round(metrics.pendingTotal).toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Settled (Paid)</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">
            ৳{Math.round(metrics.paidTotal).toLocaleString("en-US")}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{metrics.paidCount} processed requests</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">Rejected</span>
            <span className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <XCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-400">{metrics.rejectedCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Disallowed / Deficient</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-400">Total Disbursements</span>
            <span className="rounded-lg bg-sky-500/10 p-2 text-brand">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{payouts.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">All-time settlement logs</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          {(["ALL", "PENDING", "PAID", "REJECTED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                filterTab === tab
                  ? "bg-brand text-white shadow-xs"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab === "ALL" && "All Payouts"}
              {tab === "PENDING" && `Pending (${metrics.pendingCount})`}
              {tab === "PAID" && `Paid (${metrics.paidCount})`}
              {tab === "REJECTED" && `Rejected (${metrics.rejectedCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor, method, TrxID…"
            className="w-full rounded-xl border border-slate-800 bg-slate-800/80 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-brand"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading payout requests…</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-400">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-bold text-white">Failed to load payouts</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
          <CreditCard className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm font-bold text-white">No payout requests found</p>
          <p className="text-xs text-slate-500 mt-1">
            {search ? "Try adjusting your search query" : "No requests in this queue"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Ref / Payout ID</th>
                  <th className="px-4 py-3.5">Vendor</th>
                  <th className="px-4 py-3.5">Method &amp; Account</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Settlement Info</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filteredPayouts.map((payout) => {
                  const isPending = payout.status === "PENDING";
                  const isPaid = payout.status === "PAID";
                  const isRejected = payout.status === "REJECTED";

                  return (
                    <tr key={payout.id} className="hover:bg-slate-800/40 transition">
                      {/* Payout ID */}
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        <span className="font-bold text-white">#PAY-{payout.id}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(payout.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </td>

                      {/* Vendor */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-white">
                          {payout.seller?.storeName ?? `Seller #${payout.sellerId}`}
                        </p>
                        {payout.seller?.phone && (
                          <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {payout.seller.phone}
                          </p>
                        )}
                      </td>

                      {/* Method & Account */}
                      <td className="px-4 py-3.5">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-brand">
                          {payout.paymentMethod}
                        </span>
                        <p className="font-mono text-[11px] text-slate-300 mt-1">
                          {payout.accountDetails
                            ? String(
                                payout.accountDetails.number ||
                                  payout.accountDetails.accountNumber ||
                                  payout.accountDetails.bankName ||
                                  "Saved Account"
                              )
                            : "Default Account"}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-extrabold text-white">
                          ৳{Math.round(payout.amount).toLocaleString("en-US")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Settled (Paid)
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 ring-1 ring-amber-500/20">
                            <Clock className="h-3 w-3" />
                            Pending Review
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 ring-1 ring-rose-500/20">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-bold text-slate-400">
                            {payout.status}
                          </span>
                        )}
                      </td>

                      {/* Settlement Info */}
                      <td className="px-4 py-3.5 text-xs">
                        {payout.transactionReference ? (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Trx Reference
                            </span>
                            <span className="font-mono text-emerald-400 font-semibold">
                              {payout.transactionReference}
                            </span>
                          </div>
                        ) : payout.rejectionReason ? (
                          <span className="text-rose-400 text-[11px] line-clamp-2">
                            Reason: {payout.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Awaiting settlement</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setModalState({
                                  isOpen: true,
                                  type: "PAY",
                                  payout,
                                })
                              }
                              className="rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                            >
                              Disburse
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setModalState({
                                  isOpen: true,
                                  type: "REJECT",
                                  payout,
                                })
                              }
                              className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-600 hover:text-white transition"
                              title="Reject Payout"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disburse / Reject Dialog */}
      {modalState.isOpen && modalState.payout && (
        <ProcessPayoutModal
          payout={modalState.payout}
          type={modalState.type}
          onClose={() => setModalState({ isOpen: false, type: "PAY", payout: null })}
          onUpdated={() => void refetch()}
        />
      )}
    </div>
  );
}
