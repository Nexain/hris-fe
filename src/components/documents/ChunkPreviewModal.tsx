"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { DocumentChunk } from "@/types";
import { X, Layers, Hash, FileText, Loader2, AlertCircle } from "lucide-react";

interface ChunkPreviewModalProps {
  versionId: string;
  documentTitle: string;
  versionString: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChunkPreviewModal({
  versionId,
  documentTitle,
  versionString,
  isOpen,
  onClose,
}: ChunkPreviewModalProps) {
  const { data: chunks, isLoading, error } = useQuery<DocumentChunk[]>({
    queryKey: ["chunks", versionId],
    queryFn: () => ApiClient.get<DocumentChunk[]>(`versions/${versionId}/chunks`),
    enabled: isOpen && !!versionId,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Extracted Search Chunks
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {documentTitle} &bull; Version {versionString}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm">Loading chunk data from Firestore...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Failed to load chunks: {(error as Error).message}</span>
            </div>
          ) : !chunks || chunks.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-sm">
              No chunks have been generated for this version yet. Click &quot;Process Version&quot; to extract chunks.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
                <span>Total Chunks: <strong>{chunks.length}</strong></span>
                <span>Search Engine: <strong>Vertex AI text-embedding-004</strong></span>
              </div>
              <div className="space-y-3">
                {chunks.map((chunk, idx) => (
                  <div
                    key={chunk.id || idx}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                        <Hash className="w-3.5 h-3.5" />
                        <span>Chunk #{idx + 1}</span>
                      </div>
                      <span className="text-zinc-400 text-[11px]">
                        ID: {chunk.id?.slice(0, 12)}...
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 font-mono bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 whitespace-pre-wrap">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

