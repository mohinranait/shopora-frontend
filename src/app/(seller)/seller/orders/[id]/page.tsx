"use client";

import React, { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Truck,
  Package,
  Printer,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Phone,
  DollarSign,
  AlertCircle,
  FileText,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetSellerSubOrderByIdQuery,
  useBookCourierMutation,
  useLazyGetPackagingSlipQuery,
  useUpdateSubOrderStatusMutation,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import {
  IOrderItem,
  IThermalPackagingSlip,
  IThermalPackagingSlipItem,
  OrderStatus,
} from "@/types";
import { toast } from "sonner";
import { formatTaka } from "@/lib/money";

const STATUS_STEPS: { status: OrderStatus; label: string; action: string; description: string }[] = [
  { status: "PENDING", label: "Pending", action: "Order Placed", description: "Customer placed the order" },
  { status: "CONFIRMED", label: "Confirmed", action: "Confirm Order", description: "Accept and confirm this order" },
  { status: "PROCESSING", label: "Processing", action: "Start Processing", description: "Pack items and prepare parcel" },
  { status: "SHIPPED", label: "Shipped", action: "Mark as Shipped", description: "Handed over to courier partner" },
  { status: "DELIVERED", label: "Delivered", action: "Mark as Delivered", description: "Customer received the package" },
];

const STATUS_RANKS: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

function SellerSubOrderDetailInner() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: subOrder, isLoading, refetch } = useGetSellerSubOrderByIdQuery(id, { skip: !id });
  const [bookCourier, { isLoading: isBookingCourier }] = useBookCourierMutation();
  const [triggerGetSlip, { isLoading: isLoadingSlip }] = useLazyGetPackagingSlipQuery();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateSubOrderStatusMutation();

  const [packagingSlip, setPackagingSlip] = useState<IThermalPackagingSlip | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const handleBookCourier = async (provider: string = "Steadfast") => {
    try {
      const res = await bookCourier({ subOrderId: id, body: { provider } }).unwrap();
      toast.success(
        `Courier booked with ${res.data.courierName}! Consignment: ${res.data.consignmentId}, Tracking: ${res.data.trackingCode}`
      );
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleFetchAndPrintSlip = async () => {
    try {
      const res = await triggerGetSlip(id).unwrap();
      if (res.data) {
        setPackagingSlip(res.data);
        setShowSlipModal(true);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!subOrder) return;
    try {
      await updateStatus({
        orderId: subOrder.orderId,
        subOrderId: subOrder.id,
        status: nextStatus,
        trackingNumber: subOrder.trackingNumber || undefined,
        courierName: subOrder.courierName || undefined,
      }).unwrap();
      toast.success(`SubOrder marked as ${nextStatus}!`);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        <p className="text-xs text-muted-foreground">Loading sub-order details...</p>
      </div>
    );
  }

  if (!subOrder) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-2xl space-y-3">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-foreground">SubOrder Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested package ID does not exist or belongs to another vendor.
        </p>
        <Link href="/seller/orders">
          <Button size="sm" variant="outline" className="text-xs">
            Return to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const packageTotal = subOrder.totalAmount ?? 0;
  const packageShipping = subOrder.shippingCost ?? subOrder.shippingFee ?? 0;
  const commission = subOrder.commissionAmount ?? 0;
  const netEarnings = subOrder.sellerEarnings ?? 0;

  return (
    <div className="space-y-6">
      {/* Header bar with Back button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/seller/orders">
            <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-border">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Package #{subOrder.subOrderNumber || subOrder.id.slice(0, 8)}
              </h1>
              <Badge
                variant={
                  subOrder.status === "DELIVERED"
                    ? "success"
                    : subOrder.status === "SHIPPED"
                    ? "brand"
                    : subOrder.status === "PROCESSING"
                    ? "purple"
                    : "outline"
                }
                className="text-[10px]"
              >
                {subOrder.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
              <span>
                Master Order: <strong className="text-foreground font-mono">{subOrder.orderNumber || subOrder.order?.orderNumber || `#${subOrder.orderId.slice(0, 8)}`}</strong>
              </span>
              <span>•</span>
              <span>
                Created on{" "}
                {new Date(subOrder.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Packaging Slip Action */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleFetchAndPrintSlip}
            disabled={isLoadingSlip}
            className="text-xs border-border gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-sky-400" />
            {isLoadingSlip ? "Generating Slip..." : "Thermal Packaging Slip"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Logistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logistics & Courier Automation Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Courier Logistics & Booking</h3>
                  <p className="text-xs text-muted-foreground">
                    Direct automated consignment dispatch (Steadfast Courier / Pathao)
                  </p>
                </div>
              </div>

              {subOrder.consignmentId ? (
                <Badge variant="outline" className="border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Booked
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs">
                  Ready to Dispatch
                </Badge>
              )}
            </div>

            {subOrder.consignmentId ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Courier Partner</span>
                  <div className="text-xs font-bold text-foreground mt-1">{subOrder.courierName || "Steadfast Courier"}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Consignment ID</span>
                  <div className="text-xs font-mono font-bold text-sky-400 mt-1">{subOrder.consignmentId}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Tracking Code</span>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">{subOrder.trackingNumber || "N/A"}</div>
                </div>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
                <div className="text-xs text-foreground">
                  Ready to dispatch this vendor package? Book a courier pickup with Steadfast in 1 click.
                </div>
                <Button
                  size="sm"
                  variant="brand"
                  onClick={() => handleBookCourier("Steadfast")}
                  disabled={isBookingCourier}
                  className="text-xs font-bold shrink-0 gap-1.5"
                >
                  <Truck className="h-3.5 w-3.5" />
                  {isBookingCourier ? "Booking..." : "Book Steadfast Courier"}
                </Button>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-brand-500" />
                Package Items ({subOrder.items?.length || 0})
              </h2>
              <span className="text-xs text-muted-foreground">
                Package Subtotal: {formatTaka(packageTotal)}
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {subOrder.items?.map((item: IOrderItem) => {
                const itemImg = item.productImage || item.product?.mainImage || null;
                const itemName = item.productName || item.product?.name || "Product Item";
                const itemPrice = item.price ?? item.unitPrice ?? 0;
                const itemQty = item.quantity ?? 1;
                const lineTotal = item.totalPrice ?? itemPrice * itemQty;
                const variantLabel = item.variantTitle || item.variant?.title || null;
                const itemSku = item.sku || item.variant?.sku || null;

                return (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-muted border border-border overflow-hidden shrink-0 relative flex items-center justify-center">
                        {itemImg ? (
                          <Image
                            src={itemImg}
                            alt={itemName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-foreground text-xs truncate">
                          {itemName}
                        </h4>
                        {(variantLabel || itemSku) && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {variantLabel ? `Variant: ${variantLabel} ` : ""}
                            {itemSku ? `(SKU: ${itemSku})` : ""}
                          </p>
                        )}
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {formatTaka(itemPrice)} × {itemQty} qty
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-foreground text-xs">
                        {formatTaka(lineTotal)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Escrow Financial Information Box */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">7-Day Escrow Protection</h3>
              </div>
              <Badge
                variant={
                  subOrder.escrowStatus === "RELEASED"
                    ? "success"
                    : subOrder.escrowStatus === "HELD"
                    ? "warning"
                    : "outline"
                }
                className="text-xs"
              >
                Escrow: {subOrder.escrowStatus || "PENDING"}
              </Badge>
            </div>

            <div className="text-xs text-foreground leading-relaxed">
              Upon successful customer delivery, earnings are held in escrow for a 7-day return/dispute window before being automatically released into your withdrawable wallet balance.
            </div>

            {subOrder.escrowStatus === "HELD" && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    Matures on:{" "}
                    <strong>
                      {subOrder.escrowHoldUntil
                        ? new Date(subOrder.escrowHoldUntil).toLocaleString()
                        : "7 days from delivery"}
                    </strong>
                  </span>
                </div>
                <span className="font-bold text-amber-300">
                  {formatTaka(netEarnings)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Delivery Info, Financial Summary & Status Control */}
        <div className="space-y-6">
          {/* Fulfillment Status Control */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Update Shipment Status</h3>
              <span className="text-[10px] text-muted-foreground">Step-by-Step</span>
            </div>
            <div className="space-y-2">
              {(() => {
                const currentRank = STATUS_RANKS[subOrder.status] ?? -1;
                const isTerminal =
                  subOrder.status === "DELIVERED" ||
                  subOrder.status === "CANCELLED" ||
                  subOrder.status === "RETURNED";

                return STATUS_STEPS.map((step) => {
                  const stepRank = STATUS_RANKS[step.status];
                  const isPast = currentRank > stepRank;
                  const isCurrent = currentRank === stepRank;
                  const isNext = currentRank + 1 === stepRank;

                  if (isPast) {
                    return (
                      <div
                        key={step.status}
                        className="w-full py-2 px-3 rounded-xl text-xs flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          {step.label}
                        </span>
                        <span className="text-[10px] text-emerald-400/80">Completed</span>
                      </div>
                    );
                  }

                  if (isCurrent) {
                    return (
                      <div
                        key={step.status}
                        className="w-full py-2 px-3 rounded-xl text-xs flex items-center justify-between bg-brand-600 text-foreground font-bold"
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-brand-200" />
                          Current: {step.label}
                        </span>
                        <Badge variant="outline" className="border-white/40 text-foreground text-[10px]">
                          Active
                        </Badge>
                      </div>
                    );
                  }

                  if (isNext && !isTerminal) {
                    return (
                      <button
                        key={step.status}
                        onClick={() => handleStatusChange(step.status)}
                        disabled={isUpdatingStatus}
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-600 text-foreground hover:brightness-110 ring-1 ring-brand-400/30"
                      >
                        <div className="flex flex-col">
                          <span>{step.action}</span>
                          <span className="text-[10px] font-normal text-foreground/80">{step.description}</span>
                        </div>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </button>
                    );
                  }

                  return (
                    <div
                      key={step.status}
                      className="w-full py-2 px-3 rounded-xl text-xs flex items-center justify-between bg-muted/40 text-muted-foreground cursor-not-allowed"
                    >
                      <span>{step.label}</span>
                      <span className="text-[10px] text-muted-foreground/60">Locked</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Delivery Information (Customer Privacy Protected) */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Delivery Destination
            </h3>
            <div className="space-y-2 pt-1 text-xs text-foreground">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Customer Details:</span>
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                    Privacy Protected
                  </Badge>
                </div>
                {subOrder.destinationCity && (
                  <div className="flex justify-between text-foreground">
                    <span className="text-muted-foreground">Destination City:</span>
                    <span className="font-semibold text-foreground">
                      {subOrder.destinationCity}
                      {subOrder.destinationState ? `, ${subOrder.destinationState}` : ""}
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-border">
                  Customer phone number and street address are hidden from sellers. All delivery coordinates are securely transmitted directly to courier partner upon parcel dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Financials & Payout Breakdown */}
          <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Financial Breakdown
            </h3>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal:</span>
                <span className="text-foreground font-medium">{formatTaka(packageTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Package Shipping Fee:</span>
                <span className="text-foreground font-medium">
                  ৳{packageShipping.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Commission:</span>
                <span className="text-rose-400 font-medium">
                  -{formatTaka(commission)}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between text-sm font-bold">
                <span className="text-foreground">Net Seller Payout:</span>
                <span className="text-emerald-400">{formatTaka(netEarnings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Packaging Slip Modal (4x6 format preview) */}
      {showSlipModal && packagingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="font-black text-base text-slate-900 tracking-tight">
                THERMAL PACKAGING SLIP (4x6)
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSlipModal(false)}
                className="text-slate-500 hover:text-slate-900"
              >
                ✕
              </Button>
            </div>

            {/* Slip Paper View */}
            <div id="thermal-slip-content" className="p-4 border-2 border-dashed border-slate-400 rounded-lg space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-slate-300">
                <div className="font-black text-sm tracking-widest">
                  {packagingSlip.storeName || packagingSlip.store?.name || "Merchant Store"}
                </div>
                <div className="text-[10px] text-slate-600">Merchant Fulfillment Manifest</div>
              </div>

              <div className="flex justify-between text-[11px]">
                <span><strong>ORDER:</strong> #{packagingSlip.orderNumber}</span>
                <span><strong>PKG:</strong> #{packagingSlip.subOrderNumber}</span>
              </div>

              <div className="p-2 bg-slate-100 rounded text-[11px] space-y-1">
                <div><strong>SHIP TO:</strong></div>
                <div>{packagingSlip.customer?.name || "Customer (Privacy Protected)"}</div>
                <div>{packagingSlip.customer?.phone || "Protected"}</div>
                <div>{packagingSlip.customer?.address || "Courier Dispatched"}</div>
              </div>

              <div className="border-t border-b border-slate-300 py-2 space-y-1">
                <div className="font-bold text-[10px]">ITEMS MANIFEST ({packagingSlip.items?.length || 0}):</div>
                {packagingSlip.items?.map((it: IThermalPackagingSlipItem, idx: number) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="truncate max-w-[180px]">
                      {it.quantity}x {it.name} {it.variantSku ? `(${it.variantSku})` : ""}
                    </span>
                    <span>৳{it.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-xs">
                <span>COLLECT ON DELIVERY:</span>
                <span>{formatTaka(packagingSlip.financials?.codAmount ?? packagingSlip.amountToCollectCOD ?? 0)}</span>
              </div>

              <div className="text-center pt-2 text-[10px] font-bold text-slate-700">
                <div>COURIER: {packagingSlip.courier?.name || packagingSlip.courierName || "Courier Partner"}</div>
                <div className="text-sm font-mono tracking-widest mt-1">
                  ||||| {packagingSlip.courier?.trackingCode || packagingSlip.trackingNumber || packagingSlip.consignmentId || "PENDING"} |||||
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSlipModal(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => window.print()}
                className="text-xs bg-slate-900 text-white hover:bg-slate-800 gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print Label
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerSubOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading sub-order details...</p>
        </div>
      }
    >
      <SellerSubOrderDetailInner />
    </Suspense>
  );
}
