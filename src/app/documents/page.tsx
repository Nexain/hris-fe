"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { Document } from "@/types";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { NewDocumentModal } from "@/components/documents/NewDocumentModal";
import { DocumentDrawer } from "@/components/documents/DocumentDrawer";
import { ChunkPreviewModal } from "@/components/documents/ChunkPreviewModal";
import {
  FileText,
  ShieldAlert,
  Sparkles,
  Layers,
  CheckCircle,
  Clock,
  ArrowRight,
  Database,
  Cpu,
} from "lucide-react";

export default function DocumentsPage() {
  const { isHRAdmin, setAccessLevel } = useUser();

  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Chunk inspection state
  const [inspectChunkState, setInspectChunkState] = useState<{
    isOpen: boolean;
    versionId: string;
    versionString: string;
    docTitle: string;
  }>({
    isOpen: false,
    versionId: "",
    versionString: "",
    docTitle: "",
  });

  // Query documents list
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => ApiClient.get<Document[]>("documents", "HR_ADMIN", "hr_admin_001"),
  });

  // If selectedDoc updates in query, keep it in sync
  const activeSelectedDoc =
    documents.find((d) => d.id === selectedDoc?.id) || selectedDoc;

  // Compute KPI summary stats
  const totalDocs = documents.length;
  const publishedDocs = documents.filter((d) =>
    d.versions?.some((v) => v.status === "PUBLISHED")
  ).length;
  const inReviewDocs = documents.filter((d) =>
    d.versions?.some((v) => v.status === "REVIEW")
  ).length;
  const totalChunks = documents.reduce((acc, d) => {
    const published = d.versions?.find((v) => v.status === "PUBLISHED");
    return acc + (published?.chunk_count || 0);
  }, 0);

  // If in Employee role, display helpful Role Guard
  if (!isHRAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              HR Admin Access Required
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              The Knowledge Base & Document Ingestion portal is restricted to People Operations Admins. Here you can upload PDFs, process embeddings, and publish policies for the DayOne AI Copilot.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setAccessLevel("HR_ADMIN")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Switch to HR Admin Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Knowledge Base & Ingestion
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              HR Admin
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Manage company handbooks and policies. Upload PDFs to extract text, generate vector embeddings via Vertex AI, and publish live to power the AI Copilot.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Documents</span>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalDocs}</p>
          <span className="text-[11px] text-zinc-400">In company catalog</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Published & Live</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{publishedDocs}</p>
          <span className="text-[11px] text-zinc-400">Active in AI RAG</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{inReviewDocs}</p>
          <span className="text-[11px] text-zinc-400">Processed versions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Live Vector Chunks</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalChunks}</p>
          <span className="text-[11px] text-zinc-400">Embedding index</span>
        </div>
      </div>

      {/* Main Table Component */}
      <DocumentTable
        documents={documents}
        isLoading={isLoading}
        onSelectDocument={(doc) => {
          setSelectedDoc(doc);
          setIsDrawerOpen(true);
        }}
        onNewDocument={() => setIsNewDocOpen(true)}
      />

      {/* New Document Modal */}
      <NewDocumentModal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        onSuccess={(newDoc) => {
          setSelectedDoc(newDoc);
          setIsDrawerOpen(true);
        }}
      />

      {/* Document Version Inspector Drawer */}
      <DocumentDrawer
        document={activeSelectedDoc}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onInspectChunks={(versionId, versionString) => {
          setInspectChunkState({
            isOpen: true,
            versionId,
            versionString,
            docTitle: activeSelectedDoc?.title || "Document",
          });
        }}
      />

      {/* Chunks Inspection Preview Modal */}
      <ChunkPreviewModal
        isOpen={inspectChunkState.isOpen}
        versionId={inspectChunkState.versionId}
        versionString={inspectChunkState.versionString}
        documentTitle={inspectChunkState.docTitle}
        onClose={() =>
          setInspectChunkState((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}

