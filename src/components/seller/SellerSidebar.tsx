"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  Settings,
  ExternalLink,
  LogOut,
  X,
  Palmtree,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetSellerDashboardStatsQuery } from "@/redux";

interface SellerSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function SellerSidebar({ isMobileOpen, onMobileClose }: SellerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: dashboardData } = useGetSellerDashboardStatsQuery();
  const profile = dashboardData?.profile;

  const handleLogout = () => {
    localStorage.removeItem("shopora_token");
    localStorage.removeItem("shopora_refresh_token");
    localStorage.removeItem("shopora_user");
    document.cookie = "shopora_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "shopora_role=; path=/; max-age=0; SameSite=Lax";
    window.dispatchEvent(new Event("storage"));
    router.replace("/login");
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/seller/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "My Products",
      href: "/seller/products",
      icon: Package,
      badge: dashboardData?.metrics?.totalProducts || null,
    },
    {
      title: "Orders & Shipping",
      href: "/seller/orders",
      icon: ShoppingBag,
      badge: dashboardData?.metrics?.pendingOrders
        ? `${dashboardData.metrics.pendingOrders} pending`
        : null,
    },
    {
      title: "Wallet & Escrow",
      href: "/seller/wallet",
      icon: Wallet,
      badge: null,
    },
    {
      title: "Store Settings",
      href: "/seller/settings",
      icon: Settings,
      badge: profile?.isHolidayMode ? "Vacation" : null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Brand & Store Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
            {profile?.storeName ? profile.storeName[0].toUpperCase() : "S"}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate leading-tight">
              {profile?.storeName || "Seller Central"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="text-[11px] text-emerald-400 font-medium">Verified Partner</span>
            </div>
          </div>
        </div>

        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Holiday Mode Alert Banner in Sidebar */}
      {profile?.isHolidayMode && (
        <div className="mx-4 mt-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <Palmtree className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="truncate">Store is in Vacation Mode</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold text-slate-400 px-3 pb-2 tracking-wider">
          Store Operations
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                isActive
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Quick Add Product Button */}
        <div className="pt-4">
          <Link
            href="/seller/products/new"
            onClick={onMobileClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </nav>

      {/* Footer / Storefront link & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {profile?.storeSlug && (
          <Link
            href={`/stores/${profile.storeSlug}`}
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span>View Public Store</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
