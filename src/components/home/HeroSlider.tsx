"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
  Tag,
  ShoppingBag,
} from "lucide-react";
import { useGetSlidersQuery } from "@/redux";
import { ISliderItem } from "@/types";

export function HeroSlider() {
  const { data: sliders = [], isLoading } = useGetSlidersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = sliders.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play interval (5 seconds), paused on hover
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
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

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="w-full h-[280px] sm:h-[380px] md:h-[460px] lg:h-[500px] rounded-3xl bg-slate-900 animate-pulse flex items-center justify-center border border-slate-800">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            <p className="text-xs font-medium">Loading Shopora Hero Showcase...</p>
          </div>
        </div>
      </div>
    );
  }

  if (sliders.length === 0) {
    return null;
  }

  const currentSlide: ISliderItem = sliders[currentIndex] || sliders[0];
  const displayImage = currentSlide.useMedia?.media?.url || currentSlide.imageUrl || "";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 select-none">
      <div
        className="relative w-full h-[300px] sm:h-[400px] md:h-[460px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl group border border-slate-800/60 transition-all"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ========================================================= */}
        {/* VARIANT 1: IMAGE_ONLY                                     */}
        {/* ========================================================= */}
        {currentSlide.type === "IMAGE_ONLY" && (
          <div className="relative w-full h-full bg-slate-950">
            {currentSlide.linkUrl ? (
              <Link href={currentSlide.linkUrl} className="block w-full h-full relative cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={currentSlide.title || "Hero banner"}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </Link>
            ) : (
              <div className="w-full h-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={currentSlide.title || "Hero banner"}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VARIANT 2: IMAGE_BG_CONTENT (Image background with text)  */}
        {/* ========================================================= */}
        {currentSlide.type === "IMAGE_BG_CONTENT" && (
          <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center">
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={currentSlide.title || "Slide background"}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Gradient Scrim Overlay for high legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent sm:to-black/30" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/20 to-black/60" />

            {/* Floating Content Box */}
            <div className="relative z-10 max-w-2xl px-6 sm:px-12 lg:px-16 space-y-4">
              {currentSlide.badgeText && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  <span>{currentSlide.badgeText}</span>
                </div>
              )}

              {currentSlide.title && (
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.12] drop-shadow-md">
                  {currentSlide.title}
                </h2>
              )}

              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl drop-shadow">
                  {currentSlide.subtitle}
                </p>
              )}

              {currentSlide.description && (
                <p className="text-[11px] sm:text-xs text-slate-300 hidden sm:block line-clamp-2 max-w-lg">
                  {currentSlide.description}
                </p>
              )}

              <div className="pt-2">
                <Link
                  href={currentSlide.linkUrl || "/products"}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-brand hover:from-sky-400 hover:to-brand-deep text-white text-xs sm:text-sm font-bold shadow-xl shadow-brand/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{currentSlide.buttonText || "Shop Now"}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VARIANT 3: CONTENT_ONLY (Stylized Gradient Promo Banner)   */}
        {/* ========================================================= */}
        {currentSlide.type === "CONTENT_ONLY" && (
          <div
            className={`relative w-full h-full overflow-hidden flex items-center justify-center text-center p-6 sm:p-12 ${
              currentSlide.bgGradient
                ? `bg-gradient-to-br ${currentSlide.bgGradient}`
                : "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950"
            }`}
            style={currentSlide.bgColor ? { backgroundColor: currentSlide.bgColor } : undefined}
          >
            {/* Ambient decorative glowing shapes */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0,transparent_70%)]" />

            {/* Centered Content */}
            <div className="relative z-10 max-w-3xl space-y-4 flex flex-col items-center">
              {currentSlide.badgeText && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black shadow-lg uppercase tracking-wider">
                  <Flame className="h-3.5 w-3.5 text-rose-400 animate-bounce" />
                  <span>{currentSlide.badgeText}</span>
                </div>
              )}

              {currentSlide.title && (
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  {currentSlide.title}
                </h2>
              )}

              {currentSlide.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-slate-100/90 leading-relaxed max-w-2xl font-medium">
                  {currentSlide.subtitle}
                </p>
              )}

              {currentSlide.description && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-amber-200 font-mono">
                  <Tag className="h-3.5 w-3.5 text-amber-400" />
                  <span>{currentSlide.description}</span>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href={currentSlide.linkUrl || "/products"}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>{currentSlide.buttonText || "Shop Collection"}</span>
                  <ArrowRight className="h-4 w-4 text-slate-900" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* Navigation Arrows (Prev / Next)                           */}
        {/* ========================================================= */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* ========================================================= */}
        {/* Indicator Dots at Bottom                                  */}
        {/* ========================================================= */}
        {total > 1 && (
          <div className="absolute bottom-4 inset-x-0 z-20 flex items-center justify-center gap-2">
            {sliders.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all rounded-full ${
                    isActive
                      ? "w-8 h-2.5 bg-sky-400 shadow-md shadow-sky-400/50"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
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
