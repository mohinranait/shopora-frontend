import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { clearSession, redirectToLoginIfProtected, refreshAccessToken } from "@/lib/auth/session";

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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // A 401 from the auth endpoints themselves means bad credentials, not an expired session
  const url = typeof args === "string" ? args : args.url;
  const isAuthCall = /\/auth\/(login|register|refresh-token)/.test(url);

  if (result.error && result.error.status === 401 && !isAuthCall && typeof window !== "undefined") {
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      // Retry the original query with the refreshed access token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Token refresh failed or no refresh token: purge stale auth data
      clearSession();
      redirectToLoginIfProtected();
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
    "Questions",
    "Question",
    "Logistics",
    "Escrow",
  ],
  endpoints: () => ({}),
});
