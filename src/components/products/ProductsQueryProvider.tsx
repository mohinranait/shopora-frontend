"use client";

import React, { createContext, useCallback, useContext, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PRODUCT_QUERY, ProductQuery, productsHref } from "@/lib/products/query";

interface ProductsQueryContextValue {
  /** Optimistic query: reflects the user's latest click before the server responds */
  query: ProductQuery;
  isPending: boolean;
  /** Merge changes into the query. Any change other than `page` resets to page 1. */
  update: (changes: Partial<ProductQuery>) => void;
  reset: () => void;
}

const ProductsQueryContext = createContext<ProductsQueryContextValue | null>(null);

export function ProductsQueryProvider({
  query: serverQuery,
  basePath = "/products",
  children,
}: {
  query: ProductQuery;
  /** Route the filters live on, e.g. "/products" or "/vendors/<slug>" */
  basePath?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setOptimisticQuery] = useOptimistic(serverQuery);

  const navigate = useCallback(
    (next: ProductQuery, scrollToResults: boolean) => {
      startTransition(() => {
        setOptimisticQuery(next);
        router.push(productsHref(next, basePath), { scroll: false });
      });
      if (scrollToResults) {
        document.getElementById("products-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [router, setOptimisticQuery, basePath]
  );

  const update = useCallback(
    (changes: Partial<ProductQuery>) => {
      const isPageChange = Object.keys(changes).length === 1 && "page" in changes;
      navigate({ ...query, ...changes, page: isPageChange ? changes.page ?? 1 : 1 }, isPageChange);
    },
    [navigate, query]
  );

  const reset = useCallback(() => navigate(DEFAULT_PRODUCT_QUERY, false), [navigate]);

  return (
    <ProductsQueryContext.Provider value={{ query, isPending, update, reset }}>
      {children}
    </ProductsQueryContext.Provider>
  );
}

export function useProductsQuery() {
  const ctx = useContext(ProductsQueryContext);
  if (!ctx) throw new Error("useProductsQuery must be used inside ProductsQueryProvider");
  return ctx;
}
