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

