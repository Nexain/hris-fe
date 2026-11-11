/**
 * Session helpers shared by the route handlers and `src/proxy.ts`.
 *
 * The session cookie holds `base64url(payload).base64url(hmac)`, where the payload is
 * `{ uid, exp }` and the HMAC is SHA-256 keyed with `SESSION_SECRET`. Only Web Crypto
 * is used, so this runs in any Next.js runtime.
 */

export const AUTH_COOKIE_NAME = "dayone_access";
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

export interface SessionPayload {
  uid: string;
  exp: number; // unix seconds
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Only used outside production so `next dev` works without extra setup.
const DEV_SESSION_SECRET = "dev-only-session-secret-do-not-use-in-production";

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") return DEV_SESSION_SECRET;
  // In production a missing or weak secret means no session is ever valid.
  return null;
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Creates a signed session token for `uid` that expires after SESSION_TTL_SECONDS. */
export async function signSession(uid: string, now: number = Date.now()): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not configured (min 32 characters).");

  const payload: SessionPayload = { uid, exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(encodedPayload));
  return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/** Returns the session if the token is well formed, correctly signed and not expired. */
export async function verifySession(
  token: string | undefined | null,
  now: number = Date.now()
): Promise<SessionPayload | null> {
  if (!token) return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, encodedSignature] = parts;
  const signature = base64UrlDecode(encodedSignature);
  if (!signature) return null;

  // crypto.subtle.verify compares in constant time.
  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret),
    signature,
    encoder.encode(encodedPayload)
  );
  if (!valid) return null;

  const payloadBytes = base64UrlDecode(encodedPayload);
  if (!payloadBytes) return null;
  try {
    const payload = JSON.parse(decoder.decode(payloadBytes)) as Partial<SessionPayload>;
    if (typeof payload.uid !== "string" || !payload.uid || typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(now / 1000)) return null;
    return { uid: payload.uid, exp: payload.exp };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
