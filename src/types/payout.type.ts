export type PayoutStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export interface IPayoutSellerBrief {
  id: number;
  storeName: string;
  storeSlug: string;
  phone: string;
}

export interface IPayoutRequest {
  id: number;
  sellerId: number;
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

export interface IProcessPayoutPayload {
  status: PayoutStatus;
  transactionReference?: string;
  rejectionReason?: string;
}
