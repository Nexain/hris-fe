"use client";

import React, { useState, useMemo } from "react";
import { Document, DocumentType } from "@/types";
import {
  Search,
  Filter,
  FileText,
  ChevronRight,
  Plus,
  Shield,
  Layers,
  Building,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  onSelectDocument: (doc: Document) => void;
  onNewDocument: () => void;
}

export function DocumentTable({
  documents,
  isLoading,
  onSelectDocument,
  onNewDocument,
}: DocumentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "ALL" || doc.document_type === typeFilter;
      const matchesDept = deptFilter === "ALL" || doc.department === deptFilter;
      return matchesSearch && matchesType && matchesDept;
    });
  }, [documents, searchQuery, typeFilter, deptFilter]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(documents.map((d) => d.department).filter(Boolean));
    return Array.from(depts);
  }, [documents]);

  const getTypeBadge = (type: DocumentType) => {
    const typeStyles: Record<string, string> = {
      POLICY: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      HANDBOOK: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      GUIDE: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      PROCEDURE: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
      BENEFITS: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      IT: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      OTHER: "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
          typeStyles[type] || typeStyles.OTHER
        }`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title or slug ID..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Dropdowns + Add Button */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="ALL">All Categories</option>
            <option value="POLICY">Policy</option>
            <option value="HANDBOOK">Handbook</option>
            <option value="GUIDE">Guide</option>
            <option value="PROCEDURE">Procedure</option>
            <option value="BENEFITS">Benefits</option>
            <option value="IT">IT Standards</option>
          </select>

          {/* Department Dropdown */}
          {uniqueDepartments.length > 0 && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="ALL">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}

          {/* Add Document Button */}
          <button
            onClick={onNewDocument}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Documents Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-zinc-400 text-sm">
            Loading knowledge base documents from Firestore...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                No documents found
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                {searchQuery || typeFilter !== "ALL" || deptFilter !== "ALL"
                  ? "Try resetting your search query or filters."
                  : "Start populating the company knowledge base by adding your first policy or handbook."}
              </p>
            </div>
            {!searchQuery && typeFilter === "ALL" && (
              <button
                onClick={onNewDocument}
                className="mt-2 px-4 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 rounded-xl hover:bg-purple-100 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-medium">
                  <th className="py-3 px-5">Document Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Active Status</th>
                  <th className="py-3 px-4">Versions</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredDocuments.map((doc) => {
                  const publishedVersion = doc.versions?.find((v) => v.status === "PUBLISHED");
                  const latestVersion = doc.versions?.[0];
                  const hasVersions = doc.versions && doc.versions.length > 0;

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onSelectDocument(doc)}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Title & Slug ID */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm block">
                              {doc.title}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              /{doc.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Type */}
                      <td className="py-4 px-4">{getTypeBadge(doc.document_type)}</td>

                      {/* Scope (Department & Location) */}
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-zinc-400" />
                            {doc.department}
                          </span>
                          <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            {doc.location}
                          </span>
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-4">
                        {publishedVersion ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            Live (v{publishedVersion.version})
                          </span>
                        ) : latestVersion?.status === "REVIEW" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            In Review (v{latestVersion.version})
                          </span>
                        ) : hasVersions ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Draft (v{latestVersion?.version})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            No PDF Uploaded
                          </span>
                        )}
                      </td>

                      {/* Versions Count */}
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-zinc-400" />
                          {doc.versions?.length || 0} versions
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-all shadow-2xs">
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

