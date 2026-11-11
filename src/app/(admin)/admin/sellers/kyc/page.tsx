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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md border-border bg-card text-card-foreground sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-500">
            <BadgeAlert className="h-5 w-5" />
            <DialogTitle className="text-base font-bold text-foreground">Reject KYC Verification</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            Specify why the KYC application for <strong className="text-foreground">{seller.storeName}</strong> is deficient. This notification will be displayed in the vendor&apos;s portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleReject} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rejection-reason" className="text-xs font-semibold text-rose-500">
              Deficiency / Rejection Reason <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Trade license expired or NID name does not match the bank account holder name..."
              className="border-rose-500/30 bg-muted/40 text-foreground placeholder:text-muted-foreground focus-visible:ring-rose-400"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="gap-1.5 bg-rose-600 font-bold text-white hover:bg-rose-500"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Reject Application</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-card text-card-foreground sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/20 text-brand">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">KYC Document Dossier</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{seller.storeName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* 1. Identity & Business Details */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-brand" />
              <span>Business Entity &amp; Operating Address</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Store Name:</p>
                <p className="font-bold text-foreground">{seller.storeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Registered Owner:</p>
                <p className="font-bold text-foreground">{seller.userName || "Merchant"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hotline / Mobile Phone:</p>
                <p className="font-mono text-foreground">{seller.phone || "None"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Official Email:</p>
                <p className="text-foreground">{seller.userEmail || "None"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Physical Business Address:</p>
                <p className="text-foreground">{seller.businessAddress || "None provided"}</p>
              </div>
            </div>
          </div>

          {/* 2. KYC Identifiers */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-500" />
              <span>Statutory Compliance Numbers</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">National ID (NID) or Trade License:</p>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {seller.nidOrTradeLicense || "Not submitted"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tax Identification Number (TIN):</p>
                <p className="font-mono font-bold text-foreground">
                  {seller.taxNumber || "Not submitted"}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Bank & Payout Destination */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-purple-500" />
              <span>Disbursement Bank &amp; MFS Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Designated Bank:</p>
                <p className="font-bold text-foreground">{seller.bankName || "None"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Bank Account Number:</p>
                <p className="font-mono font-bold text-foreground">{seller.bankAccountNumber || "None"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Branch Name / Routing No:</p>
                <p className="font-mono text-muted-foreground">{seller.bankRouting || "None"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">bKash / Nagad Number:</p>
                <p className="font-mono font-bold text-pink-600 dark:text-pink-400">{seller.bkashOrNagad || "None"}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between pt-3 border-t border-border sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Current Status:</span>
            <Badge
              variant="outline"
              className={
                seller.isVerified
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }
            >
              {seller.isVerified ? "Verified Merchant" : "Unverified"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onReject(seller);
              }}
              className="border-rose-500/40 bg-rose-500/10 font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white"
            >
              Reject KYC
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onApprove(seller);
              }}
              className="bg-emerald-600 font-bold text-white hover:bg-emerald-500"
            >
              Approve &amp; Verify
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/sellers"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              ← All Sellers
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-xs font-bold text-brand">KYC Portal</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Merchant KYC Verification &amp; Compliance
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Audit Trade Licenses, National IDs, TINs, and disbursement bank accounts before authorizing public selling.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Verification</span>
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.pending}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting compliance review</p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Verified Merchants</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.verified}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Full compliance verified</p>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Rejected / Deficient</span>
            <span className="rounded-lg bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.rejected}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Notice issued to vendor</p>
        </Card>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={filterTab === "PENDING" ? "default" : "ghost"}
            onClick={() => setFilterTab("PENDING")}
            className={
              filterTab === "PENDING"
                ? "bg-amber-500 font-bold text-slate-950 hover:bg-amber-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          >
            Pending Audit ({metrics.pending})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterTab === "VERIFIED" ? "default" : "ghost"}
            onClick={() => setFilterTab("VERIFIED")}
            className={
              filterTab === "VERIFIED"
                ? "bg-emerald-600 font-bold text-white hover:bg-emerald-500"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          >
            Verified ({metrics.verified})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filterTab === "ALL" ? "default" : "ghost"}
            onClick={() => setFilterTab("ALL")}
            className={
              filterTab === "ALL"
                ? "bg-brand font-bold text-white hover:bg-brand-deep"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          >
            All Submissions
          </Button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Trade License, NID, Bank…"
            className="pl-8"
          />
        </div>
      </div>

      {/* KYC Applications Table */}
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading KYC applications…</p>
        </div>
      ) : isError ? (
        <Card className="border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-500">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-rose-500" />
          <p className="text-sm font-bold text-foreground">Failed to load KYC applications</p>
          <Button
            onClick={() => refetch()}
            size="sm"
            className="mt-3"
          >
            Retry
          </Button>
        </Card>
      ) : filteredSellers.length === 0 ? (
        <Card className="border-border bg-card p-12 text-center text-muted-foreground">
          <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">No KYC applications in this queue</p>
          <p className="text-xs text-muted-foreground mt-1">All merchant documents are up-to-date.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden border-border bg-card">
          <Table>
            <TableHeader className="border-b border-border bg-muted/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Store / Owner</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Trade License / NID</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tax No (TIN)</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank &amp; Payout Account</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Audit Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredSellers.map((seller) => (
                <TableRow key={seller.id} className="border-border hover:bg-muted/40">
                  {/* Store & Owner */}
                  <TableCell>
                    <p className="font-bold text-foreground">{seller.storeName}</p>
                    <p className="text-[11px] text-muted-foreground">{seller.userName || "Merchant"}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/80 mt-0.5">{seller.phone}</p>
                  </TableCell>

                  {/* Trade License / NID */}
                  <TableCell>
                    {seller.nidOrTradeLicense ? (
                      <div className="flex items-center gap-1.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        <FileCheck2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{seller.nidOrTradeLicense}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </TableCell>

                  {/* TIN */}
                  <TableCell>
                    {seller.taxNumber ? (
                      <span className="font-mono text-foreground font-semibold">
                        {seller.taxNumber}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">None</span>
                    )}
                  </TableCell>

                  {/* Bank & Payout */}
                  <TableCell>
                    {seller.bankName ? (
                      <div>
                        <p className="font-semibold text-foreground">{seller.bankName}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          A/C: {seller.bankAccountNumber || "N/A"}
                        </p>
                      </div>
                    ) : seller.bkashOrNagad ? (
                      <div>
                        <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">MFS Direct</p>
                        <p className="font-mono text-[11px] text-foreground">{seller.bkashOrNagad}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">No payout details</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {seller.isVerified ? (
                      <Badge variant="outline" className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : seller.status === "REJECTED" ? (
                      <Badge variant="outline" className="gap-1 border-rose-500/20 bg-rose-500/10 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <XCircle className="h-3 w-3" />
                        Deficient
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 border-amber-500/20 bg-amber-500/10 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <ShieldAlert className="h-3 w-3" />
                        Pending Review
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectModal({ isOpen: true, seller })}
                        className="text-xs font-semibold"
                      >
                        View Dossier
                      </Button>

                      {!seller.isVerified && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApproveKyc(seller)}
                            className="bg-emerald-600/15 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectModal({ isOpen: true, seller })}
                            className="h-8 w-8 border-rose-500/20 bg-rose-500/10 p-0 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white"
                            title="Reject KYC"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
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
