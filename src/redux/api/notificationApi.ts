import { baseApi } from "./baseApi";
import { INotification, INotificationMeta } from "@/types";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      { notifications: INotification[]; meta: INotificationMeta },
      { page?: number; limit?: number; isRead?: boolean; type?: string } | void
    >({
      query: (params) => ({
        url: "/notifications",
        params: params || {},
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        meta: INotificationMeta;
        data: INotification[];
      }) => ({
        notifications: response.data || [],
        meta: response.meta,
      }),
      providesTags: ["Notifications"],
    }),

    getUnreadNotificationCount: builder.query<{ unreadCount: number }, void>({
      query: () => "/notifications/unread-count",
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { unreadCount: number };
      }) => response.data,
      providesTags: ["NotificationCount"],
    }),

    markNotificationAsRead: builder.mutation<
      { id: number; isRead: boolean },
      number
    >({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "NotificationCount"],
    }),

    markAllNotificationsAsRead: builder.mutation<{ markedCount: number }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "NotificationCount"],
    }),

    deleteNotification: builder.mutation<
      { id: number; deleted: boolean },
      number
    >({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "NotificationCount"],
    }),

    clearReadNotifications: builder.mutation<{ clearedCount: number }, void>({
      query: () => ({
        url: "/notifications/clear-read",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "NotificationCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearReadNotificationsMutation,
} = notificationApi;
