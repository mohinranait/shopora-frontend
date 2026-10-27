import { baseApi } from "./baseApi";
import type {
  IApiResponse,
  ISeller,
  IReviewSellerPayload,
} from "@/types";

export const sellerApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSellers: builder.query<ISeller[], string | void>({
      query: (status) => ({
        url: status && status !== "ALL" ? `/sellers/admin/all?status=${status}` : "/sellers/admin/all",
      }),
      transformResponse: (res: IApiResponse<ISeller[]>) => res.data,
      providesTags: ["Sellers"],
    }),

    reviewSellerApplication: builder.mutation<
      ISeller,
      { id: number; data: IReviewSellerPayload }
    >({
      query: ({ id, data }) => ({
        url: `/sellers/admin/${id}/review`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (res: IApiResponse<ISeller>) => res.data,
      invalidatesTags: ["Sellers", "Seller"],
    }),
  }),
});

export const {
  useGetAdminSellersQuery,
  useReviewSellerApplicationMutation,
} = sellerApiSlice;
