import { baseApi } from "./baseApi";
import { IReviewItem, ICreateReviewPayload, IApiResponse } from "@/types";

export const reviewApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all approved reviews for a product
    getProductReviews: builder.query<IReviewItem[], number>({
      query: (productId) => `/reviews/product/${productId}`,
      transformResponse: (res: IApiResponse<IReviewItem[]>) =>
        Array.isArray(res.data) ? res.data : [],
      providesTags: (result, error, productId) => [
        { type: "Reviews" as const, id: productId },
      ],
    }),

    // Submit a new review for a product
    createReview: builder.mutation<IReviewItem, ICreateReviewPayload>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IReviewItem>) => res.data,
      invalidatesTags: (result, error, { productId }) => [
        { type: "Reviews", id: productId },
        { type: "Product", id: productId },
        { type: "Products", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetProductReviewsQuery, useCreateReviewMutation } =
  reviewApiSlice;
