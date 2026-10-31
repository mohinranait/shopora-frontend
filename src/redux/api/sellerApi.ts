import { baseApi } from "./baseApi";
import type {
  IApiResponse,
  ISeller,
  IReviewSellerPayload,
  ISellerDetailResponse,
  ISellerDashboardOverview,
  ISellerEscrowHoldings,
  ISubOrder,
} from "@/types";

export interface IUpdateSellerProfilePayload {
  storeName?: string;
  storeSlug?: string;
  phone?: string;
  businessAddress?: string;
  bankAccountDetails?: string;
  storeBanner?: string | null;
  storeLogo?: string | null;
  isHolidayMode?: boolean;
  holidayMessage?: string | null;
}

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
      { id: string | number; data: IReviewSellerPayload }
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
      { id: string | number; title: string; message: string }
    >({
      query: ({ id, title, message }) => ({
        url: `/sellers/admin/${id}/notice`,
        method: "POST",
        body: { title, message },
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: ["Notifications"],
    }),

    // Authenticated Seller Endpoints
    getSellerDashboardStats: builder.query<ISellerDashboardOverview, void>({
      query: () => "/sellers/me/dashboard",
      transformResponse: (res: IApiResponse<ISellerDashboardOverview>) => res.data,
      providesTags: ["Seller", "Orders"],
    }),

    updateSellerProfile: builder.mutation<ISeller, IUpdateSellerProfilePayload>({
      query: (body) => ({
        url: "/sellers/me/profile",
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<ISeller>) => res.data,
      invalidatesTags: ["Seller"],
    }),

    getSellerSubOrders: builder.query<
      { orders: ISubOrder[]; meta?: any },
      Record<string, string | number | undefined> | void
    >({
      query: (params) => {
        const query = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== "") query.append(k, String(v));
          });
        }
        return `/orders/seller/my-suborders?${query.toString()}`;
      },
      transformResponse: (res: IApiResponse<ISubOrder[]>) => ({
        orders: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      }),
      providesTags: ["Orders"],
    }),

    getSellerSubOrderById: builder.query<ISubOrder, string>({
      query: (id) => `/orders/seller/my-suborders/${id}`,
      transformResponse: (res: IApiResponse<ISubOrder>) => res.data,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    getSellerEscrowHoldings: builder.query<ISellerEscrowHoldings, void>({
      query: () => "/orders/seller/my-escrow",
      transformResponse: (res: IApiResponse<ISellerEscrowHoldings>) => res.data,
      providesTags: ["Escrow", "Orders"],
    }),

    releaseEscrowEarly: builder.mutation<IApiResponse<any>, string>({
      query: (subOrderId) => ({
        url: `/orders/suborders/${subOrderId}/release-escrow`,
        method: "POST",
      }),
      invalidatesTags: ["Escrow", "Orders", "Seller"],
    }),

    releaseMaturedEscrow: builder.mutation<IApiResponse<any>, void>({
      query: () => ({
        url: "/orders/escrow/release-matured",
        method: "POST",
      }),
      invalidatesTags: ["Escrow", "Orders", "Seller"],
    }),

    getOrderInvoice: builder.query<any, string>({
      query: (id) => `/orders/${id}/invoice`,
      transformResponse: (res: IApiResponse<any>) => res.data,
    }),
  }),
});

export const {
  useGetAdminSellersQuery,
  useGetAdminSellerDetailsQuery,
  useReviewSellerApplicationMutation,
  useSendAdminSellerNoticeMutation,
  useGetSellerDashboardStatsQuery,
  useUpdateSellerProfileMutation,
  useGetSellerSubOrdersQuery,
  useGetSellerSubOrderByIdQuery,
  useGetSellerEscrowHoldingsQuery,
  useReleaseEscrowEarlyMutation,
  useReleaseMaturedEscrowMutation,
  useGetOrderInvoiceQuery,
  useLazyGetOrderInvoiceQuery,
} = sellerApiSlice;
