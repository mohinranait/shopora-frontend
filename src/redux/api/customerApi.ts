import { baseApi } from "./baseApi";
import type {
  IApiResponse,
  ICustomerDetail,
  ICustomerFilters,
  ICustomerItem,
  ICustomerListResponse,
} from "@/types";

export const customerApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCustomers: builder.query<ICustomerListResponse, ICustomerFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.role !== undefined && filters.role !== "") params.set("role", filters.role);
        if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
        if (filters.isVerified !== undefined) params.set("isVerified", String(filters.isVerified));
        if (filters.search !== undefined && filters.search.trim() !== "") params.set("search", filters.search.trim());
        if (filters.page) params.set("page", String(filters.page));
        if (filters.limit) params.set("limit", String(filters.limit));
        return `/users/admin/all?${params.toString()}`;
      },
      transformResponse: (
        res: IApiResponse<ICustomerItem[]> & { meta: ICustomerListResponse["meta"] }
      ) => ({
        users: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map((c) => ({ type: "Customer" as const, id: c.id })),
              { type: "Customers", id: "LIST" },
            ]
          : [{ type: "Customers", id: "LIST" }],
    }),

    getAdminCustomer: builder.query<ICustomerDetail, string | number>({
      query: (id) => `/users/admin/${id}`,
      transformResponse: (res: IApiResponse<ICustomerDetail>) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Customer", id }],
    }),

    updateAdminCustomer: builder.mutation<
      ICustomerItem,
      {
        id: string | number;
        name?: string;
        email?: string;
        phone?: string | null;
        isActive?: boolean;
        isVerified?: boolean;
        role?: "CUSTOMER" | "SELLER" | "ADMIN";
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/admin/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<ICustomerItem>) => res.data,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Customer", id },
        { type: "Customers", id: "LIST" },
      ],
    }),

    toggleCustomerStatus: builder.mutation<unknown, { id: string | number; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/users/admin/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Customer", id },
        { type: "Customers", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminCustomersQuery,
  useGetAdminCustomerQuery,
  useUpdateAdminCustomerMutation,
  useToggleCustomerStatusMutation,
} = customerApiSlice;
