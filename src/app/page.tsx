"use client";

import React from "react";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { CopilotBanner } from "@/components/dashboard/CopilotBanner";
import { TaskList } from "@/components/dashboard/TaskList";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 1. Welcome & Onboarding Progress Header */}
      <ProgressCard />

      {/* 2. AI Copilot Callout Banner with Starter Chips */}
      <CopilotBanner />

      {/* 3. Interactive 3-Day Onboarding Checklist */}
      <TaskList />
    </div>
  );
}
