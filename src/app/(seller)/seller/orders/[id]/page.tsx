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
        <p className="text-xs text-slate-400">Loading sub-order details...</p>
      </div>
    );
  }

  if (!subOrder) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-white">SubOrder Not Found</h2>
        <p className="text-xs text-slate-400">
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

  const shippingAddr = subOrder.order?.shippingAddress;
  const packageTotal = subOrder.totalAmount ?? 0;
  const packageShipping = subOrder.shippingCost ?? subOrder.shippingFee ?? 0;
  const commission = subOrder.commissionAmount ?? 0;
  const netEarnings = subOrder.sellerEarnings ?? 0;

  return (
    <div className="space-y-6">
      {/* Header bar with Back button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/seller/orders">
            <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
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
            <p className="text-xs text-slate-400 mt-0.5">
              Parent Order ID: {subOrder.order?.orderNumber || subOrder.orderId} • Created on{" "}
              {new Date(subOrder.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Packaging Slip Action */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleFetchAndPrintSlip}
            disabled={isLoadingSlip}
            className="text-xs border-slate-700 gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-sky-400" />
            {isLoadingSlip ? "Generating Slip..." : "Thermal Packaging Slip"}
          </Button>

          {/* Master invoice link */}
          <Link href={`/orders/${subOrder.orderId}`} target="_blank">
            <Button size="sm" variant="ghost" className="text-xs text-slate-400 hover:text-white gap-1">
              Customer Invoice
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Logistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logistics & Courier Automation Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Courier Logistics & Booking</h3>
                  <p className="text-xs text-slate-400">
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
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Courier Partner</span>
                  <div className="text-xs font-bold text-white mt-1">{subOrder.courierName || "Steadfast Courier"}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Consignment ID</span>
                  <div className="text-xs font-mono font-bold text-sky-400 mt-1">{subOrder.consignmentId}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Tracking Code</span>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">{subOrder.trackingNumber || "N/A"}</div>
                </div>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="text-xs text-slate-300">
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
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-brand-500" />
                Package Items ({subOrder.items?.length || 0})
              </h2>
              <span className="text-xs text-slate-400">
                Package Subtotal: ৳{packageTotal.toLocaleString()}
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
                      <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 relative flex items-center justify-center">
                        {itemImg ? (
                          <Image
                            src={itemImg}
                            alt={itemName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-xs truncate">
                          {itemName}
                        </h4>
                        {(variantLabel || itemSku) && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {variantLabel ? `Variant: ${variantLabel} ` : ""}
                            {itemSku ? `(SKU: ${itemSku})` : ""}
                          </p>
                        )}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ৳{itemPrice.toLocaleString()} × {itemQty} qty
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-white text-xs">
                        ৳{lineTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Escrow Financial Information Box */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">7-Day Escrow Protection</h3>
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

            <div className="text-xs text-slate-300 leading-relaxed">
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
                  ৳{netEarnings.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Customer Address, Financial Summary & Status Control */}
        <div className="space-y-6">
          {/* Fulfillment Status Control */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Update Shipment Status</h3>
            <div className="space-y-2">
              {(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  disabled={isUpdatingStatus || subOrder.status === st}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                    subOrder.status === st
                      ? "bg-brand-600 text-white font-bold"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>Mark as {st}</span>
                  {subOrder.status === st && <CheckCircle2 className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Shipping Destination */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-500" />
              Delivery Destination
            </h3>
            <div className="text-xs text-slate-300 space-y-1.5 pt-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {shippingAddr?.fullName || "Recipient"}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                {shippingAddr?.phone || "N/A"}
              </div>
              <div className="text-slate-300 pl-5 leading-normal">
                {shippingAddr?.streetAddress || "Address not provided"}
                {shippingAddr?.city ? `, ${shippingAddr.city}` : ""}
                {shippingAddr?.state ? `, ${shippingAddr.state}` : ""}
              </div>
            </div>
          </div>

          {/* Financials & Payout Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Financial Breakdown
            </h3>
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="text-white font-medium">৳{packageTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Package Shipping Fee:</span>
                <span className="text-white font-medium">
                  ৳{packageShipping.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Commission:</span>
                <span className="text-rose-400 font-medium">
                  -৳{commission.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                <span className="text-white">Net Seller Payout:</span>
                <span className="text-emerald-400">৳{netEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thermal Packaging Slip Modal (4x6 format preview) */}
      {showSlipModal && packagingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
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
                <div className="font-black text-sm tracking-widest">{packagingSlip.storeName}</div>
                <div className="text-[10px] text-slate-600">Merchant Fulfillment Manifest</div>
              </div>

              <div className="flex justify-between text-[11px]">
                <span><strong>ORDER:</strong> #{packagingSlip.orderNumber}</span>
                <span><strong>PKG:</strong> #{packagingSlip.subOrderNumber}</span>
              </div>

              <div className="p-2 bg-slate-100 rounded text-[11px] space-y-1">
                <div><strong>SHIP TO:</strong></div>
                <div>{packagingSlip.customer.name}</div>
                <div>{packagingSlip.customer.phone}</div>
                <div>{packagingSlip.customer.address}</div>
              </div>

              <div className="border-t border-b border-slate-300 py-2 space-y-1">
                <div className="font-bold text-[10px]">ITEMS MANIFEST ({packagingSlip.items.length}):</div>
                {packagingSlip.items.map((it: IThermalPackagingSlipItem, idx: number) => (
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
                <span>৳{packagingSlip.financials.codAmount}</span>
              </div>

              <div className="text-center pt-2 text-[10px] font-bold text-slate-700">
                <div>COURIER: {packagingSlip.courier.name}</div>
                <div className="text-sm font-mono tracking-widest mt-1">
                  ||||| {packagingSlip.courier.trackingCode} |||||
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
