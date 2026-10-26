# The Waldorf Path — website

A single-page marketing site for **The Waldorf Path**, a curated directory for Waldorf living.
Static HTML/CSS/JS, no build step.

## Preview locally
Open `index.html` directly in a browser, or (better, so fonts/images load reliably):

```bash
cd waldorf-path
python3 -m http.server 8000
# visit http://localhost:8000
```

## Folder structure
```
waldorf-path/
├─ index.html                 # the whole site
├─ CLAUDE.md                  # project context for Claude Code (read first)
├─ README.md
└─ assets/
   ├─ fonts/
   │  ├─ WaldorfschriftBold.woff2   # web font (used by the site)
   │  └─ WaldorfschriftBold.otf     # desktop original (backup)
   └─ img/
      ├─ lockup.png            # hero logo + tagline painting
      ├─ logo-circle.png       # circular sunrise emblem
      ├─ favicon.png
      └─ tote-*.jpg            # 7 tote product photos
```

## Continue in Claude Code
1. Install Claude Code (see https://docs.claude.com).
2. Unzip this folder somewhere on your machine.
3. In a terminal: `cd waldorf-path` then run `claude`.
4. Claude Code will read `CLAUDE.md` automatically for context. Ask it for changes, e.g.
   “add real Stripe checkout to the tote bags” or “swap the placeholder testimonials.”
5. (Optional) `git init && git add . && git commit -m "initial site"` to start version control.

## Deploy (free)
- **Netlify:** drag the `waldorf-path` folder onto https://app.netlify.com/drop
- **GitHub Pages:** push to a repo, enable Pages on the `main` branch (root).
- **Cloudflare Pages / Vercel:** point them at the folder/repo.

## Before going public
- Confirm the **Waldorfschrift font license** allows webfont embedding.
- Replace placeholders: stats, testimonials, tote prices, store/app links (see CLAUDE.md).
- Wire up real checkout + newsletter.

## SEO files (upload to the site root when you publish)
- `og-image.jpg`  → social-share preview image (must be reachable at thewaldorfpath.com/og-image.jpg)
- `sitemap.xml`   → site map for search engines
- `robots.txt`    → tells crawlers they're welcome + points to the sitemap

After the site is live: verify it in **Google Search Console** (free) and submit `sitemap.xml`;
do the same in **Bing Webmaster Tools**.
