import React, { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductsQueryProvider } from "./ProductsQueryProvider";
import { ProductsToolbar, ResultCountSkeleton } from "./ProductsToolbar";
import { ProductFilters, ProductFiltersSkeleton } from "./ProductFilters";
import { EmptyResults, Pagination, ProductGridSkeleton, ResultsPane } from "./ProductResultsClient";
import { getProductFacets, getProductPage, type IProductFacets } from "@/lib/products/data";
import { ProductQuery, toApiQueryString } from "@/lib/products/query";

interface CatalogScope {
  query: ProductQuery;
  /** Restrict every request to one vendor's products */
  sellerId?: number;
}

/** Server-rendered product grid for one filter combination */
async function ProductResults({ query, sellerId }: CatalogScope) {
  let result;
  try {
    result = await getProductPage(toApiQueryString(query, { sellerId }));
  } catch (error) {
    console.error("[ProductCatalog] Failed to load products:", error);
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
async function ResultCount({ query, sellerId }: CatalogScope) {
  const { products, meta } = await getProductPage(toApiQueryString(query, { sellerId })).catch(() => ({
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

/**
 * Filterable product catalog: sidebar facets, toolbar, streamed grid and pagination.
 * Used by /products and by each vendor store page (scoped with `sellerId`).
 */
export function ProductCatalog({
  query,
  sellerId,
  basePath = "/products",
}: CatalogScope & { basePath?: string }) {
  const listKey = toApiQueryString(query, { sellerId });

  // Started here, awaited on the client — the grid never waits for facet counts
  const facetsPromise: Promise<IProductFacets | null> = getProductFacets(
    toApiQueryString(query, { forFacets: true, sellerId })
  ).catch((error) => {
    console.error("[ProductCatalog] Failed to load filters:", error);
    return null;
  });

  return (
    <ProductsQueryProvider query={query} basePath={basePath}>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr]">
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
                <ResultCount query={query} sellerId={sellerId} />
              </Suspense>
            }
          />
          <ResultsPane>
            {/* Keyed so every new filter combination streams behind a fresh skeleton */}
            <Suspense key={listKey} fallback={<ProductGridSkeleton />}>
              <ProductResults query={query} sellerId={sellerId} />
            </Suspense>
          </ResultsPane>
        </div>
      </div>
    </ProductsQueryProvider>
  );
}

export function ProductCatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr]">
      <div className="hidden rounded-2xl border border-slate-200 px-4 lg:block">
        <ProductFiltersSkeleton />
      </div>
      <div className="space-y-5">
        <div className="flex gap-2.5">
          <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
          <div className="ml-auto h-10 w-44 animate-pulse rounded-xl bg-slate-100" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
