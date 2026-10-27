import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, ChevronRight, MapPin, Package, Star, TrendingUp } from "lucide-react";
import { getStore, type IPublicStore } from "@/lib/vendors/data";
import { parseProductQuery } from "@/lib/products/query";
import { ProductCatalog, ProductCatalogSkeleton } from "@/components/products/ProductCatalog";
import { StoreLogo, compactNumber, storeGradient } from "@/components/vendors/VendorCard";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug).catch(() => null);
  if (!store) return { title: "Store not found | Shopora" };
  return {
    title: `${store.storeName} | Shopora`,
    description: store.storeDescription || `Shop products from ${store.storeName} on Shopora.`,
  };
}

function StoreHero({ store }: { store: IPublicStore }) {
  // Postgres timestamps look like "2026-10-18 13:32:28.46+00"; make them ISO-8601
  const joined = new Date(store.createdAt.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
  const joinedLabel = Number.isNaN(joined.getTime())
    ? null
    : joined.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const stats = [
    {
      icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" />,
      value: store.rating > 0 ? store.rating.toFixed(1) : "–",
      label: `${compactNumber(store.reviewCount)} reviews`,
    },
    { icon: <Package className="h-4 w-4 text-brand" />, value: compactNumber(store.productCount), label: "Products" },
    { icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, value: compactNumber(store.totalSold), label: "Items sold" },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className={`relative h-32 bg-gradient-to-br sm:h-44 ${storeGradient(store.id)}`}>
        {store.storeBanner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.storeBanner} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 pb-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative -mt-12">
            <StoreLogo store={store} size="lg" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{store.storeName}</h1>
              {store.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified seller
                </span>
              )}
            </div>
            {store.storeDescription && (
              <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{store.storeDescription}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {store.businessAddress && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {store.businessAddress}
                </span>
              )}
              {joinedLabel && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Selling since {joinedLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <dl className="grid shrink-0 grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3 text-center lg:min-w-[340px]">
          {stats.map((s) => (
            <div key={s.label} className="px-3">
              <dd className="flex items-center justify-center gap-1.5 text-lg font-extrabold text-slate-900">
                {s.icon}
                {s.value}
              </dd>
              <dt className="text-[11px] font-medium text-slate-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function StorePageSkeleton() {
  return (
    <>
      <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200">
        <div className="h-32 bg-slate-200 sm:h-44" />
        <div className="flex items-end gap-4 px-8 pb-6">
          <div className="relative -mt-12 h-24 w-24 rounded-3xl border-4 border-white bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-56 rounded bg-slate-200" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <ProductCatalogSkeleton />
      </div>
    </>
  );
}

async function StoreView({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const store = await getStore(slug);
  if (!store) notFound();

  const query = parseProductQuery(sp);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="transition hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <Link href="/vendors" className="transition hover:text-brand">
          Vendors
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="truncate font-semibold text-slate-800">{store.storeName}</span>
      </nav>

      <StoreHero store={store} />

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Products from {store.storeName}</h2>
        <ProductCatalog query={query} sellerId={store.id} basePath={`/vendors/${store.storeSlug}`} />
      </div>
    </>
  );
}

export default function VendorStorePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-16 sm:px-6 lg:px-8">
      <Suspense fallback={<StorePageSkeleton />}>
        <StoreView params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
