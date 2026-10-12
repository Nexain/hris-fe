import React from "react";
import { Citation } from "@/types";
import { FileText, Bookmark } from "lucide-react";

interface CitationBadgeProps {
  citation: Citation;
}

export function CitationBadge({ citation }: CitationBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60 shadow-2xs hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors">
      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
      <span className="font-semibold">{citation.document_title || citation.document_id}</span>
      {citation.page && (
        <span className="text-[10px] text-blue-500 dark:text-blue-400 border-l border-blue-200 dark:border-blue-800 pl-1.5 ml-0.5">
          p. {citation.page}
        </span>
      )}
      {citation.section && (
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 hidden sm:inline max-w-[120px] truncate">
          • {citation.section}
        </span>
      )}
    </div>
  );
}
