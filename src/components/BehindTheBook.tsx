import React, { useState } from 'react';
import { 
  Sparkles, 
  Feather, 
  BookOpen, 
  Compass, 
  ArrowDown, 
  Flame, 
  HelpCircle, 
  User, 
  PenTool, 
  RotateCw, 
  CheckCircle2,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface BehindTheBookProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

interface BehindSection {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  content: string;
  quote: string;
  keyTakeaway: string;
}

const BEHIND_SECTIONS: BehindSection[] = [
  {
    id: 'inspiration',
    title: 'The Inspiration',
    subtitle: 'Chakdaha Riverbank & The Silent Voice',
    icon: Sparkles,
    quote: 'Art is born when silence becomes too heavy to carry alone.',
    content: 'The narrative spark ignited in Chakdaha, Nadia, where author Pratyay Saha observed how societal pressures and unexpressed grief often silence young minds. He envisioned a story where written words become an indestructible sanctuary—a voice that survives even when speech is suppressed.',
    keyTakeaway: 'Inspired by real human resilience across Bengal’s riverbank communities.'
  },
  {
    id: 'title-meaning',
    title: 'Why "Wilting of Words"?',
    subtitle: 'Symbolism of the Title',
    icon: HelpCircle,
    quote: 'Words do not wither to die; they wilt to wait for the next rainfall.',
    content: 'The title "Wilting of Words" encapsulates the central paradox of the novel. On the surface, "wilting" suggests loss and fading expression. But just as a wilted flower holds seeds that blossom with the monsoon rain, silenced words hold the seeds of immortal truth waiting for a reader to awaken them.',
    keyTakeaway: 'A metaphor for how suppressed truth patiently awaits discovery.'
  },
  {
    id: 'character-creation',
    title: 'Character Creation',
    subtitle: 'Crafting Aratrika, Krittika, Prangik & Parents',
    icon: User,
    quote: 'Every character carries a fragment of society’s unspoken longings.',
    content: 'Aratrika was crafted as the silent scribe—a young woman who turns private journal entries into a quiet revolution. Mrs. and Mr. Saha embody the complex, loving yet restrictive expectations of traditional family structure. Krittika and Prangik represent the successor and preserver who carry Aratrika’s legacy forward.',
    keyTakeaway: 'A rich ensemble reflecting family, friendship, ambition, and identity.'
  },
  {
    id: 'writing-process',
    title: 'The Writing Process',
    subtitle: 'Nocturnal Discipline in Sepia Ink',
    icon: PenTool,
    quote: 'Drafted in sepia fountain ink across 231 midnight writing sessions.',
    content: 'Written during author Pratyay Saha’s Class XI Science academic year at St. Mary’s Arcadian School. Writing sessions took place predominantly between midnight and 3:00 AM under soft oil lamp illumination, capturing the quiet nocturnal atmospheric essence of the novel.',
    keyTakeaway: '219 pages authored entirely by hand before digital transcription.'
  },
  {
    id: 'revision-process',
    title: 'Editorial Revision Process',
    subtitle: 'Refinement on 25 September 2026',
    icon: RotateCw,
    quote: 'Revision is not erasing errors; it is sculpting prose until light shines through.',
    content: 'On 25 September 2026, the complete manuscript underwent rigorous editorial revision. Prose cadences were polished, thematic symbolism was deepened, and chapter pacing was mathematically balanced to ensure an effortless page-turner.',
    keyTakeaway: '6 comprehensive revision passes over two months.'
  },
  {
    id: 'manuscript-to-publication',
    title: 'From Manuscript to Publication',
    subtitle: 'Technodef Literary Press Consecration',
    icon: Flame,
    quote: 'An official landmark publication honoring author Pratyay Saha’s literary work.',
    content: 'Partnering with Technodef Press, Wilting of Words was transformed from handwritten draft pages into an official digital and print landmark publication. Scheduled for launch on 29 November 2026, celebrating the official release.',
    keyTakeaway: 'An official Technodef Press First Edition publication.'
  }
];

export const BehindTheBook: React.FC<BehindTheBookProps> = ({
  isDark,
  onContinueJourney
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('inspiration');
  const activeSection = BEHIND_SECTIONS.find(s => s.id === activeSectionId) || BEHIND_SECTIONS[0];
  const IconComponent = activeSection.icon;

  const handleSelect = (id: string) => {
    setActiveSectionId(id);
    try { audioSynth.playNow(); } catch {}
  };

  return (
    <section 
      id="behind-the-book" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[700px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Container Enclosure */}
      <div className={`relative rounded-3xl p-6 sm:p-12 border transition-all duration-500 shadow-2xl ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_60px_rgba(212,175,55,0.12)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.14)]'
      }`}>
        
        {/* Cultural Corner Filigree Accents */}
        <div className="absolute top-3.5 left-3.5 w-7 h-7 border-t-2 border-l-2 border-[#D4AF37]/75 rounded-tl-lg" />
        <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-2 border-r-2 border-[#D4AF37]/75 rounded-tr-lg" />
        <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-2 border-l-2 border-[#D4AF37]/75 rounded-bl-lg" />
        <div className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-2 border-r-2 border-[#D4AF37]/75 rounded-br-lg" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/45 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Feather className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>LITERARY GENESIS</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            BEHIND THE BOOK
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "An intimate look into the inspiration, title choice, writing process, and journey from manuscript to publication."
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-10">
          {BEHIND_SECTIONS.map((sec) => {
            const isSelected = sec.id === activeSectionId;
            const SecIcon = sec.icon;

            return (
              <button
                key={sec.id}
                onClick={() => handleSelect(sec.id)}
                className={`p-3 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D85A2A] text-white border-[#FFE58F] shadow-lg scale-105'
                    : isDark
                      ? 'bg-[#18120E] text-[#DCD0C4] border-[#3E2D20] hover:border-[#D4AF37]/60 hover:bg-[#201712]'
                      : 'bg-[#FAF5ED] text-[#4A382A] border-[#E8DFC8] hover:border-[#B93826]/50 hover:bg-white'
                }`}
              >
                <SecIcon className={`w-4 h-4 ${isSelected ? 'text-amber-200' : 'text-[#D4AF37]'}`} />
                <span className="font-cinzel text-[11px] font-bold uppercase truncate max-w-full">
                  {sec.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Section Spotlight Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl p-6 sm:p-10 border transition-all text-left ${
              isDark 
                ? 'bg-gradient-to-b from-[#1F150F] to-[#120C08] border-[#D4AF37]/50 shadow-2xl' 
                : 'bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE3] border-[#E5A93C]/50 shadow-xl'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-black/10 dark:border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#B93826] to-[#E5A93C] text-white flex items-center justify-center shadow-xl shrink-0">
                <IconComponent className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C]">
                  {activeSection.subtitle}
                </span>
                <h3 className={`font-cinzel text-xl sm:text-2xl font-black ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
                  {activeSection.title}
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                <p className="font-cormorant italic text-base sm:text-xl font-bold text-[#9E472A] dark:text-[#FFE58F]">
                  "{activeSection.quote}"
                </p>
              </div>

              <p className="font-serif text-sm sm:text-base md:text-lg leading-relaxed text-[#3A2D23] dark:text-[#DCD0C4]">
                {activeSection.content}
              </p>

              <div className="pt-3 flex items-center gap-2 text-xs font-cinzel font-bold text-[#8B2213] dark:text-[#ECC480]">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{activeSection.keyTakeaway}</span>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Step-by-Step Guided Journey Button */}
        {onContinueJourney && (
          <div className="mt-10 sm:mt-14 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: Press & Media</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
