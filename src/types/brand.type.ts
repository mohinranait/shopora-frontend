import { IUseMediaItem } from "./media.type";

export interface IBrand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  logoId?: number | null;
  useMediaId?: number | null;
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
  logoId?: number | null;
  useMediaId?: number | null;
  isActive?: boolean;
}

export type IUpdateBrandPayload = Partial<ICreateBrandPayload>;
