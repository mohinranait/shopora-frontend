import { baseApi } from "./baseApi";
import {
  IBrand,
  ICreateBrandPayload,
  IUpdateBrandPayload,
  IBrandListResponse,
  IApiResponse,
} from "@/types";

export const brandApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<
      IBrandListResponse,
      Record<string, string | number | boolean | undefined> | boolean | void
    >({
      query: (params = true) => {
        const query = new URLSearchParams();
        if (typeof params === "boolean") {
          query.set("includeInactive", String(params));
        } else if (params && typeof params === "object") {
          Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== "") {
              query.append(key, String(val));
            }
          });
        }
        return `/brands?${query.toString()}`;
      },
      transformResponse: (res: IApiResponse<IBrand[]>) => ({
        brands: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.brands.map(({ id }) => ({ type: "Brands" as const, id })),
              { type: "Brands" as const, id: "LIST" },
            ]
          : [{ type: "Brands" as const, id: "LIST" }],
    }),

    getBrandById: builder.query<IBrand, string | number>({
      query: (id) => `/brands/${id}`,
      transformResponse: (res: IApiResponse<IBrand>) => res.data,
      providesTags: (result, error, id) => [{ type: "Brand" as const, id }],
    }),

    createBrand: builder.mutation<IBrand, ICreateBrandPayload>({
      query: (body) => ({
        url: "/brands",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IBrand>) => res.data,
      invalidatesTags: [{ type: "Brands" as const, id: "LIST" }],
    }),

    updateBrand: builder.mutation<
      IBrand,
      { id: string | number; body: IUpdateBrandPayload }
    >({
      query: ({ id, body }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<IBrand>) => res.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Brands" as const, id: "LIST" },
        { type: "Brand" as const, id },
      ],
    }),

    deleteBrand: builder.mutation<{ message: string; id: string | number }, string | number>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string; id: number }>) => res.data,
      invalidatesTags: [{ type: "Brands" as const, id: "LIST" }],
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
