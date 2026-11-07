# CLAUDE.md — Nina: Waldorf & Steiner Education App (React SPA)

**Project:** The Waldorf Path — Comprehensive Waldorf/Steiner Education Directory  
**Live:** https://waldorf.maistermind.com | **Admin:** https://waldorf.maistermind.com/admin  
**Repo:** https://github.com/dynamicmike-dashboard/Nina-Waldorf  
**Working Dir:** `F:\Mike d drive\Mike Webs\Client Projects\Nina - Waldorf and Steiner Education App\github-files`

---

## Quick Context

**React 19 + Vite 6 + Tailwind v4 SPA** on Vercel. Teable (serverless DB), Gemini AI, Stripe, PWA.

**5 Teable Tables:**
- Mentors (`tbl6KvPXOhrVpXupA93`) — 1,073 entries
- Resources (`tblztNjIsTKuI8mxuPl`) — 55 curated
- Daily Rhythms (`tblyhpS9TM2TMKOGU8B`)
- System Admin (`tblbxAGreFEyE7Pi9PE`) — alerts, AI config
- Seekers (`tblgprvMCO9opqRjOFf`) — user accounts

---

## Critical Security (Already Fixed ✅)

| Issue | Status | Location |
|-------|--------|----------|
| Gemini key in client bundle | **Fixed** — moved to `/api/gemini` proxy | `vite.config.ts` (removed define), `api/gemini.ts` |
| Teable PAT hardcoded | **Fixed** — uses `process.env.TEABLE_API_KEY` | `api/cron.ts` |
| Admin plaintext passwords | **Fixed** — server-side verify via `/api/admin-auth` | `api/admin-auth.ts`, `workflowService.ts` |
| CSV export no consent | **Fixed** — `Export_Consent` field in Teable | `Mentor` interface, `csvUtils.ts`, UI toggles |

---

## Current Stack Versions

```
React: 19.x
Vite: 6.x
Tailwind: 4.x
TypeScript: 5.x
```

---

## Run Locally

```bash
cd "F:\Mike d drive\Mike Webs\Client Projects\Nina - Waldorf and Steiner Education App\github-files"
npm install
cp .env.example .env.local
# Add TEABLE_API_KEY, GEMINI_API_KEY to .env.local
npm run dev -- --port 5173  # Port 3000 is in use by another project
```

---

## Deploy & CI

- **Production:** Push to `main` → Vercel auto-deploy
- **Nightly rebuild:** GitHub Actions at 03:00 UTC (`.github/workflows/nightly-rebuild.yml`)
  - Requires `TEABLE_API_KEY` secret in GitHub repo (already set)
  - Runs `scripts/generate-directory-mentors.js` → commits `public/directory-mentors.json`
- **No Vercel crons** — removed from `vercel.json`

---

## Key Files to Touch

| Task | File(s) |
|------|---------|
| Add new component | `src/components/` |
| Modify Teable schema/queries | `src/services/teableService.ts` |
| Admin workflows/exports | `src/services/workflowService.ts` |
| AI/Gemini logic | `src/services/geminiService.ts`, `api/gemini.ts` |
| Smart search synonyms | `src/utils/smartSearch.ts` |
| Bundle config | `vite.config.ts` |
| PWA/offline | `public/sw.js`, `public/manifest.json` |
| SEO | `public/sitemap.xml`, `public/robots.txt` |
| Spanish content | `src/data/dir-espanol-1.json`, `src/components/LivingPanel.tsx` |

---

## Constraints (Non-Negotiable)

- ❌ **No C: drive** — work only from project folder
- ❌ **No new repos** without explicit approval
- ❌ **No Antigravity browser** — not authorized
- ❌ **No writes outside** project folder
- ⚠️ **Port 3000 in use** — use 5173 or other
- ✅ **Antigravity only from** `F:\Antigravity` (if ever needed)

---

## Environment Variables

| Var | Where | Notes |
|-----|-------|-------|
| `TEABLE_API_KEY` | Vercel + GitHub Secrets | PAT: `teable_accv7ta35BisOwLmbLa_e8LHiY5TchgXjkgSs6ymsUZYvr4oTnFzpt17o6+NHsI=` |
| `GEMINI_API_KEY` | Teable (AI Config) + Vercel fallback | New format: `YOUR_GEMINI_API_KEY_HERE` |
| `STRIPE_SECRET_KEY` | Vercel (when live) | |
| `STRIPE_USER_PREMIUM_PRICE_ID` | Vercel (when live) | Seeker Pro $9.99/mo |
| `STRIPE_MENTOR_PRO_PRICE_ID` | Vercel (when live) | Mentor Pro $19.99/mo |
| `APP_URL` | Vercel | `http://waldorf.maistermind.com` |

---

## Outstanding Low-Effort Items

1. **Accessibility audit** (WCAG 2.1 AA) — color contrast, ARIA, keyboard nav
2. **German data integration** — check for existing content, add locale
3. **Basic test suite** — Vitest + React Testing Library + CI

---

## Admin Access

- **URL:** https://waldorf.maistermind.com/admin
- **Email:** admin@thewaldorfpath.com
- **Password:** In Teable System Admin table (verified via `/api/admin-auth` — no plaintext exposure)

---
 
## Session History
 
See `wiki/summaries/` for detailed logs. Latest: `2026-07-24-nav-simplify-search-improve.md`
 
---
 
## Skills
 
**Red Team Sparring Partner** — Rigorous architectural critique mode. See `.agent/skills/red-team-sparring/SKILL.md`
 
Use this skill when reviewing code patches, AI-generated solutions, or strategic plans to:
- Critique practicality and find edge cases
- Uncover missing context by asking 5 sharp questions
- Banish LLM echo chambers
 
**Usage:** Invoke "red team review" on any proposed solution, code diff, or strategic plan.