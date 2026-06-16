# AGENTS.md

## Purpose

Instructions for Codex and contributors working on this repository. Follow them before editing code.
Prefer small, testable changes. Preserve existing behaviour unless the task explicitly changes it. Repository configuration and working code take precedence over assumptions in this file.

## Project Overview

This project is a B2B procurement platform connecting buyers, suppliers, and administrators.

### Core MVP flow

1. A buyer creates an RFQ.
2. An admin reviews it and assigns approved suppliers.
3. Suppliers submit quotations.
4. The buyer compares price, delivery time, and supplier information.
5. The buyer shortlists or selects a quotation.

### Roles

- `buyer`: creates RFQs and reviews quotations.
- `supplier`: completes verification, views assigned RFQs, and submits quotations.
- `admin`: approves suppliers, manages RFQs, assigns suppliers, and monitors activity.

### MVP boundaries

Do not add the following unless explicitly requested:

- Full ERP, accounting, inventory, or logistics modules.
- Escrow, payments, credit, or underwriting.
- Automated GST verification.
- AI supplier matching or quotation scoring.
- Public supplier marketplace search.
- Native mobile applications.
- Complex third-party ERP integrations.

Keep the product focused on validating the RFQ-to-quotation workflow.

## Expected Technology Stack

Confirm the actual repository before relying on these assumptions:

- TanStack Start
- React
- TypeScript
- Supabase Auth
- PostgreSQL through Supabase
- Supabase Row Level Security
- npm, unless another lockfile is present

Use existing libraries and patterns before installing alternatives.

## Repository Inspection

Before changing code, inspect the project:

```bash
pwd
find . -maxdepth 2 -type f | sort | sed -n '1,200p'
cat frontend/package.json
```

Check configuration when present:

```bash
cat frontend/tsconfig.json 2>/dev/null || true
cat frontend/vite.config.ts 2>/dev/null || true
cat frontend/eslint.config.* 2>/dev/null || true
cat .prettierrc* 2>/dev/null || true
```

Use the package manager selected by the lockfile:

- `package-lock.json`: npm
- `pnpm-lock.yaml`: pnpm
- `yarn.lock`: Yarn

Never create a second lockfile.

## Setup

Commands below assume npm. Replace them only when the repository uses another package manager.

### Install dependencies

```bash
cd frontend && npm ci
```

Use `npm install` only when deliberately changing dependencies or when no lockfile exists.

### Configure environment

```bash
cp .env.example frontend/.env.local
```

Never commit secrets. Never expose service-role keys in browser code.

Typical variables may include:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
APP_URL=http://localhost:3000
```

Follow the existing variable names in `.env.example` and source code.

### Supabase

Use these commands only when the repository contains Supabase configuration:

```bash
npx supabase start
npx supabase status
npx supabase db reset
```

Create migrations instead of manually changing shared databases:

```bash
npx supabase migration new descriptive_name
```

Regenerate database types after schema changes, using the repository's existing output path:

```bash
npx supabase gen types typescript --local > frontend/src/types/database.types.ts
```

Never run destructive remote database commands unless the task explicitly requires it and the target environment is confirmed.

## Development Commands

Inspect `frontend/package.json` and run its scripts from `frontend/`. Common commands are:

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

Do not claim a command works unless it exists and has been run successfully.

Use the framework's development server for hot reload. Do not create custom watch scripts unless necessary.

## Change Workflow

For every task:

1. Read the relevant routes, components, services, schema, and tests.
2. Identify the smallest complete change.
3. Reuse existing components, utilities, and conventions.
4. Implement server-side validation and authorization.
5. Add or update tests for changed behaviour.
6. Run focused checks first, then broader checks.
7. Review the diff for unrelated changes.

Useful commands:

```bash
git status --short
git diff --check
git diff
```

Do not rewrite unrelated files, rename broad areas, or perform speculative refactors.

## File Size and Structure

No source-code file should exceed **400 lines of code**.

When a file approaches or exceeds 400 LOC:

1. Determine whether splitting it improves readability, reuse, testing, or ownership.
2. If beneficial, restructure it into focused files such as components, hooks, services, schemas, constants, or utilities.
3. Keep the original public interface stable where practical.
4. Avoid meaningless splitting that creates excessive indirection or tightly coupled fragments.
5. If restructuring would make the code worse, keep the file intact only when there is a strong technical reason and document that reason in the change summary.

Prefer addressing file growth before adding substantial new logic. Do not reduce line count using compressed formatting, long one-line expressions, or removed readability.

## Code Style

### TypeScript

- Use strict types; avoid `any` unless unavoidable and explained.
- Prefer `unknown` plus validation for untrusted input.
- Use `type` for unions and aliases; follow existing conventions for object shapes.
- Keep functions focused and use early returns.
- Do not duplicate generated database types.
- Remove unused code instead of commenting it out.

### React

- Use functional components and hooks.
- Keep data loading and mutations separate from presentation where practical.
- Extract reusable behaviour into hooks or services.
- Do not store derived values in state.
- Provide explicit loading, empty, error, and success states.
- Preserve accessibility: labels, keyboard navigation, semantic elements, and visible focus states.

### Naming

Follow repository conventions. Otherwise use:

- Components: `PascalCase`
- Hooks: `useSomething`
- Variables and functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE` only for true constants
- Database tables and columns: `snake_case`
- Boolean names: `is`, `has`, `can`, or `should` prefixes

Use descriptive domain names such as `rfq`, `quotation`, `supplierApproval`, and `organizationId`.

### Imports

- Use existing aliases where configured.
- Prefer named exports unless the framework requires defaults.
- Avoid circular dependencies.
- Do not create barrel files that hide dependency cycles or increase bundle size unnecessarily.

### Formatting and linting

Use the repository's formatter and linter. Do not manually reformat unrelated files.

```bash
npm run lint
npm run format --if-present
npm run typecheck --if-present
```

## Architecture Rules

- UI components must not contain privileged database logic.
- Centralize database access in the existing server or data-access layer.
- Validate all external input at the server boundary.
- Enforce authorization on the server, not only in the UI.
- Use database transactions for multi-step writes that must succeed together.
- Store timestamps consistently, preferably in UTC.
- Preserve auditability for important administrative actions.

Before creating a table, route, service, hook, or component, search for an existing equivalent.

## Domain Rules

Treat these as invariants unless requirements explicitly change:

- Suppliers cannot access assigned RFQs until approved.
- Suppliers can access only RFQs assigned to their organization.
- Buyers can access only their organization's RFQs and quotations.
- Admin-only actions require server-side admin checks.
- Quotations must belong to a valid RFQ assignment.
- Closed or expired RFQs cannot accept quotations.
- Monetary values must use fixed-precision database types, never floating-point arithmetic.
- Status changes must be validated; do not accept arbitrary status strings.

Do not imply that the platform guarantees supplier quality or transaction outcomes.

## Testing

Use the test framework already configured in the repository. Do not introduce another framework without justification.

Expected test categories:

- Unit tests for validation, calculations, and state transitions.
- Integration tests for database access, permissions, and server actions.
- End-to-end tests for critical user journeys.

Prioritize these flows:

1. Authentication and role access.
2. Supplier approval and rejection.
3. RFQ creation and validation.
4. Supplier assignment.
5. Quotation submission and update rules.
6. Buyer quotation comparison.
7. Unauthorized access prevention.

Follow existing naming conventions. Otherwise use:

```text
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
```

Run focused tests while developing, then the full suite before completion. Use scripts defined in `package.json`, for example:

```bash
npm test -- path/to/file.test.ts
npm test -- --runInBand
npm run test:e2e
npm run test:coverage
```

Do not lower coverage thresholds or delete failing tests merely to make checks pass.

## Security

- Never commit secrets, tokens, passwords, private keys, or production data.
- Never send the Supabase service-role key to the client.
- Enforce RLS for browser-accessible Supabase tables.
- Treat client role values and organization IDs as untrusted.
- Verify membership and permissions server-side.
- Validate and sanitize all input.
- Avoid exposing sensitive supplier, buyer, or admin data in logs.
- Use safe error messages for users and detailed server-side logging where appropriate.
- Review new dependencies for necessity and known risk.

Any schema change involving roles or access must include corresponding RLS and authorization review.

## Database Changes

- Use migrations for all schema changes.
- Never edit an already-shared migration unless the repository workflow explicitly allows it.
- Include indexes for frequently filtered foreign keys and status fields when justified.
- Add constraints for required invariants.
- Update generated database types after migration changes.
- Update seed data and tests when required.

Keep authorization rules close to the schema through RLS, while retaining server-side checks for privileged actions.

## Build and Deployment

Before considering a task complete, run all available checks:

```bash
npm run lint --if-present
npm run typecheck --if-present
npm test --if-present
npm run build
```

Do not deploy from an unclean working tree unless explicitly requested.

Environment-specific behaviour must use environment variables. Do not hard-code URLs, project IDs, credentials, or production-only values.

Database migrations must be applied before deploying code that depends on them. Preserve the repository's existing CI/CD and hosting configuration.

## Pull Requests and Commits

Keep each change focused.

Recommended commit format:

```text
feat: add supplier quotation form
fix: prevent quotes on closed RFQs
refactor: split RFQ service by responsibility
test: cover supplier assignment permissions
chore: update development configuration
```

Before submission:

- Confirm the requested behaviour works.
- Run relevant tests, linting, type checks, and build.
- Include migrations and generated types when applicable.
- Remove debug logs and temporary code.
- Check that no secret or environment file is staged.
- Explain important decisions and any checks that could not be run.

## Debugging

When debugging:

1. Reproduce the issue.
2. Read the complete error and stack trace.
3. Identify whether it originates in UI, server logic, authentication, RLS, schema, or environment configuration.
4. Add temporary targeted logging without sensitive data.
5. Fix the underlying cause rather than suppressing the error.
6. Remove temporary logging and add a regression test.

Common checks:

```bash
npx supabase status
npm run typecheck --if-present
npm run lint --if-present
git diff --check
```

For permission issues, inspect both server authorization and Supabase RLS policies.

## Completion Criteria

A task is complete only when:

- The requested behaviour is implemented.
- Existing conventions and MVP boundaries are respected.
- Authorization and validation are enforced server-side.
- Relevant tests are added or updated.
- Available lint, type-check, test, and build commands pass.
- No source-code file exceeds 400 LOC without a documented technical reason.
- No secrets, debug code, unrelated formatting, or accidental files are included.
- The final summary states what changed and which checks were run.
