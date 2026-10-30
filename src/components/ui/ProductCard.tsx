"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { IProductItem, IMockProduct } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";

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
  const { isWishlisted: checkWishlist, toggleWishlist, isToggling } = useWishlist();
  const isWishlisted = checkWishlist(product.id);
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  // Variable products need an option (size, colour…) picked on the product page
  const needsOptions = "productType" in product && product.productType === "VARIABLE";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (needsOptions) {
      router.push(`/products/${product.slug}`);
      return;
    }
    setIsAdding(true);
    const mainImg =
      ("mainImage" in product && product.mainImage) ||
      ((product as any).mainImageUseMedia?.media?.url) ||
      ("images" in product && Array.isArray((product as any).images) && (product as any).images[0]?.url) ||
      ("images" in product && Array.isArray((product as any).images) && ((product as any).images[0] as any)?.useMedia?.media?.url) ||
      ("image" in product && typeof product.image === "string" ? product.image : "") ||
      "";

    const ok = await addItem({
      productId: String(product.id),
      quantity: 1,
      name: product.name,
      product: {
        id: String(product.id),
        name: product.name,
        slug: product.slug,
        mainImage: mainImg,
        basePrice: product.basePrice,
        stock: product.stock,
        isPlatformOwned: false,
        isFreeShipping: "isFreeShipping" in product ? Boolean(product.isFreeShipping) : false,
      },
      seller:
        "seller" in product && product.seller
          ? {
              id: String((product.seller as any).id),
              storeName: (product.seller as any).storeName,
              storeSlug: (product.seller as any).storeSlug,
              storeLogo: null,
              isVerified: true,
            }
          : null,
      unitPrice: product.basePrice,
      comparePrice: product.comparePrice,
      maxAvailableStock: product.stock,
    });
    setIsAdding(false);
    if (ok) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
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
  } else if ("mainImageUseMedia" in product && (product as any).mainImageUseMedia?.media?.url) {
    imageUrl = (product as any).mainImageUseMedia.media.url;
  } else if ("image" in product && typeof (product as any).image === "string" && (product as any).image) {
    imageUrl = (product as any).image;
  } else if ("image" in product && (product as any).image?.media?.url) {
    imageUrl = (product as any).image.media.url;
  } else if (
    "images" in product &&
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const firstImg = product.images[0] as any;
    const resolvedUrl = firstImg?.url || firstImg?.useMedia?.media?.url || firstImg?.image?.media?.url;
    if (resolvedUrl) imageUrl = resolvedUrl;
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
          disabled={isToggling}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await toggleWishlist(product.id, product.name);
          }}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110 active:scale-95 cursor-pointer ${
            isWishlisted ? "text-rose-500 shadow-rose-100" : "text-slate-400 hover:text-rose-500"
          }`}
          aria-label={isWishlisted ? "Remove from favorites" : "Add to favorites"}
          title={isWishlisted ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
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
            disabled={!inStock || isAdding}
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
            ) : isAdding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding…
              </>
            ) : needsOptions ? (
              "Choose options"
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
