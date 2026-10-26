/**
 * Guides Manifest — The Waldorf Path Reading Room
 * Maps all HTML library files in /public/documents/ to their metadata.
 * tierLock: 'free' = visible to all | 'seeker-pro' = requires active subscription
 */

export interface GuideItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  filePath: string;
  tierLock: 'free' | 'seeker-pro';
}

export const GUIDE_CATEGORIES = [
  'All',
  'Philosophy',
  'Curriculum',
  'Handwork',
  'Music',
  'Arts & Crafts',
  'Storytelling',
  'Neurodivergence',
  'Lifestyle',
  'Language',
] as const;

export const guidesManifest: GuideItem[] = [
  // ── FREE TIER ──────────────────────────────────────────────────────────────
  {
    id: 'waldorf-family-fit',
    title: 'Is Waldorf for Our Family?',
    slug: 'is-waldorf-for-our-family',
    category: 'Philosophy',
    description:
      'A deep dive into aligning household values with Waldorf rhythms, developmental timelines, and conscious media boundaries. The essential first read for every family exploring this path.',
    filePath: '/documents/is-waldorf-for-our-family_1.html',
    tierLock: 'free',
  },
  {
    id: 'doll-making',
    title: 'Doll Making in Waldorf Education',
    slug: 'doll-making-in-waldorf',
    category: 'Handwork',
    description:
      'Creating handmade dolls with simple, natural materials. Covers knotted, wool-stuffed, and beeswax dolls suitable for each developmental stage.',
    filePath: '/documents/doll-making-in-waldorf-education_1.html',
    tierLock: 'free',
  },
  {
    id: 'blacksmithing',
    title: 'Blacksmithing in Waldorf Education',
    slug: 'blacksmithing-in-waldorf',
    category: 'Hands',
    description: 'Fire, force, and the will that bends iron in the upper school.',
    filePath: '/documents/blacksmithing-in-waldorf-education.html',
    tierLock: 'free',
  },
  {
    id: 'choir-singing',
    title: 'Choir & Singing Through the Grades',
    slug: 'choir-singing-through-grades',
    category: 'Music',
    description: 'From the mood of the fifth in kindergarten to four-part high school harmony.',
    filePath: '/documents/choir-singing-in-waldorf-education.html',
    tierLock: 'free',
  },
  {
    id: 'senior-project',
    title: 'The Class 12 Senior Project',
    slug: 'class-12-senior-project',
    category: 'Curriculum',
    description: 'The year-long independent study, mentorship, and public presentation.',
    filePath: '/documents/class-12-senior-project.html',
    tierLock: 'free',
  },
  {
    id: 'eurythmy',
    title: 'Eurythmy in Waldorf Education',
    slug: 'eurythmy-in-waldorf',
    category: 'Music',
    description: 'The visible speech and music movement art through the grades and therapy.',
    filePath: '/documents/eurythmy-in-waldorf-education_1.html',
    tierLock: 'free',
  },
  {
    id: 'festivals',
    title: 'Festivals in Waldorf Education',
    slug: 'festivals-in-waldorf',
    category: 'Lifestyle',
    description:
      'How seasonal and celestial festivals anchor the breath of the school year. Covers Michaelmas, Advent, Candlemas, Easter, Midsummer, and the pedagogical reasoning behind each.',
    filePath: '/documents/festivals-in-waldorf-education.html',
    tierLock: 'free',
  },
  {
    id: 'foreign-languages',
    title: 'Foreign Language Teaching',
    slug: 'foreign-language-teaching',
    category: 'Language',
    description: 'Two foreign languages from Class 1, direct method, and multilingual profiles.',
    filePath: '/documents/foreign-language-teaching-in-waldorf_1.html',
    tierLock: 'free',
  },
  {
    id: 'handwork',
    title: 'Handwork in Waldorf Education',
    slug: 'handwork-in-waldorf',
    category: 'Handwork',
    description: 'The will made visible — knitting, crochet, sewing, and complete grade buying guides.',
    filePath: '/documents/Handwork in Waldorf Education.html',
    tierLock: 'free',
  },
  {
    id: 'nutrition',
    title: 'Nourishing the Waldorf Family',
    slug: 'nourishing-the-waldorf-family',
    category: 'Lifestyle',
    description: 'Whole grains, the Seven Grains of the Week, fresh flour milling, and biodynamic food.',
    filePath: '/documents/nutrition-in-waldorf-education.html',
    tierLock: 'free',
  },
  {
    id: 'orchestra-music',
    title: 'Orchestra & Instrumental Music',
    slug: 'orchestra-and-instrumental-music',
    category: 'Music',
    description: 'From pentatonic flutes to the Class 8 class orchestra.',
    filePath: '/documents/orchestra-instrumental-music-in-waldorf-education_3.html',
    tierLock: 'free',
  },
  {
    id: 'special-needs',
    title: 'Special Needs & Neurodivergence',
    slug: 'special-needs-and-neurodivergence',
    category: 'Neurodivergence',
    description: 'An honest guide to curative education, Camphill communities, and learning support.',
    filePath: '/documents/special-needs-neurodivergence-in-waldorf.html',
    tierLock: 'free',
  },
  {
    id: 'veil-painting',
    title: 'Veil Painting in Waldorf Education',
    slug: 'veil-painting-in-waldorf',
    category: 'Arts & Crafts',
    description: 'Building transparent layers of colour, Collot d’Herbois tradition, and lazure.',
    filePath: '/documents/veil-painting-in-waldorf-education.html',
    tierLock: 'free',
  },
  {
    id: 'writing-tools',
    title: 'From Crayon to Fountain Pen',
    slug: 'from-crayon-to-fountain-pen',
    category: 'Curriculum',
    description: 'Beeswax blocks, pencils, fountain pens, and cursive timing in Waldorf schools.',
    filePath: '/documents/writing-tools-and-cursive-in-waldorf_1.html',
    tierLock: 'free',
  },
  {
    id: 'baar-fonts',
    title: 'The Baar Fonts',
    slug: 'the-baar-fonts',
    category: 'Philosophy',
    description: 'Field guide to the 7 Anthroposophic and Waldorf typefaces by Lutz Baar.',
    filePath: '/documents/waldorf-fonts-lutz-baar_5.html',
    tierLock: 'free',
  },
  {
    id: 'puppetry',
    title: 'Puppetry in Waldorf Education',
    slug: 'puppetry-in-waldorf',
    category: 'Arts & Crafts',
    description:
      'Crafting simple table puppets and delivering rhythmic oral stories that captivate early childhood imagination. Includes materials, seasonal themes, and staging guidance.',
    filePath: '/documents/puppetry-in-waldorf-education_2.html',
    tierLock: 'free',
  },
  {
    id: 'living-word-storytelling',
    title: 'The Living Word: Storytelling',
    slug: 'living-word-storytelling',
    category: 'Storytelling',
    description:
      'The art of oral storytelling as the living heart of Waldorf early childhood. Includes story types by age, seasonal tales, and how to sustain inner picture-making in children.',
    filePath: '/documents/the-living-word-storytelling.html',
    tierLock: 'free',
  },
  {
    id: 'four-temperaments',
    title: 'The Four Temperaments in Waldorf Education',
    slug: 'four-temperaments-in-waldorf',
    category: 'Curriculum',
    description: 'Understanding the four temperaments — choleric, sanguine, phlegmatic, melancholic — in Waldorf pedagogy and child development.',
    filePath: '/documents/The Four Temperaments in Waldorf Education.html',
    tierLock: 'free',
  },
  {
    id: 'waldorf-reading-guide',
    title: 'Waldorf Reading Guide Full',
    slug: 'waldorf-reading-guide-full',
    category: 'Curriculum',
    description: 'Complete reading guide for Waldorf education across all grades and subjects, with book recommendations by age and developmental stage.',
    filePath: '/documents/Waldorf Reading Guide Full.html',
    tierLock: 'free',
  },
  {
    id: 'waldorf-music-instruments',
    title: 'Waldorf Music Instruments',
    slug: 'waldorf-music-instruments',
    category: 'Music',
    description: 'Guide to musical instruments used in Waldorf education — pentatonic flute, lyre, harp, and more. Includes grade-by-grade instrument introduction.',
    filePath: '/documents/waldorf-music-instruments.html',
    tierLock: 'free',
  },
  {
    id: 'toys-art-supplies',
    title: 'Toys, Art Supplies & Creative Play',
    slug: 'toys-art-supplies-creative-play',
    category: 'Handwork',
    description: 'Comprehensive guide to Waldorf toys, art supplies, and creative play materials. Natural materials, age-appropriate selection, and where to source.',
    filePath: '/documents/Toys_Art_Supplies_and_Creative_Play.html',
    tierLock: 'free',
  },
  {
    id: 'waldorf-nutrition-food',
    title: 'Waldorf Nutrition & Food',
    slug: 'waldorf-nutrition-food',
    category: 'Nutrition',
    description: 'Nutrition principles, grain of the day, and food philosophy in Waldorf education. Includes meal planning and biodynamic food sources.',
    filePath: '/documents/waldorf-nutrition-food.html',
    tierLock: 'free',
  },

  // ── SEEKER PRO TIER ────────────────────────────────────────────────────────
  {
    id: 'form-drawing',
    title: 'Form Drawing in Waldorf Education',
    slug: 'form-drawing',
    category: 'Curriculum',
    description:
      'Understanding the spatial, geometric, and developmental importance of line and curve progression. Includes grade-by-grade form sequences from simple running forms to mirrored symmetries.',
    filePath: '/documents/form-drawing-in-waldorf-education_1.html',
    tierLock: 'seeker-pro',
  },
  {
    id: 'woodwork',
    title: 'Woodwork in Waldorf Education',
    slug: 'woodwork-in-waldorf',
    category: 'Arts & Crafts',
    description:
      'From whittling simple forms to joinery — how working with wood develops spatial thinking, will-forces, and reverence for natural materials. Covers tool introduction by grade and project progressions.',
    filePath: '/documents/woodwork-in-waldorf-education_1.html',
    tierLock: 'seeker-pro',
  },
];