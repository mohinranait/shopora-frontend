"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "processing" | "shipped" | "delivered" | "cancelled"
  >("all");
  const [search, setSearch] = useState("");

  const orders = [
    {
      id: "SHP-9842",
      customer: "Rahim Chowdhury",
      email: "rahim@shopora.com",
      phone: "+8801712345678",
      itemsCount: 2,
      store: "Shopora Direct (Platform)",
      isPlatform: true,
      total: 4699,
      paymentMethod: "bKash",
      paymentStatus: "paid",
      orderStatus: "processing",
      date: "12 mins ago",
      city: "Dhaka",
    },
    {
      id: "SHP-9841",
      customer: "Sadia Akter",
      email: "sadia.akter@shopora.com",
      phone: "+8801812345678",
      itemsCount: 1,
      store: "Apex Tech & Gadgets",
      isPlatform: false,
      total: 6200,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "pending",
      orderStatus: "shipped",
      date: "45 mins ago",
      city: "Chittagong",
    },
    {
      id: "SHP-9840",
      customer: "Tanvir Hasan",
      email: "tanvir.h@gmail.com",
      phone: "+8801912345678",
      itemsCount: 3,
      store: "ByteTech Official",
      isPlatform: false,
      total: 3850,
      paymentMethod: "SSLCommerz / Card",
      paymentStatus: "paid",
      orderStatus: "delivered",
      date: "2 hours ago",
      city: "Sylhet",
    },
    {
      id: "SHP-9839",
      customer: "Mehnaz Parveen",
      email: "mehnaz@yahoo.com",
      phone: "+8801612345678",
      itemsCount: 1,
      store: "Apparel Studio BD",
      isPlatform: false,
      total: 2100,
      paymentMethod: "bKash",
      paymentStatus: "paid",
      orderStatus: "delivered",
      date: "4 hours ago",
      city: "Dhaka",
    },
    {
      id: "SHP-9838",
      customer: "Farhan Ahmed",
      email: "farhan.a@gmail.com",
      phone: "+8801512345678",
      itemsCount: 4,
      store: "Shopora Direct (Platform)",
      isPlatform: true,
      total: 8950,
      paymentMethod: "Nagad",
      paymentStatus: "paid",
      orderStatus: "processing",
      date: "5 hours ago",
      city: "Rajshahi",
    },
    {
      id: "SHP-9835",
      customer: "Jubayer Hossain",
      email: "jubayer@outlook.com",
      phone: "+8801799887766",
      itemsCount: 1,
      store: "ByteTech Official",
      isPlatform: false,
      total: 11500,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "failed",
      orderStatus: "cancelled",
      date: "1 day ago",
      city: "Barisal",
    },
  ];

  const filteredOrders = orders.filter((ord) => {
    if (activeTab === "processing" && ord.orderStatus !== "processing")
      return false;
    if (activeTab === "shipped" && ord.orderStatus !== "shipped") return false;
    if (activeTab === "delivered" && ord.orderStatus !== "delivered")
      return false;
    if (activeTab === "cancelled" && ord.orderStatus !== "cancelled")
      return false;
    if (
      search &&
      !ord.id.toLowerCase().includes(search.toLowerCase()) &&
      !ord.customer.toLowerCase().includes(search.toLowerCase()) &&
      !ord.email.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Orders & Shipments Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-vendor dispatching, order line items, payment verifications, and delivery statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export Orders CSV</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "all"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("processing")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "processing"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Processing (2)
          </button>
          <button
            onClick={() => setActiveTab("shipped")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "shipped"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            In Transit / Shipped (1)
          </button>
          <button
            onClick={() => setActiveTab("delivered")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "delivered"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Delivered (2)
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "cancelled"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Cancelled (1)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer..."
            className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer & City</th>
                  <th className="py-3 px-4">Source Store</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4">Placed At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {ord.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{ord.customer}</p>
                      <p className="text-[11px] text-slate-400">
                        {ord.city} • {ord.phone}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {ord.isPlatform ? (
                        <Badge variant="brand" className="text-[10px]">
                          Shopora Direct
                        </Badge>
                      ) : (
                        <Badge variant="purple" className="text-[10px]">
                          {ord.store}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ৳ {ord.total.toLocaleString()}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ({ord.itemsCount} items)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ord.paymentStatus === "paid"
                            ? "success"
                            : ord.paymentStatus === "failed"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {ord.paymentStatus.toUpperCase()}
                      </Badge>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ord.paymentMethod}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ord.orderStatus === "delivered"
                            ? "success"
                            : ord.orderStatus === "shipped"
                            ? "brand"
                            : ord.orderStatus === "cancelled"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px] capitalize"
                      >
                        {ord.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {ord.date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="View Order Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
