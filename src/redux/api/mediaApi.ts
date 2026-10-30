import { baseApi } from "./baseApi";
import {
  IMediaItem,
  IUseMediaItem,
  ICreateUseMediaPayload,
  IApiResponse,
  IPaginationMeta,
} from "@/types";

export interface IMediaLibraryResponse {
  items: IMediaItem[];
  meta?: IPaginationMeta;
}

export const mediaApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMediaLibrary: builder.query<
      IMediaLibraryResponse,
      { page?: number; limit?: number; folder?: string } | void
    >({
      query: (arg) => {
        const page = arg?.page || 1;
        const limit = arg?.limit || 50;
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (arg?.folder) params.append("folder", arg.folder);
        return `/media?${params.toString()}`;
      },
      transformResponse: (res: IApiResponse<IMediaItem[]>) => ({
        items: Array.isArray(res.data) ? res.data : [res.data],
        meta: res.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Media" as const, id })),
              { type: "Media", id: "LIST" },
            ]
          : [{ type: "Media", id: "LIST" }],
    }),

    uploadFile: builder.mutation<IMediaItem, FormData>({
      query: (formData) => ({
        url: "/media/upload",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: IApiResponse<IMediaItem>) => res.data,
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),

    createUseMedia: builder.mutation<IUseMediaItem, ICreateUseMediaPayload>({
      query: (body) => ({
        url: "/media/use-media",
        method: "POST",
        body,
      }),
      transformResponse: (res: IApiResponse<IUseMediaItem>) => res.data,
    }),

    deleteMedia: builder.mutation<{ message: string; id: string | number }, string | number>({
      query: (id) => ({
        url: `/media/${id}`,
        method: "DELETE",
      }),
      transformResponse: (res: IApiResponse<{ message: string; id: number }>) => res.data,
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMediaLibraryQuery,
  useUploadFileMutation,
  useCreateUseMediaMutation,
  useDeleteMediaMutation,
} = mediaApiSlice;
