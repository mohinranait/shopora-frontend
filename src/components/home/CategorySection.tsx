import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { ICategory, getCategoryImageUrl } from "@/types";

export function CategorySectionSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-4 w-32 bg-slate-200 rounded-md animate-pulse mb-1" />
          <div className="h-6 w-44 bg-slate-200 rounded-md animate-pulse mb-1" />
          <div className="h-3 w-56 bg-slate-100 rounded-md animate-pulse" />
        </div>
        <div className="h-4 w-24 bg-slate-200 rounded-md animate-pulse" />
      </div>

      {/* Grid Cards Skeleton with consistent responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-200/80 bg-white/60 shadow-xs animate-pulse"
          >
            <div className="h-14 w-14 rounded-2xl bg-slate-200 mb-3" />
            <div className="h-3.5 w-20 bg-slate-200 rounded-md mb-1.5" />
            <div className="h-2.5 w-12 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

const CATEGORY_COLORS = [
  "from-blue-500 to-indigo-600 text-white",
  "from-purple-500 to-pink-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-rose-500 to-red-600 text-white",
  "from-cyan-500 to-blue-600 text-white",
  "from-violet-500 to-purple-600 text-white",
  "from-slate-700 to-slate-900 text-white",
];

export interface CategorySectionProps {
  initialCategories?: ICategory[];
}

/**
 * Pre-rendered Synchronous Category Section (Zero Streaming Delay, Zero CLS)
 */
export function CategorySection({ initialCategories = [] }: CategorySectionProps) {
  if (!initialCategories || initialCategories.length === 0) {
    return null;
  }

  // Display top root or main categories (limit to 12 for clean responsive grid)
  const displayCategories = initialCategories.slice(0, 12);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-0.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Popular Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse authentic products across top catalog niches in Bangladesh
          </p>
        </div>

        <Link
          href="/categories"
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-deep transition-colors"
        >
          <span>All Categories</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Dynamic Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {displayCategories.map((cat, idx) => {
          const imageUrl = getCategoryImageUrl(cat);
          const gradient = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}
              className="group relative flex flex-col items-center text-center p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-brand/60 hover:shadow-md hover:shadow-brand/5 transition-all duration-200"
            >
              {/* Category Thumbnail / Avatar */}
              <div className="relative h-14 w-14 rounded-2xl overflow-hidden mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cat.useMedia?.alt || cat.name}
                    width={56}
                    height={56}
                    sizes="56px"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-lg`}
                  >
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {cat.description || "Verified Stock"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
