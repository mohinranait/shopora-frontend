"use client";

import React from "react";
import {
  Package,
  Clock,
  Heart,
  CreditCard,
  ArrowRight,
} from "lucide-react";

interface DashboardStatsProps {
  totalOrders: number;
  pendingOrders: number;
  wishlistCount: number;
  totalSpent: number;
  setActiveTab: (tab: string) => void;
}

export function DashboardStats({
  totalOrders,
  pendingOrders,
  wishlistCount,
  totalSpent,
  setActiveTab,
}: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      desc: "All orders placed",
      icon: Package,
      iconColor: "text-brand-deep",
      bgColor: "bg-sky-50",
      action: () => setActiveTab("orders"),
      actionLabel: "View orders",
    },
    {
      title: "Active Orders",
      value: pendingOrders,
      desc: "In progress / shipping",
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      action: () => setActiveTab("orders"),
      actionLabel: "Track status",
    },
    {
      title: "Wishlist Items",
      value: wishlistCount,
      desc: "Saved products",
      icon: Heart,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50",
      action: () => setActiveTab("favorite"),
      actionLabel: "View wishlist",
    },
    {
      title: "Total Spent",
      value: `৳${Math.round(totalSpent).toLocaleString("en-US")}`,
      desc: "Paid purchases",
      icon: CreditCard,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      action: () => setActiveTab("payments"),
      actionLabel: "Payment history",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">
                {card.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-md ${card.bgColor} ${card.iconColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 truncate">
                {card.desc}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={card.action}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand-deep cursor-pointer"
              >
                <span>{card.actionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
