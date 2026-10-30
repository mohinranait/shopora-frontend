import { IUseMediaItem } from "./media.type";

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  imageId?: number | null;
  icon?: string | null;
  useMediaId?: number | null;
  useMedia?: IUseMediaItem | null;
  parentId?: number | null;
  parent?: { id: number; name: string; slug: string } | null;
  children?: ICategory[];
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  _count?: { products: number };
}

export interface ICreateCategoryPayload {
  name: string;
  description?: string | null;
  image?: string | null;
  imageId?: number | null;
  icon?: string | null;
  useMediaId?: number | null;
  parentId?: number | null;
  isActive?: boolean;
  displayOrder?: number;
}

export type IUpdateCategoryPayload = Partial<ICreateCategoryPayload>;
