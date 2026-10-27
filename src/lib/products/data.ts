import { cacheLife, cacheTag } from "next/cache";
import type { IPaginationMeta, IProductItem } from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(
  /\/+$/,
  ""
);

export interface IFacetCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  count: number;
  children: IFacetCategory[];
}

export interface IFacetBrand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  count: number;
}

export interface IProductFacets {
  categories: IFacetCategory[];
  brands: IFacetBrand[];
  price: { min: number; max: number };
}

export interface IProductPage {
  products: IProductItem[];
  meta: IPaginationMeta;
}

async function getJson<T>(path: string): Promise<{ data: T; meta?: IPaginationMeta }> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Cached product listing. The canonical API query string is the cache key,
 * so repeating a filter combination (back/forward, toggling) is served instantly.
 */
export async function getProductPage(apiQuery: string): Promise<IProductPage> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  cacheTag("products");

  const json = await getJson<IProductItem[]>(`/products?${apiQuery}`);
  const products = Array.isArray(json.data) ? json.data : [];
  const meta = json.meta ?? { page: 1, limit: products.length, total: products.length, totalPages: 1 };
  return {
    products,
    meta: {
      ...meta,
      hasNextPage: meta.page < meta.totalPages,
      hasPrevPage: meta.page > 1,
    },
  };
}

/** Cached filter facets (category/brand counts and price range). */
export async function getProductFacets(apiQuery: string): Promise<IProductFacets> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 900 });
  cacheTag("products", "categories", "brands");

  const json = await getJson<IProductFacets>(`/products/filters?${apiQuery}`);
  return json.data;
}
