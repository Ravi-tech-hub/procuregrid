# ProcureGrid

ProcureGrid is a protected B2B procurement platform for Indian manufacturers and industrial SMEs.
The MVP focuses on secure company onboarding and the RFQ-to-quotation workflow for buyers,
suppliers, and platform administrators.

## Repository Structure

```text
ProcureGrid/
├── frontend/     # TanStack Start web application
├── backend/      # Backend boundary and future server modules
├── database/     # Supabase/Postgres SQL and migrations
├── docs/         # Product, architecture, and sprint documentation
├── tests/        # Cross-application integration and end-to-end tests
├── README.md
├── .env.example
├── CONTRIBUTING.md
└── ROADMAP.md
```

The current executable application lives in `frontend/`. Supabase provides authentication and the
database; no separate backend service has been introduced yet.

## Local Development

Use Node.js 22.

```bash
cp .env.example frontend/.env.local
cd frontend
npm ci
npm run dev
```

Available frontend checks:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

For Cloudflare or another deployment provider, configure `frontend/` as the project root so it can
find `package.json`, `vite.config.ts`, and `wrangler.jsonc`.

## Project Guidance

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.
- See [ROADMAP.md](ROADMAP.md) for the delivery sequence.
- See [docs/project-context.md](docs/project-context.md) for product and architecture context.
- Apply database scripts from [database/](database/) through the Supabase SQL Editor only after
  reviewing the target environment.
