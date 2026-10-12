"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ChatMessage, ChatResponse } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ApiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { Sparkles, Bot, Trash2 } from "lucide-react";

export function ChatContainer() {
  const { user, accessLevel, isHRAdmin } = useUser();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const storageKey = `dayone_chat_${user.id}`;

  const createInitialMessage = (): ChatMessage => ({
    id: `welcome-${user.id}-${Date.now()}`,
    sender: "copilot",
    content: isHRAdmin
      ? `Hello HR Admin! 🛡️ Welcome to the **DayOne AI Copilot Testing Sandbox**.\n\nHere you can test and audit how the AI answers questions grounded in company policies, handbooks, and procedures before employees access them.\n\nTry asking about the **First Day Guide** or leave policy!`
      : `Hello ${user.name}! 👋 I am your **DayOne AI Copilot**.\n\nI am grounded directly in company knowledge base documents, including the **First Day Guide**, IT security rules, and Jakarta office policies.\n\nAsk me anything about your onboarding schedule, equipment requests, or company policies!`,
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error("Error restoring chat session:", e);
      }
    }
    return [createInitialMessage()];
  });

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist messages to sessionStorage per persona
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (e) {
        console.error("Error saving chat session:", e);
      }
    }
  }, [messages, storageKey]);

  // If initialQuery is passed in URL and not sent yet
  const sentInitialRef = useRef(false);
  useEffect(() => {
    if (initialQuery && !sentInitialRef.current) {
      sentInitialRef.current = true;
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await ApiClient.post<ChatResponse>(
        "chat",
        {
          message: text,
          user_id: user.id,
        },
        accessLevel,
        user.id
      );

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "copilot",
        content: response.answer,
        citations: response.citations,
        grounded: response.grounded,
        escalation_required: response.escalation_required,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "copilot",
        content: `Sorry, I encountered an issue connecting to the AI service: ${err.message || "Please try again later."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const freshWelcome = createInitialMessage();
    setMessages([freshWelcome]);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(storageKey);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
      {/* Chat Header Bar */}
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
              isHRAdmin
                ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600"
            }`}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {isHRAdmin ? "AI Copilot Policy Sandbox" : "AI Onboarding Copilot"}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini Flash + Vertex RAG
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Active persona:{" "}
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {user.name} ({user.role})
              </span>
            </p>
          </div>
        </div>

        {/* Clear chat button */}
        <button
          onClick={handleClearChat}
          title="Reset conversation for this persona"
          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* AI Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 text-[11px] font-medium text-zinc-500">
                Retrieving knowledge & generating answer...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          initialQuery=""
        />
      </div>
    </div>
  );
}
