export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface IOrderItem {
  id: string;
  orderId: string;
  subOrderId: string | null;
  productId: string;
  productSlug: string | null;
  variantId: string | null;
  sellerId: string | null;
  productName: string;
  variantTitle: string | null;
  productImage: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  totalPrice: number;
  unitPrice?: number;
  product?: {
    name?: string;
    mainImage?: string | null;
  } | null;
  variant?: {
    title?: string;
    sku?: string;
  } | null;
}

export interface ISubOrder {
  id: string;
  subOrderNumber: string;
  orderId: string;
  sellerId: string | null;
  isPlatformOwned: boolean;
  subtotal: number;
  shippingFee: number;
  shippingCost?: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  sellerEarnings: number;
  isPayoutSettled: boolean;
  escrowStatus?: string;
  escrowHoldUntil?: string | null;
  status: OrderStatus;
  trackingNumber: string | null;
  courierName: string | null;
  consignmentId?: string | null;
  createdAt: string;
  updatedAt: string;
  store: { id: string; storeName: string; storeSlug: string; phone?: string | null } | null;
  items: IOrderItem[];
  order?: {
    id?: string;
    orderNumber?: string;
    shippingAddress?: IOrderAddress | null;
    [key: string]: unknown;
  } | null;
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
  id: string;
  orderNumber: string;
  userId: string | null;
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
  customer?: { id: string; name: string; email: string; phone: string | null } | null;
}
