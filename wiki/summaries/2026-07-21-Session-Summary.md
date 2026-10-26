# Handoff Note: 2026-07-21 AI Hybrid Search Integration

**PROJECT:** The Waldorf Path
**DATE:** 2026-07-21

## GOAL
Wire Gemini-powered AI semantic search into `GlobalSearchBar.tsx`, run in parallel with the existing keyword search and merged into a unified result set, with a visible "AI" sparkle indicator so users can distinguish AI-derived matches from keyword hits.

## DECISIONS
- Trigger AI search only when the query is "natural-language" (3+ words) or starts with a question/intent word (`who/what/where/how/why/can/need/find/tell/show/help/look/want/looking/recommend/suggest/which/best/good/idea/advice/tip/about`). Single-word / two-word short queries avoid an expensive Gemini round-trip.
- Run keyword scoring first and emit results immediately; fire AI call in parallel and `setResults(prev => mergeAIResults(prev, aiResult))` once it returns, preserving any new AI-only hits.
- Mark merged AI hits with `fromAI: true` and render a gold "✨ AI" badge next to the type tag so users see provenance.
- Keep the dropdown open while `aiLoading` is true even if keyword search returned zero rows, so AI feedback is visible (header pulsing "AI searching…" + body "Nina is searching across mentors, articles, rhythms, and handwork…").

## DONE
- **Confirmed prior wiring intact** in `src/services/geminiService.ts:340-490`: `WikiSearchAIResult { mentorIds, documentIds, handworkGrades, nutritionPillars }` and `crossWikiSearchWithAI(query, mentors, documents)` with the standard Gemini model cascade + OpenAI fallback. Verified type-name consistency on lines `452` and `482` (both `as WikiSearchAIResult`).
- **GlobalSearchBar UX touch-ups** in `src/components/GlobalSearchBar.tsx`:
  - `SearchResult` interface gained optional `fromAI: boolean` flag (`GlobalSearchBar.tsx:11-22`).
  - `mergeAIResults` now sets `fromAI: true` on each AI-derived match (`GlobalSearchBar.tsx:78-148`).
  - `[mentors, documents]` dependency array added to `mergeAIResults` to silence lint and fix a real `TS1005: ')' expected` error at the previous dangling `};` (`GlobalSearchBar.tsx:153`).
  - Dropdown visibility rule widened: `isOpen && (results.length > 0 || aiLoading)` (`GlobalSearchBar.tsx:397`).
  - Header bar now shows a pulsing `Sparkles + "AI searching…"` chip while `aiLoading` (`GlobalSearchBar.tsx:409-414`).
  - Body row added for AI-only in-flight state: spinning `Loader2` + "Nina is searching across mentors, articles, rhythms, and handwork…" (`GlobalSearchBar.tsx:417-422`).
  - Per-result gold `✨ AI` badge rendered next to the existing type tag when `result.fromAI` is true (`GlobalSearchBar.tsx:442-447`).
- **Type-check:** `npx tsc --noEmit` passes cleanly for the two files touched in this session. Five pre-existing TS errors remain in unrelated files (`api/stripe-create-link.ts`, `src/components/MentorPanel.tsx`, `src/services/documentService.ts`) and are outside this task's scope.

## OPEN / NEXT
- **No new local build run.** `npm run build` was not executed this session; recommend running it before the next deploy.
- **Vercel env sync unchanged:** `TEABLE_API_KEY` and `GEMINI_API_KEY` must remain in sync with the local `.env` (see 2026-07-11 summary for the renewed PAT).
- **Loop root-cause note for next session:** if `geminiService.ts` is edited again and a similar `TS1005` error appears around line 153 of `GlobalSearchBar.tsx`, double-check the dependency array on `mergeAIResults` is preserved rather than collateral-deleted when bulk-replacing the body — that was the source of the only new error this session.
- **Optional polish (not requested):** debounce the AI trigger so users typing a long query don't fire one Gemini round-trip per keystroke; only the existing 150 ms debounce currently throttles this.
- **Loop-avoidance rule going forward:** when entering a new task, first verify the user's referenced paths/IDs still resolve (e.g. `Nina-Waldorf` vs `nina-website` repos) before requesting clarification — repeatedly re-asking the same location question is what caused the user-visible loop earlier today.

## KEY FACTS
- **Repo local path:** `F:/Mike d drive/Mike Webs/Client Projects/Nina - Waldorf and Steiner Education App/github-files`
- **Gemini API key (localStorage override supported):** `AIzaSyD4rTTIKR8qybhvm4a2DLWJtEHvmG5vOE4`
- **Teable PAT (in env, lest anyone paste into chat):** managed via `.env`, `TEABLE_API_KEY=teable_accv7ta35…`
- **Local dev port:** `8081` (per `project_manifest.json`); user has flagged `3000/3005` are taken/used elsewhere.
- **Admin login:** URL `/admin` or `?view=admin`, email `admin@thewaldorfpath.com`, password `admin`.

## GOTCHAS
- `geminiService.ts` carries a long ordered Gemini model cascade from `gemini-3.1-flash-lite` down to `gemini-1.5-pro` for resilience — do not reorder; each `try` block is independent and only the response text of the first successful model is returned.
- The keyword search path in `GlobalSearchBar.tsx` uses `subtitle.includes(w)` style scoring rather than word boundaries — minor over-matching on hyphenated terms is expected and matches prior behavior; do not change without a full regression pass.
- The PWA repo and the `nina-website` static marketing repo are different projects on GitHub (the static site is `dynamicmike-dashboard/nina-website`); edits, secrets, and AI features belong on the PWA only.
