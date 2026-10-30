import { IUseMediaItem } from "./media.type";

export interface IBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  logoId?: string | null;
  useMediaId?: string | null;
  useMedia?: IUseMediaItem | null;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number };
}

export interface ICreateBrandPayload {
  name: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  logoId?: string | null;
  useMediaId?: string | null;
  isActive?: boolean;
}

export type IUpdateBrandPayload = Partial<ICreateBrandPayload>;
