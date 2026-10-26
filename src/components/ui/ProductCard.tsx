"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check, Store } from "lucide-react";
import type { IProductItem, IMockProduct } from "@/types";

export type ProductCardData = IProductItem | IMockProduct;

interface ProductCardProps {
  product: ProductCardData;
}

/**
 * Reusable Product Card Skeleton Loader
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white overflow-hidden animate-pulse">
      <div className="relative aspect-square bg-slate-100 flex items-center justify-center p-4">
        <div className="h-28 w-28 rounded-md bg-slate-200/70" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-28 bg-slate-100 rounded" />
        </div>
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-12 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-full bg-slate-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Universal Storefront Product Card
 * Supports both real backend IProductItem and IMockProduct with complete null-safety
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Safe pricing calculations
  const basePrice = product.basePrice || 0;
  const comparePrice = product.comparePrice ?? null;
  const savings =
    comparePrice && comparePrice > basePrice ? comparePrice - basePrice : 0;

  // Safe discount percentage calculation
  const discountPercent =
    "discountPercent" in product && product.discountPercent
      ? product.discountPercent
      : comparePrice && comparePrice > basePrice
      ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
      : null;

  // Safe trending / hot flag
  const isHot = Boolean(
    ("isTrending" in product && product.isTrending) ||
      ("isHot" in product && product.isHot)
  );

  // Safe image resolution
  let imageUrl = "/images/placeholder-product.png";
  if ("mainImage" in product && product.mainImage) {
    imageUrl = product.mainImage;
  } else if ("image" in product && product.image) {
    imageUrl = product.image;
  } else if (
    "images" in product &&
    Array.isArray(product.images) &&
    product.images[0]?.url
  ) {
    imageUrl = product.images[0].url;
  }

  // Safe category display name
  let categoryName = "Collection";
  if (typeof product.category === "object" && product.category?.name) {
    categoryName = product.category.name;
  } else if (typeof product.category === "string" && product.category) {
    categoryName = product.category;
  }

  // Safe seller display name
  let sellerName = "Shopora Direct";
  if (product.seller) {
    if ("storeName" in product.seller && product.seller.storeName) {
      sellerName = product.seller.storeName;
    } else if ("name" in product.seller && product.seller.name) {
      sellerName = product.seller.name;
    }
  }

  // Safe rating & review count
  const rating =
    "ratingAverage" in product
      ? product.ratingAverage || 5.0
      : product.rating ?? 5.0;

  const reviewCount =
    "ratingCount" in product
      ? product.ratingCount ?? 0
      : product.reviewCount ?? 0;

  const inStock = (product.stock ?? 0) > 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 hover:border-brand/60 hover:shadow-md">
      {/* Top Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-3 flex items-center justify-center">
        {/* Discount / Hot Badge */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
          {discountPercent && discountPercent > 0 && (
            <span className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
              -{discountPercent}%
            </span>
          )}
          {isHot && (
            <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
              HOT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-2xs transition hover:scale-110 ${
            isWishlisted ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
        </button>

        {/* Product Image */}
        <Link
          href={`/products/${product.slug}`}
          className="h-full w-full flex items-center justify-center"
        >
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-1 flex-col justify-between p-3.5">
        <div>
          {/* Category & Seller Tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 gap-2">
            <span className="font-medium uppercase tracking-wider text-slate-400 truncate">
              {categoryName}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 shrink-0">
              <Store className="h-3 w-3 text-brand" />
              <span className="max-w-[110px] truncate">{sellerName}</span>
            </span>
          </div>

          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            className="block text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand transition-colors"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Rating & Review */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
            <div className="flex items-center text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold text-slate-900">{rating}</span>
            <span className="text-slate-400">({reviewCount})</span>
            <span className="mx-1 text-slate-300">•</span>
            {inStock ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-2.5">
            <div>
              <span className="text-base font-extrabold text-brand-deep">
                ৳{basePrice.toLocaleString()}
              </span>
              {comparePrice && comparePrice > basePrice && (
                <span className="ml-2 text-xs text-slate-400 line-through">
                  ৳{comparePrice.toLocaleString()}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save ৳{savings.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={!inStock}
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-semibold transition-all shadow-2xs ${
              !inStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : isAdded
                ? "bg-emerald-600 text-white"
                : "bg-brand-deep text-white hover:bg-brand active:scale-[0.99]"
            }`}
          >
            {!inStock ? (
              "Out of Stock"
            ) : isAdded ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
