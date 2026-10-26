/**
 * societyCuration.ts
 * ==================
 * Structured data extracted from Nina's master Waldorf Path HTML document.
 * Covers: Handwork Curriculum, Global Anthroposophical Societies,
 * Nutrition Pillars, Chalkboard Art Resources, and Resale / Supply Platforms.
 *
 * Sources: Parts 3 & 4 of "The Waldorf Path — A Curated Directory for Waldorf Living (May 2026)"
 */

// ─────────────────────────────────────────────────────────────────────────────
// I. WALDORF HANDWORK CURRICULUM BY GRADE
// ─────────────────────────────────────────────────────────────────────────────

export interface HandworkGrade {
  grade: string;
  ageRange: string;
  coreSkills: string[];
  typicalFirstProject: string;
  curriculumGuideLink: string;
}

export const HANDWORK_CURRICULUM: HandworkGrade[] = [
  {
    grade: "Kindergarten",
    ageRange: "Age 4–6",
    coreSkills: ["Finger games", "Fingerknitting", "Simple sewing", "Beeswax modelling"],
    typicalFirstProject: "Fingerknitted cord or simple wool felt shape sewn together",
    curriculumGuideLink: "waldorfhandwork.org"
  },
  {
    grade: "Grade 1",
    ageRange: "Age 7",
    coreSkills: ["French knitting (knitting fork)", "Finger crochet", "Simple sewing"],
    typicalFirstProject: "French-knitted cord snake or doorstop",
    curriculumGuideLink: "peacewithnaturehandwork.com"
  },
  {
    grade: "Grade 2",
    ageRange: "Age 8",
    coreSkills: ["Two-needle knitting begins", "Flat knitting", "Simple patterns"],
    typicalFirstProject: "Knitted square or simple bag",
    curriculumGuideLink: "handwork2026.org"
  },
  {
    grade: "Grade 3",
    ageRange: "Age 9",
    coreSkills: ["Knitting in the round", "Shaping", "Simple crochet"],
    typicalFirstProject: "Knitted slippers or simple hat in the round",
    curriculumGuideLink: "waldorfhandwork.org"
  },
  {
    grade: "Grade 4",
    ageRange: "Age 10",
    coreSkills: ["Cross-stitch embroidery", "Beginning weaving", "Complex knitting"],
    typicalFirstProject: "Cross-stitched pouch, woven small piece",
    curriculumGuideLink: "peacewithnaturehandwork.com"
  },
  {
    grade: "Grade 5",
    ageRange: "Age 11",
    coreSkills: ["Embroidery", "Wet felting", "Drop spindle spinning"],
    typicalFirstProject: "Embroidered panel or first spinning project",
    curriculumGuideLink: "handwork2026.org"
  },
  {
    grade: "Grade 6",
    ageRange: "Age 12",
    coreSkills: ["Knitting with multiple colours", "Complex crochet", "Weaving on a loom"],
    typicalFirstProject: "Knitted colourwork socks or simple jacket",
    curriculumGuideLink: "waldorfhandwork.org"
  },
  {
    grade: "Grades 7–8",
    ageRange: "Age 13–14",
    coreSkills: ["Sewing garments", "Complex crafts", "Book-binding", "Leatherwork"],
    typicalFirstProject: "Sewn garment or complex craft project of choice",
    curriculumGuideLink: "peacewithnaturehandwork.com"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// II. GLOBAL ANTHROPOSOPHICAL SOCIETY BRANCHES
// ─────────────────────────────────────────────────────────────────────────────

export interface AnthroSociety {
  countryRegion: string;
  flag: string;
  societyName: string;
  headquarters: string;
  webDomain: string;
  primaryContact?: string;
  networkVolume: string;
  focusAreas: string[];
}

export const ANTHROPOSOPHICAL_SOCIETIES: AnthroSociety[] = [
  {
    countryRegion: "International",
    flag: "🌐",
    societyName: "General Anthroposophical Society",
    headquarters: "Dornach, Switzerland (World Centre — the Goetheanum)",
    webDomain: "goetheanum.ch",
    primaryContact: "info@goetheanum.ch",
    networkVolume: "~42,000 members, 70+ national societies worldwide",
    focusAreas: ["Research Sections", "School of Spiritual Science", "Annual General Assembly", "Waldorf worldwide coordination"]
  },
  {
    countryRegion: "USA",
    flag: "🇺🇸",
    societyName: "Anthroposophical Society in America (ASA)",
    headquarters: "Rudolf Steiner House, Ann Arbor, Michigan",
    webDomain: "anthroposophy.org",
    primaryContact: "reception@anthroposophy.org",
    networkVolume: "Nearly 120 local groups and branches across 36+ states",
    focusAreas: ["Three regional councils (Eastern, Central, Western)", "Rudolf Steiner Library mail-order lending", "Local study groups", "Seasonal festivals"]
  },
  {
    countryRegion: "United Kingdom",
    flag: "🇬🇧",
    societyName: "Anthroposophical Society in Great Britain",
    headquarters: "Rudolf Steiner House, London, England",
    webDomain: "rsh.anth.org.uk",
    networkVolume: "Extensive branches and groups across Great Britain",
    focusAreas: ["Library and lectures", "Public events", "Seasonal festivals", "Branch study circles"]
  },
  {
    countryRegion: "Ireland",
    flag: "🇮🇪",
    societyName: "Anthroposophical Society in Ireland",
    headquarters: "Dublin, Ireland",
    webDomain: "anthroposophy.ie",
    networkVolume: "Branches across Ireland — independent from the GB society",
    focusAreas: ["Independent Irish branch network", "Study groups", "Seasonal activities"]
  },
  {
    countryRegion: "Germany",
    flag: "🇩🇪",
    societyName: "Anthroposophische Gesellschaft in Deutschland",
    headquarters: "Multiple regional branches across Germany",
    webDomain: "agev.de",
    networkVolume: "One of the largest national societies — intensive cultural and educational activity",
    focusAreas: ["250+ Waldorf schools", "Biodynamic agriculture", "Anthroposophic medicine", "Cultural renewal"]
  },
  {
    countryRegion: "Switzerland",
    flag: "🇨🇭",
    societyName: "Anthroposophische Gesellschaft in der Schweiz",
    headquarters: "Dornach / Basel / Zürich / Bern, Switzerland",
    webDomain: "anthroposophie.ch",
    networkVolume: "Host of the Goetheanum — strong branch network",
    focusAreas: ["Goetheanum host country", "Dornach community", "Research and artistic activities"]
  },
  {
    countryRegion: "Netherlands",
    flag: "🇳🇱",
    societyName: "Antroposofische Vereniging Nederland",
    headquarters: "Amsterdam / Utrecht / Leiden / Arnhem, Netherlands",
    webDomain: "antroposofie.nl",
    networkVolume: "One of Europe's most active societies",
    focusAreas: ["High-density urban reading circles", "Study blocks", "Artistic activities", "Waldorf pedagogy"]
  },
  {
    countryRegion: "Australia",
    flag: "🇦🇺",
    societyName: "Anthroposophical Society of Australia",
    headquarters: "Sydney / Melbourne / Brisbane / Adelaide / Perth",
    webDomain: "anthroposophyau.org.au",
    networkVolume: "Branches across all major Australian cities",
    focusAreas: ["Australasian coordination", "Waldorf education", "Biodynamic farming", "Anthroposophic medicine"]
  },
  {
    countryRegion: "New Zealand",
    flag: "🇳🇿",
    societyName: "Anthroposophical Society in New Zealand",
    headquarters: "New Zealand National Initiatives",
    webDomain: "goetheanum.ch/en/society",
    networkVolume: "Groups across NZ — contact via Australian society or the Goetheanum",
    focusAreas: ["Southern Hemisphere coordination", "Waldorf education", "Study groups"]
  },
  {
    countryRegion: "South Africa",
    flag: "🇿🇦",
    societyName: "Anthroposophical Society of South Africa",
    headquarters: "Cape Town / Johannesburg, South Africa",
    webDomain: "goetheanum.ch/en/society",
    networkVolume: "15 schools, 14 kindergartens — continental hub for African Waldorf",
    focusAreas: ["Teacher training hub for sub-Saharan Africa", "Anthroposophic medicine", "Community development"]
  },
  {
    countryRegion: "Brazil",
    flag: "🇧🇷",
    societyName: "Sociedade Antroposófica no Brasil",
    headquarters: "São Paulo, Brazil",
    webDomain: "sociedadeantroposofica.com.br",
    networkVolume: "One of the largest Latin American anthroposophical societies — 36 schools, 77 kindergartens",
    focusAreas: ["Waldorf education", "Biodynamic agriculture (IBD)", "Anthroposophic medicine (SUS integration)", "Weleda do Brasil"]
  },
  {
    countryRegion: "Argentina",
    flag: "🇦🇷",
    societyName: "Sociedad Antroposófica Argentina",
    headquarters: "Buenos Aires, Argentina",
    webDomain: "goetheanum.ch/en/society",
    networkVolume: "Active study groups and lectures — 15 Waldorf schools",
    focusAreas: ["Study groups", "Editorial Antroposófica", "Waldorf teacher training", "AM Postgraduate training"]
  },
  {
    countryRegion: "Canada",
    flag: "🇨🇦",
    societyName: "Anthroposophical Society in Canada",
    headquarters: "Vancouver / Victoria / Toronto / Montreal",
    webDomain: "anthroposophy.ca",
    networkVolume: "Trans-Canadian study groups and regional council meetings",
    focusAreas: ["Study circles", "Waldorf teacher training", "Seasonal festivals", "Community initiatives"]
  },
  {
    countryRegion: "India",
    flag: "🇮🇳",
    societyName: "Anthroposophical Society in India",
    headquarters: "Chennai / Mumbai / Bangalore",
    webDomain: "goetheanum.ch/en/society",
    networkVolume: "Growing community connected to Waldorf education and biodynamic farming",
    focusAreas: ["Biodynamic agriculture", "Waldorf teacher training", "Community development", "Growing movement"]
  }
];

// Global Membership Statistics
export const SOCIETY_GLOBAL_STATS = {
  totalMembers: 42000,
  nationalSocieties: 70,
  waldorfSchools: 1100,
  waldorfSchoolCountries: 64,
  waldorfKindergartens: 1857,
  historicalMilestones: [
    { year: 1912, event: "First Anthroposophical Society founded in Cologne — decisive break from Theosophical Society" },
    { year: 1913, event: "First Goetheanum construction begins in Dornach, Switzerland" },
    { year: 1919, event: "First Waldorf school opens, Stuttgart — 7 September 1919" },
    { year: 1922, event: "First Goetheanum destroyed by arson on New Year's Eve" },
    { year: 1923, event: "Re-founding at the Christmas Conference, Dornach — the most significant event in anthroposophical history" },
    { year: 1924, event: "Steiner gives Agriculture Course (biodynamics), Curative Education Course, Karma lectures, and First Class of School of Spiritual Science" },
    { year: 1925, event: "Rudolf Steiner dies 30 March 1925 — leaving 6,000+ lectures and 30 written books" }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// III. WALDORF NUTRITION PRINCIPLES
// ─────────────────────────────────────────────────────────────────────────────

export interface NutritionPillar {
  pillar: string;
  steinerIndication: string;
  practicalApplication: string;
  schoolroomIntegration: string;
  referenceBook: string;
  referenceLink: string;
}

export const NUTRITION_PILLARS: NutritionPillar[] = [
  {
    pillar: "Whole Grains Daily",
    steinerIndication: "Cooked whole grains or coarse bread support the strength of body and mind. The grain rhythm (planetary correspondence) brings cosmic order into daily nourishment.",
    practicalApplication: "Porridge for breakfast, whole grain bread, grain-based soups and stews. Follow the weekly grain rhythm where possible.",
    schoolroomIntegration: "Daily baking loops; grinding grains by hand in the classroom from Grade 3.",
    referenceBook: "Foodwise: Understanding What We Eat and How It Affects Us — Wendy Cook",
    referenceLink: "clairviewbooks.com"
  },
  {
    pillar: "Biodynamic & Organic Food",
    steinerIndication: "Steiner founded biodynamic agriculture in 1924 specifically to restore the life forces in food depleted by industrial methods.",
    practicalApplication: "Buy biodynamic or certified organic food where possible. Grow a garden. Visit a biodynamic farm. Choose seasonal and local foods.",
    schoolroomIntegration: "School gardens from Grade 3 onward — children grow, harvest and cook their own food.",
    referenceBook: "The Biodynamic Food & Cookbook — Wendy Cook",
    referenceLink: "clairviewbooks.com"
  },
  {
    pillar: "Plant-Forward Diet",
    steinerIndication: "'Nothing clouds the nervous system when nourishment comes from the plant realm.' Steiner was vegetarian and believed plant food supports spiritual development.",
    practicalApplication: "Most Waldorf schools serve vegetarian meals. Meat, if eaten, should be of the highest quality and eaten mindfully and sparingly.",
    schoolroomIntegration: "Waldorf school kitchens serve vegetarian menus; daily snack preparation as classroom activity.",
    referenceBook: "The Dynamics of Nutrition — Gerhard Schmidt",
    referenceLink: "steinerbooks.org"
  },
  {
    pillar: "Milk as Complete Food",
    steinerIndication: "Steiner described milk as 'a perfect food,' one containing all the nutrients we need to live and providing strength on an otherwise vegetarian diet.",
    practicalApplication: "Dairy — especially whole, ideally raw or unhomogenised — is valued in the Waldorf tradition. Cheese, yoghurt, butter, cream.",
    schoolroomIntegration: "Dairy features prominently in Waldorf school snacks and meal planning.",
    referenceBook: "Nutrition: Food, Health and Spiritual Development — Rudolf Steiner",
    referenceLink: "steinerbooks.org"
  },
  {
    pillar: "Avoid the Potato",
    steinerIndication: "Steiner felt potatoes had a materialising, earthbound effect on consciousness too heavy for clarity of thinking. Bread and whole grains are far preferred.",
    practicalApplication: "Potatoes are used sparingly. Root vegetables (carrots, parsnips, celeriac) are preferred as daily carbohydrate accompaniments.",
    schoolroomIntegration: "School kitchens emphasise root vegetables and whole grain alternatives over potato-based dishes.",
    referenceBook: "Nutrition: Food, Health and Spiritual Development — Rudolf Steiner",
    referenceLink: "steinerbooks.org"
  },
  {
    pillar: "No Processed Sugar",
    steinerIndication: "Steiner distinguished between natural sweeteners and refined sugar — which he saw as having a hardening, calcifying effect, especially on children.",
    practicalApplication: "Waldorf school snacks use honey, dried fruit, whole fruit and naturally sweet root vegetables. Baking uses rapadura, honey or maple syrup.",
    schoolroomIntegration: "Baking activities use only natural sweeteners. Birthday cakes made with honey and whole grain flour.",
    referenceBook: "Cooking for the Love of the World — Anne-Marie Fryer Wiboltt",
    referenceLink: "steinerbooks.org"
  },
  {
    pillar: "Seasonal & Local Eating",
    steinerIndication: "Eating food grown in your own region and in its natural season connects you to the living forces of your specific place on earth.",
    practicalApplication: "The Waldorf kitchen follows the seasons — root soups in winter, salads in summer, berry abundance in late summer, grain baking in autumn.",
    schoolroomIntegration: "Seasonal cooking woven through the curriculum year; festival cooking aligns with the seasonal round.",
    referenceBook: "Simply in Season — Mary Beth Lind & Cathleen Hockman-Wert",
    referenceLink: "heraldpress.com"
  },
  {
    pillar: "Food as Ritual",
    steinerIndication: "The meal blessing before eating, setting the table with beauty, the shared family meal — all are nutritional acts in the deepest sense.",
    practicalApplication: "Meal blessings, candles at the table, beautiful crockery, unhurried meals. The transition song before snack time in kindergarten is a nutritional act.",
    schoolroomIntegration: "Every Waldorf kindergarten snack begins with a seasonal verse or blessing. Screen-free meals in all Waldorf schools.",
    referenceBook: "Nourishing Wisdom: A Mind-Body Approach to Nutrition and Well-Being — Marc David",
    referenceLink: "harmonybooks.com"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// IV. CHALKBOARD ART RESOURCES
// ─────────────────────────────────────────────────────────────────────────────

export interface ChalkboardResource {
  name: string;
  platform: string;
  location: string;
  specialty: string;
  gradeScope: string;
  primaryResource: string;
  accessLink: string;
  followerCount?: string;
}

export const CHALKBOARD_RESOURCES: ChalkboardResource[] = [
  {
    name: "Arne Kaiser",
    platform: "Blurb Books / Pinterest",
    location: "Netherlands / Flagstaff, AZ, USA",
    specialty: "Luminous block-chalk veiling, gradient layers and blending — B.A. in Waldorf Education",
    gradeScope: "Grade 1 through Grade 8 (400 drawings in curriculum sequence)",
    primaryResource: "My Chalkboard — A Guided Tour of the Waldorf Curriculum with 400 Chalk Drawings",
    accessLink: "blurb.com — search 'My Chalkboard Arne Kaiser'"
  },
  {
    name: "Narsingh Khalsa",
    platform: "Instagram @khalsaart / Etsy TeachingWaldorf / Facebook",
    location: "USA",
    specialty: "Rich, highly seasonal classroom compositions — seasonal boards spanning all grade levels",
    gradeScope: "Full Grade 1 to Grade 8 main lesson drawings and planners",
    primaryResource: "TeachingWaldorf Etsy — main lesson book pages, chalkboard drawing guides, curriculum planning",
    accessLink: "etsy.com/shop/TeachingWaldorf",
    followerCount: "49,000 Facebook / Waldorf Art and Teacher page"
  },
  {
    name: "Nathaniel Santa Cruz — Wondergarten",
    platform: "Wondergarten.net / Instagram @wondergarten",
    location: "Puyallup, Washington, USA",
    specialty: "Non-academic early childhood gnome/nature chalkboard illustrations — original characters with original songs",
    gradeScope: "Preschool and Kindergarten (Ages 3–6)",
    primaryResource: "Wondergarten Curriculum (2024) — seasonal stories, songs and chalkboard illustrations. Music Theory Chalkboard Print.",
    accessLink: "wondergarten.net"
  },
  {
    name: "Danijela Zura — @waldorfblackboard",
    platform: "Instagram @waldorfblackboard",
    location: "International",
    specialty: "Community curation of global Waldorf teacher chalkboard artwork — actively credits contributing teachers",
    gradeScope: "Multi-grade, worldwide classroom collections and seasonal boards",
    primaryResource: "Waldorf Blackboard Instagram — 1,581 posts of curated teacher boards",
    accessLink: "instagram.com/waldorfblackboard",
    followerCount: "23,000 followers"
  },
  {
    name: "Steve Simonak",
    platform: "Sunbridge Institute",
    location: "Brooklyn / Chestnut Ridge, NY, USA",
    specialty: "Canvas-style chalk work, colour mixing, main lesson design — BFA Pratt Institute, 26 years Hawthorne Valley",
    gradeScope: "Intermediate and upper elementary grade school (Grades 3–8)",
    primaryResource: "Annual summer workshop: 'Techniques and Skills for Creating Beautiful Drawings in the Grades: A Focus on Chalkboards and Main Lesson Books' — Sunbridge Institute, Chestnut Ridge NY",
    accessLink: "sunbridge.edu"
  },
  {
    name: "Gail Lescher BFA",
    platform: "Prairie Moon Waldorf School",
    location: "USA",
    specialty: "Fine-art grounded landscape rendering and technical board design — Waldorf master teacher",
    gradeScope: "All levels — advanced teacher training and intermediate elements",
    primaryResource: "'Chalk Board Drawing Lesson' (100-min video) and 'Advanced Chalkboard Drawings' (4+ hours) — Prairie Moon School",
    accessLink: "prairiemoon.org/training-videos"
  },
  {
    name: "Robyn Beaufoy & Brian Wolfe — Waldorfish",
    platform: "Waldorfish.com",
    location: "Australia",
    specialty: "Online art courses for Waldorf homeschoolers and teachers — 25+ years combined experience",
    gradeScope: "Kindergarten through High School (Ages 0–21)",
    primaryResource: "Waldorf Art for Beginners, Weekly Art Foundations, Diving Deeper, Weekly Art and Beyond (32 lessons)",
    accessLink: "waldorfish.com"
  },
  {
    name: "@waldorfblackboard Community",
    platform: "Instagram",
    location: "International",
    specialty: "Community gathering place for Waldorf teacher-artists worldwide sharing board work",
    gradeScope: "All grades — seasonal, curriculum-linked and festival boards",
    primaryResource: "#waldorfchalkboard #waldorfblackboard — Instagram community hashtags",
    accessLink: "instagram.com/waldorfblackboard"
  }
];

// Chalkboard Supplies Guide
export const CHALKBOARD_SUPPLIES = [
  {
    item: "Block chalk / blackboard crayons",
    recommended: "Stockmar Blackboard Chalk (block form) — the gold standard. Sets of 12 or 24 colours. Rich, blendable, non-toxic. Alternatively: Lyra chalk or Mercurius chalk blocks.",
    whereToBuy: "waldorfshop.eu · achildsdream.com · Bella Luna Toys · Maplerose"
  },
  {
    item: "Blackboard (chalkboard surface)",
    recommended: "Traditional slate or blackboard paint on wood/MDF. Avoid green chalkboards — dark grey-black gives much richer colour depth. Many Waldorf teachers make their own boards.",
    whereToBuy: "Hardware stores · Amazon · Art supply shops"
  },
  {
    item: "Reference / Instruction Books",
    recommended: "My Chalkboard (Arne Kaiser, Blurb Books, 400 drawings Grades 1–8) · Blackboard Sketching (Frederick Whitney, 1908, free online)",
    whereToBuy: "blurb.com · Amazon · waldorfteacherresources.com (free)"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// V. NATURAL DYEING GUIDE
// ─────────────────────────────────────────────────────────────────────────────

export interface DyePlant {
  colour: string;
  emoji: string;
  plant: string;
  description: string;
  wofPercentage: string;
  waldorfUse: string;
}

export const DYE_PLANTS: DyePlant[] = [
  {
    colour: "Golden Yellow to Burnt Orange",
    emoji: "🟡",
    plant: "Yellow Onion Skins",
    description: "Dry papery skins — warm golden yellow to burnt orange. One of the richest, most reliable dye plants, and completely free.",
    wofPercentage: "50–100%",
    waldorfUse: "Classic Waldorf autumn seasonal colour; birthday crown trim; wet-felting wool"
  },
  {
    colour: "Warm Yellow / Gold / Soft Orange",
    emoji: "🟠",
    plant: "Marigold Flowers (Tagetes / Calendula)",
    description: "Flower heads — warm yellow, gold, soft orange. Easy to grow in the garden; the classic Waldorf summer dye.",
    wofPercentage: "100% fresh / 50% dried",
    waldorfUse: "Summer nature table cloths; play silk dyeing; seasonal craft wool"
  },
  {
    colour: "Coral / Salmon / Brick Red",
    emoji: "🔴",
    plant: "Madder Root",
    description: "Roots (3+ years old) — coral, salmon, brick red. The most important red dye plant in the Western tradition.",
    wofPercentage: "50–100%",
    waldorfUse: "Waldorf Carmine/Vermilion palette; play silks; seasonal cloths"
  },
  {
    colour: "Lemon Yellow",
    emoji: "🟡",
    plant: "Weld (Reseda luteola)",
    description: "Whole plant in flower — the clearest, most lightfast lemon yellow of all dye plants.",
    wofPercentage: "100%",
    waldorfUse: "Waldorf Lemon Yellow equivalent; knitting yarn; nature table cloths"
  },
  {
    colour: "Pale Sky to Deep Navy Blue",
    emoji: "🔵",
    plant: "Indigo / Woad",
    description: "Fermented leaves — pale sky to deep navy via the vat method. The source of all blues in the Waldorf palette.",
    wofPercentage: "Vat method — dip layers",
    waldorfUse: "Waldorf Prussian/Ultramarine Blue equivalent; play silks; winter nature table cloths"
  },
  {
    colour: "Soft Pink to Dusty Rose",
    emoji: "🩷",
    plant: "Avocado Pits & Skins",
    description: "Clean pits and skins — soft pink to dusty rose, especially on silk. Use ~6–8 avocados per 100g wool. Completely free if you cook with avocados.",
    wofPercentage: "6–8 avocados per 100g",
    waldorfUse: "Play silks; fairy dresses; spring seasonal cloths"
  },
  {
    colour: "Warm Brown",
    emoji: "🟤",
    plant: "Walnut Hulls",
    description: "Outer green hulls — warm brown with no mordant needed. The simplest dye of all; can also be used cold.",
    wofPercentage: "100%",
    waldorfUse: "Earth tone felt; autumn seasonal items; gnome clothing"
  },
  {
    colour: "Vivid Pink / Crimson / Magenta",
    emoji: "🩷",
    plant: "Cochineal",
    description: "Dried insects — vivid pink, crimson, magenta, purple (alkaline bath). The most powerful natural red/pink dye.",
    wofPercentage: "3–10%",
    waldorfUse: "Festival play silks; dolls' clothing; spring crafts"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// VI. RESALE PLATFORMS & SUPPLY INFRASTRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

export interface ResalePlatform {
  name: string;
  geographicHub: string;
  primaryCategory: string;
  searchTags: string[];
  waldorfValueAlignment: string;
  webEndpoint: string;
}

export const RESALE_PLATFORMS: ResalePlatform[] = [
  {
    name: "AbeBooks",
    geographicHub: "Global",
    primaryCategory: "Used and out-of-print Waldorf and Steiner reference texts",
    searchTags: ["Floris Books", "Hawthorn Press", "Isabel Wyatt", "Steiner Press", "Rudolf Steiner"],
    waldorfValueAlignment: "Preserves historical curriculum libraries at accessible pricing for families and teachers",
    webEndpoint: "abebooks.com"
  },
  {
    name: "Vinted",
    geographicHub: "European Union / USA",
    primaryCategory: "Pre-loved organic merino wool and silk children's apparel",
    searchTags: ["Disana", "Engel Natur", "Reiff Strickmode", "Hocosa", "Zitterfaden", "merino wool children"],
    waldorfValueAlignment: "Extends the life cycle of premium, sustainable natural fibre garments at lower prices",
    webEndpoint: "vinted.com"
  },
  {
    name: "Raduga Grez (Rainbow Dreams)",
    geographicHub: "Russia / Global Fulfilment",
    primaryCategory: "Heirloom solid-wood toy carvings — stackers, rainbows, arches, animals",
    searchTags: ["Solid linden wood", "Water-based velvet tint", "No varnish", "Third-generation carpenters", "Waldorf stackers"],
    waldorfValueAlignment: "Third-generation carpentry showcasing open-ended artistic play; sustainable sourcing",
    webEndpoint: "raduga-grez.com"
  },
  {
    name: "Q'ewar Project",
    geographicHub: "Andahuaylillas, Cusco, Peru",
    primaryCategory: "Fair-trade, authentic, hand-sewn organic Waldorf dolls",
    searchTags: ["Quechua women", "Alpaca fiber hair", "Sheep wool stuffing", "Backstrap loom", "Natural dyes"],
    waldorfValueAlignment: "Economic independence for indigenous Andean mothers; each doll takes 5 days to make",
    webEndpoint: "qewar.com"
  },
  {
    name: "Evi Dolls — Atelier de Bonecas Evi",
    geographicHub: "São Paulo, Brazil",
    primaryCategory: "Pure cotton-velour Waldorf soft dolls with simple expressions",
    searchTags: ["Single mother cooperative", "Mohair hair", "Soft wool filling", "Brazilian Waldorf doll", "1988 founded"],
    waldorfValueAlignment: "Provides home-based craft income for single mothers and people with disabilities",
    webEndpoint: "bellalunatoys.com (international distributor)"
  },
  {
    name: "Waldorfshop.eu",
    geographicHub: "Germany (ships Europe-wide)",
    primaryCategory: "New Waldorf supplies — art materials, instruments, natural toys, books",
    searchTags: ["Stockmar", "Choroi", "Filges wool", "Mercurius", "Waldorf school supplies"],
    waldorfValueAlignment: "The largest Waldorf supply shop in Europe; supports Bund der Freien Waldorfschulen",
    webEndpoint: "waldorfshop.eu"
  },
  {
    name: "Gnomes & Acorns",
    geographicHub: "Canada",
    primaryCategory: "Ethically curated Waldorf toys and supplies — Women's Cooperative sourcing",
    searchTags: ["Waldorf Canada", "Women's cooperative", "Evi Dolls", "Mercurius art supplies", "Weleda"],
    waldorfValueAlignment: "'SEE BEAUTY. CREATE ART. LOVE READING. SUSTAIN NATURE.' — ethical global sourcing",
    webEndpoint: "gnomesandacorns.ca"
  },
  {
    name: "Stardust Concept Store",
    geographicHub: "Netherlands",
    primaryCategory: "Curated sustainable Waldorf children's goods — toys, books, seasonal décor",
    searchTags: ["Grimm's", "Grapat", "Glückskäfer", "Waldorf Netherlands", "sustainable children's goods"],
    waldorfValueAlignment: "Run by a mother and daughter — thoughtful curation for quality, sustainability and Waldorf values",
    webEndpoint: "stardust.store"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// VII. WALDORF LITERATURE GUIDE (by developmental age)
// ─────────────────────────────────────────────────────────────────────────────

export interface WaldorfBook {
  title: string;
  author: string;
  ageRange: string;
  gradeRange: string;
  category: string;
  description: string;
  publisher: string;
}

export const WALDORF_LITERATURE: WaldorfBook[] = [
  // Ages 0-3
  { title: "Gesture Games for Spring & Summer / Autumn & Winter", author: "Wilma Ellersiek (WECAN)", ageRange: "Ages 0–3", gradeRange: "Pre-Kindergarten", category: "Movement & Verse", description: "Gold standard finger games and seasonal gesture poems. Movement woven with verse nourishes body, language and soul.", publisher: "WECAN" },
  { title: "Around the Year", author: "Elsa Beskow", ageRange: "Ages 1+", gradeRange: "Pre-Kindergarten", category: "Picture Books", description: "Gentle seasonal picture book following a year in nature. Perfect from age 1.", publisher: "Floris Books" },
  { title: "Children of the Forest", author: "Elsa Beskow", ageRange: "Ages 2+", gradeRange: "Pre-Kindergarten", category: "Picture Books", description: "A family of tiny beings lives inside a pine tree root. Seasonal life, warmth, community. Beloved since 1910.", publisher: "Floris Books" },
  { title: "The Story of the Root Children", author: "Sybille von Olfers", ageRange: "Ages 2+", gradeRange: "Pre-Kindergarten", category: "Seasonal Stories", description: "Root children sleep underground in winter and dress in spring colours to venture above ground.", publisher: "Floris Books" },
  // Ages 3-7
  { title: "Tiptoes Lightly Series", author: "Reg Down", ageRange: "Ages 3–7", gradeRange: "Kindergarten–Grade 1", category: "Nature Tales", description: "Humorous, innocent, sanguine nature tales tested in real Waldorf kindergartens for decades. 230+ free stories at tiptoes-lightly.net", publisher: "tiptoes-lightly.net" },
  { title: "Winnie-the-Pooh", author: "A.A. Milne", ageRange: "Ages 4+", gradeRange: "Kindergarten", category: "Classic Stories", description: "The gentle world of the Hundred Acre Wood — each character embodies a temperament.", publisher: "Methuen" },
  { title: "Brambly Hedge Series", author: "Jill Barklem", ageRange: "Ages 4+", gradeRange: "Kindergarten", category: "Seasonal Stories", description: "Four seasonal books: Spring Story, Summer Story, Autumn Story, Winter Story. Exquisitely illustrated mouse community.", publisher: "Collins" },
  // Grades 1-2
  { title: "Grimm's Fairy Tales — Full Collection", author: "Brothers Grimm / Illustrated by Daniela Drescher", ageRange: "Ages 6–9", gradeRange: "Grade 1–2", category: "Fairy Tales", description: "The full fairy tale cycle — the cornerstone of Waldorf Grade 1 curriculum. Letters arise from images in the stories.", publisher: "Floris Books" },
  { title: "Aesop's Fables", author: "Aesop / Various", ageRange: "Ages 7–9", gradeRange: "Grade 2", category: "Fables", description: "Moral wisdom through animals — the Grade 2 curriculum cornerstone. The first real moral dimension enters story.", publisher: "Various" },
  // Grades 3-5
  { title: "Pippi Longstocking", author: "Astrid Lindgren", ageRange: "Ages 6–10", gradeRange: "Grades 1–3", category: "Adventure", description: "The ultimate free child — celebrates childhood freedom and unconventional strength.", publisher: "Viking Press" },
  { title: "The Wind in the Willows", author: "Kenneth Grahame", ageRange: "Ages 5–10", gradeRange: "Grades 1–4", category: "Classic Stories", description: "Mole, Rat, Badger and Toad on the riverbank — community, seasons, home, adventure and belonging.", publisher: "Methuen" },
  { title: "Heidi", author: "Johanna Spyri", ageRange: "Ages 6+", gradeRange: "Grades 1–4", category: "Nature Stories", description: "A girl from the Alps rediscovers her mountain home — nature as healing force.", publisher: "Various" }
];

export default {
  HANDWORK_CURRICULUM,
  ANTHROPOSOPHICAL_SOCIETIES,
  SOCIETY_GLOBAL_STATS,
  NUTRITION_PILLARS,
  CHALKBOARD_RESOURCES,
  CHALKBOARD_SUPPLIES,
  DYE_PLANTS,
  RESALE_PLATFORMS,
  WALDORF_LITERATURE
};
