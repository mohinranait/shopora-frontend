import { IUseMediaItem } from "./media.type";
import { IPaginationMeta } from "./common.type";
import { IReviewItem } from "./review.type";

export type ProductType = "SIMPLE" | "VARIABLE";
export type ProductStatus = "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
export type ProductApprovalStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface IProductImageItem {
  id?: number;
  productId?: number;
  url: string;
  altText?: string | null;
  displayOrder?: number;
  isPrimary?: boolean;
  useMediaId?: number | null;
  useMedia?: IUseMediaItem | null;
}

export interface IProductVariantItem {
  id?: number;
  productId?: number;
  sku: string;
  title: string;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  image?: string | null;
  useMediaId?: number | null;
  useMedia?: IUseMediaItem | null;
  barcode?: string | null;
  attributes?: Record<string, string>;
  attributeValueIds?: number[];
  attributeValues?: Array<{
    id?: number;
    attributeId: number;
    attributeName: string;
    attributeSlug: string;
    attributeValueId: number;
    value: string;
    colorCode?: string | null;
  }>;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface IProductSelectedAttributeValue {
  id?: number;
  attributeValueId: number | null;
  value: string;
  colorCode?: string | null;
  customValue?: string | null;
}

export interface IProductSelectedAttributeItem {
  id?: number;
  attributeId: number;
  name?: string;
  slug?: string;
  type?: string;
  description?: string | null;
  isVariation: boolean;
  values: IProductSelectedAttributeValue[];
}

export interface IProductItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  description: string;
  categoryId: number;
  category?: { id: number; name: string; slug: string };
  brandId?: number | null;
  brand?: { id: number; name: string; slug: string; logo?: string } | null;
  sellerId?: number | null;
  seller?: { id: number; storeName: string; storeSlug: string } | null;
  isPlatformOwned: boolean;
  approvalStatus: ProductApprovalStatus;
  status: ProductStatus;
  productType: ProductType;
  basePrice: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  mainImage: string;
  mainImageUseMediaId?: number | null;
  ratingAverage: number;
  ratingCount: number;
  totalSold: number;
  images?: IProductImageItem[];
  variants?: IProductVariantItem[];
  selectedAttributes?: IProductSelectedAttributeItem[];
  reviews?: IReviewItem[];
  tags?: string[];
  warranty?: string | null;
  weightKg?: number | null;
  dimensions?: { length?: number; width?: number; height?: number } | null;
  videoUrl?: string | null;
  trackStock?: boolean;
  isFreeShipping?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt: string;
}

export interface IProductSelectedAttributeInput {
  attributeId: number;
  isVariation?: boolean;
  values: Array<number | string>;
}

export interface IProductVariantInput {
  id?: number;
  title: string;
  sku?: string;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  image?: string | null;
  useMediaId?: number | null;
  barcode?: string | null;
  weightKg?: number | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  isDefault?: boolean;
  isActive?: boolean;
  attributeValueIds?: number[];
  attributes?: Record<string, string>;
}

export interface IProductImageInput {
  url?: string;
  useMediaId?: number;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface ICreateProductPayload {
  name: string;
  shortDescription?: string;
  description: string;
  categoryId: number;
  brandId?: number | null;
  sku?: string;
  productType?: ProductType;
  basePrice: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  mainImage?: string;
  mainImageUseMediaId?: number;
  images?: IProductImageInput[];
  selectedAttributes?: IProductSelectedAttributeInput[];
  variants?: IProductVariantInput[];
  tags?: string[];
  warranty?: string;
  weightKg?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  videoUrl?: string;
  trackStock?: boolean;
  isFreeShipping?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface IUpdateProductPayload extends Partial<ICreateProductPayload> {
  status?: ProductStatus;
}

export interface IProductListResponse {
  products: IProductItem[];
  meta?: IPaginationMeta;
}

export interface IMockProduct {
  id: number;
  name: string;
  slug: string;
  category: string;
  brand: string;
  seller: {
    name: string;
    isOfficial: boolean;
  };
  basePrice: number;
  comparePrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  image: string;
  isHot?: boolean;
  isNew?: boolean;
  discountPercent?: number;
}

export type IProduct = IProductItem | IMockProduct;
