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
  UserCheck,
  ArrowRightLeft,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, accessLevel, isHRAdmin, toggleRole } = useUser();

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

        {/* Right side: Role Switcher & User Pill */}
        <div className="flex items-center gap-3">
          {/* Active Persona Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs">
            {isHRAdmin ? (
              <>
                <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="flex flex-col">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                    HR Admin
                  </span>
                  <span className="text-zinc-500 text-[10px]">People Ops</span>
                </div>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </span>
                  <span className="text-zinc-500 text-[10px]">
                    {user.role} ({user.location})
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Toggle Role Button */}
          <button
            onClick={toggleRole}
            title="Switch between Employee and HR Admin perspective"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Switch to</span>
            <span className="font-semibold">
              {isHRAdmin ? "Employee" : "HR Admin"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
