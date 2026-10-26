"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Flame, PackageSearch, AlertCircle, RefreshCw } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ui/ProductCard";
import { useGetProductsQuery } from "@/redux/api/productApi";
import { IProductItem } from "@/types";

export interface HomeProductsSectionClientProps {
  initialProducts?: IProductItem[];
}

/**
 * Skeleton Loader for Home Products Section (Used by Suspense)
 */
export function HomeProductsSectionSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <div className="h-4 w-28 bg-slate-200 rounded animate-pulse mb-1.5" />
          <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-1.5" />
          <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-8 w-24 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-8 w-24 bg-slate-200 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

/**
 * Interactive Client Component for Home Products Section
 * Features live tab filtering (All, Hot Deals, New Arrivals), zero-latency client state,
 * and seamless fallback to RTK Query when initialProducts are not preloaded.
 */
export function HomeProductsSectionClient({ initialProducts = [] }: HomeProductsSectionClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "hot" | "new">("all");

  // Fallback to RTK Query if server-side data is empty
  const hasServerProducts = initialProducts && initialProducts.length > 0;
  const {
    data: clientData,
    isLoading: isClientLoading,
    isError: isClientError,
    refetch,
  } = useGetProductsQuery(
    { limit: 20 },
    {
      skip: hasServerProducts, // Skip client query when initial server data is already present
    }
  );

  // Derive consolidated products list
  const allProducts = useMemo<IProductItem[]>(() => {
    if (hasServerProducts) {
      return initialProducts;
    }
    return clientData?.products || [];
  }, [hasServerProducts, initialProducts, clientData?.products]);

  // Tab counts for user-friendly badge counters
  const counts = useMemo(() => {
    const total = allProducts.length;
    const hotCount = allProducts.filter(
      (p) => Boolean(p.isTrending) || (Boolean(p.comparePrice) && (p.comparePrice as number) > p.basePrice)
    ).length;
    const newCount = allProducts.filter(
      (p) => Boolean(p.isFeatured)
    ).length;

    return {
      all: total,
      hot: hotCount > 0 ? hotCount : total,
      new: newCount > 0 ? newCount : total,
    };
  }, [allProducts]);

  // Filtered products list for current active tab
  const filteredProducts = useMemo(() => {
    if (allProducts.length === 0) return [];

    if (activeTab === "hot") {
      const hot = allProducts.filter(
        (p) => Boolean(p.isTrending) || (Boolean(p.comparePrice) && (p.comparePrice as number) > p.basePrice)
      );
      return hot.length > 0 ? hot.slice(0, 12) : allProducts.slice(0, 12);
    }

    if (activeTab === "new") {
      const featured = allProducts.filter((p) => Boolean(p.isFeatured));
      if (featured.length > 0) return featured.slice(0, 12);

      // Fallback: sort newest to oldest
      return [...allProducts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);
    }

    return allProducts.slice(0, 12);
  }, [allProducts, activeTab]);

  const isLoading = !hasServerProducts && isClientLoading;
  const isError = !hasServerProducts && isClientError && allProducts.length === 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      {/* Section Header with Dynamic Tab Switcher */}
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

        {/* Dynamic Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
              activeTab === "all"
                ? "bg-brand-deep text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <span>All Products</span>
            {counts.all > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {counts.all}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hot")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "hot"
                ? "bg-brand-deep text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>Hot Deals</span>
            {counts.hot > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "hot" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {counts.hot}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "new"
                ? "bg-brand-deep text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>New Arrivals</span>
            {counts.new > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "new" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {counts.new}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error Fallback State */}
      {isError && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-rose-200 bg-rose-50/50">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900">Failed to load products</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            We encountered a network issue loading the latest catalog. Please try refreshing.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-deep px-4 py-2 text-xs font-bold text-white hover:bg-brand transition shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-slate-50/50">
          <PackageSearch className="h-12 w-12 text-slate-400 mb-3 stroke-[1.5]" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            No products match the selected tab right now. Explore our catalog or check back soon for fresh arrivals!
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-deep px-4 py-2 text-xs font-bold text-white hover:bg-brand transition"
          >
            <span>Browse All Products</span>
          </Link>
        </div>
      )}

      {/* Dynamic Product Cards Grid */}
      {!isLoading && !isError && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* View All CTA Button */}
      <div className="mt-10 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:border-brand hover:text-brand-deep hover:bg-sky-50/50 transition shadow-xs group"
        >
          <span>Explore Complete Catalog</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
