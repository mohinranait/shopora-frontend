export type PayoutStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export interface IPayoutSellerBrief {
  id: string;
  storeName: string;
  storeSlug: string;
  phone: string;
}

export interface IPayoutRequest {
  id: string;
  sellerId: string;
  amount: number;
  paymentMethod: string;
  accountDetails: {
    number?: string;
    accountNumber?: string;
    bankName?: string;
    branchName?: string;
    routingNumber?: string;
    accountHolderName?: string;
    mfsProvider?: string;
    [key: string]: unknown;
  } | null;
  status: PayoutStatus;
  rejectionReason: string | null;
  transactionReference: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seller?: IPayoutSellerBrief | null;
}

/** Withdrawal methods the backend accepts */
export type PayoutMethod = "BKASH" | "NAGAD" | "BANK";

export interface ISellerWalletBalances {
  id: string;
  sellerId: string;
  /** Available balance; negative when a return reversed money the seller had already withdrawn */
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalEarnings: number;
  totalCommissionPaid: number;
}

export type WalletTransactionType =
  | "ORDER_EARNING"
  | "ESCROW_RELEASE"
  | "PAYOUT_WITHDRAWAL"
  | "REFUND_REVERSAL"
  | "COMMISSION_DEDUCTION";

export interface IWalletTransaction {
  id: string;
  walletId: string;
  subOrderId: string | null;
  /** Positive credits, negative debits */
  amount: number;
  type: WalletTransactionType | string;
  description: string;
  createdAt: string;
}

export interface ISellerWalletResponse {
  wallet: ISellerWalletBalances;
  transactions: IWalletTransaction[];
  payouts: IPayoutRequest[];
}

export interface IRequestPayoutPayload {
  amount: number;
  paymentMethod: PayoutMethod;
  accountDetails: { number?: string; accountNumber?: string; mfsProvider?: string };
}

export interface IProcessPayoutPayload {
  status: PayoutStatus;
  transactionReference?: string;
  rejectionReason?: string;
}
