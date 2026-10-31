"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Ban,
  ChevronRight,
  Copy,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  Store,
  Truck,
  User,
  X,
  Printer,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetAdminOrderQuery,
  useUpdateAdminOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useUpdateSubOrderStatusMutation,
  useBookCourierMutation,
  useLazyGetPackagingSlipQuery,
} from "@/redux";
import { getApiErrorMessage } from "@/services/api";
import type { IOrder, ISubOrder, OrderStatus, PaymentStatus, IThermalPackagingSlip } from "@/types";
import {
  ADMIN_STATUS_LABEL,
  AdminPaymentBadge,
  AdminStatusBadge,
  NEXT_ACTION_LABEL,
  NEXT_STATUS,
  relativeTime,
  taka,
} from "@/components/admin/orders/adminOrderUi";

const COURIERS = ["Steadfast", "Pathao", "RedX", "Sundarban", "eCourier", "Paperfly", "Shopora Logistics"];

/** RTK Query errors carry the API message under `data.message` */
const errorMessage = (e: unknown) => {
  const data = (e as { data?: { message?: string } })?.data;
  return data?.message || getApiErrorMessage(e);
};

function ReasonDialog({
  title,
  description,
  confirmLabel,
  busy,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-md p-1 text-slate-400 hover:bg-slate-800" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Reason (shared with the seller)"
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">
            Keep
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShipmentPanel({
  order,
  shipment,
  single,
  onOpenSlip,
}: {
  order: IOrder;
  shipment: ISubOrder;
  single: boolean;
  onOpenSlip: (slip: IThermalPackagingSlip) => void;
}) {
  const [updateSubOrder, { isLoading }] = useUpdateSubOrderStatusMutation();
  const [bookCourier, { isLoading: isBookingCourier }] = useBookCourierMutation();
  const [fetchSlip, { isLoading: isFetchingSlip }] = useLazyGetPackagingSlipQuery();

  const [courier, setCourier] = useState(shipment.courierName ?? "");
  const [tracking, setTracking] = useState(shipment.trackingNumber ?? "");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const next = NEXT_STATUS[shipment.status];
  const terminal = shipment.status === "CANCELLED" || shipment.status === "RETURNED";
  const trackingDirty = courier !== (shipment.courierName ?? "") || tracking !== (shipment.trackingNumber ?? "");

  const handleBookCourier = async (provider: string = "Steadfast") => {
    try {
      const res = await bookCourier({ subOrderId: shipment.id, body: { provider } }).unwrap();
      toast.success(
        `Courier booked with ${res.data.courierName}! Consignment: ${res.data.consignmentId}, Tracking: ${res.data.trackingCode}`
      );
      setCourier(res.data.courierName);
      setTracking(res.data.trackingCode);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const handleFetchAndPrintSlip = async () => {
    try {
      const res = await fetchSlip(shipment.id).unwrap();
      if (res.data) {
        onOpenSlip(res.data);
      }
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const run = async (status: OrderStatus, success: string) => {
    try {
      await updateSubOrder({
        orderId: order.id,
        subOrderId: shipment.id,
        status,
        ...(trackingDirty || status === "SHIPPED" ? { courierName: courier, trackingNumber: tracking } : {}),
      }).unwrap();
      toast.success(success);
      return true;
    } catch (e) {
      toast.error(errorMessage(e));
      return false;
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <Store className="h-4 w-4 text-slate-400" />
              {shipment.store ? shipment.store.storeName : "Shopora Direct"}
              {shipment.isPlatformOwned && <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-400">PLATFORM</span>}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">
              {shipment.subOrderNumber}
              {shipment.store?.phone && ` · ${shipment.store.phone}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFetchAndPrintSlip}
              disabled={isFetchingSlip}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-sky-400 hover:bg-slate-800 transition"
              title="Print 4x6 Thermal Packaging Slip"
            >
              {isFetchingSlip ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3" />}
              <span>Thermal Slip</span>
            </button>
            <AdminStatusBadge status={shipment.status} />
          </div>
        </div>

        {/* Courier Booking Status Widget */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Courier Automation</span>
                {shipment.consignmentId ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Booked
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                    Not Dispatched
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {shipment.consignmentId ? (
                  <>
                    <strong className="text-white">{shipment.courierName || "Steadfast"}</strong> • Consignment:{" "}
                    <span className="font-mono text-sky-400 font-bold">{shipment.consignmentId}</span> • Tracking:{" "}
                    <span className="font-mono text-emerald-400 font-bold">{shipment.trackingNumber || "N/A"}</span>
                  </>
                ) : (
                  "Book consignment with Steadfast Courier or Pathao directly."
                )}
              </p>
            </div>
          </div>

          {!shipment.consignmentId && !terminal && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleBookCourier("Steadfast")}
                disabled={isBookingCourier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-xs disabled:opacity-60"
              >
                {isBookingCourier ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
                <span>Book Steadfast</span>
              </button>
              <button
                type="button"
                onClick={() => handleBookCourier("Pathao")}
                disabled={isBookingCourier}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition disabled:opacity-60"
              >
                <span>Book Pathao</span>
              </button>
            </div>
          )}
        </div>

        <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800">
          {shipment.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-3">
              <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                {item.productImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.productImage} alt="" className="h-full w-full object-contain p-0.5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{item.productName}</p>
                <p className="text-[11px] text-slate-400">
                  {item.variantTitle && `${item.variantTitle} · `}
                  {item.sku && `SKU ${item.sku} · `}
                  {taka(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-white">{taka(item.totalPrice)}</span>
            </li>
          ))}
        </ul>

        {!shipment.isPlatformOwned && (
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-lg bg-slate-900 p-2">
              <p className="text-slate-500">Subtotal</p>
              <p className="font-mono font-bold text-white">{taka(shipment.subtotal)}</p>
            </div>
            <div className="rounded-lg bg-slate-900 p-2">
              <p className="text-slate-500">Commission ({shipment.commissionRate}%)</p>
              <p className="font-mono font-bold text-amber-400">{taka(shipment.commissionAmount)}</p>
            </div>
            <div className="rounded-lg bg-slate-900 p-2">
              <p className="text-slate-500">Seller gets</p>
              <p className="font-mono font-bold text-emerald-400">
                {taka(shipment.sellerEarnings)}
                {shipment.isPayoutSettled && <span className="block text-[9px] font-semibold text-emerald-500">CREDITED</span>}
              </p>
            </div>
          </div>
        )}

        {!terminal && (
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="h-9 rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
              aria-label="Courier"
            >
              <option value="">Courier…</option>
              {[...new Set([...COURIERS, courier].filter(Boolean))].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Tracking number"
              className="h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 font-mono text-xs text-slate-100 placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="button"
              onClick={() => run(shipment.status, "Tracking saved")}
              disabled={!trackingDirty || isLoading}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        )}
        {terminal && (shipment.courierName || shipment.trackingNumber) && (
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <Truck className="h-3.5 w-3.5" /> {shipment.courierName} {shipment.trackingNumber}
          </p>
        )}

        {/* Per-shipment actions only matter when an order ships from several stores */}
        {!single && !terminal && (
          <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
            {next && (
              <button
                type="button"
                onClick={() => run(next, `Package marked ${ADMIN_STATUS_LABEL[next].toLowerCase()}`)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-deep disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
                {NEXT_ACTION_LABEL[shipment.status]}
              </button>
            )}
            {shipment.status !== "SHIPPED" && shipment.status !== "DELIVERED" && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                <Ban className="h-3.5 w-3.5" /> Cancel package
              </button>
            )}
            {(shipment.status === "SHIPPED" || shipment.status === "DELIVERED") && (
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm("Mark this package as returned? Stock is restored and any seller credit is reversed.")) {
                    await run("RETURNED", "Package marked returned");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Mark returned
              </button>
            )}
          </div>
        )}
      </CardContent>

      {confirmCancel && (
        <ReasonDialog
          title="Cancel this package?"
          description="Only this store's items are cancelled and their stock is restored."
          confirmLabel="Cancel package"
          busy={isLoading}
          onClose={() => setConfirmCancel(false)}
          onConfirm={async () => {
            if (await run("CANCELLED", "Package cancelled")) setConfirmCancel(false);
          }}
        />
      )}
    </Card>
  );
}

function PaymentCard({ order }: { order: IOrder }) {
  const [updatePayment, { isLoading }] = useUpdatePaymentStatusMutation();
  const [status, setStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [txn, setTxn] = useState(order.paymentTransactionId ?? "");
  const dirty = status !== order.paymentStatus || txn !== (order.paymentTransactionId ?? "");

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-white">
            <CreditCard className="h-4 w-4 text-slate-400" /> Payment
          </p>
          <AdminPaymentBadge status={order.paymentStatus} />
        </div>
        <p className="text-xs text-slate-400">
          Method: <span className="font-semibold text-slate-200">{order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod}</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            className="h-9 rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
            aria-label="Payment status"
          >
            <option value="PENDING">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <input
            value={txn}
            onChange={(e) => setTxn(e.target.value)}
            placeholder="Transaction / receipt ID"
            className="h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <button
          type="button"
          disabled={!dirty || isLoading}
          onClick={async () => {
            try {
              await updatePayment({ id: order.id, paymentStatus: status, transactionId: txn || undefined }).unwrap();
              toast.success("Payment updated");
            } catch (e) {
              toast.error(errorMessage(e));
            }
          }}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-40"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Update payment
        </button>
        {order.paymentMethod === "COD" && (
          <p className="text-[11px] text-slate-500">Cash on delivery is marked paid automatically when every package is delivered.</p>
        )}
      </CardContent>
    </Card>
  );
}

function OrderDetailInner() {
  const params = useParams();
  const id = params?.id as string;
  const { data: order, isLoading, isError, refetch } = useGetAdminOrderQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });
  const [updateOrderStatus, { isLoading: updating }] = useUpdateAdminOrderStatusMutation();
  const [dialog, setDialog] = useState<null | "cancel">(null);
  const [packagingSlip, setPackagingSlip] = useState<IThermalPackagingSlip | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }
  if (isError || !order) {
    return (
      <div className="space-y-3 py-20 text-center">
        <p className="text-sm text-slate-300">Order not found.</p>
        <button type="button" onClick={() => refetch()} className="text-xs text-sky-400 underline">
          Try again
        </button>
      </div>
    );
  }

  const active = order.subOrders.filter((s) => s.status !== "CANCELLED" && s.status !== "RETURNED");
  const sameStep = active.length > 0 && active.every((s) => s.status === active[0].status);
  const next = sameStep ? NEXT_STATUS[active[0].status] : undefined;
  const canCancel = active.length > 0 && active.every((s) => s.status !== "SHIPPED" && s.status !== "DELIVERED");
  const canReturn = active.length > 0 && active.every((s) => s.status === "SHIPPED" || s.status === "DELIVERED");
  const single = order.subOrders.length === 1;
  const addr = order.shippingAddress;
  const partiallyCancelled = order.payableAmount !== order.totalAmount;

  const setWholeStatus = async (status: OrderStatus, reason?: string) => {
    try {
      await updateOrderStatus({ id: order.id, status, reason }).unwrap();
      toast.success(`Order ${ADMIN_STATUS_LABEL[status].toLowerCase()}`);
      return true;
    } catch (e) {
      toast.error(errorMessage(e));
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> All orders
      </Link>

      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-xl font-black text-white sm:text-2xl">{order.orderNumber}</h1>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(order.orderNumber).then(() => toast.success("Copied"))}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-white"
              aria-label="Copy order number"
            >
              <Copy className="h-4 w-4" />
            </button>
            <AdminStatusBadge status={order.orderStatus} />
            <AdminPaymentBadge status={order.paymentStatus} />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Placed {relativeTime(order.createdAt)} · {order.itemCount} items · {order.subOrders.length}{" "}
            {order.subOrders.length === 1 ? "package" : "packages"} · updated {relativeTime(order.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {next && (
            <button
              type="button"
              onClick={() => setWholeStatus(next)}
              disabled={updating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-deep disabled:opacity-60"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              {NEXT_ACTION_LABEL[active[0].status]}
              {!single && " all"}
            </button>
          )}
          {canReturn && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Mark the whole order as returned? Stock is restored and seller credits are reversed.")) {
                  await setWholeStatus("RETURNED");
                }
              }}
              disabled={updating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="h-4 w-4" /> Mark returned
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => setDialog("cancel")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
            >
              <Ban className="h-4 w-4" /> Cancel order
            </button>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {order.subOrders.map((s) => (
            <ShipmentPanel
              key={s.id}
              order={order}
              shipment={s}
              single={single}
              onOpenSlip={(slip) => setPackagingSlip(slip)}
            />
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5 text-xs">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <User className="h-4 w-4 text-slate-400" /> Customer
                {!order.userId && <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">GUEST</span>}
              </p>
              <p className="font-semibold text-slate-200">{order.customer?.name ?? addr.fullName}</p>
              {(order.customer?.email || order.guestEmail) && (
                <p className="flex items-center gap-2 text-slate-400">
                  <Mail className="h-3.5 w-3.5" /> {order.customer?.email ?? order.guestEmail}
                </p>
              )}
              <a href={`tel:${addr.phone}`} className="flex items-center gap-2 text-sky-400 hover:underline">
                <Phone className="h-3.5 w-3.5" /> {addr.phone}
              </a>
              <div className="flex gap-2 border-t border-slate-800 pt-3 text-slate-300">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <p>
                  <span className="font-semibold text-slate-200">{addr.fullName}</span>
                  <br />
                  {addr.streetAddress}, {addr.city}
                  {addr.state ? `, ${addr.state}` : ""}
                  {addr.postalCode ? ` ${addr.postalCode}` : ""}
                </p>
              </div>
              {order.notes && (
                <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-300">
                  <span className="font-semibold">Note:</span> {order.notes}
                </p>
              )}
            </CardContent>
          </Card>

          <PaymentCard key={`${order.paymentStatus}-${order.paymentTransactionId}`} order={order} />

          <Card>
            <CardContent className="space-y-2 p-5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">{taka(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="font-mono text-emerald-400">−{taka(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className="font-mono text-slate-200">{order.shippingFee === 0 ? "Free" : taka(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-white">
                <span>Order total</span>
                <span className={`font-mono ${partiallyCancelled ? "text-slate-500 line-through" : ""}`}>{taka(order.totalAmount)}</span>
              </div>
              {partiallyCancelled && (
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>{order.paymentMethod === "COD" ? "Collect on delivery" : "Payable"}</span>
                  <span className="font-mono">{taka(order.payableAmount)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {dialog === "cancel" && (
        <ReasonDialog
          title="Cancel this order?"
          description="All packages are cancelled, stock is restored and sellers are notified."
          confirmLabel="Cancel order"
          busy={updating}
          onClose={() => setDialog(null)}
          onConfirm={async (reason) => {
            if (await setWholeStatus("CANCELLED", reason)) setDialog(null);
          }}
        />
      )}

      {/* Thermal Packaging Slip Modal (4x6 format preview) */}
      {packagingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="font-black text-base text-slate-900 tracking-tight">
                THERMAL PACKAGING SLIP (4x6)
              </div>
              <button
                type="button"
                onClick={() => setPackagingSlip(null)}
                className="text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
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
                {packagingSlip.items.map((it, idx) => (
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
              <button
                type="button"
                onClick={() => setPackagingSlip(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                <Printer className="h-4 w-4" />
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        </div>
      }
    >
      <OrderDetailInner />
    </Suspense>
  );
}
