"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Flame, ShoppingBag } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/components/ui/carousel";
import { useGetSlidersQuery } from "@/redux";
import type { ISliderItem } from "@/types";

/**
 * Safely resolve slider image URL without `any` casts
 */
function getSlideImageUrl(slide: ISliderItem): string {
  return (
    slide.image?.media?.url ||
    slide.useMedia?.media?.url ||
    slide.imageUrl ||
    ""
  );
}

/**
 * High-fidelity Skeleton Loader for the Hero Slider
 * Clean, light aesthetic matching the Shopora storefront theme without harsh dark flashes.
 */
export function HeroSliderSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 select-none">
      <div className="relative w-full h-80 sm:h-96 md:h-112 lg:h-120 rounded-lg sm:rounded-xl overflow-hidden bg-linear-to-r from-slate-100 via-sky-50/50 to-slate-100 border border-slate-200">
        {/* Animated Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* Content Placeholder */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 max-w-2xl space-y-3.5 sm:space-y-4">
          {/* Badge pill */}
          <div className="h-6 w-32 rounded-full bg-slate-200 animate-pulse" />

          {/* Heading lines */}
          <div className="space-y-2.5">
            <div className="h-8 sm:h-11 w-4/5 max-w-lg rounded-md bg-slate-200 animate-pulse" />
            <div className="h-7 sm:h-10 w-3/5 max-w-sm rounded-md bg-slate-200/80 animate-pulse" />
          </div>

          {/* Subtitle */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-full max-w-md rounded bg-slate-200/70 animate-pulse" />
            <div className="h-3.5 w-2/3 max-w-xs rounded bg-slate-200/60 animate-pulse hidden sm:block" />
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <div className="h-10 w-36 rounded-md bg-brand/20 border border-brand/30 animate-pulse" />
          </div>
        </div>

        {/* Right side subtle glow */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-white/60 blur-3xl" />
        </div>

        {/* Bottom indicator placeholders */}
        <div className="absolute bottom-4 inset-x-0 z-10 flex items-center justify-center gap-1.5">
          <div className="w-6 h-2 rounded-full bg-brand/40 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Default Fallback Slide if database has no active slides
export const DEFAULT_FALLBACK_SLIDE: ISliderItem = {
  id: "default-fallback-slide",
  type: "CONTENT_ONLY",
  title: "Authentic Products, Best Prices in Bangladesh",
  subtitle: "Explore verified electronics, fashion, lifestyle and home essentials with nationwide doorstep delivery.",
  badgeText: "Welcome to Shopora",
  buttonText: "Start Shopping",
  linkUrl: "/products",
  bgGradient: "from-brand-deep via-[#0c5c9e] to-sky-600",
  displayOrder: 1,
  isActive: true,
};

export interface HeroSliderProps {
  initialSliders?: ISliderItem[];
}

/**
 * Shadcn-powered Hero Carousel using shadcn Carousel, Navigation & Pagination
 */
export function HeroSlider({ initialSliders = [DEFAULT_FALLBACK_SLIDE] }: HeroSliderProps) {
  const effectiveSliders = initialSliders.length > 0 ? initialSliders : [DEFAULT_FALLBACK_SLIDE];
  const { data: rawSliders } = useGetSlidersQuery(undefined, {
    skip: effectiveSliders.length > 0,
  });

  // Autoplay plugin memoized safely for React 19 render cycle (no ref access during render)
  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: 5500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    []
  );

  const activeSliders = (rawSliders && rawSliders.length > 0 ? rawSliders : effectiveSliders).filter(
    (s) => s.isActive
  );
  const sliders: ISliderItem[] = activeSliders.length > 0 ? activeSliders : [DEFAULT_FALLBACK_SLIDE];
  const total = sliders.length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 select-none">
      <div className="relative w-full h-80 sm:h-96 md:h-112 lg:h-120 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
        <Carousel
          plugins={total > 1 ? [autoplayPlugin] : []}
          opts={{
            loop: total > 1,
            align: "start",
          }}
          className="w-full h-full relative"
        >
          <CarouselContent className="ml-0 h-full">
            {sliders.map((slide, idx) => {
              const displayImage = getSlideImageUrl(slide);

              return (
                <CarouselItem
                  key={slide.id || idx}
                  className="pl-0 h-80 sm:h-96 md:h-112 lg:h-120 relative w-full"
                >
                  {/* VARIANT 1: IMAGE_ONLY */}
                  {slide.type === "IMAGE_ONLY" && (
                    <div className="relative w-full h-full bg-slate-100">
                      {slide.linkUrl ? (
                        <Link
                          href={slide.linkUrl}
                          className="block w-full h-full relative cursor-pointer"
                        >
                          {displayImage ? (
                            <Image
                              src={displayImage}
                              alt={slide.title || "Hero Banner"}
                              fill
                              priority={idx === 0}
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 95vw, 1280px"
                              className="object-cover object-center"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                        </Link>
                      ) : (
                        <div className="w-full h-full relative">
                          {displayImage ? (
                            <Image
                              src={displayImage}
                              alt={slide.title || "Hero Banner"}
                              fill
                              priority={idx === 0}
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 95vw, 1280px"
                              className="object-cover object-center"
                            />
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VARIANT 2: IMAGE_BG_CONTENT (Background Image with Content Overlay) */}
                  {slide.type === "IMAGE_BG_CONTENT" && (
                    <div className="relative w-full h-full overflow-hidden bg-slate-900 flex items-center">
                      {/* Background Image */}
                      {displayImage && (
                        <Image
                          src={displayImage}
                          alt={slide.title || "Slide Background"}
                          fill
                          priority={idx === 0}
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 95vw, 1280px"
                          className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                      )}

                      {/* Gradient Scrim Overlay for high legibility */}
                      <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-900/60 to-transparent sm:to-black/20" />
                      <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/15 to-black/50" />

                      {/* Content Container */}
                      <div className="relative z-10 max-w-2xl px-5 sm:px-10 lg:px-14 space-y-3 sm:space-y-4">
                        {slide.badgeText && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold">
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>{slide.badgeText}</span>
                          </div>
                        )}

                        {slide.title && (
                          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] line-clamp-2">
                            {slide.title}
                          </h2>
                        )}

                        {slide.subtitle && (
                          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed line-clamp-2 max-w-xl">
                            {slide.subtitle}
                          </p>
                        )}

                        {slide.description && (
                          <p className="text-[11px] sm:text-xs text-slate-300 hidden md:block line-clamp-2 max-w-lg">
                            {slide.description}
                          </p>
                        )}

                        <div className="pt-1.5 sm:pt-2">
                          <Link
                            href={slide.linkUrl || "/products"}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-brand-deep hover:bg-brand text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            <span>{slide.buttonText || "Shop Now"}</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VARIANT 3: CONTENT_ONLY (Stylized Gradient Promo Banner) */}
                  {slide.type === "CONTENT_ONLY" && (
                    <div
                      className={`relative w-full h-full overflow-hidden flex items-center justify-center text-center p-6 sm:p-10 ${
                        slide.bgGradient
                          ? `bg-linear-to-br ${slide.bgGradient}`
                          : "bg-linear-to-br from-brand-deep via-[#0c5c9e] to-sky-600"
                      }`}
                      style={slide.bgColor ? { backgroundColor: slide.bgColor } : undefined}
                    >
                      {/* Subtle ambient lighting */}
                      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

                      {/* Centered Content */}
                      <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4 flex flex-col items-center">
                        {slide.badgeText && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold tracking-wide">
                            <Flame className="h-3.5 w-3.5 text-rose-400" />
                            <span>{slide.badgeText}</span>
                          </div>
                        )}

                        {slide.title && (
                          <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
                            {slide.title}
                          </h2>
                        )}

                        {slide.subtitle && (
                          <p className="text-xs sm:text-sm md:text-base text-slate-100 leading-relaxed max-w-xl font-medium line-clamp-2">
                            {slide.subtitle}
                          </p>
                        )}

                        <div className="pt-1.5 sm:pt-2">
                          <Link
                            href={slide.linkUrl || "/products"}
                            className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold transition cursor-pointer"
                          >
                            <span>{slide.buttonText || "Shop Collection"}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-900" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Shadcn Carousel Navigation (Previous / Next) */}
          {total > 1 && (
            <>
              <CarouselPrevious className="left-2.5 sm:left-4 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-white/90 hover:bg-white text-slate-800 border-slate-200 shadow-sm backdrop-blur-xs opacity-70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer" />
              <CarouselNext className="right-2.5 sm:right-4 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-white/90 hover:bg-white text-slate-800 border-slate-200 shadow-sm backdrop-blur-xs opacity-70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer" />
            </>
          )}

          {/* Shadcn Carousel Pagination Dots */}
          {total > 1 && <CarouselDots />}
        </Carousel>
      </div>
    </div>
  );
}
