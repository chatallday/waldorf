import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Lock, Sparkles, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { guidesManifest, GUIDE_CATEGORIES, GuideItem } from '../data/guidesManifest';

interface ReadingRoomProps {
  onRequestUpgrade?: () => void;
}

export function ReadingRoom({ onRequestUpgrade }: ReadingRoomProps) {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const checkUser = () => {
      const cached = localStorage.getItem('LOGGED_IN_USER');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setIsProUser(
            parsed.subscriptionActive === true ||
            parsed.tier === 'seeker-pro' ||
            parsed.role === 'admin'
          );
        } catch (e) {
          setIsProUser(false);
        }
      } else {
        setIsProUser(false);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('focus', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('focus', checkUser);
    };
  }, []);

  const filteredGuides =
    selectedCategory === 'All'
      ? guidesManifest
      : guidesManifest.filter((g) => g.category === selectedCategory);

  const getCategoryCount = (cat: string) => 
    cat === 'All' ? guidesManifest.length : guidesManifest.filter(g => g.category === cat).length;

  const isLocked = (guide: GuideItem) =>
    guide.tierLock === 'seeker-pro' && !isProUser;

  const handleSelectGuide = (guide: GuideItem) => {
    setSelectedGuide(guide);
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.scrollTo(0, 0);
    }
  };

  const categoryColors: Record<string, string> = {
    Philosophy: 'bg-[#dce8f5] text-[#2c4a6e] border-[#b0c4d8]',
    Curriculum: 'bg-[#eef4ef] text-[#1a4a20] border-[#a8b89a]',
    Handwork: 'bg-[#f0ebe4] text-[#5a3000] border-[#c9a87a]',
    Music: 'bg-[#fdf0d0] text-[#7a4f1a] border-[#e8c87a]',
    'Arts & Crafts': 'bg-rose-50 text-rose-700 border-rose-200',
    Storytelling: 'bg-[#f8f0fa] text-[#5a2a7a] border-[#c9a0dc]',
    Neurodivergence: 'bg-[#e8f4f8] text-[#1a5a6e] border-[#8ac4d8]',
    Lifestyle: 'bg-[#f2f8e8] text-[#3a5a1a] border-[#a8c87a]',
    Language: 'bg-[#fff8e8] text-[#7a5a00] border-[#d8c07a]',
  };

  return (
    <div className="flex flex-col h-full bg-[#faf7f2]">
      <div className="px-6 py-5 border-b border-[#e6dec9] bg-[#f5ede0]/40 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={20} className="text-[#b8943f]" />
          <h2 className="font-serif text-2xl text-[#3d2e25] font-semibold">
            The Reading Room
          </h2>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-[#e6dec9] text-[#7a5a3a] text-[10px] font-bold uppercase tracking-wider">
            {guidesManifest.length} Total Articles
          </span>
        </div>
        <p className="text-sm text-[#8c6d53] italic font-serif mb-4">
          Hand-crafted operational guides by Nina &amp; Elidy
        </p>

        <div className="flex flex-wrap gap-2">
          {GUIDE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-[11px] rounded-lg font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#b8943f] text-white border-[#b8943f]'
                  : 'bg-white/80 border-[#e0d4b8] text-[#8c6d53] hover:bg-[#f0e8d4]'
              }`}
            >
              {cat} ({getCategoryCount(cat)})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        <div className={`md:w-[320px] shrink-0 border-r border-[#e6dec9] overflow-y-auto bg-white/30 ${selectedGuide ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 space-y-2">
            {filteredGuides.map((guide) => {
              const locked = isLocked(guide);
              const isSelected = selectedGuide?.id === guide.id;
              return (
                <button
                  key={guide.id}
                  onClick={() => handleSelectGuide(guide)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected ? 'bg-white border-[#cca862] ring-1 ring-[#cca862]' : 'bg-white/70 border-[#e8dfc8] hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold uppercase text-[#8c6d53]">{guide.category}</span>
                    {locked && <Lock size={12} className="text-[#b8943f]" />}
                  </div>
                  <h4 className="font-serif text-[#3d2e25] font-semibold">{guide.title}</h4>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            {!selectedGuide ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <p className="text-[#a0856d] italic">Select a guide from the sidebar to begin.</p>
              </motion.div>
            ) : (
              <motion.div key={selectedGuide.id} className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-[#e6dec9] flex justify-between items-center">
                  <h3 className="font-serif text-[#3d2e25]">{selectedGuide.title}</h3>
                  <button onClick={() => setSelectedGuide(null)}><X size={18} /></button>
                </div>
                <iframe
                  ref={iframeRef}
                  src={selectedGuide.filePath}
                  className="flex-1 w-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
