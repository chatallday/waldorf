// src/data/index.ts

export interface WaldorfGuideManifest {
  id: string;
  title: string;
  slug: string;
  category: 'Overview' | 'Arts & Crafts' | 'Music & Theater' | 'Living & Rhythms' | 'Development';
  tags: string[];
  description: string;
  filePath: string;
  tierLock: 'free' | 'seeker-pro';
  version: string;
}

export const waldorfGuidesList: WaldorfGuideManifest[] = [
  {
    id: "guide-is-waldorf-for-us",
    title: "Is Waldorf for Our Family? — An Honest Guide for New Parents",
    slug: "is-waldorf-for-our-family",
    category: "Overview",
    tags: ["Media Guidelines", "Parent Commitment", "Financials", "New Parents"],
    description: "An objective and reassuring breakdown of core lifestyle shifts, low-screen choices, volunteering hours, and multi-country financial benchmarks required for the Waldorf lifestyle.",
    filePath: "/documents/is-waldorf-for-our-family_2.html",
    tierLock: "free",
    version: "2.0"
  },
  {
    id: "guide-special-needs-neurodivergence",
    title: "Special Needs & Neurodivergence in Waldorf Education",
    slug: "special-needs-neurodivergence",
    category: "Development",
    tags: ["Curative Education", "Camphill", "Sensory Integration", "Dyslexia", "Dyspraxia"],
    description: "Deep exploration of Rudolf Steiner's 1924 Curative Education parameters and Dr. Karl König's lifesharing frameworks, tracking support structures and global provision setups.",
    filePath: "/documents/special-needs-neurodivergence-in-waldorf_3.html",
    tierLock: "seeker-pro",
    version: "3.0"
  },
  {
    id: "guide-form-drawing",
    title: "Form Drawing in Waldorf Education — A Through-the-Grades Guide",
    slug: "form-drawing-guide",
    category: "Arts & Crafts",
    tags: ["Form Drawing", "Class 1-5 Progressions", "Therapeutic", "Extra Lesson"],
    description: "Canonical analysis of lines, curves, running symmetries, and woven Celtic knots across early grades, outlining sensory-motor integration and recommended stationery materials.",
    filePath: "/documents/form-drawing-in-waldorf-education_1.html",
    tierLock: "seeker-pro",
    version: "1.0"
  },
  {
    id: "guide-orchestra-instrumental-music",
    title: "Orchestra & Instrumental Music — A Through-the-Grades Guide",
    slug: "orchestra-instrumental-music",
    category: "Music & Theater",
    tags: ["Pentatonic Flute", "Recorders", "Strings", "Class Orchestra", "AWME"],
    description: "Tracking the step-by-step introduction of instrumentation across grades—moving from the dreamy 'mood of the fifth' to complex orchestral part-harmonies.",
    filePath: "/documents/orchestra-instrumental-music-in-waldorf-education_3.html",
    tierLock: "seeker-pro",
    version: "3.0"
  },
  {
    id: "guide-handwork-curriculum",
    title: "Handwork in Waldorf Education — Stitching the Soul",
    slug: "handwork-curriculum-guide",
    category: "Arts & Crafts",
    tags: ["Knitting", "Crochet", "Bilateral Brain Coordination", "Will Education"],
    description: "Examines how the rhythmic loops of yarn build motor skills, mathematical logic, and emotional grounding alongside curriculum-linked live storytelling blocks.",
    filePath: "/documents/handwork-in-waldorf-education_10.html",
    tierLock: "seeker-pro",
    version: "10.0"
  },
  {
    id: "guide-festivals-rhythms",
    title: "Festivals in Waldorf Education — Architecture of the Year",
    slug: "festivals-and-seasonal-living",
    category: "Living & Rhythms",
    tags: ["Michaelmas", "Martinmas", "Lanterns", "Advent Spiral", "Seasonal Table"],
    description: "A deep manual highlighting the celebration patterns, seasonal table frameworks, and iconic cyclical milestones that give children a deep sense of earthly security.",
    filePath: "/documents/festivals-in-waldorf-education_5.html",
    tierLock: "free",
    version: "5.0"
  },
  {
    id: "guide-nutrition-cooking",
    title: "Nourishing the Waldorf Family — Whole Food & Grain Rhythms",
    slug: "nourishing-waldorf-nutrition",
    category: "Living & Rhythms",
    tags: ["Grain Rhythms", "Threefold Plant Zone", "Baking Rituals", "Wendy Cook"],
    description: "A comprehensive kitchen guide detailing the planetary daily grain cycles, threefold anatomical plant mapping, and historical organic reference literature listings.",
    filePath: "/documents/nutrition-in-waldorf-education.html",
    tierLock: "seeker-pro",
    version: "1.0"
  },
  {
    id: "guide-puppetry-storytelling",
    title: "Puppetry & Marionettes — Enlivening the Invisible World",
    slug: "puppetry-in-waldorf",
    category: "Music & Theater",
    tags: ["Table Puppets", "Marionettes", "Story Medicine", "Imaginative Play"],
    description: "Highlights the developmental parameters of simple doll faces, storytelling gestures, and table sets designed to nourish child speech and moral imagination.",
    filePath: "/documents/puppetry-in-waldorf-education_2.html",
    tierLock: "seeker-pro",
    version: "2.0"
  },
  {
    id: "guide-doll-making",
    title: "Doll Making in Waldorf Education — A Through-the-Ages Guide",
    slug: "doll-making-guide",
    category: "Arts & Crafts",
    tags: ["Doll Construction", "Natural Fibers", "Anatomical Development", "Craft Fairs"],
    description: "A manual mapping out tricot and wool doll patterns that grow with the child's evolving sense of physical boundaries and human posture.",
    filePath: "/documents/doll-making-in-waldorf-education_2.html",
    tierLock: "seeker-pro",
    version: "2.0"
  },
  {
    id: "guide-audiobooks-podcasts",
    title: "Waldorf Audiobooks & Story Podcasts — The Listening Hours",
    slug: "audiobooks-and-podcasts-list",
    category: "Overview",
    tags: ["Screenless Audio", "Yoto", "Tonies", "Sparkle Stories", "We Nurture"],
    description: "A curated overview tracking premium screen-free hardware options, low-media home alternatives, and high-quality storytelling audio sources for families.",
    filePath: "/documents/waldorf-audiobook-and-podcast-list_1.html",
    tierLock: "free",
    version: "1.0"
  },
  {
    id: "guide-the-living-word",
    title: "The Living Word — Storytelling in Waldorf Contexts",
    slug: "the-living-word-storytelling",
    category: "Overview",
    tags: ["Oral Tradition", "Metaphysics", "Anthroposophy", "Primary Sources"],
    description: "A foundational text on the structural differences between print reading and memorized oral performance, tracing child temperament interactions.",
    filePath: "/documents/the-living-word-storytelling.html",
    tierLock: "free",
    version: "1.0"
  },
  {
    id: "guide-foreign-languages",
    title: "Foreign Language Teaching in Waldorf Education",
    slug: "foreign-languages-immersion",
    category: "Development",
    tags: ["Language Immersion", "Oral Receptive Zone", "Body Memory", "Bilingualism"],
    description: "Examines the pedagogical timing of childhood foreign language exposure using continuous immersion, choral verse singing, and physical action games.",
    filePath: "/documents/foreign-language-teaching-in-waldorf_1.html",
    tierLock: "seeker-pro",
    version: "1.0"
  },
  {
    id: "guide-writing-cursive-tools",
    title: "From Crayon to Fountain Pen — Writing Tools & Cursive",
    slug: "writing-tools-and-cursive",
    category: "Arts & Crafts",
    tags: ["Block Crayons", "Greenfield Pen", "Cursive Mastery", "Material Costs"],
    description: "Detailed roadmap of the physical evolution of hand movements—tracking progressions from Stockmar wax blocks to precise cursive lines using fountain pens.",
    filePath: "/documents/writing-tools-and-cursive-in-waldorf_3.html",
    tierLock: "seeker-pro",
    version: "3.0"
  }
];

export const getGuideBySlug = (slug: string): WaldorfGuideManifest | undefined => {
  return waldorfGuidesList.find(guide => guide.slug === slug);
};

export const getGuidesByCategory = (category: WaldorfGuideManifest['category']): WaldorfGuideManifest[] => {
  return waldorfGuidesList.filter(guide => guide.category === category);
};