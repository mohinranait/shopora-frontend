"use client";

import React, { use, useDeferredValue, useMemo, useState } from "react";
import { Check, ChevronDown, Search, Star } from "lucide-react";
import type { IFacetCategory, IProductFacets } from "@/lib/products/data";
import { useProductsQuery } from "./ProductsQueryProvider";

const formatTaka = (n: number) => `৳${n.toLocaleString("en-US")}`;

function FilterGroup({
  title,
  children,
  defaultOpen = true,
  action,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-800"
        >
          {title}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
        {action}
      </div>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ---------------- Category ---------------- */

function containsSlug(node: IFacetCategory, slug: string): boolean {
  return node.slug === slug || node.children.some((c) => containsSlug(c, slug));
}

function CategoryNode({ node, depth }: { node: IFacetCategory; depth: number }) {
  const { query, update } = useProductsQuery();
  const selected = query.category === node.slug;
  const hasChildren = node.children.length > 0;
  const [expanded, setExpanded] = useState(() => !!query.category && containsSlug(node, query.category));

  // Expand when a descendant gets selected (e.g. from a link)
  const [seenCategory, setSeenCategory] = useState(query.category);
  if (seenCategory !== query.category) {
    setSeenCategory(query.category);
    if (query.category && !selected && containsSlug(node, query.category)) setExpanded(true);
  }

  const empty = node.count === 0 && !selected;

  return (
    <li>
      <div className="flex items-center gap-1" style={{ paddingLeft: depth * 12 }}>
        <button
          type="button"
          onClick={() => update({ category: selected ? "" : node.slug })}
          disabled={empty}
          aria-pressed={selected}
          className={`flex flex-1 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition ${
            selected
              ? "bg-brand/10 font-semibold text-brand-deep"
              : empty
              ? "cursor-not-allowed text-slate-300"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <span className="truncate">{node.name}</span>
          <span className={`shrink-0 text-[11px] tabular-nums ${selected ? "text-brand-deep" : "text-slate-400"}`}>
            {node.count}
          </span>
        </button>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "" : "-rotate-90"}`} />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <CategoryNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function CategoryFilter({ categories }: { categories: IFacetCategory[] }) {
  const { query, update } = useProductsQuery();
  const total = categories.reduce((s, c) => s + c.count, 0);
  return (
    <FilterGroup title="Category">
      <ul className="space-y-0.5">
        <li>
          <button
            type="button"
            onClick={() => update({ category: "" })}
            aria-pressed={!query.category}
            className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[13px] transition ${
              !query.category
                ? "bg-brand/10 font-semibold text-brand-deep"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            All categories
            <span className="text-[11px] tabular-nums text-slate-400">{total}</span>
          </button>
        </li>
        {categories.map((node) => (
          <CategoryNode key={node.id} node={node} depth={0} />
        ))}
      </ul>
    </FilterGroup>
  );
}

/* ---------------- Price ---------------- */

function PriceFilter({ range }: { range: { min: number; max: number } }) {
  const { query, update } = useProductsQuery();
  const [min, setMin] = useState(query.minPrice?.toString() ?? "");
  const [max, setMax] = useState(query.maxPrice?.toString() ?? "");

  // Keep inputs in sync when filters change elsewhere (chips, presets, reset)
  const priceKey = `${query.minPrice}|${query.maxPrice}`;
  const [syncedKey, setSyncedKey] = useState(priceKey);
  if (syncedKey !== priceKey) {
    setSyncedKey(priceKey);
    setMin(query.minPrice?.toString() ?? "");
    setMax(query.maxPrice?.toString() ?? "");
  }

  const presets = useMemo(() => {
    if (range.max <= 0) return [];
    const steps = [1000, 5000, 20000, 50000].filter((s) => s > range.min && s < range.max);
    const bounds: (number | null)[] = [0, ...steps, null];
    return bounds.slice(0, -1).map((lo, i) => ({ min: lo ?? 0, max: bounds[i + 1] }));
  }, [range]);

  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();
    let lo = min === "" ? null : Math.max(0, Number(min));
    let hi = max === "" ? null : Math.max(0, Number(max));
    if (lo != null && hi != null && lo > hi) [lo, hi] = [hi, lo];
    if (lo === query.minPrice && hi === query.maxPrice) return;
    update({ minPrice: lo, maxPrice: hi });
  };

  return (
    <FilterGroup title="Price">
      <form onSubmit={apply} className="flex items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Minimum price</span>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">৳</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder={String(range.min)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-2 text-xs outline-none transition focus:border-brand focus:bg-white"
          />
        </label>
        <span className="text-slate-300">–</span>
        <label className="relative flex-1">
          <span className="sr-only">Maximum price</span>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">৳</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder={String(range.max)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-2 text-xs outline-none transition focus:border-brand focus:bg-white"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand-deep px-3 py-2 text-xs font-bold text-white transition hover:bg-brand"
        >
          Go
        </button>
      </form>
      {presets.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((p) => {
            const active = query.minPrice === (p.min || null) && query.maxPrice === p.max;
            const label =
              p.max == null ? `${formatTaka(p.min)}+` : p.min === 0 ? `Under ${formatTaka(p.max)}` : `${formatTaka(p.min)} – ${formatTaka(p.max)}`;
            return (
              <button
                key={label}
                type="button"
                onClick={() => update(active ? { minPrice: null, maxPrice: null } : { minPrice: p.min || null, maxPrice: p.max })}
                aria-pressed={active}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? "border-brand bg-brand-light text-brand-deep"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </FilterGroup>
  );
}

/* ---------------- Brand ---------------- */

function BrandFilter({ brands }: { brands: IProductFacets["brands"] }) {
  const { query, update } = useProductsQuery();
  const [term, setTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 8;

  const filtered = term
    ? brands.filter((b) => b.name.toLowerCase().includes(term.toLowerCase()))
    : brands;
  const visible = showAll || term ? filtered : filtered.slice(0, LIMIT);

  const toggle = (slug: string) => {
    const next = query.brands.includes(slug)
      ? query.brands.filter((b) => b !== slug)
      : [...query.brands, slug].sort();
    update({ brands: next });
  };

  if (brands.length === 0) return null;

  return (
    <FilterGroup
      title="Brand"
      action={
        query.brands.length > 0 ? (
          <button
            type="button"
            onClick={() => update({ brands: [] })}
            className="text-[11px] font-semibold text-slate-400 hover:text-brand"
          >
            Clear
          </button>
        ) : null
      }
    >
      {brands.length > LIMIT && (
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Find a brand"
            aria-label="Find a brand"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-brand focus:bg-white"
          />
        </div>
      )}
      <ul className="space-y-0.5">
        {visible.map((b) => {
          const checked = query.brands.includes(b.slug);
          return (
            <li key={b.id}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(b.slug)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${
                    checked ? "border-brand bg-brand text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={`flex-1 truncate ${checked ? "font-semibold text-slate-900" : ""}`}>{b.name}</span>
                <span className="text-[11px] tabular-nums text-slate-400">{b.count}</span>
              </label>
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-2 py-1.5 text-xs text-slate-400">No brands found</li>}
      </ul>
      {!term && filtered.length > LIMIT && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-2 px-2 text-xs font-semibold text-brand hover:text-brand-deep"
        >
          {showAll ? "Show less" : `Show all ${filtered.length} brands`}
        </button>
      )}
    </FilterGroup>
  );
}

/* ---------------- Rating & availability ---------------- */

function RatingFilter() {
  const { query, update } = useProductsQuery();
  return (
    <FilterGroup title="Customer rating">
      <ul className="space-y-0.5">
        {[4, 3, 2].map((r) => {
          const active = query.minRating === r;
          return (
            <li key={r}>
              <button
                type="button"
                onClick={() => update({ minRating: active ? null : r })}
                aria-pressed={active}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition ${
                  active ? "bg-brand/10 font-semibold text-brand-deep" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="flex" aria-hidden>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i <= r ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                    />
                  ))}
                </span>
                <span>& up</span>
                <span className="sr-only">{r} stars and up</span>
              </button>
            </li>
          );
        })}
      </ul>
    </FilterGroup>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50">
      {label}
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${
          checked ? "bg-brand" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </label>
  );
}

function AvailabilityFilter() {
  const { query, update } = useProductsQuery();
  return (
    <FilterGroup title="Availability">
      <div className="space-y-0.5">
        <Toggle label="In stock only" checked={query.inStock} onChange={() => update({ inStock: !query.inStock })} />
        <Toggle
          label="Free shipping"
          checked={query.freeShipping}
          onChange={() => update({ freeShipping: !query.freeShipping })}
        />
      </div>
    </FilterGroup>
  );
}

/* ---------------- Panel ---------------- */

export function ProductFilters({ facetsPromise }: { facetsPromise: Promise<IProductFacets | null> }) {
  // Deferred so a new filter selection never blocks on fresh facet counts:
  // the previous counts stay visible until the new ones resolve.
  const facets = use(useDeferredValue(facetsPromise));

  return (
    <div>
      {facets && facets.categories.length > 0 && <CategoryFilter categories={facets.categories} />}
      <PriceFilter range={facets?.price ?? { min: 0, max: 0 }} />
      {facets && <BrandFilter brands={facets.brands} />}
      <RatingFilter />
      <AvailabilityFilter />
    </div>
  );
}

export function ProductFiltersSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-4">
      {[6, 2, 5, 3].map((rows, i) => (
        <div key={i} className="space-y-2.5">
          <div className="h-3 w-24 rounded bg-slate-200" />
          {Array.from({ length: rows }).map((_, j) => (
            <div key={j} className="h-6 rounded-lg bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}
