"use client";

import React, { useState, useRef } from "react";
import { ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { IProductItem, IProductVariantItem } from "@/types";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductDetailsTabs } from "./ProductDetailsTabs";
import { RelatedProducts } from "./RelatedProducts";

interface ProductDetailsViewProps {
  product: IProductItem;
  relatedProducts: IProductItem[];
}

export function ProductDetailsView({
  product,
  relatedProducts,
}: ProductDetailsViewProps) {
  // Active variant state
  const [activeVariant, setActiveVariant] = useState<IProductVariantItem | null>(() => {
    if (product.variants && product.variants.length > 0) {
      // Pick default variant or first variant
      return product.variants.find((v) => v.isDefault) || product.variants[0];
    }
    return null;
  });

  // Active tab state in details tabs
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">(
    "description"
  );

  const tabsRef = useRef<HTMLDivElement | null>(null);

  const handleJumpToReviews = () => {
    setActiveTab("reviews");
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentPrice = activeVariant ? activeVariant.price : product.basePrice;
  const isOutOfStock = (activeVariant ? activeVariant.stock : product.stock) <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Top 2-Column Product Showcase (Gallery + Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery (5 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-5 max-w-lg lg:max-w-max lg:sticky top-24">
          <ProductGallery
            product={product}
            selectedVariantImage={activeVariant?.image}
          />
        </div>

        {/* Right Column: Information, Variant Options, Purchase Actions (7 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-7">
          <ProductInfo
            product={product}
            activeVariant={activeVariant}
            onVariantChange={setActiveVariant}
            onJumpToReviews={handleJumpToReviews}
          />
        </div>
      </div>

      {/* Middle Section: Tabbed Product Information (Description, Specifications, Reviews) */}
      <ProductDetailsTabs
        product={product}
        tabRef={tabsRef}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Bottom Section: Related Products */}
      <RelatedProducts
        products={relatedProducts}
        categoryName={product.category?.name}
        categorySlug={product.category?.slug}
      />

      {/* Mobile Floating Sticky Checkout Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-slate-500 font-medium">Total Price:</span>
          <div className="text-lg font-black text-brand-deep">
            ৳{currentPrice.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return;
              toast.success(`Added ${product.name} to cart!`);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-brand text-white px-4 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add</span>
          </button>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => {
              if (isOutOfStock) return;
              toast.success(`Proceeding to checkout`);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-brand-deep text-white px-4 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50"
          >
            <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
