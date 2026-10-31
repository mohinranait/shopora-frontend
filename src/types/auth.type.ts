export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  avatarId?: string | null;
  sellerId?: string | null;
  sellerProfile?: {
    id: string;
    storeName: string;
    storeSlug: string;
    status: string;
  } | null;
}

export interface ILoginResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken?: string;
  seller?: {
    id: string;
    storeName: string;
    storeSlug: string;
    status: string;
  };
}

export interface IRegisterSellerResponse {
  user: IAuthUser;
  seller: {
    id: string;
    storeName: string;
    storeSlug: string;
    status: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterCustomerPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface IRegisterSellerPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  storeName: string;
  businessAddress: string;
  storeDescription?: string;
  taxNumber?: string;
  nidOrTradeLicense?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankRouting?: string;
  bkashOrNagad?: string;
}
