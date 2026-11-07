import { IUseMediaItem } from "./media.type";

export interface IBrand {
  id: string;
  name: string;
  slug: string;
  logo?: IUseMediaItem | null;
  website?: string | null;
  description?: string | null;
  logoId?: string | null;
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
  isActive?: boolean;
}

export type IUpdateBrandPayload = Partial<ICreateBrandPayload>;
