import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, sessionCookieOptions, signSession } from "@/lib/auth";
import { authenticate, loadAccounts } from "@/lib/accounts";

export async function POST(req: NextRequest) {
  let username: unknown;
  let password: unknown;
  try {
    ({ username, password } = await req.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }

  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    return NextResponse.json(
      { success: false, error: "Enter your username and password." },
      { status: 400 }
    );
  }

  if (loadAccounts().length === 0) {
    console.error("Login attempted but DEMO_ACCOUNTS is not configured.");
    return NextResponse.json(
      { success: false, error: "Sign-in is not configured on this server. Contact People Operations." },
      { status: 503 }
    );
  }

  const account = await authenticate(username, password);
  if (!account) {
    return NextResponse.json(
      { success: false, error: "Incorrect username or password." },
      { status: 401 }
    );
  }

  let token: string;
  try {
    token = await signSession(account.user_id);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Sign-in is not configured on this server. Contact People Operations." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, sessionCookieOptions());
  return response;
}
