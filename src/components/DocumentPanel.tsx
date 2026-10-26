import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X 
} from 'lucide-react';
import { documentService, Document } from '../services/documentService';
import { showSuccess, showError } from '../utils/toastUtils';

type DocumentViewMode = 'list' | 'detail';

interface DocumentPanelProps {
  initialDocumentId?: string | null;
}

export function DocumentPanel({ initialDocumentId }: DocumentPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<DocumentViewMode>('list');
  
  useEffect(() => {
    if (initialDocumentId && documents.length > 0) {
      const doc = documents.find(d => d.id === initialDocumentId);
      if (doc) {
        setSelectedDocument(doc);
        setViewMode('detail');
      }
    }
  }, [initialDocumentId, documents]);
  
  // Local active subscriber status state
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; subscriptionActive: boolean } | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const cached = localStorage.getItem('LOGGED_IN_USER');
      if (cached) {
        try {
          setCurrentUser(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();
    
    // Sync when storage is updated or window receives focus
    window.addEventListener('storage', checkUser);
    window.addEventListener('focus', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('focus', checkUser);
    };
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const data = await documentService.getAllDocuments();
        setDocuments(data);
        console.log(`Loaded ${data.length} documents`);
      } catch (err) {
        console.error('Failed to load documents:', err);
        showError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, []);

  const filteredDocuments = documents
    .filter(doc => {
      if (!searchQuery.trim()) return true;
      
      const queryLower = searchQuery.toLowerCase().trim();
      return (
        doc.title.toLowerCase().includes(queryLower) ||
        doc.content.toLowerCase().includes(queryLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        doc.sections.some(section => 
          section.title.toLowerCase().includes(queryLower) || 
          section.content.toLowerCase().includes(queryLower)
        )
      );
    })
    .sort((a, b) => {
      // Sort by relevance to search query
      if (!searchQuery.trim()) return 0;
      
      const queryLower = searchQuery.toLowerCase().trim();
      const aScore = 
        (a.title.toLowerCase().includes(queryLower) ? 3 : 0) +
        (a.content.toLowerCase().includes(queryLower) ? 1 : 0) +
        (a.tags.some(tag => tag.toLowerCase().includes(queryLower)) ? 2 : 0);
      
      const bScore = 
        (b.title.toLowerCase().includes(queryLower) ? 3 : 0) +
        (b.content.toLowerCase().includes(queryLower) ? 1 : 0) +
        (b.tags.some(tag => tag.toLowerCase().includes(queryLower)) ? 2 : 0);
      
      return bScore - aScore;
    });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSelectDocument = (document: Document) => {
    setSelectedDocument(document);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedDocument(null);
    setViewMode('list');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white/10 items-center justify-center p-20 text-sage italic font-serif">
        Loading Waldorf wisdom...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/10">
      <div className="py-3 px-6 border-b border-border bg-white/40">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-xl font-serif text-ink">Wisdom Library</h2>
          <p className="text-xs text-ink-soft italic hidden sm:block">Search articles and resources</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sage text-sm">
            <Search />
          </div>
          <input 
            type="text" 
            placeholder="Search articles, festivals, crafts, and more..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-10 py-2 bg-white border border-border rounded-xl outline-none focus:border-sage transition-colors text-sm"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink text-xs p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="p-6 space-y-6">
            {filteredDocuments.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-sage font-medium">
                  {filteredDocuments.length} article{filteredDocuments.length !== 1 ? 's' : ''} found
                </p>
                <div className="space-y-4">
                  {filteredDocuments.map(document => (
                    <div 
                      key={document.id} 
                      className="cursor-pointer border border-border rounded-xl p-4 hover:border-sage hover:bg-sage-pale/10 transition-colors"
                      onClick={() => handleSelectDocument(document)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif text-xl text-ink">{document.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {document.tags.slice(0, 5).map(tag => (
                            <span 
                              key={tag} 
                              className="px-2 py-0.5 bg-sage-pale text-sage text-[10px] rounded-full font-semibold"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-ink-soft line-clamp-3">{document.content.substring(0, 200)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-sage italic text-lg font-serif">
                  No articles found matching "{searchQuery}"
                </p>
                {searchQuery ? (
                  <button 
                    onClick={handleClearSearch}
                    className="mt-4 px-4 py-2 bg-sage text-white text-sm font-semibold rounded-xl hover:bg-sage/80 transition-colors"
                  >
                    Show All Articles
                  </button>
                ) : (
                  <p className="mt-4 text-xs text-ink-soft">Try searching for festivals, crafts, or educational topics</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full p-6">
            {selectedDocument ? (
              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="flex justify-between items-start mb-4">
                  <button 
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-sage hover:text-ink transition-colors"
                  >
                    <ChevronLeft size={18} /> Back to Library
                  </button>
                  <h2 className="font-serif text-2xl text-ink">{selectedDocument.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {selectedDocument.sections.map(section => (
                    <div key={section.id} className="space-y-4">
                      <h3 
                        className={`font-serif text-xl text-ink border-b border-border pb-2`}
                        style={{ marginTop: section.level === 1 ? '0' : '1.5rem' }}
                      >
                        {section.title}
                      </h3>
                      <div className="prose prose-sm max-w-none text-ink-soft">
                        {section.content.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph.trim()}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sage italic text-lg font-serif">Select an article to read</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}