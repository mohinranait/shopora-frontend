"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check, Store } from "lucide-react";
import type { IProduct } from "../../data/mockProducts";

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const savings = product.comparePrice ? product.comparePrice - product.basePrice : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white overflow-hidden transition-all duration-200 hover:border-brand/60 hover:shadow-md">
      {/* Top Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 p-3 flex items-center justify-center">
        {/* Discount / Hot Badge */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
          {product.discountPercent && (
            <span className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
              -{product.discountPercent}%
            </span>
          )}
          {product.isHot && (
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
        <Link href={`/products/${product.slug}`} className="h-full w-full flex items-center justify-center">
          <img
            src={product.image}
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
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-medium uppercase tracking-wider text-slate-400">
              {product.category}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
              <Store className="h-3 w-3 text-brand" />
              {product.seller.name}
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
            <span className="font-bold text-slate-900">{product.rating}</span>
            <span className="text-slate-400">({product.reviewCount})</span>
            <span className="mx-1 text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> In Stock
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-2.5">
            <div>
              <span className="text-base font-extrabold text-brand-deep">
                ৳{product.basePrice.toLocaleString()}
              </span>
              {product.comparePrice && (
                <span className="ml-2 text-xs text-slate-400 line-through">
                  ৳{product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Save ৳{savings}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-1.5 rounded-md py-2 px-3 text-xs font-semibold transition-all shadow-2xs ${
              isAdded
                ? "bg-green-600 text-white"
                : "bg-brand-deep text-white hover:bg-brand"
            }`}
          >
            {isAdded ? (
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
