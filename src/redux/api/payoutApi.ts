import { baseApi } from "./baseApi";
import type {
  IApiResponse,
  IPayoutRequest,
  IProcessPayoutPayload,
} from "@/types";

export const payoutApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPayouts: builder.query<IPayoutRequest[], string | void>({
      query: (status) => ({
        url: status && status !== "ALL" ? `/payouts/admin/all?status=${status}` : "/payouts/admin/all",
      }),
      transformResponse: (res: IApiResponse<IPayoutRequest[]>) => res.data,
      providesTags: ["Payouts"],
    }),

    processPayout: builder.mutation<
      IPayoutRequest,
      { id: string | number; data: IProcessPayoutPayload }
    >({
      query: ({ id, data }) => ({
        url: `/payouts/admin/${id}/process`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (res: IApiResponse<IPayoutRequest>) => res.data,
      invalidatesTags: ["Payouts", "Payout", "Sellers"],
    }),

    getSellerWallet: builder.query<{ wallet: any; payouts: IPayoutRequest[] }, void>({
      query: () => "/payouts/wallet",
      transformResponse: (res: IApiResponse<{ wallet: any; payouts: IPayoutRequest[] }>) => res.data,
      providesTags: ["Payouts", "Seller"],
    }),

    requestPayout: builder.mutation<
      IPayoutRequest,
      { amount: number; paymentMethod: string; accountDetails?: string }
    >({
      query: (body) => ({
        url: "/payouts/request",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IPayoutRequest>) => res.data,
      invalidatesTags: ["Payouts", "Seller"],
    }),
  }),
});

export const {
  useGetAdminPayoutsQuery,
  useProcessPayoutMutation,
  useGetSellerWalletQuery,
  useRequestPayoutMutation,
} = payoutApiSlice;
