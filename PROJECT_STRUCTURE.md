# Project File Structure — Nina: Waldorf & Steiner Education App

**Generated:** 2026-08-31  
**Root:** `F:\Mike d drive\Mike Webs\Client Projects\Nina - Waldorf and Steiner Education App\github-files`

---

## Complete File Tree

```
github-files/
├── .env                              # Local env (gitignored)
├── .env.example                      # Env template
├── .env.local                        # Local overrides (gitignored)
├── .github/
│   └── workflows/
│       └── nightly-rebuild.yml       # GitHub Actions: 03:00 UTC directory rebuild
├── .vercel/
│   ├── project.json                  # Vercel project config
│   └── output/
│       └── static/                   # Vercel build output (static)
├── api/                              # Vercel serverless functions
│   ├── admin-auth.ts                 # Server-side admin verification (GET admins, POST verify)
│   ├── ai-config.ts                  # Teable-backed AI key store (GET/POST AI Config)
│   ├── cron.ts                       # Nightly rebuild endpoint (uses TEABLE_API_KEY)
│   ├── gemini.ts                     # Server-side Gemini proxy (key not in client bundle)
│   ├── stripe-create-link.ts         # Stripe checkout session creation
│   ├── stripe-success.ts             # Stripe success handler
│   └── teable-proxy.js               # Teable API proxy (legacy)
├── dist/                             # Production build (Vercel output)
│   ├── documents/                    # PDF/HTML documents
│   ├── *.js, *.css                   # Bundled assets
│   ├── index.html                    # Production HTML
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker
│   ├── sitemap.xml                   # SEO sitemap
│   ├── robots.txt                    # SEO robots
│   └── *.png, *.jpeg                 # Static images
├── public/                           # Static assets (served as-is, copied to dist)
│   ├── documents/                    # PDF/HTML for ReadingRoom
│   │   ├── Wegman_and_Steiner.pdf
│   │   ├── woodwork-in-waldorf-education_*.html
│   │   └── writing-tools-and-cursive-in-waldorf_*.html
│   ├── sw.js                         # Service worker (PWA offline)
│   ├── manifest.json                 # PWA manifest
│   ├── sitemap.xml                   # SEO sitemap
│   ├── robots.txt                    # SEO robots
│   ├── offline.html                  # Offline fallback
│   ├── waldorf-favicon sq cutout.png
│   ├── waldorf-path-logo extended sq cutout.png
│   ├── waldorf-path-banner crop_upscayl_5x_ultrasharp.png
│   ├── nina logo final WhatsApp Image 2026-05-23 at 2.40.52 AM (1).jpeg
│   └── nina header final WhatsApp Image 2026-05-23 at 2.40.52 AM.jpeg
├── scripts/
│   └── generate-directory-mentors.js # Nightly rebuild script (Teable → JSON)
├── src/
│   ├── components/                   # React components
│   │   ├── ArticleViewer.tsx         # Document/PDF viewer with search
│   │   ├── ChatWindow.tsx            # AI concierge (Gemini) with temperament matching
│   │   ├── DocumentPanel.tsx         # 60+ articles/pdfs with full-text search
│   │   ├── EnhancedDirectory.tsx     # 4-tab mentor finder (search, wizard, shortlist, admin)
│   │   ├── ErrorBoundary.tsx         # Friendly crash page
│   │   ├── GlobalSearchBar.tsx       # AI-powered cross-wiki search (13 sources)
│   │   ├── LivingPanel.tsx           # Head/Heart/Hands + Español tab (33 topic pills)
│   │   ├── MentorPanel.tsx           # Mentor profile detail modal
│   │   ├── ProfilePanel.tsx          # Multi-role dashboard (mentor/seeker/admin/export)
│   │   ├── ReadingRoom.tsx           # Curated guides & Steiner texts
│   │   └── ResourcesPanel.tsx        # Curated resource hub (128 Teable + 7 local)
│   ├── data/                         # Static data & manifests
│   │   ├── contentRegistry.ts        # Content registry for search indexing
│   │   ├── dailyData.ts              # Daily rhythms content
│   │   ├── directory-extracted-cards.json
│   │   ├── directory-extracted-linklist.json
│   │   ├── directoryMentors.ts       # Directory mentor utilities
│   │   ├── dir-english-1.json        # English directory (legacy)
│   │   ├── dir-english-2.json        # English directory (legacy)
│   │   ├── dir-espanol-1.json        # Spanish directory (245 songs, 20 books, 26 cards)
│   │   ├── guidesManifest.ts         # ReadingRoom guides manifest
│   │   ├── grounding.ts              # Grounding exercises
│   │   ├── mentors.ts                # Local mentor data
│   │   ├── societyCuration.ts        # Society/organization curation
│   │   └── temperamentCuration.ts    # Temperament-based recommendations
│   ├── services/                     # Business logic & API clients
│   │   ├── documentService.ts        # Document fetching & full-text search
│   │   ├── geminiService.ts          # Gemini AI client (uses /api/gemini proxy)
│   │   ├── teableService.ts          # Teable CRUD, field mappings, types
│   │   └── workflowService.ts        # Admin workflows, auth, exports, CSV
│   ├── utils/                        # Utilities
│   │   ├── csvUtils.ts               # CSV export (GDPR consent filter)
│   │   ├── smartSearch.ts            # Synonym + grade normalization
│   │   └── toastUtils.ts             # Toast notifications
│   ├── App.tsx                       # Root: routing, auth state, panel switching
│   ├── index.css                     # Tailwind v4 + custom styles
│   └── main.tsx                      # Entry point
├── wiki/
│   └── summaries/                    # Session summaries & decisions
│       ├── 2026-07-11-Session-Summary.md
│       ├── 2026-07-21-Session-Summary.md
│       ├── 2026-07-22-Session-Summary.md
│       └── 2026-07-24-nav-simplify-search-improve.md
├── CLAUDE.md                         # Project memory for AI agents (this project)
├── ENTITYOS_PROTOCOL.md              # EntityOS protocol reference
├── README.md                         # Project documentation (updated)
├── directory-parsing-report.md       # Directory parsing analysis
├── metadata.json                     # Project metadata
├── restart_status.md                 # Restart status tracking
├── tsconfig.json                     # TypeScript config
├── vercel.json                       # Vercel config (no crons)
└── vite.config.ts                    # Vite config (bundle splitting, no API key define)
```

## Skills Available
**Red Team Sparring Partner** — Rigorous architectural critique mode. See `.agent/skills/red-team-sparring/SKILL.md`
- Use when reviewing code patches, AI-generated solutions, or strategic plans
- Critique practicality, find edge cases, uncover missing context via 5 sharp questions
- Banish LLM echo chambers

**Usage:** Invoke "red team review" on any proposed solution, code diff, or strategic plan.

---

## Key Directories by Purpose

| Directory | Purpose |
|-----------|---------|
| `api/` | Serverless functions (secure, server-side only) |
| `src/components/` | All React UI components |
| `src/services/` | Business logic, API clients, Teable operations |
| `src/data/` | Static JSON/TS data files |
| `src/utils/` | Pure utility functions |
| `public/` | Static assets (copied verbatim to dist) |
| `scripts/` | Build-time / maintenance scripts |
| `wiki/summaries/` | Historical session logs |
| `dist/` | Vercel production output (auto-generated) |

---

## Teable Field Mappings (Reference)

### Mentors Table (`tbl6KvPXOhrVpXupA93`)
```typescript
interface Mentor {
  id: string;                    // Teable record ID
  Name: string;                  // Display name
  Role: string;                  // Mentor/School/Maker/Therapist
  Location: string;              // City, Country
  Country: string;               // ISO country code
  Description: string;           // Bio/description
  Website: string;               // URL
  Email: string;                 // Contact email
  Phone: string;                 // Phone number
  Instagram: string;             // Instagram handle
  Facebook: string;              // Facebook page
  YouTube: string;               // YouTube channel
  LinkedIn: string;              // LinkedIn profile
  Grade_Levels: string[];        // e.g., ["Kindergarten", "Grade 1", "Grade 5"]
  Subjects: string[];            // e.g., ["Handwork", "Music", "Math"]
  Specialties: string[];         // e.g., ["Curative Education", "Biodynamic Farming"]
  Credentials: string;           // Certifications, training
  Featured: boolean;             // Featured profile (paid)
  Sponsored: boolean;            // Sponsored listing (paid)
  Claimed: boolean;              // Claimed by owner
  Claimed_By: string;            // Seeker ID who claimed
  Export_Consent: boolean;       // GDPR: allow contact export (NEW)
  Created_At: string;            // ISO timestamp
  Updated_At: string;            // ISO timestamp
}
```

### Resources Table (`tblztNjIsTKuI8mxuPl`)
```typescript
interface Resource {
  id: string;
  Title: string;
  Type: string;                  // PDF, Article, Video, Audio, Book
  Category: string;              // Curriculum, Handwork, Festival, etc.
  Grade_Level: string;
  Description: string;
  URL: string;                   // External link or Teable attachment
  Thumbnail: string;             // Image URL
  Tags: string[];
  Language: string;              // en, es, de
  Featured: boolean;
  Created_At: string;
}
```

### System Admin Table (`tblbxAGreFEyE7Pi9PE`)
```typescript
interface AdminAlert {
  id: string;
  Type: string;                  // ai_config, alert, system
  Title: string;
  Message: string;
  Data: object;                  // Flexible JSON (e.g., { geminiKey: "..." })
  Resolved: boolean;
  Created_At: string;
}
```

---

## Component Props & State (Quick Ref)

| Component | Key Props | Key State |
|-----------|-----------|-----------|
| `EnhancedDirectory` | `mentors`, `onSelect` | `activeTab`, `filters`, `shortlist`, `wizardStep` |
| `LivingPanel` | — | `activeTab` (curriculum/rhythms/español), `selectedPill` |
| `ChatWindow` | `mentors` | `messages`, `isLoading`, `temperament` |
| `GlobalSearchBar` | `sources` | `query`, `results`, `selectedSource` |
| `ProfilePanel` | `user`, `role` | `activeTab`, `editMode`, `exportOptions` |
| `ResourcesPanel` | — | `filters`, `searchQuery`, `viewMode` |
| `DocumentPanel` | — | `documents`, `searchQuery`, `selectedDoc` |
| `ReadingRoom` | — | `guides`, `selectedGuide` |
| `MentorPanel` | `mentor`, `onClose` | `expandedSections` |

---

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/gemini` | POST | None | Proxy to Gemini (server-side key) |
| `/api/admin-auth` | GET | None | List admin emails (no passwords) |
| `/api/admin-auth` | POST | None | Verify admin credentials |
| `/api/ai-config` | GET | None | Get AI config (Gemini key from Teable) |
| `/api/ai-config` | POST | Admin | Save AI config to Teable |
| `/api/cron` | GET | Secret | Nightly directory rebuild trigger |
| `/api/stripe-create-link` | POST | User | Create Stripe checkout session |
| `/api/stripe-success` | GET | None | Stripe success callback |

---

## Build & Deploy Commands

```bash
# Development
npm run dev -- --port 5173

# Production build
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Manual directory rebuild
node scripts/generate-directory-mentors.js

# Deploy to Vercel (auto on push to main)
git push origin main
```

---

## Recent Changes (2026-08-31)

| Commit | Change |
|--------|--------|
| `980fcac` | Manual directory rebuild (1073 clean entries) |
| `13f61c3` | Bundle splitting (745KB → 285KB), sitemap, smart search, credentials |
| Latest | Gemini server-side, admin auth, Spanish dir, GDPR consent, Teable key store, cron removal |

---

## Data Files Reference

| File | Records | Description |
|------|---------|-------------|
| `public/directory-mentors.json` | 1,073 | Nightly rebuilt from Teable |
| `src/data/dir-espanol-1.json` | 245 songs, 20 books, 26 cards | Spanish content for LivingPanel |
| `src/data/dir-english-1.json` | Legacy | English directory (superseded by Teable) |
| `src/data/dir-english-2.json` | Legacy | English directory (superseded by Teable) |
| `src/data/directory-extracted-cards.json` | — | Extracted card data |
| `src/data/directory-extracted-linklist.json` | — | Extracted link data |

---

## Notes for Future Development

1. **All API keys live in Teable** (AI Config) or Vercel env — never in client code
2. **Bundle splitting configured** in `vite.config.ts` — manual chunks for vendor/services/data
3. **PWA ready** — service worker caches static assets, offline.html fallback
4. **Spanish locale wired** — third tab in LivingPanel, no i18n framework needed yet
5. **GDPR consent field** — `Export_Consent` in Mentors table, UI in ProfilePanel & admin export
6. **Nightly rebuild** — GitHub Actions workflow, needs `TEABLE_API_KEY` secret (set)
7. **No Vercel crons** — removed from `vercel.json` to avoid costs
8. **Admin auth server-side** — passwords never leave Teable, verified via `/api/admin-auth`