"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Package,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  ShoppingBag,
  Trash2,
  RefreshCw,
  Loader2,
  Inbox,
  ExternalLink,
  CheckCheck,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearReadNotificationsMutation,
} from "@/redux";
import { INotification } from "@/types";
import { toast } from "sonner";

export default function SellerNotificationsPage() {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>("ALL");
  const [readFilter, setReadFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const queryParams: {
    page: number;
    limit: number;
    isRead?: boolean;
    type?: string;
  } = {
    page,
    limit,
    ...(readFilter === "UNREAD" ? { isRead: false } : readFilter === "READ" ? { isRead: true } : {}),
    ...(filterType !== "ALL" ? { type: filterType } : {}),
  };

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [markAsRead, { isLoading: isMarking }] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [clearReadNotifications, { isLoading: isClearing }] = useClearReadNotificationsMutation();

  const notifications = data?.notifications || [];
  const meta = data?.meta;

  const handleMarkRead = async (id: string | number) => {
    try {
      await markAsRead(id).unwrap();
      toast.success("Notification marked as read");
    } catch {
      toast.error("Failed to update notification");
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

  const handleDelete = async (id: string | number) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearRead = async () => {
    if (!confirm("Are you sure you want to clear all read notifications?")) return;
    try {
      await clearReadNotifications().unwrap();
      toast.success("Cleared read notifications");
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-brand-500" />
            Notifications & Admin Notices
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official platform warnings, administrative notices, order alerts, and catalog approval updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={isMarkingAll || notifications.length === 0}
            className="border-slate-800 text-xs h-9 text-slate-200 hover:text-white"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-brand-400" />
            Mark all read
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleClearRead}
            disabled={isClearing || notifications.length === 0}
            className="border-slate-800 text-xs h-9 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear read
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Status Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Type Categories */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: "ALL", label: "All Alerts" },
            { id: "SYSTEM", label: "⚠️ Admin Notices & Warnings" },
            { id: "ORDER", label: "Orders" },
            { id: "PRODUCT_APPROVAL", label: "Products" },
            { id: "PAYOUT", label: "Payouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterType(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterType === tab.id
                  ? tab.id === "SYSTEM"
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Read / Unread Filter */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          {(["ALL", "UNREAD", "READ"] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setReadFilter(r);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                readFilter === r
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r === "ALL" ? "All" : r === "UNREAD" ? "Unread" : "Read"}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List Container */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
            Loading notifications and admin notices...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <Inbox className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">No notifications found</p>
            <p className="text-slate-500 mt-1">
              {filterType === "SYSTEM"
                ? "You have received no official notices or warnings from the administration."
                : "You're completely up to date. There are no notifications to display."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {notifications.map((item: INotification) => {
              const Icon = getNotificationIcon(item.type);
              const isSystemNotice = item.type === "SYSTEM";

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4 ${
                    !item.isRead
                      ? isSystemNotice
                        ? "bg-amber-500/10 border-l-4 border-amber-500"
                        : "bg-slate-850/70 border-l-4 border-brand-500"
                      : "hover:bg-slate-850/40"
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSystemNotice
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-brand-400 border border-slate-700"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm font-bold ${
                            isSystemNotice ? "text-amber-300" : "text-white"
                          }`}
                        >
                          {item.title}
                        </h3>

                        {isSystemNotice ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider"
                          >
                            Official Admin Notice
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-slate-800 border-slate-700 text-slate-300"
                          >
                            {item.type}
                          </Badge>
                        )}

                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>{formatRelativeTime(item.createdAt)}</span>
                        {item.link && (
                          <Link
                            href={item.link}
                            className="text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Open details</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!item.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkRead(item.id)}
                        disabled={isMarking}
                        className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                        Mark read
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination if multiple pages */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} alerts)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 text-xs border-slate-800"
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="h-7 text-xs border-slate-800"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
