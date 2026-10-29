import React, { useEffect, useState, useMemo } from 'react';
import { getResources, getArticles, WaldorfResource } from '../services/workflowService';
import { ExternalLink, BookOpen, FileText, Search, File as FileIcon, ChevronLeft, ChevronRight, ChevronDown, X, Filter, Grid, List } from 'lucide-react';
import { ArticleViewer } from './ArticleViewer';

type ResourceTab = 'all' | 'head' | 'heart' | 'hands' | 'eurythmy' | 'music-singing' | 'storytelling-puppetry' | 'festivals-celebrations' | 'form-drawing' | 'beekeeping' | 'gardening-nature' | 'cooking-baking' | 'homeschool-curricula' | 'coops-playgroups' | 'main-lesson-guides' | 'natural-toys-dolls' | 'books-reading-lists' | 'felting-wool' | 'beeswax-candles' | 'sewing-doll-making' | 'movement-games' | 'anthroposophic-medicine' | 'art-music-therapy' | 'teacher-training' | 'camps-retreats' | 'conferences-talks' | 'biodynamic-farms' | 'rhythm-parenting' | 'seasonal-nature-tables' | 'lantern-making' | 'puppet-theatres' | 'block-crayons-supplies' | 'watercolor-paints' | 'community-groups' | 'festival-recipes' | 'hospitals' | 'articles' | 'publishers' | 'costumes';

interface ResourceCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  categories: string[];
  isExternalLink?: boolean;
  externalUrl?: string;
}

const WORLD_LISTS: ResourceCategory[] = [
  { id: 'waldorf-world-list', label: 'Waldorf World List', icon: '📋', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['World Lists', 'Directories'], externalUrl: 'https://www.freunde-waldorf.de/en/waldorf-worldwide/waldorf-education/waldorf-world-list/', isExternalLink: true },
  { id: 'iaswece-world-list', label: 'IASWECE World List', icon: '🌍', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['World Lists', 'Directories'], externalUrl: 'https://iaswece.org/world-list/', isExternalLink: true },
];

// HEAD PILLAR - Thinking & Knowledge
const HEAD_SUB_CATEGORIES: ResourceCategory[] = [
  { id: 'main-lesson-guides', label: 'Main-Lesson Guides', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Main Lesson', 'Guides', 'Curriculum', 'Teaching'] },
  { id: 'form-drawing', label: 'Form Drawing', icon: '🎨', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Form Drawing', 'Drawing', 'Art'] },
  { id: 'homeschool-curricula', label: 'Homeschool Curricula', icon: '🏠', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Homeschooling', 'Curriculum', 'Home Education'] },
  { id: 'books-reading-lists', label: 'Books & Reading Lists', icon: '📖', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Books', 'Reading Lists', 'Literature', 'Recommendations'] },
  { id: 'teacher-training', label: 'Teacher Training', icon: '🎓', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Teacher Training', 'Education', 'Waldorf Training'] },
  { id: 'conferences-talks', label: 'Conferences & Talks', icon: '🎤', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Conferences', 'Talks', 'Workshops', 'Events'] },
  { id: 'watercolor-paints', label: 'Watercolor & Paints', icon: '🎨', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Watercolor', 'Paints', 'Art Supplies', 'Wet-on-Wet'] },
  { id: 'community-groups', label: 'Community Groups', icon: '👥', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Community', 'Groups', 'Social', 'Networking'] },
];

// HEART PILLAR - Feeling & Soul Life
const HEART_SUB_CATEGORIES: ResourceCategory[] = [
  { id: 'eurythmy', label: 'Eurythmy', icon: '💃', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Eurythmy', 'Movement'] },
  { id: 'music-singing', label: 'Music & Singing', icon: '🎵', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Music', 'Singing', 'Instruments', 'Pentatonic'] },
  { id: 'storytelling-puppetry', label: 'Storytelling & Puppetry', icon: '📖', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Storytelling', 'Puppetry', 'Stories', 'Puppets'] },
  { id: 'festivals-celebrations', label: 'Festivals & Celebrations', icon: '🌸', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Festivals', 'Celebrations', 'Seasonal', 'Holidays'] },
  { id: 'cooking-baking', label: 'Cooking & Baking', icon: '🍞', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Cooking', 'Baking', 'Recipes', 'Food'] },
  { id: 'beeswax-candles', label: 'Beeswax & Candles', icon: '🕯️', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Beeswax', 'Candles', 'Candle Making'] },
  { id: 'movement-games', label: 'Movement & Games', icon: '🏃', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Movement', 'Games', 'Physical Education', 'Play'] },
  { id: 'art-music-therapy', label: 'Art & Music Therapy', icon: '🎨', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Art Therapy', 'Music Therapy', 'Therapeutic Arts'] },
  { id: 'rhythm-parenting', label: 'Rhythm & Parenting', icon: '🌿', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Rhythm', 'Parenting', 'Family', 'Daily Rhythm'] },
  { id: 'seasonal-nature-tables', label: 'Seasonal Nature Tables', icon: '🍂', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Nature Tables', 'Seasonal', 'Nature', 'Display'] },
  { id: 'lantern-making', label: 'Lantern-Making', icon: '🏮', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Lantern Making', 'Crafts', 'Festivals', 'Martinmas'] },
  { id: 'puppet-theatres', label: 'Puppet Theatres', icon: '🎭', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Puppet Theatre', 'Puppetry', 'Theatre', 'Performance'] },
  { id: 'festival-recipes', label: 'Festival Recipes', icon: '🍎', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Festival Recipes', 'Recipes', 'Cooking', 'Seasonal Food'] },
];

// HANDS PILLAR - Doing & Making
const HANDS_SUB_CATEGORIES: ResourceCategory[] = [
  { id: 'beekeeping', label: 'Beekeeping', icon: '🐝', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Beekeeping', 'Bees', 'Honey'] },
  { id: 'gardening-nature', label: 'Gardening & Nature', icon: '🌱', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Gardening', 'Nature', 'Plants', 'Outdoor'] },
  { id: 'coops-playgroups', label: 'Co-ops & Playgroups', icon: '🤝', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Co-ops', 'Playgroups', 'Community', 'Social'] },
  { id: 'natural-toys-dolls', label: 'Natural Toys & Dolls', icon: '🧸', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Natural Toys', 'Dolls', 'Toys', 'Wooden Toys'] },
  { id: 'felting-wool', label: 'Felting & Wool', icon: '🐑', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Felting', 'Wool', 'Fiber Arts', 'Handwork'] },
  { id: 'sewing-doll-making', label: 'Sewing & Doll-Making', icon: '🪡', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Sewing', 'Doll Making', 'Handwork', 'Crafts'] },
  { id: 'camps-retreats', label: 'Camps & Retreats', icon: '🏕️', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Camps', 'Retreats', 'Outdoor', 'Summer'] },
  { id: 'biodynamic-farms', label: 'Biodynamic Farms', icon: '🌾', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Biodynamic', 'Farms', 'Agriculture', 'Farming'] },
  { id: 'block-crayons-supplies', label: 'Block Crayons & Supplies', icon: '🖍️', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Block Crayons', 'Supplies', 'Art Materials', 'Stockmar'] },
];

const ALL_SUB_CATEGORIES = [...HEAD_SUB_CATEGORIES, ...HEART_SUB_CATEGORIES, ...HANDS_SUB_CATEGORIES];

const ANTHROPOSOPHIC_MEDICINE_CATEGORIES: ResourceCategory[] = [
  { id: 'anthro-hospitals', label: 'Hospitals', icon: '🏥', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Anthroposophic Hospitals', 'Hospitals'] },
  { id: 'anthro-doctors', label: 'Doctors', icon: '👨‍⚕️', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Anthroposophic Doctors', 'Physicians', 'Practitioners'] },
  { id: 'anthro-pharmacies', label: 'Pharmacies', icon: '💊', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Anthroposophic Pharmacies', 'Remedies', 'Medicines'] },
  { id: 'anthro-dentists', label: 'Dentists', icon: '🦷', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Anthroposophic Dentists', 'Dental'] },
  { id: 'anthro-osteopaths', label: 'Osteopaths', icon: '🦴', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Osteopaths', 'Osteopathy'] },
  { id: 'anthro-therapies', label: 'Therapies', icon: '🌿', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Therapies', 'Anthroposophic Therapy', 'Healing'] },
];

const PUBLISHER_CATEGORIES: ResourceCategory[] = [
  { id: 'anthroposophic-press', label: 'Anthroposophic Press / Steiner Books', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://steinerbooks.org', isExternalLink: true },
  { id: 'hawthorn-press', label: 'Hawthorn Press', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://www.hawthornpress.com', isExternalLink: true },
  { id: 'waldorf-publications', label: 'Waldorf Publications (AWSNA)', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://www.waldorfpublications.org/', isExternalLink: true },
  { id: 'wecan-publications', label: 'WECAN Publications', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://www.waldorfpublications.org/collections/wecan-publications', isExternalLink: true },
  { id: 'wynstones-press', label: 'Wynstones Press', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://www.wynstonespress.com/', isExternalLink: true },
  { id: 'rudolf-steiner-press', label: 'Rudolf Steiner Press', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://www.rudolfsteinerpress.com/', isExternalLink: true },
  { id: 'lindisfarne-books', label: 'Lindisfarne Books (SteinerBooks imprint)', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://steinerbooks.org/collections/lindisfarne', isExternalLink: true },
  { id: 'michaelmas-press', label: 'Michaelmas Press', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://michaelmaspress.com/', isExternalLink: true },
  { id: 'jamie-york-press', label: 'Jamie York Press', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://www.jamieyorkpress.com/', isExternalLink: true },
  { id: 'rudolf-steiner-archive', label: 'Rudolf Steiner Archive (rsarchive.org)', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://rsarchive.org', isExternalLink: true },
  { id: 'editora-antroposofica', label: 'Editora Antroposófica (Brazil)', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'http://editora.com.br', isExternalLink: true },
  { id: 'antroposofica-ar', label: 'Editora Antroposófica Argentina', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'http://antroposofica.com.ar', isExternalLink: true },
  { id: 'editorial-rudolf-steiner', label: 'Editorial Rudolf Steiner (Spain/LatAm)', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://editorialrudolfsteiner.com', isExternalLink: true },
  { id: 'paud-edamasc', label: 'Paudé Damac (Spain/Catalan)', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'], externalUrl: 'https://paudedamasc.com', isExternalLink: true },
];

const COSTUME_CATEGORIES: ResourceCategory[] = [
  { id: 'fairy-finery', label: 'Fairy Finery', icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://www.fairyfinery.com/', isExternalLink: true },
  { id: 'bella-luna-toys', label: 'Bella Luna Toys — Dress-Up & Costumes', icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://www.bellalunatoys.com/collections/dress-ups-costumes', isExternalLink: true },
  { id: 'jack-be-nimble-kids', label: 'Jack Be Nimble Kids', icon: '👗', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://jackbenimblekids.com/collections/best-sellers', isExternalLink: true },
  { id: 'sarahs-silks', label: "Sarah's Silks — Dress-Up Costumes", icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://www.sarahssilks.com/collections/dress-up-costumes', isExternalLink: true },
  { id: 'sofee-lenee', label: 'Sofee & Lenee', icon: '👗', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'http://www.sofeeandlenee.com/', isExternalLink: true },
  { id: 'waldorf-shop-costumes', label: 'The Waldorf Shop — Clothing & Costumes', icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://waldorfshop.net/collections/clothing-costumes', isExternalLink: true },
  { id: 'poems-for-buttercup', label: 'Poems for Buttercup — Celebration Crowns', icon: '👑', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://poemsforbuttercup-co-nz.myshopify.com/collections/ready-to-ship-crowns', isExternalLink: true },
  { id: 'tree-hollow-toys', label: 'Tree Hollow Toys — Dress-Up', icon: '🎭', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://treehollowtoys.com/collections/dress-up', isExternalLink: true },
  { id: 'waldorfshop-europe', label: 'Waldorfshop Europe — Dress-Up & Make-Up', icon: '🎭', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'], externalUrl: 'https://www.waldorfshop.eu/en/toys-games/role-toys/dress-up-make-up', isExternalLink: true },
];

const SPECIAL_TABS: { tab: ResourceTab; label: string; shortLabel: string; icon: string; color: string; categories: ResourceCategory[]; worldLists: ResourceCategory[] }[] = [
  { tab: 'hospitals', label: 'Anthroposophic Medicine', shortLabel: 'Anthro Medicine', icon: '🏥', color: '#2c4a6e', categories: ANTHROPOSOPHIC_MEDICINE_CATEGORIES, worldLists: [] },
  { tab: 'publishers', label: 'Publishers', shortLabel: 'Publishers', icon: '📚', color: '#2c4a6e', categories: PUBLISHER_CATEGORIES, worldLists: [] },
  { tab: 'costumes', label: 'Costumes', shortLabel: 'Costumes', icon: '🎭', color: '#7a4f1a', categories: COSTUME_CATEGORIES, worldLists: [] },
  { tab: 'articles', label: 'Articles', shortLabel: 'Articles', icon: '📄', color: '#2c4a6e', categories: [], worldLists: [] },
];

const ALL_TABS = [
  { tab: 'all' as ResourceTab, label: 'All Resources', shortLabel: 'All', icon: '📦', color: '#6b8e5a', categories: ALL_SUB_CATEGORIES, worldLists: WORLD_LISTS },
  { tab: 'head' as ResourceTab, label: 'Head — Thinking & Knowledge', shortLabel: 'Head', icon: '☀️', color: '#2c4a6e', categories: HEAD_SUB_CATEGORIES, worldLists: [] },
  { tab: 'heart' as ResourceTab, label: 'Heart — Feeling & Soul Life', shortLabel: 'Heart', icon: '💛', color: '#7a4f1a', categories: HEART_SUB_CATEGORIES, worldLists: [] },
  { tab: 'hands' as ResourceTab, label: 'Hands — Doing & Making', shortLabel: 'Hands', icon: '🙌', color: '#3a6b3e', categories: HANDS_SUB_CATEGORIES, worldLists: [] },
  ...ALL_SUB_CATEGORIES.map(cat => ({ tab: cat.id as ResourceTab, label: cat.label, shortLabel: cat.label, icon: cat.icon, color: cat.color, categories: [cat], worldLists: [] })),
  ...SPECIAL_TABS,
];

export function ResourcesPanel({ onNavigate }: { onNavigate?: (view: 'directory' | 'documents', data?: any) => void }) {
  const [activeTab, setActiveTab] = useState<ResourceTab>('all');
  const [resources, setResources] = useState<WaldorfResource[]>([]);
  const [articles, setArticles] = useState<WaldorfResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedTabs, setExpandedTabs] = useState<Record<ResourceTab, boolean>>(
    Object.fromEntries(ALL_TABS.map(t => [t.tab, false])) as Record<ResourceTab, boolean>
  );
  const [viewingArticle, setViewingArticle] = useState<WaldorfResource | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, art] = await Promise.all([getResources(), getArticles()]);
        setResources(res);
        setArticles(art);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (viewingArticle) {
    if (onNavigate) {
      onNavigate('documents', { filePath: viewingArticle.fileLink, title: viewingArticle.title });
    }
    return (
      React.createElement(ArticleViewer, {
        filePath: viewingArticle.fileLink,
        title: viewingArticle.title,
        onBack: () => setViewingArticle(null)
      })
    );
  }

  const allItems = useMemo(() => [...resources, ...articles], [resources, articles]);

  // Collect all unique tags from resources for filter pills
  const allAvailableTags = useMemo(() => {
    const tags = new Set<string>();
    allItems.forEach(item => {
      (item.topicTags || []).forEach(t => tags.add(t));
      (item.searchAliases || []).forEach(a => tags.add(a));
    });
    return Array.from(tags).sort();
  }, [allItems]);

  const categoryMap = useMemo(() => {
    const map: Record<string, ResourceCategory> = {};
    ALL_TABS.forEach(group => {
      group.categories.forEach(cat => {
        map[cat.id] = cat;
      });
      group.worldLists?.forEach(wl => {
        map[wl.id] = wl;
      });
    });
    return map;
  }, []);

  const searchFilteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const s = searchQuery.toLowerCase().trim();
    const synonyms: Record<string, string[]> = {
      doctor: ['dr', 'md', 'doktor', 'arzt', 'medico', 'medecin', 'physician', 'health'],
      math: ['mathematics', 'maths', 'mathematik', 'arithmetic', 'geometry'],
      music: ['singing', 'song', 'musik', 'pentatonic', 'flute', 'recorder', 'piano', 'guitar', 'violin', 'lyre', 'instrument'],
      handwork: ['craft', 'knitting', 'crochet', 'sewing', 'handarbeit', 'needlework'],
      painting: ['watercolor', 'watercolour', 'malen', 'art', 'drawing'],
      grade: ['class', 'level', 'standard', 'stufe', 'klasse'],
      verses: ['poem', 'verse', 'gedicht', 'rhyme', 'saying'],
      woodwork: ['wood', 'woodworking', 'whittling', 'carving', 'holz', 'tools', 'tool'],
      dolls: ['doll', 'puppet', 'marionette', 'puppe', 'puppetry'],
      tools: ['woodwork', 'carving', 'whittling', 'tools', 'tool', 'woodworking'],
      '6th grade': ['grade 6', 'class 6', 'sixth grade', 'sixth class'],
      'grade 6': ['6th grade', 'class 6', 'sixth grade', 'sixth class'],
    };
    return allItems.filter(item => {
      let found = item.title.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s) ||
        (item.description || '').toLowerCase().includes(s) ||
        (item.topicTags || []).some(t => t.toLowerCase().includes(s)) ||
        (item.searchAliases || []).some(a => a.toLowerCase().includes(s));
      if (!found) {
        for (const [word, syns] of Object.entries(synonyms)) {
          if (s.includes(word) || word.includes(s)) {
            found = syns.some(syn =>
              item.title.toLowerCase().includes(syn) ||
              item.category.toLowerCase().includes(syn) ||
              (item.description || '').toLowerCase().includes(syn) ||
              (item.topicTags || []).some(t => t.toLowerCase().includes(syn)) ||
              (item.searchAliases || []).some(a => a.toLowerCase().includes(syn))
            );
            if (found) break;
          }
          if (syns.some(syn => s.includes(syn) || syn.includes(s))) {
            found = item.title.toLowerCase().includes(word) ||
              item.category.toLowerCase().includes(word) ||
              (item.topicTags || []).some(t => t.toLowerCase().includes(word)) ||
              (item.searchAliases || []).some(a => a.toLowerCase().includes(word));
            if (found) break;
          }
        }
      }
      if (!found) {
        const words = s.split(' ').filter(Boolean);
        found = words.every(w => item.title.toLowerCase().includes(w) || item.category.toLowerCase().includes(w));
      }
      return found;
    });
  }, [allItems, searchQuery]);

  const getItemsForCategory = (categoryId: string) => {
    const cat = categoryMap[categoryId];
    if (!cat || cat.isExternalLink) return [];
    return searchFilteredItems.filter(item => {
      const itemCats = [item.category, ...(item.topicTags || [])].map(c => c.toLowerCase());
      return itemCats.some(c => cat.categories.some(cc => cc.toLowerCase() === c));
    });
  };

  const getGroupForCategory = (categoryId: string) => {
    for (const group of ALL_TABS) {
      if (group.categories.some(c => c.id === categoryId)) return group;
      if (group.worldLists?.some(w => w.id === categoryId)) return group;
    }
    return null;
  };

  const handleCategoryClick = (categoryId: string) => {
    const cat = categoryMap[categoryId];
    if (cat?.isExternalLink && cat.externalUrl) {
      window.open(cat.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
      const group = getGroupForCategory(categoryId);
      if (group) {
        setActiveTab(group.tab);
      }
    }
    setPage(0);
  };

  const currentTabData = ALL_TABS.find(g => g.tab === activeTab);
  const currentCategories = currentTabData?.categories || [];
  const currentWorldLists = currentTabData?.worldLists || [];
  
  // Build display items with category and tag filtering
  let displayItems: WaldorfResource[] = [];
  if (activeTab === 'articles') {
    displayItems = articles;
  } else if (selectedCategoryId) {
    displayItems = getItemsForCategory(selectedCategoryId);
  } else {
    // Get all category tags from current tab's categories
    const allCategoryTags = currentCategories.flatMap(c => c.categories.map(cc => cc.toLowerCase()));
    displayItems = searchFilteredItems.filter(item => {
      const itemCats = [item.category, ...(item.topicTags || [])].map(c => c.toLowerCase());
      return itemCats.some(c => allCategoryTags.includes(c));
    });
  }
  
  // Apply tag filter (faceted filtering) - strict filter on selected tags
  if (selectedTags.length > 0) {
    const selectedTagsLower = selectedTags.map(t => t.toLowerCase());
    displayItems = displayItems.filter(item => {
      const itemTags = [...(item.topicTags || []), ...(item.searchAliases || [])].map(t => t.toLowerCase());
      return selectedTagsLower.every(tag => itemTags.includes(tag));
    });
  }

  const paginatedItems = displayItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(displayItems.length / PAGE_SIZE);

  // Filter bar component
  const filterBar = (selectedTags.length > 0 || allAvailableTags.length > 0)
    ? React.createElement('div', { className: 'mb-4' },
        selectedTags.length > 0 && React.createElement('div', { className: 'flex flex-wrap gap-2 mb-2' },
          React.createElement('span', { className: 'text-xs font-medium text-ink-soft/60 mr-2 self-center' }, 'Active filters:'),
          selectedTags.map((tag, idx) => React.createElement('span', {
            key: idx,
            className: 'inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-sage text-white'
          },
            tag,
            React.createElement('button', {
              onClick: () => setSelectedTags(prev => prev.filter(t => t !== tag)),
              className: 'ml-1 p-0.5 rounded-full hover:bg-white/30 transition-colors',
              'aria-label': `Remove filter: ${tag}`
            }, React.createElement(X, { size: 10 }))
          )),
          React.createElement('button', {
            onClick: () => setSelectedTags([]),
            className: 'ml-2 px-3 py-1 text-xs font-medium text-ink-soft/60 hover:text-sage transition-colors'
          }, 'Clear all')
        ),
        allAvailableTags.length > 0 && selectedTags.length === 0 && React.createElement('div', { className: 'flex flex-wrap gap-1.5' },
          React.createElement('span', { className: 'text-xs font-medium text-ink-soft/60 mr-2 self-center' }, 'Filter by tag:'),
          allAvailableTags.slice(0, 12).map((tag, idx) => React.createElement('button', {
            key: idx,
            onClick: () => setSelectedTags(prev => [...prev, tag]),
            className: 'px-3 py-1 text-xs font-medium rounded-full bg-white/60 border border-border text-ink hover:bg-sage-pale hover:border-sage hover:text-sage transition-all whitespace-nowrap'
          }, tag))
        )
      )
    : null;

  const handleItemClick = (item: WaldorfResource) => {
    if (item.contentType === 'article' && item.fileLink.endsWith('.html')) {
      if (onNavigate) {
        onNavigate('documents', { filePath: item.fileLink, title: item.title });
      } else {
        setViewingArticle(item);
      }
    } else if (item.contentType === 'pdf' || item.fileLink.endsWith('.pdf')) {
      window.open(item.fileLink, '_blank');
    } else {
      window.open(item.fileLink, '_blank');
    }
  };

  const renderResultsView = () => {
    if (displayItems.length === 0) {
      return React.createElement('div', { className: 'py-20 text-center text-ink-soft italic font-serif' },
        searchQuery.trim() 
          ? 'No resources match your search. Try different keywords.'
          : selectedCategoryId
            ? 'No resources in this category yet.'
            : 'No resources available in this section.'
      );
    }

  // Helper to get matched tags for display
  const getMatchedTags = (item: WaldorfResource) => {
    const query = searchQuery.toLowerCase().trim();
    const allTags = [...(item.topicTags || []), ...(item.searchAliases || [])];
    if (!query) return allTags.slice(0, 4); // Show first 4 tags when no search
    return allTags.filter(tag => tag.toLowerCase().includes(query)).slice(0, 4);
  };

return React.createElement('div', { className: 'space-y-3' },
      paginatedItems.map((item, index) => {
        const catMeta = categoryMap[item.category] || { bgColor: '#f5f5f5', color: '#666', icon: '' };
        const matchedTags = getMatchedTags(item);
        return React.createElement('div', {
          key: item.id,
          className: 'group bg-white/60 border border-border rounded-xl p-4 hover:bg-white/80 hover:shadow-sm transition-all cursor-pointer',
          onClick: () => handleItemClick(item)
        },
          React.createElement('div', { className: 'flex items-start gap-4' },
            React.createElement('div', { 
              className: 'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              style: { backgroundColor: catMeta.bgColor }
            },
              React.createElement(catMeta.icon ? 'span' : BookOpen, { 
                className: 'text-lg',
                style: { color: catMeta.color },
                children: catMeta.icon || ''
              })
            ),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('div', { className: 'flex items-center justify-between gap-2 mb-1' },
                React.createElement('h4', { className: 'font-semibold text-ink font-serif text-base line-clamp-2' }, item.title),
                React.createElement('span', { className: 'hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-pale text-sage shrink-0' }, item.category)
              ),
              item.description && React.createElement('p', { className: 'text-sm text-ink-soft/70 line-clamp-2 mb-2' }, item.description),
              // Tag badges
              matchedTags.length > 0 && React.createElement('div', { className: 'flex flex-wrap gap-1.5 mb-2' },
                matchedTags.map((tag, idx) => React.createElement('span', {
                  key: idx,
                  className: 'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-sage-pale/80 text-sage border border-sage/20',
                  title: item.topicTags?.includes(tag) ? 'Topic tag' : 'Search alias'
                }, tag))
              ),
              React.createElement('div', { className: 'flex items-center gap-3 text-[11px] text-ink-soft/60 flex-wrap' },
                item.grade && React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(BookOpen, { size: 10 }), item.grade),
                item.language && item.language !== 'English' && React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(FileText, { size: 10 }), item.language),
                React.createElement('span', { className: 'flex items-center gap-1' }, React.createElement(FileIcon, { size: 10 }), item.contentType === 'pdf' ? 'PDF' : item.contentType === 'article' ? 'Article' : 'Resource')
              )
            ),
            React.createElement(ExternalLink, { className: 'text-ink-soft/40 group-hover:text-sage transition-colors shrink-0', size: 18 })
          )
        );
      })
    );
  };

  const renderCategoryGrid = (categories: ResourceCategory[], tabKey: ResourceTab) => {
    const categoriesWithResults = categories.filter(cat => {
      const count = getItemsForCategory(cat.id).length;
      return count > 0 || !searchQuery.trim();
    });
    
    const isExpanded = expandedTabs[tabKey];
    const tabData = ALL_TABS.find(t => t.tab === tabKey);

    return React.createElement('div', { className: 'mb-4' },
      React.createElement('button', {
        onClick: () => setExpandedTabs(prev => ({ ...prev, [tabKey]: !prev[tabKey] })),
        className: 'w-full flex items-center justify-between p-3 bg-white/60 border border-border rounded-xl transition-all cursor-pointer hover:bg-white/80'
      },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('span', { className: 'text-lg' }, tabData?.icon || ''),
          React.createElement('span', { className: 'font-serif text-lg text-ink font-semibold flex-1' }, tabData?.label || ''),
          React.createElement('span', { className: 'text-xs text-ink-soft bg-white/50 px-2 py-0.5 rounded-full' },
            categoriesWithResults.reduce((sum, cat) => sum + getItemsForCategory(cat.id).length, 0) + ' resources'
          )
        ),
        React.createElement(ChevronDown, { className: 'text-ink-soft transition-transform ' + (isExpanded ? 'rotate-180' : ''), size: 20 })
      ),
      
      isExpanded && React.createElement('div', { className: 'mt-2 space-y-2' },
        categoriesWithResults.map(cat => {
          const count = getItemsForCategory(cat.id).length;
          const isSelected = selectedCategoryId === cat.id;
          
          return React.createElement('button', {
            key: cat.id,
            onClick: () => handleCategoryClick(cat.id),
            className: 'w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all cursor-pointer ' +
              (isSelected 
                ? 'border-2 shadow-sm'
                : 'bg-white/60 border border-border hover:bg-white/80 hover:shadow-sm'),
            style: isSelected ? { backgroundColor: cat.color + '10', borderColor: cat.color, color: cat.color } : undefined
          },
            React.createElement('div', { className: 'flex items-center gap-3 flex-1 min-w-0' },
              React.createElement('span', { className: 'text-lg shrink-0' }, cat.icon),
              React.createElement('div', { className: 'flex-1 min-w-0 text-left' },
                React.createElement('p', { className: 'font-medium text-sm', style: { color: isSelected ? cat.color : 'inherit' } }, cat.label),
                React.createElement('p', { className: 'text-[10px] text-ink-soft/60' }, count + ' resource' + (count !== 1 ? 's' : ''))
              )
            ),
            React.createElement('span', { className: 'text-xs font-bold px-2 py-0.5 rounded-full', style: isSelected ? { backgroundColor: cat.color, color: 'white' } : { backgroundColor: 'rgba(255,255,255,0.5)', color: 'inherit' } },
              count
            )
          );
        })
      )
    );
  };

  const renderWorldLists = (worldLists: ResourceCategory[]) => {
    if (worldLists.length === 0) return null;
    
    return React.createElement('div', { className: 'mt-4 pt-4 border-t border-border/50' },
      React.createElement('p', { className: 'text-xs font-bold uppercase tracking-wider text-ink-soft/60 mb-3' }, 'World Lists'),
      React.createElement('div', { className: 'flex flex-wrap gap-3' },
        worldLists.map(wl => 
          React.createElement('a', {
            key: wl.id,
            href: wl.externalUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap bg-white/60 border border-border text-ink hover:bg-white/80 hover:shadow-sm'
          },
            React.createElement('span', { className: 'text-lg shrink-0' }, wl.icon),
            React.createElement('span', { className: 'font-medium text-sm' }, wl.label),
            React.createElement(ExternalLink, { className: 'text-xs text-ink-soft/50', size: 12 })
          )
        )
      )
    );
  };

return React.createElement('div', { className: 'flex flex-col bg-white/10 h-full' },
    
    React.createElement('section', { className: 'bg-sage-strong py-6' },
      React.createElement('div', { className: 'max-w-2xl mx-auto px-6' },
        React.createElement('div', { className: 'relative' },
          React.createElement(Search, { size: 14, className: 'absolute left-3 top-1/2 -translate-y-1/2 text-white/60' }),
          React.createElement('input', { 
            type: 'text', 
            placeholder: 'Search Wiki — Eurythmy, Festivals, Beekeeping, Handwork...',
            value: searchQuery, 
            onChange: e => setSearchQuery(e.target.value),
            className: 'w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-gold focus:bg-white/15 transition-colors text-white placeholder-white/50 text-base' 
          })
        )
      )
    ),

    React.createElement('div', { className: 'p-4 sm:p-5 border-b border-border bg-white/40 shrink-0' },
      React.createElement('div', { className: 'flex items-start justify-between gap-4 mb-3' },
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-2xl font-serif text-ink mb-0.5 font-semibold' }, 'Waldorf Resources'),
          React.createElement('p', { className: 'text-xs sm:text-sm text-ink-soft italic' }, 'Curated links, guides, articles and tools — organized by category')
        ),
      ),

      React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
        ALL_TABS.map(tab => 
          React.createElement('button', {
            key: tab.tab,
            onClick: () => { setActiveTab(tab.tab); setSelectedCategoryId(null); },
            className: 'flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap text-sm font-medium ' +
              (activeTab === tab.tab
                ? 'text-white shadow-sm'
                : 'bg-white/60 border border-border text-ink hover:bg-white/80 hover:shadow-sm'),
            style: activeTab === tab.tab ? { backgroundColor: tab.color } : undefined
          },
            React.createElement('span', { className: 'text-lg' }, tab.icon),
            React.createElement('span', null, tab.shortLabel)
          )
        )
      ),

      filterBar,
    ),

    React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 sm:p-5' },
      loading ? (
        React.createElement('div', { className: 'flex flex-col items-center justify-center py-20 text-sage italic font-serif' }, 'Loading resources...')
      ) : (
        React.createElement(React.Fragment, null,
          (() => {
            const currentTabData = ALL_TABS.find(g => g.tab === activeTab);
            const currentCategories = currentTabData?.categories || [];
            const currentWorldLists = currentTabData?.worldLists || [];
            
            return React.createElement(React.Fragment, null,
              renderCategoryGrid(currentCategories, activeTab),
              renderWorldLists(currentWorldLists),
              renderResultsView(),
            );
          })(),
          
          React.createElement('div', { className: 'flex flex-col items-center gap-3 mt-4 pt-4 border-t border-border' },
            React.createElement('div', { className: 'flex items-center gap-3' },
              React.createElement('button', {
                onClick: () => setPage(p => Math.max(0, p - 1)),
                disabled: page === 0,
                className: 'rounded-full px-4 py-1.5 bg-white border border-border text-sm font-medium hover:bg-sage-pale transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer'
              },
                React.createElement(ChevronLeft, { size: 14 }), ' Previous'
              ),
              React.createElement('span', { className: 'text-sm text-ink-soft font-medium' }, 'Page ' + (page + 1) + ' of ' + totalPages),
              React.createElement('button', {
                onClick: () => setPage(p => Math.min(totalPages - 1, p + 1)),
                disabled: page >= totalPages - 1,
                className: 'rounded-full px-4 py-1.5 bg-white border border-border text-sm font-medium hover:bg-sage-pale transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer'
              },
                'Next ', React.createElement(ChevronRight, { size: 14 })
              )
            ),
            React.createElement('p', { className: 'text-xs text-ink-soft/70' },
              'Showing ' + (page * PAGE_SIZE + 1) + '-' + Math.min((page + 1) * PAGE_SIZE, displayItems.length) + ' of ' + displayItems.length + ' resources'
            )
          )
        )
      )
    )
  );
}

function getLinkLabel(item: WaldorfResource) {
  if (item.contentType === 'article' && item.fileLink.endsWith('.html')) return 'Read';
  if (item.contentType === 'pdf' || item.fileLink.endsWith('.pdf')) return 'Download PDF';
  return 'Open Link';
}