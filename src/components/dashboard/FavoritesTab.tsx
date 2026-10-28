"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ExternalLink,
  Star,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useGetUserWishlistQuery, useRemoveWishlistItemMutation } from "@/redux";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, openCartDrawer } from "@/redux/slices/cartSlice";
import { cartApi } from "@/lib/cart/api";
import { formatTaka } from "@/components/cart/CartParts";

export function FavoritesTab() {
  const dispatch = useAppDispatch();
  const { data: wishlist = [], isLoading, error } = useGetUserWishlistQuery();
  const [removeItemMutation, { isLoading: isRemoving }] =
    useRemoveWishlistItemMutation();

  const handleRemove = async (productId: number) => {
    try {
      await removeItemMutation(productId).unwrap();
      toast.success("Item removed from favorites");
    } catch {
      toast.error("Could not remove item");
    }
  };

  const handleAddToCart = async (item: {
    productId: number;
    product: {
      id: number;
      name: string;
      slug: string;
      mainImage: string | null;
      basePrice: number;
      stock: number;
    } | null;
  }) => {
    if (!item.product) return;

    try {
      await cartApi.add(item.productId, 1);

      dispatch(
        addToCart({
          productId: item.productId,
          quantity: 1,
          name: item.product.name,
          unitPrice: item.product.basePrice,
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            mainImage: item.product.mainImage || "",
            basePrice: item.product.basePrice,
            stock: item.product.stock,
          },
        })
      );

      dispatch(openCartDrawer());
      toast.success(`${item.product.name} added to cart!`);
    } catch {
      toast.error("Failed to add product to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-md bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-700">
        <p>Failed to load favorite items.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              My Favorites & Wishlist
            </h2>
            <span className="rounded-md bg-rose-50 text-rose-600 px-2 py-0.5 text-xs font-semibold">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Products you bookmarked for later.
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-deep"
        >
          <span>Explore Products</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3.5 transition hover:border-slate-300"
                >
                  {/* Top: Image & Remove Button */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-md bg-slate-50 border border-slate-100">
                    {product.mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package className="h-8 w-8 stroke-1" />
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <span
                      className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        product.stock > 0
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Sold Out"}
                    </span>

                    {/* Remove Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.productId)}
                      disabled={isRemoving}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-rose-500 transition hover:bg-rose-50 cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex-1 space-y-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="line-clamp-2 text-xs font-semibold text-slate-800 hover:text-brand transition"
                    >
                      {product.name}
                    </Link>

                    {product.ratingAverage ? (
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{product.ratingAverage.toFixed(1)}</span>
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

                  {/* Bottom: Add to Cart Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={product.stock <= 0}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-deep py-1.5 text-xs font-semibold text-white transition hover:bg-brand disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{product.stock > 0 ? "Add to Cart" : "Out of Stock"}</span>
                    </button>

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
            <Heart className="h-7 w-7 text-rose-400" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              Your wishlist is empty
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Bookmark products to find them easily here.
            </p>
            <Link
              href="/products"
              className="mt-4 rounded-md bg-brand-deep px-4 py-2 text-xs font-semibold text-white hover:bg-brand transition"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
