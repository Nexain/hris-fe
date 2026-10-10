import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://chatbot-hris-991560435962.asia-southeast1.run.app";
const GCP_BEARER_TOKEN = process.env.GCP_BEARER_TOKEN || "";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const pathString = path.join("/");
  const targetUrl = `${BACKEND_URL}/api/v1/${pathString}${req.nextUrl.search}`;

  const headers = new Headers();

  // Forward critical client headers
  if (req.headers.has("x-user-id")) {
    headers.set("x-user-id", req.headers.get("x-user-id")!);
  }
  if (req.headers.has("x-access-level")) {
    headers.set("x-access-level", req.headers.get("x-access-level")!);
  }
  if (req.headers.has("content-type")) {
    headers.set("content-type", req.headers.get("content-type")!);
  }

  // Attach Google Cloud Run IAM bearer token server-side
  if (GCP_BEARER_TOKEN) {
    headers.set("authorization", `Bearer ${GCP_BEARER_TOKEN}`);
  }

  const method = req.method;
  let body: BodyInit | undefined = undefined;

  if (method !== "GET" && method !== "HEAD") {
    body = await req.blob();
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseData = await backendRes.arrayBuffer();

    return new NextResponse(responseData, {
      status: backendRes.status,
      headers: {
        "content-type":
          backendRes.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    console.error("API Proxy Error:", err);
    return NextResponse.json(
      { error: "Failed to communicate with backend service", details: err?.message },
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
