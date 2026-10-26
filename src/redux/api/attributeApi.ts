import { baseApi } from "./baseApi";
import {
  IAttribute,
  IAttributeValue,
  ICreateAttributePayload,
  IUpdateAttributePayload,
  ICreateAttributeValuePayload,
  IUpdateAttributeValuePayload,
  IGenerateCombinationsPayload,
  IGenerateCombinationsResponse,
  IApiResponse,
} from "@/types";

export const attributeApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttributes: builder.query<IAttribute[], boolean | void>({
      query: (includeInactive = true) => `/attributes?includeInactive=${includeInactive}`,
      transformResponse: (res: IApiResponse<IAttribute[]>) =>
        Array.isArray(res.data) ? res.data : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Attributes" as const, id })),
              { type: "Attributes", id: "LIST" },
            ]
          : [{ type: "Attributes", id: "LIST" }],
    }),

    getAttributeById: builder.query<IAttribute, number>({
      query: (id) => `/attributes/${id}`,
      transformResponse: (res: IApiResponse<IAttribute>) => res.data,
      providesTags: (result, error, id) => [{ type: "Attribute", id }],
    }),

    createAttribute: builder.mutation<IAttribute, ICreateAttributePayload>({
      query: (body) => ({
        url: "/attributes",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IAttribute>) => res.data,
      invalidatesTags: [{ type: "Attributes", id: "LIST" }],
    }),

    updateAttribute: builder.mutation<
      IAttribute,
      { id: number; body: IUpdateAttributePayload }
    >({
      query: ({ id, body }) => ({
        url: `/attributes/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<IAttribute>) => res.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Attributes", id: "LIST" },
        { type: "Attribute", id },
      ],
    }),

    deleteAttribute: builder.mutation<{ message: string; id: number }, number>({
      query: (id) => ({
        url: `/attributes/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string; id: number }>) => res.data,
      invalidatesTags: [{ type: "Attributes", id: "LIST" }],
    }),

    createAttributeValue: builder.mutation<
      IAttributeValue,
      { attributeId: number; body: ICreateAttributeValuePayload }
    >({
      query: ({ attributeId, body }) => ({
        url: `/attributes/${attributeId}/values`,
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IAttributeValue>) => res.data,
      invalidatesTags: (result, error, { attributeId }) => [
        { type: "Attributes", id: "LIST" },
        { type: "Attribute", id: attributeId },
      ],
    }),

    updateAttributeValue: builder.mutation<
      IAttributeValue,
      { valueId: number; body: IUpdateAttributeValuePayload }
    >({
      query: ({ valueId, body }) => ({
        url: `/attributes/values/${valueId}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<IAttributeValue>) => res.data,
      invalidatesTags: [{ type: "Attributes", id: "LIST" }],
    }),

    deleteAttributeValue: builder.mutation<
      { message: string; valueId: number },
      number
    >({
      query: (valueId) => ({
        url: `/attributes/values/${valueId}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string; valueId: number }>) =>
        res.data,
      invalidatesTags: [{ type: "Attributes", id: "LIST" }],
    }),

    generateCombinations: builder.mutation<
      IGenerateCombinationsResponse,
      IGenerateCombinationsPayload
    >({
      query: (body) => ({
        url: "/attributes/generate-combinations",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IGenerateCombinationsResponse>) => res.data,
    }),
  }),
});

export const {
  useGetAttributesQuery,
  useGetAttributeByIdQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
  useGenerateCombinationsMutation,
} = attributeApiSlice;
