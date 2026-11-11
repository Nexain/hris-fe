# DayOne AI — HRIS Frontend

Next.js app for the DayOne onboarding copilot and HR knowledge base. It talks to the FastAPI backend (`Nexain/hris`) through a server-side proxy at `/api/proxy/*`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # auth/session unit tests
npm run lint
```

## Sign-in and identity

Each person has their own demo account. Identity is decided **on the server only**:

1. `POST /api/auth/verify` checks `{ username, password }` against `DEMO_ACCOUNTS` (PBKDF2-SHA256 hashes).
2. On success it sets the `dayone_access` cookie: `base64url({uid, exp}).base64url(HMAC-SHA256)`, signed with `SESSION_SECRET`. It's `httpOnly`, `secure` in production, `sameSite=lax`, and expires after 8 hours.
3. `src/proxy.ts` redirects pages to `/login` (and API calls to 401) without a valid session.
4. The backend proxy (`src/app/api/proxy/[...path]/route.ts`) sets `x-user-id` from the session. It **never** forwards `x-user-id`, `x-access-level` or other identity headers from the browser.
5. `GET /api/auth/me` returns `{ user_id, name, role, department, location, is_hr }`. HR status comes from the backend (`HR_ADMIN_USER_IDS`, exposed as `/profile.is_hr`). For users without a profile, it asks the HR-only `/admin/employees` endpoint (200 means HR).

HR views other employees only through the backend's read-only, HR-only `/admin/employees*` endpoints.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DEMO_ACCOUNTS` | Cloud Run secret (server only) | JSON list `[{ "user_id", "name", "password_hash" }]` |
| `SESSION_SECRET` | Cloud Run secret (server only) | At least 32 characters. Signs session cookies. Rotating it signs everyone out. |
| `BACKEND_API_URL` | optional | Backend base URL (defaults to the production Cloud Run service) |
| `GCP_BEARER_TOKEN` | local dev only | IAM token for the backend; on Cloud Run the metadata server is used |

Generate accounts and a secret (prints each password once; never commit the output):

```bash
npm run accounts:create                      # user_001, user_002, hr_admin_001
npm run accounts:create -- user_003:Rina     # or a custom list of user_id:Name
```

Without `DEMO_ACCOUNTS` nobody can sign in. In production, a missing or short `SESSION_SECRET` means no session is valid. Outside production, a built-in development secret is used so `npm run dev` works.

## Deploy

```bash
gcloud run deploy hris-fe --source . --region asia-southeast1 \
  --update-secrets DEMO_ACCOUNTS=hris-fe-demo-accounts:latest,SESSION_SECRET=hris-fe-session-secret:latest
```

Deploy the backend first, so `/admin/employees*` and `/profile.is_hr` exist when this frontend goes live.
