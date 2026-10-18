"use client";

import React, { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertCircle,
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

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([
    {
      id: "PAY-1082",
      seller: "Apex Tech & Gadgets",
      method: "bKash Merchant",
      account: "+8801711002233",
      amount: 45000,
      fee: 0,
      status: "pending",
      requestedAt: "Today, 11:30 AM",
    },
    {
      id: "PAY-1081",
      seller: "ByteTech Official",
      method: "City Bank (BEFTN)",
      account: "150293847501 (Gulshan Br.)",
      amount: 68000,
      fee: 0,
      status: "pending",
      requestedAt: "Yesterday, 04:15 PM",
    },
    {
      id: "PAY-1079",
      seller: "Apparel Studio BD",
      method: "Nagad Commercial",
      account: "+8801915664422",
      amount: 18500,
      fee: 0,
      status: "processed",
      requestedAt: "Oct 16, 2026",
    },
    {
      id: "PAY-1075",
      seller: "Apex Tech & Gadgets",
      method: "bKash Merchant",
      account: "+8801711002233",
      amount: 32000,
      fee: 0,
      status: "processed",
      requestedAt: "Oct 12, 2026",
    },
  ]);

  const handleApprove = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "processed" } : p))
    );
  };

  const handleReject = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Vendor Payouts & Commission Escrow
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorize seller wallet withdrawals, disburse earnings, and reconcile platform commission rates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Payouts Statement</span>
          </Button>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">
                Pending Withdrawal Requests
              </p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                ৳ 1,13,000
              </p>
              <span className="text-[11px] text-slate-400">2 Requests queued</span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">
                Platform Commission Realized
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                ৳ 48,560
              </p>
              <span className="text-[11px] text-emerald-400 font-semibold">
                ↑ 14.2% MoM
              </span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">
                Disbursed This Month
              </p>
              <p className="text-2xl font-black text-sky-400 mt-1">
                ৳ 2,45,000
              </p>
              <span className="text-[11px] text-slate-400">18 successful transfers</span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-base font-bold text-white">
            Payout Requests Queue
          </CardTitle>
          <CardDescription>
            Verify seller bank details or MFS merchant wallets before approving funds release.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Payout ID</th>
                  <th className="py-3 px-4">Seller Store</th>
                  <th className="py-3 px-4">Transfer Channel</th>
                  <th className="py-3 px-4">Recipient Account</th>
                  <th className="py-3 px-4">Requested Amount</th>
                  <th className="py-3 px-4">Requested At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {payouts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {p.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {p.seller}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-300">
                      {p.method}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {p.account}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      ৳ {p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {p.requestedAt}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === "processed" ? (
                        <Badge variant="success">Completed</Badge>
                      ) : p.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="warning">Pending Authorization</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="brand"
                            onClick={() => handleApprove(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px]"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => handleReject(p.id)}
                            className="text-[11px]"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {p.status === "processed" ? "Paid" : "Declined"}
                        </span>
                      )}
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
