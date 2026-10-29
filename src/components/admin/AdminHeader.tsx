"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Plus,
  ExternalLink,
  ChevronDown,
  User,
  Settings,
  Shield,
  LogOut,
  Package,
  Layers,
  TicketPercent,
  CheckCircle2,
  AlertTriangle,
  Store,
  DollarSign,
  Activity,
  Sun,
  Moon,
  Truck,
  Inbox,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useAdminTheme } from "@/context/AdminThemeContext";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/redux";
import { INotification } from "@/types";
import { toast } from "sonner";

interface AdminHeaderProps {
  onMobileToggle: () => void;
}

export function AdminHeader({ onMobileToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (name?: string) => {
    if (!name) return "SA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    toast.success("Signed out successfully.");
    logout();
  };

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
      if (
        createRef.current &&
        !createRef.current.contains(event.target as Node)
      ) {
        setCreateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();
  const { data: countData } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const unreadCount = countData?.unreadCount ?? 0;

  const { data: notifData, isLoading: isNotifLoading } = useGetNotificationsQuery(
    { limit: 10 },
    { skip: !notificationOpen }
  );
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();

  const notifications = notifData?.notifications ?? [];

  const getNotificationIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "ORDER":
        return Package;
      case "ORDER_STATUS":
        return Truck;
      case "KYC":
        return Shield;
      case "LOW_STOCK":
        return AlertTriangle;
      case "PAYOUT":
        return DollarSign;
      case "PRODUCT_APPROVAL":
        return CheckCircle2;
      default:
        return Bell;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(" ", "T"));
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (isNaN(diff) || diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif.id).unwrap();
      } catch {
        // silently continue
      }
    }
    setNotificationOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <header className="admin-header sticky top-0 z-30 h-16 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMobileToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, orders, sellers, customers... (Press ⌘K)"
            className="w-full h-9 rounded-lg border border-slate-700/80 bg-slate-900/90 pl-9 pr-14 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live System Health Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">Live API</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-400">Prisma 8 Connected</span>
        </div>

        {/* Quick Create Dropdown */}
        <div className="relative" ref={createRef}>
          <Button
            size="sm"
            variant="brand"
            onClick={() => setCreateOpen(!createOpen)}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </Button>

          {createOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700/80 py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              <Link
                href="/admin/products/new"
                onClick={() => setCreateOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Package className="h-3.5 w-3.5 text-sky-400" />
                Add New Product
              </Link>
              <Link
                href="/admin/categories/new"
                onClick={() => setCreateOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                Add Category
              </Link>
              <Link
                href="/admin/settings"
                onClick={() => setCreateOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <TicketPercent className="h-3.5 w-3.5 text-amber-400" />
                Store Settings
              </Link>
              <div className="my-1 border-t border-slate-800" />
              <Link
                href="/admin/sellers"
                onClick={() => setCreateOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Store className="h-3.5 w-3.5 text-purple-400" />
                Manage Vendors
              </Link>
            </div>
          )}
        </div>

        {/* View Storefront Shortcut */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition"
          title="Open Customer Storefront in New Tab"
        >
          <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
          <span>Storefront</span>
        </Link>

        {/* Theme Toggle (Dark / Light) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition cursor-pointer flex items-center justify-center"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label="Toggle admin color theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-sky-400" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-750 text-xs z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Notifications</span>
                  {unreadCount > 0 ? (
                    <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                      {unreadCount} New
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">All caught up</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll}
                    className="text-[11px] text-sky-400 hover:underline disabled:opacity-50"
                  >
                    {isMarkingAll ? "Marking..." : "Mark all read"}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
                {isNotifLoading ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
                    <span>Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-7 w-7 text-slate-600" />
                    <span>No notifications yet</span>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const Icon = getNotificationIcon(item.type);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-3 flex items-start gap-3 hover:bg-slate-850 transition cursor-pointer ${
                          !item.isRead ? "bg-slate-850/60" : "opacity-80"
                        }`}
                      >
                        <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-slate-100 truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2 border-t border-slate-800 bg-slate-950/60 text-center flex items-center justify-center gap-3">
                <Link
                  href="/admin/notifications"
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs text-sky-400 font-semibold hover:underline"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Authenticated Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:pl-2 sm:pr-3 rounded-full sm:rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          >
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-800"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-800">
                  {getInitials(user?.name)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[10px] text-sky-400 font-medium">
                {user?.role === "ADMIN" ? "Super Admin (Full Access)" : user?.sellerProfile?.storeName || "Verified Vendor"}
              </span>
            </div>

            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-750 py-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Dynamic User Header */}
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="font-bold text-white text-sm truncate">{user?.name || "Super Admin"}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email || "admin@shopora.com"}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant="brand" className="text-[10px] px-1.5 py-0">
                    {user?.role === "ADMIN" ? "Platform Owner" : user?.role === "SELLER" ? "Merchant Partner" : "Shopper"}
                  </Badge>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Active Session
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  href="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Administrator Profile
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  Store & Commission Settings
                </Link>
                <Link
                  href="/admin/security"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Shield className="h-4 w-4 text-slate-400" />
                  Security & Audit Logs
                </Link>
                <Link
                  href="/admin/activity"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                  <Activity className="h-4 w-4 text-slate-400" />
                  Live System Activity
                </Link>
              </div>

              <div className="my-1 border-t border-slate-800" />

              <div className="px-2 py-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition font-medium text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-sky-400" />
                    )}
                    <span>Theme Mode</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </span>
                </button>
              </div>

              <div className="my-1 border-t border-slate-800" />

              <div className="px-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition font-semibold text-left"
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
