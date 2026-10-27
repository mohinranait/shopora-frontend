import { baseApi } from "./baseApi";
import type { IApiResponse, IOrder, IPaginationMeta, OrderStatus, PaymentStatus } from "@/types";

export interface IAdminOrderFilters {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IAdminOrderList {
  orders: IOrder[];
  meta: IPaginationMeta & { counts?: Record<string, number>; revenue?: number };
}

export const orderApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOrders: builder.query<IAdminOrderList, IAdminOrderFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== "") params.set(k, String(v));
        });
        return `/orders/admin/all?${params.toString()}`;
      },
      transformResponse: (res: IApiResponse<IOrder[]> & { meta: IAdminOrderList["meta"] }) => ({
        orders: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [...result.orders.map((o) => ({ type: "Order" as const, id: o.id })), { type: "Orders", id: "LIST" }]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getAdminOrder: builder.query<IOrder, number>({
      query: (id) => `/orders/admin/${id}`,
      transformResponse: (res: IApiResponse<IOrder>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    updateAdminOrderStatus: builder.mutation<IOrder, { id: number; status: OrderStatus; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/admin/${id}/status`, method: "PATCH", body }),
      transformResponse: (res: IApiResponse<IOrder>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }, { type: "Orders", id: "LIST" }],
    }),

    updateSubOrderStatus: builder.mutation<
      unknown,
      { orderId: number; subOrderId: number; status: OrderStatus; trackingNumber?: string; courierName?: string }
    >({
      query: ({ subOrderId, status, trackingNumber, courierName }) => ({
        url: `/orders/seller/suborder/${subOrderId}/status`,
        method: "PATCH",
        body: { status, trackingNumber, courierName },
      }),
      invalidatesTags: (_r, _e, { orderId }) => [{ type: "Order", id: orderId }, { type: "Orders", id: "LIST" }],
    }),

    updatePaymentStatus: builder.mutation<unknown, { id: number; paymentStatus: PaymentStatus; transactionId?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/admin/${id}/payment`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Order", id }, { type: "Orders", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAdminOrdersQuery,
  useGetAdminOrderQuery,
  useUpdateAdminOrderStatusMutation,
  useUpdateSubOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} = orderApiSlice;
