export type NotificationType =
  | "ORDER"
  | "ORDER_STATUS"
  | "PAYOUT"
  | "PRODUCT_APPROVAL"
  | "KYC"
  | "LOW_STOCK"
  | "SYSTEM";

export interface INotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType | string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface INotificationMeta {
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface INotificationsResponse {
  notifications: INotification[];
  meta: INotificationMeta;
}
