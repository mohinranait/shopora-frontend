export interface IReviewUser {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface IReviewItem {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
  user?: IReviewUser | null;
}

export interface ICreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}
