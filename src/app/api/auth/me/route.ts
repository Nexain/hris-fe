import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/auth";
import { findAccount } from "@/lib/accounts";
import { backendFetch } from "@/lib/backend";
import type { CurrentUser } from "@/types";

/**
 * Returns the signed-in user. Profile details and HR status come from the backend:
 * HR is decided by the backend's HR_ADMIN_USER_IDS and exposed as `/profile.is_hr`.
 */
export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get(AUTH_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Not signed in." } },
      { status: 401 }
    );
  }

  const account = findAccount(session.uid);
  const user: CurrentUser = {
    user_id: session.uid,
    name: account?.name ?? session.uid,
    role: "Employee",
    department: "",
    location: "",
    is_hr: false,
  };

  let isHr: boolean | undefined;
  try {
    const res = await backendFetch("profile", session.uid);
    if (res.ok) {
      const profile = await res.json();
      user.name = profile.name || user.name;
      user.role = profile.role || user.role;
      user.department = profile.department || user.department;
      user.location = profile.location || user.location;
      if (typeof profile.is_hr === "boolean") isHr = profile.is_hr;
    } else if (res.status !== 404) {
      console.error(`/profile returned ${res.status} for ${session.uid}`);
    }

    // Users without a profile (e.g. HR accounts): ask an HR-only endpoint instead.
    // The backend still decides; 200 means HR, 403 means not.
    if (isHr === undefined) {
      const probe = await backendFetch("admin/employees", session.uid);
      isHr = probe.ok;
    }
  } catch (err) {
    console.error("Failed to load profile for /api/auth/me:", err);
    return NextResponse.json(
      { error: { code: "BAD_GATEWAY", message: "Could not reach the HRIS backend." } },
      { status: 502 }
    );
  }

  user.is_hr = isHr;
  if (user.is_hr && user.role === "Employee") {
    user.role = "People Operations";
    user.department ||= "People Operations";
  }
  return NextResponse.json(user);
}
