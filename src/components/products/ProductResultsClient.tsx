"use client";

import React from "react";
import { ChevronLeft, ChevronRight, PackageSearch, RotateCcw } from "lucide-react";
import { ProductCardSkeleton } from "@/components/ui/ProductCard";
import { PRODUCTS_PAGE_SIZE, countActiveFilters } from "@/lib/products/query";
import { useProductsQuery } from "./ProductsQueryProvider";

export function ProductGridSkeleton({ count = PRODUCTS_PAGE_SIZE }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading products">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Swaps the server-rendered results for a skeleton the instant a filter
 * changes, so the click feels immediate while the next page streams in.
 */
export function ResultsPane({ children }: { children: React.ReactNode }) {
  const { isPending } = useProductsQuery();
  return (
    <div id="products-results" className="scroll-mt-28 md:scroll-mt-40">
      {isPending ? <ProductGridSkeleton /> : children}
    </div>
  );
}

export function EmptyResults() {
  const { query, reset, update } = useProductsQuery();
  const hasFilters = countActiveFilters(query) > 0;

  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
        <PackageSearch className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-base font-bold text-slate-900">
        {query.search ? `No results for “${query.search}”` : "No products match these filters"}
      </p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Try removing a filter, widening the price range or checking your spelling.
      </p>
      {hasFilters && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {query.search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
            >
              Clear search
            </button>
          )}
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { update } = useProductsQuery();
  if (totalPages <= 1) return null;

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-8">
      <button
        type="button"
        onClick={() => update({ page: page - 1 })}
        disabled={page <= 1}
        className={`${btn} border-slate-200 text-slate-700 hover:border-slate-300`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => p !== page && update({ page: p })}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${
              p === page
                ? "border-brand-deep bg-brand-deep text-white"
                : "border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => update({ page: page + 1 })}
        disabled={page >= totalPages}
        className={`${btn} border-slate-200 text-slate-700 hover:border-slate-300`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
