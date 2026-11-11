import "server-only";

export const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "https://chatbot-hris-991560435962.asia-southeast1.run.app";

async function getAuthToken(audience: string): Promise<string> {
  // 1. Use static env token if provided (e.g. local development)
  if (process.env.GCP_BEARER_TOKEN) {
    return process.env.GCP_BEARER_TOKEN;
  }

  // 2. In Cloud Run production, auto-fetch IAM identity token from GCP metadata server
  try {
    const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`;
    const res = await fetch(metadataUrl, {
      headers: { "Metadata-Flavor": "Google" },
      signal: AbortSignal.timeout(1000),
    });
    if (res.ok) {
      return (await res.text()).trim();
    }
  } catch {
    // Not running in GCP or metadata server unavailable
  }

  return "";
}

/**
 * Calls the backend as `userId`. The identity always comes from the verified session:
 * callers never pass through identity headers sent by the browser.
 */
export async function backendFetch(
  path: string,
  userId: string,
  init: { method?: string; body?: BodyInit; contentType?: string | null } = {}
): Promise<Response> {
  const headers = new Headers({ "x-user-id": userId });
  if (init.contentType) headers.set("content-type", init.contentType);

  const token = await getAuthToken(BACKEND_URL);
  if (token) headers.set("authorization", `Bearer ${token}`);

  return fetch(`${BACKEND_URL}/api/v1/${path.replace(/^\//, "")}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body,
    cache: "no-store",
  });
}
