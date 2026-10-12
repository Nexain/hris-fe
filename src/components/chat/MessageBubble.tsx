"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage } from "@/types";
import { CitationBadge } from "./CitationBadge";
import { Sparkles, User, AlertTriangle, CheckCircle2 } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (ts: Date | string) => {
    try {
      return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"} group`}>
      {/* Bot Icon */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4.5 py-3.5 space-y-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm shadow-xs"
            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm shadow-xs"
        }`}
      >
        {/* Markdown Rendered Text */}
        <div className="text-sm leading-relaxed prose dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-strong:font-bold">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Escalation Warning (if question requires HR review) */}
        {!isUser && message.escalation_required && (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              This topic requires formal HR Admin assistance. You can reach People Operations directly or log a support ticket.
            </span>
          </div>
        )}

        {/* Citations & Grounding Section */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Grounded Citations ({message.citations.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((cite, idx) => (
                <CitationBadge key={`${cite.document_id}-${idx}`} citation={cite} />
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          suppressHydrationWarning
          className={`text-[10px] text-right ${
            isUser ? "text-blue-100/80" : "text-zinc-400"
          }`}
        >
          {mounted ? formatTime(message.timestamp) : ""}
        </div>
      </div>

      {/* User Icon */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
