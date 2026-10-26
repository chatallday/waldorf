import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, Tag, X, Send, CheckCircle2, Share2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Mentor } from '../data/mentors';
import { showSuccess, showError } from '../utils/toastUtils';

import { initiateClaimProfile, getMentors, sendMentorInquiry } from '../services/workflowService';

import { getMentorMessages, EnquiryMessage } from '../services/workflowService';

interface MentorPanelProps {
  recommendedTags: string[];
  initialSelectedMentorId?: string;
  onClearInitialMentor?: () => void;
  onClearTags?: () => void;
  onRemoveTag?: (tag: string) => void;
}

function renderAvatar(photoUrl: string, status: string, name: string, subscriptionActive?: boolean) {
  const isDefault = !photoUrl || 
                    photoUrl.includes('pravatar') || 
                    photoUrl.includes('placeholder') ||
                    status === 'Unclaimed' ||
                    status === 'Pending' ||
                    !subscriptionActive;

  if (isDefault) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full bg-[#fdfaf2] p-1.5 text-sage" aria-hidden="true">
        <defs>
          <radialGradient id="waterGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f7f9f5" stopOpacity="1" />
            <stop offset="50%" stopColor="#eaf2e3" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dcecd0" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#waterGrad)" />
        <path d="M50 30 C40 30 32 38 32 48 C32 60 50 74 50 74 C50 74 68 60 68 48 C68 38 60 30 50 30 Z" fill="none" stroke="#7a8c6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="48" r="6" fill="#7a8c6e" />
      </svg>
    );
  }
  return (
    <img 
      src={photoUrl} 
      alt={name}
      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
    />
  );
}

const getThemeClasses = (theme: string, subscriptionActive: boolean, featuredActive: boolean) => {
  const activeTheme = subscriptionActive ? theme : 'Classic';
  
  // Card outer style
  let cardClass = 'border border-border bg-white/50';
  if (featuredActive) {
    cardClass = 'border-2 border-[#d4a84b] bg-[#fffdf9] shadow-[0_4px_20px_rgba(212,168,75,0.12)]';
  } else {
    switch (activeTheme) {
      case 'Sunset':
        cardClass = 'border border-[#f4b69c] bg-[#fffaf5] shadow-[0_4px_15px_rgba(244,182,156,0.1)]';
        break;
      case 'Forest':
        cardClass = 'border border-[#b5cda3] bg-[#f7f9f5] shadow-[0_4px_15px_rgba(181,205,163,0.1)]';
        break;
      case 'Lavender':
        cardClass = 'border border-[#c5b8df] bg-[#faf8fc] shadow-[0_4px_15px_rgba(197,184,223,0.1)]';
        break;
      default:
        cardClass = 'border border-border bg-white/50';
    }
  }

  // Details Modal header gradient/style
  let headerBg = 'bg-white';
  switch (activeTheme) {
    case 'Sunset':
      headerBg = 'bg-gradient-to-r from-[#ffe4d6] via-[#ffd6c5] to-[#ffe8d6]';
      break;
    case 'Forest':
      headerBg = 'bg-gradient-to-r from-[#eaf2e3] via-[#dcecd0] to-[#eaf2e3]';
      break;
    case 'Lavender':
      headerBg = 'bg-gradient-to-r from-[#f0ebfa] via-[#e2d9f3] to-[#f0ebfa]';
      break;
    default:
      headerBg = 'bg-gradient-to-r from-[#fdfbf7] to-[#f5f0e6]'; // Classic warm-ivory
  }

  return { cardClass, headerBg };
};

export function MentorPanel({ recommendedTags, initialSelectedMentorId, onClearInitialMentor, onClearTags, onRemoveTag }: MentorPanelProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

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
    window.addEventListener('storage', checkUser);
    window.addEventListener('focus', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('focus', checkUser);
    };
  }, []);

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSentSuccess, setMsgSentSuccess] = useState(false);
  const [routedData, setRoutedData] = useState<{ routed: boolean; name: string; specialties: string } | null>(null);
  const [mentorMessages, setMentorMessages] = useState<EnquiryMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalMessage, setUpgradeModalMessage] = useState('');
  const [upgradeModalUrl, setUpgradeModalUrl] = useState('');

  const fetchAndSetMentors = async () => {
    try {
      const data = await getMentors();
      setMentors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetMentors();
  }, []);

  useEffect(() => {
    if (initialSelectedMentorId && mentors.length > 0) {
      const match = mentors.find(m => m.id === initialSelectedMentorId);
      if (match) {
        setSelectedMentor(match);
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id') || params.get('mentorId');
      if (idParam && mentors.length > 0) {
        const match = mentors.find(m => m.id === idParam);
        if (match) {
          setSelectedMentor(match);
        }
      }
    }
  }, [initialSelectedMentorId, mentors]);

  const closeDetailModal = () => {
    setSelectedMentor(null);
    if (onClearInitialMentor) {
      onClearInitialMentor();
    }
  };

  const filteredMentors = useMemo(() => {
    const visibleMentors = mentors.filter(m => m.directoryVisibility);
    let results = visibleMentors;
    
    if (recommendedTags.length > 0) {
      results = results.filter(mentor => 
        mentor.specialties.some(spec => 
          recommendedTags.some(tag => spec.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(spec.toLowerCase()))
        )
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(mentor => {
        const name = mentor.name.toLowerCase();
        const bio = (mentor.bio || '').toLowerCase();
        const loc = (mentor.location || '').toLowerCase();
        const specs = mentor.specialties.join(' ').toLowerCase();
        const grade = (mentor.gradeLevel || '').toLowerCase();
        return name.includes(q) || bio.includes(q) || loc.includes(q) || specs.includes(q) || grade.includes(q);
      });
    }

    if (languageFilter !== 'All') {
      results = results.filter(mentor => {
        const langs = (mentor.languages || '').toLowerCase();
        return langs.includes(languageFilter.toLowerCase());
      });
    }

    return results.sort((a, b) => {
      // 1. Featured active status goes first
      if (a.featuredActive && !b.featuredActive) return -1;
      if (!a.featuredActive && b.featuredActive) return 1;
      // 2. Subscription active status goes second
      if (a.subscriptionActive && !b.subscriptionActive) return -1;
      if (!a.subscriptionActive && b.subscriptionActive) return 1;
      return 0;
    });
  }, [mentors, recommendedTags, searchQuery, languageFilter]);

  const handleClaim = async (mentor: Mentor) => {
    const email = prompt(`Please enter your email to claim the profile for ${mentor.name}:`);
    if (email) {
      try {
        await initiateClaimProfile(mentor.id, mentor.name, email);
        alert("Claim request submitted! Our administrators will review your request and contact you shortly.");
        await fetchAndSetMentors();
      } catch (e) {
        alert("There was an issue initiating the claim. Please try again.");
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    // Lead Capture Gate: block non-logged in users from routing unclaimed guides
    if (selectedMentor.status === 'Unclaimed' && !currentUser) {
      alert("Registration or Sign-in required: Please sign in to send and route inquiries on unclaimed profiles.");
      return;
    }

    if (!senderName || !senderEmail || !messageText) {
      alert("Please fill in all fields.");
      return;
    }
    setSendingMsg(true);
    try {
      const isPro = currentUser?.subscriptionActive === true;
      const res = await sendMentorInquiry(selectedMentor.id, selectedMentor.name, senderName, senderEmail, messageText, isPro);
      if (res && res.routed) {
        setRoutedData({
          routed: true,
          name: res.routedToName,
          specialties: res.routedToSpecialties
        });
      } else {
        setRoutedData(null);
      }
      setMsgSentSuccess(true);
      setSenderName('');
      setSenderEmail('');
      setMessageText('');
      showSuccess('Message sent successfully');
      setTimeout(() => {
        setMsgSentSuccess(false);
        setRoutedData(null);
      }, 10000);
    } catch (err: any) {
      // Handle monthly limit reached for free tier
      if (err?.type === 'MONTHLY_LIMIT_REACHED') {
        setUpgradeModalMessage(err.message || 'Free tier limited to 3 messages per month. Upgrade to Seeker Pro for unlimited messaging!');
        setUpgradeModalUrl(err.upgradeUrl || '/api/stripe-create-link');
        setShowUpgradeModal(true);
      } else {
        showError(`Failed to send message: ${err?.message || 'Please try again.'}`);
      }
    } finally {
      setSendingMsg(false);
    }
  };

  // Fetch mentor messages when a mentor is selected
  useEffect(() => {
    if (selectedMentor) {
      getMentorMessages(selectedMentor.id)
        .then(setMentorMessages)
        .catch(err => console.error('Failed to fetch messages:', err));
    } else {
      setMentorMessages([]);
    }
  }, [selectedMentor]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const paginatedMentors = filteredMentors.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredMentors.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white/10 items-center justify-center p-20 text-sage italic font-serif">
        Resonating with the field...
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-white/10">
      <div className="py-3 px-6 border-b border-border bg-white/40">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-xl font-serif text-ink">Mentor Directory</h2>
          <p className="text-xs text-ink-soft italic hidden sm:block">Find your guide for the rhythmic journey</p>
        </div>

        <div className="relative mt-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search mentors by name, specialty, location..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-border rounded-full outline-none focus:border-sage focus:ring-2 focus:ring-sage/10 transition-all text-sm text-ink placeholder-ink-soft/60"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink p-0.5 rounded-full cursor-pointer bg-transparent border-none"><X size={12} /></button>
          )}
        </div>

        {recommendedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {recommendedTags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-sage-pale text-sage text-[10px] rounded-full uppercase tracking-widest font-bold shadow-sm">
                {tag}
                <button 
                  onClick={() => onRemoveTag ? onRemoveTag(tag) : window.dispatchEvent(new CustomEvent('clear-tags'))}
                  className="hover:text-ink p-0.5 rounded-full hover:bg-sage-pale/20 transition-colors cursor-pointer text-sage/60 hover:text-sage"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button 
              onClick={() => onClearTags ? onClearTags() : window.dispatchEvent(new CustomEvent('clear-tags'))}
              className="text-[10px] font-bold text-sage hover:text-earth uppercase tracking-wider ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {['All', 'English', 'German', 'Spanish', 'French'].map(lang => (
            <button key={lang} onClick={() => setLanguageFilter(lang)}
              className={`px-2.5 py-0.5 text-xs rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer ${
                languageFilter === lang ? 'bg-sage text-white shadow-sm' : 'bg-white/50 border border-border text-ink-soft hover:bg-white/80'
              }`}>{lang}</button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {paginatedMentors.length > 0 ? (
            paginatedMentors.map((mentor) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedMentor(mentor)}
                className={`watercolor-card mentor-card-hover p-6 flex gap-6 group cursor-pointer transition-all duration-300 ${
                  getThemeClasses(mentor.profileTheme || 'Classic', mentor.subscriptionActive, mentor.featuredActive).cardClass
                }`}
                layout
              >
                <div className="w-24 h-24 shrink-0 rounded-[24px] overflow-hidden border border-border shadow-inner bg-white">
                  {renderAvatar(mentor.photoUrl, mentor.status, mentor.name, mentor.subscriptionActive)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-2xl text-ink">{mentor.name}</h3>
                        {mentor.featuredActive && (
                          <div className="px-2 py-0.5 bg-[#fdf0d0] text-[#7a4f1a] text-[10px] font-bold rounded-full uppercase tracking-widest border border-[#d4a84b] shadow-sm flex items-center gap-1 font-sans">
                            ⭐ Featured Guide
                          </div>
                        )}
                        {mentor.status === 'Verified' ? (
                          <div className="px-2 py-0.5 bg-[#e8f4e8] text-[#2d7a2d] text-xs font-bold rounded-full uppercase tracking-widest border border-[#c8e4c8]">Verified</div>
                        ) : (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaim(mentor);
                            }}
                            className="px-2 py-0.5 bg-sage-pale text-sage text-xs font-bold rounded-full uppercase tracking-widest hover:bg-sage hover:text-white transition-all shadow-sm"
                          >
                            Claim Profile
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-ink-soft flex items-center gap-2 mb-3">
                        <MapPin size={12} /> {mentor.location} • <span className="font-bold">{mentor.gradeLevel}</span>
                      </p>
                    </div>
                  </div>
                  {mentor.featuredActive && mentor.promoTitle ? (
                    <div className="my-3 p-3.5 bg-[#fdf8ee] border border-[#d4a84b]/30 rounded-xl space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#7a4f1a] flex items-center gap-1 font-sans">
                        📢 {mentor.promoTitle}
                      </p>
                      <p className="text-sm text-ink-soft leading-relaxed italic">
                        "{mentor.promoDescription || mentor.bio}"
                      </p>
                      {mentor.promoLink && (
                        <span className="text-[10px] font-bold text-[#7a4f1a] uppercase tracking-wider block mt-1 hover:underline">
                          Discover More →
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-base text-ink-soft leading-relaxed font-serif line-clamp-2 italic mb-4">"{mentor.bio}"</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialties.map(spec => (
                      <span key={spec} className="px-3 py-1 bg-white/50 text-sage text-xs font-bold rounded-full border border-border uppercase tracking-tighter">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-sage italic text-lg font-serif">No mentors match these specific resonances.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('clear-tags'))}
                className="text-sm text-sage font-bold uppercase tracking-widest mt-4 hover:underline transition-all"
              >
                View all mentors
              </button>
            </div>
          )}
        </AnimatePresence>

        {filteredMentors.length > 0 && (
          <div className="flex flex-col items-center gap-3 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-full px-4 py-1.5 bg-white border border-border text-sm font-medium hover:bg-sage-pale transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-sm text-ink-soft font-medium">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-full px-4 py-1.5 bg-white border border-border text-sm font-medium hover:bg-sage-pale transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-xs text-ink-soft/70">
              Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredMentors.length)} of {filteredMentors.length} mentors
            </p>
          </div>
        )}
      </div>

{/* Mentor Detail Modal */}
{createPortal(
  <AnimatePresence>
    {selectedMentor && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[100] overflow-y-auto py-10 px-4 flex justify-center items-start"
        onClick={closeDetailModal}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white border border-border rounded-[32px] max-w-lg w-full shadow-2xl flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Theme Gradient Header */}
          <div className={`p-8 border-b border-border ${
            getThemeClasses(selectedMentor.profileTheme || 'Classic', selectedMentor.subscriptionActive, selectedMentor.featuredActive).headerBg
          }`}>
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-[20px] overflow-hidden border border-border shadow-inner shrink-0 bg-white">
                  {renderAvatar(selectedMentor.photoUrl, selectedMentor.status, selectedMentor.name, selectedMentor.subscriptionActive)}
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-ink font-semibold">{selectedMentor.name}</h3>
                  <p className="text-sm text-ink-soft flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {selectedMentor.location} • <span className="font-bold">{selectedMentor.gradeLevel}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedMentor.status === 'Verified' ? (
                      <span className="px-2 py-0.5 bg-[#e8f4e8] text-[#2d7a2d] text-[10px] font-bold rounded-full uppercase tracking-widest border border-[#c8e4c8]">Verified Guide</span>
                    ) : (
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-earth-pale text-earth text-[10px] font-bold rounded-full uppercase tracking-widest border border-border">Unclaimed</span>
                        <button onClick={() => { handleClaim(selectedMentor); closeDetailModal(); }} className="px-2 py-0.5 bg-sage text-white text-[10px] font-bold rounded-full uppercase tracking-widest hover:opacity-90 transition-all shadow-sm cursor-pointer border-none">Claim Profile</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}?id=${selectedMentor.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    showSuccess('Public profile link copied to clipboard!');
                  }}
                  className="p-2 hover:bg-white/40 rounded-full transition-colors text-[#b8943f] hover:text-earth cursor-pointer border-none bg-transparent"
                  title="Share Profile"
                >
                  <Share2 size={16} />
                </button>
                <button onClick={closeDetailModal} className="p-2 hover:bg-white/40 rounded-full transition-colors text-ink-soft border-none bg-transparent cursor-pointer"><X size={18} /></button>
              </div>
            </div>
          </div>
          
          {/* Bio & Details */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-sage mb-1">About the Guide</h4>
                <p className="text-base text-ink-soft leading-relaxed font-serif italic">"{selectedMentor.bio}"</p>
              </div>
              {selectedMentor.lessons && selectedMentor.subscriptionActive && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-sage mb-1">Lessons & Offerings / Website</h4>
                  <p className="text-sm font-semibold text-waldorf-secondary leading-relaxed font-sans">
                    <a href={selectedMentor.lessons.startsWith('http') ? selectedMentor.lessons : `https://${selectedMentor.lessons}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-earth">
                      {selectedMentor.lessons}
                    </a>
                  </p>
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

            {/* Blog Articles (if Featured Mentor) */}
            {selectedMentor.featuredActive && (
              (() => {
                let arts = [];
                try {
                  const raw = localStorage.getItem(`BLOG_ARTICLES_${selectedMentor.id}`);
                  if (raw) arts = JSON.parse(raw);
                } catch(e) {}
                
                if (arts.length > 0) {
                  return (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-sage">Published Reflections</h4>
                      <div className="space-y-4">
                        {arts.map((art: any) => (
                          <div key={art.id} className="p-4 bg-[#fbf9f4] border border-border/40 rounded-2xl space-y-1 text-left">
                            <h5 className="font-serif text-base font-bold text-ink">{art.title}</h5>
                            <p className="text-[10px] text-ink-soft">{new Date(art.timestamp).toLocaleDateString()}</p>
                            <p className="text-sm text-ink-soft leading-relaxed font-serif whitespace-pre-line mt-1 italic">
                              "{art.content}"
                            </p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-ink-soft italic leading-normal border-t border-border/20 pt-2 mt-2 font-sans uppercase tracking-tight text-center">
                        The viewpoints, articles, and educational philosophies shared here represent the personal insights of the individual author and do not inherently reflect the official stances of the platform.
                      </p>
                    </div>
                  );
                }
                return null;
              })()
            )}

            <hr className="border-border" />
          {/* Contact Form */}
          <div className="space-y-4">
            <div>
              <h4 className="text-base font-serif text-ink mb-1">Contact this Guide</h4>
              <p className="text-xs text-ink-soft">Send a message to explore guidance resonances</p>
            </div>
            {selectedMentor.status === 'Unclaimed' && !currentUser ? (
              <div className="p-5 bg-amber-50/60 border border-amber-200/50 rounded-2xl text-center space-y-3">
                <p className="text-xs font-semibold text-[#7a4f1a] leading-relaxed font-sans">
                  💡 <strong>Registration Required</strong>: This mentor profile has not been claimed. To route your inquiry automatically to a matching verified guide, please log in or register a free account.
                </p>
                <button
                  onClick={() => {
                    closeDetailModal();
                    const event = new CustomEvent('navigate-view', { detail: 'profile' });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2.5 bg-waldorf-secondary text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-sm border-none cursor-pointer font-sans"
                >
                  Register or Sign In
                </button>
              </div>
            ) : msgSentSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="shrink-0 text-green-600 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-bold">Message Sent Successfully!</p>
                  {routedData?.routed ? (
                    <p className="text-xs text-green-600/80 mt-1 leading-relaxed">
                      Please note: <strong>{selectedMentor.name}</strong> has not yet claimed their profile. To ensure you receive timely developmental guidance, we have automatically passed your enquiry to our next most suitably qualified verified guide, <strong>{routedData.name}</strong> (specialist in {routedData.specialties}).
                    </p>
                  ) : (
                    <p className="text-xs text-green-600/80 mt-1">Your inquiry has been stored in our system and logged in the System Admin workflow dashboard for approval.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Your Name" value={senderName} onChange={(e) => setSenderName(e.target.value)} required className="w-full px-4 py-2 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage transition-colors" />
                  <input type="email" placeholder="Your Email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} required className="w-full px-4 py-2 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage transition-colors" />
                </div>
                <textarea placeholder="Type your message about developmental guidance, lesson rhythms, or parenting advice..." rows={3} value={messageText} onChange={(e) => setMessageText(e.target.value)} required className="w-full px-4 py-3 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage transition-colors resize-none" />
                <button type="submit" disabled={sendingMsg} className="w-full flex items-center justify-center gap-2 py-2.5 bg-sage text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-md active:scale-[0.98] disabled:opacity-50">
                  {sendingMsg ? "Sending message..." : (<>
                    <Send size={12} /> Send Guidance Request
                  </>)}
                </button>
              </form>
            )}
          </div>
        </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>,
  document.body
)}

{mentorMessages.length > 0 && (
  <div className="mt-6">
    <h3 className="text-base font-semibold text-ink mb-2">Messages from seekers</h3>
    <div className="space-y-4">
      {mentorMessages.map(msg => (
        <div key={msg.id} className="p-3 bg-white/5 border border-border rounded-lg">
          <p className="text-sm text-ink-soft"><span className="font-medium">{msg.senderName}</span> ({msg.senderEmail})</p>
          <p className="mt-1 text-base text-ink">{msg.message}</p>
          <p className="mt-1 text-sm text-ink-soft">{new Date(msg.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  </div>
)}

{showUpgradeModal && (
  <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[100] flex justify-center items-center p-4" onClick={() => setShowUpgradeModal(false)}>
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white border border-border rounded-[28px] max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
      <h3 className="font-serif text-xl text-ink font-bold mb-2">Upgrade to Seeker Pro</h3>
      <p className="text-xs text-ink-soft mb-4">{upgradeModalMessage}</p>
      <div className="space-y-3">
        <button onClick={() => {
          setShowUpgradeModal(false);
          window.open(upgradeModalUrl, '_blank');
        }} className="w-full py-2.5 bg-sage text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer border-none">
          Upgrade to Seeker Pro ($9.99/mo)
        </button>
        <button onClick={() => setShowUpgradeModal(false)} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-ink-soft font-bold rounded-xl transition-all cursor-pointer border-none font-sans text-xs">
          Continue with Free (wait for next month)
        </button>
      </div>
    </motion.div>
  </div>
)}
    </div>
  );
}
