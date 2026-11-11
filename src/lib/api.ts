import { AccessLevel } from "@/types";

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

export class ApiClient {
  private static getHeaders(accessLevel?: AccessLevel, userId: string = "user_001"): HeadersInit {
    const headers: Record<string, string> = {
      "x-user-id": userId,
      "x-access-level": accessLevel || "EMPLOYEE",
    };
    return headers;
  }

  static async get<T>(path: string, accessLevel?: AccessLevel, userId?: string): Promise<T> {
    const res = await fetch(`/api/proxy/${path}`, {
      method: "GET",
      headers: this.getHeaders(accessLevel, userId),
    });

    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, "Request failed"));
    }

    return res.json();
  }

  static async post<T>(path: string, body?: any, accessLevel?: AccessLevel, userId?: string): Promise<T> {
    const headers: Record<string, string> = {
      ...this.getHeaders(accessLevel, userId) as Record<string, string>,
      "content-type": "application/json",
    };

    const res = await fetch(`/api/proxy/${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, "Request failed"));
    }

    return res.json();
  }

  static async put<T>(path: string, body?: any, accessLevel?: AccessLevel, userId?: string): Promise<T> {
    const headers: Record<string, string> = {
      ...this.getHeaders(accessLevel, userId) as Record<string, string>,
      "content-type": "application/json",
    };

    const res = await fetch(`/api/proxy/${path}`, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, "Request failed"));
    }

    return res.json();
  }

  static async upload<T>(path: string, formData: FormData, accessLevel?: AccessLevel, userId?: string): Promise<T> {
    const headers = this.getHeaders(accessLevel, userId);

    const res = await fetch(`/api/proxy/${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await extractErrorMessage(res, "Upload failed"));
    }

    return res.json();
  }
}
