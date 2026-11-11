"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  FileText,
  ShieldAlert,
  User as UserIcon,
  LogOut,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  // The login page has no signed-in user and no navbar.
  if (pathname === "/login") return null;
  return <SignedInNavbar pathname={pathname} />;
}

function SignedInNavbar({ pathname }: { pathname: string }) {
  const { user, isHRAdmin, logout } = useUser();

  const navLinks = [
    { href: "/", label: "Onboarding", icon: LayoutDashboard },
    { href: "/chat", label: "Copilot Chat", icon: MessageSquare },
    ...(isHRAdmin
      ? [{ href: "/documents", label: "Knowledge Base", icon: FileText }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight text-lg">
                DayOne<span className="text-blue-600">.ai</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                HR Copilot
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: signed-in user and logout */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-xs min-w-0"
            title={`Signed in as ${user.name} (${user.user_id})`}
          >
            {isHRAdmin ? (
              <ShieldAlert className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
            ) : (
              <UserIcon className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            )}
            <div className="flex flex-col text-left text-xs min-w-0">
              <span
                className={`font-semibold truncate max-w-[9rem] sm:max-w-[14rem] ${
                  isHRAdmin ? "text-purple-700 dark:text-purple-300" : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {user.name}
              </span>
              <span className="hidden sm:block text-zinc-500 text-[10px] truncate max-w-[14rem]">
                {isHRAdmin ? `HR Admin · ${user.department || "People Operations"}` : user.role}
                {user.location ? ` (${user.location})` : ""}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-200 dark:hover:border-red-900 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation: the desktop links above are hidden below md */}
      <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
