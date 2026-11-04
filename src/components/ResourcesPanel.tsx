import React, { useEffect, useState, useMemo } from 'react';
import { getResources, getArticles, WaldorfResource } from '../services/workflowService';
import { ExternalLink, BookOpen, FileText, Search, File as FileIcon, ChevronLeft, ChevronRight, ChevronDown, X, Filter, Grid, List } from 'lucide-react';
import { ArticleViewer } from './ArticleViewer';
import { InstagramHandlesViewer } from './InstagramHandlesViewer';

// 23 Definitive Categories - Alphabetical Order
const DEFINITIVE_CATEGORIES = [
  // Head/Thinking categories (blue tones)
  { id: 'adult-education-training', label: 'Adult Education and Training', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  { id: 'anthroposophic-medicine', label: 'Anthroposophic Medicine', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  { id: 'books-reading-lists', label: 'Books & Reading Lists', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  { id: 'children-reading-guides', label: 'Children Reading Guides', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  { id: 'curriculums', label: 'Curriculums', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  { id: 'four-temperaments', label: 'Four Temperaments', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  { id: 'global-resources', label: 'Global Resources', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  { id: 'must-read-books', label: 'Must Read Books', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '' },
  
  // Heart/Feeling categories (gold/amber tones)
  { id: 'community-makers', label: 'Community and Makers', pillar: 'heart' as const, color: '#7a4f1a', bgColor: '#fdf0d0', icon: '' },
  { id: 'eurythmy', label: 'Eurythmy', pillar: 'heart' as const, color: '#7a4f1a', bgColor: '#fdf0d0', icon: '' },
  { id: 'festivals-celebrations', label: 'Festivals and Celebrations', pillar: 'heart' as const, color: '#7a4f1a', bgColor: '#fdf0d0', icon: '' },
  { id: 'music-instruments', label: 'Music and Instruments', pillar: 'heart' as const, color: '#7a4f1a', bgColor: '#fdf0d0', icon: '' },
  { id: 'seasons-nature-tables', label: 'Seasons and Nature Tables', pillar: 'heart' as const, color: '#7a4f1a', bgColor: '#fdf0d0', icon: '' },
  { id: 'storytelling-puppetry', label: 'Storytelling and Puppetry', pillar: 'heart' as const, color: '#7a4f1a', bgColor: '#fdf0d0', icon: '' },
  
  // Hands/Willing categories (green tones)
  { id: 'anthroposophic-medicine', label: 'Anthroposophic Medicine', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'art-supplies', label: 'Art Suppliers', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'baby-care', label: 'Baby Care', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'camps-retreats', label: 'Camps and Retreats', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'clothing-dress-up', label: 'Clothing and Dress Up', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'doll-making', label: 'Doll Making', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'eurythmy', label: 'Eurythmy', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'handwork', label: 'Handwork', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'lifecycle-development', label: 'Lifecycle and Development', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'music-instruments', label: 'Music and Instruments', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'nutrition-food', label: 'Nutrition and Food', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'toys-furniture-suppliers', label: 'Toys & Furniture Suppliers', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
  { id: 'woodwork', label: 'Woodwork', pillar: 'hands' as const, color: '#3a6b3e', bgColor: '#e8ede4', icon: '' },
];

// Map category ID to search tags for filtering
const CATEGORY_SEARCH_TAGS: Record<string, string[]> = {
  'adult-education-training': ['Adult Education', 'Training', 'Teacher Training'],
  'anthroposophic-medicine': ['Anthroposophic Medicine', 'Health', 'Therapy', 'Healing', 'Hospitals', 'Doctors', 'Pharmacies'],
  'art-supplies': ['Art Suppliers', 'Art Supplies', 'Craft Supplies', 'Art Materials'],
  'baby-care': ['Baby Care', 'Infant Care', 'Early Childhood'],
  'camps-retreats': ['Camps', 'Retreats', 'Summer Camps', 'Outdoor'],
  'children-reading-guides': ['Children Reading', 'Reading Guides', 'Reading Guide', 'Early Childhood Reading'],
  'clothing-dress-up': ['Clothing', 'Dress Up', 'Costumes', 'Dress-Up'],
  'community-makers': ['Community', 'Makers', 'Community Groups', 'Social'],
  'curriculums': ['Curriculums', 'Curriculum', 'Homeschool Curricula', 'Lesson Guides'],
  'doll-making': ['Doll Making', 'Dolls', 'Doll Making', 'Waldorf Dolls'],
  'eurythmy': ['Eurythmy', 'Movement'],
  'festivals-celebrations': ['Festivals', 'Celebrations', 'Seasonal', 'Holidays'],
  'handwork': ['Handwork', 'Crafts', 'Knitting', 'Sewing', 'Felting', 'Wool', 'Crafts'],
  'lifecycle-development': ['Lifecycle', 'Development', 'Child Development', 'Healthy Balance', 'Body Awareness'],
  'music-instruments': ['Music', 'Instruments', 'Singing', 'Choir', 'Orchestra'],
  'nutrition-food': ['Nutrition', 'Food', 'Diet', 'Grain', 'Biodynamic'],
  'toys-furniture-suppliers': ['Toys', 'Furniture', 'Suppliers', 'Toy Makers', 'Furniture Makers', 'Woodwork'],
  'woodwork': ['Woodwork', 'Woodworking', 'Carpentry', 'Crafts'],
};

// Keep existing special categories for Publishers, Costumes, Articles
const SPECIAL_CATEGORIES = [
  { id: 'publishers', label: 'Publishers', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '', isSpecial: true },
  { id: 'costumes', label: 'Costumes', pillar: 'heart' as const, color: '#7a4f1a', bgColor: '#fdf0d0', icon: '', isSpecial: true },
  { id: 'articles', label: 'Articles', pillar: 'head' as const, color: '#2c4a6e', bgColor: '#dce8f5', icon: '', isSpecial: true },
];

const ALL_CATEGORIES = [...DEFINITIVE_CATEGORIES, ...SPECIAL_CATEGORIES];

type ResourceCategoryId = typeof ALL_CATEGORIES[number]['id'];

interface ResourceCategory {
  id: string;
  label: string;
  pillar: 'head' | 'heart' | 'hands';
  color: string;
  bgColor: string;
  icon: string;
  isSpecial?: boolean;
  isExternalLink?: boolean;
  externalUrl?: string;
}

// Publisher URLs for special handling
const PUBLISHER_URLS: Record<string, string> = {
  'anthroposophic-press': 'https://steinerbooks.org',
  'hawthorn-press': 'https://www.hawthornpress.com',
  'waldorf-publications': 'https://www.waldorfpublications.org/',
  'wecan-publications': 'https://www.waldorfpublications.org/collections/wecan-publications',
  'wynstones-press': 'https://www.wynstonespress.com/',
  'rudolf-steiner-press': 'https://www.rudolfsteinerpress.com/',
  'lindisfarne-books': 'https://steinerbooks.org/collections/lindisfarne',
  'michaelmas-press': 'https://michaelmaspress.com/',
  'jamie-york-press': 'https://www.jamieyorkpress.com/',
  'rudolf-steiner-archive': 'https://rsarchive.org',
  'editora-antroposofica': 'http://editora.com.br',
  'antroposofica-ar': 'http://antroposofica.com.ar',
  'editorial-rudolf-steiner': 'https://editorialrudolfsteiner.com',
  'paud-edamasc': 'https://paudedamasc.com',
};

// Costume URLs for special handling
const COSTUME_URLS: Record<string, string> = {
  'fairy-finery': 'https://www.fairyfinery.com/',
  'bella-luna-toys': 'https://www.bellalunatoys.com/collections/dress-ups-costumes',
  'jack-be-nimble-kids': 'https://jackbenimblekids.com/collections/best-sellers',
  'sarahs-silks': 'https://www.sarahssilks.com/collections/dress-up-costumes',
  'sofee-lenee': 'http://www.sofeeandlenee.com/',
  'waldorf-shop-costumes': 'https://waldorfshop.net/collections/clothing-costumes',
  'poems-for-buttercup': 'https://poemsforbuttercup-co-nz.myshopify.com/collections/ready-to-ship-crowns',
  'tree-hollow-toys': 'https://treehollowtoys.com/collections/dress-up',
  'waldorfshop-europe': 'https://www.waldorfshop.eu/en/toys-games/role-toys/dress-up-make-up',
};

export function ResourcesPanel({ onNavigate }: { onNavigate?: (view: 'directory' | 'documents', data?: any) => void }) {
  const [resources, setResources] = useState<WaldorfResource[]>([]);
  const [articles, setArticles] = useState<WaldorfResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<ResourceCategoryId | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewingArticle, setViewingArticle] = useState<WaldorfResource | null>(null);
  const [viewingInstagramHandles, setViewingInstagramHandles] = useState<{ handles: any[]; title: string } | null>(null);
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

  // Filter items by selected category using CATEGORY_SEARCH_TAGS
  const categoryFilteredItems = useMemo(() => {
    if (!selectedCategoryId) return searchFilteredItems;
    
    const searchTags = CATEGORY_SEARCH_TAGS[selectedCategoryId];
    if (!searchTags) return searchFilteredItems;
    
    const searchTagsLower = searchTags.map(t => t.toLowerCase());
    
    return searchFilteredItems.filter(item => {
      const itemTags = [
        item.category.toLowerCase(),
        ...(item.topicTags || []).map(t => t.toLowerCase()),
        ...(item.searchAliases || []).map(a => a.toLowerCase())
      ];
      return searchTagsLower.some(tag => itemTags.includes(tag));
    });
  }, [searchFilteredItems, selectedCategoryId]);

  // Apply tag filter (faceted filtering) - strict filter on selected tags
  const tagFilteredItems = useMemo(() => {
    if (selectedTags.length === 0) return categoryFilteredItems;
    const selectedTagsLower = selectedTags.map(t => t.toLowerCase());
    return categoryFilteredItems.filter(item => {
      const itemTags = [...(item.topicTags || []), ...(item.searchAliases || [])].map(t => t.toLowerCase());
      return selectedTagsLower.every(tag => itemTags.includes(tag));
    });
  }, [categoryFilteredItems, selectedTags]);

  const paginatedItems = tagFilteredItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(tagFilteredItems.length / PAGE_SIZE);

  const handleCategoryClick = (categoryId: ResourceCategoryId) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
    }
    setPage(0);
  };

  // Filter bar component - show tags only from currently visible items
  const visibleTags = useMemo(() => {
    const tags = new Set<string>();
    tagFilteredItems.forEach(item => {
      (item.topicTags || []).forEach(t => tags.add(t));
      (item.searchAliases || []).forEach(a => tags.add(a));
    });
    return Array.from(tags).sort();
  }, [tagFilteredItems]);

  const filterBar = (selectedTags.length > 0 || visibleTags.length > 0)
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
        visibleTags.length > 0 && selectedTags.length === 0 && React.createElement('div', { className: 'mb-2' },
          React.createElement('label', { className: 'text-xs font-medium text-ink-soft/60 mr-2', htmlFor: 'tag-filter' }, 'Filter by tag:'),
          React.createElement('select', {
            id: 'tag-filter',
            value: '',
            onChange: (e) => { if (e.target.value) setSelectedTags(prev => [...prev, e.target.value]); e.target.value = ''; },
            className: 'ml-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-white/60 border border-border text-ink hover:bg-sage-pale hover:border-sage focus:outline-none focus:border-sage transition-all'
          },
            React.createElement('option', { value: '', disabled: true }, 'Select a tag...'),
            visibleTags.map((tag, idx) => React.createElement('option', { key: idx, value: tag }, tag))
          )
        )
      )
    : null;

  const handleItemClick = (item: WaldorfResource) => {
    // Special handling for Instagram recommendations directory
    if (item.id === 'instagram-recommendations-directory' && (item as any).handles) {
      setViewingInstagramHandles({
        handles: (item as any).handles,
        title: item.title
      });
      return;
    }
    
    if (item.contentType === 'article' && item.fileLink.endsWith('.html')) {
      if (onNavigate) {
        onNavigate('documents', { filePath: item.fileLink, title: item.title });
      } else {
        setViewingArticle(item);
      }
    } else if (item.contentType === 'pdf' || item.fileLink.endsWith('.pdf')) {
      if (onNavigate) {
        onNavigate('documents', { filePath: item.fileLink, title: item.title });
      } else {
        window.open(item.fileLink, '_blank');
      }
    } else {
      window.open(item.fileLink, '_blank');
    }
  };

  // Helper to get matched tags for display
  const getMatchedTags = (item: WaldorfResource) => {
    const query = searchQuery.toLowerCase().trim();
    const allTags = [...(item.topicTags || []), ...(item.searchAliases || [])];
    if (!query) return allTags.slice(0, 4); // Show first 4 tags when no search
    return allTags.filter(tag => tag.toLowerCase().includes(query)).slice(0, 4);
  };

  const renderResultsView = () => {
    if (tagFilteredItems.length === 0) {
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
        const matchedTags = getMatchedTags(item);
        return React.createElement('div', {
          key: item.id,
          className: 'group bg-white/60 border border-border rounded-xl p-4 hover:bg-white/80 hover:shadow-sm transition-all cursor-pointer',
          onClick: () => handleItemClick(item)
        },
          React.createElement('div', { className: 'flex items-start gap-4' },
            React.createElement('div', { 
              className: 'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
              style: { backgroundColor: '#f5f5f5' }
            },
              React.createElement(BookOpen, { 
                className: 'text-lg',
                style: { color: '#666' },
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

  // Fallback: All / General Articles - items not matching any definitive category
  const renderFallbackView = () => {
    if (selectedCategoryId) return null; // Only show when no category is selected
    
    const definitiveCategoryIds = DEFINITIVE_CATEGORIES.map(c => c.id);
    const fallbackItems = tagFilteredItems.filter(item => {
      const itemTags = [
        item.category.toLowerCase(),
        ...(item.topicTags || []).map(t => t.toLowerCase()),
        ...(item.searchAliases || []).map(a => a.toLowerCase())
      ];
      // Check if item matches any definitive category
      const matchesAnyCategory = definitiveCategoryIds.some(catId => {
        const searchTags = CATEGORY_SEARCH_TAGS[catId];
        if (!searchTags) return false;
        return searchTags.some(tag => itemTags.includes(tag.toLowerCase()));
      });
      return !matchesAnyCategory;
    });
    
    if (fallbackItems.length === 0) return null;
    
    const paginatedFallback = fallbackItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    if (paginatedFallback.length === 0) return null;

    return React.createElement(React.Fragment, null,
      React.createElement('div', { className: 'mt-8 mb-4' },
        React.createElement('h3', { className: 'text-lg font-serif text-ink font-semibold flex items-center gap-2' },
          'All / General Articles'
        ),
        React.createElement('p', { className: 'text-xs text-ink-soft/60 mt-1' }, 
          'Resources not categorized under a specific filter bubble'
        )
      ),
      React.createElement('div', { className: 'space-y-3' },
        paginatedFallback.map((item, index) => {
          const matchedTags = getMatchedTags(item);
          return React.createElement('div', {
            key: item.id,
            className: 'group bg-white/60 border border-border rounded-xl p-4 hover:bg-white/80 hover:shadow-sm transition-all cursor-pointer',
            onClick: () => handleItemClick(item)
          },
            React.createElement('div', { className: 'flex items-start gap-4' },
              React.createElement('div', { 
                className: 'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
                style: { backgroundColor: '#f5f5f5' }
              },
                React.createElement(BookOpen, { 
                  className: 'text-lg',
                  style: { color: '#666' },
                })
              ),
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('div', { className: 'flex items-center justify-between gap-2 mb-1' },
                  React.createElement('h4', { className: 'font-semibold text-ink font-serif text-base line-clamp-2' }, item.title),
                  React.createElement('span', { className: 'hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-pale text-sage shrink-0' }, item.category)
                ),
                item.description && React.createElement('p', { className: 'text-sm text-ink-soft/70 line-clamp-2 mb-2' }, item.description),
                (() => {
                  const matchedTags = getMatchedTags(item);
                  if (matchedTags.length === 0) return null;
                  return React.createElement('div', { className: 'flex flex-wrap gap-1.5 mb-2' },
                    matchedTags.map((tag, idx) => React.createElement('span', {
                      key: idx,
                      className: 'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-sage-pale/80 text-sage border border-sage/20',
                      title: item.topicTags?.includes(tag) ? 'Topic tag' : 'Search alias'
                    }, tag))
                  );
                })(),
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

      // 23 Definitive Category Bubbles - Alphabetical
      React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
        ALL_CATEGORIES.map(cat => {
          const isSelected = selectedCategoryId === cat.id;
          const pillarColors = {
            head: { bg: '#dce8f5', text: '#2c4a6e', border: '#2c4a6e' },
            heart: { bg: '#fdf0d0', text: '#7a4f1a', border: '#7a4f1a' },
            hands: { bg: '#e8ede4', text: '#3a6b3e', border: '#3a6b3e' },
          };
          const colors = pillarColors[cat.pillar];
          
          return React.createElement('button', {
            key: cat.id,
            onClick: () => handleCategoryClick(cat.id),
            className: `flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap text-sm font-medium ${
              isSelected 
                ? 'shadow-sm ring-2'
                : 'bg-white/60 border border-border text-ink hover:bg-white/80 hover:shadow-sm'
            }`,
            style: isSelected 
              ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, ringColor: colors.border }
              : { backgroundColor: cat.bgColor, borderColor: cat.color }
          },
            React.createElement('span', { className: 'text-lg' }, cat.icon),
            React.createElement('span', null, cat.label)
          );
        })
      ),

      filterBar,
    ),

    React.createElement('div', { className: 'flex-1 overflow-y-auto p-4 sm:p-5' },
      loading ? (
        React.createElement('div', { className: 'flex flex-col items-center justify-center py-20 text-sage italic font-serif' }, 'Loading resources...')
      ) : (
        React.createElement(React.Fragment, null,
          renderResultsView(),
          renderFallbackView(),
          
          viewingInstagramHandles && React.createElement(InstagramHandlesViewer, {
            handles: viewingInstagramHandles.handles,
            title: viewingInstagramHandles.title,
            onBack: () => setViewingInstagramHandles(null)
          }),
          
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
              'Showing ' + (page * PAGE_SIZE + 1) + '-' + Math.min((page + 1) * PAGE_SIZE, tagFilteredItems.length) + ' of ' + tagFilteredItems.length + ' resources'
            )
          )
        )
      )
    )
  );
}