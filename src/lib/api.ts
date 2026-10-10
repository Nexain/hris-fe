import { AccessLevel } from "@/types";

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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `Request failed with status ${res.status}`);
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `Request failed with status ${res.status}`);
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `Request failed with status ${res.status}`);
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
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `Upload failed with status ${res.status}`);
    }

    return res.json();
  }
}
