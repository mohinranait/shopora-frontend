import {
  IPaginationMeta,
  IErrorSource,
  IMediaItem,
  IUseMediaItem,
  ICreateUseMediaPayload,
  IBrand,
  ICreateBrandPayload,
  IUpdateBrandPayload,
  ICategory,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
  IAttribute,
  IAttributeValue,
  ICreateAttributePayload,
  IUpdateAttributePayload,
  ICreateAttributeValuePayload,
  IUpdateAttributeValuePayload,
  IGenerateCombinationsPayload,
  IGenerateCombinationsResponse,
  IProductItem,
  ICreateProductPayload,
  IUpdateProductPayload,
  IProductListResponse,
  IAuthUser,
  ILoginResponse,
  ILoginPayload,
  IRegisterCustomerPayload,
  IRegisterSellerPayload,
} from "@/types";

export * from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // If request contains body and isn't FormData, default to application/json
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Auto-attach JWT Authorization token if present in localStorage (client-side)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("shopora_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage =
        json?.message || `Request failed with HTTP status ${res.status}`;
      throw new ApiError(errorMessage, res.status, json?.errorSources);
    }

    return json;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Network error. Failed to reach server.";
    throw new ApiError(message, 500);
  }
}

// ==========================================
// 1. MEDIA APIS (Cloudinary & UseMedia)
// ==========================================

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
  createUseMedia: async (payload: ICreateUseMediaPayload) => {
    const res = await fetchApi<IUseMediaItem>("/media/use-media", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  // Delete raw media asset
  deleteMedia: async (id: string | number) => {
    const res = await fetchApi<{ message: string; id: string | number }>(`/media/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 2. BRAND APIS
// ==========================================

export const brandApi = {
  getAll: async (includeInactive = true) => {
    const res = await fetchApi<IBrand[]>(`/brands?includeInactive=${includeInactive}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  getById: async (id: string | number) => {
    const res = await fetchApi<IBrand>(`/brands/${id}`);
    return res.data;
  },

  create: async (payload: ICreateBrandPayload) => {
    const res = await fetchApi<IBrand>("/brands", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (id: string | number, payload: IUpdateBrandPayload) => {
    const res = await fetchApi<IBrand>(`/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  delete: async (id: string | number) => {
    const res = await fetchApi<{ message: string; id: string | number }>(`/brands/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 3. CATEGORY APIS
// ==========================================

export const categoryApi = {
  getAll: async () => {
    const res = await fetchApi<ICategory[]>("/categories");
    return Array.isArray(res.data) ? res.data : [];
  },

  getTree: async () => {
    const res = await fetchApi<ICategory[]>("/categories/tree");
    return Array.isArray(res.data) ? res.data : [];
  },

  getById: async (id: string | number) => {
    const res = await fetchApi<ICategory>(`/categories/${id}`);
    return res.data;
  },

  create: async (payload: ICreateCategoryPayload) => {
    const res = await fetchApi<ICategory>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (id: string | number, payload: IUpdateCategoryPayload) => {
    const res = await fetchApi<ICategory>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  delete: async (id: string | number) => {
    const res = await fetchApi<{ message: string; id: string | number }>(`/categories/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 4. ATTRIBUTE APIS
// ==========================================

export const attributeApi = {
  getAll: async (includeInactive = true) => {
    const res = await fetchApi<IAttribute[]>(`/attributes?includeInactive=${includeInactive}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  getById: async (id: string | number) => {
    const res = await fetchApi<IAttribute>(`/attributes/${id}`);
    return res.data;
  },

  create: async (payload: ICreateAttributePayload) => {
    const res = await fetchApi<IAttribute>("/attributes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (id: string | number, payload: IUpdateAttributePayload) => {
    const res = await fetchApi<IAttribute>(`/attributes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  delete: async (id: string | number) => {
    const res = await fetchApi<{ message: string; id: string | number }>(`/attributes/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },

  createValue: async (attributeId: string | number, payload: ICreateAttributeValuePayload) => {
    const res = await fetchApi<IAttributeValue>(`/attributes/${attributeId}/values`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updateValue: async (valueId: string | number, payload: IUpdateAttributeValuePayload) => {
    const res = await fetchApi<IAttributeValue>(`/attributes/values/${valueId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  deleteValue: async (valueId: string | number) => {
    const res = await fetchApi<{ message: string; valueId: string | number }>(
      `/attributes/values/${valueId}`,
      {
        method: "DELETE",
      }
    );
    return res.data;
  },

  generateCombinations: async (payload: IGenerateCombinationsPayload) => {
    const res = await fetchApi<IGenerateCombinationsResponse>("/attributes/generate-combinations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};

// ==========================================
// 5. PRODUCT APIS
// ==========================================

export const productApi = {
  getAll: async (params?: Record<string, string | number | boolean | undefined>): Promise<IProductListResponse> => {
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

  getById: async (id: string | number) => {
    const res = await fetchApi<IProductItem>(`/products/${id}`);
    return res.data;
  },

  getBySlug: async (slug: string) => {
    const res = await fetchApi<IProductItem>(`/products/detail/${slug}`);
    return res.data;
  },

  create: async (payload: ICreateProductPayload) => {
    const res = await fetchApi<IProductItem>("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (id: string | number, payload: IUpdateProductPayload) => {
    const res = await fetchApi<IProductItem>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  reviewApproval: async (id: string | number, status: "APPROVED" | "REJECTED", rejectionReason?: string) => {
    const res = await fetchApi<IProductItem>(`/products/admin/${id}/approval`, {
      method: "PATCH",
      body: JSON.stringify({ status, rejectionReason }),
    });
    return res.data;
  },

  delete: async (id: string | number) => {
    const res = await fetchApi<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

// ==========================================
// 6. AUTHENTICATION APIS
// ==========================================

export const authApi = {
  login: async (payload: ILoginPayload) => {
    const res = await fetchApi<ILoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  registerCustomer: async (payload: IRegisterCustomerPayload) => {
    const res = await fetchApi<ILoginResponse>("/auth/register/customer", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  registerSeller: async (payload: IRegisterSellerPayload) => {
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
