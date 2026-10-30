export interface IMediaItem {
  id: string;
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
  id: string;
  mediaId: string;
  alt?: string | null;
  description?: string | null;
  media?: IMediaItem;
  createdAt: string;
}

export interface SelectedMediaPayload {
  useMediaId: string;
  url: string;
  alt: string;
  description: string;
  mediaId: string;
}

export interface ImageValue {
  url: string;
  useMediaId?: string | null;
  alt?: string;
  description?: string;
}

export interface ICreateUseMediaPayload {
  mediaId: string;
  alt?: string;
  description?: string;
}
