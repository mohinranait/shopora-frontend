import React from "react";
import { ProductCardSkeleton } from "@/components/ui/ProductCard";

export function ProductDetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-slate-200 rounded" />

      {/* Main Top Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Left Column */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-200" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-20 rounded-xl bg-slate-200 shrink-0" />
            ))}
          </div>
        </div>

        {/* Info Right Column */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-5">
          <div className="flex justify-between items-center">
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
            <div className="h-6 w-28 bg-slate-200 rounded-full" />
          </div>
          <div className="h-8 w-3/4 bg-slate-200 rounded" />
          <div className="h-8 w-1/2 bg-slate-200 rounded" />
          <div className="h-4 w-40 bg-slate-100 rounded" />

          {/* Pricing Box Skeleton */}
          <div className="h-28 w-full rounded-2xl bg-slate-100" />

          {/* Options Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-24 rounded-xl bg-slate-200" />
              ))}
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-3 pt-3">
            <div className="h-12 w-28 rounded-xl bg-slate-200" />
            <div className="h-12 flex-1 rounded-xl bg-slate-200" />
            <div className="h-12 flex-1 rounded-xl bg-slate-200" />
          </div>

          {/* Assurances Skeleton */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="h-64 w-full rounded-2xl bg-slate-100" />

      {/* Related Products Skeleton */}
      <div className="space-y-4 pt-4">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
