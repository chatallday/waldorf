# Session Summary — 2026-07-24

## Objective
Simplify the PWA per Nina's voice feedback: remove separate Resources/Living tabs, make search intuitive, move Steiner intro to About modal.

## Changes

### Navigation & Layout (`src/App.tsx`)
- Removed **Resources** and **Living** tabs from bottom nav — only Home, Directory, Profile remain
- Removed `livingSubTab` state; narrowed `activeView` type
- Removed `'resources'` and `'living'` routing from `handleGlobalNavigate`
- Moved Rudolf Steiner / Waldorf intro content (80 lines) from homepage to **About modal** (footer)
- Replaced long intro with compact search-centric callout

### Global Search (`src/components/GlobalSearchBar.tsx`)
- **Grade normalization**: `5th grade`, `level 5`, `class 5`, `5th` all normalize to `grade 5`
- **Parallel AI + keyword**: keyword results show instantly; AI semantic results merge in when ready
- **Stricter thresholds**: non-primary sources require all query words to match (reduces noise)
- **Result count**: reduced from 20 to 12
- Fixed `navigateTo` references (Living/Resources → Directory)
- Lowered document content-match threshold (`>1` → `>=1`) so body-only matches surface

### MentorPanel (`src/components/MentorPanel.tsx`)
- Added **keyword search bar** to Directory tab — filters mentors by name, bio, specialties, location, grade level in real time

### Document Service (`src/services/documentService.ts`)
- Removed 2 duplicate file entries: `woodwork-in-waldorf-education_1 29jun26.html`, `handwork-in-waldorf-education_10 (1).html`
- Filtered ~60 common English stop words from auto-generated article tags

### Commits
| Hash | Message |
|------|---------|
| `71a64cd` | simplify nav: remove Resources/Living tabs, move Steiner intro to About modal, condense homepage |
| `006b0c8` | fix: remove duplicate docs and filter stop words from search tags |
| `98c26cf` | feat: parallel AI+keyword search with grade normalization |
| `10a75ac` | fix: lower doc search threshold so content-only matches surface |
| `1012969` | feat: add keyword search bar to MentorPanel (Directory tab) |

## Files Modified
- `src/App.tsx` — nav, routing, homepage, About modal
- `src/components/GlobalSearchBar.tsx` — full search refactor
- `src/components/MentorPanel.tsx` — added search bar
- `src/services/documentService.ts` — removed duplicates, stop words
- `project_manifest.json` — updated

## Open Items
- 4 pre-existing TS errors (2 in `api/stripe-create-link.ts`, 2 in `src/services/documentService.ts`)
- Font resolution warnings during build (non-blocking)
- ResourcesPanel.tsx and LivingPanel.tsx kept as dead code for possible reversion
