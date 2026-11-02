/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { showSuccess, showError } from './utils/toastUtils';
import { Leaf, Search, BookOpen, User as UserIcon, Sparkles, X, CreditCard, ArrowUp } from 'lucide-react';
import { GlobalSearchBar } from './components/GlobalSearchBar';
import { AboutModalContent } from './components/AboutModalContent';
import { ArticleViewer } from './components/ArticleViewer';
const EnhancedDirectory = React.lazy(() => import('./components/EnhancedDirectory').then(m => ({ default: m.EnhancedDirectory })));
const ProfilePanel = React.lazy(() => import('./components/ProfilePanel').then(m => ({ default: m.ProfilePanel })));
const ResourcesPanel = React.lazy(() => import('./components/ResourcesPanel').then(m => ({ default: m.ResourcesPanel })));
import { getVerseOfTheDay, getMentors, submitSponsorInquiry, logSponsorPayment } from './services/workflowService';
import { Mentor } from './data/mentors';
import { getCurrentCOTSIndex, DAILY_DATA, SPLASH_VERSES, COTS_VERSES } from './data/dailyData';

// Local ErrorBoundary for ResourcesPanel to prevent app-wide crashes
interface ResourcesErrorBoundaryProps {
  children: React.ReactNode;
}
interface ResourcesErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class ResourcesErrorBoundary extends React.Component<ResourcesErrorBoundaryProps, ResourcesErrorBoundaryState> {
  public props!: ResourcesErrorBoundaryProps;
  state: ResourcesErrorBoundaryState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ResourcesPanel error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <div className="text-3xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-ink mb-2">Resources Temporarily Unavailable</h2>
          <p className="text-ink-soft mb-4">We're having trouble loading resources. Please try again later.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sage text-white rounded-xl hover:bg-sage-dark transition-colors">
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_PRIVACY = `Privacy Policy for The Waldorf Path\n\nLast updated: July 2026\n\nAt The Waldorf Path, we take the privacy of our directory guides and visitors seriously.\n\n1. Information We Collect\nWe collect email addresses only when profile claims or sponsor inquiries are initiated.\n\n2. Messaging and Inquiries\nSeeker inquiry messages and contact logs are stored securely. We do not sell or share personal contact information.\n\n3. System Logs & Security\nAccess to the admin back-office is strictly password-protected. All credentials and configuration keys are stored in secure formats.`;

const DEFAULT_TERMS = `Terms & Conditions for The Waldorf Path\n\nLast updated: July 2026\n\nBy claiming a profile or using this directory, you agree to:\n\n1. Directory Listings & Claiming\nProvide accurate credentials when claiming guide profiles.\n\n2. Acceptable Conduct\nRespect our members and avoid spamming. All messages must represent genuine inquiries.\n\n3. Subscriptions & Billing\nUpgrade packages are billed on recurring cycles.`;

const DEFAULT_COOKIES = `Cookies & Local Storage Policy\n\nLast updated: July 2026\n\nThe Waldorf Path uses essential local storage to save custom API key configurations and session states. No tracking or promotional profiling cookies are deployed.`;

const DEFAULT_DISCLAIMER = `Disclaimer\n\nThe Waldorf Path is an independent educational resource created to support families, educators, and anyone interested in Waldorf-inspired education. It is not affiliated with, endorsed by, sponsored by, or officially connected to Waldorf®, Rudolf Steiner organizations, the Association of Waldorf Schools of North America (AWSNA), or any other Waldorf or Steiner organization. All trademarks and registered trademarks remain the property of their respective owners and are used for identification purposes only.`;

const DEFAULT_ABOUT = `About Us\n\nThe Waldorf Path was woven together by three women — Romy, a certified early-childhood Waldorf educator; Elody, a soon-to-be Waldorf handwork teacher; and Nina, a mother whose three children grew up in the warmth of the Waldorf home and school. We come from different paths and different places, but we cherish the same deep conviction: that the wisdom living in Waldorf education deserves to be found, loved, and carried forward by as many families as possible.\n\nOur Mission\nThe Directory is our gift to your Waldorf path.`;

type NavTab = 'home' | 'directory' | 'resources' | 'profile' | 'documents' | 'coming-soon';

const HEAD_PILLS = [
  { id: 'adult-ed', label: 'Adult Education & Training' },
  { id: 'mustread', label: 'Must-Read Books' },
  { id: 'books', label: 'Books & Publications' },
  { id: 'reading', label: "Children's Reading Guide" },
  { id: 'schools', label: 'Schools & Kindergartens' },
  { id: 'homeschool', label: 'Homeschooling' },
  { id: 'temperaments', label: 'Four Temperaments' },
  { id: 'lifecycle', label: 'Lifecycle & Development' },
  { id: 'calendar', label: 'Calendar of the Soul' },
  { id: 'health', label: 'Health & Doctors' },
  { id: 'anthroposophical', label: 'Anthroposophical Hospitals / Doctors / Pharmacies' },
  { id: 'world-lists', label: 'World Lists' },
  { id: 'nutrition', label: 'Nutrition & Food' },
  { id: 'planetary', label: 'Planetary Week' },
  { id: 'curative', label: 'Special Needs & Curative' },
  { id: 'germany', label: 'Germany' },
  { id: 'global', label: 'Global — S. America & Africa' },
];

const HEART_PILLS = [
  { id: 'seasons', label: 'Seasons & Festivals' },
  { id: 'verses', label: 'Verses' },
  { id: 'fingergames', label: 'Finger Games' },
  { id: 'songs', label: 'Songs' },
  { id: 'music', label: 'Music & Instruments' },
  { id: 'dolls', label: 'Dolls & Dollhouses' },
  { id: 'chalkboard', label: 'Chalkboard Art' },
  { id: 'camps', label: 'Summer Camps' },
  { id: 'community', label: 'Community & Makers' },
];

const HANDS_PILLS = [
  { id: 'baby', label: 'Baby Care' },
  { id: 'clothing', label: 'Clothing & Dress-Up' },
  { id: 'toys', label: 'Toys & Art Supplies' },
  { id: 'handwork', label: 'Handwork Curriculum' },
  { id: 'wool', label: 'Wool & Handwork Supplies' },
  { id: 'woodwork', label: 'Woodwork' },
  { id: 'biodynamic', label: 'Biodynamic Agriculture' },
  { id: 'secondhand', label: 'Second Hand' },
  { id: 'naturaldye', label: 'Natural Dyeing' },
];

const HEAD_TAGS = ['Adult Education', 'Books', 'Reading', 'Schools', 'Homeschooling', 'Temperaments', 'Development', 'Calendar', 'Health', 'Anthroposophical', 'World Lists', 'Nutrition', 'Special Needs', 'Germany'];
const HEART_TAGS = ['Seasons', 'Festivals', 'Verses', 'Finger Games', 'Songs', 'Music', 'Dolls', 'Chalkboard', 'Camps', 'Community'];
const HANDS_TAGS = ['Baby Care', 'Clothing', 'Toys', 'Handwork', 'Wool', 'Woodwork', 'Biodynamic', 'Second Hand', 'Natural Dyeing'];

const PILL_TAG_MAP: Record<string, string[]> = {
  'adult-ed': ['Adult Education', 'Training'],
  'mustread': ['Must-Read Books'],
  'books': ['Books', 'Publications'],
  'reading': ['Reading'],
  'schools': ['Schools', 'Kindergartens'],
  'homeschool': ['Homeschooling'],
  'temperaments': ['Temperaments'],
  'lifecycle': ['Development', 'Lifecycle'],
  'calendar': ['Calendar of the Soul'],
  'health': ['Health', 'Doctors'],
  'anthroposophical': ['Anthroposophical Hospitals', 'Anthroposophical Doctors', 'Anthroposophical Pharmacies'],
  'world-lists': ['Waldorf World List', 'IASWECE World List'],
  'nutrition': ['Nutrition', 'Food'],
  'planetary': ['Planetary Week'],
  'curative': ['Special Needs', 'Curative'],
  'germany': ['Germany'],
  'global': ['Global', 'South America', 'Africa'],
  'seasons': ['Seasons', 'Festivals'],
  'verses': ['Verses'],
  'fingergames': ['Finger Games', 'Rhymes'],
  'songs': ['Songs', 'Singing'],
  'music': ['Music', 'Instruments', 'Piano', 'Pentatonic', 'Flute'],
  'dolls': ['Dolls', 'Dollhouses', 'Puppets'],
  'chalkboard': ['Chalkboard Art'],
  'camps': ['Summer Camps'],
  'community': ['Community', 'Makers'],
  'baby': ['Baby Care'],
  'clothing': ['Clothing', 'Dress-Up'],
  'toys': ['Toys', 'Art Supplies'],
  'handwork': ['Handwork Curriculum', 'Craft'],
  'wool': ['Wool', 'Handwork Supplies'],
  'woodwork': ['Woodwork', 'Wood Carving'],
  'biodynamic': ['Biodynamic Agriculture', 'Farming'],
  'secondhand': ['Second Hand', 'Resale'],
  'naturaldye': ['Natural Dyeing', 'Dye Plants'],
};

const DEFAULT_SPONSORS = [
  { name: "Sunbridge Institute", description: "Waldorf Teacher Training and summer workshops.", logoUrl: "https://i.pravatar.cc/100?u=Sunbridge", link: "https://sunbridge.edu" },
  { name: "Simplicity Parenting", description: "Warm discipline and simplicity rhythm coaching.", logoUrl: "https://i.pravatar.cc/100?u=Simplicity", link: "https://simplicityparenting.com" },
  { name: "TeachingWaldorf", description: "Grade lesson planners, booklets, and art guides.", logoUrl: "https://i.pravatar.cc/100?u=TeachingWaldorf", link: "https://teachingwaldorf.com" },
  { name: "Waldorf Modern UK", description: "International teacher seminars and drama courses.", logoUrl: "https://i.pravatar.cc/100?u=WaldorfModern", link: "https://waldorfmodern.uk" }
];

// ── 3D Interactive Three Pillar Section Component ──
function ThreePillarSection() {
  const [openModal, setOpenModal] = React.useState<'head' | 'heart' | 'hands' | null>(null);

  const pillars = [
    {
      id: 'head' as const,
      label: 'HEAD',
      subtitle: 'Thinking',
      color: '#dce8f5',
      borderColor: '#2c4a6e',
      textColor: '#2c4a6e',
      icon: '☀️',
      content: `HEAD — THINKING

Waldorf education seeks to awaken the child's thinking through imagination, stories, wonder, and the discovery of the world. Learning is not simply about filling a child's mind with facts, but about encouraging curiosity, asking why things are the way they are, and developing a genuine understanding of the world. The aim is not just to know, but to understand.`
    },
    {
      id: 'heart' as const,
      label: 'HEART',
      subtitle: 'Feeling',
      color: '#fdf0d0',
      borderColor: '#7a4f1a',
      textColor: '#7a4f1a',
      icon: '💛',
      content: `HEART — FEELING

The feeling life is nurtured through music, painting, storytelling, drama, and the beauty of the natural world. Art gives children a way to experience life more deeply, to develop a sense for beauty, and to meet the world with interest and care. Through these experiences, children gradually develop empathy, reverence, wonder and a sense of responsibility toward others.`
    },
    {
      id: 'hands' as const,
      label: 'HANDS',
      subtitle: 'Willing',
      color: '#e8ede4',
      borderColor: '#3a6b3e',
      textColor: '#3a6b3e',
      icon: '🙌',
      content: `HANDS — WILLING

The will is cultivated through doing and through meaningful, practical work. Baking bread, tending a garden, working with wood, knitting, building, and caring for the classroom give children the opportunity to engage with the world in a hands-on way. Through everyday tasks and practical activities, children learn to take responsibility, develop useful life skills, and experience the satisfaction of creating something with their own hands. They learn patience by staying with a task, perseverance by working through difficulties, and confidence by seeing something through to completion.`
    }
  ];

  return (
    <>
      <div className="space-y-8">
        {/* Section Title */}
        <div className="text-center mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sage mb-2">The Three Pillars of Waldorf Education</p>
          <h2 className="text-2xl md:text-3xl font-serif text-ink font-semibold">Head · Heart · Hands</h2>
          <p className="text-sm text-ink-soft italic mt-2 max-w-xl mx-auto">Three faculties. One integrated education. Click to explore each realm.</p>
        </div>

        {/* Three Buttons Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          {pillars.map((pillar) => (
            <motion.button
              key={pillar.id}
              onClick={() => setOpenModal(pillar.id)}
              whileHover={{ scale: 1.05, y: -8, rotateX: [0, 5, -5, 0], rotateY: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group w-full md:w-64 h-40 md:h-48 rounded-2xl overflow-hidden cursor-pointer shadow-xl"
              style={{
                background: `linear-gradient(145deg, ${pillar.color} 0%, ${pillar.color}DD 100%)`,
                border: `2px solid ${pillar.borderColor}`,
                boxShadow: `0 10px 40px ${pillar.borderColor}33, inset 0 1px 0 rgba(255,255,255,0.3)`
              }}
              aria-label={`Explore ${pillar.label} — ${pillar.subtitle}`}
            >
              {/* 3D Watercolour Wash Effect */}
              <motion.div
                animate={{ x: [0, 10, -10, 0], y: [0, -10, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(ellipse at 30% 30%, ${pillar.borderColor}40 0%, transparent 60%),
                             radial-gradient(ellipse at 70% 70%, ${pillar.borderColor}30 0%, transparent 50%)`
                }}
              />
              {/* Subtle Paper Texture */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
              }} />
              
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                <span className="text-3xl md:text-4xl mb-2" aria-hidden="true">{pillar.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: pillar.textColor }}>{pillar.subtitle}</span>
                <span className="text-xl md:text-2xl font-serif font-bold" style={{ color: pillar.textColor }}>{pillar.label}</span>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs font-medium uppercase tracking-wider"
                  style={{ color: pillar.textColor }}
                >
                  Click to explore →
                </motion.div>
              </div>
              
              {/* Glow on hover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 0.15, scale: 1.2 }}
                className="absolute inset-0 rounded-2xl"
                style={{ background: `radial-gradient(circle at center, ${pillar.borderColor} 0%, transparent 70%)` }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpenModal(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pillar-modal-title"
          >
            <div
              className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-8"
              style={{ backgroundColor: pillars.find(p => p.id === openModal)?.color || '#fff' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpenModal(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors text-ink-soft"
                aria-label="Close modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4" style={{ color: pillars.find(p => p.id === openModal)?.textColor }}>
                  {pillars.find(p => p.id === openModal)?.label} — {pillars.find(p => p.id === openModal)?.subtitle}
                </h2>
                <div className="whitespace-pre-wrap text-base leading-relaxed text-ink-soft" style={{ color: pillars.find(p => p.id === openModal)?.textColor }}>
                  {pillars.find(p => p.id === openModal)?.content}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Coming Soon Landing Page Component ──
function ComingSoonPage() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // In production, this would call your backend/API
      // await fetch('/api/coming-soon', { method: 'POST', body: JSON.stringify({ email }) });
      console.log('Coming soon signup:', email);
      setSubmitted(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-pale via-mist to-sage-light p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #7a8c6e 0%, #5a6b4e 100%)' }}>
            <span className="text-3xl" aria-hidden="true">🌿</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-ink font-semibold mb-2">The Waldorf Path</h1>
          <p className="text-ink-soft italic">Something beautiful is growing...</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-pale text-sage rounded-full text-sm font-bold uppercase tracking-wider mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage"></span>
              </span>
              Coming Soon
            </div>
            <h2 className="text-2xl font-serif text-ink font-semibold mb-3">We're Preparing Something Special</h2>
            <p className="text-ink-soft leading-relaxed">
              A new way to experience Waldorf education is taking shape. 
              Be the first to know when we launch.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-3.5 bg-white border border-border rounded-xl outline-none focus:border-sage focus:ring-2 focus:ring-sage/10 transition-all text-ink placeholder-ink-soft/50"
                  autoComplete="email"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-coral text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full py-3.5 bg-sage text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md focus:outline-none focus:ring-2 focus:ring-sage/50 focus:ring-offset-2"
              >
                Notify Me
              </button>
              <p className="text-xs text-ink-soft/60 text-center">We respect your privacy. No spam, ever.</p>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-serif text-ink font-semibold mb-2">You're on the List!</h3>
              <p className="text-ink-soft mb-6">We'll notify you as soon as The Waldorf Path launches.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-sage font-bold hover:text-sage-dark underline"
              >
                Different email?
              </button>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 text-xs text-ink-soft/60">
          <a href="#" className="hover:text-sage transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-sage transition-colors">Terms</a>
          <span>•</span>
          <a href="#" className="hover:text-sage transition-colors">Contact</a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [recommendedTags, setRecommendedTags] = React.useState<string[]>([]);
  const [activeView, setActiveView] = React.useState<NavTab>('home');
  const [selectedMentorId, setSelectedMentorId] = React.useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = React.useState<{ filePath: string; title: string } | null>(null);
  const [verse, setVerse] = React.useState<{title: string, content: string, season: string} | null>(null);
  const [featuredMentors, setFeaturedMentors] = React.useState<Mentor[]>([]);

  const [showSplash, setShowSplash] = React.useState(false);
  const [cotsIndex, setCotsIndex] = React.useState(getCurrentCOTSIndex());
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  const [policyModal, setPolicyModal] = React.useState<'privacy' | 'terms' | 'cookies' | 'sponsor' | 'pwa' | 'about' | 'disclaimer' | null>(null);
  const [policyTexts, setPolicyTexts] = React.useState({ privacy: DEFAULT_PRIVACY, terms: DEFAULT_TERMS, cookies: DEFAULT_COOKIES, disclaimer: DEFAULT_DISCLAIMER, about: DEFAULT_ABOUT });

  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstall = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) setIsInstallable(false);
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    getMentors().then(all => {
      const featured = all.filter(m => m.featuredActive || m.status === 'Verified').slice(0, 8);
      setFeaturedMentors(featured);
    }).catch(() => {});
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) { alert("App installation is not supported in your browser."); return; }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleGlobalNavigate = (view: NavTab, data?: any) => {
    if (view === 'directory' && data?.mentorId) {
      setSelectedMentorId(data.mentorId);
      setRecommendedTags([]);
      setActiveView('directory');
    } else if (view === 'documents' && data?.filePath) {
      setSelectedDocument({ filePath: data.filePath, title: data.title || 'Article' });
      setRecommendedTags([]);
      setActiveView('documents');
    } else {
      setRecommendedTags([]);
      setActiveView(view);
    }
  };

  const [sponsors, setSponsors] = React.useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('SITE_SPONSORS_LIST');
      if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    }
    return DEFAULT_SPONSORS;
  });

  const [sponsorTier, setSponsorTier] = React.useState('$15/mo - Home Ticker Slot');
  const [paymentSimulated, setPaymentSimulated] = React.useState(false);
  const [sponsorSubmitted, setSponsorSubmitted] = React.useState(false);
  const [sponsorName, setSponsorName] = React.useState('');
  const [sponsorEmail, setSponsorEmail] = React.useState('');
  const [sponsorLogo, setSponsorLogo] = React.useState('');
  const [sponsorDesc, setSponsorDesc] = React.useState('');
  const [sponsorLink, setSponsorLink] = React.useState('');

  React.useEffect(() => {
    const syncSettings = () => {
      const rawSponsors = localStorage.getItem('SITE_SPONSORS_LIST');
      if (rawSponsors) { try { setSponsors(JSON.parse(rawSponsors)); } catch (e) {} }
      else { setSponsors(DEFAULT_SPONSORS); }
    };
    window.addEventListener('storage', syncSettings);
    const interval = setInterval(syncSettings, 2000);
    return () => { window.removeEventListener('storage', syncSettings); clearInterval(interval); };
  }, []);

React.useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mentorId') || params.get('id')) {
        setActiveView('directory');
        setSelectedMentorId(params.get('mentorId') || params.get('id'));
      }
      // Handle Coming Soon page via URL parameter
      if (params.get('coming-soon') === 'true' || params.get('view') === 'coming-soon') {
        setActiveView('coming-soon');
      }
      // Handle Stripe success redirect
     const sessionId = params.get('session_id');
     if (sessionId) {
       // Call the API to verify the session and update account/mentor
       fetch('/api/stripe-success', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ session_id: sessionId })
       })
       .then(async (response) => {
         if (!response.ok) {
           throw new Error(`Failed to verify session: ${response.statusText}`);
         }
         const result = await response.json();
         // Clear the session_id from URL to avoid reprocessing on refresh
         const newParams = new URLSearchParams(window.location.search);
         newParams.delete('session_id');
         const newUrl = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`;
         window.history.replaceState({}, '', newUrl);
         // Show success message
         showSuccess("Payment processed successfully! Your account has been updated.");
       })
       .catch((error) => {
         console.error('Stripe success error:', error);
         showError("Payment verification failed. Please contact support.");
         // Still clear the session_id to avoid retry loop
         const newParams = new URLSearchParams(window.location.search);
         newParams.delete('session_id');
         const newUrl = `${window.location.pathname}${newParams.toString() ? '?' + newParams.toString() : ''}`;
         window.history.replaceState({}, '', newUrl);
       });
     }

     const handleNavigate = (e: Event) => {
       const view = (e as CustomEvent).detail;
       if (view) setActiveView(view);
     };
     window.addEventListener('navigate-view', handleNavigate);
     const loadVerse = async () => {
       try { const data = await getVerseOfTheDay('Spring'); setVerse(data); } catch (e) {}
     };
     loadVerse();
     return () => window.removeEventListener('navigate-view', handleNavigate);
   }, []);

  const handleSponsorStripeCheckout = async () => {
    const confirmPayment = window.confirm(`Proceed to simulated Stripe Checkout for ${sponsorTier}?`);
    if (confirmPayment) { await logSponsorPayment(sponsorTier); setPaymentSimulated(true); }
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName || !sponsorLink || !sponsorLogo || !sponsorDesc) { alert("Please fill in all fields."); return; }
    await submitSponsorInquiry(sponsorName, sponsorEmail, sponsorLink, sponsorDesc, sponsorLogo, sponsorTier);
    const updated = [...sponsors, { name: sponsorName, description: sponsorDesc, logoUrl: sponsorLogo, link: sponsorLink }];
    setSponsors(updated);
    localStorage.setItem('SITE_SPONSORS_LIST', JSON.stringify(updated));
    setSponsorSubmitted(true);
  };

  const today = new Date();
  const dow = today.getDay();
  const dailyGift = DAILY_DATA[dow] || DAILY_DATA[0];
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const splashVerse = SPLASH_VERSES[dayOfYear % SPLASH_VERSES.length] || SPLASH_VERSES[0];
  const currentCotsVerse = COTS_VERSES[cotsIndex] || COTS_VERSES[0];

  const allPills = [
    ...HEAD_PILLS.map(p => ({ ...p, section: 'head' as const })),
    ...HEART_PILLS.map(p => ({ ...p, section: 'heart' as const })),
    ...HANDS_PILLS.map(p => ({ ...p, section: 'hands' as const })),
  ];

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#080c0b] grid place-items-center text-white/30 font-mono text-xs">Loading cinematic…</div>}>
      <div className="min-h-screen flex flex-col bg-mist text-ink">
        <Toaster position="top-right" />

{/* ── DAILY SPLASH ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[1000] overflow-y-auto py-10 px-4" style={{ backgroundColor: dailyGift.colourBg }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="splash-title"
            aria-describedby="splash-desc">
            <div className="max-w-[540px] w-full mx-auto bg-white border border-border rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="h-[6px] w-full" style={{ backgroundColor: dailyGift.colourHex }} />
              <div className="p-8">
                <div className="text-[12px] font-bold tracking-[0.18em] uppercase text-sage mb-2 flex items-center gap-1">
                  <span aria-hidden="true">🌿</span> <span id="splash-title">The Waldorf Path — Daily Gift</span>
                </div>
                <div className="font-serif text-2xl font-medium text-ink mb-6">
                  <span className="italic font-semibold">{dailyGift.day}</span> · {dateStr}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6" id="splash-desc">
                  {[
                    { icon: dailyGift.planetIcon, label: 'Planet', value: dailyGift.planet },
                    { icon: '🎨', label: 'Colour', value: dailyGift.colour },
                    { icon: '🌾', label: 'Grain', value: dailyGift.grain },
                    { icon: dailyGift.activityIcon, label: 'Activity', value: dailyGift.activity },
                  ].map((item, i) => (
                    <div key={i} className="border border-border/40 rounded-xl p-3 text-center" style={{ backgroundColor: dailyGift.colourBg }}>
                      <span className="text-xl block mb-1" aria-hidden="true">{item.icon}</span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-ink-soft block mb-1">{item.label}</span>
                      <span className="font-serif text-sm font-semibold text-ink block">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/40 my-5" />
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink-soft mb-2">📜 Today's Waldorf Verse</div>
                <div className="text-sm font-semibold text-earth mb-2">{splashVerse.moment}</div>
                <div className="font-serif text-lg italic leading-relaxed text-ink p-4 bg-earth-pale/40 border-l-3 border-gold rounded-r-lg mb-4 whitespace-pre-line text-left">{splashVerse.text}</div>
                <div className="border-t border-border/40 my-5" />
                <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-ink-soft mb-2">🌀 This Week's Calendar of the Soul</div>
                <div className="text-sm font-semibold text-earth mb-2">{currentCotsVerse.title} · Verse {currentCotsVerse.num} of 52</div>
                <div className="font-serif text-[17px] italic leading-relaxed text-ink p-4 bg-sage-pale/40 border-l-3 border-sage rounded-r-lg mb-6 whitespace-pre-line text-left">{currentCotsVerse.english}</div>
                <button onClick={() => setShowSplash(false)}
                  className="w-full py-4 bg-gradient-to-r from-sage to-sage-light hover:opacity-90 text-white border-none rounded-xl font-serif text-lg font-medium cursor-pointer tracking-wide transition-opacity">
                  Enter The Waldorf Path →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

{/* ── HOMEPAGE HEADER WITH FULL COVER ── */}
      {activeView === 'home' && (
        <header className="relative bg-gradient-to-b from-sage-strong via-sage to-sage-light text-white pb-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sage-light rounded-full opacity-10 blur-xl translate-x-20 -translate-y-20" />
          </div>
          <div className="w-full relative">
            <img src="/waldorf-path-cover-19oct26.jpeg" alt="The Waldorf Path" className="w-full h-auto block" />
          </div>
          <div className="max-w-2xl mx-auto px-6 text-center relative z-10 pt-16 pb-8">
            {/* Steiner Bio in Header - Homepage Only */}
            <div className="font-serif text-base text-white/90 leading-relaxed space-y-3 text-left max-w-3xl mx-auto">
              <p className="font-bold text-white">
                <strong className="text-white">Rudolf Steiner (1861–1925)</strong> — philosopher, scientist, artist, and founder of Waldorf education. He completed a doctorate in philosophy, edited Goethe's scientific writings, and lectured over 6,000 times across Europe.
              </p>
              <p>
                On <strong className="text-white">7 September 1919</strong>, Steiner opened the first Waldorf school in Stuttgart at the request of Emil Molt for the children of his factory workers. It was radical: no distinction between rich and poor, art woven through every lesson, teachers with freedom to teach.
              </p>
              <p>
                Today there are over <strong className="text-white">1,200 Waldorf schools</strong> and <strong className="text-white">2,000 kindergartens</strong> worldwide, carrying forward Steiner's vision of education that nurtures the whole child — head, heart, and hands.
              </p>
            </div>
          </div>
        </header>
      )}

      {/* ── NON-HOME TABS: HALFCOVER IMAGE ── */}
      {activeView !== 'home' && (
        <header className="relative bg-gradient-to-b from-sage-strong via-sage to-sage-light text-white pb-8">
          <div className="w-full relative">
            <img src="/The Waldorf Path cover crop 29oct26.jpeg" alt="The Waldorf Path" className="w-full h-auto block" />
          </div>
        </header>
      )}

      {/* ── WIKI SEARCH SECTION (Dark Green) - All Tabs ── */}
      <section className="bg-sage-strong py-6">
        <div className="max-w-2xl mx-auto px-6">
          <GlobalSearchBar onNavigate={handleGlobalNavigate} />
        </div>
      </section>

      {/* ── 3D INTERACTIVE HEAD/HEART/HANDS SECTION - Homepage Only ── */}
      {activeView === 'home' && (
        <section className="py-12 px-6 max-w-2xl mx-auto">
          <ThreePillarSection />
        </section>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="pt-2 md:pt-8 pb-40 px-3 md:px-6 max-w-2xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
              {/* Featured Mentors Scrolling */}
{featuredMentors.length > 0 && (
                <div className="watercolor-card p-4 bg-white/70 overflow-hidden relative">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sage mb-2">⭐ Featured Mentors</p>
                  <div className="relative w-full overflow-hidden whitespace-nowrap py-1">
                    <div className="inline-block animate-marquee hover:pause whitespace-nowrap">
                      {featuredMentors.map((m, idx) => (
                        <button key={`fm-${idx}`} onClick={() => handleGlobalNavigate('directory', { mentorId: m.id })}
                          className="inline-flex items-center gap-2 bg-[#fbf9f4] border border-border rounded-full px-3 py-1.5 mr-3 text-sm hover:bg-sage-pale transition-all cursor-pointer select-none">
                          <img src={m.photoUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover border border-border shrink-0" />
                          <span className="text-ink font-serif font-semibold text-xs">{m.name}</span>
                          <span className="text-[10px] text-ink-soft italic">• {m.specialties.slice(0, 1).join(', ')}</span>
                        </button>
                      ))}
                    </div>
                    <div className="inline-block animate-marquee hover:pause whitespace-nowrap" aria-hidden="true">
                      {featuredMentors.map((m, idx) => (
                        <button key={`fm-dup-${idx}`} onClick={() => handleGlobalNavigate('directory', { mentorId: m.id })}
                          className="inline-flex items-center gap-2 bg-[#fbf9f4] border border-border rounded-full px-3 py-1.5 mr-3 text-sm hover:bg-sage-pale transition-all cursor-pointer select-none">
                          <img src={m.photoUrl} alt={m.name} className="w-5 h-5 rounded-full object-cover border border-border shrink-0" />
                          <span className="text-ink font-serif font-semibold text-xs">{m.name}</span>
                          <span className="text-[10px] text-ink-soft italic">• {m.specialties.slice(0, 1).join(', ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sponsors Ticker */}
              {sponsors.length > 0 && (
                <div className="watercolor-card p-4 bg-white/70 overflow-hidden relative">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a7040] mb-2">Featured Sponsors & Partners</p>
                  <div className="relative w-full overflow-hidden whitespace-nowrap py-1">
                    <div className="inline-block animate-marquee hover:pause whitespace-nowrap">
                      {sponsors.map((sp, idx) => (
                        <a key={`sp-${idx}`} href={sp.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#fbf9f4] border border-border rounded-full px-3 py-1.5 mr-3 text-sm hover:bg-sage-pale transition-all select-none cursor-pointer">
                          <img src={sp.logoUrl} alt={sp.name} className="w-5 h-5 rounded-full object-cover border border-border shrink-0" />
                          <span className="text-ink font-serif font-semibold text-xs">{sp.name}</span>
                          <span className="text-[10px] text-ink-soft italic">• {sp.description}</span>
                        </a>
                      ))}
                    </div>
                    <div className="inline-block animate-marquee hover:pause whitespace-nowrap" aria-hidden="true">
                      {sponsors.map((sp, idx) => (
                        <a key={`sp-dup-${idx}`} href={sp.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#fbf9f4] border border-border rounded-full px-3 py-1.5 mr-3 text-sm hover:bg-sage-pale transition-all select-none cursor-pointer">
                          <img src={sp.logoUrl} alt={sp.name} className="w-5 h-5 rounded-full object-cover border border-border shrink-0" />
                          <span className="text-ink font-serif font-semibold text-xs">{sp.name}</span>
                          <span className="text-[10px] text-ink-soft italic">• {sp.description}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Verse */}
              <div className="watercolor-card p-6 bg-sage-pale/40 border-sage-light/20 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 opacity-10 rotate-12 text-sage"><Leaf size={100} /></div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-earth mb-3">Daily Rhythm ({verse?.season || 'Spring'})</p>
                <h2 className="text-xl text-sage mb-3 font-serif">{verse?.title || 'The Morning Sun'}</h2>
                <p className="text-base italic text-ink/80 leading-relaxed font-serif whitespace-pre-line">{verse?.content || `"The morning sun is shining bright,\nIt fills the world with golden light."`}</p>
              </div>

            </motion.div>
          )}

{activeView === 'directory' && (
  <motion.div key="directory" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="watercolor-card overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 220px)' }}>
              <React.Suspense fallback={<div className="flex items-center justify-center py-20 text-sage italic font-serif">Loading directory...</div>}>
                <EnhancedDirectory
                  recommendedTags={recommendedTags}
                  initialSelectedMentorId={selectedMentorId || undefined}
                  onClearInitialMentor={() => { setSelectedMentorId(null); }}
                  onClearTags={() => setRecommendedTags([])}
                  onRemoveTag={(tag) => setRecommendedTags(prev => prev.filter(t => t !== tag))}
                />
              </React.Suspense>
            </motion.div>
          )}

          {activeView === 'resources' && (
            <motion.div key="resources" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="watercolor-card overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 220px)' }}>
              <React.Suspense fallback={<div className="flex items-center justify-center py-20 text-sage italic font-serif">Loading resources...</div>}>
                <ResourcesErrorBoundary>
                  <ResourcesPanel onNavigate={handleGlobalNavigate} />
                </ResourcesErrorBoundary>
              </React.Suspense>
            </motion.div>
          )}

          {activeView === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="watercolor-card flex flex-col" style={{ minHeight: 'calc(100vh - 220px)' }}>
              <React.Suspense fallback={<div className="flex items-center justify-center py-20 text-sage italic font-serif">Loading profile...</div>}>
                <ProfilePanel />
              </React.Suspense>
            </motion.div>
          )}

          {activeView === 'documents' && selectedDocument && (
            <motion.div key="documents" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="watercolor-card flex flex-col" style={{ minHeight: 'calc(100vh - 220px)' }}>
              <React.Suspense fallback={<div className="flex items-center justify-center py-20 text-sage italic font-serif">Loading article...</div>}>
                <ArticleViewer
                  filePath={selectedDocument.filePath}
                  title={selectedDocument.title}
                  onBack={() => setSelectedDocument(null)}
                />
              </React.Suspense>
            </motion.div>
          )}

          {activeView === 'coming-soon' && (
            <motion.div key="coming-soon" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
              className="w-full h-full">
              <ComingSoonPage />
            </motion.div>
          )}
</AnimatePresence>
        </main>


      {/* ── FOOTER ── */}
      <footer className="mt-12 py-6 border-t border-border/20 text-center text-xs text-ink-soft space-y-3">
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="https://www.thewaldorfpath.com" target="_blank" rel="noopener noreferrer" className="text-sage font-bold hover:underline border-none bg-transparent">The Waldorf Path ↗</a>
          <span>•</span>
          <button onClick={() => setPolicyModal('privacy')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('terms')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Terms & Conditions</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('cookies')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Cookies</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('disclaimer')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Disclaimer</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('about')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">About Us</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('pwa')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Install PWA</button>
        </div>
      </footer>

{/* ── BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl shadow-[0_-10px_35px_rgba(122,140,110,0.1)] flex flex-row justify-around items-center px-2 pb-5 pt-2 z-50 rounded-t-[24px] border-t border-border/50" role="navigation" aria-label="Bottom navigation">
        {[
          { id: 'home' as NavTab, label: 'Home', icon: Leaf },
          { id: 'directory' as NavTab, label: 'Directory', icon: Search },
          { id: 'resources' as NavTab, label: 'Resources', icon: BookOpen },
          { id: 'profile' as NavTab, label: 'Profile', icon: UserIcon }
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setRecommendedTags([]); setActiveView(id); }}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all duration-300 rounded-xl ${
              activeView === id ? 'bg-sage-pale text-sage scale-105 shadow-sm font-semibold' : 'text-ink-soft hover:text-sage'
            }`}
            aria-label={label}
            aria-current={activeView === id ? 'page' : undefined}>
            <Icon size={18} className={activeView === id ? 'fill-sage/10' : ''} aria-hidden="true" />
            <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wider whitespace-nowrap">{label}</span>
          </button>
        ))}
</nav>

      {/* ── FOOTER ── */}
      <footer className="mt-12 py-6 border-t border-border/20 text-center text-xs text-ink-soft space-y-3">
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="https://www.thewaldorfpath.com" target="_blank" rel="noopener noreferrer" className="text-sage font-bold hover:underline border-none bg-transparent">The Waldorf Path ↗</a>
          <span>•</span>
          <button onClick={() => setPolicyModal('privacy')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('terms')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Terms & Conditions</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('cookies')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Cookies</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('disclaimer')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Disclaimer</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('about')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">About Us</button>
          <span>•</span>
          <button onClick={() => setPolicyModal('pwa')} className="hover:text-sage transition-colors cursor-pointer font-medium border-none bg-transparent">Install PWA</button>
        </div>
      </footer>

      {/* ── BACK TO TOP ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-5 z-[100] p-3 bg-sage text-white rounded-full shadow-lg hover:bg-sage-dark transition-all cursor-pointer border-none"
            aria-label="Scroll to top">
            <ArrowUp size={20} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

{/* ── POLICY MODALS ── */}
      {policyModal && (
        <div className="fixed inset-0 bg-[#1a2d1d]/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setPolicyModal(null)} role="dialog" aria-modal="true" aria-labelledby="policy-modal-title">
          <div className="bg-white border border-border rounded-[32px] max-w-lg w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl flex flex-col gap-6 custom-scrollbar text-ink" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h3 id="policy-modal-title" className="font-serif text-2xl text-ink font-semibold capitalize">
                {policyModal === 'sponsor' ? 'Become a Sponsor' : policyModal === 'pwa' ? 'Install The Waldorf Path' : policyModal.charAt(0).toUpperCase() + policyModal.slice(1)}
              </h3>
              <button onClick={() => setPolicyModal(null)} className="p-2 hover:bg-sage-pale rounded-full transition-colors text-ink-soft cursor-pointer border-none bg-transparent" aria-label="Close modal"><X size={18} aria-hidden="true" /></button>
            </div>

            {policyModal === 'sponsor' ? (
              <div className="space-y-6">
                <div className="font-sans text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">
                  🌟 Position Your Brand at the Heart of the Waldorf Community

Connect directly with thousands of passionate parents, dedicated teachers, homeschoolers, and Steiner institutions worldwide. Our scrolling sponsor ticker on the homepage is the premier space to showcase your school, organic supply store, teacher training academy, or anthroposophic services.

Choose your visibility level:
- Home Page Ticker Slot: $15/month (Includes logo image, brand name, short description, and direct link)
- Ultimate Ticker + Dedicated Highlight Slot: $35/month (Get standard ticker plus featured priority ranking banner)
                </div>
                {!paymentSimulated ? (
                  <div className="space-y-4 border-t border-border pt-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-sage">Sponsorship Sign-Up</h4>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">Select Ticker Tier</label>
                      <select value={sponsorTier} onChange={e => setSponsorTier(e.target.value)}
                        className="w-full px-4 py-2 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage">
                        <option value="$15/mo - Home Ticker Slot">$15/mo - Home Ticker Slot</option>
                        <option value="$35/mo - Ticker + Dedicated Highlight">$35/mo - Ticker + Dedicated Highlight</option>
                      </select>
                    </div>
                    <button onClick={handleSponsorStripeCheckout}
                      className="w-full py-3 bg-[#6772e5] hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans border-none">
                      <CreditCard size={14} /> Stripe Checkout (${sponsorTier.split(' ')[0]})
                    </button>
                  </div>
                ) : !sponsorSubmitted ? (
                  <form onSubmit={handleSponsorSubmit} className="space-y-4 border-t border-border pt-4">
                    <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-xs flex gap-2 items-start">
                      <span className="font-bold">✓</span>
                      <div><p className="font-bold font-sans">Payment Completed Successfully!</p><p className="mt-0.5 opacity-90 font-sans">Fill out the promotional details below.</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">Sponsor Name</label>
                        <input type="text" value={sponsorName} onChange={e => setSponsorName(e.target.value)} required placeholder="e.g. Sunbridge" className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-1">Contact Email</label>
                        <input type="email" value={sponsorEmail} onChange={e => setSponsorEmail(e.target.value)} required placeholder="sponsor@example.com" className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage" />
                      </div>
                    </div>
                    <input type="url" value={sponsorLink} onChange={e => setSponsorLink(e.target.value)} required placeholder="Website URL" className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage" />
                    <input type="text" value={sponsorLogo} onChange={e => setSponsorLogo(e.target.value)} required placeholder="Logo URL (300x300px)" className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage" />
                    <input type="text" maxLength={120} value={sponsorDesc} onChange={e => setSponsorDesc(e.target.value)} required placeholder="Short description (max 120 chars)" className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-sage" />
                    <button type="submit" className="w-full py-3 bg-sage text-white text-sm font-bold rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer border-none">Submit Promotion Details</button>
                  </form>
                ) : (
                  <div className="p-6 bg-green-50 border border-green-100 text-green-700 rounded-2xl text-center space-y-3 font-sans">
                    <p className="text-sm font-bold">Promotion Details Submitted!</p>
                    <p className="text-xs leading-relaxed opacity-90">Your listing details have been sent for activation. You will be notified once your banner begins scrolling.</p>
                    <button onClick={() => setPolicyModal(null)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs hover:bg-green-700 border-none cursor-pointer">Done</button>
                  </div>
                )}
              </div>
            ) : policyModal === 'pwa' ? (
              <div className="space-y-6">
                <p className="text-sm text-ink-soft font-sans leading-relaxed">Install <strong>The Waldorf Path</strong> on your device for quick home screen access, offline reading, and a native app experience.</p>
                {isInstallable && deferredPrompt ? (
                  <div className="p-5 bg-sage-pale/40 border border-sage-light/30 rounded-2xl text-center space-y-4">
                    <p className="text-sm text-sage font-sans font-bold">📲 Install Ready!</p>
                    <button onClick={handleInstallPWA} className="px-6 py-3 bg-sage hover:opacity-90 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer border-none font-sans">Install Web App</button>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/50 text-[#7a4f1a] rounded-2xl text-xs font-sans leading-relaxed">
                    💡 Your browser may not support automatic install. Use "Add to Home Screen" from your browser menu.
                  </div>
                )}
                <div className="space-y-4 border-t border-border pt-4 text-xs font-sans text-ink-soft">
                  <h4 className="font-bold text-sage uppercase tracking-wider">Manual Installation</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start">
                      <span>🍎</span>
                      <div><strong className="text-ink">iOS (Safari)</strong><p className="mt-0.5">Tap Share → Add to Home Screen → Add</p></div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <span>🤖</span>
                      <div><strong className="text-ink">Android (Chrome)</strong><p className="mt-0.5">Tap ⋮ → Install app → Confirm</p></div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <span>💻</span>
                      <div><strong className="text-ink">Desktop</strong><p className="mt-0.5">Click the Install icon in the address bar</p></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : policyModal === 'about' ? (
              <AboutModalContent />
            ) : (
              <div className="font-serif text-base text-ink-soft leading-relaxed whitespace-pre-wrap pr-2">
{policyModal === 'privacy' && policyTexts.privacy}
{policyModal === 'terms' && policyTexts.terms}
{policyModal === 'cookies' && policyTexts.cookies}
{policyModal === 'disclaimer' && policyTexts.disclaimer}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </React.Suspense>
  );
}


