const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  totalPage?: number;
}

export interface IErrorSource {
  path: string | number;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  errorSources?: IErrorSource[];

  constructor(message: string, statusCode: number, errorSources?: IErrorSource[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorSources = errorSources;
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errorSources && error.errorSources.length > 0) {
      return error.errorSources[0].message;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected server error occurred. Please try again.";
}

/**
 * Universal API helper for Shopora Admin & Storefront
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message?: string; data: T; meta?: IPaginationMeta }> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("shopora_token");
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg =
        json.errorSources?.[0]?.message ||
        json.message ||
        `Request failed with status ${res.status}`;
      throw new ApiError(errorMsg, res.status, json.errorSources);
    }

    return json;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error) {
      throw new ApiError(err.message, 500);
    }
    throw new ApiError("Network request failed", 500);
  }
}

// ==========================================
// 1. MEDIA & USE-MEDIA APIS
// ==========================================

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

export const mediaApi = {
  // Fetch media library items
  getMediaLibrary: async (page = 1, limit = 50, folder?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (folder) params.append("folder", folder);
    const res = await fetchApi<IMediaItem[]>(`/media?${params.toString()}`);
    return {
      items: Array.isArray(res.data) ? res.data : [res.data],
      meta: res.meta,
    };
  },

  // Upload single image file to Cloudinary & Media model
  uploadFile: async (file: File, folder = "shopora") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);
    const res = await fetchApi<IMediaItem>("/media/upload", {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  // Create UseMedia record from selected mediaId with SEO alt and description
  createUseMedia: async (payload: { mediaId: number; alt?: string; description?: string }) => {
    const res = await fetchApi<IUseMediaItem>("/media/use-media", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Delete raw media asset
  deleteMedia: async (id: number) => {
    const res = await fetchApi<{ message: string; id: number }>(`/media/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 2. BRAND APIS
// ==========================================

export interface IBrand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  useMediaId?: number | null;
  useMedia?: IUseMediaItem | null;
  isActive: boolean;
  createdAt: string;
  _count?: { products: number };
}

export const brandApi = {
  getAll: async (includeInactive = true) => {
    const res = await fetchApi<IBrand[]>(`/brands?includeInactive=${includeInactive}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  getById: async (slug: string) => {
    const res = await fetchApi<IBrand>(`/brands/${slug}`);
    return res.data;
  },

  create: async (payload: {
    name: string;
    logo?: string;
    useMediaId?: number | null;
    description?: string;
    website?: string;
    isActive?: boolean;
  }) => {
    const res = await fetchApi<IBrand>("/brands", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (
    id: number,
    payload: {
      name?: string;
      logo?: string;
      useMediaId?: number | null;
      description?: string;
      website?: string;
      isActive?: boolean;
    }
  ) => {
    const res = await fetchApi<IBrand>(`/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  delete: async (id: number) => {
    const res = await fetchApi<{ message: string }>(`/brands/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 3. CATEGORY APIS
// ==========================================

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  parentId?: number | null;
  useMediaId?: number | null;
  useMedia?: IUseMediaItem | null;
  isActive: boolean;
  displayOrder: number;
  children?: ICategory[];
  parent?: ICategory | null;
  createdAt: string;
}

export const categoryApi = {
  getAll: async () => {
    const res = await fetchApi<ICategory[]>("/categories");
    return Array.isArray(res.data) ? res.data : [];
  },

  getTree: async () => {
    const res = await fetchApi<ICategory[]>("/categories/tree");
    return Array.isArray(res.data) ? res.data : [];
  },

  create: async (payload: {
    name: string;
    description?: string;
    image?: string;
    useMediaId?: number | null;
    icon?: string;
    parentId?: number | null;
    displayOrder?: number;
    isActive?: boolean;
  }) => {
    const res = await fetchApi<ICategory>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (
    id: number,
    payload: {
      name?: string;
      description?: string;
      image?: string;
      useMediaId?: number | null;
      icon?: string;
      parentId?: number | null;
      displayOrder?: number;
      isActive?: boolean;
    }
  ) => {
    const res = await fetchApi<ICategory>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  delete: async (id: number) => {
    const res = await fetchApi<{ message: string }>(`/categories/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 4. PRODUCT APIS
// ==========================================

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
  approvalStatus: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  status: "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  productType: "SIMPLE" | "VARIABLE";
  basePrice: number;
  comparePrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  mainImage: string;
  mainImageUseMediaId?: number | null;
  ratingAverage: number;
  ratingCount: number;
  totalSold: number;
  createdAt: string;
}

export const productApi = {
  getAll: async (params?: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.append(key, String(val));
        }
      });
    }
    const res = await fetchApi<IProductItem[]>(`/products?${query.toString()}`);
    return {
      products: Array.isArray(res.data) ? res.data : [],
      meta: res.meta,
    };
  },

  reviewApproval: async (id: number, status: "APPROVED" | "REJECTED", rejectionReason?: string) => {
    const res = await fetchApi<IProductItem>(`/products/admin/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ approvalStatus: status, rejectionReason }),
    });
    return res.data;
  },

  delete: async (id: number) => {
    const res = await fetchApi<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 5. AUTHENTICATION APIS
// ==========================================

export interface IAuthUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  phone?: string | null;
  avatar?: string | null;
  sellerProfile?: {
    id: number;
    storeName: string;
    storeSlug: string;
    status: string;
  } | null;
}

export interface ILoginResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const res = await fetchApi<ILoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  registerCustomer: async (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const res = await fetchApi<ILoginResponse>("/auth/register/customer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  registerSeller: async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    storeName: string;
    businessAddress: string;
    storeDescription?: string;
    taxNumber?: string;
    nidOrTradeLicense?: string;
    bkashOrNagad?: string;
  }) => {
    const res = await fetchApi<ILoginResponse>("/auth/register/seller", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getMe: async () => {
    const res = await fetchApi<IAuthUser>("/auth/me");
    return res.data;
  },
};

