import { cacheLife, cacheTag } from "next/cache";
import type { IPaginationMeta } from "@/types";
import type { VendorQuery } from "./query";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(
  /\/+$/,
  ""
);

export interface IPublicStore {
  id: string;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
  storeDescription: string | null;
  businessAddress: string | null;
  isVerified: boolean;
  createdAt: string;
  productCount: number;
  totalSold: number;
  reviewCount: number;
  rating: number;
}

/** Cached vendor directory, keyed by the query */
export async function getStores(q: VendorQuery): Promise<{ stores: IPublicStore[]; meta?: IPaginationMeta }> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 900 });
  cacheTag("stores");

  const params = new URLSearchParams({ sortBy: q.sort, limit: "60" });
  if (q.search) params.set("search", q.search);
  if (q.verified) params.set("verified", "true");

  const res = await fetch(`${API_BASE_URL}/sellers/stores?${params}`);
  if (!res.ok) throw new Error(`Failed to load stores (${res.status})`);
  const json = await res.json();
  return { stores: Array.isArray(json.data) ? json.data : [], meta: json.meta };
}

/** Cached single store profile; resolves to null when the store doesn't exist */
export async function getStore(slug: string): Promise<IPublicStore | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120, expire: 900 });
  cacheTag("stores", `store-${slug}`);

  const res = await fetch(`${API_BASE_URL}/sellers/stores/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load store (${res.status})`);
  const json = await res.json();
  return json.data ?? null;
}
