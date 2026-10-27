"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Layers, PackageSearch, Search, X } from "lucide-react";
import { ICategory } from "@/types";
import { CATEGORY_ACCENTS, CategoryIcon } from "./categoryIcons";

const categoryHref = (cat: ICategory) =>
  `/products?category=${encodeURIComponent(cat.slug || String(cat.id))}`;

const getImage = (cat: ICategory) => cat.useMedia?.media?.url || cat.image || null;

const countDescendants = (cat: ICategory): number =>
  (cat.children ?? []).reduce((sum, child) => sum + 1 + countDescendants(child), 0);

/**
 * Returns a pruned copy of the tree that only keeps categories matching the
 * query (or whose descendants match). A matching parent keeps all its children.
 */
function filterTree(nodes: ICategory[], query: string): ICategory[] {
  if (!query) return nodes;
  return nodes.reduce<ICategory[]>((acc, node) => {
    const selfMatch =
      node.name.toLowerCase().includes(query) ||
      (node.description ?? "").toLowerCase().includes(query);
    if (selfMatch) {
      acc.push(node);
      return acc;
    }
    const children = filterTree(node.children ?? [], query);
    if (children.length > 0) acc.push({ ...node, children });
    return acc;
  }, []);
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-100 px-0.5 text-inherit">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function CategoriesExplorer({ categories }: { categories: ICategory[] }) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const visible = useMemo(() => filterTree(categories, query), [categories, query]);

  const totalSub = useMemo(
    () => categories.reduce((sum, c) => sum + countDescendants(c), 0),
    [categories]
  );

  return (
    <div className="space-y-8">
      {/* Search + stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories, e.g. “headphones”"
            aria-label="Search categories"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1.5">
            <strong className="text-slate-900">{categories.length}</strong> Departments
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5">
            <strong className="text-slate-900">{totalSub}</strong> Sub-categories
          </span>
        </div>
      </div>

      {/* Quick jump navigation */}
      {visible.length > 1 && (
        <nav
          aria-label="Jump to department"
          className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        >
          <ul className="flex w-max items-center gap-2">
            {visible.map((cat) => {
              return (
                <li key={cat.id}>
                  <a
                    href={`#category-${cat.slug}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand hover:bg-brand-light hover:text-brand-deep"
                  >
                    <CategoryIcon icon={cat.icon} className="h-3.5 w-3.5" />
                    {cat.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Results */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200">
            <PackageSearch className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-base font-bold text-slate-900">No categories match “{search.trim()}”</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try a shorter or different keyword, or browse every product instead.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Clear search
            </button>
            <Link
              href="/products"
              className="rounded-xl bg-brand-deep px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand"
            >
              Browse all products
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {visible.map((cat) => (
            <DepartmentCard
              key={cat.id}
              category={cat}
              accentIndex={categories.findIndex((c) => c.id === cat.id)}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentCard({
  category,
  accentIndex,
  query,
}: {
  category: ICategory;
  accentIndex: number;
  query: string;
}) {
  const accent = CATEGORY_ACCENTS[Math.max(accentIndex, 0) % CATEGORY_ACCENTS.length];
  const image = getImage(category);
  const children = category.children ?? [];

  return (
    <section
      id={`category-${category.slug}`}
      className="scroll-mt-24 md:scroll-mt-36 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
    >
      <div className="grid md:grid-cols-[minmax(0,320px)_1fr]">
        {/* Cover */}
        <Link
          href={categoryHref(category)}
          className="group relative flex min-h-[180px] flex-col justify-end overflow-hidden p-6 md:min-h-[260px]"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={category.useMedia?.alt || category.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient}`}>
              <CategoryIcon icon={category.icon} className="absolute -right-6 -top-6 h-40 w-40 text-white/10" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

          <div className="relative space-y-2 text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <CategoryIcon icon={category.icon} className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold leading-tight tracking-tight">
              <Highlight text={category.name} query={query} />
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/85 transition group-hover:gap-2 group-hover:text-white">
              Shop all <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* Details */}
        <div className="flex flex-col p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-600">
                {category.description ? (
                  <Highlight text={category.description} query={query} />
                ) : (
                  `Explore our ${category.name.toLowerCase()} collection`
                )}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${accent.soft}`}>
              {children.length} {children.length === 1 ? "sub-category" : "sub-categories"}
            </span>
          </div>

          {children.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {children.map((child) => (
                <SubCategoryTile key={child.id} category={child} accentSoft={accent.soft} query={query} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
              <Layers className="mb-2 h-5 w-5 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">Sub-categories coming soon</p>
              <Link
                href={categoryHref(category)}
                className="mt-2 text-xs font-bold text-brand hover:text-brand-deep"
              >
                Browse {category.name} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SubCategoryTile({
  category,
  accentSoft,
  query,
}: {
  category: ICategory;
  accentSoft: string;
  query: string;
}) {
  const image = getImage(category);
  const grandChildren = category.children ?? [];

  return (
    <li className="rounded-2xl border border-slate-200 bg-white transition hover:border-brand/50 hover:shadow-sm">
      <Link href={categoryHref(category)} className="group flex items-center gap-3 p-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ${accentSoft}`}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={category.useMedia?.alt || category.name} className="h-full w-full object-cover" />
          ) : (
            <CategoryIcon icon={category.icon} className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-brand-deep">
            <Highlight text={category.name} query={query} />
          </span>
          <span className="block truncate text-xs text-slate-500">
            {category.description || "Browse products"}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand" />
      </Link>

      {grandChildren.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-3 py-2.5">
          {grandChildren.map((gc) => (
            <Link
              key={gc.id}
              href={categoryHref(gc)}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-brand-light hover:text-brand-deep"
            >
              <Highlight text={gc.name} query={query} />
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}
