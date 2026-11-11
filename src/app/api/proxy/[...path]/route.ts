import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(req: NextRequest, context: RouteContext) {
  // Identity comes only from the signed session cookie. Browser-sent x-user-id,
  // x-access-level and other x-user-* headers are never forwarded.
  const session = await verifySession(req.cookies.get(AUTH_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." } },
      { status: 401 }
    );
  }

  const { path } = await context.params;
  const pathString = path.map(encodeURIComponent).join("/");
  const method = req.method;
  const body = method !== "GET" && method !== "HEAD" ? await req.blob() : undefined;

  try {
    const backendRes = await backendFetch(`${pathString}${req.nextUrl.search}`, session.uid, {
      method,
      body,
      contentType: req.headers.get("content-type"),
    });

    return new NextResponse(await backendRes.arrayBuffer(), {
      status: backendRes.status,
      headers: {
        "content-type": backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("API Proxy Error:", err);
    return NextResponse.json(
      { error: { code: "BAD_GATEWAY", message: "Failed to communicate with backend service" } },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}
