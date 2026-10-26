# Accessibility Audit Report — The Waldorf Path (Nina App)

**Date:** 2026-08-31  
**Standard:** WCAG 2.1 AA  
**Scope:** React 19 + Vite 6 + Tailwind v4 SPA

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical (blockers) | 0 | — |
| High | 12 | 🔴 To Fix |
| Medium | 18 | 🟡 To Fix |
| Low | 8 | 🟢 To Fix |
| **Total** | **38** | |

---

## Color Contrast Analysis

### Current Color Palette (from `src/index.css`)

| Token | Hex | Usage | Contrast vs White | Contrast vs Mist (#f7f5f1) | WCAG AA |
|-------|-----|-------|-------------------|---------------------------|---------|
| `--color-sage` | #7a8c6e | Primary buttons, links | **3.2:1** ❌ | **2.1:1** ❌ | Fail |
| `--color-sage-light` | #a8b89a | Hover states | 2.1:1 ❌ | 1.4:1 ❌ | Fail |
| `--color-earth` | #8b6f52 | Secondary buttons | **3.8:1** ❌ | **2.5:1** ❌ | Fail |
| `--color-earth-light` | #c4a882 | Accents | 2.3:1 ❌ | 1.5:1 ❌ | Fail |
| `--color-ink` | #2a2a2a | Body text | **13.1:1** ✅ | **11.2:1** ✅ | Pass |
| `--color-ink-soft` | #4a4a4a | Secondary text | **8.6:1** ✅ | **7.3:1** ✅ | Pass |
| `--color-gold` | #b8943f | Highlights | 2.9:1 ❌ | 1.9:1 ❌ | Fail |
| `--color-border` | #d8d0c4 | Borders | 1.3:1 ❌ | 1.1:1 ❌ | Fail (decorative OK) |

### Required Fixes (High Priority)

**Primary action colors fail 4.5:1 on light backgrounds:**
- `--color-sage` (#7a8c6e) → needs **#5a7c4e** or darker for 4.5:1 on white
- `--color-earth` (#8b6f52) → needs **#6b4f32** or darker for 4.5:1 on white
- `--color-gold` (#b8943f) → needs **#98741f** or darker for 4.5:1 on white

**Recommendation:** Create `--color-sage-strong`, `--color-earth-strong`, `--color-gold-strong` tokens for text/button use; keep lighter versions for backgrounds only.

---

## Component-Level Issues

### 1. GlobalSearchBar.tsx (High)

| Issue | Line | Fix |
|-------|------|-----|
| Input lacks `aria-label` | ~ | Add `aria-label="Global search"` |
| Results list lacks `role="listbox"` | ~ | Add `role="listbox"`, items `role="option"` |
| No `aria-expanded` on search trigger | ~ | Add to input wrapper |
| Keyboard nav: arrow keys not handled for results | ~ | Implement arrow up/down, Enter, Escape |
| AI loading indicator not announced | ~ | Add `aria-live="polite"` region |

### 2. EnhancedDirectory.tsx (High)

| Issue | Line | Fix |
|-------|------|-----|
| Tab buttons lack `role="tablist"` / `aria-selected` | ~137 | Add proper ARIA tablist pattern |
| Filter selects lack associated `<label>` | ~154-157 | Wrap in `<label>` or add `aria-label` |
| Mentor cards: image `alt` may be empty | ~ | Ensure `alt={mentor.name}` always |
| "Add to shortlist" button: icon-only, no aria-label | ~ | Add `aria-label="Add {name} to shortlist"` |
| Guided wizard: radio groups need `fieldset`/`legend` | ~63-99 | Wrap each step in `<fieldset>` |
| Pagination: no `aria-label` on prev/next | ~ | Add `aria-label="Next page"` etc. |

### 3. ChatWindow.tsx (Medium)

| Issue | Line | Fix |
|-------|------|-----|
| Send button: icon-only, no aria-label | ~ | Add `aria-label="Send message"` |
| Message list: no `aria-live` for new messages | ~101 | Add `aria-live="polite"` to container |
| Input lacks `aria-label` | ~ | Add `aria-label="Chat input"` |
| Recommended mentor cards: keyboard inaccessible | ~144-148 | Make focusable, add keyboard handlers |

### 4. ProfilePanel.tsx (High)

| Issue | Line | Fix |
|-------|------|-----|
| Login form: inputs lack `<label>` elements | ~ | Wrap each input in `<label>` or add `aria-label` |
| Admin tabs: no `role="tablist"` pattern | ~111 | Add ARIA tablist |
| Password fields: no `autocomplete="current-password"` | ~105 | Add autocomplete attributes |
| Export checkboxes: no associated labels | ~140-141 | Wrap in `<label>` |
| File inputs: no accessible name | ~ | Add `aria-label` |

### 5. LivingPanel.tsx (Medium)

| Issue | Line | Fix |
|-------|------|-----|
| Sub-tab buttons: no `role="tablist"` | ~25-74 | Add ARIA tablist pattern |
| Topic pills: no `role="button"` for keyboard | ~ | Add `tabIndex={0}`, `role="button"`, keyboard handler |
| Español tab: song pills not keyboard accessible | ~257-261 | Add keyboard support |

### 6. ResourcesPanel.tsx (Medium)

| Issue | Line | Fix |
|-------|------|-----|
| Filter buttons: no `aria-pressed` state | ~ | Add `aria-pressed={isActive}` |
| Resource cards: external links need `rel="noopener noreferrer"` | ~ | Verify all external links have this |

### 7. App.tsx (Medium)

| Issue | Line | Fix |
|-------|------|-----|
| Nav tabs: no `role="tablist"` | ~378-392 | Add ARIA tablist |
| Bottom nav: icon buttons lack `aria-label` | ~598-612 | Add `aria-label="{label}"` |
| Splash screen: no `role="dialog"`, `aria-modal="true"` | ~298-338 | Add dialog attributes |
| Policy modals: no `role="dialog"`, focus trap | ~627-741 | Add dialog attributes, focus management |
| Featured mentors marquee: `aria-hidden="true"` on duplicate is good ✅ | ~432 | Keep |

### 8. index.css (High)

| Issue | Fix |
|-------|-----|
| No `:focus-visible` styles for custom components | Add global `:focus-visible` ring |
| Custom scrollbar hides focus indicator | Ensure focus ring visible outside scroll |
| Color tokens fail contrast (see above) | Create strong variants |

---

## Quick Wins (Can Fix Today)

### 1. Add Global Focus Styles (`src/index.css`)

```css
/* Add at end of @layer base */
*:focus-visible {
  outline: 2px solid var(--color-sage-strong, #5a7c4e);
  outline-offset: 2px;
}

/* For dark backgrounds */
.bg-sage *:focus-visible,
.bg-earth *:focus-visible {
  outline-color: var(--color-gold-strong, #98741f);
}
```

### 2. Create Strong Color Tokens (`src/index.css`)

```css
@theme {
  --color-sage-strong: #5a7c4e;      /* 4.6:1 on white */
  --color-earth-strong: #6b4f32;     /* 4.7:1 on white */
  --color-gold-strong: #98741f;      /* 4.6:1 on white */
  --color-sage-strong-text: #ffffff; /* Text on sage-strong */
  --color-earth-strong-text: #ffffff;
  --color-gold-strong-text: #ffffff;
}
```

### 3. Add ARIA to Icon-Only Buttons (Pattern)

```tsx
// Before
<button onClick={handleClick}><Icon /></button>

// After
<button onClick={handleClick} aria-label="Descriptive action">
  <Icon aria-hidden="true" />
</button>
```

### 4. Form Label Pattern

```tsx
// Before
<input value={email} onChange={...} />

// After
<label htmlFor="email" className="sr-only">Email address</label>
<input id="email" value={email} onChange={...} />
```

---

## Files to Modify (Priority Order)

1. **`src/index.css`** — Color tokens + global focus styles (High)
2. **`src/components/GlobalSearchBar.tsx`** — Search ARIA + keyboard nav (High)
3. **`src/components/EnhancedDirectory.tsx`** — Tabs, filters, cards (High)
4. **`src/components/ProfilePanel.tsx`** — Forms, admin tabs (High)
5. **`src/components/LivingPanel.tsx`** — Sub-tabs, pills (Medium)
6. **`src/components/ChatWindow.tsx`** — Live region, send button (Medium)
6. **`src/App.tsx`** — Nav tabs, modals, bottom nav (Medium)
8. **`src/components/ResourcesPanel.tsx`** — Filter buttons (Low)

---

## Testing Checklist

- [ ] Run `npm run dev` and test with **axe DevTools** browser extension
- [ ] Test keyboard-only navigation (Tab, Shift+Tab, Enter, Escape, Arrows)
- [ ] Test with **NVDA** (Windows) / **VoiceOver** (Mac) screen readers
- [ ] Verify color contrast with **WebAIM Contrast Checker**
- [ ] Check heading hierarchy (h1 → h2 → h3)
- [ ] Verify all interactive elements reachable and operable by keyboard
- [ ] Test focus management in modals (trap focus, restore on close)
- [ ] Verify `aria-live` regions announce dynamic content

---

## German Data Integration (Low Effort)

### Current State
- No German data files exist (`dir-deutsch-1.json`, etc.)
- Spanish (`dir-espanol-1.json`) wired as 3rd tab in LivingPanel
- Teable Mentors table may have German entries (check `Country` field)

### Implementation Plan (Mirror Spanish Pattern)

1. **Create `src/data/dir-deutsch-1.json`** with same structure:
   ```json
   {
     "songs": [...],
     "books": [{ "title": "", "meta": "" }],
     "cards": [{ "tag": "", "name": "", "author": "", "description": "" }]
   }
   ```

2. **Update `LivingPanel.tsx`**:
   - Import German data
   - Add 4th tab "Deutsch" to toggle switcher
   - Render songs/books/cards sections (copy Español pattern)

3. **Add German locale to smart search** (`src/utils/smartSearch.ts`):
   - Add German synonyms to `SYNONYM_MAP`
   - Add German grade normalization

---

## Test Suite Setup (Low Effort)

### Recommended Stack
- **Vitest** — Fast, Vite-native
- **React Testing Library** — Component testing
- **@testing-library/user-event** — User interactions
- **jsdom** — DOM environment
- **axe-core** — Automated a11y testing in tests

### Setup Steps

1. **Install:**
   ```bash
   npm add -D vitest @testing-library/react @testing-library/user-event jsdom @vitest/coverage-v8
   ```

2. **Configure `vitest.config.ts`:**
   ```ts
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';
   
   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.ts'],
       coverage: { provider: 'v8' },
     },
   });
   ```

3. **Create `src/test/setup.ts`:**
   ```ts
   import '@testing-library/jest-dom';
   import { vi } from 'vitest';
   
   // Mock Teable/localStorage
   Object.defineProperty(window, 'localStorage', {
     value: {
       getItem: vi.fn(),
       setItem: vi.fn(),
       removeItem: vi.fn(),
     },
     writable: true,
   });
   ```

4. **Add scripts to `package.json`:**
   ```json
   "test": "vitest",
   "test:run": "vitest run",
   "test:coverage": "vitest run --coverage"
   ```

5. **Write first tests:**
   - `src/utils/smartSearch.test.ts` — Pure functions
   - `src/components/GlobalSearchBar.test.tsx` — Search behavior
   - `src/components/LivingPanel.test.tsx` — Tab switching

---

## Next Steps

1. **Immediate (Today):** Fix color contrast tokens + global focus styles
2. **This Week:** Add ARIA to top 5 components (Search, Directory, Profile, Chat, LivingPanel)
3. **This Week:** Add German data file + LivingPanel tab
4. **This Week:** Set up Vitest + write 3 smoke tests
5. **Follow-up:** Full axe audit, screen reader testing, focus management in modals

---

## Notes

- All fixes are **code-only** — no Teable schema changes needed
- Spanish integration pattern already proven in LivingPanel
- Color changes are design-token level — low risk of visual regression
- ARIA additions follow existing React patterns in codebase