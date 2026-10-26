import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data');
const PUBLIC = join(__dirname, '..', 'public');

const linklist = JSON.parse(readFileSync(join(OUT, 'directory-extracted-linklist.json'), 'utf-8'));
const cards = JSON.parse(readFileSync(join(OUT, 'directory-extracted-cards.json'), 'utf-8'));

function sectionToSpecialties(section) {
  const map = {
    'adult-education': 'Adult Education',
    'baby-care': 'Baby Care',
    'mustread-books': 'Books',
    'books': 'Books',
    'schools': 'Schools',
    'homeschool': 'Homeschooling',
    'health': 'Health',
    'nutrition': 'Nutrition',
    'handwork': 'Handwork',
    'wool': 'Handwork Supplies',
    'woodwork': 'Woodwork',
    'music': 'Music',
    'dolls': 'Dolls',
    'toys': 'Toys',
    'clothing': 'Clothing',
    'verses': 'Verses',
    'songs': 'Songs',
    'fingergames': 'Finger Games',
    'seasons': 'Festivals',
    'camps': 'Summer Camps',
    'biodynamic': 'Biodynamic Agriculture',
    'temperaments': 'Temperaments',
    'curative': 'Special Needs',
    'lifecycle': 'Development',
    'calendar': 'Calendar of the Soul',
    'planetary': 'Planetary Rhythms',
    'community': 'Community',
    'secondhand': 'Second Hand',
    'naturaldye': 'Natural Dyeing',
    'chalkboard': 'Chalkboard Art',
    'reading': 'Reading',
    'germany': 'Germany',
    'global': 'Global Resources',
  };
  for (const [key, val] of Object.entries(map)) {
    if (section.toLowerCase().includes(key)) return [val];
  }
  return ['Waldorf Resources'];
}

let idx = 1000;
const mentors = [];

for (const entry of linklist.concat(cards.map(c => ({ name: c.name, detail: c.description || c.tag || '', url: '', section: c.section || '' })))) {
  if (!entry.name || entry.name.length < 2) continue;
  const name = entry.name.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  const bio = (entry.detail || '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim().substring(0, 300);
  const specials = sectionToSpecialties(entry.section || '');
  mentors.push({
    id: `dir-${idx++}`, name, email: '', bio, specialties: specials,
    location: 'Global', status: 'Unclaimed', directoryVisibility: true,
    subscriptionActive: false, gradeLevel: 'All Ages',
    photoUrl: 'https://i.pravatar.cc/150?u=' + encodeURIComponent(name.replace(/[^a-zA-Z0-9]/g, '')),
    lessons: (entry.url || '').trim(),
  });
}

writeFileSync(join(PUBLIC, 'directory-mentors.json'), JSON.stringify(mentors));
writeFileSync(join(OUT, 'directoryMentors.ts'), `export interface CompactMentor {
  id: string; name: string; email: string; bio: string;
  specialties: string[]; location: string; status: string;
  directoryVisibility: boolean; subscriptionActive: boolean;
  gradeLevel: string; photoUrl: string; lessons: string;
}

let cache: CompactMentor[] | null = null;

export async function getDirectoryMentors(): Promise<CompactMentor[]> {
  if (cache) return cache;
  try {
    const res = await fetch('/directory-mentors.json');
    if (!res.ok) throw new Error('Failed to load');
    cache = await res.json();
    return cache!;
  } catch {
    return [];
  }
}
`);
console.log(`Converted ${mentors.length} directory entries into Mentor objects`);
