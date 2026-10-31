"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag, Sparkles, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetProductBundleQuery, useAppDispatch, addToCart, openCartDrawer } from "@/redux";
import { toast } from "sonner";

interface ProductBundleCardProps {
  productId: string;
}

export function ProductBundleCard({ productId }: ProductBundleCardProps) {
  const dispatch = useAppDispatch();
  const { data: bundleData, isLoading } = useGetProductBundleQuery(productId);

  const [selectedCompanionIds, setSelectedCompanionIds] = useState<Record<string, boolean>>({});

  if (isLoading || !bundleData || !bundleData.companionProducts || bundleData.companionProducts.length === 0) {
    return null;
  }

  const { mainProduct, companionProducts, bundleDiscountPercent } = bundleData;

  // By default all companion products are selected unless explicitly toggled off
  const isCompanionSelected = (id: string) => {
    return selectedCompanionIds[id] !== false;
  };

  const toggleCompanion = (id: string) => {
    setSelectedCompanionIds((prev) => ({
      ...prev,
      [id]: !isCompanionSelected(id),
    }));
  };

  const activeCompanions = companionProducts.filter((p) => isCompanionSelected(p.id));
  const rawSubtotal =
    mainProduct.basePrice +
    activeCompanions.reduce((acc, p) => acc + p.basePrice, 0);

  // If at least one companion is selected, apply bundle discount
  const hasBundleDiscount = activeCompanions.length > 0;
  const discountRate = hasBundleDiscount ? bundleDiscountPercent / 100 : 0;
  const bundleSavings = Math.round(rawSubtotal * discountRate);
  const finalPrice = rawSubtotal - bundleSavings;

  const handleAddBundleToCart = () => {
    // 1. Add Main Product
    dispatch(
      addToCart({
        productId: mainProduct.id,
        name: mainProduct.name,
        quantity: 1,
        unitPrice: mainProduct.basePrice,
        product: {
          id: mainProduct.id,
          name: mainProduct.name,
          slug: mainProduct.slug,
          mainImage: mainProduct.mainImage || "",
          basePrice: mainProduct.basePrice,
          stock: mainProduct.stock,
        },
      })
    );

    // 2. Add Selected Companion Products
    activeCompanions.forEach((companion) => {
      dispatch(
        addToCart({
          productId: companion.id,
          name: companion.name,
          quantity: 1,
          unitPrice: companion.basePrice,
          product: {
            id: companion.id,
            name: companion.name,
            slug: companion.slug,
            mainImage: companion.mainImage || "",
            basePrice: companion.basePrice,
            stock: companion.stock,
          },
        })
      );
    });

    toast.success(
      `Bundle added to cart! Saved ৳${bundleSavings.toLocaleString()} with ${bundleDiscountPercent}% bundle discount.`
    );
    dispatch(openCartDrawer());
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Frequently Bought Together
            </h3>
            <Badge variant="outline" className="border-indigo-500/40 bg-indigo-100/60 text-indigo-700 text-[10px] font-bold">
              Save {bundleDiscountPercent}% Off
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Buy these complementary products together and enjoy an instant 5% bundle discount.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Products Visual Chain */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Main Product Thumbnail */}
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white border-2 border-indigo-500/30 p-2 shadow-xs relative overflow-hidden flex items-center justify-center">
              {mainProduct.mainImage ? (
                <Image
                  src={mainProduct.mainImage}
                  alt={mainProduct.name}
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="text-[10px] text-slate-400">Main</div>
              )}
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-slate-900/80 text-[9px] text-white font-bold">
                Main
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-800 mt-1.5 max-w-[90px] truncate text-center">
              ৳{mainProduct.basePrice.toLocaleString()}
            </span>
          </div>

          {/* Plus Separators and Companions */}
          {companionProducts.map((companion) => {
            const isSelected = isCompanionSelected(companion.id);

            return (
              <React.Fragment key={companion.id}>
                <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                  <Plus className="h-4 w-4" />
                </div>

                <div
                  onClick={() => toggleCompanion(companion.id)}
                  className={`flex flex-col items-center cursor-pointer transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white border-2 p-2 shadow-xs relative overflow-hidden flex items-center justify-center transition-all ${
                      isSelected ? "border-brand" : "border-slate-200"
                    }`}
                  >
                    {companion.mainImage && (
                      <Image
                        src={companion.mainImage}
                        alt={companion.name}
                        fill
                        sizes="96px"
                        className="object-contain p-1"
                      />
                    )}
                    <div
                      className={`absolute top-1 right-1 h-5 w-5 rounded-md flex items-center justify-center text-[10px] ${
                        isSelected ? "bg-brand text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 mt-1.5 max-w-[90px] truncate text-center">
                    ৳{companion.basePrice.toLocaleString()}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Pricing Box & Bundle Button */}
        <div className="w-full lg:w-auto p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start justify-between gap-4 min-w-[240px]">
          <div>
            <div className="text-xs text-slate-500 font-medium">Bundle Price:</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-brand-deep">
                ৳{finalPrice.toLocaleString()}
              </span>
              {hasBundleDiscount && bundleSavings > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ৳{rawSubtotal.toLocaleString()}
                </span>
              )}
            </div>

            {hasBundleDiscount && bundleSavings > 0 && (
              <div className="text-[11px] font-bold text-emerald-600 mt-1">
                Save ৳{bundleSavings.toLocaleString()} ({bundleDiscountPercent}% off)
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleAddBundleToCart}
            variant="brand"
            size="sm"
            className="w-full sm:w-auto lg:w-full gap-2 text-xs font-bold py-2.5 h-10 shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            Add Bundle to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
