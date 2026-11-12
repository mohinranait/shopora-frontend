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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { roundTaka } from "@/lib/money";
import { formatTaka } from "@/lib/money";

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
          // The API accepts 0–100 with at most 2 decimals
          commissionRate: roundTaka(Math.min(100, Math.max(0, commissionRate || 0))),
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
    <Dialog open={true} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Store className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-base font-bold">Review &amp; Edit Seller</DialogTitle>
              <DialogDescription className="text-xs">{seller.storeName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="seller-status">Account Status</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as SellerStatus)}
            >
              <SelectTrigger id="seller-status">
                <SelectValue placeholder="Select Status">
                  {status === "APPROVED"
                    ? "APPROVED (Active & Selling)"
                    : status === "PENDING"
                    ? "PENDING (Under Review)"
                    : status === "SUSPENDED"
                    ? "SUSPENDED (Temporarily Disabled)"
                    : "REJECTED (Declined Application)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">APPROVED (Active &amp; Selling)</SelectItem>
                <SelectItem value="PENDING">PENDING (Under Review)</SelectItem>
                <SelectItem value="SUSPENDED">SUSPENDED (Temporarily Disabled)</SelectItem>
                <SelectItem value="REJECTED">REJECTED (Declined Application)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seller-comm">Platform Commission Rate (%)</Label>
            <div className="relative">
              <Input
                id="seller-comm"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Percentage retained by platform on this vendor&apos;s delivered sales.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5">
            <div>
              <p className="text-xs font-bold text-foreground">Verified Merchant Badge</p>
              <p className="text-[11px] text-muted-foreground">
                Displays trusted checkmark icon on the public store and products.
              </p>
            </div>
            <Switch checked={isVerified} onCheckedChange={setIsVerified} />
          </div>

          {status === "REJECTED" && (
            <div className="space-y-1.5">
              <Label htmlFor="seller-reject-reason" className="text-rose-500">
                Rejection Reason (Sent to Vendor)
              </Label>
              <Textarea
                id="seller-reject-reason"
                rows={2}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what documents or information need correction..."
              />
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border gap-2">
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
              variant="brand"
              size="sm"
              disabled={isLoading}
              className="text-xs font-bold"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

  const handleQuickApprove = async (seller: ISeller) => {
    try {
      await reviewSeller({
        id: seller.id,
        data: {
          status: "APPROVED",
          isVerified: true,
        },
      }).unwrap();
      toast.success(`Merchant "${seller.storeName}" has been approved!`);
      void refetch();
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } })?.data?.message || "Failed to approve seller"
      );
    }
  };

  const filteredSellers = useMemo(() => {
    if (!search.trim()) return sellers;
    const q = search.toLowerCase();
    return sellers.filter((s) => {
      const name = s.storeName.toLowerCase();
      const owner = s.userName?.toLowerCase() || "";
      const phone = s.phone?.toLowerCase() || "";
      const email = s.userEmail?.toLowerCase() || "";
      return name.includes(q) || owner.includes(q) || phone.includes(q) || email.includes(q);
    });
  }, [sellers, search]);

  const metrics = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let totalProducts = 0;
    let totalBalances = 0;

    sellers.forEach((s) => {
      if (s.status === "PENDING") pendingCount += 1;
      if (s.status === "APPROVED") approvedCount += 1;
      totalProducts += s.productCount || 0;
      totalBalances += s.wallet?.balance || 0;
    });

    return { pendingCount, approvedCount, totalProducts, totalBalances };
  }, [sellers]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Marketplace Vendor Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review vendor onboarding requests, commission rates, store verification, and escrow balances.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending Review</span>
            <span className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{metrics.pendingCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Vendors awaiting KYC moderation</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Merchants</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{metrics.approvedCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Verified &amp; active storefronts</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Vendor Catalog</span>
            <span className="rounded-lg bg-sky-500/10 p-2 text-brand">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{metrics.totalProducts}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Active seller SKU variants</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Vendor Balance</span>
            <span className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
              <CreditCard className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground font-mono">
            {formatTaka(metrics.totalBalances)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Combined seller wallet reserves</p>
        </Card>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "APPROVED", "PENDING", "SUSPENDED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
 activeTab === tab
 ? "bg-brand text-white "
 : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores, owner, phone…"
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Sellers List Table */}
      {isLoading ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-xs">Loading marketplace sellers…</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-500">
          <AlertCircle className="mx-auto mb-2 h-8 w-8" />
          <p className="text-sm font-bold text-foreground">Failed to load sellers</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3 text-xs"
          >
            Retry
          </Button>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <Store className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">No sellers found</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try adjusting your search keywords" : "No vendors in this status category"}
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Details</TableHead>
                <TableHead>Owner / Contact</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller) => {
                const isApproved = seller.status === "APPROVED";
                const isPending = seller.status === "PENDING";
                const isSuspended = seller.status === "SUSPENDED";
                const logoUrl =
                  typeof seller.logo === "object" && seller.logo?.media?.url
                    ? seller.logo.media.url
                    : typeof seller.storeLogo === "string"
                    ? seller.storeLogo
                    : null;

                return (
                  <TableRow key={seller.id}>
                    {/* Store */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted font-bold text-brand overflow-hidden">
                          {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logoUrl}
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
                              className="font-bold text-foreground hover:text-brand transition flex items-center gap-1.5"
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
                              className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-brand transition"
                            >
                              <span>/{seller.storeSlug}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Owner */}
                    <TableCell>
                      <p className="font-semibold text-foreground">
                        {seller.userName || "Merchant"}
                      </p>
                      <div className="mt-0.5 space-y-0.5 text-[11px] text-muted-foreground">
                        {seller.phone && (
                          <p className="flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {seller.phone}
                          </p>
                        )}
                        {seller.userEmail && (
                          <p className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{seller.userEmail}</span>
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Commission */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setReviewModal({ isOpen: true, seller })}
                        className="group inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-brand border border-border hover:bg-muted/80 transition cursor-pointer"
                        title="Click to change commission"
                      >
                        <span>{seller.commissionRate ?? 10}%</span>
                        <Edit2 className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                      </button>
                    </TableCell>

                    {/* Products */}
                    <TableCell className="font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{seller.productCount || 0}</span>
                      </div>
                    </TableCell>

                    {/* Wallet Balance */}
                    <TableCell>
                      <p className="font-bold text-foreground font-mono">
                        {formatTaka(seller.wallet?.balance || 0)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Earned: {formatTaka(seller.wallet?.totalEarnings || 0)}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Approved
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-500 border border-amber-500/20">
                          <ShieldAlert className="h-3 w-3" />
                          Pending KYC
                        </span>
                      ) : isSuspended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-500 border border-rose-500/20">
                          <Ban className="h-3 w-3" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground border border-border">
                          {seller.status}
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <Button
                            size="xs"
                            variant="brand"
                            onClick={() => handleQuickApprove(seller)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setReviewModal({ isOpen: true, seller })}
                          className="font-semibold"
                        >
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Review & Edit Modal (shadcn Dialog) */}
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
