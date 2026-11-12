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
import { formatTaka, sumTaka, toPaisa } from "@/lib/money";
import type { PayoutMethod } from "@/types";
import { toast } from "sonner";

const MIN_PAYOUT = 500;
/** Requests the backend still holds money for */
const OPEN_PAYOUT_STATUSES = ["PENDING", "APPROVED"];

const TRANSACTION_LABELS: Record<string, string> = {
  ORDER_EARNING: "Earning (in escrow)",
  ESCROW_RELEASE: "Escrow released",
  PAYOUT_WITHDRAWAL: "Withdrawal",
  REFUND_REVERSAL: "Return reversal",
  COMMISSION_DEDUCTION: "Commission",
};

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
  const [paymentMethod, setPaymentMethod] = useState<PayoutMethod>("BKASH");
  const [accountDetails, setAccountDetails] = useState("");

  const availableBalance = walletData?.wallet?.balance ?? escrowData?.availableBalance ?? 0;
  const pendingBalance = walletData?.wallet?.pendingBalance ?? escrowData?.pendingBalance ?? 0;
  const heldShipments = escrowData?.heldShipments || [];
  const payouts = walletData?.payouts || [];
  const transactions = walletData?.transactions || [];
  // Money already promised to open requests can't be requested again (the API enforces the same rule)
  const reservedForPayouts = sumTaka(payouts.filter((p) => OPEN_PAYOUT_STATUSES.includes(p.status)).map((p) => p.amount));
  const withdrawable = Math.max(0, (toPaisa(availableBalance) - toPaisa(reservedForPayouts)) / 100);
  const canWithdraw = withdrawable >= MIN_PAYOUT;
  const isInDebt = availableBalance < 0;

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }
    if (toPaisa(amount) > toPaisa(withdrawable)) {
      toast.error(`You can withdraw up to ${formatTaka(withdrawable)} right now`);
      return;
    }
    if (!accountDetails.trim()) {
      toast.error("Please enter your account number / details");
      return;
    }

    try {
      const details = accountDetails.trim();
      await requestPayout({
        amount: toPaisa(amount) / 100,
        paymentMethod,
        // Shape the admin payout screen reads: a mobile wallet number or bank account details
        accountDetails: paymentMethod === "BANK" ? { accountNumber: details } : { number: details, mfsProvider: paymentMethod },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-brand-500" />
            Wallet & Escrow Settlement
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
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
            className="border-border text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="brand"
            onClick={() => setShowPayoutModal(true)}
            disabled={!canWithdraw}
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
        <div className="p-5 rounded-2xl bg-card border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Available to Withdraw</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black ${isInDebt ? "text-red-400" : "text-foreground"}`}>
              {formatTaka(withdrawable)}
            </div>
            {isInDebt ? (
              <p className="mt-1 text-[11px] text-red-400">
                Balance {formatTaka(availableBalance)}: a returned order reversed earnings you had already withdrawn.
                It is settled from your next earnings.
              </p>
            ) : reservedForPayouts > 0 ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Balance {formatTaka(availableBalance)}, of which {formatTaka(reservedForPayouts)} is in pending payout requests.
              </p>
            ) : null}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
              <span>Min. payout: {formatTaka(MIN_PAYOUT)}</span>
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={!canWithdraw}
                className="text-emerald-400 font-bold hover:underline disabled:text-muted-foreground/60 disabled:no-underline"
              >
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Escrow Hold */}
        <div className="p-5 rounded-2xl bg-card border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">7-Day Escrow Protection</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {formatTaka(pendingBalance)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
              <span>{heldShipments.length} delivered shipment(s)</span>
              <span className="text-amber-400/90 font-medium">Releases automatically</span>
            </div>
          </div>
        </div>

        {/* Escrow Policy Summary */}
        <div className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>How Escrow Works</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              When a package is marked delivered, earnings enter escrow for 7 days. This allows customers to inspect their items and protects your store against fraudulent chargebacks.
            </p>
          </div>
          <div className="text-[10px] text-muted-foreground pt-2 border-t border-border">
            Matured holdings are released to your balance automatically (checked every hour).
          </div>
        </div>
      </div>

      {/* Active Escrow Holdings Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Active Escrow Holdings ({heldShipments.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Delivered packages awaiting maturity and release into your wallet
            </p>
          </div>
        </div>

        {heldShipments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
            No shipments currently held in escrow. All delivered orders have matured!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="px-5 py-3">SubOrder</th>
                  <th className="px-5 py-3">Delivered Date</th>
                  <th className="px-5 py-3">Escrow Release Date</th>
                  <th className="px-5 py-3">Earnings Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-foreground">
                {heldShipments.map((h: any) => (
                  <tr key={h.subOrderId} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {h.subOrderNumber || h.subOrderId.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
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
                      {formatTaka(h.sellerEarnings)}
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
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              Payout Request History
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Withdrawal transfers processed to your bank or mobile wallet
            </p>
          </div>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            No payout requests made yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-foreground">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {formatTaka(p.amount)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      {p.paymentMethod}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          p.status === "PAID"
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
                    <td className="px-5 py-3.5 text-muted-foreground font-mono text-[11px]">
                      {p.transactionReference || p.id.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Wallet Ledger: every credit and debit, including return reversals */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-500" />
            Wallet Activity
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Earnings, escrow releases, withdrawals and return reversals on your wallet
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">No wallet activity yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] border-b border-border">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-foreground">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                      {TRANSACTION_LABELS[t.type] ?? t.type}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.description}</td>
                    <td className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${t.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {t.amount > 0 ? "+" : ""}
                      {formatTaka(t.amount)}
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
          <div className="bg-card border border-border text-foreground rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="font-bold text-base text-foreground">Request Wallet Payout</div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-background border border-border text-xs space-y-1">
                <div className="text-muted-foreground">You can withdraw up to:</div>
                <div className="text-xl font-bold text-emerald-400">{formatTaka(withdrawable)}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Payout Amount (BDT)
                </label>
                <input
                  type="number"
                  min={MIN_PAYOUT}
                  max={withdrawable}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 2500"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: "BKASH", label: "bKash" },
                    { id: "NAGAD", label: "Nagad" },
                    { id: "BANK", label: "Bank" },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
 paymentMethod === m.id
 ? "bg-brand-600 border-brand-500 text-foreground"
 : "bg-background border-border text-muted-foreground hover:text-foreground"
 }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  {paymentMethod === "BANK"
                    ? "Bank Account Number & Routing Details"
                    : "Mobile Wallet Account Number (Personal/Agent)"}
                </label>
                <textarea
                  rows={2}
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={
                    paymentMethod === "BANK"
                      ? "Bank Name, Branch, Account Number, Account Name"
                      : "017XXXXXXXX / 018XXXXXXXX"
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutModal(false)}
                  className="text-xs border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  disabled={isRequesting || !amount || Number(amount) < MIN_PAYOUT}
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
