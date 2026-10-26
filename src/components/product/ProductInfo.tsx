"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  Check,
  ShoppingBag,
  Zap,
  ShieldCheck,
  RotateCcw,
  Truck,
  Building2,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { IProductItem, IProductVariantItem } from "@/types";

interface ProductInfoProps {
  product: IProductItem;
  activeVariant: IProductVariantItem | null;
  onVariantChange: (variant: IProductVariantItem) => void;
  onJumpToReviews: () => void;
}

export function ProductInfo({
  product,
  activeVariant,
  onVariantChange,
  onJumpToReviews,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Current pricing & stock based on active variant or base product
  const currentPrice = activeVariant ? activeVariant.price : product.basePrice;
  const currentComparePrice = activeVariant
    ? activeVariant.comparePrice ?? product.comparePrice
    : product.comparePrice;
  const currentStock = activeVariant ? activeVariant.stock : product.stock;
  const currentSku = activeVariant ? activeVariant.sku : product.sku;

  const savings =
    currentComparePrice && currentComparePrice > currentPrice
      ? currentComparePrice - currentPrice
      : 0;

  const discountPercent =
    currentComparePrice && currentComparePrice > currentPrice
      ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
      : null;

  const isOutOfStock = currentStock <= 0;

  // Track currently chosen attribute values (e.g. { Color: "Jet Black", "Strap Material": "Magnetic Metal Mesh" })
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (activeVariant?.attributes) {
      return activeVariant.attributes;
    }
    // Default to first variant's attributes if available
    if (product.variants && product.variants.length > 0 && product.variants[0].attributes) {
      return product.variants[0].attributes;
    }
    return {};
  });

  // Handle attribute value click and resolve matching variant
  const handleSelectAttribute = (attrName: string, val: string) => {
    const updated = { ...selectedAttributes, [attrName]: val };
    setSelectedAttributes(updated);

    if (product.variants && product.variants.length > 0) {
      // Find variant that matches the maximum number of chosen attributes
      const matchingVariant = product.variants.find((v) => {
        if (!v.attributes) return false;
        return Object.entries(updated).every(
          ([key, value]) => v.attributes?.[key] === value
        );
      });

      if (matchingVariant) {
        onVariantChange(matchingVariant);
      }
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > currentStock) {
        toast.info(`Only ${currentStock} units available in stock`);
        return currentStock;
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      const title = activeVariant ? `${product.name} (${activeVariant.title})` : product.name;
      toast.success(`Added ${quantity}x "${title}" to your cart!`);
    }, 600);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }
    const title = activeVariant ? `${product.name} (${activeVariant.title})` : product.name;
    toast.success(`Proceeding to checkout with ${quantity}x "${title}"`);
    // Router push to checkout will connect here
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* 1. Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link href="/" className="hover:text-brand transition">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        <Link href="/products" className="hover:text-brand transition">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-brand transition font-medium"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* 2. Brand & SKU & Stock Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {product.brand && (
            <Link
              href={`/products?brand=${product.brand.slug}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              {product.brand.name}
            </Link>
          )}
          <span className="text-xs text-slate-400">SKU: {currentSku}</span>
        </div>

        {/* Stock Status Pill */}
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Out of Stock
          </span>
        ) : currentStock <= 5 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            Only {currentStock} Left - Order Fast!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            In Stock ({currentStock} available)
          </span>
        )}
      </div>

      {/* 3. Product Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
        {product.name}
      </h1>

      {/* 4. Rating & Reviews & Total Sold Summary */}
      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={onJumpToReviews}
          className="flex items-center gap-1.5 hover:text-brand transition cursor-pointer"
        >
          <div className="flex items-center text-amber-400">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>
          <span className="font-bold text-slate-900">{product.ratingAverage || 5.0}</span>
          <span className="text-slate-400 underline underline-offset-2">
            ({product.ratingCount || 0} Customer Reviews)
          </span>
        </button>

        <span className="text-slate-300">•</span>

        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span>{product.totalSold || 0} Units Sold</span>
        </span>
      </div>

      {/* 5. Pricing Box */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/30 p-4 sm:p-5 border border-slate-200/80">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black text-brand-deep tracking-tight">
            ৳{currentPrice.toLocaleString()}
          </span>

          {currentComparePrice && currentComparePrice > currentPrice && (
            <span className="text-base sm:text-lg text-slate-400 line-through">
              ৳{currentComparePrice.toLocaleString()}
            </span>
          )}

          {discountPercent && discountPercent > 0 && (
            <span className="rounded-lg bg-rose-600 px-2.5 py-0.5 text-xs font-black text-white">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {savings > 0 && (
          <p className="mt-1.5 text-xs font-semibold text-emerald-600">
            You save ৳{savings.toLocaleString()} on this order
          </p>
        )}

        <p className="mt-2 text-[11px] text-slate-500">
          Inclusive of all applicable VAT & Taxes • Cash on Delivery available across Bangladesh
        </p>
      </div>

      {/* 6. Product Attributes & Variants Selector (for Variable Products) */}
      {product.selectedAttributes && product.selectedAttributes.length > 0 && (
        <div className="space-y-4 pt-2">
          {product.selectedAttributes.map((attr) => {
            const attrName = attr.name || "Option";
            const selectedVal = selectedAttributes[attrName];
            const isColorType = attr.type === "COLOR" || attrName.toLowerCase().includes("color");

            return (
              <div key={attr.attributeId} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider">
                    {attrName}: <span className="font-semibold text-brand normal-case">{selectedVal}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {attr.values.map((valObj) => {
                    const valueStr = valObj.value;
                    const isSelected = selectedVal === valueStr;
                    const colorHex = valObj.colorCode;

                    if (isColorType && colorHex) {
                      return (
                        <button
                          key={valObj.attributeValueId ?? valueStr}
                          type="button"
                          onClick={() => handleSelectAttribute(attrName, valueStr)}
                          title={`${attrName}: ${valueStr}`}
                          className={`relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "border-brand bg-sky-50/60 ring-2 ring-brand/30 text-slate-900 shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: colorHex }}
                          />
                          <span>{valueStr}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-brand ml-0.5" />}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={valObj.attributeValueId ?? valueStr}
                        type="button"
                        onClick={() => handleSelectAttribute(attrName, valueStr)}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-brand bg-brand-deep text-white shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {valueStr}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. Quantity & Cart Action Row */}
      <div className="space-y-3 pt-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quantity Counter */}
          <div className="flex items-center justify-between sm:justify-start rounded-xl border border-slate-300 bg-white p-1 shadow-2xs">
            <button
              type="button"
              disabled={quantity <= 1 || isOutOfStock}
              onClick={() => handleQuantityChange(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-12 text-center text-sm font-extrabold text-slate-900">
              {quantity}
            </span>

            <button
              type="button"
              disabled={quantity >= currentStock || isOutOfStock}
              onClick={() => handleQuantityChange(1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={isOutOfStock || isAdding}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-brand hover:bg-brand-deep text-white"
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
          </button>

          {/* Buy Now Instant Checkout Button */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer ${
              isOutOfStock
                ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                : "bg-brand-deep hover:bg-slate-900 text-white"
            }`}
          >
            <Zap className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>

      {/* 8. Trust & Delivery Assurance Badges */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">100% Authentic</h4>
            <p className="text-[11px] text-slate-500">Direct from authorized brands</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <Truck className="h-5 w-5 text-brand shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Fast Nationwide Delivery</h4>
            <p className="text-[11px] text-slate-500">Inside Dhaka 48h, Nationwide 3-5d</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <RotateCcw className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">7 Days Easy Return</h4>
            <p className="text-[11px] text-slate-500">Hassle-free replacement policy</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <Sparkles className="h-5 w-5 text-purple-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Warranty Coverage</h4>
            <p className="text-[11px] text-slate-500">{product.warranty || "Standard 7 Days Warranty"}</p>
          </div>
        </div>
      </div>

      {/* 9. Seller / Vendor Information Card */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {product.seller ? product.seller.storeName : "Shopora Direct Official"}
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Verified Store
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {product.isPlatformOwned ? "Fulfilled & Shipped by Shopora" : "Marketplace Verified Merchant"}
            </p>
          </div>
        </div>

        {product.seller?.storeSlug && (
          <Link
            href={`/sellers/${product.seller.storeSlug}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-brand hover:text-brand transition"
          >
            Visit Store
          </Link>
        )}
      </div>
    </div>
  );
}
