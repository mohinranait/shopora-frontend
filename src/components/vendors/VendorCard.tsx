import React from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Package, Star, TrendingUp } from "lucide-react";
import type { IPublicStore } from "@/lib/vendors/data";

const BANNER_GRADIENTS = [
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-fuchsia-500 via-purple-600 to-indigo-700",
  "from-emerald-500 via-teal-600 to-cyan-700",
  "from-amber-500 via-orange-500 to-rose-600",
  "from-slate-700 via-slate-800 to-slate-950",
];

export const storeGradient = (id: number) => BANNER_GRADIENTS[id % BANNER_GRADIENTS.length];

export const storeInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export const compactNumber = (n: number) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function StoreLogo({ store, size = "md" }: { store: IPublicStore; size?: "md" | "lg" }) {
  const dims = size === "lg" ? "h-24 w-24 text-2xl rounded-3xl" : "h-16 w-16 text-lg rounded-2xl";
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden border-4 border-white bg-white shadow-md ${dims}`}
    >
      {store.storeLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={store.storeLogo} alt={`${store.storeName} logo`} className="h-full w-full object-cover" />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br font-black text-white ${storeGradient(store.id)}`}
        >
          {storeInitials(store.storeName)}
        </span>
      )}
    </span>
  );
}

export function VendorCard({ store }: { store: IPublicStore }) {
  return (
    <Link
      href={`/vendors/${store.storeSlug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
    >
      {/* Banner */}
      <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${storeGradient(store.id)}`}>
        {store.storeBanner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.storeBanner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-8 flex items-end justify-between gap-3">
          <StoreLogo store={store} />
          {store.isVerified && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>

        <h2 className="mt-3 text-base font-bold text-slate-900 transition group-hover:text-brand-deep">
          {store.storeName}
        </h2>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-500">
          {store.storeDescription || "Authentic products from a trusted Shopora vendor."}
        </p>
        {store.businessAddress && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-400">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{store.businessAddress}</span>
          </p>
        )}

        <dl className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-2.5 text-center">
          <div>
            <dt className="sr-only">Rating</dt>
            <dd className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {store.rating > 0 ? store.rating.toFixed(1) : "–"}
            </dd>
            <p className="text-[11px] text-slate-500">{compactNumber(store.reviewCount)} reviews</p>
          </div>
          <div>
            <dt className="sr-only">Products</dt>
            <dd className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              {compactNumber(store.productCount)}
            </dd>
            <p className="text-[11px] text-slate-500">products</p>
          </div>
          <div>
            <dt className="sr-only">Sold</dt>
            <dd className="flex items-center justify-center gap-1 text-sm font-bold text-slate-900">
              <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
              {compactNumber(store.totalSold)}
            </dd>
            <p className="text-[11px] text-slate-500">sold</p>
          </div>
        </dl>

        <span className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition group-hover:border-brand-deep group-hover:bg-brand-deep group-hover:text-white">
          Visit store <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function VendorCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="h-24 bg-slate-200" />
      <div className="px-5 pb-5">
        <div className="relative -mt-8 h-16 w-16 rounded-2xl border-4 border-white bg-slate-200" />
        <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
        <div className="mt-2 h-3 w-full rounded bg-slate-100" />
        <div className="mt-1.5 h-3 w-4/5 rounded bg-slate-100" />
        <div className="mt-4 h-14 rounded-2xl bg-slate-100" />
        <div className="mt-4 h-10 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export function VendorGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading vendors">
      {Array.from({ length: count }).map((_, i) => (
        <VendorCardSkeleton key={i} />
      ))}
    </div>
  );
}
