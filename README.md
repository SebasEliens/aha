# AHA

AHA (Agentic HaalbaarheidsAnayses) is an agent based application for feasibility studies aimed at the construction sector in the Netherlands

## Structure

- **apps/web** – Next.js app (Vercel). Messages UI, admin at `/admin`.
- **apps/api** – FastAPI app (Fly.io). `GET/POST /messages`, `DELETE /messages` (admin).
- **packages/db** – Supabase migrations and schema.

## Development

### Option A: Local (no Docker)

```bash
# Web (from repo root)
npm install && npm run dev          # Next.js at :3000

# API (in another terminal)
cd apps/api && uv sync && uv run uvicorn app.main:app --reload --port 8000
```

Set **apps/web** env (e.g. `.env.local`): `NEXT_PUBLIC_API_URL=http://localhost:8000`.

### Option B: Full app with Docker (Postgres + API + Web)

```bash
docker compose up -d
# Postgres :5432, API :8000, Web :3000
```

Then open http://localhost:3000. The API uses local Postgres; migrations run on first start. Optional: set `ADMIN_SECRET` in `.env` (or export) for admin/delete; default is `aha-admin`.

### Option C: Postgres only in Docker, API/Web on host

```bash
docker compose up -d postgres
```

Set **apps/api** env: `DATABASE_URL=postgresql://aha:aha@localhost:5432/aha`. Run API and web as in Option A.

## Environment

### Web (Vercel)

- `NEXT_PUBLIC_API_URL` – Backend API URL (e.g. your Fly.io URL in prod).
- `ADMIN_SECRET` – Same secret as the API; used for admin login and to call `DELETE /messages` server-side. **Do not** expose to the client.

### API (Fly.io / Docker)

- `DATABASE_URL` – When set, messages are stored in PostgreSQL (e.g. local or Docker). Takes precedence over Supabase.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` – When set (and `DATABASE_URL` unset), messages are stored in Supabase; otherwise in-memory (e.g. tests).
- `ADMIN_SECRET` – Required for `DELETE /messages`. Request must include header `X-Admin-Secret: <value>`.

### Database

- **Docker**: Migrations run automatically on first `docker compose up` (init script).
- **Supabase**: Run migrations in **packages/db** (see `packages/db/README.md`). Apply the SQL in the Supabase Dashboard or use the Supabase CLI.

## Admin

- **UI**: Open `/admin`, log in with the same value as `ADMIN_SECRET`. You can then clear all messages (calls the API with the secret via a server-side route; the secret never goes to the browser).
- **API**: `DELETE /messages` with header `X-Admin-Secret: <ADMIN_SECRET>` clears all messages.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Path-filtered; runs web lint/test and API ruff + pytest when relevant paths change.
- **Deploy** (`.github/workflows/deploy.yml`): On push to `main` when `apps/web` changes, builds and deploys to Vercel (root directory `apps/web`).
