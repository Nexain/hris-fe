import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, computeAuthToken, getPasscode } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const passcode = body?.passcode;
    const currentPasscode = getPasscode();

    if (!passcode || typeof passcode !== "string" || passcode.trim() !== currentPasscode.trim()) {
      return NextResponse.json(
        { success: false, error: "Incorrect passcode. Please try again." },
        { status: 401 }
      );
    }

    const token = await computeAuthToken(currentPasscode);
    const response = NextResponse.json({ success: true });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }
}

