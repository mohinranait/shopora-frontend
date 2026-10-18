"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Filter,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Search,
  Check,
} from "lucide-react";
import { ProductCard } from "../../../components/ui/ProductCard";
import { mockProducts } from "../../../data/mockProducts";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(15000);

  // Extract unique categories and brands
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(mockProducts.map((p) => p.category)))];
  }, []);

  const brands = useMemo(() => {
    return ["All", ...Array.from(new Set(mockProducts.map((p) => p.brand)))];
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return mockProducts
      .filter((p) => {
        if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
        if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
        if (inStockOnly && p.stock <= 0) return false;
        if (p.basePrice > maxPrice) return false;
        if (searchFilter.trim() && !p.name.toLowerCase().includes(searchFilter.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.basePrice - b.basePrice;
        if (sortBy === "price_desc") return b.basePrice - a.basePrice;
        if (sortBy === "top_rated") return b.rating - a.rating;
        return b.id - a.id;
      });
  }, [selectedCategory, selectedBrand, inStockOnly, sortBy, searchFilter, maxPrice]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedBrand("All");
    setInStockOnly(false);
    setSearchFilter("");
    setMaxPrice(15000);
    setSortBy("newest");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand transition">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="font-semibold text-slate-800">Products Catalog</span>
      </nav>

      {/* Page Title & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse our complete selection of authentic, ready-stock verified goods
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md self-start sm:self-auto">
          Showing <strong className="text-slate-900">{filteredProducts.length}</strong> Products
        </div>
      </div>

      {/* Main Grid with Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Filter className="h-4 w-4 text-brand" />
              Filter Products
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-brand transition"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Search Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by name..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Categories
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-md transition ${
                    selectedCategory === cat
                      ? "bg-brand/10 font-bold text-brand-deep"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="h-3.5 w-3.5 text-brand" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Max Price
              </label>
              <span className="text-xs font-extrabold text-brand-deep">
                ৳{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>৳1,000</span>
              <span>৳15,000</span>
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Brands
            </label>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-md transition ${
                    selectedBrand === b
                      ? "bg-brand/10 font-bold text-brand-deep"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{b}</span>
                  {selectedBrand === b && <Check className="h-3.5 w-3.5 text-brand" />}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4"
              />
              <span>In-Stock Products Only</span>
            </label>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort and Active Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
            {/* Active Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500 mr-1">Active:</span>
              {selectedCategory !== "All" && (
                <span className="rounded bg-sky-50 text-brand-deep px-2 py-0.5 font-bold border border-sky-100">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedBrand !== "All" && (
                <span className="rounded bg-sky-50 text-brand-deep px-2 py-0.5 font-bold border border-sky-100">
                  Brand: {selectedBrand}
                </span>
              )}
              {inStockOnly && (
                <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold border border-emerald-100">
                  In Stock Only
                </span>
              )}
              {selectedCategory === "All" && selectedBrand === "All" && !inStockOnly && (
                <span className="text-slate-400">All filters default</span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <label htmlFor="sortBy" className="text-xs font-semibold text-slate-600">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-medium text-slate-800 outline-none focus:border-brand"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="top_rated">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <p className="text-base font-bold text-slate-800">No products match your filters</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your search terms, resetting category or brand filters, or increasing the max price.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-4 py-2 text-xs font-bold text-white hover:bg-brand transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Placeholder */}
          {filteredProducts.length > 0 && (
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1 to {filteredProducts.length} of {filteredProducts.length} items</span>
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="rounded border border-slate-200 px-3 py-1.5 font-semibold opacity-50 cursor-not-allowed"
                >
                  Prev
                </button>
                <button className="rounded bg-brand-deep text-white px-3 py-1.5 font-bold shadow-2xs">
                  1
                </button>
                <button
                  disabled
                  className="rounded border border-slate-200 px-3 py-1.5 font-semibold opacity-50 cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
