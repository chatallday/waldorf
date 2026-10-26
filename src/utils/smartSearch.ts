/**
 * Smart search helpers for The Waldorf Path.
 * - Expands colloquial queries into specialty synonyms (e.g. "guitar" -> music-related specialties).
 * - Normalises grade / level / year phrasing ("year 5", "5th level", "grade 5", "class 5") to the same
 *   grade bands used in the directory.
 */

export interface SearchableMentor {
  name: string;
  bio?: string;
  location?: string;
  specialties?: string[];
  gradeLevel?: string;
  topicTags?: string[];
  title?: string;
  awards?: string;
}

/* Expand a free-text term into related keywords before substring matching. */
const SYNONYM_GROUPS: Record<string, string[]> = {
  music: ['musical', 'instrument', 'instruments', 'instrumental', 'guitar', 'piano', 'flute', 'recorder', 'pentatonic', 'lyre', 'song', 'songs', 'singing', 'sing', 'choir', 'vocal', 'voice', 'rhythm', 'movement', 'musik', 'instrument', 'instrumente', 'gitarre', 'klavier', 'flöte', 'blockflöte', 'pentatonisch', 'leier', 'lied', 'lieder', 'singen', 'chor', 'stimme', 'rhythmus', 'bewegung'],
  handwork: ['craft', 'crafts', 'knitting', 'knit', 'crochet', 'sewing', 'sew', 'weaving', 'weave', 'felting', 'fiber', 'fibre', 'woodwork', 'woodworking', 'whittle', 'carving', 'carve', 'doll', 'dolls', 'puppet', 'puppetry', 'handarbeit', 'handwerk', 'stricken', 'häkeln', 'nähen', 'weben', 'filzen', 'holzarbeit', 'schnitzen', 'puppe', 'puppen', 'marionette'],
  woodwork: ['woodwork', 'woodworking', 'whittling', 'carving', 'carve', 'wood', 'tools', 'tool', 'chisel', 'gouge', 'knife', 'saw', 'plane', 'rasp', 'sandpaper', 'workbench', 'vise', 'clamps', 'mallet', 'hammer', 'holzarbeit', 'schnitzen', 'holz', 'werkzeug', 'meißel', 'beitel', 'messer', 'säge', 'hobel', 'feile', 'schleifpapier', 'werkbank', 'schraubstock', 'zwingen', 'hammer'],
  eurythmy: ['eurhythmy', 'movement', 'dance', 'heileurythmie', 'bewegungstherapie'],
  storytelling: ['story', 'stories', 'tale', 'tales', 'telling', 'myth', 'mythos', 'verse', 'poetry', 'poem', 'poems', 'geschichte', 'geschichten', 'märchen', 'sage', 'vers', 'gedicht', 'gedichte'],
  literacy: ['reading', 'read', 'write', 'writing', 'spelling', 'words', 'lesen', 'schreiben', 'rechtschreibung', 'wort'],
  math: ['mathematics', 'maths', 'arithmetic', 'geometry', 'numeracy', 'mathematik', 'rechnen', 'geometrie', 'zahlen'],
  art: ['painting', 'paint', 'watercolor', 'watercolour', 'drawing', 'draw', 'chalk', 'chalkboard', 'illustration', 'malen', 'malerei', 'aquarell', 'zeichnen', 'kreide', 'tafelbild'],
  science: ['botany', 'geology', 'physics', 'chemistry', 'biology', 'botanik', 'geologie', 'physik', 'chemie', 'biologie'],
  therapeutic: ['therapy', 'therapeutic', 'healing', 'remedial', 'curative', 'counselling', 'counseling', 'coaching', 'support', 'therapie', 'heilung', 'heilpädagogik', 'beratung', 'förderung'],
  parenting: ['parent', 'parents', 'homeschool', 'home education', 'family', 'eltern', 'homeschooling', 'hausunterricht', 'familie'],
  agriculture: ['farm', 'farming', 'biodynamic', 'gardening', 'garden', 'bauernhof', 'landwirtschaft', 'biodynamisch', 'garten', 'gartenbau'],
  language: ['german', 'spanish', 'language', 'languages', 'linguistic', 'deutsch', 'spanisch', 'sprache', 'sprachen'],
  school: ['teacher', 'teachers', 'school', 'schools', 'faculty', 'schooling', 'lehrer', 'lehrerin', 'schule', 'schulen', 'kollegium', 'unterricht'],
};

const WORDS_TO_GRADE: Record<string, string[]> = {
  '1': ['Willing / Hands (Ages 0-7)', 'Early Childhood', 'Kindergarten', 'Preschool'],
  '2': ['Willing / Hands (Ages 0-7)', 'Grades 1-2'],
  '3': ['Feeling / Heart (Ages 7-14)', 'Grades 1-3'],
  '4': ['Feeling / Heart (Ages 7-14)', 'Grades 4-8'],
  '5': ['Feeling / Heart (Ages 7-14)', 'Grades 1-5', 'Mood of the Fifth'],
  '6': ['Feeling / Heart (Ages 7-14)', 'Grades 4-8'],
  '7': ['Feeling / Heart (Ages 7-14)', 'Grades 4-8'],
  '8': ['Feeling / Heart (Ages 7-14)', 'Grades 4-8', 'Grades 1-8'],
  '9': ['Thinking / Head (Ages 14-21)', 'Upper Grades', 'High School'],
  '10': ['Thinking / Head (Ages 14-21)', 'Upper Grades', 'High School'],
  '11': ['Thinking / Head (Ages 14-21)', 'Upper Grades', 'High School'],
  '12': ['Thinking / Head (Ages 14-21)', 'Upper Grades', 'High School'],
  'k': ['Willing / Hands (Ages 0-7)', 'Early Childhood', 'Kindergarten', 'Preschool'],
};

/** Normalize grade phrasing to "grade N" format. */
export function normalizeGrade(text: string): string {
  return text
    .replace(/\b(\d+)(st|nd|rd|th)\s+(grade|level|class)\b/gi, 'grade $1')
    .replace(/\b(grade|level|class)\s+(\d+)(st|nd|rd|th)?\b/gi, 'grade $2')
    .replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1')
    .replace(/\b(\d+)\s*(?:st|nd|rd|th)?\s*(?:grade|level|class)\b/gi, 'grade $1')
    .replace(/\b(?:year)\s+(\d+)\b/gi, 'grade $1')
    .replace(/\b([1-9]|1[0-2])\.\s*(?:klasse|stufe)\b/gi, 'grade $1')
    .replace(/\b(?:klasse|stufe)\s+([1-9]|1[0-2])\b/gi, 'grade $1');
}

/** Extract a grade band list the query is referring to (e.g. 5 -> grades 5 band matches). */
export function extractGradeBands(query: string): string[] {
  const hits: string[] = [];
  const q = query.toLowerCase();

  // "year 5", "5th level", "5th grade", "grade 5", "class 5", "level 5", "standard 5"
  // German: "klasse 5", "5. klasse", "stufe 5", "5. stufe", "jahrgang 5"
  const patterns = [
    /\b(?:year|grade|class|level|standard|stufe|klasse|jahrgang)\s+([1-9]|1[0-2])\b/g,
    /\b([1-9]|1[0-2])[\s-]?(?:th|st|nd|rd)?\s*(?:grade|level|class|year|standard|klasse|stufe)\b/g,
    /\b([1-9]|1[0-2])\s*th\s*grade\b/g,
    /\b(?:g)\s*([1-9]|1[0-2])\b/g,
    /\b([1-9]|1[0-2])\.\s*(?:klasse|stufe)\b/g,
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(q)) !== null) {
      const num = m[1]?.toLowerCase();
      if (num && WORDS_TO_GRADE[num]) hits.push(...WORDS_TO_GRADE[num]);
      p.lastIndex = m.index + m[0].length;
    }
  }

  // Word-form names: "fifth grade", "twelve year olds"
  // German: "fünfte klasse", "sechste stufe", etc.
  const wordNumbers: Record<string, string> = {
    'first': '1', 'second': '2', 'third': '3', 'fourth': '4', 'fifth': '5',
    'sixth': '6', 'seventh': '7', 'eighth': '8', 'ninth': '9', 'tenth': '10',
    'eleventh': '11', 'twelfth': '12',
    'erste': '1', 'zweite': '2', 'dritte': '3', 'vierte': '4', 'fünfte': '5',
    'sechste': '6', 'siebte': '7', 'achte': '8', 'neunte': '9', 'zehnte': '10',
    'elfte': '11', 'zwölfte': '12',
  };
  for (const [word, num] of Object.entries(wordNumbers)) {
    if (q.includes(`${word} grade`) || q.includes(`${word} level`) || q.includes(`${word} year`) || q.includes(`${word} class`) || q.includes(`${word} klasse`) || q.includes(`${word} stufe`)) {
      if (WORDS_TO_GRADE[num]) hits.push(...WORDS_TO_GRADE[num]);
    }
  }

  // Explicit stage phrases
  if (q.includes('kindergarten') || q.includes('early childhood') || q.includes('preschool') || q.includes('0-7') || q.includes('0 to 7') || q.includes('kleinkind') || q.includes('vorschule') || q.includes('kindergartenalter')) hits.push('Willing / Hands (Ages 0-7)');
  if (q.includes('middle school') || q.includes('7-14') || q.includes('7 to 14') || q.includes('feeling') || q.includes('mittelstufe') || q.includes('grundschule') || q.includes('gefühl')) hits.push('Feeling / Heart (Ages 7-14)');
  if (q.includes('high school') || q.includes('upper grade') || q.includes('14-21') || q.includes('14 to 21') || q.includes('thinking') || q.includes('oberstufe') || q.includes('gymnasium') || q.includes('denken')) hits.push('Thinking / Head (Ages 14-21)');

  return hits.length ? [...new Set(hits)] : [];
}

/** Detect whether the query is asking about a specific grade band at all. */
export function hasGradeIntent(query: string): boolean {
  return extractGradeBands(query).length > 0;
}

/** Expand free-text into a list of lowercase tokens to try matching. */
export function expandQuery(query: string): string[] {
  const q = query.toLowerCase().trim();
  const terms: string[] = [q];
  
  // Handle composite queries: grade + subject (e.g., "6th grade woodwork", "grade 6 tools")
  const gradeBands = extractGradeBands(q);
  const subjectMatches: string[] = [];
  
  // Find subject-related terms in the query
  for (const [root, syns] of Object.entries(SYNONYM_GROUPS)) {
    for (const syn of syns) {
      if (q.includes(syn)) {
        subjectMatches.push(root);
        subjectMatches.push(syn);
      }
    }
  }
  
  // If we have both grade intent and subject terms, create combined terms
  if (gradeBands.length > 0 && subjectMatches.length > 0) {
    for (const grade of gradeBands) {
      for (const subject of subjectMatches) {
        terms.push(`${grade} ${subject}`);
        terms.push(`${subject} ${grade}`);
      }
    }
  }
  
  for (const [root, syns] of Object.entries(SYNONYM_GROUPS)) {
    for (const syn of syns) {
      if (q.includes(syn)) {
        terms.push(root);
        terms.push(root + ' ' + syn);
      }
    }
  }
  return [...new Set(terms)].filter(t => t.length > 0);
}

/** Score a mentor against a query. Higher = better match. 0 = no match. */
export function scoreMentorForQuery(mentor: SearchableMentor, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const name = (mentor.name || '').toLowerCase();
  const bio = (mentor.bio || '').toLowerCase();
  const location = (mentor.location || '').toLowerCase();
  const gradeLevel = (mentor.gradeLevel || '').toLowerCase();
  const title = (mentor.title || '').toLowerCase();
  const tags = (mentor.topicTags || []).join(' ').toLowerCase();
  const specialties = (mentor.specialties || []).join(' ').toLowerCase();
  const haystack = `${name} ${title} ${bio} ${location} ${specialties} ${tags}`;

  // Exact name match ranks highest.
  if (name.includes(q)) return 100;
  if (name.split(/\s+/).some(w => w === q)) return 90;

  // Grade-band matching (e.g. "year 5" ~= "Feeling / Heart (Ages 7-14)")
  const gradeBands = extractGradeBands(q);
  if (gradeBands.length > 0) {
    const gradeMatched = gradeBands.some(b => gradeLevel.includes(b.toLowerCase()) ||
      specialties.includes(b.toLowerCase()));
    // If the user explicitly asked for a grade and the mentor has that band, boost.
    if (gradeMatched) return Math.max(70, ...gradeBands.map(b => gradeLevel.includes(b.toLowerCase()) ? 85 : 60));
    // If the mentor covers all ages / all cycles, accept but rank lower.
    if (gradeLevel.includes('all ages') || gradeLevel.includes('all cycle') || gradeLevel.includes('k-12')) return 55;
  }

  const terms = expandQuery(query);
  
  // Check for composite query matches (grade + subject)
  const hasGradeIntent = gradeBands.length > 0;
  const subjectTerms = terms.filter(t => 
    SYNONYM_GROUPS[Object.keys(SYNONYM_GROUPS).find(k => SYNONYM_GROUPS[k].some(s => t.includes(s))) || ''] || 
    t.includes('grade') || t.includes('class') || t.includes('year')
  );
  
  // If there's grade intent and the mentor doesn't cover it, don't surface them for grade-only queries.
  if (hasGradeIntent && gradeBands.length > 0 && !gradeBands.some(b => gradeLevel.includes(b.toLowerCase()))) {
    if (name.includes(q) || bio.includes(q)) return 45; // allow name/bio mentions but low
    return 0;
  }

  // Check for composite match (grade + subject both present)
  let bestScore = 0;
  for (const t of terms) {
    if (haystack.includes(t)) {
      bestScore = Math.max(bestScore, 75);
      // Boost for composite matches
      if (t.includes('grade') || t.includes('class') || t.includes('year')) {
        const subjectPart = t.replace(/grade\s+\d+|class\s+\d+|year\s+\d+|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|fifth|fourth|third|second|first/gi, '').trim();
        if (subjectPart && haystack.includes(subjectPart)) {
          bestScore = Math.max(bestScore, 85);
        }
      }
    }
  }

  // Partial word root matching fallback (e.g. "guitar" inner match within "Musical Instruments")
  const words = q.split(/\s+/).filter(w => w.length >= 3);
  if (words.length > 0) {
    const all = words.every(w => haystack.includes(w));
    if (all) bestScore = Math.max(bestScore, 60);
    const some = words.some(w => haystack.includes(w));
    if (some) bestScore = Math.max(bestScore, 30);
  }
  return bestScore;
}

/** Friendly boolean wrapper used by filters. */
export function mentorMatchesQuery(mentor: SearchableMentor, query: string): boolean {
  return scoreMentorForQuery(mentor, query) > 0;
}