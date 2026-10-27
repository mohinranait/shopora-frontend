import { IPaginationMeta } from "./common.type";

export interface ICustomerAddress {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
  type: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ICustomerItem {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  addresses: ICustomerAddress[];
  defaultAddress: ICustomerAddress | null;
}

export interface ICustomerOrderSummary {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
}

export interface ICustomerReviewSummary {
  id: number;
  productId: number;
  rating: number;
  title?: string | null;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    mainImage?: string | null;
  } | null;
}

export interface ICustomerDetail {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  addresses: ICustomerAddress[];
  orders: ICustomerOrderSummary[];
  reviews: ICustomerReviewSummary[];
  stats: {
    totalOrders: number;
    totalSpent: number;
    deliveredOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
  };
}

export interface ICustomerFilters {
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ICustomerListResponse {
  users: ICustomerItem[];
  meta: IPaginationMeta & {
    counts?: {
      totalCustomers: number;
      activeCustomers: number;
      verifiedCustomers: number;
    };
  };
}
