"use client";

import React, { useState, useMemo } from "react";
import { Heart, Share2, ZoomIn, Check, Truck, Flame } from "lucide-react";
import { toast } from "sonner";
import { IProductItem } from "@/types";

interface ProductGalleryProps {
  product: IProductItem;
  selectedVariantImage?: string | null;
}

export function ProductGallery({ product, selectedVariantImage }: ProductGalleryProps) {
  // Aggregate all unique available images (main, secondary gallery, variants)
  const allImages = useMemo(() => {
    const list: string[] = [];

    if (product.mainImage) {
      list.push(product.mainImage);
    }

    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img.url && !list.includes(img.url)) {
          list.push(img.url);
        }
      });
    }

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.image && !list.includes(v.image)) {
          list.push(v.image);
        }
      });
    }

    if (list.length === 0) {
      list.push("/images/placeholder-product.png");
    }

    return list;
  }, [product.mainImage, product.images, product.variants]);

  // User-selected thumbnail override
  const [activeImageOverride, setActiveImageOverride] = useState<string | null>(null);
  const [prevVariantImage, setPrevVariantImage] = useState<string | null | undefined>(
    selectedVariantImage
  );

  // Synchronize during render when variant image changes (React 19 recommended pattern, no useEffect needed)
  if (prevVariantImage !== selectedVariantImage) {
    setPrevVariantImage(selectedVariantImage);
    setActiveImageOverride(null);
  }

  // Active image calculation
  const currentImage =
    activeImageOverride ||
    (selectedVariantImage && allImages.includes(selectedVariantImage)
      ? selectedVariantImage
      : allImages[0]);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isCopied, setIsCopied] = useState(false);

  // Handle Mouse Zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Handle Share Link
  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
        toast.info("Share this URL: " + window.location.href);
      }
    }
  };

  // Safe discount calculation
  const discountPercent =
    product.comparePrice && product.comparePrice > product.basePrice
      ? Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Main Showcase Image Container */}
      <div
        className="group relative aspect-square w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-6 flex items-center justify-center overflow-hidden cursor-crosshair select-none shadow-xs"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Floating Badges */}
        <div className="absolute left-3.5 top-3.5 z-20 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent && discountPercent > 0 && (
            <span className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isTrending && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
              <Flame className="h-3 w-3 fill-white" /> HOT
            </span>
          )}
          {product.isFreeShipping && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <Truck className="h-3 w-3" /> Free Shipping
            </span>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute right-3.5 top-3.5 z-20 flex flex-col gap-2">
          {/* Wishlist Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
              toast[isWishlisted ? "info" : "success"](
                isWishlisted
                  ? "Removed from wishlist"
                  : "Saved to your wishlist!"
              );
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm transition hover:scale-110 active:scale-95 cursor-pointer ${
              isWishlisted
                ? "text-rose-500 border-rose-200"
                : "text-slate-500 hover:text-rose-500"
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-label="Wishlist"
          >
            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-rose-500" : ""}`} />
          </button>

          {/* Share Product */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 backdrop-blur-xs border border-slate-200 shadow-sm transition hover:scale-110 active:scale-95 text-slate-500 hover:text-brand cursor-pointer"
            title="Share product link"
            aria-label="Share"
          >
            {isCopied ? (
              <Check className="h-4.5 w-4.5 text-emerald-600" />
            ) : (
              <Share2 className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        {/* Main Image with Zoom Simulation */}
        <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
          <img
            src={currentImage}
            alt={product.name}
            className={`h-full w-full object-contain transition-transform duration-150 ${
              isZoomed ? "scale-175" : "scale-100"
            }`}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
            loading="eager"
          />
        </div>

        {/* Hover Zoom Hint */}
        <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-white/80 backdrop-blur-xs px-2 py-1 rounded-md border border-slate-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-3 w-3" />
          <span>Hover to zoom</span>
        </div>
      </div>

      {/* Thumbnails Gallery Strip */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {allImages.map((img, index) => {
            const isActive = img === currentImage;
            return (
              <button
                key={`${img}-${index}`}
                type="button"
                onClick={() => setActiveImageOverride(img)}
                className={`relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 rounded-xl border bg-white p-1.5 transition-all cursor-pointer overflow-hidden ${
                  isActive
                    ? "border-brand ring-2 ring-brand/40 shadow-xs"
                    : "border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-400"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
