export interface IProductQuestionUser {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
}

export interface IProductQuestion {
  id: string;
  productId: string;
  userId: string;
  question: string;
  answer?: string | null;
  answeredBy?: string | null;
  answeredAt?: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
  user?: IProductQuestionUser | null;
  asker?: IProductQuestionUser | null;
  answeredByUser?: IProductQuestionUser | null;
  answerer?: IProductQuestionUser | null;
}

export interface IAskQuestionPayload {
  productId: string;
  question: string;
}

export type ICreateQuestionPayload = IAskQuestionPayload;

export interface IAnswerQuestionPayload {
  answer: string;
}
