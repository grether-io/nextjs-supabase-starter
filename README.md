# Next.js + Supabase Starter (customized)

> The starter for building full-stack apps with Next.js, Supabase, and shadcn UI — adapted from the Vercel template.

**Origin:** this project was bootstrapped from the Vercel Next.js + Supabase template: https://vercel.com/templates/next.js/supabase

---

## Table of contents
- [About](#about)
- [Quick start (local)](#quick-start-local)
- [Available scripts (yarn)](#available-scripts-yarn)
- [Supabase local dev (brief)](#supabase-local-dev-brief)
- [Tech stack](#tech-stack)
- [Environment variables](#environment-variables)
- [Contributing / workflow notes](#contributing--workflow-notes)
- [References](#references)

# About
This repository is a small opinionated starter that wires up Next.js (App Router), Supabase for Auth/DB, and shadcn UI components styled with Tailwind CSS. It includes examples of authentication pages, protected routes, and a small UI kit using shadcn and lucide icons.

The README below focuses on getting this project running locally with the exact scripts included in `package.json` and explaining the role of each script.

# Quick start (local)
1. Install dependencies:

```bash
# yarn (recommended for this project)
yarn install
```

2. Create `.env.local` from `.env.example` and set your Supabase project values (see [Environment variables](#environment-variables)).

3. Start the app (two convenient helpers are provided):

- Start the Next dev server and open the browser:

```bash
yarn so
```

- Start Next, Supabase local stack (if you use Supabase CLI locally) and open both the app and Supabase UI:

```bash
yarn sos
```

Both `so` and `sos` are convenience scripts that run the dev server and open the browser automatically — see [Available scripts (yarn)](#available-scripts-yarn) for detailed explanations of what they run.

# Available scripts (yarn)
This project uses Yarn. The following scripts are defined in `package.json`. Run them with `yarn <script>`.

- `yarn dev` — Start Next.js in development mode on port 3000 (explicit port configured):

```bash
yarn dev
# runs: next dev --port 3000
```

- `yarn build` — Build the Next.js production build:

```bash
yarn build
```

- `yarn start` — Start the built Next.js production server:

```bash
yarn start
```

- `yarn lint` — Run ESLint across the project:

```bash
yarn lint
```

- `yarn install` — Alias to `yarn install` (included for parity with npm scripts in some workflows):

```bash
yarn install
```

- `yarn supabase` — Start the local Supabase stack (requires Supabase CLI & Docker):

```bash
yarn supabase
# runs: supabase start
```

- `yarn open:next` — Open the app in the default browser (uses `open-cli`):

```bash
yarn open:next
# opens http://localhost:3000
```

- `yarn open:supabase` — Open local Supabase UI in the default browser (uses `open-cli`):

```bash
yarn open:supabase
# opens http://127.0.0.1:54323 (local Supabase Studio port used in this project)
```

- `yarn dev:open` — Convenience composite: start dev server and open the browser after a short delay:

```bash
yarn dev:open
# runs: concurrently "yarn dev" "sleep 3 && yarn open:next"
```

- `yarn dev:supabase:open` — Composite that starts Next dev, starts Supabase local stack, and opens both the app and Supabase Studio after short delays:

```bash
yarn dev:supabase:open
# runs: concurrently "yarn dev" "yarn supabase" "sleep 3 && yarn open:next" "sleep 6 && yarn open:supabase"
```

- `yarn so` — Shortcut for `yarn dev:open` (starts dev server and opens browser):

```bash
yarn so
```

- `yarn sos` — Shortcut for `yarn dev:supabase:open` (starts dev server + supabase and opens both UIs):

```bash
yarn sos
```

Notes about the scripts
- `open-cli` and `concurrently` are used to launch the browser and run multiple processes in parallel.
- The `sleep` commands provide a small delay so the server has time to start before the browser opens.
- `yarn sos` assumes you have the Supabase CLI and Docker installed and configured.

# Supabase local dev (brief)
This project supports running a local Supabase stack via the Supabase CLI. Basic flow:

1. Ensure Docker is running.
2. Start local Supabase:

```bash
# from project root
yarn supabase
```

This runs `supabase start`. The project uses port `54323` for the local Supabase Studio in the `open:supabase` script — update your local cli or ports if needed.

Stop the local Supabase stack:

```bash
supabase stop
```

For a full Supabase CLI guide (migrations, seeding, branching) see `supabase-cli.md` in this repo and the official docs: https://supabase.com/docs/guides/local-development/cli/getting-started

# Tech stack
This starter wires together the following technologies:

- Next.js — React framework for production (App Router used in this project). See https://nextjs.org/
- Tailwind CSS — Utility-first CSS framework (this project uses Tailwind CSS v4.x). See https://tailwindcss.com/
- shadcn/ui — Component primitives & design system used for UI building. See https://ui.shadcn.com/
- lucide-react — Icon components used throughout the UI. See https://lucide.dev/
- Supabase — Postgres, Auth, Realtime, Storage (primary backend). See https://supabase.com/

Additionally:
- `tailwind-merge` — utility for merging Tailwind class strings safely
- `tailwindcss-animate` — animation utilities plugin

# Environment variables
Create a `.env.local` file based on `.env.example` and fill in your Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (only if needed for server-side operations)
```

Keep production secrets out of the repo and use your hosting provider's secret management for production deployments.

# Contributing & workflow notes
- Follow a feature-branch workflow. Keep database migrations in `supabase/migrations/` as SQL files.
- Use `supabase-cli.md` in this repo for migration/seeding/branching guidance.
- Prefer forward-only migrations for production; write new migrations to alter schema rather than editing merged ones.

# References
- Vercel Next.js + Supabase template: https://vercel.com/templates/next.js/supabase
- Supabase CLI local dev docs: https://supabase.com/docs/guides/local-development/cli/getting-started
- shadcn/ui docs: https://ui.shadcn.com/
- Tailwind CSS docs: https://tailwindcss.com/
- Lucide icons: https://lucide.dev/

---
