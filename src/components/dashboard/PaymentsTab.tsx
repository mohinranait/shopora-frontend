"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Receipt,
  Wallet,
  Lock,
  ArrowRight,
} from "lucide-react";
import type { IOrder } from "@/types";
import { formatTaka } from "@/components/cart/CartParts";
import { formatDate } from "@/components/orders/orderStatus";

interface PaymentsTabProps {
  orders: IOrder[];
}

export function PaymentsTab({ orders }: PaymentsTabProps) {
  // Aggregate payment statistics
  const totalPaid = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const pendingPayment = orders
    .filter((o) => o.paymentStatus === "PENDING" && o.orderStatus !== "CANCELLED")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const paidCount = orders.filter((o) => o.paymentStatus === "PAID").length;
  const pendingCount = orders.filter(
    (o) => o.paymentStatus === "PENDING" && o.orderStatus !== "CANCELLED"
  ).length;

  const paymentBadges = (method: string) => {
    switch (method?.toUpperCase()) {
      case "BKASH":
        return {
          label: "bKash",
          bg: "bg-pink-50 text-pink-700 border-pink-200",
        };
      case "NAGAD":
        return {
          label: "Nagad",
          bg: "bg-orange-50 text-orange-700 border-orange-200",
        };
      case "CARD":
      case "STRIPE":
      case "SSLCOMMERZ":
        return {
          label: "Debit / Credit Card",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "COD":
      default:
        return {
          label: "Cash on Delivery",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
            <Receipt className="h-3 w-3" /> Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Payment Metrics Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Successful Paid
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 tracking-tight tabular-nums">
            {formatTaka(totalPaid)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Across {paidCount} completed transactions
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Pending Payments
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 tracking-tight tabular-nums">
            {formatTaka(pendingPayment)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {pendingCount} orders payable upon delivery (COD)
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Payment Methods
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 text-brand-deep">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
            COD & Mobile
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            bKash, Nagad, Cash On Delivery
          </p>
        </div>
      </div>

      {/* 2. Billing & Transaction History */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Transactions & Billing Records
            </h2>
            <p className="text-xs text-slate-500">
              Payment breakdown and verification status for all your orders.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {orders.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-2.5 pl-1">Order #</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Payment Method</th>
                  <th className="pb-2.5">Transaction ID</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right pr-1">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((o) => {
                  const methodInfo = paymentBadges(o.paymentMethod);
                  return (
                    <tr
                      key={o.id}
                      className="transition hover:bg-slate-50 group"
                    >
                      <td className="py-3 pl-1 font-mono font-bold text-slate-900">
                        <Link
                          href={`/orders/${o.orderNumber}`}
                          className="hover:text-brand flex items-center gap-1"
                        >
                          {o.orderNumber}
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
                        </Link>
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${methodInfo.bg}`}
                        >
                          {methodInfo.label}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-500">
                        {o.paymentTransactionId || "—"}
                      </td>
                      <td className="py-3">{statusBadge(o.paymentStatus)}</td>
                      <td className="py-3 text-right pr-1 font-bold tabular-nums text-slate-900">
                        {formatTaka(o.totalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CreditCard className="h-7 w-7 text-slate-400" />
              <p className="mt-2 text-xs font-bold text-slate-800">
                No payment transactions yet
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Once you place an order, the billing record will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Accepted Payment Methods & Buyer Protection */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <h3 className="text-xs font-bold text-slate-900">
            Payment Security & Assurance
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs text-slate-600">
          <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3 space-y-0.5">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" /> 256-bit SSL Security
            </span>
            <p className="text-[11px] text-slate-500">
              Encrypted and processed through certified gateways.
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3 space-y-0.5">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Cash On Delivery
            </span>
            <p className="text-[11px] text-slate-500">
              Pay upon doorstep inspection across all 64 districts.
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3 space-y-0.5">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-purple-600" /> Easy Refund
            </span>
            <p className="text-[11px] text-slate-500">
              Fast refunds to your original payment channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
