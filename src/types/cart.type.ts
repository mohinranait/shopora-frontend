import type { ISplitShippingPackage } from "./logistics.type";

export interface ICartItem {
  id: string | number;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    mainImage: string;
    basePrice: number;
    stock: number;
    isPlatformOwned: boolean;
    isFreeShipping?: boolean;
  } | null;
  variant: {
    id: string;
    title: string;
    sku: string;
    price: number;
    stock: number;
    image?: string | null;
    attributes?: Record<string, string> | null;
  } | null;
  seller: {
    id: string;
    storeName: string;
    storeSlug: string;
    storeLogo?: string | null;
    isVerified?: boolean;
  } | null;
  unitPrice: number;
  comparePrice: number | null;
  itemTotal: number;
  inStock: boolean;
  isAvailable: boolean;
  maxAvailableStock: number;
}

export interface ICart {
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
}

export interface IOrderQuote {
  subtotal: number;
  savings: number;
  discount: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  freeShippingThreshold: number;
  coupon: { code: string; discountType: string; discountValue: number } | null;
  couponMessage: string | null;
  issues: { productId: string | number; variantId: string | number | null; message: string }[];
  itemCount: number;
  /** Payment methods currently enabled for checkout */
  paymentMethods?: string[];
  packages?: ISplitShippingPackage[];
}

export interface ICheckoutAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export type PaymentMethod = "COD" | "BKASH" | "NAGAD";

export interface ICheckoutPayload {
  items: { productId: string | number; variantId: string | number | null; quantity: number }[];
  shippingAddress: ICheckoutAddress;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface IPlacedOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  paymentMethod: string;
  createdAt: string;
}
