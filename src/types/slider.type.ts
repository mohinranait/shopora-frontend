import { IUseMediaItem } from "./media.type";

export type SliderType = "IMAGE_ONLY" | "IMAGE_BG_CONTENT" | "CONTENT_ONLY";

export interface ISliderItem {
  id: number;
  type: SliderType;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  badgeText?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  bgGradient?: string | null;
  bgColor?: string | null;
  textColor?: "LIGHT" | "DARK" | null;
  displayOrder: number;
  isActive: boolean;
  imageId?: number | null;
  useMediaId?: number | null;
  image?: IUseMediaItem | null;
  useMedia?: IUseMediaItem | null;
  mobileImageId?: number | null;
  mobileUseMediaId?: number | null;
  mobileImage?: IUseMediaItem | null;
  mobileUseMedia?: IUseMediaItem | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateSliderPayload {
  type: SliderType;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  badgeText?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  bgGradient?: string | null;
  bgColor?: string | null;
  textColor?: "LIGHT" | "DARK";
  displayOrder?: number;
  isActive?: boolean;
  imageId?: number | null;
  useMediaId?: number | null;
  mobileImageId?: number | null;
  mobileUseMediaId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export type IUpdateSliderPayload = Partial<ICreateSliderPayload>;
