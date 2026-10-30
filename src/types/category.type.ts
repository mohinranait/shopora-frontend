import { IUseMediaItem } from "./media.type";

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  imageId?: string | null;
  icon?: string | null;
  useMediaId?: string | null;
  useMedia?: IUseMediaItem | null;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
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
  imageId?: string | null;
  icon?: string | null;
  useMediaId?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export type IUpdateCategoryPayload = Partial<ICreateCategoryPayload>;
