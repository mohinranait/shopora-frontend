export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface IOrderItem {
  id: number;
  orderId: number;
  subOrderId: number | null;
  productId: number;
  productSlug: string | null;
  variantId: number | null;
  sellerId: number | null;
  productName: string;
  variantTitle: string | null;
  productImage: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface ISubOrder {
  id: number;
  subOrderNumber: string;
  orderId: number;
  sellerId: number | null;
  isPlatformOwned: boolean;
  subtotal: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  sellerEarnings: number;
  isPayoutSettled: boolean;
  status: OrderStatus;
  trackingNumber: string | null;
  courierName: string | null;
  createdAt: string;
  updatedAt: string;
  store: { id: number; storeName: string; storeSlug: string; phone?: string | null } | null;
  items: IOrderItem[];
}

export interface IOrderAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IOrder {
  id: number;
  orderNumber: string;
  userId: number | null;
  guestEmail: string | null;
  guestPhone: string | null;
  shippingAddress: IOrderAddress;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  payableAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentTransactionId: string | null;
  orderStatus: OrderStatus;
  couponCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: IOrderItem[];
  subOrders: ISubOrder[];
  itemCount: number;
  canCancel: boolean;
  customer?: { id: number; name: string; email: string; phone: string | null } | null;
}
