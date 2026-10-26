# CLAUDE.md — The Waldorf Path

Project memory. Read this first.

## What this is
Marketing website for **The Waldorf Path** — *A Curated Directory for Waldorf Living*.
Helps families, teachers, and homeschoolers find Waldorf schools, mentors, verses, curative
education, handwork/crafts, books, and trusted makers. Also features the "Little Rose Gnomes"
six-book story series, exclusive tote bags, an About (three founders: Romy, Elody, Nina),
testimonials, get-the-app, and a community/“list your business” call.

Domain: https://thewaldorfpath.com   ·   Contact: thewaldorfpath@gmail.com

## Tech
Single static page (`index.html`), vanilla HTML/CSS/JS, no build step, no dependencies.
Assets in `assets/img/` and `assets/fonts/`. SEO helper files at the root.

## Run locally
    python3 -m http.server 8000   # http://localhost:8000

## Design rules — preserve these
- Soft, whimsical, storybook Waldorf. Watercolor palette, rounded corners, lots of air.
- **Use the real artwork. Do NOT hand-draw illustrative SVG scenes** — they look generic next
  to the real watercolor art and were rejected before.
- **No brown or black** near the art. Text is dusty blue (`--ink:#41506A`); accents are the
  sunrise palette (sun/peach/coral/rose/lavender/sage/blue).
- **Fonts:** ALL visible text uses **Waldorfschrift Bold** (client-purchased, in assets/fonts),
  forced via a global rule near the end of <style>. Fraunces/Mulish/Caveat remain as fallbacks.
- Colors/spacing are CSS custom properties in `:root`.

## Sections (top → bottom)
announcement ticker · nav · hero (banner painting) · "Everything Waldorf in One Place" intro ·
How it works (real circle art + 01/02/03 steps) · What you'll find (6 watercolor category tiles +
colored pills) · Story Series (Little Rose Gnomes, 6 covers) · Tote bags (7 real photos) ·
About (founders) · Loved by families & teachers (testimonials) · Get the app · Community ·
Newsletter · footer.

## SEO (already built in)
- Title, meta description, canonical, robots, theme-color.
- Open Graph + Twitter Card tags (image: /og-image.jpg).
- JSON-LD structured data (Organization + WebSite).
- Hidden <h1> in the hero (the visible title lives inside the banner image).
- Root files to deploy: `sitemap.xml`, `robots.txt`, `og-image.jpg`.

## Known placeholders (swap for real data)
- Stats (1,200+ listings, 90+ cities, 4.9), testimonials, tote names/prices ($24),
  Story Series cover art (currently gradient placeholders).
- Links still pointing to `#`: App Store / Google Play, "List your business",
  "Explore the collection"/store actions, Contact, social.

## TODO
- Real cover art for the 6 books; real tote checkout (Stripe/Shopify/Gumroad); newsletter
  integration (Mailchimp/Buttondown); real app-store + listing links; replace placeholder copy.
- Deploy with HTTPS; submit sitemap to Google Search Console + Bing Webmaster Tools.

## Font licensing
WaldorfschriftBold is purchased. Confirm the license allows **webfont (@font-face) embedding**
before publishing. `.otf` (desktop) + `.woff2` (web) are both in assets/fonts/.
