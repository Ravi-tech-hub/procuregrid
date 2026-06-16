# Database

This directory contains Supabase/Postgres SQL used by ProcureGrid.

- Review scripts before running them.
- Apply changes to the intended Supabase project through migrations or the SQL Editor.
- Keep Row Level Security enabled for browser-accessible tables.
- Never place credentials, exports, or production data in this directory.

Existing files are setup and repair scripts from the current authentication and company-onboarding
implementation. They should be consolidated into ordered migrations before production deployment.
