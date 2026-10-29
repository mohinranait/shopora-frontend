import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // Auto-attach authorization token from localStorage on client
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("shopora_token");
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

// Mutex promise to prevent duplicate simultaneous refresh requests
let refreshPromise: Promise<string | null> | null = null;

const requestNewAccessToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("shopora_refresh_token");
      if (!refreshToken) return null;

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const result = await response.json();
      const newAccessToken = result?.data?.accessToken;
      if (newAccessToken) {
        localStorage.setItem("shopora_token", newAccessToken);
        document.cookie = `shopora_token=${newAccessToken}; path=/; max-age=604800; SameSite=Lax`;
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (typeof window !== "undefined") {
      const newAccessToken = await requestNewAccessToken();

      if (newAccessToken) {
        // Retry the original query with the refreshed access token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Token refresh failed or no refresh token: purge stale auth data
        localStorage.removeItem("shopora_token");
        localStorage.removeItem("shopora_refresh_token");
        localStorage.removeItem("shopora_user");
        document.cookie = "shopora_token=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "shopora_role=; path=/; max-age=0; SameSite=Lax";

        window.dispatchEvent(new Event("storage"));

        // Only redirect on protected paths to prevent annoying redirect loops
        const currentPath = window.location.pathname;
        if (currentPath.startsWith("/admin") && currentPath !== "/admin-login") {
          window.location.href = `/admin-login?redirect=${encodeURIComponent(currentPath)}`;
        } else if (
          currentPath.startsWith("/dashboard") ||
          currentPath.startsWith("/orders")
        ) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  // Cache retention: Keep unused data in memory for 5 minutes (300 seconds) for blazing fast performance
  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: false,
  tagTypes: [
    "Products",
    "Product",
    "Brands",
    "Brand",
    "Categories",
    "Category",
    "CategoryTree",
    "Attributes",
    "Attribute",
    "Media",
    "Auth",
    "Sliders",
    "Slider",
    "Reviews",
    "Orders",
    "Order",
    "Customers",
    "Customer",
    "Settings",
    "Sellers",
    "Seller",
    "Payouts",
    "Payout",
    "UserAddresses",
    "Wishlist",
    "Notifications",
    "NotificationCount",
  ],
  endpoints: () => ({}),
});
