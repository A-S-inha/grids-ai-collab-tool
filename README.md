# grids-ai-collab-tool

Collaboration dashboard UI (Next.js in `frontend/`) backed by a separate FastAPI API in `backend/`. The frontend handles routing and layout (`/` landing, `/dashboard` app). AI task generation and email invites go through the backend, not Next route handlers.

## Prerequisites

- **Node.js** (for the frontend)
- **Python 3.10+** (for the backend)

## Frontend

From the repo root:

```bash
npm install --prefix frontend
npm run dev
```

Or `cd frontend && npm install && npm run dev`.

Open [http://localhost:3000](http://localhost:3000).

### Frontend environment

In development, API calls default to `http://localhost:8000` when unset. For production or a non-default API host, set:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-host.example.com
```

(No trailing slash.)

## Backend

```bash
cd backend
python -m pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and adjust values. Settings load from `backend/.env` regardless of your current shell directory.

Start the server from the repo root:

```bash
npm run dev:backend
```

Or from `backend/`:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health).

### Backend environment (summary)

| Variable | Purpose |
|----------|---------|
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API (e.g. `http://localhost:3000`). |
| `PUBLIC_APP_URL` | Public web app URL with no trailing slash; used in Supabase invite redirects. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Required for **project invites** (`POST /v1/project-invites`). Use the **service_role** key only on the server; never expose it to the client. |
| `NIM_API_KEY` or `NVIDIA_API_KEY` | One NVIDIA API key is enough for **AI task generation**; either variable name is accepted. |
| `NIM_BASE_URL`, `NIM_MODEL` | Optional overrides (defaults match NVIDIA’s hosted NIM chat API). |
| `NIM_FALLBACK_MOCK` | Set to `true` for mock tasks when NIM is missing or errors (local development). |

See `backend/.env.example` for the full list.

## Running both locally

Use two terminals:

1. `npm run dev` — Next.js on port 3000  
2. `npm run dev:backend` — FastAPI on port 8000  

Then use the dashboard features that call AI generation or invites; they target `{NEXT_PUBLIC_API_BASE_URL or http://localhost:8000}/v1/...`.

## API surface (v1)

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/health` | Liveness check |
| `POST` | `/v1/ai/generate-tasks` | Generates tasks via NVIDIA NIM (or mock if configured) |
| `POST` | `/v1/project-invites` | Sends Supabase email invites (requires service role) |

## Repo scripts (root `package.json`)

| Script | Action |
|--------|--------|
| `npm run dev` | Next.js dev server |
| `npm run dev:backend` | Uvicorn with reload on port 8000 |
| `npm run build` | Production build of the frontend |
| `npm run lint` | ESLint for the frontend |
