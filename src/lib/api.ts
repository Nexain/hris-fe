/**
 * Turns an error response body into a readable message. The backend returns
 * several shapes: `{ detail: string }`, FastAPI validation errors
 * `{ detail: [{ msg, loc }] }`, and `{ error: { code, message } }`.
 */
function messageFromErrorBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const { detail, error, message } = body as Record<string, unknown>;

  for (const value of [detail, error, message]) {
    if (typeof value === "string" && value.trim()) return value;
    if (Array.isArray(value)) {
      const msgs = value
        .map((item) =>
          typeof item === "string"
            ? item
            : item && typeof item === "object" && typeof (item as { msg?: unknown }).msg === "string"
              ? (item as { msg: string }).msg
              : null
        )
        .filter(Boolean);
      if (msgs.length) return msgs.join("; ");
    }
    if (value && typeof value === "object") {
      const nested = messageFromErrorBody(value);
      if (nested) return nested;
    }
  }
  return null;
}

export async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return messageFromErrorBody(body) || `${fallback} with status ${res.status}`;
}

/** The session is missing or expired; the user has to sign in again. */
export class UnauthorizedError extends Error {
  constructor(message = "Your session has expired. Please sign in again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Browser client for the backend proxy. It never sends identity: the proxy sets
 * `x-user-id` from the signed session cookie and drops identity headers from the browser.
 */
export class ApiClient {
  private static async request<T>(
    path: string,
    init: RequestInit,
    failureLabel: string
  ): Promise<T> {
    const res = await fetch(`/api/proxy/${path}`, init);

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
      }
      throw new UnauthorizedError();
    }
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, failureLabel));
    }
    return res.json();
  }

  private static json(method: string, body: unknown): RequestInit {
    return {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    };
  }

  static get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" }, "Request failed");
  }

  static post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, this.json("POST", body), "Request failed");
  }

  static put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, this.json("PUT", body), "Request failed");
  }

  static upload<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>(path, { method: "POST", body: formData }, "Upload failed");
  }
}
