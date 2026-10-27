import { baseApi } from "./baseApi";
import type { IApiResponse, IWebsiteSettings } from "@/types";

export const settingsApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWebsiteSettings: builder.query<IWebsiteSettings, void>({
      query: () => "/settings",
      transformResponse: (res: IApiResponse<IWebsiteSettings>) => res.data,
      providesTags: ["Settings"],
    }),

    updateWebsiteSettings: builder.mutation<IWebsiteSettings, Partial<IWebsiteSettings>>({
      query: (body) => ({
        url: "/settings",
        method: "PATCH",
        body,
      }),
      transformResponse: (res: IApiResponse<IWebsiteSettings>) => res.data,
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
} = settingsApiSlice;
