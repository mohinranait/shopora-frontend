"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ExternalLink,
  Star,
  Package,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, openCartDrawer } from "@/redux/slices/cartSlice";
import { cartApi } from "@/lib/cart/api";
import { formatTaka } from "@/components/cart/CartParts";

export function FavoritesTab() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    wishlist = [],
    wishlistCount,
    isLoading,
    removeFromWishlist,
    clearAllWishlist,
    isClearing,
  } = useWishlist();

  const [removingId, setRemovingId] = useState<string | number | null>(null);
  const [addingId, setAddingId] = useState<string | number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleRemove = async (productId: string | number, productName: string) => {
    setRemovingId(productId);
    await removeFromWishlist(productId, productName);
    setRemovingId(null);
  };

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    setConfirmClear(false);
    await clearAllWishlist();
  };

  const handleAddToCart = async (item: (typeof wishlist)[number]) => {
    const product = item.product;
    if (!product) return;

    // If variable product, user must choose options (size, color, etc.) on product page
    if (product.productType === "VARIABLE") {
      toast.info("Please select your preferred options on the product page.");
      router.push(`/products/${product.slug}`);
      return;
    }

    setAddingId(item.productId);
    try {
      await cartApi.add(item.productId, 1);

      dispatch(
        addToCart({
          productId: item.productId,
          quantity: 1,
          name: product.name,
          unitPrice: product.basePrice,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            mainImage: product.mainImage || "",
            basePrice: product.basePrice,
            stock: product.stock,
          },
        })
      );

      dispatch(openCartDrawer());
      toast.success(`"${product.name}" added to cart!`);
    } catch {
      toast.error("Failed to add product to cart");
    } finally {
      setAddingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-md bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              My Favorites & Wishlist
            </h2>
            <span className="rounded-md bg-rose-50 text-rose-600 px-2 py-0.5 text-xs font-semibold">
              {wishlistCount} {wishlistCount === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Products you saved for quick access and price tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {wishlistCount > 0 && (
            <button
              type="button"
              disabled={isClearing}
              onClick={handleClearAll}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                confirmClear
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              }`}
              title="Clear all favorite items"
            >
              {isClearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>{confirmClear ? "Click again to confirm" : "Clear All"}</span>
            </button>
          )}

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep"
          >
            <span>Explore Products</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {wishlistCount > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;

              const isItemRemoving = removingId !== null && String(removingId) === String(item.productId);
              const isItemAdding = addingId !== null && String(addingId) === String(item.productId);
              const isVariable = product.productType === "VARIABLE";
              const inStock = product.stock > 0;

              const discount =
                product.comparePrice && product.comparePrice > product.basePrice
                  ? Math.round(
                      ((product.comparePrice - product.basePrice) /
                        product.comparePrice) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-slate-300"
                >
                  {/* Top: Image, Badges & Remove Button */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {product.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package className="h-8 w-8 stroke-1" />
                      </div>
                    )}

                    {/* Stock Status Badge & Discount Badge */}
                    <div className="absolute left-2 top-2 flex flex-col gap-1 items-start">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          inStock
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>

                      {discount > 0 && (
                        <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Remove Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId, product.name)}
                      disabled={isItemRemoving}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white/95 text-rose-500 shadow-xs transition hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                      title="Remove from favorites"
                    >
                      {isItemRemoving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex-1 space-y-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 text-xs font-semibold text-slate-800 hover:text-brand transition"
                      title={product.name}
                    >
                      {product.name}
                    </Link>

                    {product.ratingAverage && product.ratingAverage > 0 ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{product.ratingAverage.toFixed(1)}</span>
                        {product.ratingCount ? (
                          <span className="text-slate-400 text-[10px]">
                            ({product.ratingCount})
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="pt-0.5 flex items-baseline gap-2">
                      <span className="text-sm font-bold tabular-nums text-slate-900">
                        {formatTaka(product.basePrice)}
                      </span>
                      {product.comparePrice &&
                        product.comparePrice > product.basePrice && (
                          <span className="text-xs text-slate-400 line-through tabular-nums">
                            {formatTaka(product.comparePrice)}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Bottom Action: Add to Cart or Select Options */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                    {isVariable ? (
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-deep py-1.5 text-xs font-semibold text-white transition hover:bg-brand cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Select Options</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        disabled={!inStock || isItemAdding}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-deep py-1.5 text-xs font-semibold text-white transition hover:bg-brand disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isItemAdding ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShoppingBag className="h-3.5 w-3.5" />
                        )}
                        <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
                      </button>
                    )}

                    <Link
                      href={`/products/${product.slug}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 transition"
                      title="View product details"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-2">
              <Heart className="h-6 w-6 stroke-2" />
            </div>
            <h3 className="mt-1 text-sm font-bold text-slate-900">
              Your wishlist is empty
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 max-w-xs">
              Save items you love by clicking the heart icon on any product card or details page.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-4 py-2 text-xs font-semibold text-white hover:bg-brand transition"
            >
              <span>Explore Products</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
