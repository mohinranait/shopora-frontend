import { baseApi } from "./baseApi";
import type {
  IApiResponse,
  ISeller,
  IReviewSellerPayload,
  ISellerDetailResponse,
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

    getAdminSellerDetails: builder.query<ISellerDetailResponse, number | string>({
      query: (id) => ({
        url: `/sellers/admin/${id}`,
      }),
      transformResponse: (res: IApiResponse<ISellerDetailResponse>) => res.data,
      providesTags: (_result, _error, id) => [{ type: "Seller", id }, "Seller"],
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

    sendAdminSellerNotice: builder.mutation<
      { message: string },
      { id: number; title: string; message: string }
    >({
      query: ({ id, title, message }) => ({
        url: `/sellers/admin/${id}/notice`,
        method: "POST",
        body: { title, message },
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetAdminSellersQuery,
  useGetAdminSellerDetailsQuery,
  useReviewSellerApplicationMutation,
  useSendAdminSellerNoticeMutation,
} = sellerApiSlice;
