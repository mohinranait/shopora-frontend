import { baseApi } from "./baseApi";
import {
  IProductItem,
  ICreateProductPayload,
  IUpdateProductPayload,
  IProductListResponse,
  IApiResponse,
  IAutocompleteSuggestionsResponse,
  IProductBundleResponse,
} from "@/types";

export const productApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all products with query filtering & pagination
    getProducts: builder.query<
      IProductListResponse,
      Record<string, string | number | boolean | undefined> | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              query.append(key, String(val));
            }
          });
        }
        return `/products?${query.toString()}`;
      },
      transformResponse: (res: IApiResponse<IProductItem[]>) => ({
        products: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: "Products" as const, id })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // Get all products for admin (including PENDING review, platform-owned, vendor-owned)
    getAdminProducts: builder.query<
      IProductListResponse,
      Record<string, string | number | boolean | undefined> | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              query.append(key, String(val));
            }
          });
        }
        return `/products/admin/all?${query.toString()}`;
      },
      transformResponse: (res: IApiResponse<IProductItem[]>) => ({
        products: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: "Products" as const, id })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // Get seller's own products (authenticated seller only)
    getSellerProducts: builder.query<
      IProductListResponse,
      Record<string, string | number | boolean | undefined> | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              query.append(key, String(val));
            }
          });
        }
        return `/products/seller/my-products?${query.toString()}`;
      },
      transformResponse: (res: IApiResponse<IProductItem[]>) => ({
        products: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: "Products" as const, id })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // Get single product by ID
    getProductById: builder.query<IProductItem, string | number>({
      query: (id) => `/products/${id}`,
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      providesTags: (result, error, id) => [{ type: "Product" as const, id }],
    }),

    // Get single product by slug (storefront)
    getProductBySlug: builder.query<IProductItem, string>({
      query: (slug) => `/products/detail/${slug}`,
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      providesTags: (result, error, slug) => [{ type: "Product" as const, id: slug }],
    }),

    // Create a new product (Simple or Variable)
    createProduct: builder.mutation<IProductItem, ICreateProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      invalidatesTags: [{ type: "Products" as const, id: "LIST" }],
    }),

    // Update existing product
    updateProduct: builder.mutation<
      IProductItem,
      { id: string | number; body: IUpdateProductPayload }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Products" as const, id: "LIST" },
        { type: "Product" as const, id },
      ],
    }),

    // Review product approval status (Admin)
    reviewProductApproval: builder.mutation<
      IProductItem,
      { id: string | number; status: "APPROVED" | "REJECTED"; rejectionReason?: string }
    >({
      query: ({ id, status, rejectionReason }) => ({
        url: `/products/admin/${id}/approval`,
        method: "PATCH",
        body: { status, rejectionReason },
      }),
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Products" as const, id: "LIST" },
        { type: "Product" as const, id },
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<{ message: string }, string | number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: [{ type: "Products" as const, id: "LIST" }],
    }),

    // Autocomplete live search
    getAutocompleteSuggestions: builder.query<
      IAutocompleteSuggestionsResponse,
      string
    >({
      query: (q) => `/products/search/autocomplete?q=${encodeURIComponent(q)}`,
      transformResponse: (res: IApiResponse<IAutocompleteSuggestionsResponse>) => res.data,
    }),

    // Product bundle / Frequently Bought Together
    getProductBundle: builder.query<
      IProductBundleResponse,
      string
    >({
      query: (id) => `/products/${id}/bundle`,
      transformResponse: (res: IApiResponse<IProductBundleResponse>) => res.data,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetAdminProductsQuery,
  useGetSellerProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useReviewProductApprovalMutation,
  useDeleteProductMutation,
  useGetAutocompleteSuggestionsQuery,
  useLazyGetAutocompleteSuggestionsQuery,
  useGetProductBundleQuery,
  useLazyGetProductBundleQuery,
} = productApiSlice;
