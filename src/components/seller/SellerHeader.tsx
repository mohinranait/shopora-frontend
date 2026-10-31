"use client";

import React from "react";
import Link from "next/link";
import { Menu, Palmtree, Wallet, Bell, Sparkles } from "lucide-react";
import { useGetSellerDashboardStatsQuery } from "@/redux";

interface SellerHeaderProps {
  onMobileToggle: () => void;
}

export function SellerHeader({ onMobileToggle }: SellerHeaderProps) {
  const { data: dashboardData } = useGetSellerDashboardStatsQuery();
  const profile = dashboardData?.profile;
  const metrics = dashboardData?.metrics;

  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Hamburger & Store Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileToggle}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Seller Central
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-semibold text-white">
            {profile?.storeName || "My Store"}
          </span>
        </div>
      </div>

      {/* Right Actions: Holiday Alert, Balance, and Notification */}
      <div className="flex items-center gap-3">
        {profile?.isHolidayMode && (
          <Link
            href="/seller/settings"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse hover:bg-amber-500/25 transition-colors"
          >
            <Palmtree className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Vacation Mode Active</span>
            <span className="sm:hidden">Vacation</span>
          </Link>
        )}

        {/* Live Available Balance Chip */}
        <Link
          href="/seller/wallet"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
        >
          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400 hidden sm:inline">Available:</span>
          <span className="text-emerald-400 font-bold">
            ৳{metrics?.availableBalance ? metrics.availableBalance.toLocaleString() : 0}
          </span>
        </Link>
      </div>
    </header>
  );
}
