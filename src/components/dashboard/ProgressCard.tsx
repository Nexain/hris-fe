"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { OnboardingProgress, OnboardingTask } from "@/types";
import { useUser } from "@/context/UserContext";
import { CheckCircle2, Clock, Sparkles, Trophy, ShieldCheck, UserCheck } from "lucide-react";

export function ProgressCard() {
  const {
    user,
    inspectedEmployee,
    employees,
    employeesLoading,
    employeesError,
    setInspectedEmployee,
    isHRAdmin,
  } = useUser();

  // Employees read their own progress; HR reads the selected employee's through the
  // HR-only admin endpoint (identity always comes from the session).
  const progressPath = isHRAdmin
    ? inspectedEmployee && `admin/employees/${encodeURIComponent(inspectedEmployee.user_id)}/progress`
    : "onboarding/progress";

  const { data: progress, isLoading: progressLoading } = useQuery<OnboardingProgress>({
    queryKey: ["onboarding-progress", progressPath],
    queryFn: () => ApiClient.get<OnboardingProgress>(progressPath!),
    enabled: !!progressPath,
  });
  const isLoading = progressLoading || (isHRAdmin && employeesLoading);

  // Same query key and fetcher as TaskList, so React Query shares one request.
  const { data: tasks } = useQuery<OnboardingTask[]>({
    queryKey: ["onboarding-tasks", "tasks"],
    queryFn: () => ApiClient.get<OnboardingTask[]>("tasks"),
    enabled: !isHRAdmin,
  });

  // The current onboarding day is the earliest day that still has pending tasks.
  const pendingDays = (tasks ?? []).filter((t) => t.status !== "COMPLETED").map((t) => t.day);
  const currentDay = pendingDays.length ? Math.min(...pendingDays) : null;
  const dayBadge = !tasks
    ? "Your Onboarding"
    : currentDay === null
      ? "Onboarding Complete"
      : `Day ${currentDay} of Your Onboarding`;

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
                {inspectedEmployee ? (
                  <>
                    Overseeing milestone completion for new hire{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {inspectedEmployee.name}
                    </span>{" "}
                    ({[inspectedEmployee.role, inspectedEmployee.department, inspectedEmployee.location]
                      .filter(Boolean)
                      .join(" • ")}).
                  </>
                ) : employeesError ? (
                  <>Could not load employees: {employeesError.message}</>
                ) : employeesLoading ? (
                  <>Loading employees…</>
                ) : (
                  <>No employees with an onboarding profile yet.</>
                )}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{dayBadge}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Welcome to the team, {user.name}! 👋
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We’re excited to have you join as {user.role}
                {user.department ? ` in ${user.department}` : ""}
                {user.location ? ` (${user.location})` : ""}.
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
              {!isLoading && total > 0 && percent === 100 ? (
                <>
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>All tasks completed!</span>
                </>
              ) : isHRAdmin ? (
                <span className="text-purple-700 dark:text-purple-300">
                  {inspectedEmployee ? `${inspectedEmployee.name}’s Progress` : "Employee Progress"}
                </span>
              ) : (
                <span>Onboarding Progress</span>
              )}
            </div>
            {isLoading ? (
              <div className="flex items-center gap-2" aria-label="Loading progress">
                <span className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                <span className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              </div>
            ) : (
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
            )}
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
          <div className="flex flex-wrap items-center gap-2">
            {employees.length === 0 && (
              <span className="text-xs text-zinc-400">
                {employeesLoading ? "Loading…" : "No employees found."}
              </span>
            )}
            {employees.map((emp) => {
              const isSelected = inspectedEmployee?.user_id === emp.user_id;
              return (
                <button
                  key={emp.user_id}
                  onClick={() => setInspectedEmployee(emp.user_id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600 text-white font-semibold shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {emp.name} ({emp.role}) · {Math.round(emp.progress_percent ?? 0)}%
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
