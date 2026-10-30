"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addToCart as reduxAddToCart,
  updateQuantity as reduxUpdateQuantity,
  removeFromCart as reduxRemoveFromCart,
  clearCart as reduxClearCart,
  openCartDrawer,
  closeCartDrawer,
  hydrateCart,
  AddToCartInput,
} from "@/redux/slices/cartSlice";
import type { ICartItem } from "@/types";

type CartStatus = "loading" | "ready" | "error";

export interface AddItemInput extends AddToCartInput {
  name?: string;
}

interface CartContextValue {
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  status: CartStatus;
  /** Item ids with an update in flight */
  pendingIds: Set<string | number>;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refresh: () => Promise<void>;
  addItem: (
    input: AddItemInput,
    options?: { openDrawer?: boolean; silent?: boolean }
  ) => Promise<boolean>;
  updateQuantity: (itemId: string | number, quantity: number) => Promise<void>;
  removeItem: (itemId: string | number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");

export function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { items, subtotal, totalItems, isDrawerOpen, isHydrated } = useAppSelector(
    (state) => state.cart
  );
  const [pendingIds, setPendingIds] = useState<Set<string | number>>(new Set());

  // Hydrate cart from localStorage on client mount
  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  const status: CartStatus = isHydrated ? "ready" : "loading";

  const refresh = useCallback(async () => {
    dispatch(hydrateCart());
  }, [dispatch]);

  const markPending = useCallback((id: string | number, on: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const addItem = useCallback<CartContextValue["addItem"]>(
    async (input, options = {}) => {
      try {
        let payload: AddToCartInput = { ...input };

        // If product metadata was not supplied (e.g. minimal call), try fetching it in background
        if (!payload.product && payload.productId) {
          try {
            const res = await fetch(`${API_BASE_URL}/products/${payload.productId}`);
            if (res.ok) {
              const json = await res.json();
              const p = json?.data;
              if (p) {
                payload = {
                  ...payload,
                  product: {
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    mainImage: p.images?.[0]?.url || p.images?.[0] || p.mainImage || "",
                    basePrice: p.basePrice,
                    stock: p.stock,
                    isPlatformOwned: false,
                    isFreeShipping: Boolean(p.isFreeShipping),
                  },
                  seller: p.seller
                    ? {
                        id: p.seller.id,
                        storeName: p.seller.storeName,
                        storeSlug: p.seller.storeSlug,
                        storeLogo: p.seller.storeLogo || null,
                        isVerified: p.seller.isVerified,
                      }
                    : null,
                  unitPrice: payload.unitPrice ?? p.basePrice,
                  comparePrice: payload.comparePrice ?? p.comparePrice,
                  maxAvailableStock: payload.maxAvailableStock ?? p.stock,
                };
              }
            }
          } catch {
            // Keep fallback payload if fetch fails
          }
        }

        dispatch(reduxAddToCart(payload));

        if (!options.silent) {
          const displayName = payload.name || payload.product?.name || "item";
          toast.success(`Added “${displayName}” to your cart`, {
            action: {
              label: "View cart",
              onClick: () => dispatch(openCartDrawer()),
            },
          });
        }

        if (options.openDrawer) {
          dispatch(openCartDrawer());
        }

        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this item");
        return false;
      }
    },
    [dispatch]
  );

  const removeItem = useCallback(
    async (itemId: string | number) => {
      const existing = items.find((i) => i.id === itemId);
      if (!existing) return;

      dispatch(reduxRemoveFromCart(itemId));
      toast.success(`Removed “${existing.product?.name ?? "item"}”`, {
        action: {
          label: "Undo",
          onClick: () =>
            void addItem(
              {
                productId: existing.productId,
                variantId: existing.variantId,
                quantity: existing.quantity,
                name: existing.product?.name,
                product: existing.product,
                variant: existing.variant,
                seller: existing.seller,
                unitPrice: existing.unitPrice,
                comparePrice: existing.comparePrice,
                maxAvailableStock: existing.maxAvailableStock,
              },
              { silent: true }
            ),
        },
      });
    },
    [dispatch, items, addItem]
  );

  const updateQuantity = useCallback(
    async (itemId: string | number, quantity: number) => {
      const item = items.find((i) => i.id === itemId);
      if (!item || quantity === item.quantity) return;

      if (quantity < 1) {
        return removeItem(itemId);
      }

      if (item.maxAvailableStock && quantity > item.maxAvailableStock) {
        toast.info(`Only ${item.maxAvailableStock} available`);
        return;
      }

      markPending(itemId, true);
      try {
        dispatch(reduxUpdateQuantity({ id: itemId, quantity }));
      } finally {
        markPending(itemId, false);
      }
    },
    [dispatch, items, removeItem, markPending]
  );

  const clear = useCallback(async () => {
    dispatch(reduxClearCart());
  }, [dispatch]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      subtotal,
      totalItems,
      status,
      pendingIds,
      isDrawerOpen,
      openDrawer: () => dispatch(openCartDrawer()),
      closeDrawer: () => dispatch(closeCartDrawer()),
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [
      items,
      subtotal,
      totalItems,
      status,
      pendingIds,
      isDrawerOpen,
      dispatch,
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
