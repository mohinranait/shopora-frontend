import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchData } from "@/lib/fetchData";
import { IProductItem } from "@/types";
import { ProductDetailsView } from "@/components/product/ProductDetailsView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic Next.js App Router Metadata for Enterprise SEO & Social Graph
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await fetchData<IProductItem>(`/products/detail/${slug}`, {
      revalidate: 60,
      tags: [`product-${slug}`],
    });

    if (!product) {
      return {
        title: "Product Not Found | Shopora",
        description: "The requested product is no longer available on Shopora.",
      };
    }

    const title = product.metaTitle || `${product.name} - Buy Online in Bangladesh | Shopora`;
    const description =
      product.metaDescription ||
      product.shortDescription ||
      `Buy ${product.name} at the best price in Bangladesh. 100% authentic product with official warranty, verified seller rating, and fast home delivery.`;

    const imageUrl = product.mainImage || "/images/placeholder-product.png";

    return {
      title,
      description,
      keywords: product.metaKeywords
        ? product.metaKeywords.split(",").map((k) => k.trim())
        : [product.name, product.category?.name || "eCommerce", "Shopora Bangladesh", "Online Shopping BD"],
      openGraph: {
        title,
        description,
        url: `/products/${slug}`,
        siteName: "Shopora Bangladesh",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/products/${slug}`,
      },
    };
  } catch {
    return {
      title: "Product Details | Shopora",
      description: "Discover genuine products with warranty on Shopora.",
    };
  }
}

/**
 * Server Component: Product Details Page
 * Server-side data fetching with Next.js ISR, JSON-LD Schema, and instant streaming
 */
export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  let product: IProductItem | null = null;

  try {
    product = await fetchData<IProductItem>(`/products/detail/${slug}`, {
      revalidate: 60,
      tags: [`product-${slug}`],
    });
  } catch (error) {
    console.error(`[ProductDetailsPage] Product lookup failed for slug: ${slug}`, error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Fetch Related Products in same category
  let relatedProducts: IProductItem[] = [];
  try {
    const categoryQuery = product.category?.slug || undefined;
    const catProducts = await fetchData<IProductItem[]>("/products", {
      params: {
        category: categoryQuery,
        limit: 8,
      },
      revalidate: 60,
    });

    if (Array.isArray(catProducts)) {
      relatedProducts = catProducts.filter((p) => p.id !== product?.id).slice(0, 4);
    }
  } catch (err) {
    console.error("[ProductDetailsPage] Related products fetch error:", err);
  }

  // JSON-LD Structured Data Schema for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.mainImage,
    description: product.shortDescription || product.name,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "Shopora",
    },
    offers: {
      "@type": "Offer",
      url: `https://shopora.com/products/${product.slug}`,
      priceCurrency: "BDT",
      price: product.basePrice,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.seller?.storeName || "Shopora Official Store",
      },
    },
    aggregateRating:
      (product.ratingCount || 0) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.ratingAverage || 5,
            reviewCount: product.ratingCount,
          }
        : undefined,
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Interactive Product Showcase */}
      <ProductDetailsView product={product} relatedProducts={relatedProducts} />
    </>
  );
}
