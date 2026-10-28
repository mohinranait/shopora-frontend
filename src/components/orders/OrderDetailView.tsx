"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Ban,
  Check,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RotateCcw,
  Store,
  Truck,
  X,
} from "lucide-react";
import type { IOrder, ISubOrder, OrderStatus } from "@/types";
import { ordersApi } from "@/lib/cart/api";
import { formatTaka } from "@/components/cart/CartParts";
import {
  ORDER_STEPS,
  PAYMENT_LABEL,
  PAYMENT_STATUS_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  formatDate,
  stepIndex,
} from "./orderStatus";

export function OrderStatusBadge({ status, className = "" }: { status: OrderStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_TONE[status]} ${className}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Horizontal progress tracker for one order / shipment */
export function OrderProgress({ status, placedAt, updatedAt }: { status: OrderStatus; placedAt: string; updatedAt: string }) {
  if (status === "CANCELLED" || status === "RETURNED") {
    const Icon = status === "CANCELLED" ? Ban : RotateCcw;
    return (
      <div className="flex items-center gap-3 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <Icon className={`h-5 w-5 ${status === "CANCELLED" ? "text-rose-500" : "text-slate-500"}`} />
        <span>
          This {status === "CANCELLED" ? "order was cancelled" : "order was returned"}
          {updatedAt && ` on ${formatDate(updatedAt)}`}.
        </span>
      </div>
    );
  }

  const current = stepIndex(status);
  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <li key={step.status} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 ${i <= current ? "bg-brand" : "bg-slate-200"}`}
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                done ? "bg-brand text-white" : "bg-slate-200 text-slate-500"
              } ${active ? "ring-4 ring-brand/20" : ""}`}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className={`mt-2 text-[11px] font-semibold sm:text-xs ${done ? "text-slate-900" : "text-slate-400"}`}>
              {step.label}
            </span>
            <span className="hidden text-[10px] text-slate-400 sm:block">
              {i === 0 ? formatDate(placedAt) : active && i > 0 ? formatDate(updatedAt) : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function CancelDialog({
  order,
  phone,
  onClose,
  onCancelled,
}: {
  order: IOrder;
  phone?: string;
  onClose: () => void;
  onCancelled: (order: IOrder) => void;
}) {
  const reasons = ["Ordered by mistake", "Found a better price", "Delivery takes too long", "Want to change items or address", "Other"];
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const updated = await ordersApi.cancel(order.orderNumber, {
        reason: reason === "Other" ? note || "Other" : note ? `${reason} — ${note}` : reason,
        phone,
      });
      toast.success(`Order ${order.orderNumber} cancelled`);
      onCancelled(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't cancel this order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Cancel order">
      <div className="absolute inset-0 bg-slate-950/50" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-5 border border-slate-200 sm:rounded-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cancel this order?</h2>
            <p className="mt-1 text-xs text-slate-500">
              Order <span className="font-mono font-semibold">{order.orderNumber}</span> will be cancelled. This can&apos;t be undone.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs font-semibold text-slate-700">Why are you cancelling?</legend>
          {reasons.map((r) => (
            <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-xs transition ${reason === r ? "border-brand bg-brand-light/50" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-[var(--brand)]" />
              {r}
            </label>
          ))}
        </fieldset>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder={reason === "Other" ? "Tell us a little more" : "Anything else? (optional)"}
          className="mt-3 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="flex-1 rounded-md border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300">
            Keep order
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Cancel order
          </button>
        </div>
      </div>
    </div>
  );
}

function ShipmentCard({ shipment, multiple, placedAt }: { shipment: ISubOrder; multiple: boolean; placedAt: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Store className="h-4 w-4 shrink-0 text-slate-400" />
          {shipment.store ? (
            <Link href={`/vendors/${shipment.store.storeSlug}`} className="truncate font-semibold text-slate-900 hover:text-brand-deep">
              {shipment.store.storeName}
            </Link>
          ) : (
            <span className="font-semibold text-slate-900">Shopora Direct</span>
          )}
          {multiple && <span className="text-xs text-slate-400">· Package {shipment.subOrderNumber.split("-").pop()}</span>}
        </div>
        <OrderStatusBadge status={shipment.status} />
      </header>

      <div className="space-y-4 p-4">
        {multiple && <OrderProgress status={shipment.status} placedAt={placedAt} updatedAt={shipment.updatedAt} />}

        {(shipment.courierName || shipment.trackingNumber) && (
          <p className="flex flex-wrap items-center gap-2 rounded-md bg-violet-50 px-3 py-2 text-xs text-violet-800">
            <Truck className="h-4 w-4" />
            {shipment.courierName && <span className="font-semibold">{shipment.courierName}</span>}
            {shipment.trackingNumber && (
              <span>
                Tracking: <span className="font-mono font-semibold">{shipment.trackingNumber}</span>
              </span>
            )}
          </p>
        )}

        <ul className="divide-y divide-slate-100">
          {shipment.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                {item.productImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.productImage} alt={item.productName} className="h-full w-full object-contain p-1" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                {item.productSlug ? (
                  <Link href={`/products/${item.productSlug}`} className="line-clamp-2 text-xs font-semibold text-slate-900 hover:text-brand-deep">
                    {item.productName}
                  </Link>
                ) : (
                  <p className="line-clamp-2 text-xs font-semibold text-slate-900">{item.productName}</p>
                )}
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {item.variantTitle && `${item.variantTitle} · `}
                  {formatTaka(item.price)} × {item.quantity}
                </p>
              </div>
              <span className="text-xs font-bold tabular-nums text-slate-900">{formatTaka(item.totalPrice)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Customer-facing order detail: progress, shipments, address, payment and totals.
 * `phone` is passed for guest tracking so the guest can cancel too.
 */
export function OrderDetailView({ order: initial, phone }: { order: IOrder; phone?: string }) {
  const [order, setOrder] = useState(initial);
  const [cancelling, setCancelling] = useState(false);
  const multiple = order.subOrders.length > 1;
  const addr = order.shippingAddress;
  const cancelledPart = order.subOrders.some((s) => s.status === "CANCELLED") && order.orderStatus !== "CANCELLED";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-xl font-extrabold text-slate-900 sm:text-2xl">{order.orderNumber}</h1>
            <OrderStatusBadge status={order.orderStatus} />
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(order.orderNumber).then(() => toast.success("Order number copied"))}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Copy order number"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Placed on {formatDate(order.createdAt, true)} · {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        {order.canCancel && (
          <button
            type="button"
            onClick={() => setCancelling(true)}
            className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
          >
            <Ban className="h-3.5 w-3.5" /> Cancel order
          </button>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <OrderProgress status={order.orderStatus} placedAt={order.createdAt} updatedAt={order.updatedAt} />
        {multiple && order.orderStatus !== "CANCELLED" && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Your order ships in {order.subOrders.length} packages from different sellers — each one is tracked below.
          </p>
        )}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {order.subOrders.map((s) => (
            <ShipmentCard key={s.id} shipment={s} multiple={multiple} placedAt={order.createdAt} />
          ))}
        </div>

        <aside className="space-y-4">
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900">{addr.fullName}</p>
                <p className="text-slate-600">{addr.phone}</p>
                <p className="mt-1 text-slate-600">
                  {addr.streetAddress}, {addr.city}
                  {addr.state ? `, ${addr.state}` : ""}
                  {addr.postalCode ? ` ${addr.postalCode}` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-slate-100 pt-3">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div className="text-xs">
                <p className="font-semibold text-slate-900">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
                <p className={order.paymentStatus === "PAID" ? "text-emerald-600" : "text-slate-500"}>
                  {order.orderStatus === "CANCELLED" && order.paymentStatus === "PENDING"
                    ? "Not charged"
                    : PAYMENT_STATUS_LABEL[order.paymentStatus]}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="flex gap-3 border-t border-slate-100 pt-3">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-xs text-slate-600">{order.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-4 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatTaka(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span className="font-semibold text-emerald-600">−{formatTaka(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Delivery</span>
              <span className="font-semibold text-slate-900">{order.shippingFee === 0 ? "Free" : formatTaka(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5 text-sm font-extrabold text-slate-900">
              <span>Total</span>
              <span className={cancelledPart || order.orderStatus === "CANCELLED" ? "text-slate-400 line-through" : ""}>
                {formatTaka(order.totalAmount)}
              </span>
            </div>
            {cancelledPart && (
              <div className="flex justify-between text-sm font-extrabold text-slate-900">
                <span>{order.paymentMethod === "COD" ? "To pay on delivery" : "Payable"}</span>
                <span>{formatTaka(order.payableAmount)}</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {cancelling && (
        <CancelDialog
          order={order}
          phone={phone}
          onClose={() => setCancelling(false)}
          onCancelled={(o) => {
            setOrder(o);
            setCancelling(false);
          }}
        />
      )}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-60 rounded-md bg-slate-200" />
      <div className="h-24 rounded-lg bg-slate-100" />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="h-60 rounded-lg bg-slate-100" />
        <div className="h-60 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}
