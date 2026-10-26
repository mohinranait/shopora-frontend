import React from "react";

export default function RootLoading() {
  return (
    <div className="space-y-12 pb-16 animate-pulse">
      {/* Hero Skeleton */}
      <section className="pt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-[300px] sm:h-[400px] md:h-[460px] lg:h-[500px] rounded-3xl bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center" />
      </section>

      {/* Category Section Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center p-4 rounded-2xl border border-slate-200 bg-white"
            >
              <div className="h-14 w-14 rounded-full bg-slate-200 mb-3" />
              <div className="h-3.5 w-20 bg-slate-200 rounded mb-1" />
              <div className="h-2.5 w-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
