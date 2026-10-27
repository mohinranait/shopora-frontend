import React from "react";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/types";

type Variant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "brand" | "purple";

const STATUS_VARIANT: Record<OrderStatus, Variant> = {
  PENDING: "warning",
  CONFIRMED: "brand",
  PROCESSING: "purple",
  SHIPPED: "brand",
  DELIVERED: "success",
  CANCELLED: "destructive",
  RETURNED: "secondary",
};

export const ADMIN_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

const PAYMENT_VARIANT: Record<PaymentStatus, Variant> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export function AdminStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="text-[10px]">
      {ADMIN_STATUS_LABEL[status]}
    </Badge>
  );
}

export function AdminPaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={PAYMENT_VARIANT[status]} className="text-[10px]">
      {status}
    </Badge>
  );
}

/** Next forward step for a shipment, used for the one-click "advance" action */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "Confirm",
  CONFIRMED: "Start packing",
  PROCESSING: "Mark shipped",
  SHIPPED: "Mark delivered",
};

export const taka = (n: number) => `৳${Math.round(n).toLocaleString("en-US")}`;

export const relativeTime = (value: string) => {
  const d = new Date(value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
  const diff = (Date.now() - d.getTime()) / 1000;
  if (Number.isNaN(diff)) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};
