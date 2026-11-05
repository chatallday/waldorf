<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# The Waldorf Path — Nina: Waldorf & Steiner Education App

**Live:** https://waldorf.maistermind.com | **Admin:** https://waldorf.maistermind.com/admin  
**GitHub:** https://github.com/dynamicmike-dashboard/Nina-Waldorf  
**Deploy:** Vercel (auto-deploy from main branch)

---

## Project Overview

The world's most comprehensive curated directory for Waldorf and Steiner education — connecting parents, homeschoolers, teachers, and practitioners with 1,000+ vetted mentors, schools, and makers worldwide.

### Tech Stack
- **React 19 + Vite 6 + Tailwind v4** SPA
- **Teable** serverless database (5 tables)
- **Gemini AI** concierge for semantic search & guidance
- **Stripe** payments (Seeker Pro $9.99/mo, Mentor Pro $19.99/mo, Featured profiles)
- **PWA** with offline support, installable on mobile/desktop

### Primary Audiences
1. Parents & homeschoolers seeking curriculum, mentors, seasonal rhythms
2. Waldorf teachers & mentors wanting directory visibility
3. Schools, training institutes, makers listing services
4. Therapeutic/curative practitioners (extra lesson, anthroposophic medicine)

---

## Project Structure

```
github-files/
├── api/                          # Vercel serverless functions
│   ├── admin-auth.ts            # Server-side admin verification (hides passwords)
│   ├── ai-config.ts             # Teable-backed AI key store (GET/POST)
│   ├── cron.ts                  # Nightly directory rebuild (uses TEABLE_API_KEY)
│   ├── gemini.ts                # Server-side Gemini proxy (key not in client bundle)
│   ├── stripe-create-link.ts    # Stripe checkout session creation
│   ├── stripe-success.ts        # Stripe success handler
│   └── teable-proxy.js          # Teable API proxy
├── public/                       # Static assets served as-is
│   ├── documents/               # PDF/HTML documents for ReadingRoom
│   ├── sw.js                    # Service worker (PWA offline)
│   ├── manifest.json            # PWA manifest
│   ├── sitemap.xml              # SEO sitemap
│   ├── robots.txt               # SEO robots
│   └── *.png, *.jpeg            # Logos, banners, favicon
├── src/
│   ├── components/              # React components
│   │   ├── ArticleViewer.tsx    # Document/PDF viewer
│   │   ├── ChatWindow.tsx       # AI concierge (Gemini)
│   │   ├── DocumentPanel.tsx    # 60+ articles/pdfs with full-text search
│   │   ├── EnhancedDirectory.tsx # 4-tab mentor finder (search, wizard, shortlist, admin)
│   │   ├── ErrorBoundary.tsx    # Friendly crash page
│   │   ├── GlobalSearchBar.tsx  # AI-powered cross-wiki search (13 sources)
│   │   ├── LivingPanel.tsx      # Head/Heart/Hands + Español tab (33 topic pills)
│   │   ├── MentorPanel.tsx      # Mentor profile detail modal
│   │   ├── ProfilePanel.tsx     # Multi-role dashboard (mentor/seeker/admin)
│   │   ├── ReadingRoom.tsx      # Curated guides & Steiner texts
│   │   └── ResourcesPanel.tsx   # Curated resource hub (128 Teable + 7 local)
│   ├── data/                    # Static data & manifests
│   │   ├── contentRegistry.ts   # Content registry for search
│   │   ├── dailyData.ts         # Daily rhythms content
│   │   ├── directory-extracted-cards.json
│   │   ├── directory-extracted-linklist.json
│   │   ├── directoryMentors.ts  # Directory mentor utilities
│   │   ├── dir-english-1.json   # English directory (legacy)
│   │   ├── dir-english-2.json   # English directory (legacy)
│   │   ├── dir-espanol-1.json   # Spanish directory (245 songs, 20 books, 26 cards)
│   │   ├── guidesManifest.ts    # ReadingRoom guides manifest
│   │   ├── grounding.ts         # Grounding exercises
│   │   ├── mentors.ts           # Local mentor data
│   │   ├── societyCuration.ts   # Society/organization curation
│   │   └── temperamentCuration.ts # Temperament-based recommendations
│   ├── services/                # Business logic & API clients
│   │   ├── documentService.ts   # Document fetching & search
│   │   ├── geminiService.ts     # Gemini AI client (uses /api/gemini proxy)
│   │   ├── teableService.ts     # Teable CRUD operations
│   │   └── workflowService.ts   # Admin workflows, auth, exports
│   ├── utils/                   # Utilities
│   │   ├── csvUtils.ts          # CSV export (with GDPR consent filter)
│   │   ├── smartSearch.ts       # Synonym + grade normalization
│   │   └── toastUtils.ts        # Toast notifications
│   ├── App.tsx                  # Root component, routing, providers
│   ├── index.css                # Tailwind v4 + custom styles
│   └── main.tsx                 # Entry point
├── scripts/
│   └── generate-directory-mentors.js  # Nightly rebuild script
├── wiki/summaries/              # Session summaries & decisions
├── .github/workflows/
│   └── nightly-rebuild.yml      # GitHub Actions: 03:00 UTC rebuild
├── dist/                        # Production build output (Vercel)
├── vercel.json                  # Vercel config (no crons)
├── vite.config.ts               # Vite config (bundle splitting, no define for API keys)
├── tsconfig.json                # TypeScript config
├── .env                         # Local env (not committed)
├── .env.example                 # Env template
└── .env.local                   # Local overrides
```

---

## Teable Tables

| Table | ID | Records | Purpose |
|-------|-----|---------|---------|
| Mentors | `tbl6KvPXOhrVpXupA93` | ~1,073 | Mentor/school/maker directory |
| Resources | `tblztNjIsTKuI8mxuPl` | 55 | Curated resources |
| Daily Rhythms | `tblyhpS9TM2TMKOGU8B` | — | Seasonal/daily content |
| System Admin | `tblbxAGreFEyE7Pi9PE` | — | Admin alerts, AI config |
| Seekers | `tblgprvMCO9opqRjOFf` | — | User accounts/profiles |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TEABLE_API_KEY` | Yes | Teable PAT (set in Vercel + GitHub Secrets) |
| `GEMINI_API_KEY` | Yes | Gemini API key (stored in Teable via AI Config dash) |
| `STRIPE_SECRET_KEY` | When live | Stripe secret key |
| `STRIPE_USER_PREMIUM_PRICE_ID` | When live | Seeker Pro price ID |
| `STRIPE_MENTOR_PRO_PRICE_ID` | When live | Mentor Pro price ID |
| `APP_URL` | Yes | `http://waldorf.maistermind.com` |

---

## Key Features (Implemented)

### Security ✅
- Gemini API key **server-side only** (`/api/gemini` proxy)
- Teable PAT **removed from client code** (uses `process.env`)
- Admin auth **server-side** (`/api/admin-auth` — no plaintext passwords)
- CSV export **GDPR consent** (`Export_Consent` field in Mentors table)

### Performance ✅
- Bundle splitting: **745KB → 285KB** main chunk
- Separate chunks: vendor (120KB), services (322KB), data (157KB)
- PWA with service worker, offline support

### SEO ✅
- `sitemap.xml` & `robots.txt` live at root
- Semantic HTML, meta tags

### Internationalization ✅
- Spanish directory (`dir-espanol-1.json`) wired as **Español** tab in LivingPanel
- 245 songs, 20 books, 26 educator cards

### Data Quality ✅
- 4 garbage records deleted from Teable (HTML dump, 3 nameless stubs)
- Smart search: synonym expansion ("guitar"→music, "year 5"="grade 5")

---

## Run Locally

```bash
# Prerequisites: Node.js 18+
cd "F:\Mike d drive\Mike Webs\Client Projects\Nina - Waldorf and Steiner Education App\github-files"

# Install dependencies
npm install

# Set environment variables (copy .env.example to .env.local)
# Required: TEABLE_API_KEY, GEMINI_API_KEY
cp .env.example .env.local
# Edit .env.local with your keys

# Run dev server (use port other than 3000)
npm run dev -- --port 5173
```

---

## Deploy

**Production:** Push to `main` → auto-deploys to Vercel  
**Nightly rebuild:** GitHub Actions workflow at 03:00 UTC (requires `TEABLE_API_KEY` secret in repo)  
**Manual rebuild:** Run `scripts/generate-directory-mentors.js` locally, commit `public/directory-mentors.json`

---

## Outstanding Work (Prioritized)

### Low Effort
- [ ] **Accessibility audit** (WCAG 2.1 AA) — audit color contrast, ARIA labels, keyboard nav
- [ ] **German data integration** — check for existing German content, add locale support
- [ ] **Basic test suite** — Vitest + React Testing Library + CI

### Medium Effort
- [ ] **School finder map** (Leaflet, 1,015 schools)
- [ ] **Mentor messaging** with email notifications
- [ ] **Mobile app wrapper** (Capacitor)

### High Effort
- [ ] **Resource marketplace** (Stripe Connect, mentor PDFs/courses)
- [ ] **Seasonal content auto-publisher** (cron + rhythms table)

---

## Admin Access

**URL:** https://waldorf.maistermind.com/admin  
**Email:** admin@thewaldorfpath.com  
**Password:** (stored in Teable System Admin table, verified via `/api/admin-auth`)

### Admin Capabilities
- Mentor profile claims/approvals
- CSV exports (with GDPR consent filter)
- Sponsor/featured profile management
- AI key configuration (Teable-backed, syncs to all users)
- System alerts & monitoring

---

## Session History

See `wiki/summaries/` for detailed session logs:
- `2026-07-11-Session-Summary.md`
- `2026-07-21-Session-Summary.md`
- `2026-07-22-Session-Summary.md`
- `2026-07-24-nav-simplify-search-improve.md`

---

## Constraints & Rules

- ❌ **No C: drive usage** — work only from project folder
- ❌ **No new repositories** without explicit approval
- ❌ **No Antigravity browser** — not authorized
- ❌ **No writes outside** `F:\Mike d drive\Mike Webs\Client Projects\Nina - Waldorf and Steiner Education App\github-files`
- ⚠️ **Port 3000 in use** — use alternative (e.g., 5173) for local dev
- ✅ **Antigravity only from** `F:\Antigravity` (if needed)

## Skills Available

**Red Team Sparring Partner** — Rigorous architectural critique mode. See `.agent/skills/red-team-sparring/SKILL.md`
- Use when reviewing code patches, AI-generated solutions, or strategic plans
- Critique practicality, find edge cases, uncover missing context via 5 sharp questions
- Banish LLM echo chambers

**Usage:** Invoke "red team review" on any proposed solution, code diff, or strategic plan.

---

## Quick Commands

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint (if configured)
npm run lint

# Type check
npx tsc --noEmit
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/App.tsx` | Routing, auth state, panel switching |
| `src/services/teableService.ts` | All Teable CRUD, field mappings |
| `src/services/workflowService.ts` | Admin workflows, exports, auth helpers |
| `src/utils/smartSearch.ts` | Synonym/grade normalization logic |
| `api/gemini.ts` | Server-side Gemini proxy |
| `api/admin-auth.ts` | Server-side admin verification |
| `vite.config.ts` | Bundle splitting, build config |
| `.github/workflows/nightly-rebuild.yml` | Scheduled directory rebuild |