export interface IMediaItem {
  id: number;
  url: string;
  publicId: string;
  format?: string | null;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  originalFilename?: string | null;
  folder?: string | null;
  createdAt: string;
}

export interface IUseMediaItem {
  id: number;
  mediaId: number;
  alt?: string | null;
  description?: string | null;
  media?: IMediaItem;
  createdAt: string;
}

export interface SelectedMediaPayload {
  useMediaId: number;
  url: string;
  alt: string;
  description: string;
  mediaId: number;
}

export interface ImageValue {
  url: string;
  useMediaId?: number | null;
  alt?: string;
  description?: string;
}

export interface ICreateUseMediaPayload {
  mediaId: number;
  alt?: string;
  description?: string;
}
