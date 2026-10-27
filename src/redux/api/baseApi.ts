import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
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
  }),
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
  ],
  endpoints: () => ({}),
});
