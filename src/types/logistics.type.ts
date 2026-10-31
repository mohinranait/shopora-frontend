export interface ISplitShippingPackage {
  packageNumber?: number;
  sellerId?: string | null;
  vendorId?: string | null;
  storeName?: string;
  isPlatform?: boolean;
  isPlatformOwned?: boolean;
  itemCount: number;
  subtotal?: number;
  packageSubtotal?: number;
  shippingFee?: number;
  packageShippingFee?: number;
  isFreeShipping: boolean;
  deliveryScope?: string;
  estimatedDelivery?: string;
}

export interface ICourierTrackingEvent {
  title: string;
  description: string;
  time: string | null;
  completed: boolean;
}

export interface ITrackingResult {
  trackingNumber: string;
  consignmentId: string;
  courierName: string;
  currentStatus: string;
  subOrderNumber: string;
  orderNumber?: string;
  shippingAddress: Record<string, unknown> | null;
  itemCount: number;
  items: Array<{
    name: string;
    variantTitle?: string | null;
    quantity: number;
    price: number;
  }>;
  timeline: ICourierTrackingEvent[];
}

export type ICourierTrackingData = ITrackingResult;

export interface IBookCourierPayload {
  provider?: string;
  packageWeightKg?: number;
  specialInstructions?: string;
}

export interface IBookCourierResult {
  consignmentId: string;
  trackingCode: string;
  courierName: string;
  subOrderId: string;
  status: string;
}

export interface IThermalPackagingSlipItem {
  name: string;
  quantity: number;
  price: number;
  variantSku?: string | null;
}

export interface IThermalPackagingSlip {
  slipType: string;
  orderNumber: string;
  subOrderNumber: string;
  storeName: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  financials: {
    codAmount: number;
    shippingFee: number;
    itemsTotal: number;
  };
  courier: {
    name: string;
    consignmentId: string;
    trackingCode: string;
  };
  items: IThermalPackagingSlipItem[];
}

export type IPackagingSlipData = IThermalPackagingSlip;
