import { IUseMediaItem } from "./media.type";

/**
 * Category Image can be a Prisma relational UseMedia object (with media relation),
 * a direct image URL string, or null.
 */
export type ICategoryImage = IUseMediaItem | string | null;

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: ICategoryImage;
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

/**
 * Type-safe helper to safely resolve the primary Category image URL
 * from Prisma relational UseMedia or direct string. Strictly typed with zero `any`.
 */
export function getCategoryImageUrl(cat: ICategory): string | null {
  if (typeof cat.image === "string" && cat.image.trim().length > 0) {
    return cat.image;
  }
  if (cat.image && typeof cat.image === "object" && cat.image.media?.url) {
    return cat.image.media.url;
  }
  if (cat.useMedia?.media?.url) {
    return cat.useMedia.media.url;
  }
  return null;
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
