"use client";

import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Suspended
    </span>
  );
}

export function CustomerVerifiedBadge({ isVerified }: { isVerified: boolean }) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
        <ShieldCheck className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
      <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
      Unverified
    </span>
  );
}

export function CustomerRoleBadge({ role }: { role: string }) {
  switch (role) {
    case "ADMIN":
      return (
        <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
          Admin
        </span>
      );
    case "SELLER":
      return (
        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
          Vendor
        </span>
      );
    default:
      return (
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground ring-1 ring-border">
          Customer
        </span>
      );
  }
}

export function formatCustomerDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

import { formatTaka } from "@/lib/money";

export { formatTaka };
