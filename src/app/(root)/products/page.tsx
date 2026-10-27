import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCatalog, ProductCatalogSkeleton } from "@/components/products/ProductCatalog";
import { ProductQuery, parseProductQuery } from "@/lib/products/query";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { search } = parseProductQuery(await searchParams);
  return {
    title: search ? `“${search}” – Search results | Shopora` : "All Products | Shopora",
    description: "Shop authentic products from verified brands and sellers across Bangladesh.",
  };
}

function PageHeading({ query }: { query: ProductQuery }) {
  return (
    <div className="mb-6 flex flex-col gap-1 border-b border-slate-200 pb-5">
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

async function ProductsView({ searchParams }: { searchParams: SearchParams }) {
  const query = parseProductQuery(await searchParams);
  return (
    <>
      <PageHeading query={query} />
      <ProductCatalog query={query} />
    </>
  );
}

function ProductsPageSkeleton() {
  return (
    <>
      <div className="mb-6 space-y-2 border-b border-slate-200 pb-5">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <ProductCatalogSkeleton />
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
