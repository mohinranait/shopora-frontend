import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ICartItem } from "@/types";

export const CART_STORAGE_KEY = "shopora_cart";

export interface AddToCartInput {
  productId: number;
  variantId?: number | null;
  quantity?: number;
  name?: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    mainImage: string;
    basePrice: number;
    stock: number;
    isPlatformOwned?: boolean;
    isFreeShipping?: boolean;
  } | null;
  variant?: {
    id: number;
    title: string;
    sku: string;
    price: number;
    stock: number;
    image?: string | null;
    attributes?: Record<string, string> | null;
  } | null;
  seller?: {
    id: number;
    storeName: string;
    storeSlug: string;
    storeLogo?: string | null;
    isVerified?: boolean;
  } | null;
  unitPrice?: number;
  comparePrice?: number | null;
  maxAvailableStock?: number;
}

export interface CartState {
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
  isDrawerOpen: boolean;
  isHydrated: boolean;
}

function calculateTotals(items: ICartItem[]): { subtotal: number; totalItems: number } {
  let subtotal = 0;
  let totalItems = 0;
  for (const item of items) {
    if (item.isAvailable && item.inStock) {
      subtotal += item.unitPrice * item.quantity;
      totalItems += item.quantity;
    }
  }
  return { subtotal, totalItems };
}

function saveCart(items: ICartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or disabled
  }
}

export function readCartFromStorage(): ICartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        ...item,
        itemTotal: (item.unitPrice || 0) * (item.quantity || 1),
      }));
    }
    return [];
  } catch {
    return [];
  }
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  isDrawerOpen: false,
  isHydrated: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<ICartItem[] | undefined>) => {
      const items = action.payload ?? readCartFromStorage();
      state.items = items;
      const { subtotal, totalItems } = calculateTotals(items);
      state.subtotal = subtotal;
      state.totalItems = totalItems;
      state.isHydrated = true;
    },

    addToCart: (state, action: PayloadAction<AddToCartInput>) => {
      const payload = action.payload;
      const variantId = payload.variantId ?? null;
      const addQty = Math.max(1, payload.quantity ?? 1);

      const existingIndex = state.items.findIndex(
        (i) => i.productId === payload.productId && (i.variantId ?? null) === variantId
      );

      if (existingIndex >= 0) {
        const existing = state.items[existingIndex];
        const maxStock = existing.maxAvailableStock || payload.maxAvailableStock || 999;
        existing.quantity = Math.min(existing.quantity + addQty, maxStock);
        existing.itemTotal = existing.unitPrice * existing.quantity;
      } else {
        const id = variantId ? payload.productId * 1000000 + variantId : payload.productId;
        const unitPrice = payload.unitPrice ?? payload.product?.basePrice ?? 0;
        const comparePrice = payload.comparePrice ?? null;
        const maxStock = payload.maxAvailableStock ?? payload.product?.stock ?? 999;

        const newItem: ICartItem = {
          id,
          productId: payload.productId,
          variantId,
          quantity: Math.min(addQty, maxStock),
          unitPrice,
          comparePrice,
          itemTotal: unitPrice * Math.min(addQty, maxStock),
          inStock: maxStock > 0,
          isAvailable: true,
          maxAvailableStock: maxStock,
          product: payload.product
            ? {
                id: payload.productId,
                name: payload.product.name ?? payload.name ?? "Product",
                slug: payload.product.slug ?? "",
                mainImage: payload.product.mainImage ?? "",
                basePrice: payload.product.basePrice ?? unitPrice,
                stock: payload.product.stock ?? maxStock,
                isPlatformOwned: payload.product.isPlatformOwned ?? false,
                isFreeShipping: payload.product.isFreeShipping ?? false,
              }
            : {
                id: payload.productId,
                name: payload.name ?? "Product",
                slug: "",
                mainImage: "",
                basePrice: unitPrice,
                stock: maxStock,
                isPlatformOwned: false,
                isFreeShipping: false,
              },
          variant: payload.variant
            ? {
                id: payload.variant.id ?? variantId ?? 0,
                title: payload.variant.title ?? "",
                sku: payload.variant.sku ?? "",
                price: payload.variant.price ?? unitPrice,
                stock: payload.variant.stock ?? maxStock,
                image: payload.variant.image ?? null,
                attributes: payload.variant.attributes ?? null,
              }
            : null,
          seller: payload.seller ?? null,
        };

        state.items.push(newItem);
      }

      const { subtotal, totalItems } = calculateTotals(state.items);
      state.subtotal = subtotal;
      state.totalItems = totalItems;
      saveCart(state.items);
    },

    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) {
          const maxStock = item.maxAvailableStock || 999;
          item.quantity = Math.min(quantity, maxStock);
          item.itemTotal = item.unitPrice * item.quantity;
        }
      }

      const { subtotal, totalItems } = calculateTotals(state.items);
      state.subtotal = subtotal;
      state.totalItems = totalItems;
      saveCart(state.items);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      state.items = state.items.filter((i) => i.id !== id);
      const { subtotal, totalItems } = calculateTotals(state.items);
      state.subtotal = subtotal;
      state.totalItems = totalItems;
      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.totalItems = 0;
      saveCart([]);
    },

    openCartDrawer: (state) => {
      state.isDrawerOpen = true;
    },

    closeCartDrawer: (state) => {
      state.isDrawerOpen = false;
    },

    setCartDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },

    setCartItems: (state, action: PayloadAction<ICartItem[]>) => {
      state.items = action.payload;
      const { subtotal, totalItems } = calculateTotals(action.payload);
      state.subtotal = subtotal;
      state.totalItems = totalItems;
      saveCart(state.items);
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  openCartDrawer,
  closeCartDrawer,
  setCartDrawerOpen,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
