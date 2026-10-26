/**
 * Server-Side Data Fetching Utility for Next.js App Router (Server Components & Actions)
 */

export interface FetchDataOptions extends Omit<RequestInit, "headers"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  revalidate?: number | false;
  tags?: string[];
  token?: string;
  headers?: Record<string, string>;
}

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Reusable server-side data fetching method.
 *
 * @param endpoint - API relative path (e.g. "/categories" or "products?limit=10")
 * @param options  - Query params, Next.js cache/revalidation options, headers, and token
 * @returns Promise<T> - Typed data from backend response
 */
export async function fetchData<T = unknown>(
  endpoint: string,
  options: FetchDataOptions = {}
): Promise<T> {
  const {
    params,
    revalidate = 60, // Default to 60-second ISR caching
    tags,
    token,
    headers: customHeaders = {},
    ...restOptions
  } = options;

  // Clean leading slash
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Assemble full URL
  const baseUrl = DEFAULT_API_BASE_URL.replace(/\/+$/, "");
  const fullUrl = new URL(`${baseUrl}${cleanEndpoint}`);

  // Append query params if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  // Assemble headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  // Configure Next.js specific caching/revalidation options
  const nextConfig: { revalidate?: number | false; tags?: string[] } = {};
  if (typeof revalidate === "number" || revalidate === false) {
    nextConfig.revalidate = revalidate;
  }
  if (tags && tags.length > 0) {
    nextConfig.tags = tags;
  }

  try {
    const response = await fetch(fullUrl.toString(), {
      headers,
      ...(Object.keys(nextConfig).length > 0 ? { next: nextConfig } : {}),
      ...restOptions,
    });

    if (!response.ok) {
      let errorMessage = `API request failed with status: ${response.status} (${response.statusText})`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // Fallback to status text
      }
      throw new Error(errorMessage);
    }

    const json = await response.json();

    // Standard Shopora backend response wrapper: { success: true, data: T }
    if (json && typeof json === "object" && "data" in json) {
      return json.data as T;
    }

    return json as T;
  } catch (error: unknown) {
    console.error(`[fetchData Error] endpoint: ${endpoint} ->`, error);
    throw error;
  }
}
