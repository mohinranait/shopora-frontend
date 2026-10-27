/**
 * Products page URL <-> filter state helpers.
 * Shared by server components (parsing searchParams) and client components
 * (building the next URL), so both sides always agree on the canonical URL.
 */

export const PRODUCTS_PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest arrivals" },
  { value: "popular", label: "Best selling" },
  { value: "top_rated", label: "Top rated" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
] as const;

export type ProductSort = (typeof SORT_OPTIONS)[number]["value"];

export interface ProductQuery {
  search: string;
  category: string;
  brands: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  inStock: boolean;
  freeShipping: boolean;
  sort: ProductSort;
  page: number;
}

export const DEFAULT_PRODUCT_QUERY: ProductQuery = {
  search: "",
  category: "",
  brands: [],
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStock: false,
  freeShipping: false,
  sort: "newest",
  page: 1,
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const toNumber = (v: string): number | null => {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseProductQuery(sp: RawSearchParams): ProductQuery {
  const sortRaw = first(sp.sort) || first(sp.sortBy);
  const sort = SORT_OPTIONS.some((o) => o.value === sortRaw)
    ? (sortRaw as ProductSort)
    : "newest";
  const rating = toNumber(first(sp.rating));
  const page = Math.floor(toNumber(first(sp.page)) ?? 1);

  return {
    search: first(sp.search).trim().slice(0, 100),
    category: first(sp.category).trim(),
    brands: [
      ...new Set(
        first(sp.brand)
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      ),
    ].sort(),
    minPrice: toNumber(first(sp.minPrice)),
    maxPrice: toNumber(first(sp.maxPrice)),
    minRating: rating && rating >= 1 && rating <= 5 ? Math.floor(rating) : null,
    inStock: first(sp.inStock) === "true",
    freeShipping: first(sp.freeShipping) === "true",
    sort,
    page: page >= 1 ? page : 1,
  };
}

/** Canonical URL search params (defaults omitted, stable key order). */
export function toSearchParams(q: ProductQuery, { includePage = true } = {}): URLSearchParams {
  const params = new URLSearchParams();
  if (q.search) params.set("search", q.search);
  if (q.category) params.set("category", q.category);
  if (q.brands.length) params.set("brand", [...q.brands].sort().join(","));
  if (q.minPrice != null) params.set("minPrice", String(q.minPrice));
  if (q.maxPrice != null) params.set("maxPrice", String(q.maxPrice));
  if (q.minRating != null) params.set("rating", String(q.minRating));
  if (q.inStock) params.set("inStock", "true");
  if (q.freeShipping) params.set("freeShipping", "true");
  if (q.sort !== "newest") params.set("sort", q.sort);
  if (includePage && q.page > 1) params.set("page", String(q.page));
  return params;
}

export function productsHref(q: ProductQuery): string {
  const qs = toSearchParams(q).toString();
  return qs ? `/products?${qs}` : "/products";
}

/** Query string for the backend API (its param names differ slightly). */
export function toApiQueryString(q: ProductQuery, { forFacets = false } = {}): string {
  const params = new URLSearchParams();
  if (q.search) params.set("search", q.search);
  if (q.category) params.set("category", q.category);
  if (q.brands.length) params.set("brand", q.brands.join(","));
  if (q.minPrice != null) params.set("minPrice", String(q.minPrice));
  if (q.maxPrice != null) params.set("maxPrice", String(q.maxPrice));
  if (q.minRating != null) params.set("minRating", String(q.minRating));
  if (q.inStock) params.set("inStock", "true");
  if (q.freeShipping) params.set("freeShipping", "true");
  if (!forFacets) {
    params.set("sortBy", q.sort);
    params.set("page", String(q.page));
    params.set("limit", String(PRODUCTS_PAGE_SIZE));
  }
  return params.toString();
}

export function countActiveFilters(q: ProductQuery): number {
  return (
    (q.search ? 1 : 0) +
    (q.category ? 1 : 0) +
    q.brands.length +
    (q.minPrice != null || q.maxPrice != null ? 1 : 0) +
    (q.minRating != null ? 1 : 0) +
    (q.inStock ? 1 : 0) +
    (q.freeShipping ? 1 : 0)
  );
}
