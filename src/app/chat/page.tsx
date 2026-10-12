"use client";

import React, { Suspense } from "react";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { user } = useUser();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ChatContainer key={user.id} />
    </Suspense>
  );
}
