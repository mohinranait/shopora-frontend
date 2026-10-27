import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Store, Users } from "lucide-react";
import { getStores } from "@/lib/vendors/data";
import { VendorQuery, parseVendorQuery } from "@/lib/vendors/query";
import { VendorCard, VendorGridSkeleton } from "@/components/vendors/VendorCard";
import { VendorDirectoryShell } from "@/components/vendors/VendorDirectoryShell";

export const metadata: Metadata = {
  title: "All Vendors & Stores | Shopora",
  description: "Discover verified vendors and official brand stores selling authentic products on Shopora.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function VendorGrid({ query }: { query: VendorQuery }) {
  let stores;
  try {
    ({ stores } = await getStores(query));
  } catch (error) {
    console.error("[VendorsPage] Failed to load stores:", error);
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/50 px-6 py-14 text-center">
        <p className="text-base font-bold text-slate-900">We couldn&apos;t load vendors right now</p>
        <p className="mt-1 text-sm text-slate-500">Please refresh the page or try again in a moment.</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
          <Store className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-base font-bold text-slate-900">
          {query.search ? `No stores match “${query.search}”` : "No stores found"}
        </p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">Try a different name or remove the verified filter.</p>
        <Link
          href="/vendors"
          className="mt-5 rounded-xl bg-brand-deep px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand"
        >
          Show all vendors
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-900">{stores.length}</span>{" "}
        {stores.length === 1 ? "store" : "stores"}
        {query.search && (
          <>
            {" "}for <span className="font-semibold text-slate-900">“{query.search}”</span>
          </>
        )}
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <VendorCard key={store.id} store={store} />
        ))}
      </div>
    </>
  );
}

async function VendorsView({ searchParams }: { searchParams: SearchParams }) {
  const query = parseVendorQuery(await searchParams);
  return (
    <VendorDirectoryShell query={query}>
      <Suspense key={JSON.stringify(query)} fallback={<VendorGridSkeleton />}>
        <VendorGrid query={query} />
      </Suspense>
    </VendorDirectoryShell>
  );
}

export default function VendorsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="pb-16">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-light/70 to-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-8 pt-6 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
              <Link href="/" className="transition hover:text-brand">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="font-semibold text-slate-800">Vendors</span>
            </nav>
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand ring-1 ring-brand/20">
              <Users className="h-3.5 w-3.5" /> Shop by store
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">All Vendors</h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Browse trusted sellers and official stores, then shop their full catalog in one place.
            </p>
          </div>
          <Link
            href="/seller/register"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-brand/30 bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep transition hover:border-brand hover:bg-brand-light md:self-auto"
          >
            <Store className="h-4 w-4" /> Become a vendor
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100 sm:max-w-md" />
              <VendorGridSkeleton />
            </div>
          }
        >
          <VendorsView searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
