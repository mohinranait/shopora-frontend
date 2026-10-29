"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Package,
  Shield,
  AlertTriangle,
  DollarSign,
  Truck,
  Trash2,
  RefreshCw,
  Loader2,
  Inbox,
  ExternalLink,
  CheckCheck,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminNotificationsPage() {
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

  const handleMarkRead = async (id: number) => {
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

  const handleDelete = async (id: number) => {
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

  const getNotificationIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "ORDER":
        return <Package className="h-5 w-5 text-sky-400" />;
      case "ORDER_STATUS":
        return <Truck className="h-5 w-5 text-purple-400" />;
      case "KYC":
        return <Shield className="h-5 w-5 text-emerald-400" />;
      case "LOW_STOCK":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case "PAYOUT":
        return <DollarSign className="h-5 w-5 text-emerald-400" />;
      case "PRODUCT_APPROVAL":
        return <CheckCircle2 className="h-5 w-5 text-sky-400" />;
      default:
        return <Bell className="h-5 w-5 text-slate-400" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(" ", "T"));
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (isNaN(diff) || diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-sky-400" />
            <span>Notifications & Operational Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-vendor broadcasts, order alerts, merchant verification updates, and inventory warnings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {meta && meta.unreadCount > 0 && (
            <Button
              variant="brand"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="text-xs gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read ({meta.unreadCount})</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearRead}
            disabled={isClearing}
            className="text-xs gap-1.5 text-rose-400 hover:text-rose-300 hover:border-rose-500/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear read</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tab (All / Unread / Read) */}
        <div className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-xs">
          <button
            onClick={() => {
              setReadFilter("ALL");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              readFilter === "ALL"
                ? "bg-brand text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Updates
          </button>
          <button
            onClick={() => {
              setReadFilter("UNREAD");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              readFilter === "UNREAD"
                ? "bg-brand text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Unread</span>
            {meta && meta.unreadCount > 0 && (
              <span className="h-4 px-1.5 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {meta.unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setReadFilter("READ");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              readFilter === "READ"
                ? "bg-brand text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Read
          </button>
        </div>

        {/* Type Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { label: "All Types", value: "ALL" },
            { label: "Orders", value: "ORDER" },
            { label: "Merchant KYC", value: "KYC" },
            { label: "Low Stock", value: "LOW_STOCK" },
            { label: "Payouts", value: "PAYOUT" },
            { label: "Approvals", value: "PRODUCT_APPROVAL" },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setFilterType(cat.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                filterType === cat.value
                  ? "border-sky-500 bg-sky-500/10 text-sky-400 font-bold"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List Card */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
              <p className="text-sm font-medium">Loading notifications from server...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <Inbox className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-slate-200">No notifications found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                You are all caught up! When new orders are placed, KYC applications are submitted, or products require review, alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications.map((item: INotification) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition hover:bg-slate-900/60 ${
                    !item.isRead ? "bg-slate-900/40" : "opacity-80"
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700/80">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {item.title}
                        </h3>
                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-sky-400" title="Unread" />
                        )}
                        <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 uppercase">
                          {item.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => {
                            if (!item.isRead) markAsRead(item.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                        >
                          <span>Go to link</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}

                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          disabled={isMarking}
                          className="text-xs text-slate-400 hover:text-white transition"
                        >
                          Mark as read
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="text-xs text-slate-500 hover:text-rose-400 transition ml-auto"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page >= meta.totalPages}
                  className="text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
