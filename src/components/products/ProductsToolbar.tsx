"use client";

import React, { Suspense, use, useDeferredValue, useEffect, useState } from "react";
import { ArrowUpDown, Loader2, SlidersHorizontal, X } from "lucide-react";
import type { IFacetCategory, IProductFacets } from "@/lib/products/data";
import { SORT_OPTIONS, ProductSort, countActiveFilters } from "@/lib/products/query";
import { useProductsQuery } from "./ProductsQueryProvider";
import { ProductFilters, ProductFiltersSkeleton } from "./ProductFilters";

const formatTaka = (n: number) => `৳${n.toLocaleString("en-US")}`;
const prettifySlug = (slug: string) => slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function findCategoryName(nodes: IFacetCategory[], slug: string): string | undefined {
  for (const n of nodes) {
    if (n.slug === slug) return n.name;
    const found = findCategoryName(n.children, slug);
    if (found) return found;
  }
}

/* ---------------- Mobile filter drawer ---------------- */

function MobileFilters({ facetsPromise }: { facetsPromise: Promise<IProductFacets | null> }) {
  const { query, reset, isPending } = useProductsQuery();
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(query);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {active > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
            {active}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">
              <Suspense fallback={<ProductFiltersSkeleton />}>
                <ProductFilters facetsPromise={facetsPromise} />
              </Suspense>
            </div>
            <div className="flex gap-3 border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={reset}
                disabled={active === 0}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-brand-deep py-3 text-sm font-bold text-white"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Active filter chips ---------------- */

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="group inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-light py-1 pl-3 pr-2 text-xs font-semibold text-brand-deep transition hover:border-brand/50"
    >
      {label}
      <X className="h-3.5 w-3.5 text-brand/70 group-hover:text-brand-deep" />
      <span className="sr-only">Remove filter</span>
    </button>
  );
}

function ActiveFiltersInner({ facets }: { facets: IProductFacets | null }) {
  const { query, update, reset } = useProductsQuery();
  if (countActiveFilters(query) === 0) return null;

  const brandName = (slug: string) => facets?.brands.find((b) => b.slug === slug)?.name ?? prettifySlug(slug);
  const categoryName = facets ? findCategoryName(facets.categories, query.category) : undefined;

  let priceLabel = "";
  if (query.minPrice != null && query.maxPrice != null) priceLabel = `${formatTaka(query.minPrice)} – ${formatTaka(query.maxPrice)}`;
  else if (query.minPrice != null) priceLabel = `From ${formatTaka(query.minPrice)}`;
  else if (query.maxPrice != null) priceLabel = `Up to ${formatTaka(query.maxPrice)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {query.search && <Chip label={`“${query.search}”`} onRemove={() => update({ search: "" })} />}
      {query.category && (
        <Chip label={categoryName ?? prettifySlug(query.category)} onRemove={() => update({ category: "" })} />
      )}
      {query.brands.map((slug) => (
        <Chip key={slug} label={brandName(slug)} onRemove={() => update({ brands: query.brands.filter((b) => b !== slug) })} />
      ))}
      {priceLabel && <Chip label={priceLabel} onRemove={() => update({ minPrice: null, maxPrice: null })} />}
      {query.minRating != null && <Chip label={`${query.minRating}★ & up`} onRemove={() => update({ minRating: null })} />}
      {query.inStock && <Chip label="In stock" onRemove={() => update({ inStock: false })} />}
      {query.freeShipping && <Chip label="Free shipping" onRemove={() => update({ freeShipping: false })} />}
      <button type="button" onClick={reset} className="px-1 text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline">
        Clear all
      </button>
    </div>
  );
}

function ActiveFiltersResolved({ facetsPromise }: { facetsPromise: Promise<IProductFacets | null> }) {
  return <ActiveFiltersInner facets={use(useDeferredValue(facetsPromise))} />;
}

/* ---------------- Toolbar ---------------- */

export function ResultCountSkeleton() {
  return <div className="h-4 w-44 animate-pulse rounded bg-slate-200" aria-hidden />;
}

export function ProductsToolbar({
  facetsPromise,
  summary,
}: {
  facetsPromise: Promise<IProductFacets | null>;
  /** Server-rendered "Showing X–Y of Z products" line */
  summary: React.ReactNode;
}) {
  const { query, update, isPending } = useProductsQuery();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="order-last w-full min-w-0 text-sm text-slate-500 sm:order-none sm:w-auto sm:flex-1" aria-live="polite">
          {isPending ? <ResultCountSkeleton /> : summary}
        </div>
        <MobileFilters facetsPromise={facetsPromise} />
        <div className="ml-auto flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-brand" aria-label="Loading results" />}
          <label className="relative inline-flex items-center">
            <span className="sr-only">Sort products</span>
            <ArrowUpDown className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <select
              value={query.sort}
              onChange={(e) => update({ sort: e.target.value as ProductSort })}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-8 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 h-3 w-3 text-slate-400" viewBox="0 0 12 12" aria-hidden>
              <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </label>
        </div>
      </div>
      <Suspense fallback={<ActiveFiltersInner facets={null} />}>
        <ActiveFiltersResolved facetsPromise={facetsPromise} />
      </Suspense>
    </div>
  );
}
