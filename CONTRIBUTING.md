# Contributing to ProcureGrid

## Getting Started

1. Read `AGENTS.md` and the relevant documentation under `docs/`.
2. Use Node.js 22 as specified by `frontend/.nvmrc`.
3. Copy `.env.example` to `frontend/.env.local` and add local Supabase credentials.
4. Run `npm ci` from `frontend/`.
5. Create a focused branch and keep unrelated changes out of the same commit.

## Repository Ownership

- `frontend/`: TanStack Start UI, routes, client auth, and server-capable web application code.
- `backend/`: future privileged services that do not belong in browser-accessible code.
- `database/`: Supabase/Postgres schema, functions, RLS policies, migrations, and repair scripts.
- `docs/`: product decisions, architecture, and sprint planning.
- `tests/`: integration and end-to-end tests spanning repository boundaries.

## Validation

Run these commands before opening a pull request:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

Never commit `.env.local`, service-role keys, production data, or generated build output.

Deployment and CI commands for the web application must use `frontend/` as their working directory.
