"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  User,
  ShoppingBag,
  Heart,
  CreditCard,
  LogOut,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/cart/api";
import { useGetUserWishlistQuery } from "@/redux";
import type { IOrder } from "@/types";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ProfileManageTab } from "@/components/dashboard/ProfileManageTab";
import { OrdersTab } from "@/components/dashboard/OrdersTab";
import { FavoritesTab } from "@/components/dashboard/FavoritesTab";
import { PaymentsTab } from "@/components/dashboard/PaymentsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Profile & Addresses", icon: User },
  { id: "orders", label: "Orders Hub", icon: ShoppingBag, badge: "orders" },
  { id: "favorite", label: "Favorites & Wishlist", icon: Heart, badge: "wishlist" },
  { id: "payments", label: "Payments & Billing", icon: CreditCard },
];

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Sync tab with search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tabId);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  };

  // Client-side authentication guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Load customer orders for statistics & overview
  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;
    ordersApi
      .mine({ page: 1 })
      .then(({ data }) => {
        if (!ignore) {
          setOrders(data ?? []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setOrdersLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  // Wishlist query
  const { data: wishlist = [] } = useGetUserWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) =>
      ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.orderStatus)
  ).length;
  const totalSpent = orders
    .filter((o) => o.orderStatus !== "CANCELLED")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Loading spinner while auth is hydrating
  if (isAuthLoading || (!isAuthenticated && !user)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-xs font-semibold text-slate-500">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-500"
        >
          <Link href="/" className="transition hover:text-brand">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-900">User Dashboard</span>
          {activeTab !== "overview" && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="capitalize text-brand font-semibold">
                {TABS.find((t) => t.id === activeTab)?.label || activeTab}
              </span>
            </>
          )}
        </nav>

        {/* 1. Profile Header Hero */}
        <DashboardHeader
          user={user}
          onLogout={logout}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />

        {/* 2. Key Stats Strip */}
        <DashboardStats
          totalOrders={totalOrders}
          pendingOrders={pendingOrders}
          wishlistCount={wishlist.length}
          totalSpent={totalSpent}
          setActiveTab={handleTabChange}
        />

        {/* 3. Interactive Tab Navigation Bar */}
        <div className="flex items-center justify-between border border-slate-200 bg-white px-2 sm:px-3 rounded-lg overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-1.5 py-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              let badgeCount: number | null = null;
              if (tab.badge === "orders" && totalOrders > 0) badgeCount = totalOrders;
              if (tab.badge === "wishlist" && wishlist.length > 0) badgeCount = wishlist.length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-brand-deep text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  {badgeCount !== null && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick link directly to standalone orders page */}
          <Link
            href="/orders"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep py-1.5 pr-1 shrink-0"
            title="Open standalone orders page"
          >
            <span>/orders page</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>
        </div>

        {/* 4. Tab Content Area */}
        <div className="transition-all duration-150">
          {activeTab === "overview" && (
            <OverviewTab
              user={user}
              orders={orders}
              loadingOrders={ordersLoading}
              setActiveTab={handleTabChange}
            />
          )}

          {activeTab === "profile" && <ProfileManageTab user={user} />}

          {activeTab === "orders" && <OrdersTab />}

          {activeTab === "favorite" && <FavoritesTab />}

          {activeTab === "payments" && <PaymentsTab orders={orders} />}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <CustomerDashboardContent />
    </Suspense>
  );
}
