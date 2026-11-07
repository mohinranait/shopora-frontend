import { IUseMediaItem } from "./media.type";
import { IPaginationMeta } from "./common.type";
import { IReviewItem } from "./review.type";
import { IProductQuestion } from "./question.type";

export type ProductType = "SIMPLE" | "VARIABLE";
export type ProductStatus = "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
export type ProductApprovalStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface IProductImageItem {
  id?: string;
  productId?: string;
  url?: string;
  altText?: string | null;
  displayOrder?: number;
  isPrimary?: boolean;
  imageId?: string | null;
  image?: IUseMediaItem | null;
  createdAt?: string;
}

export interface IProductVariantItem {
  id?: string;
  productId?: string;
  sku: string;
  title: string;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  image?: string | IUseMediaItem | null;
  imageId?: string | null;
  barcode?: string | null;
  weightKg?: number | null;
  dimensions?: { length?: number; width?: number; height?: number } | null;
  attributes?: Record<string, string>;
  attributeValueIds?: string[];
  attributeValues?: Array<{
    id?: string;
    attributeId: string;
    attributeName: string;
    attributeSlug: string;
    attributeValueId: string;
    value: string;
    colorCode?: string | null;
  }>;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductSelectedAttributeValue {
  id?: string;
  attributeValueId: string | null;
  value: string;
  colorCode?: string | null;
  customValue?: string | null;
}

export interface IProductSelectedAttributeItem {
  id?: string;
  attributeId: string;
  name?: string;
  slug?: string;
  type?: string;
  description?: string | null;
  isVariation: boolean;
  values: IProductSelectedAttributeValue[];
}

export interface IProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  description?: string;
  categoryId: string;
  category?: { id: string; name: string; slug: string; description?: string | null; icon?: string | null } | null;
  brandId?: string | null;
  brand?: { id: string; name: string; slug: string; logo?: string | IUseMediaItem | null } | null;
  sellerId?: string | null;
  seller?: { id: string; storeName: string; storeSlug: string; logo?: string | IUseMediaItem | null; storeLogo?: string | null; isVerified?: boolean; name?: string } | null;
  isPlatformOwned: boolean;
  approvalStatus: ProductApprovalStatus;
  rejectionReason?: string | null;
  status: ProductStatus;
  productType: ProductType;
  basePrice: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  mainImage?: IUseMediaItem | null;
  mainImageId?: string | null;
  ratingAverage: number;
  ratingCount: number;
  totalSold: number;
  images?: IProductImageItem[];
  variants?: IProductVariantItem[];
  selectedAttributes?: IProductSelectedAttributeItem[];
  reviews?: IReviewItem[];
  questions?: IProductQuestion[];
  tags?: string[];
  bundleProductIds?: string[];
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
  isHot?: boolean;
  discountPercent?: number | null;
  createdAt: string;
  updatedAt?: string;
}

export interface IProductSelectedAttributeInput {
  attributeId: string;
  isVariation?: boolean;
  values: Array<string | number>;
}

export interface IProductVariantInput {
  id?: string;
  title: string;
  sku?: string;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  image?: string | IUseMediaItem | null;
  imageId?: string | null;
  barcode?: string | null;
  weightKg?: number | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  isDefault?: boolean;
  isActive?: boolean;
  attributeValueIds?: string[];
  attributes?: Record<string, string>;
}

export interface IProductImageInput {
  url?: string | null;
  imageId?: string | null;
  altText?: string | null;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface ICreateProductPayload {
  name: string;
  shortDescription?: string;
  description: string;
  categoryId: string;
  brandId?: string | null;
  sku?: string;
  productType?: ProductType;
  basePrice: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  mainImage?: string | IUseMediaItem | null;
  mainImageId?: string | null;
  images?: IProductImageInput[];
  selectedAttributes?: IProductSelectedAttributeInput[];
  variants?: IProductVariantInput[];
  tags?: string[];
  bundleProductIds?: string[];
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

export interface IAutocompleteProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number | null;
  mainImage?: string | IUseMediaItem | null;
  stock?: number;
}

export interface IAutocompleteCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface IAutocompleteBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface IAutocompleteSuggestionsResponse {
  products: IAutocompleteProduct[];
  categories: IAutocompleteCategory[];
  brands: IAutocompleteBrand[];
}

export interface IProductBundleItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number | null;
  mainImage?: string | IUseMediaItem | null;
  stock: number;
}

export interface IProductBundleResponse {
  mainProduct: IProductBundleItem;
  companionProducts: IProductBundleItem[];
  bundleItems?: IProductBundleItem[];
  bundleDiscountPercent: number;
  discountPercentage?: number;
  originalTotal?: number;
  bundleTotal: number;
  discountedTotal?: number;
  totalSavings?: number;
  savings?: number;
}

export interface IMockProduct {
  id: string | number;
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
