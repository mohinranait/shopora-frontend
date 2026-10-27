import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FolderTree, RotateCcw } from "lucide-react";
import { fetchData } from "@/lib/fetchData";
import { ICategory } from "@/types";
import { CategoriesExplorer } from "@/components/categories/CategoriesExplorer";

export const metadata: Metadata = {
  title: "All Categories | Shopora",
  description:
    "Browse every department and sub-category on Shopora — electronics, fashion, home & lifestyle and more.",
};

function CategoriesSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="h-12 w-full rounded-2xl bg-slate-200 md:max-w-md" />
        <div className="flex gap-2">
          <div className="h-7 w-28 rounded-full bg-slate-100" />
          <div className="h-7 w-32 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-32 rounded-full bg-slate-100" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="grid overflow-hidden rounded-3xl border border-slate-200 md:grid-cols-[minmax(0,320px)_1fr]"
        >
          <div className="h-44 bg-slate-200 md:h-64" />
          <div className="space-y-4 p-6">
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-[68px] rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function CategoriesContent() {
  let categories: ICategory[] = [];
  let failed = false;

  try {
    const data = await fetchData<ICategory[]>("/categories/tree", {
      revalidate: 60,
      tags: ["categories"],
    });
    categories = Array.isArray(data) ? data.filter((c) => c.isActive) : [];
  } catch (error) {
    console.error("[CategoriesPage] Failed to load categories:", error);
    failed = true;
  }

  if (failed || categories.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
          <FolderTree className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-base font-bold text-slate-900">
          {failed ? "We couldn't load categories right now" : "No categories yet"}
        </p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {failed
            ? "Please check your connection and try again in a moment."
            : "New departments are being added. Meanwhile, explore all products."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {failed && (
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try again
            </Link>
          )}
          <Link
            href="/products"
            className="rounded-xl bg-brand-deep px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand"
          >
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return <CategoriesExplorer categories={categories} />;
}

export default function CategoriesPage() {
  return (
    <div className="pb-16">
      {/* Page header */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-light/70 to-white">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="transition hover:text-brand">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-800">All Categories</span>
          </nav>

          <div className="mt-5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand ring-1 ring-brand/20">
              <FolderTree className="h-3.5 w-3.5" /> Shop by department
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              All Categories
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Find exactly what you need — browse every department and its sub-categories in one place.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesContent />
        </Suspense>
      </div>
    </div>
  );
}
