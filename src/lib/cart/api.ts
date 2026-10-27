/**
 * Client-side cart & checkout API. Guests are identified by a persistent
 * `x-session-id`; logged-in users by their bearer token (the backend merges a
 * guest cart into the user's cart on the first request after login).
 */
import type { ICart, ICheckoutPayload, IOrderQuote, IPlacedOrder } from "@/types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");
const SESSION_KEY = "shopora_cart_session";

export function getCartSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `guest-${crypto.randomUUID()}`
          : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "guest-ephemeral";
  }
}

export class CartApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("x-session-id", getCartSessionId());
  if (init.body) headers.set("Content-Type", "application/json");
  try {
    const token = localStorage.getItem("shopora_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  } catch {
    // storage unavailable: continue as guest
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new CartApiError("Network error. Please check your connection.", 0);
  }
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.errorSources?.[0]?.message || json?.message || `Request failed (${res.status})`;
    throw new CartApiError(message, res.status);
  }
  return json?.data as T;
}

export const cartApi = {
  get: () => request<ICart>("/cart"),
  add: (productId: number, quantity: number, variantId?: number | null) =>
    request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, variantId: variantId ?? null }),
    }),
  update: (itemId: number, quantity: number) =>
    request(`/cart/item/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
  remove: (itemId: number) => request(`/cart/item/${itemId}`, { method: "DELETE" }),
  clear: () => request("/cart/clear", { method: "DELETE" }),
  quote: (items: ICheckoutPayload["items"], couponCode?: string) =>
    request<IOrderQuote>("/orders/quote", {
      method: "POST",
      body: JSON.stringify({ items, couponCode: couponCode || undefined }),
    }),
  checkout: (payload: ICheckoutPayload) =>
    request<IPlacedOrder>("/orders/checkout", { method: "POST", body: JSON.stringify(payload) }),
};
