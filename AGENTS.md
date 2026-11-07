# AGENTS.md — The Waldorf Path PWA

Also read and follow ./CLAUDE.md in this folder; its rules apply in addition to this file.

## Project verification facts

### Exact commands (from package.json scripts)
- **Tests:** `npm test` (runs `vitest`) — from package.json scripts.test
- **Single-file test:** `npx vitest run <path>` — inferred from vitest config (vitest.config.ts)
- **Typecheck:** `npm run lint` (runs `tsc --noEmit`) — from package.json scripts.lint
- **Lint:** `npm run lint` (runs `tsc --noEmit`) — from package.json scripts.lint
- **Build:** `npm run build` (runs `npx vite build`) — from package.json scripts.build
- **Integration/e2e:** unknown — no test script defined
- **Test run (single):** `npm run test:run` (runs `vitest run`) — from package.json scripts.test:run
- **Test coverage:** `npm run test:coverage` (runs `vitest run --coverage`) — from package.json scripts.test:coverage
- **Dev server:** `npm run dev` (runs `vite --host=0.0.0.0`, port 3005) — from package.json scripts.dev
- **Preview build:** `npm run preview` (runs `vite preview`) — from package.json scripts.preview
- **Clean:** `npm run clean` (runs `rm -rf dist server.js`) — from package.json scripts.clean

### Generated code or types
- **TypeScript config:** `noEmit: true` (tsconfig.json) — no .d.ts files emitted
- **No code generation scripts** found in package.json
- **Vite bundling only** — no separate type generation command
- **Vitest setup:** `src/test/setup.ts` — from vitest.config.ts
- **Vite manual chunks:** `vite.config.ts` — splits vendor, icons, data, services into separate chunks

### Key connections between files
- **Shared types:** `src/services/teableService.ts` (TeableRecord interface), `src/services/workflowService.ts` (WaldorfResource interface, ContentArticle interface)
- **API client to server:** `src/services/teableService.ts` uses `/api/teable` proxy; Vite dev proxy targets `https://app.teable.io/api` (vite.config.ts); Vercel rewrite forwards `/api/teable/*` to `/api/teable-proxy` (vercel.json)
- **Database:** Teable (5 tables: Mentors `tbl6KvPXOhrVpXupA93`, Resources `tblztNjIsTKuI8mxuPl`, Daily Rhythms `tblyhpS9TM2TMKOGU8B`, System Admin `tblbxAGreFEyE7Pi9PE`, Seekers `tblgprvMCO9opqRjOFf`)
- **Config/env:** `.env` / `.env.example` / `.env.local`; Vite reads env via `loadEnv(mode, '.', '')` (vite.config.ts); Vercel env vars for production
- **Fixtures/mocks:** `src/data/` directory with JSON/TS data files (contentRegistry.ts, dailyData.ts, mentors.ts, etc.); `src/test/setup.ts` for test setup
- **Serverless functions:** `api/` directory (admin-auth.ts, ai-config.ts, gemini.ts, stripe-create-link.ts, stripe-success.ts, teable-proxy.js, auth/send-otp.ts, auth/session.ts, mentor-message.ts, waitlist.ts)
- **Content registry:** `src/data/contentRegistry.ts` — central registry for all app content (articles, resources, PDFs)
- **Workflow service:** `src/services/workflowService.ts` — Teable CRUD, admin workflows, auth helpers, exports

### Docs that act as operational guidance
- `CLAUDE.md` — Project memory for AI agents (stack, security, deploy, env vars, constraints)
- `README.md` — Project documentation (structure, features, env vars, deploy)
- `ENTITYOS_PROTOCOL.md` — Execution protocol (no C: drive, path verification, red team sparring)
- `PROJECT_STRUCTURE.md` — Complete file tree, Teable field mappings, component props, API endpoints
- `HANDOFF.md` — Session handoff notes and verification status
- `.agent/skills/red-team-sparring/SKILL.md` — Red Team Sparring Partner skill

### CI / Automation
- **Nightly rebuild:** `.github/workflows/nightly-rebuild.yml` — cron at 03:00 UTC, runs `scripts/generate-directory-mentors.js`, requires `TEABLE_API_KEY` secret
- **Vercel deploy:** Manual CLI deployment via `vercel --prod` (Git integration not connected — GitHub repo owned by different account)
- **No Vercel crons** — removed from `vercel.json` to avoid costs

### Constraints (Non-Negotiable)
- No C: drive usage — work only from project folder
- No new repos without explicit approval
- No Antigravity browser
- No writes outside project folder
- Port 3000 in use — use 3005 or other
- Antigravity only from `F:\Antigravity` (if needed)