"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Document, DocumentType } from "@/types";
import { X, Plus, FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDoc: Document) => void;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "POLICY", label: "Company Policy" },
  { value: "HANDBOOK", label: "Employee Handbook" },
  { value: "GUIDE", label: "Onboarding & First Day Guide" },
  { value: "PROCEDURE", label: "Standard Procedure (SOP)" },
  { value: "BENEFITS", label: "Benefits & Perks" },
  { value: "IT", label: "IT & Security Standards" },
  { value: "OTHER", label: "General Document" },
];

const DEPARTMENTS = [
  "People Operations",
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Finance",
  "General",
];

const LOCATIONS = ["Jakarta", "Global", "Remote", "Singapore"];

export function NewDocumentModal({
  isOpen,
  onClose,
  onSuccess,
}: NewDocumentModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("POLICY");
  const [department, setDepartment] = useState("People Operations");
  const [location, setLocation] = useState("Jakarta");
  const [owner, setOwner] = useState("People Operations");

  const createDocMutation = useMutation({
    mutationFn: (data: {
      title: string;
      document_type: DocumentType;
      department: string;
      location: string;
      owner: string;
    }) => ApiClient.post<Document>("documents", data, "HR_ADMIN", "hr_admin_001"),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success(`Document created: ${newDoc.title}`);
      onSuccess(newDoc);
      handleClose();
    },
    onError: (err: Error) => {
      toast.error(`Failed to create document: ${err.message}`);
    },
  });

  const handleClose = () => {
    setTitle("");
    setDocumentType("POLICY");
    setDepartment("People Operations");
    setLocation("Jakarta");
    setOwner("People Operations");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    createDocMutation.mutate({
      title: title.trim(),
      document_type: documentType,
      department,
      location,
      owner,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                New Knowledge Document
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Register metadata in company knowledge base
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Annual Leave & Attendance Policy"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Category / Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Owner / Team
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. People Operations"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <span>
              After registering this document, you can upload its PDF file version to process embeddings and publish it live for the AI Copilot.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={createDocMutation.isPending}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDocMutation.isPending}
              className="px-5 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {createDocMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

