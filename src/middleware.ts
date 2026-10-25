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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
