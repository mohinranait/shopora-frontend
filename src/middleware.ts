import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/:path* routes
  if (pathname.startsWith("/admin")) {
    const roleCookie = request.cookies.get("shopora_role")?.value;

    // If no role cookie or role is not ADMIN, redirect to /admin-login
    if (!roleCookie || roleCookie !== "ADMIN") {
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /seller/:path* routes (except registration/login)
  if (
    pathname.startsWith("/seller") &&
    pathname !== "/seller/register" &&
    pathname !== "/seller/login"
  ) {
    const tokenCookie = request.cookies.get("shopora_token")?.value;
    const roleCookie = request.cookies.get("shopora_role")?.value;

    if (!tokenCookie || (roleCookie !== "SELLER" && roleCookie !== "ADMIN")) {
      const loginUrl = new URL("/seller/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect customer routes: /dashboard, /dashboard/:path*, /orders, /orders/:path*
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/")
  ) {
    const tokenCookie = request.cookies.get("shopora_token")?.value;
    const roleCookie = request.cookies.get("shopora_role")?.value;

    // If neither token nor role cookie is present, redirect to /login
    if (!tokenCookie && !roleCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/orders",
    "/orders/:path*",
  ],
};
