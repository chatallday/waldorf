import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, BookOpen, User as UserIcon, Sprout, Folder, Library, Sparkles, ArrowRight, Leaf, FolderOpen, Loader2, Scissors } from 'lucide-react';
import { documentService, Document } from '../services/documentService';
import { MENTORS, Mentor } from '../data/mentors';
import { HANDWORK_CURRICULUM, NUTRITION_PILLARS, ANTHROPOSOPHICAL_SOCIETIES, WALDORF_LITERATURE, CHALKBOARD_RESOURCES, CHALKBOARD_SUPPLIES, DYE_PLANTS, RESALE_PLATFORMS } from '../data/societyCuration';
import { DAILY_DATA, SPLASH_VERSES, COTS_VERSES } from '../data/dailyData';
import { TEMPERAMENTS, DEVELOPMENTAL_CYCLES, PRACTICAL_ARTS, VENDORS } from '../data/temperamentCuration';
import { GROUNDING_DOCS } from '../data/grounding';
import { crossWikiSearchWithAI } from '../services/geminiService';
import { scoreMentorForQuery } from '../utils/smartSearch';

export type SearchResultType = 'mentor' | 'document' | 'living_handwork' | 'living_nutrition' | 'resource' | 'anthro_society' | 'waldorf_literature' | 'chalkboard' | 'dye_plant' | 'resale_platform' | 'daily_verse' | 'temperament' | 'developmental_cycle' | 'practical_arts' | 'vendor' | 'grounding_doc';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  snippet: string;
  tag?: string;
  navigateTo: 'directory' | 'documents' | 'home';
  navigateData?: any;
  fromAI?: boolean;
}

interface GlobalSearchBarProps {
  onNavigate: (view: 'home' | 'directory' | 'profile' | 'resources' | 'documents', data?: any) => void;
}

export function GlobalSearchBar({ onNavigate }: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Indexed caches
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [resources, setResources] = useState<{id: string; title: string; category: string; grade: string; topicTags?: string[]; searchAliases?: string[]}[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const docs = await documentService.getAllDocuments();
        setDocuments(docs);
        setMentors(MENTORS);
        // Load Teable resources
        try {
          const { getResources } = await import('../services/workflowService');
          const teableResources = await getResources();
          setResources(teableResources.map(r => ({ id: r.id, title: r.title, category: r.category, grade: r.grade, topicTags: r.topicTags, searchAliases: r.searchAliases })));
        } catch {}
        setInitialized(true);
      } catch {
        setMentors(MENTORS);
        setInitialized(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleFocusSearch = () => { inputRef.current?.focus(); };
    window.addEventListener('focus-search', handleFocusSearch);
    return () => window.removeEventListener('focus-search', handleFocusSearch);
  }, []);

  const mergeAIResults = useCallback((currentResults: SearchResult[], aiResult: { mentorIds: string[]; documentIds: string[]; handworkGrades: string[]; nutritionPillars: string[]; literatureTitles?: string[]; societyNames?: string[]; chalkboardArtists?: string[]; dyePlants?: string[]; resalePlatforms?: string[]; temperaments?: string[] }): SearchResult[] => {
    const merged = [...currentResults];
    const seen = new Set<string>(merged.map(r => `${r.type}:${r.id}`));

    // Add AI mentor matches not already in results
    for (const id of aiResult.mentorIds) {
      const key = `mentor:${id}`;
      if (seen.has(key)) continue;
      const m = mentors.find(mt => mt.id === id);
      if (m && m.directoryVisibility !== false) {
        merged.push({
          type: 'mentor',
          id: m.id,
          title: m.name,
          subtitle: `${m.specialties.slice(0, 2).join(', ')} · ${m.location || 'Global'}`,
          snippet: (m.bio || '').substring(0, 140),
          navigateTo: 'directory',
          navigateData: m.id,
          fromAI: true,
        });
        seen.add(key);
      }
    }

    // Add AI document results
    for (const id of aiResult.documentIds) {
      const key = `document:${id}`;
      if (seen.has(key)) continue;
      const doc = documents.find(d => d.id === id);
      if (doc) {
        merged.push({
          type: 'document',
          id: doc.id,
          title: doc.title,
          subtitle: doc.tags.slice(0, 3).map(t => `#${t}`).join(' '),
          snippet: (doc.content || '').substring(0, 150),
          navigateTo: 'documents',
          navigateData: doc.id,
          fromAI: true,
        });
        seen.add(key);
      }
    }

    // Add AI handwork grade results
    for (const grade of aiResult.handworkGrades) {
      const key = `living_handwork:hw-${grade}`;
      if (seen.has(key)) continue;
      const hw = HANDWORK_CURRICULUM.find(h => h.grade === grade);
      if (hw) {
        merged.push({
          type: 'living_handwork',
          id: `hw-${grade}`,
          title: `${hw.grade} · ${hw.ageRange}`,
          subtitle: hw.coreSkills.slice(0, 3).join(', '),
          snippet: hw.typicalFirstProject,
          navigateTo: 'directory',
          navigateData: 'curriculum',
          fromAI: true,
        });
        seen.add(key);
      }
    }

    // Add nutrition pillar AI results
    for (const pillar of aiResult.nutritionPillars) {
      const key = `living_nutrition:nut-${pillar}`;
      if (seen.has(key)) continue;
      const np = NUTRITION_PILLARS.find(n => n.pillar === pillar);
      if (np) {
        merged.push({
          type: 'living_nutrition',
          id: `nut-${pillar}`,
          title: np.pillar,
          subtitle: 'Anthroposophical Nutrition',
          snippet: np.steinerIndication.substring(0, 120),
          navigateTo: 'directory',
          navigateData: 'rhythms',
          fromAI: true,
        });
        seen.add(key);
      }
    }

    // Add AI literature results
    if (aiResult.literatureTitles) {
      for (const title of aiResult.literatureTitles) {
        const key = `waldorf_literature:ai-lit-${title.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
        if (seen.has(key)) continue;
        const book = WALDORF_LITERATURE.find(b => b.title.toLowerCase().includes(title.toLowerCase()));
        if (book) {
          merged.push({ type: 'waldorf_literature', id: `ai-lit-${title.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`, title: book.title, subtitle: `${book.author} · ${book.ageRange}`, snippet: book.description.substring(0, 120), navigateTo: 'directory', navigateData: 'curriculum', fromAI: true });
          seen.add(key);
        }
      }
    }

    // Add AI society results
    if (aiResult.societyNames) {
      for (const name of aiResult.societyNames) {
        const key = `anthro_society:ai-soc-${name.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
        if (seen.has(key)) continue;
        const soc = ANTHROPOSOPHICAL_SOCIETIES.find(s => s.societyName.toLowerCase().includes(name.toLowerCase()));
        if (soc) {
          merged.push({ type: 'anthro_society', id: `ai-soc-${name.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`, title: soc.societyName, subtitle: `${soc.countryRegion} · ${soc.headquarters}`, snippet: soc.focusAreas.slice(0, 2).join(', '), navigateTo: 'directory', navigateData: 'curriculum', fromAI: true });
          seen.add(key);
        }
      }
    }

    // Add AI chalkboard artist results
    if (aiResult.chalkboardArtists) {
      for (const artistName of aiResult.chalkboardArtists) {
        const key = `chalkboard:ai-cb-${artistName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
        if (seen.has(key)) continue;
        const cb = CHALKBOARD_RESOURCES.find(c => c.name.toLowerCase().includes(artistName.toLowerCase()));
        if (cb) {
          merged.push({ type: 'chalkboard', id: `ai-cb-${artistName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`, title: cb.name, subtitle: `${cb.platform} · ${cb.gradeScope}`, snippet: cb.specialty.substring(0, 120), navigateTo: 'directory', navigateData: 'curriculum', fromAI: true });
          seen.add(key);
        }
      }
    }

    // Add AI dye plant results
    if (aiResult.dyePlants) {
      for (const plantName of aiResult.dyePlants) {
        const key = `dye_plant:ai-dye-${plantName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
        if (seen.has(key)) continue;
        const dye = DYE_PLANTS.find(d => d.plant.toLowerCase().includes(plantName.toLowerCase()));
        if (dye) {
          merged.push({ type: 'dye_plant', id: `ai-dye-${plantName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`, title: dye.plant, subtitle: `${dye.colour} ${dye.emoji}`, snippet: dye.waldorfUse.substring(0, 120), navigateTo: 'directory', navigateData: 'rhythms', fromAI: true });
          seen.add(key);
        }
      }
    }

    // Add AI resale platform results
    if (aiResult.resalePlatforms) {
      for (const platformName of aiResult.resalePlatforms) {
        const key = `resale_platform:ai-rp-${platformName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`;
        if (seen.has(key)) continue;
        const rp = RESALE_PLATFORMS.find(r => r.name.toLowerCase().includes(platformName.toLowerCase()));
        if (rp) {
          merged.push({ type: 'resale_platform', id: `ai-rp-${platformName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`, title: rp.name, subtitle: `${rp.geographicHub} · ${rp.primaryCategory}`, snippet: rp.waldorfValueAlignment.substring(0, 120), navigateTo: 'directory', navigateData: 'rhythms', fromAI: true });
          seen.add(key);
        }
      }
    }

    // Add AI temperament results
    if (aiResult.temperaments) {
      for (const tmpName of aiResult.temperaments) {
        const key = `temperament:ai-tmp-${tmpName.toLowerCase()}`;
        if (seen.has(key)) continue;
        const tmp = TEMPERAMENTS.find(t => t.temperament.toLowerCase().includes(tmpName.toLowerCase()));
        if (tmp) {
          merged.push({ type: 'temperament', id: `ai-tmp-${tmpName.toLowerCase()}`, title: `${tmp.temperament} Temperament`, subtitle: tmp.elementSeason, snippet: `${tmp.storytellingGenre} · ${tmp.readingReference}`, navigateTo: 'directory', navigateData: 'curriculum', fromAI: true });
          seen.add(key);
        }
      }
    }

    return merged;
  }, [mentors, documents, resources]);

  const runKeywordSearch = useCallback((searchQuery: string): SearchResult[] => {
    const q = searchQuery.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return [];
    const allResults: SearchResult[] = [];

    const searchHaystack = (haystack: string): number => {
      let score = 0;
      words.forEach(w => { if (haystack.includes(w)) score += 1; });
      return score;
    };

    // Calculate how many words matched in the title for relevance
    const titleMatchScore = (title: string): number => {
      const t = title.toLowerCase();
      let matched = 0;
      words.forEach(w => { if (t.includes(w)) matched += 5; });
      return matched;
    };

    // 1. Search Mentors (Directory)
    for (const m of mentors) {
      if (m.directoryVisibility === false) continue;
      const nameLower = m.name.toLowerCase();
      const bioLower = (m.bio || '').toLowerCase();
      const locLower = (m.location || '').toLowerCase();
      const specsLower = m.specialties.join(' ').toLowerCase();
      const smartScore = scoreMentorForQuery(m, q);
      const score = smartScore > 0
        ? smartScore + titleMatchScore(m.name) + searchHaystack(`${bioLower} ${locLower} ${specsLower}`) * 2
        : 0;
      if (score > 0) {
        allResults.push({
          type: 'mentor', id: m.id, title: m.name,
          subtitle: `${m.specialties.slice(0, 2).join(', ')} · ${m.location || 'Global'}`,
          snippet: (m.bio || '').substring(0, 140), navigateTo: 'directory', navigateData: m.id,
        });
      }
    }

    // 2. Search Documents
    for (const doc of documents) {
      const titleLower = doc.title.toLowerCase();
      let score = titleMatchScore(doc.title);
      const contentLower = (doc.content || '').toLowerCase();
      words.forEach(w => { if (contentLower.includes(w)) score += 1; });
      doc.tags.forEach(tag => { words.forEach(w => { if (tag.toLowerCase().includes(w)) score += 3; }); });
      doc.sections.forEach(s => { words.forEach(w => { if (s.title.toLowerCase().includes(w)) score += 4; }); });
      if (score >= 1) {
        allResults.push({
          type: 'document', id: doc.id, title: doc.title,
          subtitle: doc.tags.slice(0, 3).map(t => `#${t}`).join(' '),
          snippet: (doc.content || '').substring(0, 150), navigateTo: 'documents', navigateData: doc.id,
        });
      }
    }

    // 3-17. Search all other sources with minimum score threshold
    const searchSource = (items: any[], getHaystack: (item: any) => string, buildResult: (item: any) => SearchResult) => {
      for (const item of items) {
        const score = searchHaystack(getHaystack(item));
        if (score >= words.length) { // require all words to match
          allResults.push(buildResult(item));
        }
      }
    };

    searchSource(HANDWORK_CURRICULUM,
      hw => `${hw.grade} ${hw.ageRange} ${hw.coreSkills.join(' ')} ${hw.typicalFirstProject}`.toLowerCase(),
      hw => ({ type: 'living_handwork' as const, id: `hw-${hw.grade}`, title: `${hw.grade} · ${hw.ageRange}`, subtitle: hw.coreSkills.slice(0, 3).join(', '), snippet: hw.typicalFirstProject, navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(NUTRITION_PILLARS,
      np => `${np.pillar} ${np.steinerIndication} ${np.practicalApplication} ${np.schoolroomIntegration}`.toLowerCase(),
      np => ({ type: 'living_nutrition' as const, id: `nut-${np.pillar}`, title: np.pillar, subtitle: 'Anthroposophical Nutrition', snippet: np.steinerIndication.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'rhythms' }));

    searchSource(ANTHROPOSOPHICAL_SOCIETIES,
      soc => `${soc.countryRegion} ${soc.societyName} ${soc.headquarters} ${soc.focusAreas.join(' ')}`.toLowerCase(),
      soc => ({ type: 'anthro_society' as const, id: `soc-${soc.societyName.replace(/\s+/g, '-').toLowerCase()}`, title: soc.societyName, subtitle: `${soc.countryRegion} · ${soc.headquarters}`, snippet: soc.focusAreas.slice(0, 3).join(', '), navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(WALDORF_LITERATURE,
      book => `${book.title} ${book.author} ${book.description} ${book.category}`.toLowerCase(),
      book => ({ type: 'waldorf_literature' as const, id: `book-${book.title.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}`, title: book.title, subtitle: `${book.author} · ${book.ageRange} · ${book.category}`, snippet: book.description.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(CHALKBOARD_RESOURCES,
      cb => `${cb.name} ${cb.specialty} ${cb.platform} ${cb.gradeScope}`.toLowerCase(),
      cb => ({ type: 'chalkboard' as const, id: `cb-${cb.name.replace(/\s+/g, '-').toLowerCase()}`, title: cb.name, subtitle: `${cb.platform} · ${cb.gradeScope}`, snippet: cb.specialty.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(CHALKBOARD_SUPPLIES,
      sup => `${sup.item} ${sup.recommended} ${sup.whereToBuy}`.toLowerCase(),
      sup => ({ type: 'chalkboard' as const, id: `cbs-${sup.item.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}`, title: sup.item, subtitle: 'Chalkboard Supply', snippet: sup.whereToBuy, navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(DYE_PLANTS,
      dye => `${dye.colour} ${dye.plant} ${dye.description} ${dye.waldorfUse}`.toLowerCase(),
      dye => ({ type: 'dye_plant' as const, id: `dye-${dye.plant.replace(/\s+/g, '-').toLowerCase()}`, title: dye.plant, subtitle: `${dye.colour} · ${dye.emoji}`, snippet: dye.waldorfUse.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'rhythms' }));

    searchSource(RESALE_PLATFORMS,
      rp => `${rp.name} ${rp.geographicHub} ${rp.primaryCategory} ${rp.searchTags.join(' ')} ${rp.waldorfValueAlignment}`.toLowerCase(),
      rp => ({ type: 'resale_platform' as const, id: `rp-${rp.name.replace(/\s+/g, '-').toLowerCase()}`, title: rp.name, subtitle: `${rp.geographicHub} · ${rp.primaryCategory}`, snippet: rp.waldorfValueAlignment.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'rhythms' }));

    searchSource(SPLASH_VERSES,
      v => `${v.title} ${v.moment} ${v.text}`.toLowerCase(),
      v => ({ type: 'daily_verse' as const, id: `verse-${v.title.replace(/\s+/g, '-').toLowerCase()}`, title: v.title, subtitle: v.moment, snippet: v.text.substring(0, 120), navigateTo: 'home' as const, navigateData: undefined }));

    searchSource(TEMPERAMENTS,
      tmp => `${tmp.temperament} ${tmp.elementSeason} ${tmp.storytellingGenre} ${tmp.physicalMarkers}`.toLowerCase(),
      tmp => ({ type: 'temperament' as const, id: `tmp-${tmp.temperament.toLowerCase()}`, title: `${tmp.temperament} Temperament`, subtitle: tmp.elementSeason, snippet: `${tmp.storytellingGenre} · ${tmp.readingReference}`, navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(DEVELOPMENTAL_CYCLES,
      dc => `${dc.phase} ${dc.ageSpan} ${dc.developmentalTarget} ${dc.curricularFocus}`.toLowerCase(),
      dc => ({ type: 'developmental_cycle' as const, id: `dc-${dc.phase.replace(/\s+/g, '-').toLowerCase()}`, title: `${dc.phase} (${dc.ageSpan})`, subtitle: dc.developmentalTarget, snippet: dc.curricularFocus.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(PRACTICAL_ARTS,
      pa => `${pa.grade} ${pa.handworkProject} ${pa.woodworkProject} ${pa.materialsRequired.join(' ')}`.toLowerCase(),
      pa => ({ type: 'practical_arts' as const, id: `pa-${pa.grade.replace(/\s+/g, '-').toLowerCase()}`, title: `${pa.grade} · Practical Arts`, subtitle: pa.handworkProject.substring(0, 60), snippet: pa.essentialTool, navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(VENDORS,
      v => `${v.name} ${v.region} ${v.specialtyMaterial} ${v.waldorfSuitability}`.toLowerCase(),
      v => ({ type: 'vendor' as const, id: `v-${v.name.replace(/\s+/g, '-').toLowerCase()}`, title: v.name, subtitle: v.region, snippet: v.specialtyMaterial.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'rhythms' }));

    const groundingEntries = [
      { id: 'head-heart-hands', title: 'Head, Heart, and Hands — Waldorf Philosophy', content: GROUNDING_DOCS.headHeartHands },
      { id: 'scope-sequence', title: 'Waldorf Scope and Sequence — Steiner\'s 7-Year Cycles', content: GROUNDING_DOCS.scopeAndSequence },
    ];
    searchSource(groundingEntries,
      g => `${g.title} ${g.content}`.toLowerCase(),
      g => ({ type: 'grounding_doc' as const, id: g.id, title: g.title, subtitle: 'Waldorf Philosophy Guide', snippet: g.content.substring(0, 120).replace(/#/g, '').trim(), navigateTo: 'directory' as const, navigateData: 'curriculum' }));

    searchSource(resources,
      res => `${res.title} ${res.category} ${res.grade}`.toLowerCase(),
      res => ({ type: 'resource' as const, id: `teable-res-${res.id}`, title: res.title, subtitle: `${res.category} · ${res.grade}`, snippet: '', navigateTo: 'directory' as const, navigateData: undefined }));

    // Deduplicate
    const seen = new Set<string>();
    return allResults.filter(r => {
      const key = `${r.type}:${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [mentors, documents, resources]);

  // Synonym map for cross-ref / multilingual search
  const SYNONYM_MAP: Record<string, string[]> = {
    'doctor': ['dr', 'md', 'doktor', 'arzt', 'medico', 'medecin', 'physician', 'doctor'],
    'math': ['mathematics', 'maths', 'mathematik', 'arithmetic', 'geometry', 'math'],
    'music': ['singing', 'song', 'musik', 'pentatonic', 'flute', 'recorder', 'piano', 'guitar', 'violin', 'lyre', 'instrument', 'music'],
    'handwork': ['craft', 'knitting', 'crochet', 'sewing', 'handarbeit', 'needlework', 'handwork'],
    'painting': ['watercolor', 'watercolour', 'malen', 'art', 'drawing', 'painting'],
    'grade': ['class', 'level', 'standard', 'stufe', 'klasse', 'grade'],
    'verses': ['poem', 'verse', 'gedicht', 'rhyme', 'saying', 'verses'],
    'woodwork': ['wood', 'woodworking', 'whittling', 'carving', 'holz', 'woodwork'],
    'dolls': ['doll', 'puppet', 'marionette', 'puppe', 'puppetry', 'dolls'],
    'festivals': ['seasons', 'celebrations', 'feste', 'fest', 'festivals'],
    'schools': ['kindergarten', 'schule', 'school', 'academy', 'institute'],
    'nutrition': ['food', 'cooking', 'grain', 'ernährung', 'baking', 'nutrition'],
    'homeschool': ['homeschooling', 'home school', 'hausschule', 'unschool'],
    'geometry': ['form drawing', 'form drawing', 'geometrie', 'shapes'],
    'eurythmy': ['eurhythmy', 'movement', 'eurythmie', 'mouvement'],
    'kindergarten': ['early childhood', 'preschool', 'kindergarten', 'kita'],
    'storytelling': ['story', 'puppetry', 'marionette', 'geschichtenerzählen'],
    'handwork curriculum': ['handwork', 'craft curriculum', 'handarbeit', 'fibel'],
  };

  // Expand query with synonyms
  const expandQuery = (text: string): string[] => {
    const lower = text.toLowerCase().trim();
    const words = lower.split(/\s+/).filter(Boolean);
    const expanded = new Set<string>();
    words.forEach(w => expanded.add(w));
    // Check if any word is a key or value in the synonym map
    for (const [key, syns] of Object.entries(SYNONYM_MAP)) {
      if (syns.some(s => lower.includes(s) || s.includes(lower) || words.some(w => s.includes(w) || w.includes(s)))) {
        syns.forEach(s => expanded.add(s));
        expanded.add(key);
      }
    }
    return Array.from(expanded);
  };

  // Normalize grade references: "5th" → "5", "5th grade" → "grade 5", "level 5" → "grade 5"
  const normalizeGrade = (text: string): string => {
    return text
      .replace(/\b(\d+)(st|nd|rd|th)\s+(grade|level|class)\b/gi, 'grade $1')
      .replace(/\b(grade|level|class)\s+(\d+)(st|nd|rd|th)?\b/gi, 'grade $2')
      .replace(/\b(\d+)(st|nd|rd|th)\b/gi, '$1')
      .replace(/\b(\d+)\s*(?:st|nd|rd|th)?\s*(?:grade|level|class)\b/gi, 'grade $1');
  };

  // Use expanded query for scoring
  const runExpandedKeywordSearch = useCallback((searchQuery: string): SearchResult[] => {
    const q = searchQuery.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 0);
    const expanded = expandQuery(q);
    if (words.length === 0) return [];
    const allResults: SearchResult[] = [];

    const searchHaystack = (haystack: string): number => {
      let score = 0;
      expanded.forEach(w => { if (haystack.includes(w)) score += 2; });
      words.forEach(w => { if (haystack.includes(w)) score += 3; });
      return score;
    };

    const titleMatchScore = (title: string): number => {
      const t = title.toLowerCase();
      let matched = 0;
      words.forEach(w => { if (t.includes(w)) matched += 5; });
      expanded.forEach(w => { if (t.includes(w)) matched += 2; });
      return matched;
    };

    // 1. Search Mentors
    for (const m of mentors) {
      if (m.directoryVisibility === false) continue;
      const nameLower = m.name.toLowerCase();
      const bioLower = (m.bio || '').toLowerCase();
      const locLower = (m.location || '').toLowerCase();
      const specsLower = m.specialties.join(' ').toLowerCase();
      const aliasesLower = ((m as any).multilingualAliases || '').toLowerCase();
      const smartScore = scoreMentorForQuery(m, q);
      const score = smartScore > 0
        ? smartScore + titleMatchScore(m.name) + searchHaystack(`${bioLower} ${locLower} ${specsLower} ${aliasesLower}`) * 2
        : 0;
      if (score > 0) {
        allResults.push({
          type: 'mentor', id: m.id, title: m.name,
          subtitle: `${m.specialties.slice(0, 2).join(', ')} · ${m.location || 'Global'}`,
          snippet: (m.bio || '').substring(0, 140), navigateTo: 'directory', navigateData: m.id,
        });
      }
    }

    // 2. Search Documents
    for (const doc of documents) {
      const titleLower = doc.title.toLowerCase();
      let score = titleMatchScore(doc.title);
      const contentLower = (doc.content || '').toLowerCase();
      expanded.forEach(w => { if (contentLower.includes(w)) score += 2; });
      words.forEach(w => { if (contentLower.includes(w)) score += 1; });
      doc.tags.forEach(tag => { expanded.forEach(w => { if (tag.toLowerCase().includes(w)) score += 3; }); });
      doc.sections.forEach(s => { expanded.forEach(w => { if (s.title.toLowerCase().includes(w)) score += 4; }); });
      if (score >= 1) {
        allResults.push({
          type: 'document', id: doc.id, title: doc.title,
          subtitle: doc.tags.slice(0, 3).map(t => `#${t}`).join(' '),
          snippet: (doc.content || '').substring(0, 150), navigateTo: 'documents', navigateData: doc.id,
        });
      }
    }

    // 3+. Search other sources
    const searchSource = (items: any[], getHaystack: (item: any) => string, buildResult: (item: any) => SearchResult) => {
      for (const item of items) {
        const haystack = getHaystack(item).toLowerCase();
        let score = 0;
        words.forEach(w => { if (haystack.includes(w)) score += 3; });
        expanded.forEach(w => { if (haystack.includes(w)) score += 1; });
        if (score >= 2) {
          allResults.push(buildResult(item));
        }
      }
    };

    // Special search for resources with higher weight on topicTags and searchAliases
    const searchResources = (items: any[]) => {
      for (const item of items) {
        let score = 0;
        const title = (item.title || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const grade = (item.grade || '').toLowerCase();
        const tags = (item.topicTags || []).join(' ').toLowerCase();
        const aliases = (item.searchAliases || []).join(' ').toLowerCase();
        
        // Check exact matches in tags/aliases first (highest priority)
        words.forEach(w => {
          if (tags.includes(w)) score += 10;  // Highest weight for topic tags
          if (aliases.includes(w)) score += 8; // High weight for search aliases
          if (title.includes(w)) score += 5;   // Title matches
          if (category.includes(w)) score += 3;
          if (grade.includes(w)) score += 2;
        });
        
        // Expanded/synonym matches (lower weight)
        expanded.forEach(w => {
          if (tags.includes(w)) score += 5;
          if (aliases.includes(w)) score += 4;
          if (title.includes(w)) score += 2;
          if (category.includes(w)) score += 1;
        });
        
        if (score >= 3) {
          allResults.push({
            type: 'resource' as const,
            id: `teable-res-${item.id}`,
            title: item.title,
            subtitle: `${item.category} · ${item.grade}`,
            snippet: '',
            navigateTo: 'directory' as const,
            navigateData: undefined,
          });
        }
      }
    };

    searchSource(HANDWORK_CURRICULUM,
      hw => `${hw.grade} ${hw.ageRange} ${hw.coreSkills.join(' ')} ${hw.typicalFirstProject}`,
      hw => ({ type: 'living_handwork' as const, id: `hw-${hw.grade}`, title: `${hw.grade} · ${hw.ageRange}`, subtitle: hw.coreSkills.slice(0, 3).join(', '), snippet: hw.typicalFirstProject, navigateTo: 'directory' as const, navigateData: 'curriculum' }));
    searchSource(NUTRITION_PILLARS,
      np => `${np.pillar} ${np.steinerIndication} ${np.practicalApplication} ${np.schoolroomIntegration}`,
      np => ({ type: 'living_nutrition' as const, id: `nut-${np.pillar}`, title: np.pillar, subtitle: 'Anthroposophical Nutrition', snippet: np.steinerIndication.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'rhythms' }));
    searchSource(ANTHROPOSOPHICAL_SOCIETIES,
      soc => `${soc.countryRegion} ${soc.societyName} ${soc.headquarters} ${soc.focusAreas.join(' ')}`,
      soc => ({ type: 'anthro_society' as const, id: `soc-${soc.societyName.replace(/\s+/g, '-').toLowerCase()}`, title: soc.societyName, subtitle: `${soc.countryRegion} · ${soc.headquarters}`, snippet: soc.focusAreas.slice(0, 3).join(', '), navigateTo: 'directory' as const, navigateData: 'curriculum' }));
    searchSource(WALDORF_LITERATURE,
      book => `${book.title} ${book.author} ${book.description} ${book.category}`,
      book => ({ type: 'waldorf_literature' as const, id: `book-${book.title.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}`, title: book.title, subtitle: `${book.author} · ${book.ageRange} · ${book.category}`, snippet: book.description.substring(0, 120), navigateTo: 'directory' as const, navigateData: 'curriculum' }));
    searchSource(SPLASH_VERSES,
      v => `${v.title} ${v.moment} ${v.text}`,
      v => ({ type: 'daily_verse' as const, id: `verse-${v.title.replace(/\s+/g, '-').toLowerCase()}`, title: v.title, subtitle: v.moment, snippet: v.text.substring(0, 120), navigateTo: 'home' as const, navigateData: undefined }));
    searchResources(resources);

    // Deduplicate
    const seen = new Set<string>();
    return allResults.filter(r => {
      const key = `${r.type}:${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [mentors, documents, resources]);

  const search = useCallback((searchQuery: string) => {
    if (!initialized) return;
    
    const q = searchQuery.toLowerCase().trim();
    if (!q || q.length < 2) {
      setResults([]);
      setAiLoading(false);
      return;
    }

    setLoading(true);
    // Apply grade normalization to the query for smarter matching
    const normalizedQuery = normalizeGrade(q);
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) { setLoading(false); return; }

    const keywordResults = runExpandedKeywordSearch(normalizedQuery);
    const expanded = expandQuery(normalizedQuery);
    const scored = keywordResults.map(r => {
      let w = 0;
      words.forEach(word => { if (r.title.toLowerCase().includes(word)) w += 10; });
      expanded.forEach(word => { if (r.title.toLowerCase().includes(word)) w += 4; });
      if (r.type === 'mentor') w += 3;
      if (r.type === 'document') w += 1;
      return { r, w };
    });
    scored.sort((a, b) => b.w - a.w);
    setResults(scored.slice(0, 12).map(item => item.r));
    setLoading(false);
    setSelectedIndex(-1);

    // For multi-word queries, also trigger AI semantic search in parallel
    const isMultiWord = words.length >= 2;
    if (isMultiWord && documents.length > 0) {
      setAiLoading(true);
      crossWikiSearchWithAI(searchQuery, mentors, documents)
        .then(aiResult => {
          if (!aiResult) { setAiLoading(false); return; }
          const aiBased = mergeAIResults([], aiResult);
          if (aiBased.length === 0) { setAiLoading(false); return; }
          // Merge AI results with existing keyword results (deduped)
          const existing = keywordResults;
          const seen = new Set<string>(existing.map(r => `${r.type}:${r.id}`));
          const combined = [...existing, ...aiBased.filter(r => {
            const key = `${r.type}:${r.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })];
          const reScored = combined.map(r => {
            let w = 0;
            words.forEach(word => { if (r.title.toLowerCase().includes(word)) w += 10; });
            if (r.type === 'mentor') w += 3;
            if (r.type === 'document') w += 1;
            if (r.fromAI) w += 5;
            return { r, w };
          });
          reScored.sort((a, b) => b.w - a.w);
          setResults(reScored.slice(0, 12).map(item => item.r));
          setAiLoading(false);
        })
        .catch(() => setAiLoading(false));
    }
  }, [mentors, documents, resources, runKeywordSearch, mergeAIResults]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim().length >= 2) setIsOpen(true);
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    if (result.navigateTo === 'directory' && result.navigateData) {
      onNavigate('directory', { mentorId: result.navigateData });
    } else if (result.navigateTo === 'documents' && result.navigateData) {
      onNavigate('directory', { mentorId: result.navigateData });
    } else {
      onNavigate('directory');
    }
  };

  const runImmediateSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!initialized) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    const normalizedQuery = normalizeGrade(q);
    return runExpandedKeywordSearch(normalizedQuery);
  }, [initialized, runExpandedKeywordSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger immediate search on Enter if results aren't ready
      if (query.trim().length >= 2 && (results.length === 0 || !isOpen)) {
        const immediateResults = runImmediateSearch(query);
        if (immediateResults.length > 0) {
          setResults(immediateResults.slice(0, 12));
          setIsOpen(true);
          setSelectedIndex(-1);
          // Select first result after state updates
          setTimeout(() => handleSelect(immediateResults[0]), 0);
        }
        return;
      }
    }
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < results.length - 1 ? prev + 1 : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : results.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        // If no item selected but Enter pressed, select first result
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const getIcon = (type: SearchResultType) => {
    switch (type) {
      case 'mentor': return <UserIcon size={14} className="text-sage" />;
      case 'document': return <FolderOpen size={14} className="text-[#b8943f]" />;
      case 'living_handwork': return <Leaf size={14} className="text-[#1a4a20]" />;
      case 'living_nutrition': return <Sparkles size={14} className="text-[#7a4f1a]" />;
      case 'resource': return <BookOpen size={14} className="text-[#2c4a6e]" />;
      case 'anthro_society': return <Library size={14} className="text-[#2c4a6e]" />;
      case 'waldorf_literature': return <BookOpen size={14} className="text-[#7a4f1a]" />;
      case 'chalkboard': return <Sparkles size={14} className="text-[#1a4a20]" />;
      case 'dye_plant': return <Leaf size={14} className="text-[#7a4f1a]" />;
      case 'resale_platform': return <Sprout size={14} className="text-[#2c4a6e]" />;
      case 'daily_verse': return <Sparkles size={14} className="text-[#b8943f]" />;
      case 'temperament': return <UserIcon size={14} className="text-[#7a4f1a]" />;
      case 'developmental_cycle': return <Sprout size={14} className="text-sage" />;
      case 'practical_arts': return <Scissors size={14} className="text-[#1a4a20]" />;
      case 'vendor': return <Sprout size={14} className="text-[#7a4f1a]" />;
      case 'grounding_doc': return <BookOpen size={14} className="text-sage" />;
      default: return <Search size={14} className="text-ink-soft" />;
    }
  };

  const getTypeLabel = (type: SearchResultType) => {
    switch (type) {
      case 'mentor': return 'Mentor';
      case 'document': return 'Article';
      case 'living_handwork': return 'Handwork';
      case 'living_nutrition': return 'Nutrition';
      case 'resource': return 'Resource';
      case 'anthro_society': return 'Society';
      case 'waldorf_literature': return 'Book';
      case 'chalkboard': return 'Chalkboard';
      case 'dye_plant': return 'Dye';
      case 'resale_platform': return 'Shop';
      case 'daily_verse': return 'Verse';
      case 'temperament': return 'Temperament';
      case 'developmental_cycle': return 'Development';
      case 'practical_arts': return 'Practical Arts';
      case 'vendor': return 'Vendor';
      case 'grounding_doc': return 'Philosophy';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto" role="search" aria-label="Global search">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" aria-hidden="true">
          <Search size={16} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (query.trim().length >= 2) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search mentors, wiki articles, handwork, music, doctor/dr/doktor..."
          className="w-full pl-9 pr-10 py-2 bg-white border border-border rounded-full outline-none focus:border-sage focus:ring-2 focus:ring-sage/10 transition-all text-sm text-ink placeholder-ink-soft/60"
          aria-label="Search The Waldorf Path"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={isOpen && results.length > 0}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink p-0.5 rounded-full cursor-pointer bg-transparent border-none"
            aria-label="Clear search"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || aiLoading) && (
          <motion.div
            id="search-results"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-border rounded-2xl shadow-xl max-h-[420px] overflow-y-auto z-[300]"
            role="listbox"
            aria-label="Search results"
          >
            <div className="px-3 py-2 border-b border-border/50 bg-sage-pale/20 flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sage">
                {results.length} result{results.length !== 1 ? 's' : ''} across the Waldorf Path
              </p>
              {aiLoading && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#7a4f1a]" aria-live="polite" aria-atomic="true">
                  <Sparkles size={10} className="animate-pulse" aria-hidden="true" />
                  AI searching...
                </span>
              )}
            </div>
            <div className="py-1" role="presentation">
              {results.length === 0 && aiLoading && (
                <div className="px-4 py-6 flex items-center justify-center gap-2 text-ink-soft/70 text-xs" aria-live="polite">
                  <Loader2 size={14} className="animate-spin text-[#7a4f1a]" aria-hidden="true" />
                  <span>Nina is searching across mentors, articles, rhythms, and handwork...</span>
                </div>
              )}
              {results.map((result, idx) => (
                <button
                  key={`${result.type}:${result.id}`}
                  onClick={() => handleSelect(result)}
                  role="option"
                  aria-selected={idx === selectedIndex}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-sage-pale/20 transition-colors cursor-pointer border-none bg-transparent ${
                    idx === selectedIndex ? 'bg-sage-pale/30' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(result.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-serif font-semibold text-sm text-ink truncate">
                        {result.title}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-sage-pale/50 text-sage rounded-full shrink-0">
                        {getTypeLabel(result.type)}
                      </span>
                      {result.fromAI && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-[#fdf6e3] text-[#7a4f1a] rounded-full shrink-0 flex items-center gap-0.5" title="Found by AI semantic search">
                          <Sparkles size={9} />
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink-soft truncate">
                      {result.subtitle}
                    </p>
                    {result.snippet && (
                      <p className="text-[11px] text-ink-soft/70 mt-0.5 line-clamp-1">
                        {result.snippet}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={12} className="mt-1 text-ink-soft/40 shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}