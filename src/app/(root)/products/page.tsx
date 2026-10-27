import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductsQueryProvider } from "@/components/products/ProductsQueryProvider";
import { ProductsToolbar, ResultCountSkeleton } from "@/components/products/ProductsToolbar";
import { ProductFilters, ProductFiltersSkeleton } from "@/components/products/ProductFilters";
import {
  EmptyResults,
  Pagination,
  ProductGridSkeleton,
  ResultsPane,
} from "@/components/products/ProductResultsClient";
import { getProductFacets, getProductPage, type IProductFacets } from "@/lib/products/data";
import { ProductQuery, parseProductQuery, toApiQueryString } from "@/lib/products/query";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { search } = parseProductQuery(await searchParams);
  return {
    title: search ? `“${search}” – Search results | Shopora` : "All Products | Shopora",
    description: "Shop authentic products from verified brands and sellers across Bangladesh.",
  };
}

/** Server-rendered product grid for one filter combination */
async function ProductResults({ query }: { query: ProductQuery }) {
  let result;
  try {
    result = await getProductPage(toApiQueryString(query));
  } catch (error) {
    console.error("[ProductsPage] Failed to load products:", error);
    return (
      <div className="flex flex-col items-center rounded-3xl border border-rose-200 bg-rose-50/50 px-6 py-14 text-center">
        <AlertTriangle className="mb-3 h-7 w-7 text-rose-500" />
        <p className="text-base font-bold text-slate-900">We couldn&apos;t load products right now</p>
        <p className="mt-1 text-sm text-slate-500">Please refresh the page or try again in a moment.</p>
      </div>
    );
  }

  const { products, meta } = result;
  if (products.length === 0) return <EmptyResults />;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination page={meta.page} totalPages={meta.totalPages} />
    </>
  );
}

/** "Showing X–Y of Z products" — same cached request as the grid, so no extra API call */
async function ResultCount({ query }: { query: ProductQuery }) {
  const { products, meta } = await getProductPage(toApiQueryString(query)).catch(() => ({
    products: [],
    meta: { page: 1, limit: 0, total: 0 },
  }));
  if (products.length === 0) {
    return <span>0 products</span>;
  }

  const from = (meta.page - 1) * meta.limit + 1;
  const to = from + products.length - 1;

  return (
    <p>
      Showing <span className="font-semibold text-slate-900">{from}–{to}</span> of{" "}
      <span className="font-semibold text-slate-900">{meta.total.toLocaleString()}</span> products
      {query.search && (
        <>
          {" "}for <span className="font-semibold text-slate-900">“{query.search}”</span>
        </>
      )}
    </p>
  );
}

async function ProductsView({ searchParams }: { searchParams: SearchParams }) {
  const query = parseProductQuery(await searchParams);
  const listKey = toApiQueryString(query);

  // Started here, awaited on the client — the grid never waits for facet counts
  const facetsPromise: Promise<IProductFacets | null> = getProductFacets(
    toApiQueryString(query, { forFacets: true })
  ).catch((error) => {
    console.error("[ProductsPage] Failed to load filters:", error);
    return null;
  });

  return (
    <ProductsQueryProvider query={query}>
      <PageHeading query={query} />

      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-32 hidden max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white px-4 lg:block">
          <Suspense fallback={<ProductFiltersSkeleton />}>
            <ProductFilters facetsPromise={facetsPromise} />
          </Suspense>
        </aside>

        <div className="min-w-0 space-y-5">
          <ProductsToolbar
            facetsPromise={facetsPromise}
            summary={
              <Suspense key={listKey} fallback={<ResultCountSkeleton />}>
                <ResultCount query={query} />
              </Suspense>
            }
          />
          <ResultsPane>
            {/* Keyed so every new filter combination streams behind a fresh skeleton */}
            <Suspense key={listKey} fallback={<ProductGridSkeleton />}>
              <ProductResults query={query} />
            </Suspense>
          </ResultsPane>
        </div>
      </div>
    </ProductsQueryProvider>
  );
}

function PageHeading({ query }: { query: ProductQuery }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 pb-5">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {query.search ? (
          <>
            Results for <span className="text-brand-deep">“{query.search}”</span>
          </>
        ) : (
          "All Products"
        )}
      </h1>
      <p className="text-sm text-slate-500">
        Authentic, ready-stock products from verified brands and sellers.
      </p>
    </div>
  );
}

function ProductsPageSkeleton() {
  return (
    <>
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden rounded-2xl border border-slate-200 px-4 lg:block">
          <ProductFiltersSkeleton />
        </div>
        <div className="space-y-5">
          <div className="flex gap-2.5">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-slate-100 sm:max-w-xs" />
            <div className="ml-auto h-10 w-44 animate-pulse rounded-xl bg-slate-100" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </>
  );
}

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="transition hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-slate-800">Products</span>
      </nav>

      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsView searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
