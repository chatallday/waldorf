import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, ChefHat, ExternalLink, BookOpen, Utensils, Sparkles, Globe, Sun, Leaf, Wheat } from 'lucide-react';
import { HANDWORK_CURRICULUM, NUTRITION_PILLARS } from '../data/societyCuration';
import espanolData from '../data/dir-espanol-1.json';
import deutschData from '../data/dir-deutsch-1.json';

interface DailyRhythm {
  date: string;
  season: string;
  verse: string;
  colour: string;
  grain: string;
  activity: string;
  planet: string;
  imageUrl: string;
}

interface LivingPanelProps {
  initialSubTab?: 'curriculum' | 'rhythms' | 'espanol' | 'deutsch';
}

export function LivingPanel({ initialSubTab = 'curriculum' }: LivingPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'curriculum' | 'rhythms' | 'espanol' | 'deutsch'>(initialSubTab);
  const [dailyRhythm, setDailyRhythm] = useState<DailyRhythm | null>(null);

  // Fetch daily rhythm from published JSON
  useEffect(() => {
    const fetchDailyRhythm = async () => {
      try {
        const res = await fetch('/daily-rhythm.json');
        if (res.ok) {
          const data = await res.json();
          setDailyRhythm(data);
        }
      } catch (error) {
        console.error('Failed to fetch daily rhythm:', error);
      }
    };
    fetchDailyRhythm();
  }, []);

  return (
    <div className="flex flex-col bg-white/10">
      {/* Header Area */}
      <div className="p-4 sm:p-5 border-b border-border bg-white/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif text-ink mb-0.5">Steiner Curation</h2>
            <p className="text-xs sm:text-sm text-ink-soft italic">Grade milestones and daily rhythmic flows for Waldorf living</p>
          </div>
 
          {/* Toggle Switcher */}
          <div className="relative flex p-1 bg-[#e8ede4]/75 backdrop-blur-sm rounded-full border border-sage-light/30 self-start sm:self-center shrink-0" role="tablist" aria-label="Content categories">
            <button
              role="tab"
              id="tab-curriculum"
              aria-selected={activeSubTab === 'curriculum'}
              aria-controls="panel-curriculum"
              onClick={() => setActiveSubTab('curriculum')}
              className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeSubTab === 'curriculum' ? 'text-white' : 'text-sage hover:text-sage-light'
              }`}
            >
              {activeSubTab === 'curriculum' && (
                <motion.div
                  layoutId="activeSubTabBg"
                  className="absolute inset-0 bg-sage rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Scissors size={12} aria-hidden="true" />
              Curriculum
            </button>
            <button
              role="tab"
              id="tab-rhythms"
              aria-selected={activeSubTab === 'rhythms'}
              aria-controls="panel-rhythms"
              onClick={() => setActiveSubTab('rhythms')}
              className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeSubTab === 'rhythms' ? 'text-white' : 'text-sage hover:text-sage-light'
              }`}
            >
              {activeSubTab === 'rhythms' && (
                <motion.div
                  layoutId="activeSubTabBg"
                  className="absolute inset-0 bg-sage rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <ChefHat size={12} aria-hidden="true" />
              Rhythms
            </button>
            <button
              role="tab"
              id="tab-espanol"
              aria-selected={activeSubTab === 'espanol'}
              aria-controls="panel-espanol"
              onClick={() => setActiveSubTab('espanol')}
              className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeSubTab === 'espanol' ? 'text-white' : 'text-sage hover:text-sage-light'
              }`}
            >
              {activeSubTab === 'espanol' && (
                <motion.div
                  layoutId="activeSubTabBg"
                  className="absolute inset-0 bg-sage rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <BookOpen size={12} aria-hidden="true" />
              Español
            </button>
            <button
              role="tab"
              id="tab-deutsch"
              aria-selected={activeSubTab === 'deutsch'}
              aria-controls="panel-deutsch"
              onClick={() => setActiveSubTab('deutsch')}
              className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeSubTab === 'deutsch' ? 'text-white' : 'text-sage hover:text-sage-light'
              }`}
            >
              {activeSubTab === 'deutsch' && (
                <motion.div
                  layoutId="activeSubTabBg"
                  className="absolute inset-0 bg-sage rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Globe size={12} aria-hidden="true" />
              Deutsch
            </button>
          </div>
        </div>
      </div>
 
      {/* Main Scroller Wrapper */}
      <div className="flex-1 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {activeSubTab === 'curriculum' ? (
            <motion.div
              key="curriculum"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              role="tabpanel"
              id="panel-curriculum"
              aria-labelledby="tab-curriculum"
            >
              {/* Introduction Card */}
              <div className="p-6 bg-sage-pale/30 border border-sage-light/25 rounded-2xl">
                <h3 className="font-serif text-lg text-sage font-semibold mb-2 flex items-center gap-2">
                  <Scissors size={16} />
                  Waldorf Handwork Spiral
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed font-serif">
                  Waldorf handwork is not taught purely for craft utility. In Steiner pedagogy, the active engagement of the fingers directly stimulates neurological connections, mapping physical dexterity to flexible, imaginative thinking. Children progress from raw wool fingerknitting in early childhood to structured garment construction and leatherwork in Grade 8.
                </p>
              </div>

              {/* Table Wrapper (Responsive Scroll) */}
              <div className="overflow-x-auto border border-sage-light/20 rounded-2xl bg-white/50 backdrop-blur-md">
                <table className="w-full border-collapse text-left">
<thead>
                    <tr className="bg-[#e8ede4]/50 border-b border-sage-light/30">
                      <th className="p-4 font-serif font-bold text-xs uppercase tracking-widest text-sage w-1/4 hidden md:table-cell">Grade & Age</th>
                      <th className="p-4 font-serif font-bold text-xs uppercase tracking-widest text-sage w-1/3 hidden lg:table-cell">Core Skills</th>
                      <th className="p-4 font-serif font-bold text-xs uppercase tracking-widest text-sage w-1/4">First Project</th>
                      <th className="p-4 font-serif font-bold text-xs uppercase tracking-widest text-sage text-right w-1/6 hidden md:table-cell">Guide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-light/20">
                    {HANDWORK_CURRICULUM.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#e8ede4]/20 transition-colors">
                        <td className="p-4 vertical-align-top hidden md:table-cell">
                          <span className="font-serif font-bold text-[#1a4a20] block text-base sm:text-lg">
                            {item.grade}
                          </span>
                          <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block mt-0.5">
                            {item.ageRange}
                          </span>
                        </td>
                        <td className="p-4 vertical-align-top hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1.5">
                            {item.coreSkills.map((skill, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-block px-2.5 py-1 bg-white border border-sage-light/20 text-ink-soft text-[11px] font-bold rounded-lg shadow-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 vertical-align-top font-serif text-sm italic text-ink-soft">
                          {item.typicalFirstProject}
                        </td>
                        <td className="p-4 vertical-align-top text-right hidden md:table-cell">
                          <a
                            href={`https://${item.curriculumGuideLink}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sage hover:underline text-xs font-bold uppercase tracking-wider"
                          >
                            Guide
                            <ExternalLink size={12} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : activeSubTab === 'rhythms' ? (
            <motion.div
              key="rhythms"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              role="tabpanel"
              id="panel-rhythms"
              aria-labelledby="tab-rhythms"
            >
              {/* Daily Rhythm Card (Auto-published) */}
              {dailyRhythm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-gradient-to-br from-earth-pale/40 to-sage-pale/30 border border-earth-light/20 rounded-2xl flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/50 rounded-xl border border-earth-light/30">
                      <Sun size={20} className="text-earth" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-earth mb-1">Today's Rhythm — {dailyRhythm.season}</p>
                      <p className="font-serif text-lg text-ink">{dailyRhythm.verse}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 md:ml-auto">
                    <span className="px-3 py-1 bg-white/50 border border-earth-light/30 rounded-full text-xs font-medium text-ink">
                      <Leaf size={10} className="inline mr-1" /> {dailyRhythm.grain}
                    </span>
                    <span className="px-3 py-1 bg-white/50 border border-earth-light/30 rounded-full text-xs font-medium text-ink">
                      <Wheat size={10} className="inline mr-1" /> {dailyRhythm.activity}
                    </span>
                    <span className="px-3 py-1 bg-white/50 border border-earth-light/30 rounded-full text-xs font-medium text-ink">
                      {dailyRhythm.planet}
                    </span>
                    <span className="px-3 py-1 bg-white/50 border border-earth-light/30 rounded-full text-xs font-medium text-ink">
                      Colour: {dailyRhythm.colour}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Introduction Card */}
              <div className="p-6 bg-earth-pale/40 border border-earth-light/20 rounded-2xl">
                <h3 className="font-serif text-lg text-earth font-semibold mb-2 flex items-center gap-2">
                  <Utensils size={16} />
                  Anthroposophical Nutrition
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed font-serif">
                  Food is recognized as a carrier of vital life forces. Guided by Steiner's 1924 Agriculture lectures and elaborated by Wendy Cook, the Waldorf kitchen follows a weekly rhythm of grains aligned with planetary configurations, respects organic biodynamic forces, and treats cooking and sharing as shared spiritual rituals.
                </p>
              </div>

              {/* Masonry / Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {NUTRITION_PILLARS.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col bg-white border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <h4 className="font-serif text-lg text-ink font-semibold flex items-center gap-2">
                        <Sparkles size={16} className="text-[#d4a84b] shrink-0" />
                        {pillar.pillar}
                      </h4>
                      <span className="text-[10px] font-bold text-earth-light uppercase tracking-widest bg-earth-pale/60 px-2 py-0.5 rounded-full shrink-0">
                        Pillar 0{idx + 1}
                      </span>
                    </div>

                    {/* Indications */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-earth uppercase tracking-widest">Steiner Indication</p>
                      <p className="text-sm font-serif italic text-ink-soft leading-relaxed bg-earth-pale/20 p-3 rounded-xl border-l-2 border-[#d4a84b]/60">
                        "{pillar.steinerIndication}"
                      </p>
                    </div>

                    {/* Applications */}
                    <div className="grid grid-cols-1 gap-3 text-xs">
                      <div>
                        <p className="font-bold text-ink-soft uppercase tracking-wider text-[10px] mb-1">Kitchen Integration</p>
                        <p className="text-ink-soft font-sans leading-relaxed">{pillar.practicalApplication}</p>
                      </div>
                      <div>
                        <p className="font-bold text-ink-soft uppercase tracking-wider text-[10px] mb-1">Classroom Integration</p>
                        <p className="text-ink-soft font-sans leading-relaxed">{pillar.schoolroomIntegration}</p>
                      </div>
                    </div>

                    {/* Book Footnote */}
                    <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-ink-soft">
                      <span className="flex items-center gap-1 italic truncate max-w-[70%]">
                        <BookOpen size={12} className="shrink-0 text-earth-light" />
                        {pillar.referenceBook}
                      </span>
                      <a
                        href={`https://${pillar.referenceLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-earth font-bold hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        Publisher
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : activeSubTab === 'deutsch' ? (
            <motion.div
              key="deutsch"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              role="tabpanel"
              id="panel-deutsch"
              aria-labelledby="tab-deutsch"
            >
              <div className="p-6 bg-[#f0f4e8] border border-[#d4e0b8] rounded-2xl">
                <h3 className="font-serif text-lg text-[#3a5a2e] font-semibold mb-2 flex items-center gap-2">
                  <BookOpen size={16} />
                  Deutsche Waldorf-Ressourcen
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed font-serif">
                  Pentatonische Lieder, jahreszeitliche Bücher und Waldorf-Persönlichkeiten im deutschsprachigen Raum — kuratiert für Familien, Kindergärten und Schulen in Deutschland, Österreich und der Schweiz. {(deutschData.songs as string[]).length} Lieder, {(deutschData.books as any[]).length} Bücher und {(deutschData.cards as any[]).length} Persönlichkeiten.
                </p>
              </div>

              <div className="bg-white border border-border/50 rounded-2xl p-5">
                <h4 className="font-serif text-base text-ink font-semibold mb-3 flex items-center gap-2">
                  <span className="text-lg">🎵</span> Lieder ({(deutschData.songs as string[]).length})
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {(deutschData.songs as string[]).slice(0, 48).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#f0f4e8] border border-[#d4e0b8]/60 text-ink-soft text-xs rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-ink-soft/60 mt-2 italic">Zeigt 48 von {(deutschData.songs as string[]).length} Liedern • Globale Suche nutzen zum Filtern</p>
              </div>

              <div className="bg-white border border-border/50 rounded-2xl p-5">
                <h4 className="font-serif text-base text-ink font-semibold mb-3">📚 Bücher ({(deutschData.books as any[]).length})</h4>
                <div className="space-y-3">
                  {(deutschData.books as any[]).map((b, i) => (
                    <div key={i} className="p-3 bg-[#f0f4e8]/50 border border-[#d4e0b8]/40 rounded-xl">
                      <p className="text-sm font-semibold text-ink">{b.title}</p>
                      <p className="text-xs text-ink-soft mt-1">{b.meta}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-border/50 rounded-2xl p-5">
                <h4 className="font-serif text-base text-ink font-semibold mb-3">👩‍🏫 Persönlichkeiten ({(deutschData.cards as any[]).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(deutschData.cards as any[]).map((c, i) => (
                    <div key={i} className="p-4 bg-white border border-border/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sage bg-sage-pale/30 px-2 py-0.5 rounded-full">{c.tag}</span>
                      <p className="text-sm font-bold text-ink mt-2">{c.name}</p>
                      <p className="text-xs text-ink-soft italic">{c.author}</p>
                      <p className="text-xs text-ink-soft mt-2 leading-relaxed line-clamp-3">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="espanol"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              role="tabpanel"
              id="panel-espanol"
              aria-labelledby="tab-espanol"
            >
              <div className="p-6 bg-[#fdf6ec] border border-[#e8dcc6] rounded-2xl">
                <h3 className="font-serif text-lg text-[#8b4513] font-semibold mb-2 flex items-center gap-2">
                  <BookOpen size={16} />
                  Recursos en Español — Waldorf en castellano
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed font-serif">
                  Canciones pentatónicas, libros estacionales y educadoras Waldorf de habla hispana — todo curado para familias y jardines Waldorf en España y Latinoamérica. {(espanolData.songs as string[]).length} canciones, {(espanolData.books as any[]).length} libros y {(espanolData.cards as any[]).length} educadoras.
                </p>
              </div>

              <div className="bg-white border border-border/50 rounded-2xl p-5">
                <h4 className="font-serif text-base text-ink font-semibold mb-3 flex items-center gap-2">
                  <span className="text-lg">🎵</span> Canciones ({(espanolData.songs as string[]).length})
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {(espanolData.songs as string[]).slice(0, 48).map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-[#fdf6ec] border border-[#e8dcc6]/60 text-ink-soft text-xs rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-ink-soft/60 mt-2 italic">Mostrando 48 de {(espanolData.songs as string[]).length} canciones • Usa la búsqueda global para filtrar</p>
              </div>

              <div className="bg-white border border-border/50 rounded-2xl p-5">
                <h4 className="font-serif text-base text-ink font-semibold mb-3">📚 Libros ({(espanolData.books as any[]).length})</h4>
                <div className="space-y-3">
                  {(espanolData.books as any[]).map((b, i) => (
                    <div key={i} className="p-3 bg-[#fdf6ec]/50 border border-[#e8dcc6]/40 rounded-xl">
                      <p className="text-sm font-semibold text-ink">{b.title}</p>
                      <p className="text-xs text-ink-soft mt-1">{b.meta}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-border/50 rounded-2xl p-5">
                <h4 className="font-serif text-base text-ink font-semibold mb-3">👩‍🏫 Educadoras ({(espanolData.cards as any[]).length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(espanolData.cards as any[]).map((c, i) => (
                    <div key={i} className="p-4 bg-white border border-border/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sage bg-sage-pale/30 px-2 py-0.5 rounded-full">{c.tag}</span>
                      <p className="text-sm font-bold text-ink mt-2">{c.name}</p>
                      <p className="text-xs text-ink-soft italic">{c.author}</p>
                      <p className="text-xs text-ink-soft mt-2 leading-relaxed line-clamp-3">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
