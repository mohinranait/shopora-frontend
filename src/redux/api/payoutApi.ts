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
      { id: number; data: IProcessPayoutPayload }
    >({
      query: ({ id, data }) => ({
        url: `/payouts/admin/${id}/process`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (res: IApiResponse<IPayoutRequest>) => res.data,
      invalidatesTags: ["Payouts", "Payout", "Sellers"],
    }),
  }),
});

export const {
  useGetAdminPayoutsQuery,
  useProcessPayoutMutation,
} = payoutApiSlice;
