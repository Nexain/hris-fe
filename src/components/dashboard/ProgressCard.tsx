"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { OnboardingProgress } from "@/types";
import { useUser } from "@/context/UserContext";
import { CheckCircle2, Clock, Sparkles, Trophy, ShieldCheck, UserCheck } from "lucide-react";

export function ProgressCard() {
  const {
    user,
    inspectedEmployee,
    availableEmployees,
    setInspectedEmployee,
    isHRAdmin,
    accessLevel,
  } = useUser();

  // If HR Admin, inspect selected employee's progress
  const targetUserId = isHRAdmin ? inspectedEmployee.id : user.id;

  const { data: progress, isLoading } = useQuery<OnboardingProgress>({
    queryKey: ["onboarding-progress", targetUserId],
    queryFn: () => ApiClient.get<OnboardingProgress>("onboarding/progress", accessLevel, targetUserId),
  });

  const percent = Math.round(progress?.progress_percent ?? 0);
  const total = progress?.total ?? 0;
  const completed = progress?.completed ?? 0;
  const remaining = progress?.remaining ?? 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Dynamic Greeting based on Persona */}
        <div className="space-y-2 max-w-xl">
          {isHRAdmin ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HR Admin Oversight</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Employee Onboarding Monitor 📊
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Overseeing milestone completion for new hire{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {inspectedEmployee.name}
                </span>{" "}
                ({inspectedEmployee.role} • {inspectedEmployee.department}, {inspectedEmployee.location}).
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Day 1 of Your Onboarding</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome to the team, {user.name}! 👋
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We’re excited to have you join as {user.role} in {user.department} ({user.location}).
                Complete your checklist below to get your workspace set up smoothly.
              </p>
            </>
          )}
        </div>

        {/* Right: Progress Meter Card */}
        <div className="flex items-center gap-5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl p-4 sm:p-5 min-w-[280px]">
          {/* Progress Circular/Badge */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-200 dark:text-zinc-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-700 ease-out ${
                  isHRAdmin
                    ? "text-purple-600 dark:text-purple-500"
                    : "text-blue-600 dark:text-blue-500"
                }`}
                strokeDasharray={`${percent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isLoading ? "..." : `${percent}%`}
            </span>
          </div>

          {/* Stats breakdown */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {percent === 100 ? (
                <>
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>All tasks completed!</span>
                </>
              ) : isHRAdmin ? (
                <span className="text-purple-700 dark:text-purple-300">
                  {inspectedEmployee.name}'s Progress
                </span>
              ) : (
                <span>Onboarding Progress</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {completed} completed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {remaining} remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HR Admin Employee Selector Bar */}
      {isHRAdmin && (
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Select Employee to Inspect:
          </span>
          <div className="flex items-center gap-2">
            {availableEmployees.map((emp) => {
              const isSelected = inspectedEmployee.id === emp.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => setInspectedEmployee(emp.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white font-semibold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {emp.name} ({emp.role})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
