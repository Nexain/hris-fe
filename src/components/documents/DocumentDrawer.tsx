"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Document, DocumentVersion, VersionStatus } from "@/types";
import {
  X,
  FileText,
  Upload,
  Cpu,
  CheckCircle,
  Eye,
  AlertTriangle,
  Clock,
  Layers,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentDrawerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onInspectChunks: (versionId: string, versionString: string) => void;
}

export function DocumentDrawer({
  document,
  isOpen,
  onClose,
  onInspectChunks,
}: DocumentDrawerProps) {
  const queryClient = useQueryClient();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [newVersionString, setNewVersionString] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Default to current_version_id or the first version in list
  const activeVersionId =
    selectedVersionId ||
    document?.current_version_id ||
    document?.versions?.[0]?.id ||
    null;

  const currentVersion = document?.versions?.find((v) => v.id === activeVersionId) || document?.versions?.[0];

  // 1. Upload Version Mutation
  const uploadVersionMutation = useMutation({
    mutationFn: async ({ file, version }: { file: File; version: string }) => {
      if (!document) throw new Error("No document selected");
      const formData = new FormData();
      formData.append("file", file);
      if (version.trim()) {
        formData.append("version", version.trim());
      }
      return ApiClient.upload<{ version_id: string }>(
        `documents/${document.id}/versions`,
        formData,
        "HR_ADMIN",
        "hr_admin_001"
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("New PDF version uploaded successfully!");
      setSelectedFile(null);
      setNewVersionString("");
      if (data?.version_id) {
        setSelectedVersionId(data.version_id);
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to upload version: ${err.message}`);
    },
  });

  // 2. Process Version Mutation
  const processVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return ApiClient.post(
        `versions/${versionId}/process`,
        {},
        "HR_ADMIN",
        "hr_admin_001"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document processed! Text extracted and vector embeddings generated.");
    },
    onError: (err: Error) => {
      toast.error(`Processing failed: ${err.message}`);
    },
  });

  // 3. Publish Version Mutation
  const publishVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return ApiClient.post(
        `versions/${versionId}/publish`,
        {},
        "HR_ADMIN",
        "hr_admin_001"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Version published live! AI Copilot can now cite this document.");
    },
    onError: (err: Error) => {
      toast.error(`Publishing failed: ${err.message}`);
    },
  });

  // 4. Reject Version Mutation
  const rejectVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      return ApiClient.post(
        `versions/${versionId}/reject`,
        {},
        "HR_ADMIN",
        "hr_admin_001"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.info("Version marked as rejected.");
    },
    onError: (err: Error) => {
      toast.error(`Rejection failed: ${err.message}`);
    },
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getStatusBadge = (status: VersionStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            PUBLISHED (Live)
          </span>
        );
      case "REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            IN REVIEW (Processed)
          </span>
        );
      case "DRAFT":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            UPLOADED (Unprocessed)
          </span>
        );
      case "SUPERSEDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            SUPERSEDED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <Ban className="w-3 h-3" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
            {status}
          </span>
        );
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-sm">
                  {document.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  <span className="font-mono text-zinc-400">/{document.id}</span>
                  <span>&bull;</span>
                  <span>{document.department}</span>
                  <span>&bull;</span>
                  <span>{document.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Version Selector Tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Version History ({document.versions?.length || 0})
                </label>
              </div>

              {!document.versions || document.versions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700 text-center text-xs text-zinc-500">
                  No versions recorded yet. Upload the initial PDF below.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {document.versions.map((v) => {
                    const isSelected = v.id === currentVersion?.id;
                    const isLive = v.status === "PUBLISHED";
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVersionId(v.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
                            : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                        }`}
                      >
                        <span>v{v.version}</span>
                        {isLive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                        )}
                        <span className="text-[10px] opacity-75">
                          ({v.status})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Version Detail Card */}
            {currentVersion && (
              <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Version {currentVersion.version}
                    </span>
                    {getStatusBadge(currentVersion.status)}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    ID: {currentVersion.id.slice(0, 8)}...
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Vector Chunks:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      {currentVersion.chunk_count || 0} chunks generated
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block mb-0.5">Uploaded By:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {currentVersion.uploaded_by || "HR Admin"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block mb-0.5">SHA-256 File Hash:</span>
                    <div className="flex items-center justify-between font-mono text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <span className="truncate max-w-[280px]">
                        {currentVersion.file_hash || "N/A"}
                      </span>
                      {currentVersion.file_hash && (
                        <button
                          onClick={() => handleCopyHash(currentVersion.file_hash)}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                          {copiedHash ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pipeline Actions based on Status */}
                <div className="space-y-2 pt-1">
                  {/* Status 1: UPLOADED / DRAFT -> Ready for Processing */}
                  {currentVersion.status !== "PUBLISHED" &&
                    currentVersion.status !== "REVIEW" &&
                    currentVersion.status !== "SUPERSEDED" &&
                    currentVersion.status !== "REJECTED" && (
                      <button
                        onClick={() => processVersionMutation.mutate(currentVersion.id)}
                        disabled={processVersionMutation.isPending}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {processVersionMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Extracting text & generating embeddings...</span>
                          </>
                        ) : (
                          <>
                            <Cpu className="w-4 h-4" />
                            <span>⚡ Step 2: Process Document (Generate Chunks)</span>
                          </>
                        )}
                      </button>
                    )}

                  {/* Status 2: REVIEW (Processed) -> Ready for Publish or Reject */}
                  {currentVersion.status === "REVIEW" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            onInspectChunks(currentVersion.id, currentVersion.version)
                          }
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>Inspect Chunks ({currentVersion.chunk_count})</span>
                        </button>

                        <button
                          onClick={() => publishVersionMutation.mutate(currentVersion.id)}
                          disabled={publishVersionMutation.isPending}
                          className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {publishVersionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>Publish Live</span>
                        </button>
                      </div>

                      <button
                        onClick={() => rejectVersionMutation.mutate(currentVersion.id)}
                        disabled={rejectVersionMutation.isPending}
                        className="w-full py-2 px-3 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors"
                      >
                        Reject this version
                      </button>
                    </div>
                  )}

                  {/* Status 3: PUBLISHED (Live) */}
                  {currentVersion.status === "PUBLISHED" && (
                    <div className="space-y-2">
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block">Active in RAG AI Knowledge Base</strong>
                          The DayOne AI Copilot actively retrieves and cites chunks from this version when answering employee queries.
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          onInspectChunks(currentVersion.id, currentVersion.version)
                        }
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>Inspect Search Chunks ({currentVersion.chunk_count})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Upload New Version Section */}
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Upload New Version PDF
                </h3>
              </div>

              <div className="space-y-3">
                {/* File Dropzone */}
                <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-5 text-center hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all bg-white dark:bg-zinc-900">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[240px]">{selectedFile.name}</span>
                      <span className="text-zinc-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-zinc-500 text-xs">
                      <Upload className="w-6 h-6 mx-auto text-zinc-400 mb-1" />
                      <p className="font-medium text-zinc-700 dark:text-zinc-300">
                        Click or drag PDF file here
                      </p>
                      <p className="text-[11px] text-zinc-400">Supports PDF format up to 20MB</p>
                    </div>
                  )}
                </div>

                {/* Semantic Version String input */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Semantic Version (optional):
                  </label>
                  <input
                    type="text"
                    value={newVersionString}
                    onChange={(e) => setNewVersionString(e.target.value)}
                    placeholder="e.g., 1.1 or 2.0 (defaults to auto)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!selectedFile) {
                      toast.error("Please select a PDF file first");
                      return;
                    }
                    uploadVersionMutation.mutate({
                      file: selectedFile,
                      version: newVersionString,
                    });
                  }}
                  disabled={!selectedFile || uploadVersionMutation.isPending}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploadVersionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Google Cloud Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Version PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

