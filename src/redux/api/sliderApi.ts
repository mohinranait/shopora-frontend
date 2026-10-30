import { baseApi } from "./baseApi";
import {
  ISliderItem,
  ICreateSliderPayload,
  IUpdateSliderPayload,
  IApiResponse,
} from "@/types";

export const sliderApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSliders: builder.query<ISliderItem[], boolean | void>({
      query: (includeInactive = false) => `/sliders?includeInactive=${includeInactive}`,
      transformResponse: (res: IApiResponse<ISliderItem[]>) =>
        Array.isArray(res.data) ? res.data : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Sliders" as const, id })),
              { type: "Sliders", id: "LIST" },
            ]
          : [{ type: "Sliders", id: "LIST" }],
    }),

    getSliderById: builder.query<ISliderItem, string | number>({
      query: (id) => `/sliders/${id}`,
      transformResponse: (res: IApiResponse<ISliderItem>) => res.data,
      providesTags: (_result, _error, id) => [{ type: "Slider", id }],
    }),

    createSlider: builder.mutation<ISliderItem, ICreateSliderPayload>({
      query: (body) => ({
        url: "/sliders",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<ISliderItem>) => res.data,
      invalidatesTags: [{ type: "Sliders", id: "LIST" }],
    }),

    updateSlider: builder.mutation<
      ISliderItem,
      { id: string | number; body: IUpdateSliderPayload }
    >({
      query: ({ id, body }) => ({
        url: `/sliders/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<ISliderItem>) => res.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Sliders", id: "LIST" },
        { type: "Slider", id },
      ],
    }),

    deleteSlider: builder.mutation<{ message: string }, string | number>({
      query: (id) => ({
        url: `/sliders/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string }>) => res.data,
      invalidatesTags: [{ type: "Sliders", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSlidersQuery,
  useGetSliderByIdQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useDeleteSliderMutation,
} = sliderApiSlice;
