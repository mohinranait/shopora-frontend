import React, { Suspense } from "react";
import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/home/HeroSlider";
import {
  CategorySection,
  CategorySectionSkeleton,
} from "@/components/home/CategorySection";
import { HomeProductsSection } from "@/components/home/HomeProductsSection";

/**
 * Next.js App Router Server Component - HomePage
 * Server-side data fetching enabled with dynamic categories and streaming skeleton loaders
 */
export default async function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. Dynamic Hero Showcase Carousel (3 Variants) */}
      <section className="pt-2">
        <HeroSlider />
      </section>

      {/* 2. Dynamic Server-Side Category Showcase with Streaming Skeleton Loader */}
      <Suspense fallback={<CategorySectionSkeleton />}>
        <CategorySection />
      </Suspense>

      {/* 3. Curated Products Showcase Section */}
      <HomeProductsSection />

      {/* 4. Multi-Vendor Marketplace Opportunity Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-deep via-slate-900 to-indigo-950 p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-sky-200 backdrop-blur-xs border border-white/15">
              <Store className="h-3.5 w-3.5 text-brand" /> Verified Vendor Network
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Start Selling Your Authentic Products on Shopora Marketplace
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              Open your vendor store in minutes. Reach millions of customers nationwide, manage your orders with our
              smart seller command center, and receive weekly automated payouts directly to your bKash or Bank.
            </p>
            <div className="pt-2">
              <Link
                href="/seller/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-deep hover:bg-sky-50 transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Register as a Vendor Today</span>
                <ArrowRight className="h-4 w-4 text-brand-deep" />
              </Link>
            </div>
          </div>

          {/* Decorative ambient background glows */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -top-20 w-60 h-60 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
