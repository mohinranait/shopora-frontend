"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Palmtree,
  Wallet,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingBag,
  DollarSign,
  Loader2,
  Inbox,
  ShieldAlert,
  ChevronDown,
  User,
  Settings,
  Store,
  ExternalLink,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useSellerTheme } from "@/context/SellerThemeContext";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useGetSellerDashboardStatsQuery,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/redux";
import { INotification } from "@/types";
import { toast } from "sonner";
import { formatTaka } from "@/lib/money";

interface SellerHeaderProps {
  onMobileToggle?: () => void;
}

export function SellerHeader({ onMobileToggle }: SellerHeaderProps = {}) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const handleMobileToggle = onMobileToggle || toggleSidebar;

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useSellerTheme();

  const { data: dashboardData } = useGetSellerDashboardStatsQuery();
  const profile = dashboardData?.profile;
  const metrics = dashboardData?.metrics;

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const unreadCount = unreadData?.unreadCount ?? 0;

  const { data: notifData, isLoading: isNotifLoading } = useGetNotificationsQuery(
    { limit: 5 },
    { skip: !notificationOpen }
  );
  const notifications = notifData?.notifications || [];

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif.id).unwrap();
      } catch {
        // Continue navigation
      }
    }
    setNotificationOpen(false);
    if (notif.link) {
      router.push(notif.link);
    } else {
      router.push("/seller/notifications");
    }
  };

  const handleSignOut = () => {
    toast.success("Signed out successfully.");
    logout();
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return ShoppingBag;
      case "PRODUCT_APPROVAL":
        return Package;
      case "PAYOUT":
        return DollarSign;
      case "SYSTEM":
        return ShieldAlert;
      default:
        return Bell;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "SP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-background/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Store Hierarchy */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleMobileToggle}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted md:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-bold text-muted-foreground uppercase tracking-wider">
            Seller Central
          </span>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-bold text-foreground truncate max-w-44 lg:max-w-xs">
            {profile?.storeName || user?.name || "My Store"}
          </span>
          {profile?.status === "APPROVED" && (
            <Badge variant="outline" className="hidden lg:inline-flex border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
              Active Partner
            </Badge>
          )}
        </div>
      </div>

      {/* Right Actions: Vacation Mode, Balance, Theme Toggle, Notification & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Vacation Mode Active Indicator */}
        {profile?.isHolidayMode && (
          <Link
            href="/seller/settings"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-semibold animate-pulse hover:bg-amber-500/25 transition-colors"
          >
            <Palmtree className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden md:inline">Vacation Mode Active</span>
            <span className="md:hidden">Vacation</span>
          </Link>
        )}

        {/* Live Available Balance Chip */}
        <Link
          href="/seller/wallet"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all"
          title="Click to view wallet & payout balance"
        >
          <Wallet className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-muted-foreground hidden sm:inline">Available:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {formatTaka(metrics?.availableBalance)}
          </span>
        </Link>

        {/* Theme Toggle Button */}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-90" />
          ) : (
            <Moon className="h-4 w-4 text-sky-600 transition-transform -rotate-12 hover:rotate-0" />
          )}
        </Button>

        {/* Seller Notification Bell & Popover */}
        <div className="relative" ref={notifRef}>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative h-9 w-9 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="View notifications and notices"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border text-card-foreground text-xs z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">Notifications & Notices</span>
                  {unreadCount > 0 ? (
                    <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                      {unreadCount} New
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-medium">All caught up</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll}
                    className="text-[11px] text-brand hover:underline disabled:opacity-50 cursor-pointer font-semibold"
                  >
                    {isMarkingAll ? "Marking..." : "Mark all read"}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {isNotifLoading ? (
                  <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-brand" />
                    <span>Loading alerts...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-7 w-7 text-muted-foreground/60" />
                    <span>No notifications or notices yet</span>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const Icon = getNotificationIcon(item.type);
                    const isSystemNotice = item.type === "SYSTEM";

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3 flex items-start gap-3 hover:bg-muted/50 transition cursor-pointer ${
 !item.isRead
 ? isSystemNotice
 ? "bg-amber-500/10 border-l-2 border-amber-500"
 : "bg-brand/10 border-l-2 border-brand"
 : "opacity-80"
 }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
 isSystemNotice
 ? "bg-amber-500/20 text-amber-500"
 : "bg-muted text-brand"
 }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`font-bold truncate ${
 isSystemNotice
 ? "text-amber-600 dark:text-amber-300"
 : "text-foreground"
 }`}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          {isSystemNotice && (
                            <span className="inline-block mt-1 text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                              Admin Notice
                            </span>
                          )}
                        </div>
                        {!item.isRead && (
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
 isSystemNotice ? "bg-amber-500" : "bg-brand"
 }`}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 border-t border-border bg-muted/30 text-center flex items-center justify-center gap-3">
                <Link
                  href="/seller/notifications"
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs text-brand font-semibold hover:underline"
                >
                  View all notifications & notices →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Logged In Seller Profile Icon & Rich Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 rounded-full sm:rounded-xl hover:bg-muted border border-border transition cursor-pointer"
            aria-label="Seller profile and account menu"
          >
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-border">
                  {getInitials(user?.name || profile?.storeName)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-tight truncate max-w-32">
                {profile?.storeName || user?.name || "Seller Partner"}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                {profile?.status === "APPROVED" ? "Verified Seller" : "Partner Store"}
              </span>
            </div>

            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-popover border border-border text-popover-foreground py-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Dynamic Seller Identity Header */}
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-brand/30"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-brand/30">
                        {getInitials(user?.name || profile?.storeName)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm truncate">
                      {profile?.storeName || user?.name || "Seller Account"}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {user?.email || "seller@shopora.com"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <Badge variant="brand" className="text-[10px] px-2 py-0">
                    Merchant Partner
                  </Badge>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    {profile?.status === "APPROVED" ? "Verified" : "Active Session"}
                  </span>
                </div>
              </div>

              {/* Live Financial Snapshot Banner */}
              <div className="px-4 py-2.5 border-b border-border bg-muted/10 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Available:</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatTaka(metrics?.availableBalance)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Escrow Hold:</span>
                  <span className="text-xs font-bold text-amber-500">
                    {formatTaka(metrics?.pendingBalance)}
                  </span>
                </div>
              </div>

              {/* Navigation Menu Links */}
              <div className="py-1">
                <Link
                  href="/seller/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-popover-foreground hover:bg-accent transition"
                >
                  <Store className="h-4 w-4 text-muted-foreground" />
                  Seller Dashboard
                </Link>
                <Link
                  href="/seller/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-popover-foreground hover:bg-accent transition"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Store Settings & Profile
                </Link>
                <Link
                  href="/seller/wallet"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-popover-foreground hover:bg-accent transition"
                >
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  Wallet & Payout History
                </Link>
                {profile?.storeSlug && (
                  <Link
                    href={`/vendors/${profile.storeSlug}`}
                    target="_blank"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-popover-foreground hover:bg-accent transition"
                  >
                    <span className="flex items-center gap-2.5">
                      <ExternalLink className="h-4 w-4 text-brand" />
                      View Public Storefront
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Link>
                )}
              </div>

              <div className="my-1 border-t border-border" />

              {/* Theme Toggle within Menu */}
              <div className="px-2 py-1">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-popover-foreground hover:bg-accent transition font-medium text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-sky-500" />
                    )}
                    <span>Theme Mode</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>
              </div>

              <div className="my-1 border-t border-border" />

              {/* Sign Out Action */}
              <div className="px-2 pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition font-semibold text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
