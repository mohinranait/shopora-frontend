"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
  ShoppingBag,
} from "lucide-react";
import { useGetSlidersQuery } from "@/redux";
import type { ISliderItem } from "@/types";

/**
 * High-fidelity Skeleton Loader for the Hero Slider
 * Clean, light aesthetic matching the Shopora storefront theme without harsh dark flashes.
 */
export function HeroSliderSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 select-none">
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[480px] rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-r from-slate-100 via-sky-50/50 to-slate-100 border border-slate-200">
        {/* Animated Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

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
const DEFAULT_FALLBACK_SLIDE: ISliderItem = {
  id: 0,
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

export function HeroSlider() {
  const { data: rawSliders = [], isLoading } = useGetSlidersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe gesture coordinates
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const activeSliders = rawSliders.filter((s) => s.isActive);
  const sliders: ISliderItem[] = activeSliders.length > 0 ? activeSliders : [DEFAULT_FALLBACK_SLIDE];
  const total = sliders.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-play interval (5.5 seconds), paused on hover or touch
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch Swipe Handlers for mobile UX
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 45; // 45px swipe threshold
    if (isSwipe) {
      if (distance > 0) {
        nextSlide(); // Swiped left -> next
      } else {
        prevSlide(); // Swiped right -> prev
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (isLoading) {
    return <HeroSliderSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 select-none">
      <div
        className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[480px] rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ========================================================= */}
        {/* Stacked Slides with Silky-Smooth Crossfade & Zoom          */}
        {/* ========================================================= */}
        {sliders.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const displayImage = slide.useMedia?.media?.url || slide.imageUrl || "";

          return (
            <div
              key={slide.id || idx}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                isActive
                  ? "opacity-100 scale-100 z-10 pointer-events-auto"
                  : "opacity-0 scale-[1.02] z-0 pointer-events-none"
              }`}
            >
              {/* VARIANT 1: IMAGE_ONLY */}
              {slide.type === "IMAGE_ONLY" && (
                <div className="relative w-full h-full bg-slate-100">
                  {slide.linkUrl ? (
                    <Link
                      href={slide.linkUrl}
                      className="block w-full h-full relative cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayImage}
                        alt={slide.title || "Hero Banner"}
                        className="w-full h-full object-cover object-center"
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                    </Link>
                  ) : (
                    <div className="w-full h-full relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayImage}
                        alt={slide.title || "Hero Banner"}
                        className="w-full h-full object-cover object-center"
                        loading={idx === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* VARIANT 2: IMAGE_BG_CONTENT (Background Image with Content Overlay) */}
              {slide.type === "IMAGE_BG_CONTENT" && (
                <div className="relative w-full h-full overflow-hidden bg-slate-900 flex items-center">
                  {/* Background Image */}
                  {displayImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayImage}
                      alt={slide.title || "Slide Background"}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  )}

                  {/* Gradient Scrim Overlay for high legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-transparent sm:to-black/20" />
                  <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/15 to-black/50" />

                  {/* Content Container with staggered fade-in */}
                  <div className="relative z-10 max-w-2xl px-5 sm:px-10 lg:px-14 space-y-3 sm:space-y-4">
                    {slide.badgeText && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold transition-all duration-500 ${
                          isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>{slide.badgeText}</span>
                      </div>
                    )}

                    {slide.title && (
                      <h2
                        className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] line-clamp-2 transition-all duration-500 delay-75 ${
                          isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                      >
                        {slide.title}
                      </h2>
                    )}

                    {slide.subtitle && (
                      <p
                        className={`text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed line-clamp-2 max-w-xl transition-all duration-500 delay-150 ${
                          isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                      >
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.description && (
                      <p
                        className={`text-[11px] sm:text-xs text-slate-300 hidden md:block line-clamp-2 max-w-lg transition-all duration-500 delay-200 ${
                          isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                      >
                        {slide.description}
                      </p>
                    )}

                    <div
                      className={`pt-1.5 sm:pt-2 transition-all duration-500 delay-300 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                      }`}
                    >
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
                      ? `bg-gradient-to-br ${slide.bgGradient}`
                      : "bg-gradient-to-br from-brand-deep via-[#0c5c9e] to-sky-600"
                  }`}
                  style={slide.bgColor ? { backgroundColor: slide.bgColor } : undefined}
                >
                  {/* Subtle ambient lighting */}
                  <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

                  {/* Centered Content */}
                  <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4 flex flex-col items-center">
                    {slide.badgeText && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-semibold tracking-wide transition-all duration-500 ${
                          isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5 text-rose-400" />
                        <span>{slide.badgeText}</span>
                      </div>
                    )}

                    {slide.title && (
                      <h2
                        className={`text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2 transition-all duration-500 delay-75 ${
                          isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                      >
                        {slide.title}
                      </h2>
                    )}

                    {slide.subtitle && (
                      <p
                        className={`text-xs sm:text-sm md:text-base text-slate-100 leading-relaxed max-w-xl font-medium line-clamp-2 transition-all duration-500 delay-150 ${
                          isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                        }`}
                      >
                        {slide.subtitle}
                      </p>
                    )}

                    <div
                      className={`pt-1.5 sm:pt-2 transition-all duration-500 delay-200 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                      }`}
                    >
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
            </div>
          );
        })}

        {/* ========================================================= */}
        {/* Navigation Arrows (Prev / Next)                           */}
        {/* ========================================================= */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              type="button"
              aria-label="Previous slide"
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-sm backdrop-blur-xs flex items-center justify-center transition opacity-70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={nextSlide}
              type="button"
              aria-label="Next slide"
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-sm backdrop-blur-xs flex items-center justify-center transition opacity-70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* ========================================================= */}
        {/* Indicator Dots at Bottom                                  */}
        {/* ========================================================= */}
        {total > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-1.5">
            {sliders.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id || idx}
                  onClick={() => goToSlide(idx)}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`transition-all duration-300 rounded-full cursor-pointer shadow-xs ${
                    isActive
                      ? "w-6 sm:w-7 h-2 bg-brand"
                      : "w-2 h-2 bg-white/60 hover:bg-white/90 border border-black/10"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
