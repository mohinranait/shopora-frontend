"use client";

import React, { useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

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
    <Dialog open={true} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isPay
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-rose-500/15 text-rose-500"
              }`}
            >
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold">
                {isPay ? "Disburse Payout & Mark Settled" : "Reject Payout Request"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Request #{payout.id} • {payout.seller?.storeName ?? "Vendor"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Breakdown Card */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Vendor Store:</span>
            <strong className="text-foreground">{payout.seller?.storeName ?? "Unknown"}</strong>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Withdrawal Amount:</span>
            <span className="font-bold text-emerald-500 text-sm font-mono">
              ৳{Math.round(payout.amount).toLocaleString("en-US")}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Disbursement Method:</span>
            <span className="font-semibold text-foreground">{payout.paymentMethod}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Recipient Account:</span>
            <span className="font-mono text-foreground">
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
            <div className="space-y-1.5">
              <Label htmlFor="payout-trx" className="text-xs font-semibold text-emerald-500">
                Bank / MFS Transaction Reference (TrxID) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="payout-trx"
                type="text"
                required
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g. BKASH-9A8B7C6D or BEFTN-20261027001"
                className="font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Deducts ৳{Math.round(payout.amount).toLocaleString("en-US")} from the vendor&apos;s available wallet and records an immutable ledger withdrawal.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="payout-reason" className="text-xs font-semibold text-rose-500">
                Rejection Reason (Dispatched to Vendor) <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="payout-reason"
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incorrect bank account number or minimum threshold not reached..."
              />
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant={isPay ? "brand" : "destructive"}
              disabled={isLoading}
              className="text-xs font-bold"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
              <span>{isPay ? "Confirm Settlement (PAID)" : "Reject Payout"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

  const filteredPayouts = useMemo(() => {
    if (!search.trim()) return payouts;
    const q = search.toLowerCase();
    return payouts.filter((p) => {
      const storeName = p.seller?.storeName?.toLowerCase() || "";
      const method = p.paymentMethod?.toLowerCase() || "";
      const trx = p.transactionReference?.toLowerCase() || "";
      return storeName.includes(q) || method.includes(q) || trx.includes(q);
    });
  }, [payouts, search]);

  const metrics = useMemo(() => {
    let pendingSum = 0;
    let paidSum = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let rejectedCount = 0;

    payouts.forEach((p) => {
      if (p.status === "PENDING") {
        pendingSum += p.amount;
        pendingCount += 1;
      } else if (p.status === "PAID") {
        paidSum += p.amount;
        paidCount += 1;
      } else if (p.status === "REJECTED") {
        rejectedCount += 1;
      }
    });

    return { pendingSum, paidSum, pendingCount, paidCount, rejectedCount };
  }, [payouts]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Vendor Payout Settlements
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review withdrawal requests, verify MFS/bank credentials, and settle merchant store earnings.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-500">Pending Review</span>
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground font-mono">
            ৳{Math.round(metrics.pendingSum).toLocaleString("en-US")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {metrics.pendingCount} requests awaiting bank transfer
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-500">Settled (Paid)</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground font-mono">
            ৳{Math.round(metrics.paidSum).toLocaleString("en-US")}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {metrics.paidCount} successfully disbursed payouts
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand">Total Disbursements</span>
            <span className="rounded-lg bg-brand/10 p-2 text-brand">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground font-mono">{payouts.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">All-time settlement logs</p>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["ALL", "PENDING", "PAID", "REJECTED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                filterTab === tab
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor, method, TrxID…"
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading payout requests…</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-500">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-bold text-foreground">Failed to load payouts</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3 text-xs"
          >
            Retry
          </Button>
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <CreditCard className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">No payout requests found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try adjusting your search query" : "No requests in this queue"}
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref / Payout ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Method &amp; Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Settlement Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.map((payout) => {
                const isPending = payout.status === "PENDING";
                const isPaid = payout.status === "PAID";
                const isRejected = payout.status === "REJECTED";

                return (
                  <TableRow key={payout.id}>
                    {/* Payout ID */}
                    <TableCell className="font-mono text-muted-foreground">
                      <span className="font-bold text-foreground">#PAY-{payout.id}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(payout.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </TableCell>

                    {/* Vendor */}
                    <TableCell>
                      <p className="font-bold text-foreground">
                        {payout.seller?.storeName ?? `Seller #${payout.sellerId}`}
                      </p>
                      {payout.seller?.phone && (
                        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                          {payout.seller.phone}
                        </p>
                      )}
                    </TableCell>

                    {/* Method & Account */}
                    <TableCell>
                      <span className="rounded bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand border border-brand/20">
                        {payout.paymentMethod}
                      </span>
                      <p className="font-mono text-[11px] text-foreground mt-1">
                        {payout.accountDetails
                          ? String(
                              payout.accountDetails.number ||
                                payout.accountDetails.accountNumber ||
                                payout.accountDetails.bankName ||
                                "Saved Account"
                            )
                          : "Default Account"}
                      </p>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <span className="text-sm font-extrabold text-foreground font-mono">
                        ৳{Math.round(payout.amount).toLocaleString("en-US")}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Settled (Paid)
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-500 border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Pending Review
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-500 border border-rose-500/20">
                          <XCircle className="h-3 w-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                          {payout.status}
                        </span>
                      )}
                    </TableCell>

                    {/* Settlement Info */}
                    <TableCell className="text-xs">
                      {payout.transactionReference ? (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                            Trx Reference
                          </span>
                          <span className="font-mono text-emerald-500 font-semibold">
                            {payout.transactionReference}
                          </span>
                        </div>
                      ) : payout.rejectionReason ? (
                        <span className="text-rose-500 text-[11px] line-clamp-2">
                          Reason: {payout.rejectionReason}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Awaiting settlement</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="brand"
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                type: "PAY",
                                payout,
                              })
                            }
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            Disburse
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() =>
                              setModalState({
                                isOpen: true,
                                type: "REJECT",
                                payout,
                              })
                            }
                            title="Reject Payout"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Disburse / Reject Dialog (shadcn Dialog) */}
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
