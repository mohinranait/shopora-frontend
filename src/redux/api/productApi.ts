import { baseApi } from "./baseApi";
import {
  IProductItem,
  ICreateProductPayload,
  IUpdateProductPayload,
  IProductListResponse,
  IApiResponse,
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
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),

    // Get single product by ID
    getProductById: builder.query<IProductItem, string | number>({
      query: (id) => `/products/${id}`,
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Get single product by slug (storefront)
    getProductBySlug: builder.query<IProductItem, string>({
      query: (slug) => `/products/detail/${slug}`,
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      providesTags: (result, error, slug) => [{ type: "Product", id: slug }],
    }),

    // Create a new product (Simple or Variable)
    createProduct: builder.mutation<IProductItem, ICreateProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IProductItem>) => res.data,
      invalidatesTags: [{ type: "Products", id: "LIST" }],
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
        { type: "Products", id: "LIST" },
        { type: "Product", id },
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
        { type: "Products", id: "LIST" },
        { type: "Product", id },
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<{ message: string }, string | number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    // Autocomplete live search
    getAutocompleteSuggestions: builder.query<
      {
        products: Array<{
          id: string;
          name: string;
          slug: string;
          basePrice: number;
          comparePrice?: number | null;
          mainImage?: string | null;
        }>;
        categories: Array<{ id: string; name: string; slug: string; image?: string | null }>;
        brands: Array<{ id: string; name: string; slug: string; logo?: string | null }>;
      },
      string
    >({
      query: (q) => `/products/search/autocomplete?q=${encodeURIComponent(q)}`,
      transformResponse: (res: IApiResponse<any>) => res.data,
    }),

    // Product bundle / Frequently Bought Together
    getProductBundle: builder.query<
      {
        mainProduct: IProductItem;
        companionProducts: IProductItem[];
        bundleDiscountPercent: number;
        originalTotal: number;
        bundleTotal: number;
        totalSavings: number;
      },
      string
    >({
      query: (id) => `/products/${id}/bundle`,
      transformResponse: (res: IApiResponse<any>) => res.data,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useReviewProductApprovalMutation,
  useDeleteProductMutation,
  useGetAutocompleteSuggestionsQuery,
  useLazyGetAutocompleteSuggestionsQuery,
  useGetProductBundleQuery,
} = productApiSlice;
