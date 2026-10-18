"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Store,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { ProductCard } from "../../components/ui/ProductCard";
import { mockProducts, mockCategories } from "../../data/mockProducts";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = mockProducts.filter((product) => {
    if (activeTab === "hot") return product.isHot;
    if (activeTab === "new") return product.isNew;
    return true;
  });

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section (DropShop Inspired) */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-sky-50/70 via-white to-slate-50 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white px-3.5 py-1 text-xs font-semibold text-brand-deep shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
                <span>Shopora Multi-Vendor E-Commerce Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Smartest Shopping &amp;{" "}
                <span className="text-brand-deep">Multi-Vendor Marketplace</span> in{" "}
                <span className="text-brand">Bangladesh</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Discover thousands of authentic products directly from certified local vendors
                and platform-guaranteed official stores. Enjoy 48-hour nationwide delivery and guaranteed quality.
              </p>

              {/* Trust Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> 100% Genuine Products
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Nationwide Delivery
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Easy 7-Day Return
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Verified Sellers
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-md bg-brand-deep px-6 py-3 text-sm font-bold text-white hover:bg-brand transition shadow-xs"
                >
                  Explore All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/seller/register"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand-deep transition shadow-2xs"
                >
                  <Store className="h-4 w-4 text-brand" />
                  Become a Seller
                </Link>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="text-xs font-bold text-slate-700 ml-2">Hot Deal of the Day</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    <Flame className="h-3 w-3 fill-rose-500" /> 21% OFF
                  </span>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"
                    alt="Featured Smartwatch"
                    className="h-44 w-44 rounded-xl object-contain bg-slate-50 p-2 border border-slate-100 shrink-0"
                  />
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-brand">
                      Kieslect Official
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      Kieslect Kr Pro Amoled Calling Smartwatch
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-brand-deep">৳5,499</span>
                      <span className="text-xs text-slate-400 line-through">৳6,999</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      High-precision sensors, dual straps included, 7-day battery life.
                    </p>
                    <Link
                      href="/products/kieslect-kr-pro-amoled-smartwatch"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline pt-1"
                    >
                      View Product Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-medium">Ratings</p>
                    <p className="text-xs font-bold text-slate-800">4.9 ★ (148)</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-medium">Delivery</p>
                    <p className="text-xs font-bold text-slate-800">24-48 Hours</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-400 font-medium">Warranty</p>
                    <p className="text-xs font-bold text-slate-800">1 Year Official</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Browse Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Popular Categories</h2>
            <p className="text-xs text-slate-500">Browse ready-stock products across top niches</p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
          >
            All Categories <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {mockCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}
              className="group flex flex-col items-center text-center p-4 rounded-xl border border-slate-200 bg-white hover:border-brand/60 hover:shadow-sm transition-all"
            >
              <div className="h-12 w-12 rounded-full bg-sky-50 text-brand-deep flex items-center justify-center font-bold text-sm mb-2 group-hover:scale-110 transition-transform">
                {cat.name.charAt(0)}
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand transition">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-0.5">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* MAIN PRODUCTS SECTION (Requested by User) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready to Order</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Top curated items with live stock, authentic warranties, and instant checkout
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-brand-deep text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab("hot")}
              className={`inline-flex items-center gap-1 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "hot"
                  ? "bg-brand-deep text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Flame className="h-3 w-3 text-rose-500" /> Hot Deals
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`inline-flex items-center gap-1 rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === "new"
                  ? "bg-brand-deep text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-3 w-3 text-emerald-500" /> New Arrivals
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand-deep hover:bg-sky-50/50 transition shadow-xs"
          >
            Explore Complete Catalog (10,000+ Products)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Seller Promotional Banner (DropShop Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-deep to-slate-900 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-xs">
              <Store className="h-3.5 w-3.5 text-brand" /> Vendor Opportunity
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Start Selling Your Products on Shopora Marketplace
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Open your vendor store in minutes. Reach customers nationwide, manage orders with our
              smart seller portal, and get weekly automated payouts directly to your bKash or Bank.
            </p>
            <div className="pt-2">
              <Link
                href="/seller/register"
                className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-brand-deep hover:bg-sky-50 transition shadow-xs"
              >
                Register as a Vendor Today
                <ArrowRight className="h-4 w-4 text-brand-deep" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
