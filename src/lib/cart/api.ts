/**
 * Client-side cart & checkout API. Guests are identified by a persistent
 * `x-session-id`; logged-in users by their bearer token (the backend merges a
 * guest cart into the user's cart on the first request after login).
 */
import { clearSession, getAccessToken, refreshAccessToken } from "@/lib/auth/session";
import type { ICart, ICheckoutPayload, IOrder, IOrderQuote, IPaginationMeta, IPlacedOrder } from "@/types";

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

/**
 * Send a request with the guest session id and, when logged in, the bearer token.
 * An expired access token is refreshed once and the request retried; if the session can't be
 * refreshed it is cleared and the request retried as a guest (the cart lives on the session id).
 */
/** The backend's response envelope */
interface IApiEnvelope {
  data?: unknown;
  meta?: IPaginationMeta;
  message?: string;
  errorSources?: { message: string }[];
}

async function send(path: string, init: RequestInit = {}): Promise<{ res: Response; json: IApiEnvelope | null }> {
  const attempt = async (token: string | null) => {
    const headers = new Headers(init.headers);
    headers.set("x-session-id", getCartSessionId());
    if (init.body) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    } catch {
      throw new CartApiError("Network error. Please check your connection.", 0);
    }
    const json: IApiEnvelope | null = await res.json().catch(() => null);
    return { res, json };
  };

  const token = getAccessToken();
  let result = await attempt(token);
  if (result.res.status === 401 && token) {
    const fresh = await refreshAccessToken();
    if (!fresh) clearSession();
    result = await attempt(fresh);
  }
  return result;
}

const errorMessage = (res: Response, json: IApiEnvelope | null) =>
  json?.errorSources?.[0]?.message || json?.message || `Request failed (${res.status})`;

/** Authenticated (or guest-session) JSON request to the API; returns `data` */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { res, json } = await send(path, init);
  if (!res.ok) throw new CartApiError(errorMessage(res, json), res.status);
  return json?.data as T;
}

export const cartApi = {
  get: () => request<ICart>("/cart"),
  add: (productId: string | number, quantity: number, variantId?: string | number | null) =>
    request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, variantId: variantId ?? null }),
    }),
  update: (itemId: string | number, quantity: number) =>
    request(`/cart/item/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
  remove: (itemId: string | number) => request(`/cart/item/${itemId}`, { method: "DELETE" }),
  clear: () => request("/cart/clear", { method: "DELETE" }),
  quote: (items: ICheckoutPayload["items"], couponCode?: string) =>
    request<IOrderQuote>("/orders/quote", {
      method: "POST",
      body: JSON.stringify({ items, couponCode: couponCode || undefined }),
    }),
  checkout: (payload: ICheckoutPayload) =>
    request<IPlacedOrder>("/orders/checkout", { method: "POST", body: JSON.stringify(payload) }),
};

async function requestWithMeta<T>(path: string): Promise<{ data: T; meta?: IPaginationMeta }> {
  const { res, json } = await send(path);
  if (!res.ok) throw new CartApiError(errorMessage(res, json), res.status);
  return { data: json?.data as T, meta: json?.meta };
}

export const ordersApi = {
  mine: (params: { status?: string; page?: number } = {}) => {
    const qs = new URLSearchParams({ page: String(params.page ?? 1), limit: "10" });
    if (params.status) qs.set("status", params.status);
    return requestWithMeta<IOrder[]>(`/orders/my-orders?${qs}`);
  },
  detail: (orderNumber: string, phone?: string) =>
    request<IOrder>(
      `/orders/detail/${encodeURIComponent(orderNumber)}${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`
    ),
  cancel: (orderNumber: string, body: { reason?: string; phone?: string }) =>
    request<IOrder>(`/orders/${encodeURIComponent(orderNumber)}/cancel`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
