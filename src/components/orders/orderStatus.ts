import type { OrderStatus, PaymentStatus } from "@/types";

export const ORDER_STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: "PENDING", label: "Order placed", hint: "We've received your order" },
  { status: "CONFIRMED", label: "Confirmed", hint: "The seller accepted your order" },
  { status: "PROCESSING", label: "Packing", hint: "Your items are being packed" },
  { status: "SHIPPED", label: "On the way", hint: "Handed to the courier" },
  { status: "DELIVERED", label: "Delivered", hint: "Enjoy your purchase!" },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Packing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

/** Light-theme (storefront) badge colours */
export const STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
  PROCESSING: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  SHIPPED: "bg-violet-50 text-violet-700 ring-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  RETURNED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export const PAYMENT_LABEL: Record<string, string> = {
  COD: "Cash on delivery",
  BKASH: "bKash",
  NAGAD: "Nagad",
  STRIPE: "Card",
  SSLCOMMERZ: "SSLCommerz",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Unpaid",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const stepIndex = (status: OrderStatus) => ORDER_STEPS.findIndex((s) => s.status === status);

/** Postgres timestamps ("2026-10-18 13:32:28.46+00") -> Date */
export const parseDate = (v: string) => new Date(v.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));

export const formatDate = (v: string, withTime = false) => {
  const d = parseDate(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};
