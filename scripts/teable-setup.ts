import 'dotenv/config';

const TEABLE_API_URL = "https://app.teable.io/api";
const TEABLE_API_KEY = process.env.TEABLE_API_KEY;

if (!TEABLE_API_KEY) {
  console.error("❌ TEABLE_API_KEY is missing from .env file.");
  process.exit(1);
}

async function api(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${TEABLE_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${TEABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Teable API Error (${response.status}): ${error}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function setup() {
  console.log("🌿 Initializing Waldorf Mentor Hub on Teable...");

  try {
    // 1. Find or Create Base
    // Teable hierarchy: Space -> Base -> Table
    const spaces: any = await api('/space');
    console.log(`🔍 Searching across ${spaces.length} space(s)...`);

    let targetBase: any = null;
    let targetSpaceId: string = "";

    for (const space of spaces) {
      const bases: any = await api(`/space/${space.id}/base`);
      const base = bases.find((b: any) => b.name === 'Waldorf Mentor Hub');
      if (base) {
        targetBase = base;
        targetSpaceId = space.id;
        break;
      }
    }

    if (targetBase) {
      console.log(`🗑️ Found existing base: ${targetBase.name} (${targetBase.id}). Deleting it to ensure a clean re-seed...`);
      await api(`/base/${targetBase.id}`, 'DELETE');
      console.log(`✅ Base deleted.`);
      targetBase = null;
    }

    if (!targetBase) {
      console.log("❓ Creating 'Waldorf Mentor Hub' base...");
      if (spaces.length === 0) {
        throw new Error("No spaces found in your Teable account. Please create a space first.");
      }
      const firstSpaceId = spaces[0].id;
      targetBase = await api('/base', 'POST', {
        spaceId: firstSpaceId,
        name: 'Waldorf Mentor Hub'
      });
      console.log(`✅ Created Base: ${targetBase.name} (${targetBase.id}) in Space: ${firstSpaceId}`);
    }

    const baseId = targetBase.id;

    // 2. Define Tables
    const tables = [
      {
        name: 'Mentors',
        fields: [
          { name: 'Name', type: 'singleLineText' },
          { name: 'Specialty', type: 'singleLineText' },
          { name: 'Grade_Level', type: 'singleLineText' },
          { name: 'Bio', type: 'longText' },
          { name: 'Photo_URL', type: 'singleLineText' },
          { name: 'Claim_Status', type: 'singleSelect', options: { choices: [{ name: 'Unclaimed' }, { name: 'Pending' }, { name: 'Verified' }] } },
          { name: 'Stripe_ID', type: 'singleLineText' },
          { name: 'Claimant_Email', type: 'singleLineText' },
          { name: 'Profile_Visibility', type: 'checkbox' },
          { name: 'Location', type: 'singleLineText' }
        ]
      },
      {
        name: 'Resources',
        fields: [
          { name: 'Title', type: 'singleLineText' },
          { name: 'Category', type: 'singleLineText' },
          { name: 'Grade', type: 'singleLineText' },
          { name: 'File_Link', type: 'singleLineText' },
          { name: 'Is_Free', type: 'checkbox' },
          { name: 'Mentor_ID', type: 'singleLineText' }
        ]
      },
      {
        name: 'Daily_Rhythms',
        fields: [
          { name: 'Season', type: 'singleLineText' },
          { name: 'Verse_Text', type: 'longText' },
          { name: 'Audio_Link', type: 'singleLineText' },
          { name: 'Target_Age', type: 'singleLineText' }
        ]
      },
      {
        name: 'System_Admin',
        fields: [
          { name: 'Alert_Type', type: 'singleLineText' },
          { name: 'Description', type: 'longText' },
          { name: 'Timestamp', type: 'date' },
          { name: 'Status', type: 'singleSelect', options: { choices: [{ name: 'Open' }, { name: 'Resolved' }] } }
        ]
      },
      {
        name: 'Seekers',
        fields: [
          { name: 'Email', type: 'singleLineText' },
          { name: 'Stripe_ID', type: 'singleLineText' },
          { name: 'Created_At', type: 'singleLineText' }
        ]
      }
    ];

    const tableIds: Record<string, string> = {};

    for (const tableDef of tables) {
      console.log(`⏳ Creating table: ${tableDef.name}...`);
      try {
        const result: any = await api(`/base/${baseId}/table`, 'POST', tableDef);
        tableIds[tableDef.name] = result.id;
        console.log(`✅ Created ${tableDef.name} (ID: ${result.id})`);
      } catch (e: any) {
        if (e.message.includes("already exists")) {
          console.log(`ℹ️ Table ${tableDef.name} already exists. Attempting to fetch its ID...`);
          const existingTables: any = await api(`/base/${baseId}/table`);
          const table = existingTables.find((t: any) => t.name === tableDef.name);
          tableIds[tableDef.name] = table.id;
        } else {
          throw e;
        }
      }
    }

    console.log("\n🌱 Seeding Nina's Curated Leads & Mentors data...");
    // Since we are running in tsx, we can import .ts files directly
    const { MENTORS } = await import('../src/data/mentors.ts');
    
    // Seed mentors in chunks of 10 to prevent rate-limiting and make it highly efficient
    const mentorChunks: any[] = [];
    for (let i = 0; i < MENTORS.length; i += 10) {
      mentorChunks.push(MENTORS.slice(i, i + 10));
    }
    
    for (const chunk of mentorChunks) {
      console.log(`👤 Seeding batch of ${chunk.length} mentors...`);
      const records = chunk.map((mentor: any) => ({
        fields: {
          'Name': mentor.name,
          'Specialty': mentor.specialties.join(', '),
          'Grade_Level': mentor.gradeLevel,
          'Bio': mentor.bio,
          'Photo_URL': mentor.photoUrl,
          'Claim_Status': mentor.status,
          'Stripe_ID': mentor.subscriptionActive ? 'active' : 'inactive',
          'Claimant_Email': mentor.lessons || '',
          'Profile_Visibility': mentor.directoryVisibility,
          'Location': mentor.location
        }
      }));
      await api(`/table/${tableIds['Mentors']}/record`, 'POST', { records });
    }

    console.log("\n🌱 Seeding Resources data (expanded from Nina's Parts 1–4)...");
    const resources = [
      // ── PARENTING & DEVELOPMENT ────────────────────────────────────────────
      { Title: "Phases of Childhood", Category: "Development", Grade: "Ages 0-21", File_Link: "https://www.florisbooks.co.uk", Is_Free: false },
      { Title: "Working with Anxious, Nervous and Depressed Children", Category: "Development", Grade: "Ages 3-14", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "Simplicity Parenting", Category: "Parenting", Grade: "Ages 2-12", File_Link: "https://simplicityparenting.com", Is_Free: false },
      { Title: "Phases: Crisis and Development in the Individual", Category: "Development", Grade: "Adults", File_Link: "https://www.rudolfsteinerpress.com", Is_Free: false },
      { Title: "You Are Your Child's First Teacher", Category: "Parenting", Grade: "Ages 0-6", File_Link: "https://wecan.edu", Is_Free: false },
      { Title: "Beyond the Rainbow Bridge", Category: "Parenting", Grade: "Ages 0-7", File_Link: "https://waldorfpublications.org", Is_Free: false },
      { Title: "Heaven on Earth", Category: "Parenting", Grade: "Ages 0-7", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "Free to Learn", Category: "Parenting", Grade: "Ages 3-6", File_Link: "https://www.florisbooks.co.uk", Is_Free: false },
      { Title: "Understanding Waldorf Education", Category: "Development", Grade: "All Grades", File_Link: "https://www.gryphonhouse.com", Is_Free: false },
      { Title: "School as a Journey", Category: "Development", Grade: "Grades 1-8", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "Seven Times the Sun", Category: "Parenting", Grade: "Ages 0-12", File_Link: "https://www.gileadpress.com", Is_Free: false },
      { Title: "All Year Round", Category: "Rhythms", Grade: "All Ages", File_Link: "https://www.florisbooks.co.uk", Is_Free: false },
      { Title: "Between Form and Freedom", Category: "Development", Grade: "Ages 14-21", File_Link: "https://www.florisbooks.co.uk", Is_Free: false },
      { Title: "The Soul of Discipline", Category: "Parenting", Grade: "Ages 2-18", File_Link: "https://simplicityparenting.com", Is_Free: false },
      { Title: "Healing Stories for Challenging Behaviour", Category: "Parenting", Grade: "Ages 2-10", File_Link: "https://www.florisbooks.co.uk", Is_Free: false },
      { Title: "A Practical Guide to Curative Education", Category: "Development", Grade: "All Grades", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "The Extra Lesson", Category: "Development", Grade: "Grades 1-6", File_Link: "https://hawthornpress.com", Is_Free: false },
      { Title: "The Twelve Senses", Category: "Development", Grade: "All Grades", File_Link: "https://hawthornpress.com", Is_Free: false },
      // ── HANDWORK & ARTS ───────────────────────────────────────────────────
      { Title: "Waldorf Handwork Curriculum Guide — Kindergarten", Category: "Handwork", Grade: "Kindergarten (Ages 4-6)", File_Link: "https://waldorfhandwork.org", Is_Free: false },
      { Title: "Waldorf Handwork Curriculum Guide — Grades 1-2", Category: "Handwork", Grade: "Grades 1-2 (Ages 7-8)", File_Link: "https://waldorfhandwork.org", Is_Free: false },
      { Title: "Waldorf Handwork Curriculum Guide — Grades 3-4", Category: "Handwork", Grade: "Grades 3-4 (Ages 9-10)", File_Link: "https://peacewithnaturehandwork.com", Is_Free: false },
      { Title: "Waldorf Handwork Curriculum Guide — Grades 5-6", Category: "Handwork", Grade: "Grades 5-6 (Ages 11-12)", File_Link: "https://waldorfhandwork.org", Is_Free: false },
      { Title: "Waldorf Handwork Curriculum Guide — Grades 7-8", Category: "Handwork", Grade: "Grades 7-8 (Ages 13-14)", File_Link: "https://handwork2026.org", Is_Free: false },
      { Title: "Watercolor Painting in Class 1", Category: "Painting", Grade: "Grade 1", File_Link: "https://waldorfpublications.org", Is_Free: true },
      { Title: "Introduction to Form Drawing", Category: "Geometry", Grade: "Grade 2", File_Link: "https://waldorfpublications.org", Is_Free: false },
      { Title: "Pentatonic Music for Young Children", Category: "Music", Grade: "Early Childhood", File_Link: "https://choroi.org", Is_Free: false },
      { Title: "Daily Rhythm and Morning Circle Verses", Category: "Rhythms", Grade: "All Grades", File_Link: "https://waldorfpublications.org", Is_Free: true },
      // ── CHALKBOARD ART ────────────────────────────────────────────────────
      { Title: "My Chalkboard — Arne Kaiser (400 Drawings, Grades 1-8)", Category: "Chalkboard Art", Grade: "Grades 1-8", File_Link: "https://blurb.com", Is_Free: false },
      { Title: "Waldorf Chalkboard Drawings Gallery (Free)", Category: "Chalkboard Art", Grade: "All Grades", File_Link: "https://waldorfteacherresources.com", Is_Free: true },
      { Title: "Chalk Board Drawing Video Workshop — Gail Lescher", Category: "Chalkboard Art", Grade: "Teacher Training", File_Link: "https://prairiemoon.org/training-videos", Is_Free: false },
      { Title: "Sunbridge Chalkboard & Main Lesson Book Workshop", Category: "Chalkboard Art", Grade: "Teacher Training", File_Link: "https://sunbridge.edu", Is_Free: false },
      { Title: "Waldorfish — Waldorf Art for Beginners Online Course", Category: "Chalkboard Art", Grade: "All Levels", File_Link: "https://waldorfish.com", Is_Free: false },
      { Title: "TeachingWaldorf Etsy — Main Lesson Book Resources", Category: "Chalkboard Art", Grade: "Grades 1-8", File_Link: "https://etsy.com/shop/TeachingWaldorf", Is_Free: false },
      // ── ANTHROPOSOPHICAL NUTRITION ────────────────────────────────────────
      { Title: "Foodwise: Understanding What We Eat — Wendy Cook", Category: "Nutrition", Grade: "All Ages", File_Link: "https://clairviewbooks.com", Is_Free: false },
      { Title: "The Biodynamic Food & Cookbook — Wendy Cook", Category: "Nutrition", Grade: "All Ages", File_Link: "https://clairviewbooks.com", Is_Free: false },
      { Title: "Nutrition: Food, Health and Spiritual Development — Steiner", Category: "Nutrition", Grade: "Adults", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "The Dynamics of Nutrition — Gerhard Schmidt", Category: "Nutrition", Grade: "Adults", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "Cooking for the Love of the World — Anne-Marie Fryer Wiboltt", Category: "Nutrition", Grade: "All Ages", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "Nourishing Traditions — Sally Fallon (Fermented Foods)", Category: "Nutrition", Grade: "All Ages", File_Link: "https://newtrendspublishing.com", Is_Free: false },
      // ── BIODYNAMIC AGRICULTURE ────────────────────────────────────────────
      { Title: "Agriculture Course (GA 327) — Rudolf Steiner (Free)", Category: "Biodynamics", Grade: "Adults", File_Link: "https://rsarchive.org", Is_Free: true },
      { Title: "Demeter International Farm Directory", Category: "Biodynamics", Grade: "All Ages", File_Link: "https://demeter.net", Is_Free: true },
      { Title: "Biodynamic Association USA — Farm Locator", Category: "Biodynamics", Grade: "All Ages", File_Link: "https://biodynamicassociation.org", Is_Free: true },
      // ── NATURAL DYEING ────────────────────────────────────────────────────
      { Title: "Wild Color — Jenny Dean (Natural Dyeing Handbook)", Category: "Natural Dyeing", Grade: "All Ages", File_Link: "https://amazon.com", Is_Free: false },
      { Title: "The Handbook of Natural Plant Dyes — Sasha Duerr", Category: "Natural Dyeing", Grade: "All Ages", File_Link: "https://amazon.com", Is_Free: false },
      { Title: "Harvesting Color — Rebecca Burgess", Category: "Natural Dyeing", Grade: "All Ages", File_Link: "https://amazon.com", Is_Free: false },
      // ── CORE STEINER TEXTS (FREE ONLINE) ─────────────────────────────────
      { Title: "Theosophy (GA 9) — Rudolf Steiner (Free)", Category: "Books", Grade: "Adults", File_Link: "https://rsarchive.org", Is_Free: true },
      { Title: "How to Know Higher Worlds (GA 10) — Rudolf Steiner (Free)", Category: "Books", Grade: "Adults", File_Link: "https://rsarchive.org", Is_Free: true },
      { Title: "The Education of the Child (GA 34) — Rudolf Steiner (Free)", Category: "Books", Grade: "Adults", File_Link: "https://rsarchive.org", Is_Free: true },
      { Title: "The Philosophy of Freedom (GA 4) — Rudolf Steiner (Free)", Category: "Books", Grade: "Adults", File_Link: "https://rsarchive.org", Is_Free: true },
      { Title: "Study of Man / Foundations of Human Experience (GA 293)", Category: "Books", Grade: "Adults", File_Link: "https://steinerbooks.org", Is_Free: false },
      { Title: "The Calendar of the Soul (GA 40) — Rudolf Steiner (Free)", Category: "Rhythms", Grade: "All Ages", File_Link: "https://rsarchive.org/COTS", Is_Free: true },
      // ── WALDORF CHILDREN'S LITERATURE ────────────────────────────────────
      { Title: "Grimm's Fairy Tales (Floris Illustrated — Daniela Drescher)", Category: "Books", Grade: "Grades 1-2 (Ages 6-9)", File_Link: "https://florisbooks.co.uk", Is_Free: false },
      { Title: "Tiptoes Lightly Series — Reg Down (230+ Free Stories)", Category: "Books", Grade: "Kindergarten (Ages 3-7)", File_Link: "https://tiptoes-lightly.net", Is_Free: true },
      { Title: "Children of the Forest — Elsa Beskow", Category: "Books", Grade: "Pre-Kindergarten (Ages 2+)", File_Link: "https://florisbooks.co.uk", Is_Free: false },
      { Title: "The Story of the Root Children — Sybille von Olfers", Category: "Books", Grade: "Pre-Kindergarten (Ages 2+)", File_Link: "https://florisbooks.co.uk", Is_Free: false },
      { Title: "Pippi Longstocking — Astrid Lindgren", Category: "Books", Grade: "Grades 1-3 (Ages 6-10)", File_Link: "https://florisbooks.co.uk", Is_Free: false }
    ];
    
    // Chunk resources into batches of 10
    const resourceChunks: any[] = [];
    for (let i = 0; i < resources.length; i += 10) {
      resourceChunks.push(resources.slice(i, i + 10));
    }
    
    for (const chunk of resourceChunks) {
      console.log(`📚 Seeding batch of ${chunk.length} resources...`);
      const records = chunk.map((res: any) => ({
        fields: {
          'Title': res.Title,
          'Category': res.Category,
          'Grade': res.Grade,
          'File_Link': res.File_Link,
          'Is_Free': res.Is_Free
        }
      }));
      await api(`/table/${tableIds['Resources']}/record`, 'POST', { records });
    }

    console.log("\n🌱 Seeding Daily Rhythms data...");
    const rhythms = [
      { 
        Season: 'Spring', 
        Verse_Text: "The Springtime Sun\n\nThe morning sun is shining bright,\nIt fills the world with golden light.\nWith head and heart and busy hands,\nWe work and play throughout the lands.",
        Audio_Link: 'https://example.com/spring.mp3',
        Target_Age: 'Early Childhood'
      },
      { 
        Season: 'Summer', 
        Verse_Text: "The Summer Glow\n\nThe summer sun is warm and high,\nIt shines down from the azure sky.\nThe earth is rich, the flowers bloom,\nAnd fill the air with sweet perfume.",
        Audio_Link: 'https://example.com/summer.mp3',
        Target_Age: 'Grade 1-3'
      },
      { 
        Season: 'Autumn', 
        Verse_Text: "The Golden Harvest\n\nThe wind blows strong, the leaves turn gold,\nThe year is growing grey and old.\nWe gather in the harvest sweet,\nFor winter days, a golden treat.",
        Audio_Link: 'https://example.com/autumn.mp3',
        Target_Age: 'Grade 1-8'
      },
      { 
        Season: 'Winter', 
        Verse_Text: "The Winter Rest\n\nThe earth is resting in the snow,\nThe cold winds dance, the frost fires glow.\nDeep in our hearts a light we keep,\nWhile all the seeds are fast asleep.",
        Audio_Link: 'https://example.com/winter.mp3',
        Target_Age: 'All Ages'
      }
    ];
    for (const rhythm of rhythms) {
      console.log(`🌿 Seeding daily rhythm: ${rhythm.Season}...`);
      await api(`/table/${tableIds['Daily_Rhythms']}/record`, 'POST', {
        records: [{ fields: rhythm }]
      });
    }

    console.log("\n🚀 Teable Setup & Seeding Complete!");
    console.log("Wired Table IDs:");
    console.log(JSON.stringify(tableIds, null, 2));

  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setup();
