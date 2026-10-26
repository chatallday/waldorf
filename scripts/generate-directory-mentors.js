#!/usr/bin/env node
const TEABLE_API_KEY = process.env.TEABLE_API_KEY;
const TEABLE_TABLE_ID_MENTORS = 'tbl6KvPXOhrVpXupA93';
const TEABLE_BASE_URL = 'https://app.teable.io/api';

if (!TEABLE_API_KEY) {
  console.error('TEABLE_API_KEY not set');
  process.exit(1);
}

async function fetchAllMentors() {
  const all = [];
  let skip = 0;
  const take = 1000;
  while (true) {
    const url = `${TEABLE_BASE_URL}/table/${TEABLE_TABLE_ID_MENTORS}/record?take=${take}&skip=${skip}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEABLE_API_KEY}`
      }
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Teable API error ${response.status}: ${err}`);
    }
    const data = await response.json();
    const records = data.records || [];
    if (records.length === 0) break;
    all.push(...records);
    if (records.length < take) break;
    skip += records.length;
  }
  return all;
}

function parseTagList(raw) {
  if (!raw) return [];
  if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
  if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean);
  return [];
}

function toCompactMentor(rec) {
  const f = rec.fields || {};
  return {
    id: rec.id,
    name: f.Name || '',
    email: f.Claimant_Email || f.Gated_Contact_Email || '',
    bio: f.Bio || '',
    specialties: parseTagList(f.Specialty),
    location: f.Location || '',
    status: f.Claim_Status || 'Unclaimed',
    directoryVisibility: f.Profile_Visibility ?? true,
    subscriptionActive: ['Enhanced', 'pro'].includes(f.Membership_Tier) || f.Stripe_ID === 'active',
    gradeLevel: f.Grade_Level || '',
    photoUrl: f.Photo_URL || `https://i.pravatar.cc/150?u=${encodeURIComponent(f.Name || 'mentor')}`,
    lessons: f.Lessons || ''
  };
}

async function main() {
  console.log('Fetching all mentors from Teable...');
  const records = await fetchAllMentors();
  console.log(`Fetched ${records.length} records`);
  const named = records.filter(r => r.fields && r.fields.Name && r.fields.Name.trim());
  console.log(`${named.length} records have names`);
  const mentors = named.map(toCompactMentor);
  console.log(`Generated ${mentors.length} compact mentor entries`);
  const fs = await import('fs');
  const path = await import('path');
  const url = await import('url');
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const outputPath = path.join(__dirname, '..', 'public', 'directory-mentors.json');
  fs.writeFileSync(outputPath, JSON.stringify(mentors, null, 2));
  console.log(`Written to ${outputPath}`);
}

main().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});