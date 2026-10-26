import React from "react";
import { fetchData } from "@/lib/fetchData";
import { IProductItem } from "@/types";
import {
  HomeProductsSectionClient,
  HomeProductsSectionSkeleton,
} from "./HomeProductsSectionClient";

export { HomeProductsSectionSkeleton };

/**
 * Server-Side Dynamic Home Products Showcase Section
 * Fetches approved & published products with Next.js ISR (60s revalidation)
 * and streams hydrated data to the interactive client component.
 */
export async function HomeProductsSection() {
  let products: IProductItem[] = [];

  try {
    const data = await fetchData<IProductItem[]>("/products", {
      params: { limit: 20 },
      revalidate: 60, // Next.js ISR: Cache and revalidate every 60 seconds
      tags: ["products"],
    });

    products = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[HomeProductsSection] Failed to fetch server-side products:", error);
    products = [];
  }

  return <HomeProductsSectionClient initialProducts={products} />;
}
