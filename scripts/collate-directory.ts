import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const teableApiKey = process.env.TEABLE_API_KEY;
const teableTableId = 'tblY9GYHd8PwZAnZJTn'; // Mentors Table ID (from workflowService)
const firecrawlKey = process.env.FIRECRAWL_API_KEY || 'YOUR_FIRECRAWL_API_KEY';
const aiStudioKey = process.env.GEMINI_API_KEY;

if (!teableApiKey) {
  console.error("❌ TEABLE_API_KEY is missing from .env file.");
  process.exit(1);
}

if (!aiStudioKey) {
  console.error("❌ GEMINI_API_KEY is missing from .env file.");
  process.exit(1);
}

const aiEngine = new GoogleGenAI({ apiKey: aiStudioKey });

interface PractitionerProfile {
  name: string;
  location: string;
  specialties: string[];
  cycle: string;
  email: string;
  bio: string;
}

// 1. Scrape Unstructured Content
async function extractRawNodeData(targetUrl: string): Promise<string> {
  console.log(`🌐 Fetching markdown for ${targetUrl} via Firecrawl...`);
  const payload = { url: targetUrl, formats: ['markdown'] };
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Firecrawl Error (${response.status}): ${errText}`);
  }

  const data: any = await response.json();
  return data.data?.markdown || '';
}

// 2. Normalize Context via Gemini 1.5 Pro
async function parseToWaldorfSchema(rawText: string): Promise<PractitionerProfile[]> {
  const structuralPrompt = `
    Analyze the following unstructured educational directory profile listings text.
    Extract and structure every practitioner profile into a clean JSON array matching this exact model:
    [
      {
        "name": "Full Name",
        "location": "City, Country",
        "specialties": ["Handwork", "Form Drawing", "Painting", "Music"],
        "cycle": "Willing / Hands (Ages 0-7)" OR "Feeling / Heart (Ages 7-14)" OR "Thinking / Head (Ages 14-21)",
        "email": "Valid public contact address",
        "bio": "Brief professional summary inferred from context"
      }
    ]
    Text to extract from:
    ${rawText}
  `;

  const response = await aiEngine.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: structuralPrompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response text from Gemini");
  }

  return JSON.parse(text) as PractitionerProfile[];
}

// 3. Inject Directly to Live Teable Workspace
async function seedToTeable(profiles: PractitionerProfile[]) {
  const endpoint = `https://app.teable.io/api/table/${teableTableId}/record`;
  
  for (const item of profiles) {
    const recordPayload = {
      records: [{
        fields: {
          "Name": item.name,
          "Location": item.location,
          "Specialty": item.specialties.join(', '),
          "Grade_Level": item.cycle,
          "Claimant_Email": item.email,
          "Bio": item.bio,
          "Claim_Status": "Unclaimed",
          "Profile_Visibility": true,
          "Stripe_ID": "inactive"
        }
      }]
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recordPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`❌ Failed to index practitioner ${item.name}: ${errText}`);
    } else {
      console.log(`✅ Successfully indexed practitioner: ${item.name}`);
    }
  }
}

// Orchestrator Execution Trigger
export async function runSourcingSequence(urlTarget: string) {
  try {
    console.log('Initiating Firecrawl collection worker...');
    const rawContent = await extractRawNodeData(urlTarget);
    
    console.log('Processing unstructured profile structures via Gemini...');
    const structuredLogs = await parseToWaldorfSchema(rawContent);
    
    console.log(`Pushing ${structuredLogs.length} verified records directly to Teable...`);
    await seedToTeable(structuredLogs);
    
    console.log('Batch sync completed successfully.');
  } catch (error) {
    console.error('Sourcing execution faulted:', error);
  }
}

// If executed directly
if (process.argv[1] && (process.argv[1].endsWith('collate-directory.ts') || process.argv[1].endsWith('collate-directory.js'))) {
  const target = process.argv[2] || 'https://example.com/waldorf-directory';
  runSourcingSequence(target);
}
