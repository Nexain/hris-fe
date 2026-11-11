import "server-only";
import { base64UrlDecode, base64UrlEncode } from "@/lib/auth";

/**
 * Per-user demo accounts, read from the server-only `DEMO_ACCOUNTS` env var:
 *
 *   [{ "user_id": "user_001", "name": "Naufal", "password_hash": "pbkdf2-sha256$..." }, ...]
 *
 * Generate the value with `node scripts/create-demo-accounts.mjs`.
 * Password hashes use PBKDF2-SHA256: `pbkdf2-sha256$<iterations>$<salt>$<hash>` (base64url).
 */
export interface DemoAccount {
  user_id: string;
  name: string;
  password_hash: string;
}

const encoder = new TextEncoder();
const MIN_ITERATIONS = 100_000;

export function loadAccounts(): DemoAccount[] {
  const raw = process.env.DEMO_ACCOUNTS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is DemoAccount =>
        a &&
        typeof a.user_id === "string" &&
        a.user_id.trim() !== "" &&
        typeof a.name === "string" &&
        typeof a.password_hash === "string"
    );
  } catch {
    console.error("DEMO_ACCOUNTS is not valid JSON; no one can log in.");
    return [];
  }
}

export function findAccount(userId: string): DemoAccount | undefined {
  const wanted = userId.trim().toLowerCase();
  return loadAccounts().find((a) => a.user_id.toLowerCase() === wanted);
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return new Uint8Array(bits);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iterText, saltText, hashText] = stored.split("$");
  const iterations = Number(iterText);
  const salt = base64UrlDecode(saltText ?? "");
  const expected = base64UrlDecode(hashText ?? "");
  if (scheme !== "pbkdf2-sha256" || !Number.isInteger(iterations) || iterations < MIN_ITERATIONS) return false;
  if (!salt || !expected || salt.length < 16 || expected.length !== 32) return false;
  return constantTimeEqual(await pbkdf2(password, salt, iterations), expected);
}

export async function hashPassword(password: string, iterations: number = 210_000): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, iterations);
  return `pbkdf2-sha256$${iterations}$${base64UrlEncode(salt)}$${base64UrlEncode(hash)}`;
}

/** Runs a full PBKDF2 even for unknown users so response time doesn't reveal valid usernames. */
const DUMMY_HASH = "pbkdf2-sha256$210000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function authenticate(userId: string, password: string): Promise<DemoAccount | null> {
  const account = findAccount(userId);
  const ok = await verifyPassword(password, account?.password_hash ?? DUMMY_HASH);
  return account && ok ? account : null;
}
