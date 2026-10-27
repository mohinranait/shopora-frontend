export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface ISellerWallet {
  id: number;
  sellerId: number;
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalEarnings: number;
  totalCommissionPaid: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISeller {
  id: number;
  userId: number;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  storeBanner: string | null;
  storeDescription: string | null;
  phone: string;
  businessAddress: string;
  taxNumber: string | null;
  nidOrTradeLicense: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankRouting: string | null;
  bkashOrNagad: string | null;
  commissionRate: number;
  status: SellerStatus;
  rejectionReason: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
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
