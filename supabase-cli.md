# Supabase CLI — Local development guide

## Table of contents
- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Quick glossary](#quick-glossary)
- [Start / Stop the local stack](#start--stop-the-local-stack)
- [Migrations (create / apply / inspect / rollback)](#migrations-create--apply--inspect--rollback)
- [Seeding data](#seeding-data)
- [Branching & Migration workflow](#branching--migration-workflow)
- [Practical tips & gotchas](#practical-tips--gotchas)
- [Troubleshooting](#troubleshooting)
- [References](#references)

# Introduction
This document explains how to use the Supabase CLI for local development in this project: starting and stopping the local Supabase stack, creating and applying migrations, seeding data (via the Supabase CLI only), and recommended branching & workflow practices for database changes.

This is a concise, practical guide — for the authoritative reference see the official docs: https://supabase.com/docs/guides/local-development/cli/getting-started

# Prerequisites
- Supabase CLI installed and on your PATH (see the official docs linked above).
- Docker installed and running (the local Supabase stack runs inside Docker).
- A checked-in `supabase/` folder in the repository for migrations and SQL (e.g. `supabase/migrations/`, `supabase/seed/`).

# Quick glossary
- CLI: `supabase` — the official Supabase command line tool
- Local stack: a containerised Postgres + Realtime + Storage stack started by `supabase start`
- Migrations: sequential SQL (or JS/TS) files that modify your schema in a repeatable way
- Seeds: SQL files used to populate initial data for development/testing (run via the Supabase CLI)

# Start / Stop the local stack
Start the local Supabase stack (postgres + realtime + other services):

```bash
supabase start
```

Common useful flags:
- `--project-ref <ref>` — run with a specific project ref (if applicable)
- `--no-db` or `--db-only` — some CLI versions provide flags to only run DB or skip certain services

Stop the local stack:

```bash
supabase stop
```

Check the stack status (if supported by your CLI version):

```bash
supabase status
```

Notes
- `supabase start` will download container images the first time; expect a longer startup then.
- By default the local Postgres instance runs on a host port (commonly `54322`) — check the CLI output.

# Migrations (create / apply / inspect / rollback)
Recommended pattern
- Keep all migrations in the repository under `supabase/migrations/` (or `supabase/migrations/<timestamp>_<name>.sql` depending on your setup).
- Use the CLI to generate migration files where possible, and always include a clear descriptive name and timestamp prefix.

Create a new migration (example):

```bash
supabase migration new add_users_table
# or, if your CLI uses 'create' or 'generate':
# supabase migration create add_users_table
```

Edit the generated SQL file to add your schema changes (CREATE TABLE, ALTER TABLE, etc.). Commit the SQL file to your branch.

Apply migrations to the local database:

```bash
supabase migration apply
# or:
# supabase db push
# or (some toolings): supabase db migrate
```

Check migration status

```bash
supabase migration status
# or (CLI variant): supabase migration list
```

Rollback / revert

- Prefer creating a forward migration that undoes the change instead of mutating existing migrations that may already be applied in other environments.
- If you must rollback in local dev, use the CLI's rollback command (if available), or manually run the reversing SQL.

IMPORTANT: CLI variants
- Supabase CLI has evolved: different minor releases name migration commands slightly differently (`migration new`, `migration create`, `db push`, `db migrate`). Run `supabase --help` or check the official docs when in doubt.

# Seeding data
This project uses the Supabase CLI for seeding local development databases. The recommended place for seed files is `supabase/seed/` and files should be simple, idempotent SQL scripts.

Add or edit a seed file, for example:

```
supabase/seed/initial_data.sql
```

Then run the seed file with the Supabase CLI (command varies by CLI version):

```bash
# If your CLI supports direct seeding
supabase db seed --file supabase/seed/initial_data.sql

# Or the alternate/legacy command
supabase seed --file supabase/seed/initial_data.sql
```

Notes & best practices
- Make seed SQL idempotent where possible (`INSERT ... ON CONFLICT ...` or `TRUNCATE` + `INSERT`).
- Keep seeds lightweight so `supabase start` + `seed` is fast for developer onboarding.
- Store seeds under version control in `supabase/seed/` so every developer runs the same baseline data.

# Branching & Migration workflow
Database schema changes are part of the codebase and should be treated like code. Follow these rules to avoid migration conflicts and broken environments.

Branch-per-feature workflow (recommended):
1. Create a feature branch: `git checkout -b feature/add-payment-columns`
2. Generate a migration `supabase migration new add_payment_columns` — this creates a new SQL migration file in `supabase/migrations/`.
3. Edit the migration file, test locally (`supabase start` + `supabase migration apply`), commit the migration file with the feature branch.
4. Open a PR. If another PR adds migrations before this one merges, resolve by creating a new migration that applies the necessary adjustments — do not edit already-committed migrations that have been applied in other branches/environments.

Naming & ordering
- Use timestamp prefixes (e.g. `20260109T123000_add_users.sql`) to keep deterministic ordering.
- Do not rely on branch names for order; the migration filename is the source of truth.

Handling conflicts
- If two branches create conflicting migrations, the merge process should:
  1. Rebase the branch on main
  2. If a migration name collision or order conflict occurs, create a new migration that performs any necessary reshuffling or fixes
- Avoid editing migrations that have been merged to main and applied in other environments; instead, write new migrations to alter the schema further.

Release & deploy
- After migration files are merged to main, run the CI step that applies migrations to the staging/production database (via `supabase` CLI or your deployment pipeline). Always backup production before applying breaking migrations.

# Practical tips & gotchas
- Always check `supabase --version` and `supabase --help` for your installed CLI behaviour and available commands — the CLI surface changes across versions.
- Keep migrations small and focused (one logical change per migration).
- Prefer forward-only migrations in production; avoid destructive operations without backups and maintenance windows.
- Seed data should not contain production secrets.
- Keep the local `supabase/` folder and migration files under source control.

# Troubleshooting
- If `supabase start` fails: ensure Docker is running, and delete stale containers/images `supabase stop && docker compose rm -f`.
- If migrations fail: inspect the SQL file, run it manually with `psql` to see clearer Postgres errors.
- If seeds fail due to duplicate data, make the seed idempotent.

# References
- Official Supabase CLI docs (getting started / local development):
  https://supabase.com/docs/guides/local-development/cli/getting-started
