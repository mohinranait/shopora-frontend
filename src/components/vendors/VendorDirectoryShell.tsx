"use client";

import React, { useEffect, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, BadgeCheck, Loader2, Search, X } from "lucide-react";
import { VENDOR_SORT_OPTIONS, VendorQuery, VendorSort, vendorsHref } from "@/lib/vendors/query";
import { VendorGridSkeleton } from "./VendorCard";

/**
 * Vendor directory controls (search, sort, verified toggle). Updates the URL in a
 * transition and swaps the grid for a skeleton instantly while the server responds.
 */
export function VendorDirectoryShell({
  query: serverQuery,
  children,
}: {
  query: VendorQuery;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setOptimisticQuery] = useOptimistic(serverQuery);
  const [term, setTerm] = useState(query.search);

  const update = (changes: Partial<VendorQuery>) => {
    const next = { ...query, ...changes };
    startTransition(() => {
      setOptimisticQuery(next);
      router.push(vendorsHref(next), { scroll: false });
    });
  };

  // Debounced live search
  useEffect(() => {
    const next = term.trim();
    if (next === query.search) return;
    const t = setTimeout(() => {
      startTransition(() => {
        const q = { ...query, search: next };
        setOptimisticQuery(q);
        router.push(vendorsHref(q), { scroll: false });
      });
    }, 350);
    return () => clearTimeout(t);
  }, [term, query, router, setOptimisticQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search stores by name or location"
            aria-label="Search stores"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm shadow-xs outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-brand" aria-label="Loading vendors" />}
          <button
            type="button"
            onClick={() => update({ verified: !query.verified })}
            aria-pressed={query.verified}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
              query.verified
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <BadgeCheck className="h-4 w-4" /> Verified only
          </button>
          <label className="relative inline-flex items-center">
            <span className="sr-only">Sort stores</span>
            <ArrowUpDown className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <select
              value={query.sort}
              onChange={(e) => update({ sort: e.target.value as VendorSort })}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-8 pr-8 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-brand"
            >
              {VENDOR_SORT_OPTIONS.map((o) => (
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

      {isPending ? <VendorGridSkeleton /> : children}
    </div>
  );
}
