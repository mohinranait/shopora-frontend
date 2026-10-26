"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  LayoutGrid,
  FolderTree,
  Flame,
  Sparkles,
  TrendingUp,
  Heart,
  Store,
  User,
  LogOut,
  LayoutDashboard,
  Headphones,
  Truck,
  ShieldCheck,
  ChevronRight,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const { user, isAuthenticated, logout } = useAuth();

  // Prevent background scrolling without layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const isScrollbarGutterSupported =
        typeof window !== "undefined" &&
        window.CSS &&
        CSS.supports("scrollbar-gutter", "stable");

      document.body.style.overflow = "hidden";

      // If browser does not support scrollbar-gutter, apply exact pixel compensation
      if (!isScrollbarGutterSupported && scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "visible" : "invisible pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop with Blur */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel Sliding in from Left */}
      <div
        className={`fixed inset-y-0 left-0 z-10 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 1. Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/70">
          <Link href="/" onClick={onClose} className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-deep to-brand flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                Shopora<span className="text-brand">.</span>
              </span>
              <span className="text-[9px] tracking-wider uppercase font-semibold text-slate-400">
                Marketplace
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition cursor-pointer"
            aria-label="Close menu drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
          {/* User Account Card */}
          {isAuthenticated && user ? (
            <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-sky-50/40 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-deep text-white font-extrabold text-sm shadow-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <span className="rounded bg-sky-100 text-brand-deep text-[10px] font-bold px-2 py-0.5 shrink-0">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Quick Role Actions */}
              <div className="pt-2 border-t border-slate-200/60 space-y-1">
                {(user.role === "ADMIN" || user.role === "SELLER") && (
                  <Link
                    href="/admin/dashboard"
                    onClick={onClose}
                    className="flex items-center justify-between rounded-xl bg-white border border-brand/20 px-3.5 py-2 text-xs font-bold text-brand-deep shadow-2xs hover:bg-sky-50 transition"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-brand" />
                      {user.role === "ADMIN" ? "Admin Command Center" : "Seller Command Center"}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                )}

                <Link
                  href="/orders"
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-white transition"
                >
                  <span className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-brand" />
                    My Orders
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Welcome to Shopora</p>
                  <p className="text-[11px] text-slate-500">Sign in for authentic shopping experience</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-xl bg-brand-deep py-2 text-xs font-bold text-white hover:bg-brand transition shadow-2xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="flex items-center justify-center rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                >
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* Main Navigation Menu Section */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Explore Catalog
            </span>

            <nav className="space-y-0.5 pt-1">
              <Link
                href="/products"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <span className="flex items-center gap-3">
                  <LayoutGrid className="h-4.5 w-4.5 text-brand" />
                  <span>All Products</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/categories"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <span className="flex items-center gap-3">
                  <FolderTree className="h-4.5 w-4.5 text-purple-600" />
                  <span>All Categories</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/products?sort=hot"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <span className="flex items-center gap-3">
                  <Flame className="h-4.5 w-4.5 text-rose-500 fill-rose-500" />
                  <span>Hot Deals</span>
                </span>
                <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-600">
                  HOT
                </span>
              </Link>

              <Link
                href="/products?sort=new"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="h-4.5 w-4.5 text-emerald-500 fill-emerald-500" />
                  <span>New Arrivals</span>
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                  NEW
                </span>
              </Link>

              <Link
                href="/products?sort=trending"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
                  <span>Trending</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <span className="flex items-center gap-3">
                  <Heart className="h-4.5 w-4.5 text-rose-500" />
                  <span>My Wishlist</span>
                </span>
                <span className="rounded-full bg-rose-50 text-rose-600 px-2 py-0.5 text-xs font-bold">
                  3
                </span>
              </Link>
            </nav>
          </div>

          {/* Vendor Marketplace Opportunity Card */}
          <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-sky-50 to-indigo-50 p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-deep text-white">
                <Store className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-brand-deep">Sell on Shopora</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Open your vendor store and reach millions of verified customers across Bangladesh.
            </p>
            <Link
              href="/seller/register"
              onClick={onClose}
              className="inline-flex items-center justify-center w-full rounded-xl bg-brand-deep py-2 text-xs font-bold text-white hover:bg-brand transition shadow-2xs"
            >
              <span>Register as a Vendor</span>
            </Link>
          </div>

          {/* Quick Help & Assurance Links */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <Link
              href="/track-order"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <Truck className="h-4 w-4 text-sky-500" />
              <span>Track Your Order</span>
            </Link>

            <a
              href="tel:09648500500"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <Headphones className="h-4 w-4 text-emerald-500" />
              <span>Helpline: 09648-500500</span>
            </a>

            <div className="flex items-center gap-2 px-3 py-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              <span>100% Authentic Guarantee</span>
            </div>
          </div>
        </div>

        {/* 3. Drawer Footer */}
        {isAuthenticated && (
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-rose-200 bg-rose-50/50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
