import { IUseMediaItem } from "./media.type";

export type SliderType = "IMAGE_ONLY" | "IMAGE_BG_CONTENT" | "CONTENT_ONLY";

export interface ISliderItem {
  id: string;
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
  imageId?: string | null;
  useMediaId?: string | null;
  image?: IUseMediaItem | null;
  useMedia?: IUseMediaItem | null;
  mobileImageId?: string | null;
  mobileUseMediaId?: string | null;
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
  imageId?: string | null;
  useMediaId?: string | null;
  mobileImageId?: string | null;
  mobileUseMediaId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export type IUpdateSliderPayload = Partial<ICreateSliderPayload>;
