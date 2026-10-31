import { baseApi } from "./baseApi";
import type { IApiResponse } from "@/types/common.type";
import type {
  ITrackingResult,
  IBookCourierPayload,
  IBookCourierResult,
  IThermalPackagingSlip,
} from "@/types/logistics.type";

export const logisticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    trackParcel: builder.query<IApiResponse<ITrackingResult>, string>({
      query: (trackingCode) => `/logistics/track/${trackingCode}`,
      providesTags: (_result, _error, code) => [{ type: "Logistics", id: code }],
    }),

    bookCourier: builder.mutation<
      IApiResponse<IBookCourierResult>,
      { subOrderId: string; body?: IBookCourierPayload }
    >({
      query: ({ subOrderId, body }) => ({
        url: `/logistics/suborders/${subOrderId}/book-courier`,
        method: "POST",
        body: body || {},
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Orders", id: "LIST" },
        { type: "Order", id: arg.subOrderId },
        { type: "Logistics", id: "LIST" },
      ],
    }),

    getPackagingSlip: builder.query<IApiResponse<IThermalPackagingSlip>, string>({
      query: (subOrderId) => `/logistics/suborders/${subOrderId}/packaging-slip`,
    }),
  }),
  overrideExisting: false,
});

export const {
  useTrackParcelQuery,
  useBookCourierMutation,
  useGetPackagingSlipQuery,
  useLazyGetPackagingSlipQuery,
} = logisticsApi;
