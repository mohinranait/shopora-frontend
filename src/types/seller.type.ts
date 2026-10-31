export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface ISellerWallet {
  id: string;
  sellerId: string;
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalEarnings: number;
  totalCommissionPaid: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISeller {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
  logoId?: string | null;
  bannerId?: string | null;
  storeDescription: string | null;
  phone: string;
  businessAddress: string;
  taxNumber: string | null;
  nidOrTradeLicense: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankRouting: string | null;
  bkashOrNagad: string | null;
  bankAccountDetails?: string | null;
  commissionRate: number;
  status: SellerStatus;
  rejectionReason: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  isHolidayMode?: boolean;
  holidayMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
  userName?: string;
  wallet?: ISellerWallet | null;
  productCount?: number;
}

export interface IReviewSellerPayload {
  status: SellerStatus;
  rejectionReason?: string;
  commissionRate?: number;
  isVerified?: boolean;
}

export interface ISellerPerformance {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  outOfStockProducts: number;
  avgRating: number;
  totalReviews: number;
  totalOrders: number;
  deliveredOrders: number;
  processingOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  fulfillmentRate: number;
  cancellationRate: number;
  returnRate: number;
  grossSales: number;
  netEarnings: number;
  platformCommission: number;
  healthScore: number;
  reputation: "EXCELLENT" | "GOOD" | "AVERAGE" | "RISKY" | "CRITICAL";
  riskFlags: string[];
}

export interface ISellerRecentProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  mainImage: string | null;
  basePrice: number;
  stock: number;
  status: string;
  approvalStatus: string;
  ratingAverage: number | null;
  createdAt: string;
}

export interface ISellerRecentOrder {
  id: string;
  subOrderNumber: string;
  orderId: string;
  orderNumber?: string;
  customerName: string;
  customerPhone?: string | null;
  totalAmount: number;
  sellerEarnings: number;
  commissionAmount: number;
  status: string;
  createdAt: string;
}

export interface ISellerDetailResponse {
  seller: ISeller;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  } | null;
  wallet: ISellerWallet | null;
  payouts: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    processedAt?: string | null;
    transactionReference?: string | null;
  }>;
  performance: ISellerPerformance;
  recentProducts: ISellerRecentProduct[];
  recentOrders: ISellerRecentOrder[];
}

export interface ISellerEscrowHoldings {
  pendingBalance: number;
  availableBalance: number;
  heldShipments: Array<{
    subOrderId: string;
    subOrderNumber: string;
    sellerEarnings: number;
    deliveredAt: string;
    holdUntil: string | null;
    status: string;
  }>;
}

export interface ISellerDashboardOverview {
  profile: ISeller;
  wallet: ISellerWallet | null;
  metrics: {
    totalProducts: number;
    approvedProducts: number;
    pendingProducts: number;
    totalOrders: number;
    pendingOrders: number;
    availableBalance: number;
    pendingBalance: number;
    totalEarnings: number;
    totalCommissionPaid: number;
  };
  recentOrders: any[];
}
