"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  Palette,
  Code2,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, accessLevel, isHRAdmin, availableEmployees, setEmployee, setAccessLevel } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Right side: Multi-Persona Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 transition-all cursor-pointer shadow-xs"
          >
            {isHRAdmin ? (
              <>
                <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <div className="flex flex-col text-left text-xs">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                    HR Admin
                  </span>
                  <span className="text-zinc-500 text-[10px]">People Operations</span>
                </div>
              </>
            ) : (
              <>
                {user.role.includes("Engineer") ? (
                  <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Palette className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                )}
                <div className="flex flex-col text-left text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </span>
                  <span className="text-zinc-500 text-[10px]">
                    {user.role} ({user.location})
                  </span>
                </div>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Select Persona / Role
              </div>

              {/* Employee Personas */}
              <div className="space-y-1">
                {availableEmployees.map((emp) => {
                  const isActive = !isHRAdmin && user.id === emp.id;
                  const isEng = emp.role.includes("Engineer");

                  return (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setEmployee(emp.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 font-semibold"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isEng
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600"
                            : "bg-pink-100 dark:bg-pink-900/40 text-pink-600"
                        }`}
                      >
                        {isEng ? <Code2 className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{emp.name}</span>
                          <span className="text-[10px] text-zinc-400">{emp.location}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate">{emp.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="my-2 border-t border-zinc-100 dark:border-zinc-800" />

              {/* HR Admin Persona */}
              <button
                onClick={() => {
                  setAccessLevel("HR_ADMIN");
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  isHRAdmin
                    ? "bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-100 font-semibold"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-purple-700 dark:text-purple-300">
                    HR Admin Mode
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    People Ops • Oversight & Policies
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
