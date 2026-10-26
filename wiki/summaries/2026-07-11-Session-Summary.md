# Handoff Note: 2026-07-11 SaaS Visual & Integration Fixes

**PROJECT:** The Waldorf Path  
**DATE:** 2026-07-11  

## GOAL
Address UI scrollbar nesting issues (double scrollbars), eliminate duplicate Reading Room tabs, update local configurations to the correct Teable `.io` domain, and integrate the newly regenerated Teable Personal Access Token (PAT).

## DECISIONS
- Swapped all references to `teable.ai` with `teable.io` since the database API resides on `app.teable.io`.
- Removed inner scroll wrappers from Directory list, Resources list, and policy modals to rely on browser window viewport scrolling naturally.
- Mapped `GUIDE_CATEGORIES` directly in the Reading Room component, as the source list already includes the `'All'` category option.

## DONE
- **Teable Key Update:** Propagated new PAT (`teable_accv7ta35BisOwLmbLa_e8LHiY5TchgXjkgSs6ymsUZYvr4oTnFzpt17o6+NHsI=`) to `.env` and `src/services/teableService.ts`.
- **Domain Mismatch Corrected:** Replaced all `teable.ai` strings with `teable.io` inside `vite.config.ts`, `fetch-ids.ts`, `teable-setup.ts`, `collate-directory.ts`, and `export-invitations.ts`.
- **Layout & Scroll Fixes:** Removed `overflow-y-auto` and `flex-1` from nested scroll panels in `MentorPanel.tsx`, `ResourcesPanel.tsx`, and `App.tsx` (modals).
- **Duplicate Tab Fix:** Removed duplicate category mapping in `ReadingRoom.tsx`.
- **Modals Heights:** Reconfigured modal overlay container to allow natural outer scroll layout in `MentorPanel.tsx`.
- **Cleaned Up Workspace:** Removed temporary `scratch_test.js` script.
- **Verified Build:** Validated with a full local compilation via `npm run build`.

## OPEN/NEXT
- **Vercel Variable Update:** The user must configure/update the `TEABLE_API_KEY` environment variable in Vercel settings using the new PAT to fix 401 Unauthorized errors in production.
- **Verification on Deploy:** Ensure profile claims, registration, and logins operate normally once the Vercel API key is synced.

## KEY FACTS
- **Teable Database Tables:**
  - Mentors Table: `tbl6KvPXOhrVpXupA93`
  - Resources Table: `tblztNjIsTKuI8mxuPl`
  - Daily Rhythms Table: `tblyhpS9TM2TMKOGU8B`
  - System Admin Table: `tblbxAGreFEyE7Pi9PE`
  - Seekers Table: `tblgprvMCO9opqRjOFf`
- **Admin login credentials:**
  - URL: `/admin` or `?view=admin`
  - Email: `admin@thewaldorfpath.com`
  - Password: `admin`

## GOTCHAS
- Vite local development server is configured on port `3005` in `vite.config.ts` to avoid local host conflict on `3000`.
- Do not let files watch if CPU usage spikes; watch state in Vite is dynamically configured via `DISABLE_HMR` environment variable.
