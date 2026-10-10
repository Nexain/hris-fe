"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { OnboardingTask } from "@/types";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  FileText,
  Calendar,
  MessageSquare,
  Loader2,
  Clock,
  ShieldAlert,
} from "lucide-react";

export function TaskList() {
  const { user, inspectedEmployee, isHRAdmin, accessLevel } = useUser();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");

  const targetUserId = isHRAdmin ? inspectedEmployee.id : user.id;

  const { data: tasks, isLoading, error } = useQuery<OnboardingTask[]>({
    queryKey: ["onboarding-tasks", targetUserId],
    queryFn: () => ApiClient.get<OnboardingTask[]>("tasks", accessLevel, targetUserId),
  });

  const completeMutation = useMutation({
    mutationFn: (taskId: string) =>
      ApiClient.post(`tasks/${taskId}/complete`, {}, accessLevel, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-tasks", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["onboarding-progress", targetUserId] });
      toast.success("Task marked as completed! 🎉", {
        description: "Your onboarding progress has been updated.",
      });
    },
    onError: (err: any) => {
      toast.error("Could not update task", {
        description: err.message || "Please try again later.",
      });
    },
  });

  const allTasks = tasks || [];
  const filteredTasks =
    selectedDay === "all"
      ? allTasks
      : allTasks.filter((t) => t.day === selectedDay);

  const dayCounts = {
    all: allTasks.length,
    1: allTasks.filter((t) => t.day === 1).length,
    2: allTasks.filter((t) => t.day === 2).length,
    3: allTasks.filter((t) => t.day === 3).length,
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isHRAdmin
                ? `${inspectedEmployee.name}'s Onboarding Checklist`
                : "Onboarding Checklist"}
            </h2>
            {isHRAdmin && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                HR Audit Mode
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isHRAdmin
              ? `Reviewing onboarding milestone completion for employee ${inspectedEmployee.name} (${inspectedEmployee.id}).`
              : "Review and complete tasks designed for your first three days at DayOne AI."}
          </p>
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
          {(["all", 1, 2, 3] as const).map((day) => {
            const isSelected = selectedDay === day;
            const label = day === "all" ? "All Tasks" : `Day ${day}`;
            const count = dayCounts[day];

            return (
              <button
                key={String(day)}
                onClick={() => setSelectedDay(day)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? isHRAdmin
                        ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                        : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List Items */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs">Loading onboarding tasks...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs">
          Failed to load onboarding tasks.
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-sm">
          No tasks found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "COMPLETED";
            const isMutating =
              completeMutation.isPending &&
              completeMutation.variables === task.id;

            return (
              <div
                key={task.id}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-85"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs"
                }`}
              >
                {/* Complete Button or Read-Only Status Icon */}
                {isHRAdmin ? (
                  <div
                    title={
                      isCompleted
                        ? "Completed by employee"
                        : "Pending employee action"
                    }
                    className="mt-1 shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <Clock className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                ) : (
                  <button
                    disabled={isCompleted || isMutating}
                    onClick={() => completeMutation.mutate(task.id)}
                    title={isCompleted ? "Completed" : "Click to mark complete"}
                    className={`mt-0.5 shrink-0 transition-transform ${
                      isCompleted
                        ? "text-emerald-600 dark:text-emerald-400 cursor-default"
                        : "text-zinc-300 dark:text-zinc-600 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 cursor-pointer"
                    }`}
                  >
                    {isMutating ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? "line-through text-zinc-500 dark:text-zinc-500"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Day Badge */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      <Calendar className="w-3 h-3" />
                      Day {task.day}
                    </span>

                    {/* Source Document Tag */}
                    {task.source_document_id && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/50">
                        <FileText className="w-3 h-3" />
                        {task.source_document_id}
                      </span>
                    )}

                    {/* HR Mode Status Tag */}
                    {isHRAdmin && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {isCompleted ? "Completed" : "In Progress"}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      isCompleted
                        ? "text-zinc-400 dark:text-zinc-600"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {task.description}
                  </p>
                </div>

                {/* Right: Quick Ask Copilot button */}
                <div className="shrink-0 flex items-center">
                  <Link
                    href={`/chat?q=${encodeURIComponent(
                      `Can you help me with: "${task.title}"?`
                    )}`}
                    title="Ask AI Copilot about this task"
                    className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ask Copilot</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
