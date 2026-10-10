export type AccessLevel = "EMPLOYEE" | "HR_ADMIN" | "SYSTEM";

// 1. Profile Models
export interface UserProfile {
  user_id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
}

// 2. Onboarding Task Models
export interface OnboardingTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  day: number;
  source_document_id: string | null;
  status: "PENDING" | "COMPLETED";
  completed_at: string | null;
  created_at: string;
}

export interface OnboardingProgress {
  total: number;
  completed: number;
  remaining: number;
  progress_percent: number;
}

// 3. Chat Models (Verified from live Gemini RAG)
export interface Citation {
  document_id: string;
  document_title: string;
  version: string;
  section?: string;
  page?: number;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  intent: string;
  grounded: boolean;
  escalation_required: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  content: string;
  citations?: Citation[];
  grounded?: boolean;
  escalation_required?: boolean;
  timestamp: Date;
}

// 4. Document Knowledge Base Models (Verified)
export type DocumentType = "POLICY" | "HANDBOOK" | "PROCEDURE" | "GUIDE" | "BENEFITS" | "IT" | "OTHER";
export type VersionStatus = "DRAFT" | "PROCESSING" | "REVIEW" | "PUBLISHED" | "SUPERSEDED" | "REJECTED";

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  status: VersionStatus;
  file_hash: string;
  content_hash?: string;
  storage_path: string;
  effective_date?: string | null;
  uploaded_by: string;
  chunk_count: number;
  error_message?: string | null;
  created_at: string;
  processed_at?: string | null;
  published_at?: string | null;
}

export interface Document {
  id: string;
  title: string;
  document_type: DocumentType;
  department: string;
  location: string;
  owner: string;
  current_version_id: string | null;
  versions: DocumentVersion[];
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  version_id: string;
  content: string;
  section: string;
  page: number;
  chunk_index: number;
  metadata?: Record<string, any>;
}
