"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  X,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { CartDrawer } from "../cart/CartDrawer";

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);

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
              href="tel:09648500500"
              className="flex items-center gap-1 hover:text-white transition font-medium"
            >
              <Headphones className="h-3 w-3 text-sky-400" />
              09648-500500
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
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-deep to-brand flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand transition leading-none">
                Shopora<span className="text-brand">.</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar (DropShop Inspired) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
              }
            }}
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
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-brand-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand transition shadow-2xs"
            >
              Search
            </button>
          </form>

          {/* Right Ecommerce Actions (Wishlist, Cart, Account) */}
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

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 rounded-md border border-slate-200 px-3 py-2 text-slate-700 hover:border-brand hover:text-brand-deep hover:bg-sky-50/50 transition group"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-brand group-hover:scale-110 transition" />
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-deep text-[10px] font-bold text-white shadow-2xs">
                  2
                </span>
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[10px] uppercase font-semibold text-slate-400 leading-none">Cart</p>
                <p className="text-xs font-extrabold text-slate-900 leading-tight">৳7,798</p>
              </div>
            </button>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand shadow-xs"
              >
                <User className="h-4 w-4" />
                <span>Account</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    isAccountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isAccountOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl z-50 animate-fade-up text-sm"
                  onMouseLeave={() => setIsAccountOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Welcome to Shopora</p>
                    <p className="font-bold text-slate-900">Guest User</p>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-700 hover:bg-sky-50 hover:text-brand transition"
                    >
                      <User className="h-4 w-4 text-brand" />
                      Customer Login / Sign Up
                    </Link>
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
                    <Link
                      href="/seller/login"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-brand-deep font-semibold bg-sky-50/80 hover:bg-sky-100 transition"
                    >
                      <Store className="h-4 w-4 text-brand-deep" />
                      Seller Portal Login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-md"
            >
              <ShoppingBag className="h-5 w-5 text-brand" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-deep text-[10px] font-bold text-white">
                2
              </span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-md p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Row (DropShop Styled) */}
        <div className="border-t border-slate-200/80 bg-white/95">
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

            {/* "Be a Vendor" Button (Preserved exactly as requested) */}
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

        {/* Mobile Search Bar */}
        <div className="border-t border-slate-100 px-4 py-2.5 md:hidden bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="relative"
          >
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

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden shadow-lg animate-fade-up">
            <div className="flex flex-col gap-2">
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-800 rounded-md hover:bg-slate-100"
              >
                <LayoutGrid className="h-4 w-4 text-brand" /> All Products
              </Link>
              <Link
                href="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-800 rounded-md hover:bg-slate-100"
              >
                <FolderTree className="h-4 w-4 text-brand" /> All Categories
              </Link>
              <Link
                href="/products?sort=hot"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-800 rounded-md hover:bg-slate-100"
              >
                <Flame className="h-4 w-4 text-rose-500" /> Hot Deals
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-800 rounded-md hover:bg-slate-100"
              >
                <Heart className="h-4 w-4 text-rose-500" /> Wishlist (3)
              </Link>
              <Link
                href="/seller/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md bg-sky-50 border border-brand/30 py-2.5 text-sm font-bold text-brand-deep hover:bg-sky-100 mt-2"
              >
                <Store className="h-4 w-4" /> Be a Vendor
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
