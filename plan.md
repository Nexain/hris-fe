# DayOne AI — Frontend Implementation Plan & Architecture

> **Purpose:** This document is the definitive, unified implementation plan for creating the frontend for **DayOne AI (HRIS)**. It incorporates exact learnings and verified schemas from the live Google Cloud Run backend.

---

## 1. Project Overview & Verified Backend Context

**DayOne AI** is an AI-powered employee onboarding copilot and HR document management system. 
- **Backend Service:** FastAPI on Google Cloud Run
  - Production URL: `https://chatbot-hris-991560435962.asia-southeast1.run.app`
  - Local URL: `http://localhost:8000`
- **Security & Ingress:** Cloud Run is protected with Google IAM authentication. The frontend server-side proxy handles the `Authorization: Bearer <GCP_TOKEN>` header so browser clients never leak the token or face CORS issues.
- **Frontend Workspace:** `/Users/halfdeen/Naufal/Developments/hris-fe`

---

## 2. Tech Stack & Dependencies

| Layer | Tool / Library | Purpose |
|---|---|---|
| **Framework** | **Next.js 15 (App Router)** + **TypeScript** | Core application, routing, and server-side API proxy. |
| **Styling** | **Tailwind CSS** | Clean, responsive UI styling. |
| **Components** | **shadcn/ui** (Radix UI) | Accessible dialogs, tables, tabs, badges, progress bars, and buttons. |
| **Icons** | **Lucide React** | Consistent iconography. |
| **State / Fetching** | **TanStack Query (React Query v5)** | Client caching, task completion mutations, automatic invalidation. |
| **AI Rendering** | **react-markdown** + **remark-gfm** | Render formatted AI chat outputs, tables, and bullet points. |
| **Toasts** | **Sonner** | Interactive feedback on completed tasks and document uploads. |

---

## 3. Verified TypeScript Domain Models

*(Updated based on live API testing)*

Create `src/types/index.ts`:

```typescript
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
```

---

## 4. The 6 Implementation Phases

### 🔷 Phase 1: Project Scaffolding & Setup
1. **Initialize Next.js project:**
   ```bash
   cd /Users/halfdeen/Naufal/Developments/hris-fe
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
   ```
2. **Install core UI and state dependencies:**
   ```bash
   npm install @tanstack/react-query lucide-react sonner react-markdown remark-gfm clsx tailwind-merge
   ```
3. **Initialize shadcn/ui:**
   ```bash
   npx shadcn@latest init -d
   npx shadcn@latest add button card badge tabs progress dialog drawer table input textarea dropdown-menu
   ```
4. **Create Domain Types:**
   Write the TypeScript interfaces into `src/types/index.ts`.

---

### 🔷 Phase 2: Environment, API Proxy & Auth State
1. **Configure Environment (`.env.local`):**
   ```env
   BACKEND_API_URL=https://chatbot-hris-991560435962.asia-southeast1.run.app
   GCP_BEARER_TOKEN=YOUR_GCP_TOKEN_HERE
   ```
2. **Create Server-Side API Proxy (`src/app/api/proxy/[...path]/route.ts`):**
   - Forwards all browser requests from `/api/proxy/...` to Cloud Run.
   - Automatically attaches `Authorization: Bearer <GCP_BEARER_TOKEN>`.
   - Passes along application headers: `x-user-id`, `x-access-level`.
3. **Create User & Role Context (`src/context/UserContext.tsx`):**
   - Stores active user (`user_001` - Naufal) and active access level (`EMPLOYEE` vs `HR_ADMIN`).
   - Provides a role toggle helper.
4. **Build Global Navigation (`src/components/Navbar.tsx`):**
   - DayOne AI brand logo.
   - Navigation links: **Dashboard**, **Copilot Chat**, and **Knowledge Base** (visible only when in HR Admin mode).
   - **Role Switcher Dropdown / Pill:** Toggle between `👤 Employee (Naufal)` and `🛡️ HR Admin`.

---

### 🔷 Phase 3: Employee Onboarding Dashboard (`/`)
1. **Welcome & Progress Meter (`src/components/dashboard/ProgressCard.tsx`):**
   - Calls `/api/proxy/onboarding/progress`.
   - Displays percentage completed, total tasks, and remaining tasks.
2. **Onboarding Checklist (`src/components/dashboard/TaskList.tsx`):**
   - Calls `/api/proxy/tasks`.
   - Organizes tasks into tabs: **Day 1**, **Day 2**, **Day 3**.
   - Each task card shows:
     - Checkbox / Status badge.
     - Title and description.
     - Source document tag (e.g. `employee-handbook`).
3. **Interactive Task Completion:**
   - Clicking a task calls `POST /api/proxy/tasks/{task_id}/complete`.
   - React Query automatically refreshes the progress bar and shows a success toast.
4. **Quick Copilot Prompt Card:**
   - Callout banner inviting the user to ask questions about their tasks.

---

### 🔷 Phase 4: AI Onboarding Copilot Chat (`/chat`)
1. **Chat Feed (`src/components/chat/ChatContainer.tsx`):**
   - Clean scrollable message thread.
   - Blue bubbles for User, sleek grey cards for AI Copilot.
2. **Rich Markdown & Citations (`src/components/chat/MessageBubble.tsx`):**
   - Renders AI responses using `react-markdown` (bullet points, bold text, schedules).
   - **Interactive Citation Badges:** When the AI cites a policy (e.g., `📄 First Day Guide (Page 1)`), render a pill showing the source document and page number.
   - **HR Escalation Warning:** If `escalation_required: true`, show a warning banner: *"This query requires HR review."*
3. **Starter Chips & Input Bar:**
   - Quick prompt pills:
     - *"What is my Day 1 schedule?"*
     - *"How do I request my laptop?"*
     - *"Where can I find the leave policy?"*
   - Auto-expanding text area with `Enter` to send.

---

### 🔷 Phase 5: Knowledge Base & Document Manager (`/documents` — HR Admin)
1. **Documents Overview Table:**
   - Lists all company documents (`GET /api/proxy/documents`).
   - Columns: Title, Category (Policy, Handbook), Department, Version, Status (`PUBLISHED`, `REVIEW`).
2. **New Document Modal:**
   - Form with Title, Document Type dropdown, Department, and Location.
   - Calls `POST /api/proxy/documents`.
3. **Version Upload & Processing Drawer:**
   - Drag-and-drop PDF upload zone (`POST /api/proxy/documents/{id}/versions`).
   - Shows pipeline status:
     - Step 1: Uploaded (file hash generated).
     - Step 2: "Process Version" button (`POST .../process`) → shows chunk count.
     - Step 3: "Publish" button (`POST .../publish`) → updates status to `PUBLISHED`.
   - Once published, RAG chat immediately answers questions using the new document!

---

### 🔷 Phase 6: End-to-End Verification & Polish
1. **End-to-End Workflow Validation:**
   - [ ] Log in as Employee → verify 7 onboarding tasks load.
   - [ ] Complete Task 1 → verify progress bar updates to 14.3%.
   - [ ] Ask Copilot *"What is my Day 1 schedule?"* → verify grounded answer with citations.
   - [ ] Switch to HR Admin → navigate to `/documents`.
   - [ ] Check published status for `first-day-guide`.
2. **UI Polishing:**
   - Add loading skeleton animations for tasks and document lists.
   - Ensure responsive layout on mobile and desktop.
   - Verify zero console errors and clean build (`npm run build`).

---

## 5. Google Cloud Run Deployment Configuration

To deploy the Next.js frontend to **Google Cloud Run** in your existing GCP project (`trim-mile-509201-d8`, region `asia-southeast1`):

### 5.1. Configure `next.config.ts` for Standalone Output
In `next.config.ts`, enable standalone mode so Next.js generates a minimal production bundle:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

### 5.2. Production Multi-Stage `Dockerfile`
Create `Dockerfile` in the root of `hris-fe`:

```dockerfile
# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Rebuild the source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary static assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
```

### 5.3. Create `.dockerignore`
```text
node_modules
.next
.git
.env*.local
README.md
plan.md
```

### 5.4. Deploy to Google Cloud Run Command
Run this command from inside `/Users/halfdeen/Naufal/Developments/hris-fe`:

```bash
gcloud run deploy hris-frontend \
  --source . \
  --project trim-mile-509201-d8 \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars BACKEND_API_URL=https://chatbot-hris-991560435962.asia-southeast1.run.app,GCP_BEARER_TOKEN=YOUR_GCP_TOKEN_HERE
```

---

## 6. Verification Checklist

| Test Item | Expected Result |
|---|---|
| **Health Check** | Next.js server proxies `/api/proxy/health` returning `status: "ok"`. |
| **Profile Load** | Returns `user_001` (Naufal, Backend Engineer). |
| **Task Completion** | Marking task complete reflects instantly without full page reload. |
| **RAG Grounding** | Chat answers contain citations referencing exact document sections. |
| **Admin Protection** | Document upload actions require HR Admin mode. |
| **Cloud Run Production** | Frontend deployed to `https://hris-frontend-xxxx.run.app` runs seamlessly on Google Cloud. |

