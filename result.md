# Phase 1 Execution Report: Project Scaffolding & Setup

> **Project:** DayOne AI Frontend (`hris-fe`)  
> **Status:** ✅ Completed  
> **Date:** October 10, 2026  

---

## 1. Summary of Actions Executed

Phase 1 established the foundation for the DayOne AI frontend inside `/Users/halfdeen/Naufal/Developments/hris-fe`.

1. **Verified Node.js & npm Runtime:**
   - Node.js v26.x and npm v11.x were confirmed available in the local terminal.
2. **Scaffolded Next.js 15 (App Router):**
   - Initialized project with TypeScript, Tailwind CSS v4, ESLint, `src/` directory, and `@/*` path alias.
3. **Installed Application Dependencies:**
   - `@tanstack/react-query`: For server state management and instant optimistic UI task completion.
   - `lucide-react`: For modern, consistent UI iconography.
   - `sonner`: For minimal toast notifications.
   - `react-markdown` & `remark-gfm`: To render AI responses with markdown lists, tables, and bold highlights.
   - `clsx` & `tailwind-merge`: For utility-first CSS class manipulation.
4. **Created Domain TypeScript Types (`src/types/index.ts`):**
   - Configured exact interfaces matching the live Google Cloud Run backend (`UserProfile`, `OnboardingTask`, `OnboardingProgress`, `Citation`, `ChatResponse`, `Document`, `DocumentVersion`).
5. **Configured Cloud Run Standalone Build (`next.config.ts`):**
   - Added `output: "standalone"` to optimize Docker build sizes for Google Cloud Run deployment.
6. **Verified Production Build:**
   - Ran `npm run build` to verify TypeScript compiler and Next.js bundling pass with 0 errors.

---

## 2. Blockers Encountered & Solutions Applied

### Blocker 1: Missing Node.js Environment
* **Symptom:** Terminal returned `zsh:1: command not found: node`.
* **Cause:** Node.js had not yet been installed on the macOS machine.
* **Solution:** Installed Node.js via Homebrew (`brew install node`).

---

### Blocker 2: `create-next-app` Non-Empty Directory Conflict
* **Symptom:** When running `create-next-app` directly into `/Users/halfdeen/Naufal/Developments/hris-fe`, the CLI aborted with:
  ```text
  The directory hris-fe contains files that could conflict:
    plan.md
  Either try using a new directory name, or remove the files listed above.
  ```
* **Cause:** Next.js's CLI has a strict safeguard that prevents scaffolding in any directory containing existing files.
* **Solution:**
  1. Initialized Next.js into a temporary staging folder (`.../scratch/next-init`).
  2. Transferred 100% of the generated files (`node_modules`, `src/`, `package.json`, `tsconfig.json`, etc.) directly into `/Users/halfdeen/Naufal/Developments/hris-fe/`.
  3. Cleaned up and deleted the temporary staging folder.
  4. Result: `plan.md` was preserved intact without data loss, and the Next.js project is fully housed in `hris-fe`.

---

## 3. Files Created & Modified

| File / Folder | Purpose |
|---|---|
| [`src/types/index.ts`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/types/index.ts) | Verified domain models for tasks, profiles, AI chat, citations, and documents. |
| [`next.config.ts`](file:///Users/halfdeen/Naufal/Developments/hris-fe/next.config.ts) | Enabled `output: "standalone"` for Cloud Run containerization. |
| [`package.json`](file:///Users/halfdeen/Naufal/Developments/hris-fe/package.json) | Configured scripts and installed all runtime/dev packages. |
| `src/app/` | Base Next.js App Router root layout and home page. |
| `public/` | Static assets directory. |
| [`plan.md`](file:///Users/halfdeen/Naufal/Developments/hris-fe/plan.md) | Preserved frontend architectural blueprint and 6 implementation phases. |

---

## 4. Verification & Testing Output

Ran production build check:

```bash
cd /Users/halfdeen/Naufal/Developments/hris-fe
npm run build
```

**Output:**
```text
▲ Next.js 16.4.0 (Turbopack)
✓ Running next.config.ts took 1220ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 1450ms
✓ Finished TypeScript in 637ms 
✓ Generating static pages using 5 workers (4/4) in 149ms
✓ Finalizing page optimization in 80ms 

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

---

## 5. How to Run Locally

To start the local development server:

```bash
cd /Users/halfdeen/Naufal/Developments/hris-fe
npm run dev
```

Open your browser at: **`http://localhost:3000`**

---

# Phase 2 Execution Report: Environment, Server-Side API Proxy & Role Switcher

> **Status:** ✅ Completed  
> **Date:** October 10, 2026  

---

## 1. Summary of Actions Executed

1. **Configured Environment (`.env.local`):**
   - Configured `BACKEND_API_URL=https://chatbot-hris-991560435962.asia-southeast1.run.app`.
   - Set `GCP_BEARER_TOKEN` with the Google Cloud IAM identity token.
2. **Created Server-Side API Proxy Route (`src/app/api/proxy/[...path]/route.ts`):**
   - Implemented dynamic Next.js 15 Route Handlers (`GET`, `POST`, `PUT`, `DELETE`).
   - Forwards client calls to Cloud Run, automatically injecting:
     - `Authorization: Bearer <GCP_BEARER_TOKEN>`
     - `x-user-id` and `x-access-level` headers.
   - Solves browser CORS and prevents exposing the Google Cloud IAM token to client-side code.
3. **Built User & Role Context (`src/context/UserContext.tsx`):**
   - Default user initialized as `user_001` (Naufal, Backend Engineer, Jakarta).
   - Provides seamless toggle between `EMPLOYEE` and `HR_ADMIN` perspectives.
   - Persists persona selection in `localStorage`.
4. **Built Client-Side API Utility (`src/lib/api.ts`):**
   - Type-safe wrapper for `GET`, `POST`, `PUT`, and `upload` (multipart form data) communicating with `/api/proxy`.
5. **Created Global Providers (`src/app/providers.tsx`):**
   - Configured `@tanstack/react-query` `QueryClientProvider` with 30-second stale time.
   - Mounted `UserProvider` and Sonner's `Toaster` notifications.
6. **Built Header Navigation (`src/components/Navbar.tsx`):**
   - DayOne AI brand with logo and tagline.
   - Dynamic tab navigation (`/` Onboarding, `/chat` Copilot Chat, `/documents` Knowledge Base).
   - Interactive Role Switcher pill in the top-right corner.
7. **Updated Root Layout (`src/app/layout.tsx`):**
   - Integrated `Providers` and `Navbar` with responsive max-width container.

---

## 2. Blockers & Solutions

* **Blocker:** Next.js 15 App Router handles `params` asynchronously as a `Promise<{ path: string[] }>`. Traditional synchronous access (`params.path`) causes runtime warnings/errors in Next.js 15.
* **Solution:** Used `await context.params` in `route.ts`, ensuring compatibility with Next.js 15.

---

## 3. Files Created & Modified

| File | Purpose |
|---|---|
| [`.env.local`](file:///Users/halfdeen/Naufal/Developments/hris-fe/.env.local) | Backend URL and GCP Bearer token configuration. |
| [`src/app/api/proxy/[...path]/route.ts`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/app/api/proxy/[...path]/route.ts) | Server-side API proxy route forwarding to Cloud Run. |
| [`src/context/UserContext.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/context/UserContext.tsx) | Role switching state between Employee and HR Admin. |
| [`src/lib/api.ts`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/lib/api.ts) | Type-safe API client utility. |
| [`src/app/providers.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/app/providers.tsx) | React Query and UserContext providers wrapper. |
| [`src/components/Navbar.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/Navbar.tsx) | Header navigation with role switcher button. |
| [`src/app/layout.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/app/layout.tsx) | Root application layout with Providers and Navbar. |

---

## 4. Build Verification

```bash
npm run build
```

**Result:**
```text
▲ Next.js 16.4.0 (Turbopack)
- Environments: .env.local
✓ Compiled successfully in 530ms
✓ Finished TypeScript in 764ms 
✓ Generating static pages using 6 workers (4/4) in 158ms

Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /api/proxy/[...path] (Dynamic API proxy route)
```

---

# Phase 3 Execution Report: Employee Onboarding Dashboard

> **Status:** ✅ Completed  
> **Date:** October 10, 2026  

---

## 1. Summary of Actions Executed

1. **Built `ProgressCard` Component (`src/components/dashboard/ProgressCard.tsx`):**
   - Fetches live progress from `/api/proxy/onboarding/progress` via React Query.
   - Dynamic SVG progress circle displaying current completion percentage.
   - Highlights user identity: *"Welcome to the team, Naufal! Day 1 of Your Onboarding"*.
   - Displays task counter breakdown (Completed vs Remaining).
2. **Built `CopilotBanner` Component (`src/components/dashboard/CopilotBanner.tsx`):**
   - High-contrast gradient callout banner introducing the AI Onboarding Copilot.
   - Clickable starter prompt chips (*"What is my schedule for Day 1?"*, *"How do I request my laptop and equipment?"*, *"Where can I find the company leave policy?"*).
   - Direct CTA button linking to `/chat`.
3. **Built `TaskList` Component (`src/components/dashboard/TaskList.tsx`):**
   - Fetches onboarding checklist from `/api/proxy/tasks`.
   - Day filter pills: **All Tasks (7)**, **Day 1 (3)**, **Day 2 (2)**, **Day 3 (2)**.
   - Interactive task completion:
     - Clicking checkbox sends `POST /api/proxy/tasks/{id}/complete`.
     - React Query invalidates `onboarding-tasks` and `onboarding-progress` queries.
     - Triggers Sonner celebration toast: *"Task marked as completed! 🎉"*.
     - Source document badges indicating reference documents (e.g., `employee-handbook`, `it-security-guide`).
     - *"Ask Copilot"* shortcut button next to every task.
4. **Assembled Dashboard Home Page (`src/app/page.tsx`):**
   - Replaced default Next.js template with clean, production-ready dashboard.

---

## 2. Blockers & Solutions

* No blockers encountered. All components integrated seamlessly with `UserContext`, `ApiClient`, and the server-side proxy.

---

## 3. Files Created & Modified

| File | Purpose |
|---|---|
| [`src/components/dashboard/ProgressCard.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/dashboard/ProgressCard.tsx) | Live progress ring and employee welcome banner. |
| [`src/components/dashboard/CopilotBanner.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/dashboard/CopilotBanner.tsx) | Copilot introduction banner with quick question chips. |
| [`src/components/dashboard/TaskList.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/dashboard/TaskList.tsx) | Interactive day-by-day checklist with completion triggers. |
| [`src/app/page.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/app/page.tsx) | Assembled dashboard root page. |

---

## 4. Build Verification

```bash
npm run build
```

**Result:**
```text
▲ Next.js 16.4.0 (Turbopack)
- Environments: .env.local
✓ Compiled successfully in 489ms
✓ Finished TypeScript in 705ms 
✓ Generating static pages using 6 workers (4/4) in 154ms
✓ Finalizing page optimization in 85ms 

Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /api/proxy/[...path]
```

---

## 5. Phase 3 — Revision 1: Role-Aware Persona & HR Audit View

* **Problem Addressed:** Toggling to HR Admin previously kept the personal employee greeting ("Welcome to the team, Naufal!") and allowed HR Admin to check off employee tasks.
* **Enhancements Implemented:**
  1. **Dual Persona State ([`src/context/UserContext.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/context/UserContext.tsx)):**
     - When switched to HR Admin, identity changes to **HR Admin (People Operations Lead)**.
     - Maintains `inspectedEmployee` reference targeting `user_001` (Naufal).
  2. **HR Oversight Header ([`src/components/dashboard/ProgressCard.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/dashboard/ProgressCard.tsx)):**
     - Header dynamically updates to: *"Employee Onboarding Monitor 📊 (Overseeing onboarding milestones for new hire Naufal)"*.
     - Progress ring displays *"Naufal's Progress: 14%"* in purple accent.
  3. **HR Knowledge Base Banner ([`src/components/dashboard/CopilotBanner.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/dashboard/CopilotBanner.tsx)):**
     - Shifts to deep purple gradient with direct CTA to *"Manage Knowledge Base →"* (`/documents`).
  4. **Read-Only Inspection Mode ([`src/components/dashboard/TaskList.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/dashboard/TaskList.tsx)):**
     - Replaces clickable checkboxes with audit badges (*"Completed by Employee"* vs *"Pending Employee Action"*).
     - Protects employee task integrity while giving HR Admin full visibility.

---

## 6. Phase 3 — Revision 2: Multi-User & Multi-Role Support

* **New Employee Created in Cloud Run & Firestore:**
  - `user_002`: **Afif** (Product Designer, Design, Jakarta).
  - Backend auto-generated role-specific tasks for Design (e.g. Task 5: *"Review departmental onboarding materials for Design"* instead of engineering repository setup).
* **Frontend Multi-Persona Selector ([`src/components/Navbar.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/Navbar.tsx)):**
  - Dropdown selector supporting:
    - 👨‍💻 **Naufal** (Backend Engineer)
    - 🎨 **Afif** (Product Designer)
    - 🛡️ **HR Admin** (People Operations)
* **HR Admin Employee Inspection Bar ([`src/components/dashboard/ProgressCard.tsx`](file:///Users/halfdeen/Naufal/Developments/hris-fe/src/components/dashboard/ProgressCard.tsx)):**
  - HR Admins can click between inspecting Naufal's onboarding (14% complete) or Afif's onboarding (0% complete) with instant live progress and checklist switching.




