import React, { useEffect, useState, useMemo } from 'react';
import { getResources, getArticles, WaldorfResource } from '../services/workflowService';
import { ExternalLink, BookOpen, FileText, Search, File as FileIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { ArticleViewer } from './ArticleViewer';

type ResourceTab = 'head' | 'heart' | 'hands' | 'hospitals' | 'articles' | 'publishers' | 'costumes';

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

const WORLD_LISTS = [
  { id: 'waldorf-world-list', label: 'Waldorf World List', icon: '📋', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['World Lists', 'Directories'], externalUrl: 'https://www.freunde-waldorf.de/en/waldorf-worldwide/waldorf-education/waldorf-world-list/', isExternalLink: true },
  { id: 'iaswece-world-list', label: 'IASWECE World List', icon: '🌍', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['World Lists', 'Directories'], externalUrl: 'https://iaswece.org/world-list/', isExternalLink: true },
];

const HEAD_CATEGORIES: ResourceCategory[] = [
  { id: 'adult-ed', label: 'Adult Education & Training', icon: '🎓', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Adult Education', 'Training'] },
  { id: 'mustread', label: 'Must-Read Books', icon: '📖', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Must-Read Books', 'Books', 'Publications'] },
  { id: 'books', label: 'Books & Publications', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Books', 'Publications', 'Reading'] },
  { id: 'reading', label: "Children's Reading Guide", icon: '📖', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Reading', 'Children'] },
  { id: 'schools', label: 'Schools & Kindergartens', icon: '🏫', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Schools', 'Kindergartens', 'Education'] },
  { id: 'homeschool', label: 'Homeschooling', icon: '🏠', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Homeschooling', 'Home Education'] },
  { id: 'temperaments', label: 'Four Temperaments', icon: '⚖️', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Temperaments', 'Psychology'] },
  { id: 'lifecycle', label: 'Lifecycle & Development', icon: '🌱', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Development', 'Lifecycle', 'Child Development'] },
  { id: 'calendar', label: 'Calendar of the Soul', icon: '📅', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Calendar', 'Soul', 'Verses'] },
  { id: 'health', label: 'Health & Doctors', icon: '🏥', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Health', 'Doctors', 'Medical'] },
  { id: 'nutrition', label: 'Nutrition & Food', icon: '🌾', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Nutrition', 'Food', 'Diet'] },
  { id: 'planetary', label: 'Planetary Week', icon: '🪐', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Planetary', 'Week', 'Rhythms'] },
  { id: 'curative', label: 'Special Needs & Curative', icon: '💚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Special Needs', 'Curative', 'Therapy'] },
  { id: 'germany', label: 'Germany', icon: '🇩🇪', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Germany', 'German'] },
  { id: 'global', label: 'Global — S. America & Africa', icon: '🌍', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Global', 'South America', 'Africa', 'International'] },
];

const HEART_CATEGORIES: ResourceCategory[] = [
  { id: 'seasons', label: 'Seasons & Festivals', icon: '🌸', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Seasons', 'Festivals', 'Celebrations'] },
  { id: 'verses', label: 'Verses', icon: '📜', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Verses', 'Poetry', 'Poems'] },
  { id: 'fingergames', label: 'Finger Games', icon: '👋', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Finger Games', 'Rhymes', 'Hand Games'] },
  { id: 'songs', label: 'Songs', icon: '🎵', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Songs', 'Singing', 'Music'] },
  { id: 'music', label: 'Music & Instruments', icon: '🎶', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Music', 'Instruments', 'Piano', 'Pentatonic', 'Flute'] },
  { id: 'dolls', label: 'Dolls & Dollhouses', icon: '🪆', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Dolls', 'Dollhouses', 'Puppets', 'Toys'] },
  { id: 'chalkboard', label: 'Chalkboard Art', icon: '🎨', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Chalkboard Art', 'Drawing', 'Art'] },
  { id: 'camps', label: 'Summer Camps', icon: '🏕️', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Summer Camps', 'Camps', 'Outdoor'] },
  { id: 'community', label: 'Community & Makers', icon: '🤝', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Community', 'Makers', 'Crafts'] },
];

const HANDS_CATEGORIES: ResourceCategory[] = [
  { id: 'baby', label: 'Baby Care', icon: '👶', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Baby Care', 'Infant', 'Early Childhood'] },
  { id: 'clothing', label: 'Clothing & Dress-Up', icon: '👗', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Clothing', 'Dress-Up', 'Costumes', 'Fashion'] },
  { id: 'toys', label: 'Toys & Art Supplies', icon: '🧸', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Toys', 'Art Supplies', 'Materials', 'Crafts'] },
  { id: 'handwork', label: 'Handwork Curriculum', icon: '🧶', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Handwork', 'Curriculum', 'Knitting', 'Crochet', 'Weaving'] },
  { id: 'wool', label: 'Wool & Handwork Supplies', icon: '🐑', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Wool', 'Handwork Supplies', 'Yarn', 'Fiber'] },
  { id: 'wool-buying-guide', label: 'Wool & Handwork Supplies — Buying Guide', icon: '🐑', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Wool & Handwork Supplies - A Waldorf Buying Guide'] },
  { id: 'woodwork', label: 'Woodwork', icon: '🪵', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Woodwork', 'Wood Carving', 'Carpentry'] },
  { id: 'biodynamic', label: 'Biodynamic Agriculture', icon: '🌾', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Biodynamic', 'Agriculture', 'Farming', 'Gardening'] },
  { id: 'secondhand', label: 'Second Hand', icon: '♻️', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Second Hand', 'Resale', 'Thrift', 'Used'] },
  { id: 'naturaldye', label: 'Natural Dyeing', icon: '🌿', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Natural Dyeing', 'Dye Plants', 'Colors', 'Textiles'] },
  { id: 'chalkboard-art', label: 'Waldorf Chalkboard Art', icon: '🎨', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Waldorf Chalkboard Art'] },
  // Costume suppliers also in Hands
  { id: 'bella-luna-toys-hands', label: 'Bella Luna Toys — Dress-Up & Toys', icon: '🧚', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Costumes'] },
  { id: 'waldorfshop-europe-hands', label: 'Waldorfshop Europe — Dress-Up & Toys', icon: '🎭', color: '#3a6b3e', bgColor: '#e8ede4', categories: ['Costumes'] },
];

const HOSPITALS_CATEGORIES: ResourceCategory[] = [
  { id: 'hospitals', label: 'Anthroposophical Hospitals', icon: '🏥', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Hospitals', 'Anthroposophical Medicine', 'Hospitals'] },
  { id: 'doctors', label: 'Anthroposophical Doctors', icon: '👨‍⚕️', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Doctors', 'Physicians', 'Practitioners'] },
  { id: 'pharmacies', label: 'Anthroposophical Pharmacies', icon: '💊', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Pharmacies', 'Remedies', 'Medicines'] },
];

const PUBLISHER_CATEGORIES: ResourceCategory[] = [
  { id: 'rudolf-steiner-archive', label: 'Rudolf Steiner Archive (rsarchive.org)', icon: '📚', color: '#2c4a6e', bgColor: '#dce8f5', categories: ['Publishers'] },
];

const COSTUME_CATEGORIES: ResourceCategory[] = [
  { id: 'fairy-finery', label: 'Fairy Finery', icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'bella-luna-toys', label: 'Bella Luna Toys — Dress-Up', icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'jack-be-nimble-kids', label: 'Jack Be Nimble Kids', icon: '👗', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'sarahs-silks', label: "Sarah's Silks — Dress-Up", icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'sofee-lenee', label: 'Sofee & Lenee', icon: '👗', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'waldorf-shop-costumes', label: 'The Waldorf Shop — Clothing & Costumes', icon: '🧚', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'poems-for-buttercup', label: 'Poems for Buttercup — Crowns', icon: '👑', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'tree-hollow-toys', label: 'Tree Hollow Toys — Dress-Up', icon: '🎭', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
  { id: 'waldorfshop-europe', label: 'Waldorfshop Europe — Dress-Up & Make-Up', icon: '🎭', color: '#7a4f1a', bgColor: '#fdf0d0', categories: ['Costumes'] },
];

const TABS = [
  { tab: 'head' as ResourceTab, label: 'Head — Thinking & Knowledge', shortLabel: 'Head', icon: '☀️', color: '#2c4a6e', categories: HEAD_CATEGORIES, worldLists: WORLD_LISTS },
  { tab: 'heart' as ResourceTab, label: 'Heart — Feeling & Soul Life', shortLabel: 'Heart', icon: '💛', color: '#7a4f1a', categories: HEART_CATEGORIES, worldLists: [] },
  { tab: 'hands' as ResourceTab, label: 'Hands — Doing & Making', shortLabel: 'Hands', icon: '🙌', color: '#3a6b3e', categories: HANDS_CATEGORIES, worldLists: [] },
  { tab: 'hospitals' as ResourceTab, label: 'Anthroposophical Hospitals, Doctors & Pharmacies', shortLabel: 'Hospitals', icon: '🏥', color: '#2c4a6e', categories: HOSPITALS_CATEGORIES, worldLists: [] },
  { tab: 'publishers' as ResourceTab, label: 'Publishers', shortLabel: 'Publishers', icon: '📚', color: '#2c4a6e', categories: PUBLISHER_CATEGORIES, worldLists: [] },
  { tab: 'costumes' as ResourceTab, label: 'Costumes', shortLabel: 'Costumes', icon: '🎭', color: '#7a4f1a', categories: COSTUME_CATEGORIES, worldLists: [] },
  { tab: 'articles' as ResourceTab, label: 'Articles', shortLabel: 'Articles', icon: '📄', color: '#2c4a6e', categories: [], worldLists: [] },
];

export function ResourcesPanel() {
  const [activeTab, setActiveTab] = useState<ResourceTab>('head');
  const [resources, setResources] = useState<WaldorfResource[]>([]);
  const [articles, setArticles] = useState<WaldorfResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [expandedTabs, setExpandedTabs] = useState<Record<ResourceTab, boolean>>({ head: false, heart: false, hands: false, hospitals: false, articles: false });
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
    return (
      React.createElement(ArticleViewer, {
        filePath: viewingArticle.fileLink,
        title: viewingArticle.title,
        onBack: () => setViewingArticle(null)
      })
    );
  }

  const allItems = useMemo(() => [...resources, ...articles], [resources, articles]);

  const categoryMap = useMemo(() => {
    const map: Record<string, ResourceCategory> = {};
    TABS.forEach(group => {
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
      woodwork: ['wood', 'woodworking', 'whittling', 'carving', 'holz'],
      dolls: ['doll', 'puppet', 'marionette', 'puppe', 'puppetry'],
    };
    return allItems.filter(item => {
      let found = item.title.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s) ||
        (item.description || '').toLowerCase().includes(s) ||
        (item.topicTags || []).some(t => t.toLowerCase().includes(s));
      if (!found) {
        for (const [word, syns] of Object.entries(synonyms)) {
          if (s.includes(word) || word.includes(s)) {
            found = syns.some(syn =>
              item.title.toLowerCase().includes(syn) ||
              item.category.toLowerCase().includes(syn) ||
              (item.description || '').toLowerCase().includes(syn) ||
              (item.topicTags || []).some(t => t.toLowerCase().includes(syn))
            );
            if (found) break;
          }
          if (syns.some(syn => s.includes(syn) || syn.includes(s))) {
            found = item.title.toLowerCase().includes(word) ||
              item.category.toLowerCase().includes(word) ||
              (item.topicTags || []).some(t => t.toLowerCase().includes(word));
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
    for (const group of TABS) {
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

  const currentTabData = TABS.find(g => g.tab === activeTab);
  const currentCategories = currentTabData?.categories || [];
  const currentWorldLists = currentTabData?.worldLists || [];
  
  let displayItems: WaldorfResource[] = [];
  if (activeTab === 'articles') {
    displayItems = articles;
  } else if (selectedCategoryId) {
    displayItems = getItemsForCategory(selectedCategoryId);
  } else {
    const categoryIds = currentCategories.map(c => c.id);
    displayItems = searchFilteredItems.filter(item => {
      const itemCats = [item.category, ...(item.topicTags || [])].map(c => c.toLowerCase());
      return itemCats.some(c => categoryIds.some(id => c.includes(id.toLowerCase()) || id.toLowerCase().includes(c)));
    });
  }

  const paginatedItems = displayItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(displayItems.length / PAGE_SIZE);

  const handleItemClick = (item: WaldorfResource) => {
    if (item.contentType === 'article' && item.fileLink.endsWith('.html')) {
      setViewingArticle(item);
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

return React.createElement('div', { className: 'space-y-3' },
      paginatedItems.map((item, index) => {
        const catMeta = categoryMap[item.category] || { bgColor: '#f5f5f5', color: '#666', icon: '' };
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
                React.createElement('span', { className: 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-pale text-sage shrink-0' }, item.category)
              ),
              item.description && React.createElement('p', { className: 'text-sm text-ink-soft/70 line-clamp-2 mb-2' }, item.description),
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
    const tabData = TABS.find(t => t.tab === tabKey);

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
    React.createElement('div', { className: 'p-4 sm:p-5 border-b border-border bg-white/40 shrink-0' },
      React.createElement('div', { className: 'flex items-start justify-between gap-4 mb-3' },
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-2xl font-serif text-ink mb-0.5 font-semibold' }, 'Waldorf Resources'),
          React.createElement('p', { className: 'text-xs sm:text-sm text-ink-soft italic' }, 'Curated links, guides, articles and tools — organized by Head, Heart & Hands')
        ),
      ),
      
      React.createElement('div', { className: 'relative mb-3' },
        React.createElement(Search, { size: 14, className: 'absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft' }),
        React.createElement('input', { type: 'text', placeholder: 'Search all resources...',
          value: searchQuery, onChange: e => setSearchQuery(e.target.value),
          className: 'w-full pl-8 pr-3 py-1.5 bg-white border border-border rounded-xl outline-none focus:border-sage transition-colors text-sm' }
        )
      ),

      React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
        TABS.map(tab => 
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
    ),

    React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 sm:p-5' },
      loading ? (
        React.createElement('div', { className: 'flex flex-col items-center justify-center py-20 text-sage italic font-serif' }, 'Loading resources...')
      ) : (
        React.createElement(React.Fragment, null,
          renderCategoryGrid(currentCategories, activeTab),
          
          renderWorldLists(currentWorldLists),
          
          renderResultsView(),
          
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