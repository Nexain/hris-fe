import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isValidAuthToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Allow internal Next.js assets, static files, and icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Validate authentication token cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = await isValidAuthToken(token);

  // 3. If accessing the login page
  if (pathname === "/login") {
    // If already authenticated, redirect to home page
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 4. If not authenticated
  if (!isAuthenticated) {
    // If requesting backend proxy or other API routes, block with 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "A valid demo passcode is required to access DayOne HRIS endpoints.",
        },
        { status: 401 }
      );
    }

    // If requesting frontend pages, redirect to /login
    const redirectUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      redirectUrl.searchParams.set("from", pathname + search);
    }
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

