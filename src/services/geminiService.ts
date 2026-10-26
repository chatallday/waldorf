import { GoogleGenAI, Type } from "@google/genai";

import { GROUNDING_DOCS } from "../data/grounding";
import { Mentor } from "../data/mentors";
import { HANDWORK_CURRICULUM, ANTHROPOSOPHICAL_SOCIETIES, NUTRITION_PILLARS, WALDORF_LITERATURE, CHALKBOARD_RESOURCES, DYE_PLANTS, RESALE_PLATFORMS } from "../data/societyCuration";
import { TEMPERAMENTS, DEVELOPMENTAL_CYCLES } from "../data/temperamentCuration";

function getGoogleApiKey(): string {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null;
  return localKey || process.env.GEMINI_API_KEY || "";
}

function getAiClient() {
  return new GoogleGenAI({ apiKey: getGoogleApiKey() });
}

async function callGeminiProxy(model: string, contents: any, config: any): Promise<string | undefined> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, contents, config }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini proxy error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.text;
}

import { Document } from "./documentService";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface AssistantResponse {
  advice: string;
  recommendedTags: string[];
  recommendedMentorIds: string[];
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NINA'S OFFICIAL LIBRARY KNOWLEDGE BASE — Injected into every AI prompt
// Source: /public/documents/ — 15 hand-crafted operational guides
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NINA_LIBRARY_CONTEXT_MATRIX = `

========================================================================
WALDORF PATH CONCIERGE — NINA'S OFFICIAL SOURCE LIBRARY (SOURCE OF TRUTH)
========================================================================

You are the Waldorf Path Concierge. Your voice, curriculum timelines, and developmental benchmarks are anchored strictly to Nina and Elidy's official operational documentation library. When these sources conflict with generic AI training data, Nina's library ALWAYS takes precedence.

━━ 1. PHILOSOPHY & FAMILY READINESS ━━
• "Is Waldorf for Our Family?" — Covers: conscious domestic rhythm, rhythmic breathing cycles (inhaling structured learning / exhaling unstructured play), deliberate and strict limits on screen media and digital stimulation, the importance of predictable seasonal rhythms, and the distinction between Steiner/Waldorf schooling vs Waldorf-inspired home rhythms.
• "Waldorf Directory (Consolidated)" — Comprehensive landscape of Waldorf schools, networks and organisations worldwide.

━━ 2. CURRICULUM PROGRESSIONS ━━
• "Handwork in Waldorf Education" — Sequential skill ladder: finger-knitting (Kindergarten/Grade 1) → two-needle knitting (Grades 1-2) → purling (Grade 2-3) → crochet (Grade 3-4) → sewing and embroidery (Grade 4+) → garment construction (Grade 5+). Each transition aligns with a cognitive and motor milestone. Never accelerate a child beyond their developmental stage.
• "Form Drawing in Waldorf Education" — Progresses: running forms (flowing curves, Grade 1) → standing/sleeping forms (symmetry, Grade 2) → interlaced Celtic forms (Grade 3) → geometric and dynamic mirrored forms (Grade 4) → transitioning into geometry and drafting (Grade 5). Form Drawing is a prerequisite foundation before formal written geometry.
• "Writing Tools & Cursive in Waldorf" — Physical progression rule: block beeswax crayons → triangular/chunky coloured pencils → thin coloured pencils → wax crayons → pencil → eventually fountain pen (Grade 4-5+). The tool must match the developmental maturity of the hand. Cursive is introduced before print in Waldorf education, not after.
• "Orchestra & Instrumental Music in Waldorf Education" — Pentatonic instruments introduced first (lyre, pentatonic flute, Grades 1-3). Recorder introduced Grade 3-4. Violin and strings from Grade 3. Piano typically Grade 4+. Ensemble and orchestral work from Grade 5-6. Music intervals and theory woven throughout, not taught in isolation.
• "Foreign Language Teaching in Waldorf" — Two foreign languages introduced simultaneously from Grade 1, delivered through song, verse, rhymes, and conversation. Grammar not formally introduced until Grade 3-4. Language is living and oral-first; textbooks come last.

━━ 3. ARTS, CRAFTS & MAKING ━━
• "Puppetry in Waldorf Education" — Simple knotted or cloth table puppets for early childhood (pre-Grade 1). Rod puppets and marionettes from Grade 2. Seasonal themes preferred. Oral delivery is rhythmic and unhurried; no recorded audio or digital playback.
• "Doll Making in Waldorf Education" — Knotted silk doll (simplest, for youngest children) → wool-stuffed hand-stitched dolls → beeswax sculpted figures. Dolls intentionally feature simple, unfinished facial features to allow children's imagination to project emotion, not to pre-determine it.
• "Woodwork in Waldorf Education" — Whittling simple rounded forms (Grade 3-4). Joinery and construction from Grade 5-6. Tools introduced progressively; emphasis on reverence for the material. Spatial thinking, will-forces and perseverance are the pedagogical goals.
• "Festivals in Waldorf Education" — Seasonal festival cycle: Michaelmas (late Sep, courage), Advent/Christmas (Dec, light/darkness), Candlemas (Feb, returning light), Easter (spring, resurrection), St. John's (Midsummer, height of summer). Festivals are not religious decoration; they are pedagogical anchors for the child's year-breathing.

━━ 4. STORYTELLING & ORAL CULTURE ━━
• "The Living Word: Storytelling" — Oral storytelling is the primary medium of early childhood education. Fairy tales (Grimm, not sanitised) for Grade 1. Fables for Grade 2. Old Testament and creation myths for Grade 3. Norse and Greek mythology for Grades 4-5. Stories are told from memory, not read from books, to preserve the living quality of the word. Audiobooks must not replace oral telling.

━━ 5. SPECIAL EDUCATION & NEURODIVERGENCE ━━
• "Special Needs & Neurodivergence in Waldorf" — Core adaptations: establish unwavering daily rhythm above all else (meals, sleep, transitions). Reduce sensory overload with natural materials and muted colour palettes. Avoid screens and digital media entirely for sensory-sensitive children. Modify academic expectations to developmental readiness, not chronological age. Proprioceptive activities (kneading, digging, carrying) used as grounding anchors. Oral stories replace written work when needed. Extra time in handwork and rhythm-based activities builds the child's executive function and self-regulation.

━━ 6. LIFESTYLE, NUTRITION & RHYTHM ━━
• "Nutrition in Waldorf Education" — Grain of the day mapped to planetary weekday rhythm: Sunday (wheat), Monday (rice), Tuesday (barley), Wednesday (millet), Thursday (rye), Friday (oats), Saturday (corn/maize). Warm cooked breakfasts preferred. Seasonal and biodynamic ingredients prioritised. Meals as rhythmic anchors, not fuel stops. Limiting processed sugar is not restrictive but developmentally protective.

━━ 7. MEDIA, SCREENS & AUDIOBOOKS ━━
• "Waldorf Audiobook & Podcast List" — Selective, intentional listening only. Audiobooks permissible if they preserve the child's capacity for inner image-making (i.e., no dramatised audio plays with sound effects, no celebrity narrations that impose the narrator's inner pictures). Waldorf's position: screens and digital media create passively received inner pictures that override the child's own imagination — this is the core developmental concern, not moral judgement.

━━ CONCIERGE BEHAVIOURAL DIRECTIVES ━━
1. When parents ask about screen time, media, or tech boundaries → cite Nina's specific developmental reasoning, not generic child psychology.
2. When asked about handwork grades or skill progressions → use Nina's exact grade-to-skill ladder above.
3. When discussing cursive or writing tools → apply Nina's physical progression rule exactly.
4. When discussing music instruments → use Nina's exact instrument-by-grade framework.
5. Keep tone: empathetic, grounded, precise, warm, and gently authoritative. Match Nina's editorial voice.
6. Financial figures referenced in materials: Sponsorship tiers $15/month (Ticker Slot) and $35/month (Ticker + Highlight). Seeker Pro subscription $13.99/month. Mentor Pro subscription $19.99/month.
========================================================================
`;

const getSystemPrompt = (mentors: Mentor[]) => `
You are the 'Waldorf Concierge' for Nina's Mentor Hub. Your intelligence is strictly grounded in Rudolf Steiner's pedagogical philosophy including the 'Threefold' human structure (Head/Thinking, Heart/Feeling, Hands/Willing) and the 'Scope and Sequence' of Waldorf curriculum.

Core Directives:
1. Developmental Cycles: When a user mentions a child's age, map it to Steiner's 7-year cycles using these exact details:
${JSON.stringify(DEVELOPMENTAL_CYCLES, null, 2)}

2. Steiner's Four Temperaments: If a parent describes their child's temperament, match it to these categories and recommend appropriate tags/activities:
${JSON.stringify(TEMPERAMENTS, null, 2)}

3. Handwork Curriculum & Age-Appropriate Crafts: When parents ask about crafts or grade-specific skills, look up and recommend from the exact Handwork Curriculum milestones:
${JSON.stringify(HANDWORK_CURRICULUM, null, 2)}

4. Global Anthroposophical Societies & Networks: When parents or teachers ask about local organizations, branches, or headquarters, refer to:
${JSON.stringify(ANTHROPOSOPHICAL_SOCIETIES, null, 2)}

5. Anthroposophical Nutrition & Rhythms: Ground recommendations on nutrition, eating, and cooking in:
${JSON.stringify(NUTRITION_PILLARS, null, 2)}

6. Waldorf Literature & Reading Recommendations: Recommend age-appropriate books from:
${JSON.stringify(WALDORF_LITERATURE, null, 2)}

7. Sovereign Search: Translate parent requests into specific directory tags:
   Example: "My 10-year-old child is very sensitive and melancholic; we want painting." -> recommendedTags: ["Grade 4", "Painting", "Art"].

8. Voice: Gentle, rhythmic, and artistic. Use seasonal metaphors. Speak of "nourishing the child's inner life" and the "rhythmic flow" of the day.

9. Exclusion Zone: Avoid recommending digital-heavy tools or external systems. Focus entirely on the human teacher-parent connection.

10. Mentor Recommendation Rules:
   - You MUST recommend actual mentors from the list of Available Mentors below that match their specialties, location, and grade levels.
   - The "Why" Mandate: You are forbidden from simply saying, "Here is [Mentor Name]". You MUST explicitly justify and explain in your "advice" response *why* a specific mentor fits the child's temperament, developmental cycle, location, or needs based on Steiner's pedagogy.
   - Example: "Based on your child's quiet, observant Melancholic nature, I recommend Sariah Moon. Her specialty in artistic painting and rhythmic listening provides the exact grounding a sensitive child needs during this 7-to-14 Heart development cycle."
   - Dynamic Empathy Check: If a parent complains that a child is "acting out" or "daydreaming," translate that into Waldorf terms (e.g. an un-channeled Choleric or Sanguine temperament) and suggest the corresponding balancing activity (Willing/Hands via crafts vs. Feeling/Heart via musical stories) BEFORE/AS you recommend a mentor.
   - Return the recommended mentor IDs in the "recommendedMentorIds" array field in your JSON output. You can recommend multiple mentors if relevant (max 3).

11. Multi-Language Adaptive Translation:
   - Automatically detect the language of the inbound query (e.g., English, German, Spanish, French, etc.).
   - You MUST formulate your "advice" and explanation responses in that identical language. Maintain Waldorf's rhythmic and gentle tone naturally translated.

Available Mentors (Only recommend mentors from this list):
${JSON.stringify(mentors.map(m => ({ id: m.id, name: m.name, specialties: m.specialties, bio: m.bio, location: m.location, gradeLevel: m.gradeLevel })), null, 2)}

${NINA_LIBRARY_CONTEXT_MATRIX}
`;

function getOpenaiApiKey(): string {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('OPENAI_API_KEY') : null;
  return localKey || process.env.OPENAI_API_KEY || "";
}

async function callOpenAiChatCompletion(
  systemInstruction: string,
  messages: { role: string; content: string }[],
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = getOpenaiApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined. Please configure it in the Admin Settings tab.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        ...messages
      ],
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI Chat Completion.");
  }
  return content;
}

async function callOpenAiWaldorfAdvice(userMessage: string, history: ChatMessage[], mentors: Mentor[]): Promise<AssistantResponse> {
  const openAiMessages = [
    ...history.map(m => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.text
    })),
    { role: "user", content: userMessage }
  ];

  const systemInstruction = getSystemPrompt(mentors) + "\n\nCRITICAL: You MUST return a valid JSON object matching this schema:\n{\n  \"advice\": \"string description\",\n  \"recommendedTags\": [\"tag1\", \"tag2\"],\n  \"recommendedMentorIds\": [\"id1\", \"id2\"]\n}";

  const jsonStr = await callOpenAiChatCompletion(systemInstruction, openAiMessages, true);
  return JSON.parse(jsonStr) as AssistantResponse;
}

async function callOpenAiSearchMentors(query: string, mentors: Mentor[]): Promise<string[]> {
  const systemInstruction = `You are an AI search assistant for a Waldorf Mentor directory.
Analyze the user's natural language search query (which may be in English, French, German, or other languages) and return the IDs of the mentors that best match the request.
Match based on specialties, location, grade level, bio, or description.
You MUST return a valid JSON object matching this schema:
{
  "mentorIds": ["id1", "id2", ...]
}`;

  const userPrompt = `Query: "${query}"\n\nMentors List:\n${JSON.stringify(mentors.map(m => ({ id: m.id, name: m.name, specialties: m.specialties, bio: m.bio, location: m.location })), null, 2)}`;

  const jsonStr = await callOpenAiChatCompletion(systemInstruction, [{ role: "user", content: userPrompt }], true);
  const parsed = JSON.parse(jsonStr);
  return parsed.mentorIds || [];
}

export async function getWaldorfAdvice(userMessage: string, history: ChatMessage[], mentors: Mentor[]): Promise<AssistantResponse> {
  const apiKey = getGoogleApiKey();
  
  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    {
      role: "user",
      parts: [{ text: userMessage }]
    }
  ];

  if (apiKey) {
    const models = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.0-flash",
      "gemini-3.1-pro",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    for (const modelName of models) {
      try {
        console.log(`Attempting Waldorf advice with Gemini model: ${modelName}`);
        const response = await getAiClient().models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: getSystemPrompt(mentors),
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                advice: { type: Type.STRING },
                recommendedTags: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                recommendedMentorIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["advice", "recommendedTags", "recommendedMentorIds"]
            }
          }
        });

        const resultText = response.text;
        if (resultText) {
          return JSON.parse(resultText) as AssistantResponse;
        }
      } catch (err) {
        console.warn(`Gemini model ${modelName} failed:`, err);
      }
    }
  }

  // Try server-side Gemini proxy (uses GEMINI_API_KEY from Vercel env, not exposed to client)
  try {
    const models = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.0-flash",
      "gemini-3.1-pro",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    for (const modelName of models) {
      try {
        console.log(`Attempting Waldorf advice via server proxy with model: ${modelName}`);
        const proxyText = await callGeminiProxy(modelName, contents, {
          systemInstruction: getSystemPrompt(mentors),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advice: { type: Type.STRING },
              recommendedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedMentorIds: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["advice", "recommendedTags", "recommendedMentorIds"]
          }
        });
        if (proxyText) {
          return JSON.parse(proxyText) as AssistantResponse;
        }
      } catch (err) {
        console.warn(`Gemini proxy model ${modelName} failed:`, err);
      }
    }
  } catch (e) {
    console.warn('Gemini proxy unavailable:', e);
  }

  // Fallback to OpenAI
  console.warn("All Gemini models failed or API key missing, falling back to OpenAI...");
  try {
    return await callOpenAiWaldorfAdvice(userMessage, history, mentors);
  } catch (openaiError) {
    console.error("OpenAI Fallback also failed:", openaiError);
    return {
      advice: "I apologize, the rhythmic flow of our connection seems interrupted. Could you try sharing your thoughts again?",
      recommendedTags: [],
      recommendedMentorIds: []
    };
  }
}

export async function searchMentorsWithAI(query: string, mentors: Mentor[]): Promise<string[]> {
  const apiKey = getGoogleApiKey();
  const systemInstruction = `You are an AI search assistant for a Waldorf Mentor directory.
Analyze the user's natural language search query (which may be in English, French, German, or other languages) and return the IDs of the mentors that best match the request.
Query examples: "piano teacher near geneva", "professeur de piano près de Genève", "homeschooling guide in USA".
Match based on specialties (e.g. Music, Piano), location (e.g. Geneva, Switzerland, USA), grade level, bio, or description.
Return ONLY a JSON array of the string IDs of matching mentors. Do not include any markdown format, backticks, or other text outside the JSON array.`;
  
  if (apiKey) {
    const models = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.0-flash",
      "gemini-3.1-pro",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    for (const modelName of models) {
      try {
        console.log(`Attempting searchMentorsWithAI with Gemini model: ${modelName}`);
        const response = await getAiClient().models.generateContent({
          model: modelName,
          contents: [
            { role: "user", parts: [{ text: `Query: "${query}"\n\nMentors List:\n${JSON.stringify(mentors.map(m => ({ id: m.id, name: m.name, specialties: m.specialties, bio: m.bio, location: m.location })), null, 2)}` }]}
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });
        const resultText = response.text;
        if (resultText) {
          return JSON.parse(resultText) as string[];
        }
      } catch (e) {
        console.warn(`Gemini search model ${modelName} failed:`, e);
      }
    }
  }

  // Try server-side Gemini proxy
  try {
    const proxyModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.0-flash",
      "gemini-3.1-pro",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    for (const modelName of proxyModels) {
      try {
        console.log(`Attempting searchMentorsWithAI via proxy with model: ${modelName}`);
        const proxyText = await callGeminiProxy(modelName, [
          { role: "user", parts: [{ text: `Query: "${query}"\n\nMentors List:\n${JSON.stringify(mentors.map(m => ({ id: m.id, name: m.name, specialties: m.specialties, bio: m.bio, location: m.location })), null, 2)}` }]}
        ], {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        });
        if (proxyText) {
          return JSON.parse(proxyText) as string[];
        }
      } catch (e) {
        console.warn(`Gemini proxy search model ${modelName} failed:`, e);
      }
    }
  } catch (e) {
    console.warn('Gemini proxy unavailable for search:', e);
  }

  console.warn("All Gemini models failed for search, falling back to OpenAI...");
  try {
    return await callOpenAiSearchMentors(query, mentors);
  } catch (openAiErr) {
    console.error("OpenAI Search Fallback failed:", openAiErr);
    return [];
  }
}

export interface WikiSearchAIResult {
  mentorIds: string[];
  documentIds: string[];
  handworkGrades: string[];
  nutritionPillars: string[];
  literatureTitles: string[];
  societyNames: string[];
  chalkboardArtists: string[];
  dyePlants: string[];
  resalePlatforms: string[];
  temperaments: string[];
}

export async function crossWikiSearchWithAI(
  query: string,
  mentors: Mentor[],
  documents: Document[]
): Promise<WikiSearchAIResult | null> {
  const apiKey = getGoogleApiKey();

  const trimDocs = documents.slice(0, 50).map(d => ({
    id: d.id,
    title: d.title,
    preview: (d.content || '').substring(0, 200),
    tags: d.tags.slice(0, 5),
  }));

  const trimMentors = mentors.filter(m => m.directoryVisibility !== false).slice(0, 80).map(m => ({
    id: m.id,
    name: m.name,
    specialties: m.specialties,
    location: m.location,
    bio: (m.bio || '').substring(0, 100),
  }));

  const handworkGrades = HANDWORK_CURRICULUM.map(hw => ({
    grade: hw.grade,
    ageRange: hw.ageRange,
    skills: hw.coreSkills,
  }));

  const nutritionPillars = NUTRITION_PILLARS.map(np => ({
    pillar: np.pillar,
    indication: np.steinerIndication.substring(0, 100),
  }));

  // Additional curated data for AI search
  const literatureTitles = WALDORF_LITERATURE.map(b => ({ title: b.title, author: b.author, ageRange: b.ageRange, category: b.category }));
  const societyNames = ANTHROPOSOPHICAL_SOCIETIES.map(s => ({ name: s.societyName, country: s.countryRegion }));
  const chalkboardArtists = CHALKBOARD_RESOURCES.map(c => ({ name: c.name, specialty: c.specialty }));
  const dyePlants = DYE_PLANTS.map(d => ({ plant: d.plant, colour: d.colour }));
  const resalePlatforms = RESALE_PLATFORMS.map(r => ({ name: r.name, category: r.primaryCategory }));
  const temperaments = TEMPERAMENTS.map(t => ({ name: t.temperament, season: t.elementSeason, stories: t.storytellingGenre }));

  const userMessage = JSON.stringify({
    query,
    mentors: trimMentors,
    documents: trimDocs,
    handworkGrades,
    nutritionPillars,
    literatureTitles,
    societyNames,
    chalkboardArtists,
    dyePlants,
    resalePlatforms,
    temperaments,
  });

  const systemInstruction = `You are a semantic search engine for The Waldorf Path, a Waldorf education directory.
The user will ask a natural language question. Your job is to find relevant items from the provided data across ALL categories.

Analyze the query semantically - understand the intent, not just keywords. For example:
- "what crafts should a 7 year old do" -> find handwork grades for age 7 (Grade 1), mentors with handwork specialties, documents about handwork
- "we need a piano teacher near london" -> find mentors with music/piano specialty in London area
- "tell me about festivals in waldorf" -> find documents about festivals, nutrition rhythms about festivals
- "my child is very sensitive, what activities help" -> find mentoring about neurodivergence/sensitive children, nutrition calm rhythms, handwork grounding activities
- "what books should a 6 year old read" -> find literatureTitles for age 6, documents about reading
- "anthroposophical society in brazil" -> find societyNames matching Brazil
- "natural dye for wool" -> find dyePlants matching the colour or plant
- "where to buy waldorf supplies" -> find resalePlatforms for supplies
- "sanguine child activities" -> find temperaments matching sanguine

Return a JSON object matching this schema exactly:
{
  "mentorIds": ["id1", "id2"],
  "documentIds": ["doc-id-1", "doc-id-2"],
  "handworkGrades": ["Grade 1", "Kindergarten"],
  "nutritionPillars": ["Weekly Grain Rhythm"],
  "literatureTitles": ["title1", "title2"],
  "societyNames": ["General Anthroposophical Society"],
  "chalkboardArtists": ["Arne Kaiser"],
  "dyePlants": ["Yellow Onion Skins"],
  "resalePlatforms": ["Waldorfshop.eu"],
  "temperaments": ["Sanguine"],
}

Rules:
- Mentor matches: return their actual ids from the provided data
- Document matches: return their actual ids from the provided data
- Handwork grades: return the actual grade names (e.g. "Grade 3", "Kindergarten")
- Nutrition pillars: return the actual pillar names
- Only return items that are semantically relevant to the query
- Be generous with matches - it's better to return slightly more than miss something
- Limit to max 5 per category
- For handworkGrades and nutritionPillars, use the EXACT names from the data provided`;

  if (apiKey) {
    const models = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.0-flash",
      "gemini-3.1-pro",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];

    for (const modelName of models) {
      try {
        console.log(`Attempting crossWikiSearchWithAI with Gemini model: ${modelName}`);
        const response = await getAiClient().models.generateContent({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mentorIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                documentIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                handworkGrades: { type: Type.ARRAY, items: { type: Type.STRING } },
                nutritionPillars: { type: Type.ARRAY, items: { type: Type.STRING } },
                literatureTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
                societyNames: { type: Type.ARRAY, items: { type: Type.STRING } },
                chalkboardArtists: { type: Type.ARRAY, items: { type: Type.STRING } },
                dyePlants: { type: Type.ARRAY, items: { type: Type.STRING } },
                resalePlatforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                temperaments: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["mentorIds", "documentIds", "handworkGrades", "nutritionPillars", "literatureTitles", "societyNames", "chalkboardArtists", "dyePlants", "resalePlatforms", "temperaments"]
            }
          }
        });
        const resultText = response.text;
        if (resultText) {
          return JSON.parse(resultText) as WikiSearchAIResult;
        }
      } catch (e) {
        console.warn(`Gemini crossWikiSearch model ${modelName} failed:`, e);
      }
    }
  }

  // Try server-side Gemini proxy
  try {
    const proxyModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.0-flash",
      "gemini-3.1-pro",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
      "gemini-1.5-pro"
    ];
    for (const modelName of proxyModels) {
      try {
        console.log(`Attempting crossWikiSearch via proxy with model: ${modelName}`);
        const proxyText = await callGeminiProxy(modelName, [{ role: "user", parts: [{ text: userMessage }] }], {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mentorIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              documentIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              handworkGrades: { type: Type.ARRAY, items: { type: Type.STRING } },
              nutritionPillars: { type: Type.ARRAY, items: { type: Type.STRING } },
              literatureTitles: { type: Type.ARRAY, items: { type: Type.STRING } },
              societyNames: { type: Type.ARRAY, items: { type: Type.STRING } },
              chalkboardArtists: { type: Type.ARRAY, items: { type: Type.STRING } },
              dyePlants: { type: Type.ARRAY, items: { type: Type.STRING } },
              resalePlatforms: { type: Type.ARRAY, items: { type: Type.STRING } },
              temperaments: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["mentorIds", "documentIds", "handworkGrades", "nutritionPillars", "literatureTitles", "societyNames", "chalkboardArtists", "dyePlants", "resalePlatforms", "temperaments"]
          }
        });
        if (proxyText) {
          return JSON.parse(proxyText) as WikiSearchAIResult;
        }
      } catch (e) {
        console.warn(`Gemini proxy crossWiki model ${modelName} failed:`, e);
      }
    }
  } catch (e) {
    console.warn('Gemini proxy unavailable for crossWiki:', e);
  }

  // OpenAI fallback
  try {
    const openAiApiKey = getOpenaiApiKey();
    if (openAiApiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userMessage }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content) as WikiSearchAIResult;
      }
    }
  } catch (e) {
    console.error("OpenAI crossWikiSearch fallback failed:", e);
  }

  return null;
}



