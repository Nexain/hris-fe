import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Allow internal Next.js assets, auth endpoints, static files, and icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Validate the signed session cookie
  const session = await verifySession(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  // 3. Login page: send signed-in users home
  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  // 4. Not signed in
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Please sign in to access DayOne HRIS." } },
        { status: 401 }
      );
    }

    const redirectUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      redirectUrl.searchParams.set("from", pathname + search);
    }
    const response = NextResponse.redirect(redirectUrl);
    // Drop an invalid or expired cookie (e.g. the old passcode hash).
    if (request.cookies.has(AUTH_COOKIE_NAME)) response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
