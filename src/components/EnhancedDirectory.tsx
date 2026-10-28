import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { Search, X, MapPin, Filter, LayoutGrid, List, Bookmark, BookmarkCheck, User, Send, CheckCircle2, Sparkles, ChevronLeft, ChevronRight, Share2, Home, ArrowRight, Check, Heart, Brain, Hand, BarChart3, Globe, Shield, BookOpen, FileText, ChevronDown, Star, Leaf, Users, Activity, Download, Database, Loader2 } from 'lucide-react';
import { Mentor, MENTORS } from '../data/mentors';
import { getMentors, getResources } from '../services/workflowService';
import { showSuccess, showError } from '../utils/toastUtils';
import { scoreMentorForQuery } from '../utils/smartSearch';

type DirectoryTab = 'find' | 'guided' | 'mypath' | 'insights';

const STAGE_OPTIONS = [
  { value: '', label: 'All developmental stages' },
  { value: 'Willing / Hands (Ages 0-7)', label: 'Willing / Hands (Ages 0-7)' },
  { value: 'Feeling / Heart (Ages 7-14)', label: 'Feeling / Heart (Ages 7-14)' },
  { value: 'Thinking / Head (Ages 14-21)', label: 'Thinking / Head (Ages 14-21)' },
  { value: 'Across All Cycles (K-12)', label: 'Across All Cycles (K-12)' },
];

const SPECIALTY_OPTIONS = [
  { value: '', label: 'All specialties' },
  { value: 'Early Childhood', label: 'Early Childhood' },
  { value: 'Homeschool & Curriculum', label: 'Homeschool & Curriculum' },
  { value: 'Literacy & Story', label: 'Literacy & Story' },
  { value: 'Mathematics & Science', label: 'Mathematics & Science' },
  { value: 'Arts & Handwork', label: 'Arts & Handwork' },
  { value: 'Music & Movement', label: 'Music & Movement' },
  { value: 'Development & Therapeutic', label: 'Development & Therapeutic' },
  { value: 'Teacher & School Support', label: 'Teacher & School Support' },
];

const LOCATION_OPTIONS = [
  { value: '', label: 'All locations' },
  { value: 'United States', label: 'United States' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia & New Zealand', label: 'Australia & New Zealand' },
  { value: 'Remote & Global', label: 'Remote & Global' },
  { value: 'Other Regions', label: 'Other Regions' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All profile status' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Unclaimed', label: 'Unclaimed' },
];

const getCountryOptions = (mentors: Mentor[]) => [
  { value: '', label: 'All countries' },
  ...Array.from(new Set(mentors.map(m => m.Country).filter(Boolean))).sort()
    .map(c => ({ value: c, label: c })),
];

/* ─── GUIDED MATCH STEPS ─── */
const GUIDED_STEPS = [
  {
    title: 'Child & Developmental Stage',
    subtitle: 'Choose the stage that best reflects the child or learners you are supporting.',
    options: [
      { id: 'hands', label: 'Willing / Hands (Ages 0-7)', icon: Hand, group: 'stage' },
      { id: 'heart', label: 'Feeling / Heart (Ages 7-14)', icon: Heart, group: 'stage' },
      { id: 'head', label: 'Thinking / Head (Ages 14-21)', icon: Brain, group: 'stage' },
      { id: 'all', label: 'Across All Cycles (K-12)', icon: Users, group: 'stage' },
    ],
  },
  {
    title: 'Support Goals',
    subtitle: 'Select one or more practical outcomes. These are matched against profile specialties and biographies.',
    options: [
      { id: 'homeschool', label: 'Plan our homeschool', icon: Home, group: 'goal' },
      { id: 'development', label: 'Support child development', icon: Leaf, group: 'goal' },
      { id: 'rhythms', label: 'Build family rhythms', icon: Heart, group: 'goal' },
      { id: 'academic', label: 'Strengthen an academic area', icon: Brain, group: 'goal' },
      { id: 'arts', label: 'Bring in practical arts', icon: Hand, group: 'goal' },
      { id: 'school', label: 'Support a school or faculty', icon: Users, group: 'goal' },
    ],
  },
  {
    title: 'Specialty Needs',
    subtitle: 'Select the areas where focused experience matters most.',
    options: [
      { id: 'general', label: 'General guidance', icon: Star, group: 'specialty' },
      { id: 'early', label: 'Early childhood', icon: Leaf, group: 'specialty' },
      { id: 'literacy', label: 'Literacy & storytelling', icon: BookOpen, group: 'specialty' },
      { id: 'math', label: 'Mathematics & science', icon: Brain, group: 'specialty' },
      { id: 'handwork', label: 'Handwork & visual arts', icon: Hand, group: 'specialty' },
      { id: 'music', label: 'Music & movement', icon: Heart, group: 'specialty' },
      { id: 'therapy', label: 'Therapeutic support', icon: Activity, group: 'specialty' },
      { id: 'teacher', label: 'Teacher development', icon: Users, group: 'specialty' },
    ],
  },
  {
    title: 'Location & Priorities',
    subtitle: 'How would you prefer to connect?',
    options: [
      { id: 'near', label: 'Near my location', icon: MapPin, group: 'location' },
      { id: 'remote', label: 'Remote support', icon: Globe, group: 'location' },
      { id: 'either', label: 'Either works', icon: Users, group: 'location' },
      { id: 'verified', label: 'Verified profile', icon: Shield, group: 'priority' },
      { id: 'stage_fit', label: 'Developmental fit', icon: Leaf, group: 'priority' },
      { id: 'specialty_fit', label: 'Specialty fit', icon: Star, group: 'priority' },
      { id: 'location_fit', label: 'Location fit', icon: MapPin, group: 'priority' },
    ],
  },
];

interface EnhancedDirectoryProps {
  recommendedTags: string[];
  initialSelectedMentorId?: string;
  onClearInitialMentor?: () => void;
  onClearTags?: () => void;
  onRemoveTag?: (tag: string) => void;
}

function getRegion(location: string): string {
  const loc = (location || '').toLowerCase();
  if (loc.includes('usa') || loc.includes('united states') || loc.includes('denver') || loc.includes('new york') || loc.includes('california') || loc.includes('texas') || loc.includes('florida')) return 'United States';
  if (loc.includes('uk') || loc.includes('united kingdom') || loc.includes('germany') || loc.includes('france') || loc.includes('spain') || loc.includes('italy') || loc.includes('netherlands') || loc.includes('switzerland') || loc.includes('austria') || loc.includes('europe')) return 'Europe';
  if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver')) return 'Canada';
  if (loc.includes('australia') || loc.includes('new zealand') || loc.includes('sydney')) return 'Australia & New Zealand';
  if (loc.includes('remote') || loc.includes('online') || loc.includes('global') || loc.includes('worldwide')) return 'Remote & Global';
  return 'Other Regions';
}

function matchSpecialty(specialties: string[], filter: string): boolean {
  if (!filter) return true;
  const f = filter.toLowerCase();
  return specialties.some(s => {
    const sl = s.toLowerCase();
    if (f === 'early childhood') return sl.includes('early') || sl.includes('kindergarten') || sl.includes('preschool');
    if (f === 'homeschool & curriculum') return sl.includes('homeschool') || sl.includes('curriculum') || sl.includes('lesson');
    if (f === 'literacy & story') return sl.includes('literacy') || sl.includes('story') || sl.includes('reading') || sl.includes('writing');
    if (f === 'mathematics & science') return sl.includes('math') || sl.includes('science') || sl.includes('geometry');
    if (f === 'arts & handwork') return sl.includes('handwork') || sl.includes('craft') || sl.includes('art') || sl.includes('painting');
    if (f === 'music & movement') return sl.includes('music') || sl.includes('movement') || sl.includes('eurythmy') || sl.includes('singing') || sl.includes('dance');
    if (f === 'development & therapeutic') return sl.includes('development') || sl.includes('therapy') || sl.includes('special') || sl.includes('curative') || sl.includes('health');
    if (f === 'teacher & school support') return sl.includes('teacher') || sl.includes('school') || sl.includes('training') || sl.includes('mentor') || sl.includes('coach');
    return sl.includes(f);
  });
}

export function EnhancedDirectory({ recommendedTags, initialSelectedMentorId, onClearInitialMentor, onClearTags, onRemoveTag }: EnhancedDirectoryProps) {
  const [activeTab, setActiveTab] = useState<DirectoryTab>('find');
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const check = () => {
      try { const raw = localStorage.getItem('LOGGED_IN_USER'); if (raw) setCurrentUser(JSON.parse(raw)); else setCurrentUser(null); } catch { setCurrentUser(null); }
    };
    check(); window.addEventListener('storage', check); window.addEventListener('focus', check);
    return () => { window.removeEventListener('storage', check); window.removeEventListener('focus', check); };
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  /* Find a Mentor tab state */
  const [findSearch, setFindSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [findPage, setFindPage] = useState(0);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  /* Guided Match state */
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedSelections, setGuidedSelections] = useState<Record<string, string[]>>({});
  const [showGuidedResults, setShowGuidedResults] = useState(false);

  /* My Path state */
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('MY_PATH_SHORTLIST') || '[]'); } catch { return []; }
  });

  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMentors();
        setAllMentors(data);
      } catch { setAllMentors(MENTORS.filter(m => m.directoryVisibility)); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  /* Sync shortlist to localStorage */
  useEffect(() => {
    localStorage.setItem('MY_PATH_SHORTLIST', JSON.stringify(shortlistedIds));
  }, [shortlistedIds]);

  useEffect(() => { setFindPage(0); }, [findSearch, stageFilter, specialtyFilter, locationFilter, countryFilter, statusFilter]);

  useEffect(() => {
    const hash = window.location.hash.replace('#id=', '');
    if (hash && allMentors.length > 0) {
      const match = allMentors.find(m => m.id === hash);
      if (match) setSelectedMentor(match);
    }
  }, [allMentors]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedMentor) {
        setSelectedMentor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMentor]);

  const toggleShortlist = (id: string) => {
    setShortlistedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  /* ─── FILTERED MENTORS ─── */
  const visibleMentors = useMemo(() => allMentors.filter(m => m.directoryVisibility), [allMentors]);

  const filteredMentors = useMemo(() => {
    let results = visibleMentors;

    if (recommendedTags.length > 0) {
      results = results.filter(m => m.specialties.some(s =>
        recommendedTags.some(t => s.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(s.toLowerCase()))
      ));
    }

    let scores: Map<string, number> | null = null;
    if (findSearch.trim()) {
      const q = findSearch;
      results = results
        .map(m => ({ m, score: scoreMentorForQuery(m, q) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);
      scores = new Map(results.map(x => [x.m.id, x.score]));
      results = results.map(x => x.m);
    }

    if (stageFilter) results = results.filter(m => m.gradeLevel === stageFilter);
    if (specialtyFilter) results = results.filter(m => matchSpecialty(m.specialties, specialtyFilter));
    if (locationFilter) results = results.filter(m => getRegion(m.location) === locationFilter);
    if (statusFilter) results = results.filter(m => m.status === statusFilter);
    if (countryFilter) results = results.filter(m => m.Country === countryFilter);

    return results.sort((a, b) => {
      if (scores) {
        const sa = scores.get(a.id) ?? 0;
        const sb = scores.get(b.id) ?? 0;
        if (sa !== sb) return sb - sa;
        if (a.featuredActive && !b.featuredActive) return -1;
        if (!a.featuredActive && b.featuredActive) return 1;
        return 0;
      }
      if (a.featuredActive && !b.featuredActive) return -1;
      if (!a.featuredActive && b.featuredActive) return 1;
      if (a.subscriptionActive && !b.subscriptionActive) return -1;
      if (!a.subscriptionActive && b.subscriptionActive) return 1;
      return 0;
    });
  }, [visibleMentors, recommendedTags, findSearch, stageFilter, specialtyFilter, locationFilter, statusFilter]);

  const paginatedMentors = filteredMentors.slice(findPage * PAGE_SIZE, (findPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredMentors.length / PAGE_SIZE);

  /* ─── GUIDED MATCH ─── */
  const currentStep = GUIDED_STEPS[guidedStep];
  const stepSelections = guidedSelections[currentStep?.options?.[0]?.group || ''] || [];
  const isLastStep = guidedStep === GUIDED_STEPS.length - 1;
  const progressPct = ((guidedStep + 1) / GUIDED_STEPS.length) * 100;

  const toggleGuidedOption = (id: string, group: string) => {
    setGuidedSelections(prev => {
      const current = [...(prev[group] || [])];
      if (group === 'stage' || group === 'location') {
        return { ...prev, [group]: [id] };
      }
      const idx = current.indexOf(id);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(id);
      return { ...prev, [group]: current };
    });
  };

  const handleGuidedContinue = () => {
    if (isLastStep) {
      setShowGuidedResults(true);
    } else {
      setGuidedStep(s => s + 1);
    }
  };

  const resetGuided = () => {
    setGuidedStep(0);
    setGuidedSelections({});
    setShowGuidedResults(false);
  };

  /* Match guided selections to mentors */
  const guidedResults = useMemo(() => {
    if (!showGuidedResults) return [];
    let matches = visibleMentors;
    const stageSel = guidedSelections['stage']?.[0];
    if (stageSel === 'hands') matches = matches.filter(m => m.gradeLevel?.includes('0-7') || m.gradeLevel?.includes('Willing'));
    else if (stageSel === 'heart') matches = matches.filter(m => m.gradeLevel?.includes('7-14') || m.gradeLevel?.includes('Feeling'));
    else if (stageSel === 'head') matches = matches.filter(m => m.gradeLevel?.includes('14-21') || m.gradeLevel?.includes('Thinking'));
    const goalSels = guidedSelections['goal'] || [];
    if (goalSels.length > 0) {
      matches = matches.filter(m => m.specialties.some(s =>
        goalSels.some(g => s.toLowerCase().includes(g))
      ));
    }
    const specSels = guidedSelections['specialty'] || [];
    if (specSels.length > 0) {
      matches = matches.filter(m => matchSpecialty(m.specialties, specSels.join(' ')));
    }
    return matches.slice(0, 30);
  }, [showGuidedResults, visibleMentors, guidedSelections]);

  /* ─── INSIGHTS STATS ─── */
  const insights = useMemo(() => {
    const pub = visibleMentors;
    const verified = pub.filter(m => m.status === 'Verified');
    const unclaimed = pub.filter(m => m.status === 'Unclaimed');
    const pending = pub.filter(m => m.status === 'Pending');
    const stageCounts = STAGE_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, count: pub.filter(m => m.gradeLevel === o.value).length }));
    const regionCounts = LOCATION_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, count: pub.filter(m => getRegion(m.location) === o.value).length }));
    const missingLocation = pub.filter(m => !m.location || m.location.trim() === '').length;
    const invalidPhotos = pub.filter(m => !m.photoUrl || m.photoUrl.includes('pravatar') || m.photoUrl.includes('placeholder')).length;
    const missingBio = pub.filter(m => !m.bio || m.bio.trim() === '').length;
    const missingStage = pub.filter(m => !m.gradeLevel).length;
    const missingSpecialty = pub.filter(m => !m.specialties || m.specialties.length === 0).length;
    return { pub, verified, unclaimed, pending, stageCounts, regionCounts, missingLocation, invalidPhotos, missingBio, missingStage, missingSpecialty };
  }, [visibleMentors]);

  /* ─── RESOURCE STATS ─── */
  const [resourceStats, setResourceStats] = useState({ total: 0, free: 0, byCategory: {} as Record<string, number>, byGrade: {} as Record<string, number>, missingCategory: 0, missingGrade: 0, invalidLinks: 0 });
  useEffect(() => {
    getResources().then(res => {
      const cats: Record<string, number> = {};
      const grades: Record<string, number> = {};
      let invalidLinks = 0;
      res.forEach(r => {
        if (!r.title || r.title.trim() === '') return;
        const cat = r.category || 'Uncategorized';
        cats[cat] = (cats[cat] || 0) + 1;
        const grade = r.grade || 'Adult & All Ages';
        grades[grade] = (grades[grade] || 0) + 1;
        if (!r.fileLink || r.fileLink.trim() === '' || (!r.fileLink.startsWith('http') && !r.fileLink.startsWith('/'))) invalidLinks++;
      });
      setResourceStats({
        total: res.filter(r => r.title && r.title.trim()).length,
        free: res.filter(r => r.contentType !== 'pdf').length,
        byCategory: cats,
        byGrade: grades,
        missingCategory: res.filter(r => r.title && !r.category).length,
        missingGrade: res.filter(r => r.title && !r.grade).length,
        invalidLinks,
      });
    }).catch(() => {});
  }, []);

  /* ─── EXPORT STATE ─── */
  const [exportType, setExportType] = useState<'mentors' | 'accounts' | 'all'>('mentors');
  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const { getMentorExportRows, getAccountExportRows } = await import('../services/workflowService');
      const { rowsToCsv, downloadCsv } = await import('../utils/csvUtils');
      const stamp = new Date().toISOString().slice(0, 10);
      if (exportType === 'mentors' || exportType === 'all') {
        const mentors = await getMentorExportRows();
        downloadCsv(rowsToCsv(mentors), `waldorf-mentors-${stamp}.csv`);
      }
      if (exportType === 'accounts' || exportType === 'all') {
        const accounts = await getAccountExportRows();
        downloadCsv(rowsToCsv(accounts), `waldorf-accounts-${stamp}.csv`);
      }
      showSuccess('CSV export downloaded.');
    } catch (error) {
      console.error('CSV export failed:', error);
      showError('Export failed — please check the console.');
    } finally {
      setExporting(false);
    }
  };

  /* ─── RENDER: Mentor Card ─── */
  const renderMentorCard = (mentor: Mentor, idx: number) => {
    const isShortlisted = shortlistedIds.includes(mentor.id);
    const isFeatured = mentor.featuredActive;
    return (
      <motion.div
        key={mentor.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        layout
        className={`group cursor-pointer transition-all duration-300 border ${
          isFeatured
            ? 'border-2 border-[#d4a84b] bg-gradient-to-br from-[#fffdf5] to-[#fdf6e3] shadow-[0_8px_30px_rgba(212,168,75,0.2)] scale-[1.05] sm:scale-[1.08]'
            : 'border-border bg-white/50 hover:border-sage/30 scale-100'
        }`}
        onClick={() => setSelectedMentor(mentor)}
      >
        <div className={`flex gap-5 ${isFeatured ? 'p-6 sm:p-7' : 'p-5'}`}>
        <div className={`${isFeatured ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20'} shrink-0 rounded-[20px] overflow-hidden border border-border shadow-inner bg-white`}>
          {mentor.status === 'Unclaimed' ? (
            <svg viewBox="0 0 100 100" className="w-full h-full bg-[#fdfaf2] p-1.5 text-sage">
              <defs><radialGradient id="wg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f7f9f5" /><stop offset="50%" stopColor="#eaf2e3" stopOpacity="0.8" /><stop offset="100%" stopColor="#dcecd0" stopOpacity="0.1" /></radialGradient></defs>
              <circle cx="50" cy="50" r="40" fill="url(#wg)" />
              <path d="M50 30 C40 30 32 38 32 48 C32 60 50 74 50 74 C50 74 68 60 68 48 C68 38 60 30 50 30 Z" fill="none" stroke="#7a8c6e" strokeWidth="2.5" />
              <circle cx="50" cy="48" r="6" fill="#7a8c6e" />
            </svg>
          ) : mentor.status === 'Pending' || !mentor.subscriptionActive ? (
            <svg viewBox="0 0 100 100" className="w-full h-full bg-[#fdfaf2] p-1.5 text-sage" aria-hidden="true">
              <defs>
                <radialGradient id="waterGrad2" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f7f9f5" stopOpacity="1" />
                  <stop offset="50%" stopColor="#eaf2e3" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#dcecd0" stopOpacity="0.1" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="40" fill="url(#waterGrad2)" />
              <path d="M50 30 C40 30 32 38 32 48 C32 60 50 74 50 74 C50 74 68 60 68 48 C68 38 60 30 50 30 Z" fill="none" stroke="#7a8c6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="50" cy="48" r="6" fill="#7a8c6e" />
            </svg>
          ) : (
            <img src={mentor.photoUrl} alt={mentor.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-serif text-ink font-semibold truncate ${isFeatured ? 'text-xl' : 'text-lg'}`}>{mentor.name}</h3>
                {isFeatured && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#d4a84b] to-[#f0d080] text-white text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                    ⭐ Featured Guide
                  </span>
                )}
                {mentor.status === 'Verified' && <span className="px-2 py-0.5 bg-green-600 text-white text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm">Verified</span>}
                {mentor.status === 'Pending' && <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm">Pending</span>}
                {mentor.status === 'Unclaimed' && !mentor.featuredActive && <span className="px-2 py-0.5 bg-slate-400 text-white text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm">Unclaimed</span>}
              </div>
              <p className={`text-ink-soft mt-0.5 ${isFeatured ? 'text-sm' : 'text-xs'}`}><MapPin size={isFeatured ? 12 : 10} className="inline" /> {mentor.location} • {mentor.gradeLevel}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); toggleShortlist(mentor.id); }}
              className="shrink-0 p-1.5 rounded-full hover:bg-sage-pale/50 transition-colors cursor-pointer border-none bg-transparent group/shortlist" title={isShortlisted ? 'Saved in My Path — click to remove' : 'Save to My Path — build your shortlist'}>
              {isShortlisted ? <BookmarkCheck size={16} className="text-[#d4a84b]" /> : <Bookmark size={16} className="text-ink-soft/40 hover:text-[#d4a84b]" />}
            </button>
          </div>
          <p className={`text-ink-soft/70 mt-1 line-clamp-2 italic ${isFeatured ? 'text-sm' : 'text-xs'}`}>"{mentor.bio}"</p>
          {mentor.credentialSummary && (
            <p className={`text-ink-soft/50 mt-1 ${isFeatured ? 'text-xs' : 'text-[10px]'}`}>&#127891; {mentor.credentialSummary}</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {mentor.specialties.slice(0, isFeatured ? 4 : 3).map(s => (
              <span key={s} className={`px-2 py-0.5 bg-white/50 text-sage font-bold rounded-full border border-border uppercase tracking-tight ${isFeatured ? 'text-[10px]' : 'text-[9px]'}`}>{s}</span>
            ))}
            {mentor.specialties.length > (isFeatured ? 4 : 3) && <span className={`text-ink-soft/50 ${isFeatured ? 'text-[10px]' : 'text-[9px]'}`}>+{mentor.specialties.length - (isFeatured ? 4 : 3)}</span>}
          </div>
        </div>
        </div>
      </motion.div>
    );
  };

  /* ─── RENDER: Main ─── */
  if (loading) {
    return <div className="flex items-center justify-center py-20 text-sage italic font-serif">Resonating with the field...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white/10">
      {/* Tab Bar */}
      <div className="px-4 pt-4 pb-0 border-b border-border bg-white/40">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-serif text-ink font-semibold">Find a Mentor</h1>
          <p className="text-xs text-ink-soft italic">{filteredMentors.length} public profiles available</p>
        </div>
        <div className="flex gap-1">
          {[
            { id: 'find' as DirectoryTab, label: 'Find a Mentor', icon: Search },
            { id: 'guided' as DirectoryTab, label: 'Guided Match', icon: Sparkles },
            { id: 'mypath' as DirectoryTab, label: 'My Path', icon: BookmarkCheck },
            ...(isAdmin ? [{ id: 'insights' as DirectoryTab, label: 'Insights', icon: BarChart3 }] : []),
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all cursor-pointer border-none ${
                activeTab === tab.id ? 'bg-white text-sage border-b-2 border-sage shadow-sm' : 'bg-transparent text-ink-soft hover:text-sage hover:bg-white/50'
              }`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────── TAB: FIND A MENTOR ───────────── */}
      {activeTab === 'find' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Search + Filters */}
          <div className="px-4 py-3 border-b border-border bg-white/20 space-y-3 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
              <input type="text" value={findSearch} onChange={e => setFindSearch(e.target.value)}
                placeholder="Search by name, specialty, location, or topic"
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-border rounded-full outline-none focus:border-sage focus:ring-2 focus:ring-sage/10 transition-all text-sm text-ink placeholder-ink-soft/60" />
              {findSearch && <button onClick={() => setFindSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink cursor-pointer bg-transparent border-none"><X size={12} /></button>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-border rounded-lg outline-none focus:border-sage text-ink cursor-pointer">
                {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={specialtyFilter} onChange={e => setSpecialtyFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-border rounded-lg outline-none focus:border-sage text-ink cursor-pointer">
                {SPECIALTY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-border rounded-lg outline-none focus:border-sage text-ink cursor-pointer">
                {LOCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-border rounded-lg outline-none focus:border-sage text-ink cursor-pointer">
                {getCountryOptions(allMentors).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white border border-border rounded-lg outline-none focus:border-sage text-ink cursor-pointer">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">View</span>
                <button onClick={() => setViewMode('list')} className={`p-1 rounded cursor-pointer border-none ${viewMode === 'list' ? 'bg-sage text-white' : 'bg-white/50 text-ink-soft hover:text-sage'}`}><List size={14} /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1 rounded cursor-pointer border-none ${viewMode === 'grid' ? 'bg-sage text-white' : 'bg-white/50 text-ink-soft hover:text-sage'}`}><LayoutGrid size={14} /></button>
              </div>
              <span className="text-[10px] text-ink-soft/70">{filteredMentors.length} result{filteredMentors.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Mentor List */}
          <div className="flex-1 overflow-y-auto">
            {recommendedTags.length > 0 && (
              <div className="px-4 pt-3 flex flex-wrap items-center gap-2">
                {recommendedTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-pale text-sage text-[10px] rounded-full uppercase tracking-widest font-bold">
                    {tag}
                    <button onClick={() => onRemoveTag?.(tag)} className="hover:text-ink cursor-pointer bg-transparent border-none text-sage/60 p-0"><X size={10} /></button>
                  </span>
                ))}
                <button onClick={() => onClearTags?.()} className="text-[10px] font-bold text-sage hover:text-earth uppercase tracking-wider cursor-pointer border-none bg-transparent">Clear all</button>
              </div>
            )}
            <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}`}>
              <AnimatePresence mode="popLayout">
                {paginatedMentors.length > 0 ? paginatedMentors.map((m, i) => renderMentorCard(m, i)) : (
                  <div className="col-span-full text-center py-16">
                    <p className="text-sage italic text-lg font-serif">No mentors match these filters.</p>
                    <button onClick={() => { setStageFilter(''); setSpecialtyFilter(''); setLocationFilter(''); setStatusFilter(''); setFindSearch(''); onClearTags?.(); }}
                      className="text-sm text-sage font-bold uppercase tracking-widest mt-4 hover:underline cursor-pointer border-none bg-transparent">Clear all filters</button>
                  </div>
                )}
              </AnimatePresence>
            </div>
            {filteredMentors.length > 0 && (
              <div className="flex flex-col items-center gap-3 pb-6 px-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setFindPage(p => Math.max(0, p - 1))} disabled={findPage === 0}
                    className="rounded-full px-4 py-1.5 bg-white border border-border text-sm font-medium hover:bg-sage-pale transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer">
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="text-sm text-ink-soft font-medium">Page {findPage + 1} of {totalPages}</span>
                  <button onClick={() => setFindPage(p => Math.min(totalPages - 1, p + 1))} disabled={findPage >= totalPages - 1}
                    className="rounded-full px-4 py-1.5 bg-white border border-border text-sm font-medium hover:bg-sage-pale transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer">
                    Next <ChevronRight size={14} />
                  </button>
                </div>
                <p className="text-xs text-ink-soft/70">Showing {findPage * PAGE_SIZE + 1}-{Math.min((findPage + 1) * PAGE_SIZE, filteredMentors.length)} of {filteredMentors.length} mentors</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────── TAB: GUIDED MATCH ───────────── */}
      {activeTab === 'guided' && (
        <div className="p-4 sm:p-6 overflow-y-auto">
          {!showGuidedResults ? (
            <div className="max-w-xl mx-auto">
              <h2 className="text-lg font-serif text-ink font-semibold mb-1">Guided Match</h2>
              <p className="text-xs text-ink-soft italic mb-6">Turn your needs into a focused shortlist with transparent recommendation reasons.</p>

              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-sage rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-xs font-bold text-sage uppercase tracking-wider whitespace-nowrap">Step {guidedStep + 1} of {GUIDED_STEPS.length}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={guidedStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                  <h3 className="text-base font-bold text-ink">{currentStep.title}</h3>
                  <p className="text-xs text-ink-soft mb-4">{currentStep.subtitle}</p>
                  <div className={currentStep.options.length <= 4 ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
                    {currentStep.options.map(opt => {
                      const groupSelections = guidedSelections[opt.group] || [];
                      const isSelected = groupSelections.includes(opt.id);
                      const Icon = opt.icon;
                      return (
                        <button key={opt.id} onClick={() => toggleGuidedOption(opt.id, opt.group)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected ? 'bg-sage-pale/30 border-sage shadow-sm' : 'bg-white border-border hover:border-sage/30 hover:bg-sage-pale/10'
                          }`}>
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-sage text-white' : 'bg-sage-pale/50 text-sage'}`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-sm font-medium text-ink">{opt.label}</span>
                          {isSelected && <Check size={14} className="ml-auto text-sage shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              <button onClick={handleGuidedContinue} disabled={stepSelections.length === 0}
                className="mt-6 w-full py-3 bg-gradient-to-r from-sage to-sage-light text-white text-sm font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none">
                {isLastStep ? 'See Recommendations' : 'Continue'}
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-serif text-ink font-semibold">Your Guided Matches</h2>
                <button onClick={resetGuided} className="text-xs font-bold text-sage hover:text-earth uppercase tracking-wider cursor-pointer border-none bg-transparent">Start Over</button>
              </div>
              {guidedResults.length > 0 ? (
                <div className="space-y-3">
                  {guidedResults.slice(0, 10).map(m => renderMentorCard(m, 0))}
                  {guidedResults.length > 10 && (
                    <p className="text-center text-xs text-ink-soft italic py-4">+{guidedResults.length - 10} more matching mentors. Use filters above to narrow results.</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-sage italic text-lg font-serif">No mentors match your guided selections. Try different preferences.</p>
                  <button onClick={resetGuided} className="mt-4 text-sm text-sage font-bold uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent">Start Over</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ───────────── TAB: MY PATH ───────────── */}
      {activeTab === 'mypath' && (
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <h2 className="text-lg font-serif text-ink font-semibold mb-1">My Path</h2>
            <p className="text-xs text-ink-soft italic mb-6">Organize your shortlisted mentors, selected resources, and seasonal rhythm.</p>

            <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl mb-6">
              <p className="text-xs text-[#7a4f1a] leading-relaxed"><strong>Your practical plan.</strong> Stored only in this browser. Nothing in this plan is stored permanently.</p>
            </div>

            {shortlistedIds.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <BookmarkCheck size={40} className="mx-auto text-ink-soft/20" />
                <p className="text-sage italic font-serif text-base">Your path is ready to take shape</p>
                <p className="text-xs text-ink-soft">Shortlist mentors, add practical resources, and choose a seasonal rhythm to build a plan.</p>
                <button onClick={() => setActiveTab('find')}
                  className="px-5 py-2 bg-sage text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer border-none inline-flex items-center gap-2">
                  <Search size={14} /> Find a Mentor
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-sage">{shortlistedIds.length} shortlisted mentor{shortlistedIds.length !== 1 ? 's' : ''}</p>
                {visibleMentors.filter(m => shortlistedIds.includes(m.id)).map(m => renderMentorCard(m, 0))}
                <div className="text-center pt-4">
                  <button onClick={() => setActiveTab('find')}
                    className="px-5 py-2 bg-sage text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer border-none inline-flex items-center gap-2">
                    <Search size={14} /> Find more mentors
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────── TAB: INSIGHTS ───────────── */}
      {activeTab === 'insights' && (
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            <h2 className="text-lg font-serif text-ink font-semibold">Insights</h2>
            <p className="text-xs text-ink-soft italic mb-4">Review public directory coverage and data quality across the connected tables.</p>
            <p className="text-[10px] text-ink-soft/60 mb-5">Aggregates use public mentor profiles and non-sensitive resource fields only.</p>

            {/* Export CSV */}
            <div className="mb-6 rounded-2xl border border-sage/30 bg-white/60 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Database size={16} className="text-sage" />
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Export CSV</h3>
              </div>
              <p className="text-xs text-ink-soft italic mb-4">Download contact details and membership status for everyone in the database.</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-xl bg-sage-pale/40 p-1 gap-1">
                  {[
                    { id: 'mentors' as const, label: 'Mentors' },
                    { id: 'accounts' as const, label: 'Users & Parents' },
                    { id: 'all' as const, label: 'Everyone' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setExportType(opt.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none ${
                        exportType === opt.id ? 'bg-sage text-white shadow-sm' : 'text-ink-soft hover:text-sage'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleExportCsv} disabled={exporting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sage text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none">
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {exporting ? 'Preparing...' : 'Download CSV'}
                </button>
              </div>
              <p className="text-[10px] text-ink-soft/60 mt-3">Mentors: name, contact, specialty, claim status, membership & billing tier. Users & Parents: email, display name, roles, billing status, account status.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { value: insights.pub.length, label: 'Public mentors', colour: 'bg-sage/10 text-sage' },
                { value: insights.verified.length, label: 'Verified profiles', colour: 'bg-[#e8f4e8] text-[#2d7a2d]' },
                { value: resourceStats.total, label: 'Titled resources', colour: 'bg-[#dce8f5] text-[#2c4a6e]' },
                { value: resourceStats.free, label: 'Free resources', colour: 'bg-[#fdf0d0] text-[#7a4f1a]' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl p-4 text-center ${stat.colour}`}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Profile Status */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Mentor profile status</h3>
              <p className="text-[10px] text-ink-soft/60 mb-2">Public profiles by connected claim status</p>
              {[
                { label: 'Unclaimed', count: insights.unclaimed.length, colour: 'bg-earth-pale text-earth' },
                { label: 'Verified', count: insights.verified.length, colour: 'bg-[#e8f4e8] text-[#2d7a2d]' },
                { label: 'Pending', count: insights.pending.length, colour: 'bg-[#fdf0d0] text-[#7a4f1a]' },
              ].map(item => {
                const maxCount = Math.max(insights.unclaimed.length, insights.verified.length, insights.pending.length, 1);
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={item.label} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-ink-soft w-20 shrink-0">{item.label}</span>
                    <div className="flex-1 h-4 bg-border/30 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.colour.split(' ')[0]}`} style={{ width: `${pct}%`, minWidth: item.count > 0 ? '12px' : '0' }} />
                    </div>
                    <span className="text-xs font-bold text-ink w-8 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Developmental Stage */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Developmental stage</h3>
              <p className="text-[10px] text-ink-soft/60 mb-2">Public mentor coverage by learner stage</p>
              {insights.stageCounts.map(item => {
                const maxCount = Math.max(...insights.stageCounts.map(s => s.count), 1);
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={item.label} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-ink-soft flex-1 truncate">{item.label}</span>
                    <div className="flex-1 h-4 bg-border/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-sage/40" style={{ width: `${pct}%`, minWidth: item.count > 0 ? '12px' : '0' }} />
                    </div>
                    <span className="text-xs font-bold text-ink w-8 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Location Coverage */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Location coverage</h3>
              <p className="text-[10px] text-ink-soft/60 mb-2">Public mentor profiles grouped into regions</p>
              {insights.regionCounts.filter(r => r.count > 0).map(item => {
                const maxCount = Math.max(...insights.regionCounts.map(r => r.count), 1);
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={item.label} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-ink-soft flex-1 truncate">{item.label}</span>
                    <div className="flex-1 h-4 bg-border/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#b0c4d8]" style={{ width: `${pct}%`, minWidth: item.count > 0 ? '12px' : '0' }} />
                    </div>
                    <span className="text-xs font-bold text-ink w-8 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Resource Categories */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Resource categories</h3>
              <p className="text-[10px] text-ink-soft/60 mb-2">Titled resources by connected category</p>
              {Object.entries(resourceStats.byCategory as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, count]) => {
                const vals = Object.values(resourceStats.byCategory as Record<string, number>);
                const maxCount = Math.max(...vals, 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={cat} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-ink-soft flex-1 truncate">{cat}</span>
                    <div className="flex-1 h-4 bg-border/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#d4a84b]/40" style={{ width: `${pct}%`, minWidth: count > 0 ? '12px' : '0' }} />
                    </div>
                    <span className="text-xs font-bold text-ink w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Resource Grades */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Resource grades</h3>
              <p className="text-[10px] text-ink-soft/60 mb-2">Titled resources grouped for comparison</p>
              {Object.entries(resourceStats.byGrade as Record<string, number>).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([grade, count]) => {
                const vals = Object.values(resourceStats.byGrade as Record<string, number>);
                const maxCount = Math.max(...vals, 1);
                const pct = (count / maxCount) * 100;
                return (
                  <div key={grade} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-ink-soft flex-1 truncate">{grade}</span>
                    <div className="flex-1 h-4 bg-border/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-sage/30" style={{ width: `${pct}%`, minWidth: count > 0 ? '12px' : '0' }} />
                    </div>
                    <span className="text-xs font-bold text-ink w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Data Quality Gaps */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft mb-3">Visible data-quality gaps</h3>
              <p className="text-[10px] text-ink-soft/60 mb-2">Blank, invalid, or placeholder values visible in product fields</p>
              {[
                { label: 'Mentors missing specialty', count: insights.missingSpecialty },
                { label: 'Mentors missing developmental stage', count: insights.missingStage },
                { label: 'Mentors missing biography', count: insights.missingBio },
                { label: 'Mentors missing location', count: insights.missingLocation },
                { label: 'Mentors with invalid photo link', count: insights.invalidPhotos },
                { label: 'Resources missing category', count: resourceStats.missingCategory },
                { label: 'Resources missing grade', count: resourceStats.missingGrade },
                { label: 'Resources with invalid link', count: resourceStats.invalidLinks },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-none">
                  <span className="text-xs text-ink-soft">{item.label}</span>
                  <span className={`text-xs font-bold ${item.count > 0 ? 'text-[#c0392b]' : 'text-[#2d7a2d]'}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MENTOR DETAIL MODAL ─── */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[100] overflow-y-auto py-10 px-4 flex justify-center items-start" onClick={() => setSelectedMentor(null)}>
          <div className="bg-white border border-border rounded-[32px] max-w-lg w-full shadow-2xl flex flex-col my-auto" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-border">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-[20px] overflow-hidden border border-border shadow-inner shrink-0 bg-white">
{selectedMentor.status === 'Unclaimed' || selectedMentor.status === 'Pending' || !selectedMentor.subscriptionActive ? (
                       <svg viewBox="0 0 100 100" className="w-full h-full bg-[#fdfaf2] p-1.5 text-sage">
                         <defs><radialGradient id="wg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f7f9f5" /><stop offset="50%" stopColor="#eaf2e3" stopOpacity="0.8" /><stop offset="100%" stopColor="#dcecd0" stopOpacity="0.1" /></radialGradient></defs>
                         <circle cx="50" cy="50" r="40" fill="url(#wg2)" />
                         <path d="M50 30 C40 30 32 38 32 48 C32 60 50 74 50 74 C50 74 68 60 68 48 C68 38 60 30 50 30 Z" fill="none" stroke="#7a8c6e" strokeWidth="2.5" />
                         <circle cx="50" cy="48" r="6" fill="#7a8c6e" />
                       </svg>
                     ) : (
                       <img src={selectedMentor.photoUrl} alt={selectedMentor.name} className="w-full h-full object-cover" />
                     )}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-ink font-semibold">{selectedMentor.name}</h3>
                    <p className="text-xs text-ink-soft mt-1"><MapPin size={10} className="inline" /> {selectedMentor.location} • {selectedMentor.gradeLevel}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedMentor.status === 'Verified' ? (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">Verified Guide</span>
                      ) : selectedMentor.status === 'Pending' ? (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">Pending</span>
                      ) : (
                        <div className="flex gap-2"><span className="px-2 py-0.5 bg-slate-400 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">Unclaimed</span></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleShortlist(selectedMentor.id)}
                    className="p-2 hover:bg-sage-pale/30 rounded-full transition-colors cursor-pointer border-none bg-transparent" title={shortlistedIds.includes(selectedMentor.id) ? 'Remove from shortlist' : 'Add to shortlist'}>
                    {shortlistedIds.includes(selectedMentor.id) ? <BookmarkCheck size={16} className="text-[#d4a84b]" /> : <Bookmark size={16} className="text-ink-soft/40" />}
                  </button>
                  <button onClick={() => { const url = `${window.location.origin}?id=${selectedMentor.id}#id=${selectedMentor.id}`; navigator.clipboard.writeText(url); showSuccess('Profile link copied to clipboard!'); }}
                    className="p-2 hover:bg-sage-pale/30 rounded-full transition-colors cursor-pointer border-none bg-transparent text-ink-soft">
                    <Share2 size={16} />
                  </button>
                  <button onClick={() => setSelectedMentor(null)} className="p-2 hover:bg-sage-pale/30 rounded-full transition-colors cursor-pointer border-none bg-transparent text-ink-soft">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-sage mb-1">About the Guide</h4>
                <p className="text-sm text-ink-soft leading-relaxed font-serif italic">"{selectedMentor.bio}"</p>
                {selectedMentor.credentialSummary && (
                  <p className="text-xs text-ink-soft/60 mt-2">&#127891; {selectedMentor.credentialSummary}</p>
                )}
              </div>
              {selectedMentor.status !== 'Verified' && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/50 rounded-2xl space-y-3">
                  <p className="text-xs text-[#7a4f1a] leading-relaxed">This profile has not yet been claimed by the guide. If this is you, you can claim and edit this profile.</p>
                  <button onClick={() => {
                    const email = prompt(`Enter your email to claim the profile for ${selectedMentor.name}:`);
                    if (email) {
                      import('../services/workflowService').then(({ initiateClaimProfile }) => {
                        initiateClaimProfile(selectedMentor.id, selectedMentor.name, email)
                          .then(() => { alert("Claim request submitted! Administrators will review it."); setSelectedMentor(null); })
                          .catch(() => alert("Claim failed. Please try again."));
                      });
                    }
                  }} className="px-4 py-2 bg-sage text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer border-none">Claim Profile</button>
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-sage mb-2">Resonance Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.specialties.map(spec => (
                    <span key={spec} className="px-3 py-1 bg-white/60 text-sage text-xs font-bold rounded-full border border-border uppercase tracking-tighter">{spec}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
