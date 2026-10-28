"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  LogOut,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import type { IAuthUser } from "@/types";

interface DashboardHeaderProps {
  user: IAuthUser;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardHeader({
  user,
  onLogout,
  setActiveTab,
}: DashboardHeaderProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-5 text-white sm:p-6">
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* User Info Left */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-brand font-bold text-white text-lg ring-1 ring-white/10 sm:h-16 sm:w-16 sm:text-xl overflow-hidden">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <span
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-slate-900"
              title="Verified Account"
            >
              <ShieldCheck className="h-3 w-3" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl text-white">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-sky-200">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Verified Customer
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  {user.phone}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              Customer ID: #{user.id.toString().padStart(5, "0")}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons Right */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/10 border border-white/15 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-sky-300" />
            <span>Orders Tab</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand cursor-pointer"
          >
            <User className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>

          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            title="Open standalone orders page"
          >
            <span>/orders page</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 border border-rose-500/30 transition hover:bg-rose-500/30 hover:text-white cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-300" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
