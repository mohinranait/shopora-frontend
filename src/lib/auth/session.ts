/**
 * Client-side session helpers shared by every API client (RTK Query, cart/orders client).
 *
 * Access tokens expire; when a request comes back 401 the client asks for a new access token
 * with the refresh token once, retries, and only clears the session if that fails.
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1").replace(/\/+$/, "");

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem("shopora_token");
  } catch {
    return null;
  }
};

// One in-flight refresh shared by all callers, so parallel 401s trigger a single refresh request
let refreshPromise: Promise<string | null> | null = null;

/** Exchange the refresh token for a new access token. Resolves to null when that isn't possible. */
export const refreshAccessToken = (): Promise<string | null> => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("shopora_refresh_token");
      if (!refreshToken) return null;

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return null;

      const result = await response.json();
      const newAccessToken: string | undefined = result?.data?.accessToken;
      if (!newAccessToken) return null;

      localStorage.setItem("shopora_token", newAccessToken);
      document.cookie = `shopora_token=${newAccessToken}; path=/; max-age=604800; SameSite=Lax`;
      return newAccessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/** Forget the stored session (tokens, cached user, role cookie) and tell listeners */
export const clearSession = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("shopora_token");
    localStorage.removeItem("shopora_refresh_token");
    localStorage.removeItem("shopora_user");
  } catch {
    // storage unavailable
  }
  document.cookie = "shopora_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "shopora_role=; path=/; max-age=0; SameSite=Lax";
  window.dispatchEvent(new Event("storage"));
};

/** Send the user to the right login page when a protected page loses its session */
export const redirectToLoginIfProtected = () => {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  const redirect = encodeURIComponent(currentPath);
  if (currentPath.startsWith("/admin") && currentPath !== "/admin-login") {
    window.location.href = `/admin-login?redirect=${redirect}`;
  } else if (currentPath.startsWith("/seller") && currentPath !== "/seller/register" && currentPath !== "/seller/login") {
    window.location.href = `/login?redirect=${redirect}`;
  } else if (currentPath.startsWith("/dashboard") || currentPath.startsWith("/orders")) {
    window.location.href = `/login?redirect=${redirect}`;
  }
};
