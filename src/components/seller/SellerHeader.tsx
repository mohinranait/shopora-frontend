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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useGetSellerDashboardStatsQuery,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/redux";
import { INotification } from "@/types";
import { toast } from "sonner";

interface SellerHeaderProps {
  onMobileToggle: () => void;
}

export function SellerHeader({ onMobileToggle }: SellerHeaderProps) {
  const router = useRouter();
  const { data: dashboardData } = useGetSellerDashboardStatsQuery();
  const profile = dashboardData?.profile;
  const metrics = dashboardData?.metrics;

  const [notificationOpen, setNotificationOpen] = useState(false);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

        {/* Seller Notification Bell & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
            aria-label="View notifications and notices"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 text-xs z-50 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Notifications & Notices</span>
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
                    className="text-[11px] text-brand-400 hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {isMarkingAll ? "Marking..." : "Mark all read"}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
                {isNotifLoading ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                    <span>Loading alerts...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-7 w-7 text-slate-600" />
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
                        className={`p-3 flex items-start gap-3 hover:bg-slate-800/80 transition cursor-pointer ${
                          !item.isRead
                            ? isSystemNotice
                              ? "bg-amber-500/10 border-l-2 border-amber-500"
                              : "bg-slate-800/50 border-l-2 border-brand-500"
                            : "opacity-80"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSystemNotice
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-slate-800 text-brand-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`font-bold truncate ${
                                isSystemNotice ? "text-amber-300" : "text-slate-100"
                              }`}
                            >
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                          {isSystemNotice && (
                            <span className="inline-block mt-1 text-[9px] font-semibold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                              Admin Notice
                            </span>
                          )}
                        </div>
                        {!item.isRead && (
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${
                              isSystemNotice ? "bg-amber-400" : "bg-brand-500"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 text-center flex items-center justify-center gap-3">
                <Link
                  href="/seller/notifications"
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs text-brand-400 font-semibold hover:underline"
                >
                  View all notifications & notices →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
