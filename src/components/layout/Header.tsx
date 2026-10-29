"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Store,
  LayoutGrid,
  FolderTree,
  Flame,
  Sparkles,
  TrendingUp,
  Headphones,
  Menu,
  ChevronDown,
  ShieldCheck,
  Truck,
  LogOut,
  LayoutDashboard,
  Bell,
  Package,
  CheckCircle2,
  Loader2,
  Inbox,
} from "lucide-react";
import { CartDrawer } from "../cart/CartDrawer";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  useGetWebsiteSettingsQuery,
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/redux";
import { useIsClient } from "@/hooks/useIsClient";
import { INotification } from "@/types";
import { toast } from "sonner";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, subtotal, isDrawerOpen, openDrawer, closeDrawer } = useCart();
  const isClient = useIsClient();
  const { data: settings } = useGetWebsiteSettingsQuery(undefined, { skip: !isClient });
  const cartBadge = totalItems > 99 ? "99+" : String(totalItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const { data: countData } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !isClient || !isAuthenticated,
    pollingInterval: 30000,
  });
  const unreadCount = countData?.unreadCount ?? 0;
  const { data: notifData, isLoading: isNotifLoading } = useGetNotificationsQuery(
    { limit: 6 },
    { skip: !isNotifOpen || !isAuthenticated }
  );
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();
  const notifications = notifData?.notifications ?? [];

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.isRead) {
      try {
        await markAsRead(notif.id).unwrap();
      } catch {
        // silently continue
      }
    }
    setIsNotifOpen(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top Notification / Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Truck className="h-3.5 w-3.5" />
              <span>Fast Nationwide 48-Hour Delivery</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
              100% Genuine Certified Sellers
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/track-order" className="hover:text-white transition">
              Track Order
            </Link>
            <span className="text-slate-700">|</span>
            <a
              href={`tel:${settings?.contact_phone || "09648500500"}`}
              className="flex items-center gap-1 hover:text-white transition font-medium"
            >
              <Headphones className="h-3 w-3 text-sky-400" />
              <span suppressHydrationWarning>{settings?.contact_phone || "09648-500500"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky/Fixed Header with Backdrop Blur */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b border-slate-200/90 ${
          isScrolled
            ? "bg-white/85 backdrop-blur-md shadow-xs py-0"
            : "bg-white/95 backdrop-blur-sm"
        }`}
      >
        {/* Upper Main Nav Row */}
        <div className="max-w-7xl mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            {settings?.site_logo && settings.site_logo !== "/logo.png" ? (
              <img
                src={settings.site_logo}
                alt={settings?.site_name || "Shopora"}
                className="h-9 max-w-[140px] object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-deep to-brand flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand transition leading-none">
                {settings?.site_name || "Shopora"}<span className="text-brand">.</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                {settings?.site_tagline || "Marketplace"}
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop only) */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative mx-auto hidden md:block w-full max-w-xl"
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and categories…"
              className="w-full rounded-md border border-brand/50 bg-slate-50/80 py-2.5 pl-10 pr-24 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-brand-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand transition shadow-2xs cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Right Ecommerce Actions (Wishlist, Cart, Account - Desktop only) */}
          <div className="ml-auto hidden md:flex items-center gap-3 shrink-0">
            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center h-10 w-10 rounded-md border border-slate-200 text-slate-600 hover:text-brand hover:border-brand hover:bg-sky-50/50 transition group"
              title="Wishlist"
            >
              <Heart className="h-5 w-5 transition group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-2xs">
                3
              </span>
            </Link>

            {/* Notification Bell Button (Customer/User) */}
            {isClient && isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsAccountOpen(false);
                  }}
                  className="relative flex items-center justify-center h-10 w-10 rounded-md border border-slate-200 text-slate-600 hover:text-brand hover:border-brand hover:bg-sky-50/50 transition cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1 shadow-2xs">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setIsNotifOpen(false)}
                  >
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          disabled={isMarkingAll}
                          className="text-[11px] font-medium text-brand hover:underline disabled:opacity-50"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {isNotifLoading ? (
                        <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
                          <Loader2 className="h-4 w-4 animate-spin text-brand" />
                          <span>Loading...</span>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                          <Inbox className="h-6 w-6 text-slate-300" />
                          <span className="text-xs">No notifications yet</span>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-2.5 rounded-xl transition cursor-pointer flex items-start gap-2.5 ${
                              !item.isRead ? "bg-sky-50/70 hover:bg-sky-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-brand-deep shrink-0 mt-0.5">
                              {item.type === "ORDER" ? (
                                <Package className="h-3.5 w-3.5" />
                              ) : item.type === "ORDER_STATUS" ? (
                                <Truck className="h-3.5 w-3.5" />
                              ) : (
                                <Bell className="h-3.5 w-3.5" />
                              )}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 text-xs truncate">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {item.message}
                              </p>
                            </div>
                            {!item.isRead && (
                              <span className="h-2 w-2 rounded-full bg-brand shrink-0 mt-1" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                      <Link
                        href="/orders"
                        onClick={() => setIsNotifOpen(false)}
                        className="text-[11px] text-brand font-semibold hover:underline"
                      >
                        View all orders & tracking →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={openDrawer}
              className="relative flex items-center gap-2.5 rounded-md border border-slate-200 px-3 py-2 text-slate-700 hover:border-brand hover:text-brand-deep hover:bg-sky-50/50 transition group cursor-pointer"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-brand group-hover:scale-110 transition" />
                {isClient && totalItems > 0 && (
                  <span suppressHydrationWarning className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep px-1 text-[10px] font-bold text-white shadow-2xs">
                    {cartBadge}
                  </span>
                )}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[10px] uppercase font-semibold text-slate-400 leading-none">Cart</p>
                <p className="text-xs font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>৳{isClient ? Math.round(subtotal).toLocaleString("en-US") : "0"}</p>
              </div>
            </button>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand shadow-xs cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate" suppressHydrationWarning>
                  {isClient && isAuthenticated && user ? user.name.split(" ")[0] : "Account"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isAccountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isAccountOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 text-sm animate-in fade-in duration-100"
                  onMouseLeave={() => setIsAccountOpen(false)}
                >
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 truncate max-w-[140px]">
                            {user.name}
                          </p>
                          <span className="rounded bg-sky-100 text-brand-deep text-[10px] font-bold px-1.5 py-0.5">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1 space-y-0.5">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-brand-deep font-bold bg-sky-50/80 hover:bg-sky-100 transition"
                        >
                          <LayoutDashboard className="h-4 w-4 text-brand-deep" />
                          My Dashboard
                        </Link>
                        {(user.role === "ADMIN" || user.role === "SELLER") && (
                          <Link
                            href="/admin"
                            onClick={() => setIsAccountOpen(false)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-brand-deep font-semibold bg-sky-50 hover:bg-sky-100 transition"
                          >
                            <LayoutDashboard className="h-4 w-4 text-brand-deep" />
                            {user.role === "ADMIN" ? "Admin Control Center" : "Seller Dashboard"}
                          </Link>
                        )}
                        <Link
                          href="/orders"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-sky-50 hover:text-brand transition"
                        >
                          <ShoppingBag className="h-4 w-4 text-brand" />
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-sky-50 hover:text-brand transition"
                        >
                          <Heart className="h-4 w-4 text-brand" />
                          My Wishlist
                        </Link>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-rose-600 hover:bg-rose-50 transition text-left font-medium cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Welcome to Shopora</p>
                        <p className="font-bold text-slate-900">Sign in to your account</p>
                      </div>
                      <div className="py-1 space-y-0.5">
                        <Link
                          href="/login"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-brand-deep font-bold bg-sky-50 hover:bg-sky-100 transition"
                        >
                          <User className="h-4 w-4 text-brand-deep" />
                          Customer Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Create New Account
                        </Link>
                        <div className="border-t border-slate-100 my-1" />
                        <Link
                          href="/seller/register"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-purple-700 hover:bg-purple-50 transition font-semibold"
                        >
                          <Store className="h-4 w-4 text-purple-600" />
                          Register as a Vendor
                        </Link>
                        <Link
                          href="/admin-login"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs transition"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                          Admin Portal Login
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Controls: Cart & Hamburger Button */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={openDrawer}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5 text-brand" />
              {isClient && totalItems > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep px-1 text-[10px] font-bold text-white">
                  {cartBadge}
                </span>
              )}
            </button>

            {/* Hamburger Icon Button to open Mobile Drawer */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Open navigation menu drawer"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Secondary Navigation Row: VISIBLE ON DESKTOP ONLY (hidden on mobile as requested) */}
        <div className="hidden md:block border-t border-slate-200/80 bg-white/95">
          <nav className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8 py-0.5">
            <Link
              href="/products"
              className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-deep"
            >
              <LayoutGrid className="h-4 w-4 text-slate-400 group-hover:text-brand transition" />
              All Products
            </Link>

            <Link
              href="/categories"
              className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-deep"
            >
              <FolderTree className="h-4 w-4 text-slate-400 group-hover:text-brand transition" />
              All Categories
            </Link>

            <Link
              href="/vendors"
              className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-deep"
            >
              <Store className="h-4 w-4 text-slate-400 group-hover:text-brand transition" />
              Vendors
            </Link>

            <Link
              href="/products?sort=hot"
              className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-deep"
            >
              <Flame className="h-4 w-4 text-rose-500 group-hover:scale-110 transition" />
              Hot Deals
              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-600">
                HOT
              </span>
            </Link>

            <Link
              href="/products?sort=new"
              className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-deep"
            >
              <Sparkles className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition" />
              New Arrivals
            </Link>

            <Link
              href="/products?sort=trending"
              className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand-deep"
            >
              <TrendingUp className="h-4 w-4 text-slate-400 group-hover:text-brand transition" />
              Trending
            </Link>

            {/* "Be a Vendor" Button */}
            <div className="ml-auto flex shrink-0 items-center py-1 pl-4">
              <Link
                href="/seller/register"
                className="group inline-flex items-center justify-center gap-1.5 rounded-md border border-brand/40 bg-gradient-to-b from-sky-50 to-white px-3.5 py-1.5 text-[13px] font-semibold text-brand-deep shadow-xs transition hover:border-brand hover:from-sky-100/80 hover:to-sky-50 hover:text-brand"
              >
                <Store className="h-4 w-4 text-brand transition group-hover:scale-110 group-hover:text-brand-deep" />
                <span>Be a Vendor</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile Search Bar (Preserved as requested: exactly in place on mobile) */}
        <div className="border-t border-slate-100 px-4 py-2.5 md:hidden bg-slate-50/50">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands…"
              className="w-full rounded-md border border-brand/50 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-brand"
            />
          </form>
        </div>
      </header>

      {/* Slide-over Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
};
