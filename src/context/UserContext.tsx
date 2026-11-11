"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { ApiClient, UnauthorizedError } from "@/lib/api";
import { CurrentUser, EmployeeSummary } from "@/types";

interface UserContextType {
  /** The signed-in user. Identity is decided by the server session, never the browser. */
  user: CurrentUser;
  /** HR status comes from the backend (HR_ADMIN_USER_IDS via /profile.is_hr). */
  isHRAdmin: boolean;
  /** HR only: every employee with onboarding progress, from /admin/employees. */
  employees: EmployeeSummary[];
  employeesLoading: boolean;
  employeesError: Error | null;
  /** HR only: the employee shown in the onboarding monitor. */
  inspectedEmployee: EmployeeSummary | null;
  setInspectedEmployee: (userId: string) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error(`Could not load your account (status ${res.status}).`);
  return res.json();
}

function clearClientSession() {
  // Old persona-switcher keys and per-user chat transcripts.
  localStorage.removeItem("dayone_access_level");
  localStorage.removeItem("dayone_active_employee");
  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith("dayone_chat_")) sessionStorage.removeItem(key);
  }
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearClientSession();
    window.location.href = "/login";
  }
}

function SignedInProvider({ children }: { children: React.ReactNode }) {
  const [inspectedId, setInspectedId] = useState<string | null>(null);

  const meQuery = useQuery<CurrentUser>({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => !(err instanceof UnauthorizedError) && count < 2,
  });
  const user = meQuery.data;
  const isHRAdmin = !!user?.is_hr;

  const employeesQuery = useQuery<EmployeeSummary[]>({
    queryKey: ["admin-employees"],
    queryFn: () => ApiClient.get<EmployeeSummary[]>("admin/employees"),
    enabled: isHRAdmin,
  });

  useEffect(() => {
    // Leftovers from the persona switcher must not influence anything.
    localStorage.removeItem("dayone_access_level");
    localStorage.removeItem("dayone_active_employee");
  }, []);

  useEffect(() => {
    if (meQuery.error instanceof UnauthorizedError) {
      window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
    }
  }, [meQuery.error]);

  if (!user) {
    const failed = meQuery.isError && !(meQuery.error instanceof UnauthorizedError);
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        {failed ? (
          <div className="max-w-sm text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{meQuery.error?.message}</p>
            <button
              onClick={() => meQuery.refetch()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-label="Loading your account" />
        )}
      </div>
    );
  }

  const employees = employeesQuery.data ?? [];
  const inspectedEmployee =
    employees.find((e) => e.user_id === inspectedId) ?? employees[0] ?? null;

  return (
    <UserContext.Provider
      value={{
        user,
        isHRAdmin,
        employees,
        employeesLoading: employeesQuery.isLoading,
        employeesError: employeesQuery.error,
        inspectedEmployee,
        setInspectedEmployee: setInspectedId,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The login page has no user; it must not wait for /api/auth/me.
  if (pathname === "/login") return <>{children}</>;
  return <SignedInProvider>{children}</SignedInProvider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a signed-in UserProvider");
  }
  return context;
}
