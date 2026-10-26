export interface IReviewUser {
  id: number;
  name: string;
  avatar?: string | null;
}

export interface IReviewItem {
  id: number;
  productId: number;
  userId: number;
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
  productId: number;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}
