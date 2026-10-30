import { baseApi } from "./baseApi";
import {
  ICategory,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
  IApiResponse,
} from "@/types";

export const categoryApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ICategory[], void>({
      query: () => "/categories",
      transformResponse: (res: IApiResponse<ICategory[]>) =>
        Array.isArray(res.data) ? res.data : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Categories" as const, id })),
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    getCategoryTree: builder.query<ICategory[], void>({
      query: () => "/categories/tree",
      transformResponse: (res: IApiResponse<ICategory[]>) =>
        Array.isArray(res.data) ? res.data : [],
      providesTags: ["CategoryTree"],
    }),

    getCategoryById: builder.query<ICategory, string | number>({
      query: (id) => `/categories/${id}`,
      transformResponse: (res: IApiResponse<ICategory>) => res.data,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    createCategory: builder.mutation<ICategory, ICreateCategoryPayload>({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<ICategory>) => res.data,
      invalidatesTags: ["Categories", "CategoryTree"],
    }),

    updateCategory: builder.mutation<
      ICategory,
      { id: string | number; body: IUpdateCategoryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<ICategory>) => res.data,
      invalidatesTags: (result, error, { id }) => [
        "Categories",
        "CategoryTree",
        { type: "Category", id },
      ],
    }),

    deleteCategory: builder.mutation<{ message: string; id: string | number }, string | number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string; id: number }>) => res.data,
      invalidatesTags: ["Categories", "CategoryTree"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
