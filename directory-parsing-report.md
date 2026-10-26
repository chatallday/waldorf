# Waldorf Directory HTML Parsing Report

**Project:** Waldorf Path PWA  
**Date:** 2026-07-29  
**Files analyzed:** 5 directory HTML files in `public/documents/`

---

## 1. File-by-File Analysis

### File 1: `the_waldorf_path_directory.html` (6,868 lines)

| Field | Value |
|-------|-------|
| **Title** | The Waldorf Path — A Curated Directory for Waldorf Living |
| **Content type** | Comprehensive shopping/resource directory — products, mentors, schools, books, supplies, anthroposophy |
| **Total sections** | 29 (collapsible accordion sections) |
| **Named entries** | ~608 link-list items + ~425 entry cards = ~1,033 entries |
| **Structure pattern** | `<div class="section">` > `.section-body` > `.subsection` > `.link-list li` (with `ll-name`, `ll-detail`, `ll-url` spans) OR `.entry-grid .entry` (with `entry-name`, `entry-sub`, `entry-tag`) |
| **Sections found** | Adult Education & Teacher Training, Baby Care, Must-Read Books, Books & Publishers, Clothing, Dolls, Music, Toys, Schools, Homeschooling, Health, Finger Games, Verses, Songs, Calendar of the Soul, Seasons/Festivals, Lifecycle, Curative/Special Needs, Reading Lists, Woodwork, Handwork, Wool, Anthroposophy, Germany Guide, Global Resources, Secondhand Sources, Camps, Biodynamic Agriculture, Planetary Rhythms, Nutrition, Chalkboard Art, Instagram Community |

**Parsing feasibility: MODERATE**

- **`link-list` items** (608 entries): Highly structured with 3 spans per `<li>`. Can extract `{ name, detail, url }`.
- **`entry` cards** (425 entries): Consistent with `entry-name`, `entry-sub`, `entry-tag`. Can extract `{ name, description, tag }`.
- **PROBLEM AREAS:**
  - `ll-detail` fields are free-form text mixing location, description, and URLs — would need NLP or manual splitting to extract structured fields like `city`, `description`, `website`
  - Highlight boxes and featured sections (e.g., Wondergarten) use unique inline-style HTML — need per-section manual handling
  - Some entries have multi-line profile content (e.g., Laurie Clark at lines 918-924, Suzanne Down at lines 932-950) that break the simple span pattern
  - Section header counts (e.g., "10 institutes · 20+ mentors") don't always match actual item counts
  - Mixed data types within same file: people, products, books, organizations, recipes, verses all co-exist

---

### File 2: `waldorf_directory_english_1.html` (686 lines)

| Field | Value |
|-------|-------|
| **Title** | The Waldorf Directory — English |
| **Content type** | Circle songs, songbooks, authors, children's books, adult reading list, resources |
| **Sections** | 6: Circle Songs, Songbooks, Authors, Children's Books, For Adults, Resources |
| **Song entries** | 165 circle song titles |
| **Book items** | 29 songbook/adult-book entries |
| **Author/educator cards** | 28 profile cards |
| **Resource cards** | 8 organization cards |
| **Structure patterns** | `.song-item` (plain text), `.book-item > .book-info > h4 + .meta`, `.card > h3 + .author + p + ul`, `.link-list a` |

**Parsing feasibility: HIGH**

- Circle songs: `<div class="song-item">` with text only — trivial regex extraction
- Book entries: `.book-item` with `.book-info > h4` (title) and `.meta` (description) — very consistent
- Author cards: `.card` with `.card-tag`, `h3`, `.author`, `p`, `ul` — consistent structure, some cards have only name+list
- Resource cards: Same `.card` pattern with tag, h3, p
- Link list: Resources section has `<a>` links with free text

---

### File 3: `waldorf_directory_english_2.html` (686 lines)

| Field | Value |
|-------|-------|
| **Title** | The Waldorf Directory — English |
| **Content type** | Identical template/structure to `english_1` |
| **Note** | This appears to be a variation of the same template — hash differs from english_1, but the structural patterns and data layout are identical. May contain slightly different content. |

**Parsing feasibility: HIGH** (same as File 2)

---

### File 4: `waldorf_directorio_espanol_1.html` (669 lines)

| Field | Value |
|-------|-------|
| **Title** | El Directorio Waldorf — Español |
| **Content type** | Spanish-language Waldorf curriculum directory |
| **Sections** | 6: Canciones de Ronda, Cancioneros, Autores, Libros Infantiles, Pedagogía, Recursos |
| **Song entries** | ~245 circle song titles (higher count than English version) |
| **Book items** | ~20 cancionero entries |
| **Author cards** | Similar pattern to English version |
| **Structure** | Identical CSS/layout to English files, just translated content |

**Parsing feasibility: HIGH** (same structural patterns as English files)

---

### File 5: `waldorf-directory-consolidated_1.html` (4,745 lines)

| Field | Value |
|-------|-------|
| **Title** | Consolidated Guides |
| **Content type** | 9 long-form educational guides about Waldorf topics |
| **Guides** | Festivals, Is Waldorf for Our Family?, Class Plays by Grade, Class 12 Senior Project, Class 8 Project, Special Needs & Neurodivergence, Writing Tools, Audiobooks & Story Podcasts, Foreign Language Teaching |
| **Entries** | **0 individual directory entries** — this is prose/essay content |

**Parsing feasibility: NOT APPLICABLE**

There are no individual directory entries to extract. This file contains long-form prose, verses, explanations, and educational content. It could be:
- Chunked by section/guide for reference content in the app
- Used as source material for a "Guides" or "Library" tab
- Re-purposed as markdown content blocks

---

## 2. Assessment: Automatic vs Manual Extraction

### Files suitable for FULLY AUTOMATIC extraction

| File | Method | Reliability |
|------|--------|-------------|
| `waldorf_directory_english_1.html` | Regex on `.song-item`, `.book-item`, `.card` patterns | ~98% |
| `waldorf_directory_english_2.html` | Same as above | ~98% |
| `waldorf_directorio_espanol_1.html` | Same patterns, Spanish content | ~98% |

**Total extractable entries from these three:** ~520+ songs, ~78 book items, ~56+ author/organization cards

### Files requiring SEMI-AUTOMATIC extraction

| File | Method | Reliability |
|------|--------|-------------|
| `the_waldorf_path_directory.html` | Regex on `link-list li` and `entry` divs for basic extraction; manual cleanup for structured fields | ~80% for basic fields, ~40% for clean structured data |

**Total extractable entries:** ~1,033 raw items, but would need cleanup

### File NOT suitable for entry extraction

| File | Reason |
|------|--------|
| `waldorf-directory-consolidated_1.html` | No structured entries — long-form prose content |

---

## 3. Extracted Data (JSON)

### 3a. Circle Songs (English) — `waldorf_directory_english_1.html`

```json
[
  {"title": "In the springtime, little bunnies go hop hop", "season": "spring"},
  {"title": "In the spring the farmer planted seeds", "season": "spring"},
  {"title": "The farmer awoke at the break of day", "season": "spring"},
  {"title": "Little seed, little seed, sleeping in the ground", "season": "spring"},
  {"title": "A little sun, a little shower, a little wait… a flower!", "season": "spring"},
  {"title": "Brother, come and dance with me", "season": "spring"},
  {"title": "Robin Redbreast (fingerplay)", "season": "spring"},
  {"title": "The cuckoo calls across the hill", "season": "spring"},
  {"title": "Slowly, slowly, very slowly creeps the little snail", "season": "spring"},
  {"title": "In our summer garden where we singing go", "season": "summer"},
  {"title": "The sun is shining, the sky is blue", "season": "summer"},
  {"title": "I'm Bounda, I'm Bounda the kangaroo", "season": "summer"},
  {"title": "The farmer harvests, one two three", "season": "summer"},
  {"title": "Midsummer fire is burning bright", "season": "summer"},
  {"title": "Autumn leaves are falling down, welcome autumn", "season": "autumn"},
  {"title": "Come little leaves, said the wind one day", "season": "autumn"},
  {"title": "Yellow the bracken, golden the sheaves", "season": "autumn"},
  {"title": "Autumn is here and the world goes round", "season": "autumn"},
  {"title": "Goodbye autumn, goodbye autumn!", "season": "autumn"},
  {"title": "Five tall candles stand in a row (Advent fingerplay)", "season": "winter"},
  {"title": "Chickadee! Chickadee! Chick-a-dee-dee-dee!", "season": "winter"},
  {"title": "Advent, Advent, one candle glows", "season": "winter"},
  {"title": "The gnomes are hammering underground", "season": "winter"},
  {"title": "Good morning dear earth, good morning dear sun", "season": "daily"},
  {"title": "Morning has broken (Cat Stevens / traditional)", "season": "daily"},
  {"title": "Here's my hand, give yours to me", "season": "daily"},
  {"title": "The farmer takes a wife (circle game)", "season": "folk"},
  {"title": "Here we go Looby Loo", "season": "folk"}
]
```
> **Note:** 165 total songs across Spring (24), Summer (30), Autumn (30), Winter (30), Daily (20), Folk (25+). Full extraction yields ~165 song objects.

### 3b. Songbooks & Musical Resources (English)

```json
[
  {"title": "A Child's Seasonal Treasury", "author": "Betty Jones", "category": "Essential Circle Time Collections", "meta": "widely regarded as the #1 go-to resource for Waldorf circle time · songs, movement games, fingerplays, crafts and recipes organised by season"},
  {"title": "Let Us Form a Ring (Acorn Hill Anthology)", "author": "Nancy Foster", "category": "Essential Circle Time Collections", "meta": "WECAN Books · complete circle times including the orchard circle"},
  {"title": "Dancing As We Sing — Seasonal Circle Plays & Traditional Singing Games", "author": "Nancy Foster", "category": "Essential Circle Time Collections", "meta": "WECAN Books · spring and summer circle plays"},
  {"title": "A Lifetime of Joy — Circle Games, Finger Games, Songs & Puppet Plays", "author": "Bronja Zahlingen", "category": "Essential Circle Time Collections", "meta": "WECAN Books"},
  {"title": "Movement Journeys and Circle Adventures, Vol. 1 & 2", "author": "Nancy Blanning & Laurie Clark", "category": "Essential Circle Time Collections", "meta": "WECAN Books"},
  {"title": "Spring — Poems, Songs and Stories · Summer · Autumn · Winter", "author": "Wynstones Press", "category": "Wynstones Press Seasonal Series", "meta": "4 volumes"},
  {"title": "Spindrift — Poems, Songs and Stories (year-round)", "author": "Wynstones Press", "category": "Wynstones Press Seasonal Series", "meta": "year-round material including stories from cultures around the world"},
  {"title": "Gateways — Morning, Evening, Birthdays, Fairy Tales", "author": "Jennifer Aulie & Margret Meyerkort", "category": "Wynstones Press Seasonal Series", "meta": "Wynstones Press"},
  {"title": "Sing a Song of Seasons", "author": "Mary Thienes Schunemann", "category": "Pentatonic Songbooks", "meta": "with CD · pentatonic seasonal songs"},
  {"title": "Lavender's Blue Dilly Dilly", "author": "Mary Thienes Schunemann", "category": "Pentatonic Songbooks", "meta": "with CD"},
  {"title": "The Singing Year", "author": "Candy Verney", "category": "Pentatonic Songbooks", "meta": "seasonal songs and poems, many original"},
  {"title": "Pentatonic Songs for Nursery, Kindergarten and Grades 1 & 2", "author": "Elisabeth Lebret", "category": "Pentatonic Songbooks", "meta": "Shepherd Songbook series"},
  {"title": "I Love to Be Me — Songs in the Mood of the Fifth", "author": "Channa A. Seidenberg", "category": "Pentatonic Songbooks", "meta": "Wynstones Press"},
  {"title": "Merrily We Sing — Original Songs in the Mood of the Fifth", "author": "Ilian Willwerth", "category": "Pentatonic Songbooks", "meta": "WECAN Books"},
  {"title": "One for the Golden Sun — Pentatonic Songs", "author": "Peter Oram", "category": "Pentatonic Songbooks", "meta": "Starborn Books, Wales"},
  {"title": "The Mood of the Fifth: A Musical Approach to Early Childhood", "author": "Edited by Nancy Foster", "category": "Theory & Musical Development", "meta": "WECAN / Floris Books"},
  {"title": "Music for Young Children — Quintenlieder", "author": "Rita Jacobs", "category": "Theory & Musical Development", "meta": "translated by Roland Everett · Hawthorn Press"},
  {"title": "The Waldorf Song Book", "author": "Brien Masters", "category": "Theory & Musical Development", "meta": "Floris Books · over 100 songs for Grades 3–8"}
]
```

### 3c. Authors & Educators (English Cards)

```json
[
  {"name": "Nancy Foster", "tag": "Circle Time Leader", "affiliation": "Acorn Hill Waldorf Kindergarten, Silver Spring, MD · WECAN", "description": "Long-time teacher at Acorn Hill Waldorf Kindergarten and leading figure in WECAN teacher education. Her circle time collections are among the most widely used in English-speaking Waldorf kindergartens worldwide."},
  {"name": "Laurie Clark", "tag": "Circle Time Author", "affiliation": "Denver Waldorf School · Colorado, USA · WECAN", "description": "Lead kindergarten teacher at The Denver Waldorf School with 27 years of Waldorf kindergarten experience. Mentors Waldorf teachers across North America."},
  {"name": "Betty Jones", "tag": "Songbook Author", "affiliation": "Waldorf educator · USA", "description": "Author of the most beloved all-in-one Waldorf circle resource for families and teachers."},
  {"name": "Mary Thienes Schunemann", "tag": "Songbook Author", "affiliation": "Waldorf musician & educator · USA", "description": "Completed a full series of pentatonic songbooks with CDs before her death."},
  {"name": "Bronja Zahlingen", "tag": "Composer", "affiliation": "1912–2000 · Austrian-born Waldorf kindergarten teacher", "description": "Dedicated her life to creating and collecting circle games, finger games, songs, puppet plays and verses for Waldorf kindergartens."},
  {"name": "Jennifer Aulie", "tag": "Music Theory", "affiliation": "Waldorf music educator · Wynstones Press / WECAN", "description": "Author of the introductory essays on 'music in the mood of the fifth'."},
  {"name": "Ilian Willwerth", "tag": "Composer", "affiliation": "Waldorf musician · WECAN Books", "description": "Composed original songs in the mood of the fifth for young children."},
  {"name": "Elisabeth Lebret", "tag": "Pentatonic Composer", "affiliation": "Waldorf music teacher", "description": "Author of the respected Shepherd Songbook series."},
  {"name": "Candy Verney", "tag": "Songwriter", "affiliation": "Waldorf songwriter · UK", "description": "Author of The Singing Year."},
  {"name": "Peter Oram", "tag": "Composer", "affiliation": "Starborn Books, Wales · UK", "description": ""},
  {"name": "Channa A. Seidenberg", "tag": "Songwriter", "affiliation": "Wynstones Press · UK", "description": ""},
  {"name": "Margret Meyerkort", "tag": "Editor", "affiliation": "British Waldorf kindergarten teacher · Switzerland-born", "description": "Co-editor of the Gateways anthology."}
]
```

### 3d. Children's Book Authors (English Cards)

```json
[
  {"name": "Elsa Beskow", "tag": "Illustrator", "affiliation": "1874–1953 · Swedish · Floris Books (English)", "description": "The most beloved picture book author in the Waldorf world."},
  {"name": "Sibylle von Olfers", "tag": "Illustrator", "affiliation": "1881–1916 · German · Floris Books (English)", "description": ""},
  {"name": "Daniela Drescher", "tag": "Illustrator", "affiliation": "b. 1966 · German · Floris Books (English)", "description": "Her elf and gnome illustrations are widely beloved in Waldorf homes."},
  {"name": "Brothers Grimm", "tag": "Classic Tales", "affiliation": "unabridged original tales · many editions", "description": "Grimm's fairy tales are the foundation of storytelling in every Waldorf kindergarten."},
  {"name": "Astrid Lindgren", "tag": "Swedish Classic", "affiliation": "1907–2002", "description": ""},
  {"name": "Otfried Preußler", "tag": "German Classic", "affiliation": "1923–2013", "description": ""},
  {"name": "Waldorf Grade Reading", "tag": "By Grade", "affiliation": "traditional curriculum sequence", "description": ""}
]
```

### 3e. Resource Cards (English)

```json
[
  {"name": "Floris Books", "tag": "Publisher", "description": "Main English-language publisher of Waldorf books."},
  {"name": "Wynstones Press", "tag": "Publisher", "description": "Publisher of the seasonal series."},
  {"name": "WECAN Books", "tag": "Books & Curriculum", "description": "Waldorf Early Childhood Association of North America."},
  {"name": "Waldorf Publications", "tag": "Books & Curriculum", "description": "Research Institute for Waldorf Education."},
  {"name": "Earthschooling / WaldorfBooks.com", "tag": "Online Shop", "description": "Large online selection of Waldorf books."},
  {"name": "Paper Scissors Stone", "tag": "Online Shop", "description": "Waldorf supplies and books."},
  {"name": "WECAN", "tag": "Organisation", "description": "Waldorf Early Childhood Assoc. North America."},
  {"name": "AWME", "tag": "Organisation", "description": "Association for Waldorf Music Education."}
]
```

### 3f. Adult Books (English)

```json
[
  {"title": "The Education of the Child in the Light of Anthroposophy", "author": "Rudolf Steiner", "category": "By Rudolf Steiner"},
  {"title": "Rhythms of Learning — Key Lectures on Children and Education", "author": "Rudolf Steiner, edited by Roberto Trostli", "category": "By Rudolf Steiner"},
  {"title": "The Foundations of Human Experience (Study of Man)", "author": "Rudolf Steiner", "category": "By Rudolf Steiner"},
  {"title": "You Are Your Child's First Teacher", "author": "Rahima Baldwin Dancy", "category": "Essential Reading for Parents"},
  {"title": "Beyond the Rainbow Bridge — Nurturing Our Children from Birth to Seven", "author": "Barbara J. Patterson & Pamela Bradley", "category": "Essential Reading for Parents"},
  {"title": "Heaven on Earth — A Handbook for Parents of Young Children", "author": "Sharifa Oppenheimer", "category": "Essential Reading for Parents"},
  {"title": "Simplicity Parenting", "author": "Kim John Payne", "category": "Essential Reading for Parents"},
  {"title": "Free to Learn — Introducing Steiner Waldorf Early Childhood Education", "author": "Lynne Oldfield", "category": "For Early Childhood Educators"},
  {"title": "What Is a Waldorf Kindergarten?", "author": "Joan Almon", "category": "For Early Childhood Educators"},
  {"title": "Waldorf Education — A Family Guide", "author": "Pamela J. Fenner", "category": "For Early Childhood Educators"},
  {"title": "Earthways — Simple Environmental Activities for Young Children", "author": "Carol Petrash", "category": "For Early Childhood Educators"}
]
```

### 3g. Main Directory — Sample `link-list` Entries (Mentors section)

```json
[
  {
    "name": "Jean Miller",
    "detail": "25+ years Waldorf homeschool mentor. Podcast, Inspired at Home community, one-to-one coaching.",
    "url": "artofhomeschooling.com",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  },
  {
    "name": "Kim John Payne MEd",
    "detail": "Leading Waldorf educator. Author Simplicity Parenting. Speaks to 10,000–20,000 parents/year. Social Inclusion Approach in 200+ schools.",
    "url": "simplicityparenting.com",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  },
  {
    "name": "Dr. Adam Blanning MD",
    "detail": "Anthroposophic family doctor. PAAM Co-Leader. Co-Leader Medical Section Goetheanum. Waldorf school doctor Denver/Boulder.",
    "url": "PAAM · paam.net",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  },
  {
    "name": "Carrie Dendtler",
    "detail": "The Parenting Passageway. Widely-read Waldorf parenting and homeschool blog.",
    "url": "theparentingpassageway.com",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  },
  {
    "name": "Melisa & Erik Nielsen",
    "detail": "Waldorf Essentials. Curriculum creators, podcast hosts, mentors for homeschooling families.",
    "url": "waldorfessentials.com",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  },
  {
    "name": "Sophie — Waldorf This Way",
    "detail": "New Zealand. Experienced Waldorf class teacher and curriculum developer. Personalised 1:1 homeschool curriculum planning.",
    "url": "waldorfthisway.com",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  },
  {
    "name": "Suzanne Down — Juniper Tree School of Story & Puppetry Arts",
    "detail": "USA (Boulder, Colorado). Waldorf puppetry educator. 40+ years. One-Year Online Puppetry Training.",
    "url": "junipertreepuppets.com",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  },
  {
    "name": "Laurie Clark — Movement, Circle Games & Singing Games",
    "detail": "USA (Denver). 40+ years Waldorf early childhood educator. Lead kindergarten teacher Denver Waldorf School.",
    "url": "WECAN · waldorfearlychildhood.org",
    "section": "Adult Education & Teacher Training > Key Mentors & Speakers"
  }
]
```

### 3h. Main Directory — Sample `entry` Cards (Baby Care)

```json
[
  {
    "name": "Disana",
    "description": "Germany. Founded 1969. Oldest organic textile brand. Fine knit + boiled wool. Also organic cotton cloth nappies + wool diaper covers.",
    "tag": "GOTS certified",
    "section": "Baby Care > Natural Baby Clothing Brands"
  },
  {
    "name": "Engel Natur",
    "description": "Germany (family business since 1927). Merino/silk base layers. Babies through adults. No chemical finishing.",
    "tag": "IVN BEST + GOTS",
    "section": "Baby Care > Natural Baby Clothing Brands"
  },
  {
    "name": "Weleda",
    "description": "Founded 1921 by Steiner & Wegman. Biodynamic. #1 anthroposophical baby care worldwide.",
    "url": "weleda.com",
    "section": "Baby Care > Baby Care Product Brands"
  },
  {
    "name": "Dr. Hauschka",
    "description": "Founded 1967. Anthroposophical skincare. Demeter-certified biodynamic garden.",
    "url": "drhauschka.com",
    "section": "Baby Care > Baby Care Product Brands"
  }
]
```

---

## 4. How to Parse (Recommended Approach)

### For English/Spanish Directory Files (files 2, 3, 4)

**Pattern-based extraction in any language:**

```
# Circle songs
song_item_pattern = /<div class="song-item">.*?<\/span>(.*?)<\/div>/g

# Book items  
book_item_pattern = /<div class="book-item">.*?<h4>(.*?)<\/h4>.*?<div class="meta">(.*?)<\/div>/gs

# Author/resource cards
card_pattern = /<div class="card">\s*<span class="card-tag[^"]*"[^>]*>(.*?)<\/span>\s*<h3>(.*?)<\/h3>(?:\s*<div class="author">(.*?)<\/div>)?(?:\s*<p>(.*?)<\/p>)?/gs
```

### For Main Directory (file 1)

**Two-phase approach:**

Phase 1 — Basic extraction per pattern:
```
# link-list items
ll_pattern = /<li><span class="ll-name">(.*?)<\/span><span class="ll-detail">(.*?)<\/span><span class="ll-url">(.*?)<\/span><\/li>/gs

# entry cards
entry_pattern = /<div class="entry">\s*<div class="entry-name">(.*?)<\/div>\s*<div class="entry-sub">(.*?)<\/div>(?:\s*<span class="entry-tag[^"]*"[^>]*>(.*?)<\/span>)?/gs
```

Phase 2 — Cleanup:
- Split `ll-detail` on `·` or `|` to guess location vs description vs URL
- Normalize HTML entities (`&amp;` → `&`, `&nbsp;` → ` `)
- Manually verify featured/highlight box entries (~20 entries with complex HTML)

### To skip

For `waldorf-directory-consolidated_1.html`, do NOT attempt entry extraction. Use this file as reference prose content only.

---

## 5. Summary

| File | Lines | Extractable Entries | Difficulty | Value for PWA |
|------|-------|---------------------|------------|---------------|
| `the_waldorf_path_directory.html` | 6,868 | ~1,033 (mixed types) | Moderate | High — mentors, products, schools |
| `waldorf_directory_english_1.html` | 686 | ~222 | Easy | High — songs, books, authors |
| `waldorf_directory_english_2.html` | 686 | ~222 | Easy | High — same as above |
| `waldorf_directorio_espanol_1.html` | 669 | ~280+ | Easy | Medium — Spanish content |
| `waldorf-directory-consolidated_1.html` | 4,745 | 0 (prose) | N/A | Medium — reference guides |

**Recommendation:** Write a Node.js/Python script for the 3 small directory files (2-4) using regex patterns — this will yield ~720+ clean entries in minutes. For the main directory (file 1), use a phased approach: extract all span-based entries automatically, then do a single manual pass over the featured/highlight sections (~20 items) and the inline-style sections (~30 items).
