"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CreditCard,
  Star,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  TrendingUp,
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

export default function AdminSellersPage() {
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "kyc_pending">("all");
  const [search, setSearch] = useState("");

  const sellers = [
    {
      id: "sel-1",
      storeName: "Apex Tech & Gadgets",
      slug: "apex-tech-gadgets",
      ownerName: "Kamrul Islam",
      email: "kamrul@apextech.com",
      phone: "+8801711002233",
      commissionRate: 10,
      walletBalance: 45000,
      totalSales: 185000,
      totalProducts: 24,
      rating: 4.8,
      kycStatus: "approved",
      joined: "Jan 15, 2026",
    },
    {
      id: "sel-2",
      storeName: "ByteTech Official",
      slug: "bytetech-official",
      ownerName: "Sabbir Hossain",
      email: "contact@bytetech.com.bd",
      phone: "+8801812998877",
      commissionRate: 8,
      walletBalance: 28400,
      totalSales: 142000,
      totalProducts: 18,
      rating: 4.9,
      kycStatus: "approved",
      joined: "Feb 02, 2026",
    },
    {
      id: "sel-3",
      storeName: "Apparel Studio BD",
      slug: "apparel-studio-bd",
      ownerName: "Tanjina Sultana",
      email: "studio@apparelstudio.com",
      phone: "+8801915664422",
      commissionRate: 12,
      walletBalance: 12800,
      totalSales: 89000,
      totalProducts: 35,
      rating: 4.7,
      kycStatus: "approved",
      joined: "Feb 20, 2026",
    },
    {
      id: "sel-4",
      storeName: "Gadget Freak BD",
      slug: "gadget-freak-bd",
      ownerName: "Nafis Fuad",
      email: "info@gadgetfreak.com",
      phone: "+8801678112233",
      commissionRate: 10,
      walletBalance: 0,
      totalSales: 0,
      totalProducts: 4,
      rating: 0,
      kycStatus: "pending_kyc",
      joined: "2 days ago",
    },
  ];

  const filteredSellers = sellers.filter((s) => {
    if (activeTab === "approved" && s.kycStatus !== "approved") return false;
    if (activeTab === "kyc_pending" && s.kycStatus !== "pending_kyc") return false;
    if (
      search &&
      !s.storeName.toLowerCase().includes(search.toLowerCase()) &&
      !s.ownerName.toLowerCase().includes(search.toLowerCase())
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
            Multi-Vendor Stores & KYC Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit merchant applications, commission structures, store compliance, and wallet balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="brand" className="gap-1.5 text-xs">
            <Building2 className="h-4 w-4" />
            <span>Invite New Vendor</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards for Vendors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">
                Active Vendors
              </p>
              <p className="text-2xl font-black text-white mt-1">128 Stores</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Store className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">
                Pending KYC Applications
              </p>
              <p className="text-2xl font-black text-amber-400 mt-1">3 Vendors</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">
                Vendor Escrow Balance
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                ৳ 86,200
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "all"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Vendors ({sellers.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === "approved"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Verified (3)
          </button>
          <button
            onClick={() => setActiveTab("kyc_pending")}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeTab === "kyc_pending"
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <span>KYC Pending</span>
            <span className="h-4 px-1 rounded-full bg-amber-400/20 text-[10px] font-bold">
              1
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores or owners..."
            className="w-full h-9 rounded-lg border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Store Name</th>
                  <th className="py-3 px-4">Merchant Contact</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredSellers.map((seller) => (
                  <tr
                    key={seller.id}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 font-bold">
                          {seller.storeName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {seller.storeName}
                            {seller.rating > 0 && (
                              <span className="inline-flex items-center text-[10px] text-amber-400 font-normal">
                                <Star className="h-3 w-3 fill-amber-400" />{" "}
                                {seller.rating}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {seller.totalProducts} Products listed
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">
                        {seller.ownerName}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="h-2.5 w-2.5" /> {seller.email}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="h-2.5 w-2.5" /> {seller.phone}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="brand" className="font-mono text-[11px]">
                        {seller.commissionRate}% Take
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ৳ {seller.totalSales.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ৳ {seller.walletBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {seller.kycStatus === "approved" ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1">
                          <ShieldAlert className="h-3 w-3" /> Under Review
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {seller.kycStatus === "pending_kyc" ? (
                          <Button
                            size="xs"
                            variant="brand"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px]"
                          >
                            Review KYC
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-[11px]"
                          >
                            Manage Store
                          </Button>
                        )}
                      </div>
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
