# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AHA (Agentic HaalbaarheidsAnalyses) is a feasibility analysis tool for the construction sector in the Netherlands. It consists of a Next.js 15 frontend and a FastAPI backend with a PostgreSQL database.

## Repository Structure

```
aha/
├── apps/
│   ├── web/          # Next.js 15 frontend (deployed to Vercel)
│   └── api/          # FastAPI backend (deployed to Fly.io)
└── packages/
    └── db/           # SQL migrations
```

## Commands

### Local Development

The recommended way to run the full stack locally is via Docker Compose or `just`:

```bash
just run         # Start postgres + api (background) + web dev server
just up          # docker compose up -d (full containerized stack)
just down        # docker compose down
```

Individual services:
```bash
just run-db      # Start only postgres (docker compose)
just run-api     # Start FastAPI dev server on :8000
just run-web     # Start Next.js dev server on :3000
```

### Frontend (apps/web)

All root-level npm scripts delegate to `apps/web`:

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (single run)
npm run test:watch   # Vitest watch mode
```

Run a single test file:
```bash
npm run test -- app/some.test.tsx
```

### Backend (apps/api)

```bash
cd apps/api
uv sync                        # Install dependencies
uv run uvicorn app.main:app --reload --port 8000  # Dev server
uv run pytest                  # All tests
uv run pytest tests/test_main.py::test_name -v    # Single test
uv run ruff check .            # Lint
uv run ruff format .           # Format
```

### CI Checks (run before committing)

```bash
just check   # Prettier + husky pre-commit + ruff + pre-commit hooks
just test    # Run both web and API test suites
```

## Architecture

### Message Store Pattern

The API uses a strategy pattern for storage (`apps/api/src/app/message_store/`):
- `store.py` — `MessageStore` protocol + `get_store()` factory
- `store_postgres.py` — production implementation (used when `DATABASE_URL` is set)
- `store_supabase.py` — Supabase implementation (used when Supabase env vars are set)
- Falls back to in-memory store (tests/dev without a database)

### Authentication

- **Backend**: `X-Admin-Secret` header checked against `ADMIN_SECRET` env var
- **Frontend**: Session stored in `localStorage` under key `aha_auth`; `apps/web/app/lib/admin-auth.ts` handles auth logic
- Home page (`/`) redirects to `/login` or `/chat` based on session state

### API Endpoints

FastAPI app in `apps/web/app/api/` (client) and `apps/api/src/app/main.py` (server):
- `GET /messages` — fetch all messages (newest first)
- `POST /messages` — create a message (requires non-empty `text` field)
- `DELETE /messages` — clear all messages (requires `X-Admin-Secret` header)

### Deployment

- **Web**: Vercel (project: `aha-web`), triggered by changes to `apps/web/**` on `main`
- **API**: Fly.io (containerized FastAPI)
- **Database**: PostgreSQL in Docker locally, Supabase in production
- CI is path-filtered — web and API jobs only run when their respective paths change

### Environment Variables

Docker Compose wires these automatically for local dev:
- `DATABASE_URL` — selects PostgreSQL store when set
- `ADMIN_SECRET` — shared secret for admin operations
- `CORS_ORIGINS` — allowed origins for the API
- `NEXT_PUBLIC_API_URL` — API base URL used by the frontend

For production, env vars are managed via Vercel (web) and Fly.io secrets (API).
