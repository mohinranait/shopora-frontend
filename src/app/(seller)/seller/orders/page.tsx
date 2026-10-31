"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetSellerSubOrdersQuery } from "@/redux";
import { ISubOrder } from "@/types";

export default function SellerOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, refetch } = useGetSellerSubOrdersQuery();
  const subOrders = data?.orders || [];

  const filteredOrders = subOrders.filter((o: ISubOrder) => {
    const matchesSearch =
      (o.subOrderNumber && o.subOrderNumber.toLowerCase().includes(search.toLowerCase())) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
      (o.consignmentId && o.consignmentId.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-6 w-6 text-brand-500" />
            Orders & Shipments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fulfill vendor packages, generate courier tracking, print packaging slips, and track 7-day escrow maturation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-slate-800 text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: "ALL", label: "All Orders", count: subOrders.length },
            {
              id: "PENDING",
              label: "Pending",
              count: subOrders.filter((o) => o.status === "PENDING").length,
            },
            {
              id: "PROCESSING",
              label: "Processing",
              count: subOrders.filter((o) => o.status === "PROCESSING").length,
            },
            {
              id: "SHIPPED",
              label: "Shipped",
              count: subOrders.filter((o) => o.status === "SHIPPED").length,
            },
            {
              id: "DELIVERED",
              label: "Delivered (Escrow)",
              count: subOrders.filter((o) => o.status === "DELIVERED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search SubOrder, Consignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
            Loading sub-orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <ShoppingBag className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">No orders found in this view</p>
            <p className="text-slate-500 mt-1">Orders placed by customers for your store will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Package / SubOrder</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Order Total</th>
                  <th className="px-5 py-3">Net Earnings</th>
                  <th className="px-5 py-3">Courier Consignment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Escrow</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredOrders.map((order: ISubOrder) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* SubOrder Number & Date */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{order.subOrderNumber || order.id.slice(0, 8)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Items Count */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-200">
                        {order.items?.length || 0} product(s)
                      </span>
                    </td>

                    {/* Order Total & Split Shipping Fee */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">
                        ৳{order.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ship: ৳{(order.shippingCost || order.shippingFee || 0).toLocaleString()}
                      </div>
                    </td>

                    {/* Net Seller Earnings */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-emerald-400">
                        ৳{order.sellerEarnings.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Fee: ৳{order.commissionAmount.toLocaleString()}
                      </div>
                    </td>

                    {/* Courier Consignment */}
                    <td className="px-5 py-3.5">
                      {order.consignmentId || order.trackingNumber ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] font-mono text-sky-400 font-bold">
                            <Truck className="h-3 w-3 shrink-0" />
                            <span>{order.trackingNumber || order.consignmentId}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.courierName || "Steadfast"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Not booked</span>
                      )}
                    </td>

                    {/* Fulfillment Status */}
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={
                          order.status === "DELIVERED"
                            ? "success"
                            : order.status === "SHIPPED"
                            ? "brand"
                            : order.status === "PROCESSING"
                            ? "purple"
                            : order.status === "CANCELLED"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </td>

                    {/* Escrow Status */}
                    <td className="px-5 py-3.5">
                      {order.escrowStatus === "RELEASED" ? (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Settled
                        </Badge>
                      ) : order.escrowStatus === "HELD" ? (
                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px] gap-1">
                          <Clock className="h-3 w-3" />
                          Held 7-Days
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-500">Pending</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/seller/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 gap-1">
                          Manage
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
