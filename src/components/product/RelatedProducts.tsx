"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { IProductItem } from "@/types";

interface RelatedProductsProps {
  products: IProductItem[];
  categoryName?: string;
  categorySlug?: string;
}

export function RelatedProducts({
  products,
  categoryName,
  categorySlug,
}: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Similar Recommendations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Related Products You May Like
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Handpicked choices from {categoryName || "the same catalog category"}
          </p>
        </div>

        {categorySlug && (
          <Link
            href={`/products?category=${categorySlug}`}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-deep transition-colors"
          >
            <span>View All in {categoryName || "Category"}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Grid of Related Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
