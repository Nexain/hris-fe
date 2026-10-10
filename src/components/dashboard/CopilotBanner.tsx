"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Sparkles, ArrowRight, BookOpen, FileUp } from "lucide-react";
import { useUser } from "@/context/UserContext";

export function CopilotBanner() {
  const { isHRAdmin } = useUser();

  const employeePrompts = [
    "What is my schedule for Day 1?",
    "How do I request my laptop and equipment?",
    "Where can I find the company leave policy?",
  ];

  const adminPrompts = [
    "Test Copilot response for First Day Guide",
    "How does the AI ground answers with citations?",
    "Review leave policy chunk citations",
  ];

  if (isHRAdmin) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-purple-200">
              <BookOpen className="w-3.5 h-3.5" />
              <span>HR Admin Portal</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Knowledge Base & Policy Document Management
            </h2>
            <p className="text-sm text-purple-100 leading-relaxed">
              Upload PDF policies to Cloud Storage, trigger Vertex AI text chunking & embeddings, and publish verified guides for new hires.
            </p>

            {/* Quick admin starter chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {adminPrompts.map((prompt) => (
                <Link
                  key={prompt}
                  href={`/chat?q=${encodeURIComponent(prompt)}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/15 transition-all text-white font-medium hover:scale-[1.02]"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-purple-200" />
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-purple-800 hover:bg-purple-50 font-semibold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-purple-700" />
              <span>Manage Knowledge Base</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Onboarding Copilot</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Have questions about your onboarding or policies?
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            Our AI Copilot is trained directly on company handbooks, IT security guides, and Jakarta office policies to answer your questions instantly.
          </p>

          {/* Quick starter chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {employeePrompts.map((prompt) => (
              <Link
                key={prompt}
                href={`/chat?q=${encodeURIComponent(prompt)}`}
                className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/15 transition-all text-white font-medium hover:scale-[1.02]"
              >
                <span>{prompt}</span>
                <ArrowRight className="w-3 h-3 text-blue-200" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="shrink-0">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Open Copilot Chat</span>
          </Link>
        </div>
      </div>

      {/* Decorative background glow */}
      <div className="absolute -right-8 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/2 -top-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}
