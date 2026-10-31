"use client";

import React, { useState } from "react";
import {
  Wallet,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetSellerEscrowHoldingsQuery,
  useGetSellerWalletQuery,
  useRequestPayoutMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import { toast } from "sonner";

export default function SellerWalletPage() {
  const {
    data: escrowData,
    isLoading: isLoadingEscrow,
    refetch: refetchEscrow,
  } = useGetSellerEscrowHoldingsQuery();

  const {
    data: walletData,
    isLoading: isLoadingWallet,
    refetch: refetchWallet,
  } = useGetSellerWalletQuery();

  const [requestPayout, { isLoading: isRequesting }] = useRequestPayoutMutation();

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("BKASH");
  const [accountDetails, setAccountDetails] = useState("");

  const availableBalance = walletData?.wallet?.balance ?? escrowData?.availableBalance ?? 0;
  const pendingBalance = walletData?.wallet?.pendingBalance ?? escrowData?.pendingBalance ?? 0;
  const heldShipments = escrowData?.heldShipments || [];
  const payouts = walletData?.payouts || [];

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }
    if (Number(amount) > availableBalance) {
      toast.error("Requested amount exceeds available balance");
      return;
    }
    if (!accountDetails.trim()) {
      toast.error("Please enter your account number / details");
      return;
    }

    try {
      await requestPayout({
        amount: Number(amount),
        paymentMethod,
        accountDetails: accountDetails.trim(),
      }).unwrap();
      toast.success("Payout request submitted successfully!");
      setShowPayoutModal(false);
      setAmount("");
      setAccountDetails("");
      refetchWallet();
      refetchEscrow();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const isLoading = isLoadingEscrow || isLoadingWallet;

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-brand-500" />
            Wallet & Escrow Settlement
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your earnings, 7-day post-delivery escrow holdings, and withdrawal payout requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetchEscrow();
              refetchWallet();
            }}
            disabled={isLoading}
            className="border-slate-800 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="brand"
            onClick={() => setShowPayoutModal(true)}
            disabled={availableBalance < 500}
            className="gap-1.5 text-xs font-bold h-9"
          >
            <ArrowUpRight className="h-4 w-4" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Available for Withdrawal */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Available to Withdraw</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">
              ৳{availableBalance.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Min. payout: ৳500</span>
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={availableBalance < 500}
                className="text-emerald-400 font-bold hover:underline disabled:text-slate-600 disabled:no-underline"
              >
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Escrow Hold */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">7-Day Escrow Protection</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              ৳{pendingBalance.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>{heldShipments.length} delivered shipment(s)</span>
              <span className="text-amber-400/90 font-medium">Releases automatically</span>
            </div>
          </div>
        </div>

        {/* Escrow Policy Summary */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>How Escrow Works</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              When a package is marked delivered, earnings enter escrow for 7 days. This allows customers to inspect their items and protects your store against fraudulent chargebacks.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Automated settlement occurs daily at midnight BST.
          </div>
        </div>
      </div>

      {/* Active Escrow Holdings Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Active Escrow Holdings ({heldShipments.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Delivered packages awaiting maturity and release into your wallet
            </p>
          </div>
        </div>

        {heldShipments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <ShieldCheck className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            No shipments currently held in escrow. All delivered orders have matured!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">SubOrder</th>
                  <th className="px-5 py-3">Delivered Date</th>
                  <th className="px-5 py-3">Escrow Release Date</th>
                  <th className="px-5 py-3">Earnings Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {heldShipments.map((h: any) => (
                  <tr key={h.subOrderId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      {h.subOrderNumber || h.subOrderId.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(h.deliveredAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-amber-300">
                        {h.holdUntil
                          ? new Date(h.holdUntil).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "In 7 days"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      ৳{h.sellerEarnings ? h.sellerEarnings.toLocaleString() : 0}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px]">
                        Held (7-Day Return Window)
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout History Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              Payout Request History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Withdrawal transfers processed to your bank or mobile wallet
            </p>
          </div>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No payout requests made yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {payouts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">
                      ৳{p.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-300">
                      {p.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          p.status === "PAID" || p.status === "PROCESSED"
                            ? "success"
                            : p.status === "REJECTED"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {p.transactionReference || p.id.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="font-bold text-base text-white">Request Wallet Payout</div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Current Available Balance:</div>
                <div className="text-xl font-bold text-emerald-400">
                  ৳{availableBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payout Amount (BDT)
                </label>
                <input
                  type="number"
                  min="500"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 2500"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "BKASH", label: "bKash" },
                    { id: "NAGAD", label: "Nagad" },
                    { id: "BANK_TRANSFER", label: "Bank" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        paymentMethod === m.id
                          ? "bg-brand-600 border-brand-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {paymentMethod === "BANK_TRANSFER"
                    ? "Bank Account Number & Routing Details"
                    : "Mobile Wallet Account Number (Personal/Agent)"}
                </label>
                <textarea
                  rows={2}
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={
                    paymentMethod === "BANK_TRANSFER"
                      ? "Bank Name, Branch, Account Number, Account Name"
                      : "017XXXXXXXX / 018XXXXXXXX"
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutModal(false)}
                  className="text-xs border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={isRequesting || !amount || Number(amount) < 500}
                  className="text-xs font-bold"
                >
                  {isRequesting ? "Submitting..." : "Submit Withdrawal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
