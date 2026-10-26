import { baseApi } from "./baseApi";
import {
  IBrand,
  ICreateBrandPayload,
  IUpdateBrandPayload,
  IApiResponse,
} from "@/types";

export const brandApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<IBrand[], boolean | void>({
      query: (includeInactive = true) => `/brands?includeInactive=${includeInactive}`,
      transformResponse: (res: IApiResponse<IBrand[]>) =>
        Array.isArray(res.data) ? res.data : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Brands" as const, id })),
              { type: "Brands", id: "LIST" },
            ]
          : [{ type: "Brands", id: "LIST" }],
    }),

    getBrandById: builder.query<IBrand, number>({
      query: (id) => `/brands/${id}`,
      transformResponse: (res: IApiResponse<IBrand>) => res.data,
      providesTags: (result, error, id) => [{ type: "Brand", id }],
    }),

    createBrand: builder.mutation<IBrand, ICreateBrandPayload>({
      query: (body) => ({
        url: "/brands",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IBrand>) => res.data,
      invalidatesTags: [{ type: "Brands", id: "LIST" }],
    }),

    updateBrand: builder.mutation<
      IBrand,
      { id: number; body: IUpdateBrandPayload }
    >({
      query: ({ id, body }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<IBrand>) => res.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Brands", id: "LIST" },
        { type: "Brand", id },
      ],
    }),

    deleteBrand: builder.mutation<{ message: string; id: number }, number>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string; id: number }>) => res.data,
      invalidatesTags: [{ type: "Brands", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApiSlice;
