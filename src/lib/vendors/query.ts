/** Vendor directory URL <-> query helpers (shared by server and client). */

export const VENDOR_SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "products", label: "Most products" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A–Z)" },
] as const;

export type VendorSort = (typeof VENDOR_SORT_OPTIONS)[number]["value"];

export interface VendorQuery {
  search: string;
  sort: VendorSort;
  verified: boolean;
}

type RawSearchParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function parseVendorQuery(sp: RawSearchParams): VendorQuery {
  const sort = first(sp.sort);
  return {
    search: first(sp.search).trim().slice(0, 100),
    sort: VENDOR_SORT_OPTIONS.some((o) => o.value === sort) ? (sort as VendorSort) : "popular",
    verified: first(sp.verified) === "true",
  };
}

export function vendorsHref(q: VendorQuery): string {
  const params = new URLSearchParams();
  if (q.search) params.set("search", q.search);
  if (q.sort !== "popular") params.set("sort", q.sort);
  if (q.verified) params.set("verified", "true");
  const qs = params.toString();
  return qs ? `/vendors?${qs}` : "/vendors";
}
