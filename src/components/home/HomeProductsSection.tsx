"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Flame } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { mockProducts } from "@/data/mockProducts";

export function HomeProductsSection() {
  const [activeTab, setActiveTab] = useState<"all" | "hot" | "new">("all");

  const filteredProducts = mockProducts.filter((product) => {
    if (activeTab === "hot") return product.isHot;
    if (activeTab === "new") return product.isNew;
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Section Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ready to Order</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Featured Products
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
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand-deep hover:bg-sky-50/50 transition shadow-xs"
        >
          <span>Explore Complete Catalog</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
