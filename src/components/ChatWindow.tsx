import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Brain, Heart, Hand } from 'lucide-react';
import { getWaldorfAdvice } from '../services/geminiService';
import { getMentors } from '../services/workflowService';
import { Mentor } from '../data/mentors';

interface ExtendedChatMessage {
  role: 'user' | 'model';
  text: string;
  recommendedMentorIds?: string[];
}

interface ChatWindowProps {
  onTagsUpdate: (tags: string[]) => void;
  onSelectMentor: (mentorId: string) => void;
  recommendedTags: string[];
}

export function ChatWindow({ onTagsUpdate, onSelectMentor, recommendedTags }: ChatWindowProps) {
  const [messages, setMessages] = React.useState<ExtendedChatMessage[]>([
    {
      role: 'model',
      text: "Warm greetings. I am your Nina Mentor Hub guide. How is the rhythmic flow of your child's inner life today? Feel free to share their age and any challenges you are noticing."
    }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [allMentors, setAllMentors] = React.useState<Mentor[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await getMentors();
        setAllMentors(data);
      } catch (err) {
        console.error("Failed to fetch mentors for concierge:", err);
      }
    };
    fetchMentors();
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const historyForAI = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await getWaldorfAdvice(userText, historyForAI, allMentors);
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.advice,
        recommendedMentorIds: response.recommendedMentorIds
      }]);
      onTagsUpdate(response.recommendedTags);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/10">
      {/* Header */}
      <div className="py-1.5 md:py-2.5 px-3 md:px-6 border-b border-border bg-white/40">
        <p className="hidden md:block text-[11px] font-bold text-sage tracking-widest uppercase mb-0.5">GREETINGS, PARENT</p>
        <div className="flex flex-row items-center justify-between gap-1.5">
          <h2 className="text-sm md:text-xl font-serif text-ink flex items-center gap-1">
            Pedagogical Guide
            <Sparkles size={14} className="text-gold animate-pulse" />
          </h2>
          <div className="flex gap-2 sm:gap-4 mt-0">
            <div className="flex items-center gap-1 text-[9px] md:text-[11px] uppercase tracking-widest font-bold text-ink-soft">
              <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#dce8f5] text-[#2c4a6e] flex items-center justify-center"><Brain size={8} /></span> <span className="hidden xs:inline">Head</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] md:text-[11px] uppercase tracking-widest font-bold text-ink-soft">
              <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#fdf0d0] text-[#7a4f1a] flex items-center justify-center"><Heart size={8} /></span> <span className="hidden xs:inline">Heart</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] md:text-[11px] uppercase tracking-widest font-bold text-ink-soft">
              <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-sage-pale text-sage flex items-center justify-center"><Hand size={8} /></span> <span className="hidden xs:inline">Hands</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-3 md:py-5 px-3 md:px-6 space-y-4 md:space-y-6 custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* Intro Card */}
        <div className="watercolor-card p-3 md:p-6 bg-[#fdf0d0]/30 border border-[#d4a84b]/40 rounded-2xl space-y-2 md:space-y-3 shadow-[0_10px_35px_-5px_rgba(255,224,130,0.15)] animate-float">
          <h3 className="font-serif text-sm md:text-xl text-[#7a4f1a] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#d4a84b]" />
            Resonance-Based Waldorf Placement
          </h3>
          <p className="hidden md:block text-sm text-ink leading-relaxed font-serif">
            Steiner education holds that children grow through distinct <strong>Seven-Year Cycles</strong>. In the first cycle (0-7), they learn through <strong>will and imitation</strong> (Hands). In the second cycle (7-14), they learn through <strong>feeling and imagination</strong> (Heart). In the third cycle (14+), they develop <strong>intellectual judgment</strong> (Head).
          </p>
          <p className="hidden md:block text-sm text-ink leading-relaxed font-serif">
            By profiling your child's core temperament—whether it's the warm, outgoing <strong>Sanguine</strong>, the deep, reflective <strong>Melancholic</strong>, the active, driven <strong>Choleric</strong>, or the steady, peaceful <strong>Phlegmatic</strong>—our AI Concierge maps these developmental flows to recommend guides with matching specialties and teaching rhythms.
          </p>
          <p className="text-xs md:text-sm uppercase font-bold text-earth tracking-wide">
            Describe your child's age and temperament below to find their ideal mentor resonance.
          </p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[90%] p-6 rounded-2xl shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-sage-pale/40 border border-sage-light/35 text-ink rounded-tr-none font-sans text-base' 
                    : 'bg-white border border-border text-ink rounded-tl-none font-serif text-lg md:text-xl leading-relaxed'
                }`}
              >
                {m.text}
              </div>

              {/* Recommended Mentors badges */}
              {m.role === 'model' && m.recommendedMentorIds && m.recommendedMentorIds.length > 0 && (
                <div className="mt-4 flex flex-col gap-2 w-full max-w-[90%] watercolor-fade-in">
                  <p className="text-xs font-bold text-earth uppercase tracking-wider pl-1">Suggested Guides:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {m.recommendedMentorIds.map(id => {
                      const mentor = allMentors.find(men => men.id === id);
                      if (!mentor) return null;
                      const showDefaultAvatar = !mentor.photoUrl || 
                        mentor.photoUrl.includes('pravatar') || 
                        mentor.photoUrl.includes('placeholder') ||
                        mentor.status === 'Pending' ||
                        mentor.status === 'Unclaimed' ||
                        !mentor.subscriptionActive;
                      return (
                        <div 
                          key={id}
                          className="flex items-center gap-3 p-3 bg-white/90 border border-border rounded-2xl shadow-sm hover:shadow-md transition-all"
                        >
                          {showDefaultAvatar ? (
                            <svg viewBox="0 0 100 100" className="w-10 h-10 rounded-xl bg-[#fdfaf2] p-1.5 text-sage" aria-hidden="true">
                              <defs>
                                <radialGradient id="waterGradChat" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#f7f9f5" stopOpacity="1" />
                                  <stop offset="50%" stopColor="#eaf2e3" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#dcecd0" stopOpacity="0.1" />
                                </radialGradient>
                              </defs>
                              <circle cx="50" cy="50" r="40" fill="url(#waterGradChat)" />
                              <path d="M50 30 C40 30 32 38 32 48 C32 60 50 74 50 74 C50 74 68 60 68 48 C68 38 60 30 50 30 Z" fill="none" stroke="#7a8c6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="50" cy="48" r="6" fill="#7a8c6e" />
                            </svg>
                          ) : (
                            <img 
                              src={mentor.photoUrl} 
                              alt={mentor.name} 
                              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-serif font-bold text-ink truncate">{mentor.name}</p>
                            <p className="text-[11px] text-ink-soft truncate">{mentor.specialties.slice(0, 2).join(', ')}</p>
                          </div>
                          <button
                            onClick={() => onSelectMentor(mentor.id)}
                            className="px-2.5 py-1 bg-sage text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all uppercase tracking-wider shrink-0 cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white p-6 rounded-2xl rounded-tl-none flex gap-2 border border-border">
                <span className="w-2 h-2 bg-sage/30 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-sage/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-sage/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="py-2.5 px-6 bg-white/40 border-t border-border">
        {/* Quick Temperament Chips */}
        <div className="flex flex-wrap gap-2 mb-3 items-center justify-start" role="group" aria-label="Quick temperament prompts">
          <span className="text-[10px] uppercase tracking-wider font-bold text-sage-light shrink-0">Temperament:</span>
          {[
            { name: 'Sanguine', color: 'bg-[#fdf0d0] text-[#7a4f1a] border-[#e8c87a]/60 hover:bg-[#fdf0d0]/80', prompt: "My child is light, social, and has a Sanguine temperament." },
            { name: 'Melancholic', color: 'bg-[#dce8f5] text-[#2c4a6e] border-[#b0c4d8]/60 hover:bg-[#dce8f5]/80', prompt: "My child is thoughtful, sensitive, and has a Melancholic temperament." },
            { name: 'Choleric', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80', prompt: "My child is active, strong-willed, and has a Choleric temperament." },
            { name: 'Phlegmatic', color: 'bg-sage-pale text-sage border-sage-light/30 hover:bg-sage-pale/80', prompt: "My child is steady, peaceful, and has a Phlegmatic temperament." }
          ].map(t => (
            <button
              key={t.name}
              type="button"
              onClick={() => setInput(prev => prev ? `${prev} ${t.prompt}` : t.prompt)}
              className={`px-2.5 py-0.5 text-[11px] rounded-full border font-bold cursor-pointer transition-all shadow-sm active:scale-95 ${t.color}`}
              aria-label={`Set ${t.name} temperament`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="relative group">
          <label htmlFor="chat-input" className="sr-only">Chat message</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How is your child's inner life today?..."
            className="w-full bg-white/80 border border-border rounded-2xl py-2.5 px-5 pr-14 focus:outline-none focus:border-sage transition-all font-serif italic text-base shadow-inner"
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-sage to-sage-light text-white rounded-xl shadow hover:opacity-90 disabled:opacity-30 transition-all cursor-pointer"
            aria-label="Send message"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="text-[10px] text-sage mt-1.5 text-center uppercase tracking-widest font-bold opacity-60">
          In the light of the sun, nurturing the child
        </p>
      </form>
    </div>
  );
}
