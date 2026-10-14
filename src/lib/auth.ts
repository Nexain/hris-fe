export const AUTH_COOKIE_NAME = "dayone_access";

export function getPasscode(): string {
  return process.env.DEMO_PASSCODE || "dayone2026";
}

/**
 * Computes a SHA-256 hash token for the passcode so the raw secret is never stored in cookies.
 */
export async function computeAuthToken(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${passcode.trim()}:dayone-salt-hris-2026`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validates whether the provided token matches the expected hash for the current passcode.
 */
export async function isValidAuthToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const currentPasscode = getPasscode();
  const expectedToken = await computeAuthToken(currentPasscode);
  return token === expectedToken;
}

