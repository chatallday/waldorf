export interface TemperamentProfile {
  temperament: string;
  elementSeason: string;
  seatingProfile: string;
  storytellingGenre: string;
  physicalMarkers: string;
  obstacleResponse: string;
  readingReference: string;
}

export interface DevelopmentalCycle {
  phase: string;
  ageSpan: string;
  developmentalTarget: string;
  curricularFocus: string;
  curativeEntity: string;
  masterBook: string;
}

export interface PracticalArtsGrade {
  grade: string;
  handworkProject: string;
  woodworkProject: string;
  materialsRequired: string[];
  essentialTool: string;
  foundationalSource: string;
}

export interface Vendor {
  name: string;
  region: string;
  specialtyMaterial: string;
  waldorfSuitability: string;
  webEndpoint: string;
}

export const TEMPERAMENTS: TemperamentProfile[] = [
  {
    temperament: "Sanguine",
    elementSeason: "Air / Spring-Summer",
    seatingProfile: "Room edges (maximizes social curiosity)",
    storytellingGenre: "Adventure, clever heroes, and social friendship tales",
    physicalMarkers: "Light, skipping steps; brief ground contact; changing facial expressions; bright eyes",
    obstacleResponse: "Dances lightly around the obstacle and immediately forgets it",
    readingReference: "The Four Temperaments (Rudolf Steiner)"
  },
  {
    temperament: "Choleric",
    elementSeason: "Fire / Summer",
    seatingProfile: "Seated together (learn mutual management of intensity)",
    storytellingGenre: "Courage, heroism, direct action, and triumph over great odds",
    physicalMarkers: "Purposeful strides, chest forward, decisive movements, direct eye contact",
    obstacleResponse: "Steps over it decisively or kicks it aside immediately",
    readingReference: "The Temperaments in Education (Roy Wilkinson)"
  },
  {
    temperament: "Melancholic",
    elementSeason: "Earth / Autumn",
    seatingProfile: "Close proximity to teacher's direct eye line",
    storytellingGenre: "Deep human suffering met with internal grace and meaning",
    physicalMarkers: "Tall, lean posture; downward gaze; slow, careful, precise steps",
    obstacleResponse: "Stops, examines it carefully, broods over the unfairness of its presence",
    readingReference: "Rhythms of Learning (Roberto Trostli)"
  },
  {
    temperament: "Phlegmatic",
    elementSeason: "Water / Winter",
    seatingProfile: "Scattered among active temperaments to pull them forward",
    storytellingGenre: "Long, rhythmic, cumulative, repetitive tales with minor variations",
    physicalMarkers: "Slow, deliberate movements; wide, steady gaze; comfortable settled frame",
    obstacleResponse: "Looks at it calmly, walks around it without drama, and moves on",
    readingReference: "Temperament Parenting (Melisa Nielsen)"
  }
];

export const DEVELOPMENTAL_CYCLES: DevelopmentalCycle[] = [
  {
    phase: "Phase 1",
    ageSpan: "Birth to Age 7",
    developmentalTarget: "Building the Physical Body",
    curricularFocus: "Imitation, physical doing, rhythm, movement, and imagination",
    curativeEntity: "Parent-Child programs, Wilma Ellersiek hand gesture games",
    masterBook: "Heaven on Earth (Sharifa Oppenheimer)"
  },
  {
    phase: "Phase 2",
    ageSpan: "Ages 7–14",
    developmentalTarget: "Building the Life Forces",
    curricularFocus: "Feeling, imagination, fables, fables/saints stories, and craft lessons",
    curativeEntity: "Extra Lesson movement therapy, therapeutic eurythmy",
    masterBook: "Tasks and Content of the Curriculum (Rawson)"
  },
  {
    phase: "Phase 3",
    ageSpan: "Ages 14–21",
    developmentalTarget: "Building the Thinking Forces & Ego",
    curricularFocus: "Intellectual logic, abstract thinking, history, sciences, and independent query",
    curativeEntity: "Social Agriculture, High School Teacher Rejuvenation",
    masterBook: "Education Towards Freedom (Frans Carlgren)"
  },
  {
    phase: "Curative Hub",
    ageSpan: "All Ages",
    developmentalTarget: "Soul Balancing (Special Needs Care)",
    curricularFocus: "Deepening of pedagogy through specialized individual accommodation",
    curativeEntity: "Camphill Academy, Social Therapy, Social Agriculture",
    masterBook: "A Practical Guide to Curative Education (Robyn Brown)"
  }
];

export const PRACTICAL_ARTS: PracticalArtsGrade[] = [
  {
    grade: "Kindergarten",
    handworkProject: "Finger knitting, simple sewing, beeswax modeling",
    woodworkProject: "Stick whittling, smoothing found logs, sanding surfaces",
    materialsRequired: ["Natural loose unspun fleece wool", "raw white carded wool batting"],
    essentialTool: "Sandpaper, soft mallets, wooden knitting forks",
    foundationalSource: "A Lifetime of Joy (Bronja Zahlingen)"
  },
  {
    grade: "Grade 1",
    handworkProject: "Flat knitting on two needles, casting on, insect shapes",
    woodworkProject: "Basic carpentry play, birdhouses (if introduced early)",
    materialsRequired: ["Chunky plant-dyed Bioland wool yarn bundles"],
    essentialTool: "5mm–6mm bamboo or wooden needles",
    foundationalSource: "Jane and Jeremy Learn to Knit (Elizabeth Seward)"
  },
  {
    grade: "Grade 2",
    handworkProject: "Increasing/decreasing stitches, the long rectangular flute case",
    woodworkProject: "Custom miniature animal carvings, simple frame mounts",
    materialsRequired: ["Plant-dyed merino wool felt sheets", "assorted loop fibers"],
    essentialTool: "Square wooden children's weaving frames with combs",
    foundationalSource: "A Child's Seasonal Treasury (Betty Jones)"
  },
  {
    grade: "Grade 3",
    handworkProject: "Single crochet, row boundaries, the personal pencil case",
    woodworkProject: "Functional shelters, framing carpentry, farm stakes",
    materialsRequired: ["Raw fleece for carding", "spinning fiber variants"],
    essentialTool: "4mm bamboo hooks, hand carders, spinning spindles",
    foundationalSource: "Making Math Meaningful: Grades 1-5 (Jamie York)"
  },
  {
    grade: "Grade 4",
    handworkProject: "Circular knitting on four needles, tubes, cross-stitch monograms",
    woodworkProject: "Custom streamlined race cars, detailed animal profiles",
    materialsRequired: ["Smooth twisted Aran yarns", "embroidery floss sets"],
    essentialTool: "Wooden embroidery hoops, coping saws, metal rasps",
    foundationalSource: "The Warp and Weft curriculum (Elizabeth Seward)"
  },
  {
    grade: "Grade 5",
    handworkProject: "Toe-up socks with short-row heel turns, wet-felted panels",
    woodworkProject: "Convex forms, darning eggs, letter openers, handle shaping",
    materialsRequired: ["Finer merino roving", "plant-dyed fairy wool", "basswood"],
    essentialTool: "Wood files, coarse rasp wheels, lightweight spindles",
    foundationalSource: "Waldorf Handwork Educators Certification guides"
  },
  {
    grade: "Grade 6",
    handworkProject: "Pattern-cutting, structural sewing, dimensional toy animals",
    woodworkProject: "Concave items, hollowed spoons, deep bowls, serving spatulas",
    materialsRequired: ["Structural fabrics", "multi-color hard twists", "oak", "cherry wood"],
    essentialTool: "Deep gouges, mallets, spokeshaves, hook carving knives",
    foundationalSource: "The Spoon Carving Handbook series texts"
  },
  {
    grade: "Grade 7",
    handworkProject: "Full Waldorf doll assembly (needle-sculpting skin and features)",
    woodworkProject: "Scaled boat models built to float, geometric jointing boxes",
    materialsRequired: ["Cotton stockinette skin fabrics", "mohair hair yarn", "leather strips"],
    essentialTool: "Bench planes, tenon saws, layout squares, blunt needles",
    foundationalSource: "DollyMo hair manuals / Spacial Dynamics guides"
  },
  {
    grade: "Grade 8",
    handworkProject: "Industrial machine parsing, garment construction, flannel pants",
    woodworkProject: "Full-scale furniture, structural stools, chairs, dovetails",
    materialsRequired: ["Heavy-duty utility textiles", "quilting blocks", "ash hardwoods"],
    essentialTool: "Power drills, jigsaws, belt sanders, mechanical stitchers",
    foundationalSource: "Industrial Revolution vertical history main lesson blocks"
  }
];

export const VENDORS: Vendor[] = [
  {
    name: "Weir Crafts",
    region: "USA / International Shipping",
    specialtyMaterial: "Doll Skin Fabrics, DollyMo Mohair, Carded Wool Batting",
    waldorfSuitability: "Doll Construction & Birthday Crown Alignment",
    webEndpoint: "weircrafts.com"
  },
  {
    name: "A Child's Dream",
    region: "USA / International Shipping",
    specialtyMaterial: "100% Wool Felt Sheets, Organic Wool Batting, Plant-Died Silks",
    waldorfSuitability: "Grade 1-5 Knitting, Crochet, and Circle Loom Crafts",
    webEndpoint: "achildsdream.com"
  },
  {
    name: "Filges",
    region: "Germany / European Hub (Bioland Certified)",
    specialtyMaterial: "Fairy Tale Combed Wool, Vegetable-Dyed Merino Roving",
    waldorfSuitability: "Flagship Organic Standard for Global Waldorf Classrooms",
    webEndpoint: "filges.de"
  },
  {
    name: "Stardust Concept Store",
    region: "Netherlands / Worldwide Shipping",
    specialtyMaterial: "Filges Roving, Postcards, Sustainable Wardrobes, Postcards",
    waldorfSuitability: "Curated All-In-One Eco Lifestyle & Seasonal Nature Tables",
    webEndpoint: "stardust.store"
  },
  {
    name: "Lee Valley Tools",
    region: "Canada / USA Distribution",
    specialtyMaterial: "Fine Hand Planes, Carving Chisels, Industrial Gouges",
    waldorfSuitability: "Grade 5-8 Structural Woodworking Shop Provisioning",
    webEndpoint: "leevalley.com"
  }
];
