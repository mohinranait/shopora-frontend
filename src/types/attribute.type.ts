export type AttributeDisplayType = "SELECT" | "COLOR" | "BUTTON" | "RADIO" | "TEXT";

export interface IAttributeValue {
  id: number;
  attributeId: number;
  value: string;
  colorCode?: string | null;
  displayOrder: number;
  createdAt?: string;
}

export interface IAttribute {
  id: number;
  name: string;
  slug: string;
  type: AttributeDisplayType;
  description?: string | null;
  isActive: boolean;
  displayOrder: number;
  values: IAttributeValue[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IGeneratedVariantCombinationDetail {
  attributeId: number;
  attributeName: string;
  valueId: number;
  value: string;
  colorCode?: string | null;
}

export interface IGeneratedVariantRow {
  index: number;
  title: string;
  suggestedSkuSuffix: string;
  attributeValueIds: number[];
  attributes: Record<string, string>;
  combinationDetails: IGeneratedVariantCombinationDetail[];
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  isDefault: boolean;
  image?: string | null;
  useMediaId?: number | null;
}

export interface ICreateAttributePayload {
  name: string;
  type?: AttributeDisplayType;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  values?: Array<{ value: string; colorCode?: string; displayOrder?: number }>;
}

export interface IUpdateAttributePayload {
  name?: string;
  type?: AttributeDisplayType;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ICreateAttributeValuePayload {
  value: string;
  colorCode?: string;
  displayOrder?: number;
}

export interface IUpdateAttributeValuePayload {
  value?: string;
  colorCode?: string;
  displayOrder?: number;
}

export interface IGenerateCombinationsPayload {
  attributes: Array<{ attributeId: number; valueIds: number[] }>;
}

export interface IGenerateCombinationsResponse {
  totalCombinations: number;
  selectedAttributesCount: number;
  variants: IGeneratedVariantRow[];
}
