"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cartApi } from "@/lib/cart/api";
import type { ICart, ICartItem } from "@/types";

type CartStatus = "loading" | "ready" | "error";

interface CartContextValue {
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  status: CartStatus;
  /** Item ids with a request in flight */
  pendingIds: Set<number>;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refresh: () => Promise<void>;
  addItem: (
    input: { productId: number; variantId?: number | null; quantity?: number; name?: string },
    options?: { openDrawer?: boolean; silent?: boolean }
  ) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: ICart = { items: [], subtotal: 0, totalItems: 0 };

/** Recompute totals locally for optimistic updates (server stays the source of truth) */
function withTotals(items: ICartItem[]): ICart {
  let subtotal = 0;
  let totalItems = 0;
  const next = items.map((i) => {
    const itemTotal = i.unitPrice * i.quantity;
    if (i.isAvailable && i.inStock) {
      subtotal += itemTotal;
      totalItems += i.quantity;
    }
    return { ...i, itemTotal };
  });
  return { items: next, subtotal, totalItems };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<ICart>(EMPTY_CART);
  const [status, setStatus] = useState<CartStatus>("loading");
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const refresh = useCallback(async () => {
    try {
      const data = await cartApi.get();
      setCart(data ?? EMPTY_CART);
      setStatus("ready");
    } catch {
      setStatus((s) => (s === "loading" ? "error" : s));
    }
  }, []);

  // Load on mount and whenever the signed-in user changes (merges the guest cart on login)
  useEffect(() => {
    let ignore = false;
    cartApi
      .get()
      .then((data) => {
        if (ignore) return;
        setCart(data ?? EMPTY_CART);
        setStatus("ready");
      })
      .catch(() => {
        if (!ignore) setStatus((s) => (s === "loading" ? "error" : s));
      });
    return () => {
      ignore = true;
    };
  }, [token]);

  const markPending = (id: number, on: boolean) =>
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const addItem = useCallback<CartContextValue["addItem"]>(
    async ({ productId, variantId = null, quantity = 1, name }, options = {}) => {
      try {
        await cartApi.add(productId, quantity, variantId);
        await refresh();
        if (!options.silent) {
          toast.success(name ? `Added “${name}” to your cart` : "Added to your cart", {
            action: { label: "View cart", onClick: () => setDrawerOpen(true) },
          });
        }
        if (options.openDrawer) setDrawerOpen(true);
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this item");
        return false;
      }
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      const previous = cartRef.current;
      const item = previous.items.find((i) => i.id === itemId);
      if (!item) return;

      setCart(withTotals(previous.items.filter((i) => i.id !== itemId)));
      try {
        await cartApi.remove(itemId);
        toast.success(`Removed “${item.product?.name ?? "item"}”`, {
          action: {
            label: "Undo",
            onClick: () =>
              void addItem(
                { productId: item.productId, variantId: item.variantId, quantity: item.quantity },
                { silent: true }
              ),
          },
        });
      } catch (error) {
        setCart(previous);
        toast.error(error instanceof Error ? error.message : "Couldn't remove item");
      }
    },
    [addItem]
  );
  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      const previous = cartRef.current;
      const item = previous.items.find((i) => i.id === itemId);
      if (!item || quantity === item.quantity) return;
      if (quantity < 1) {
        return removeItem(itemId);
      }
      if (quantity > item.maxAvailableStock) {
        toast.info(`Only ${item.maxAvailableStock} available`);
        return;
      }

      setCart(withTotals(previous.items.map((i) => (i.id === itemId ? { ...i, quantity } : i))));
      markPending(itemId, true);
      try {
        await cartApi.update(itemId, quantity);
      } catch (error) {
        setCart(previous);
        toast.error(error instanceof Error ? error.message : "Couldn't update quantity");
      } finally {
        markPending(itemId, false);
      }
    },
    [removeItem]
  );


  const clear = useCallback(async () => {
    const previous = cartRef.current;
    setCart(EMPTY_CART);
    try {
      await cartApi.clear();
    } catch (error) {
      setCart(previous);
      toast.error(error instanceof Error ? error.message : "Couldn't clear cart");
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: cart.items,
      subtotal: cart.subtotal,
      totalItems: cart.totalItems,
      status,
      pendingIds,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      refresh,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    }),
    [cart, status, pendingIds, isDrawerOpen, refresh, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
