import React, { useState } from 'react';
import { 
  Sparkles, 
  Feather, 
  Compass, 
  Heart, 
  Scroll, 
  CloudRain, 
  Flame, 
  Shield, 
  BookOpen, 
  ArrowDown, 
  Quote,
  Layers,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface NovelThemesProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

interface ThemeItem {
  id: string;
  title: string;
  bengaliTitle: string;
  subtitle: string;
  icon: any;
  quote: string;
  description: string;
  philosophicalNote: string;
  symbolism: string[];
  royalColor: string;
  badge: string;
}

const THEMES_DATA: ThemeItem[] = [
  {
    id: 'dreams',
    title: 'Dreams',
    bengaliTitle: 'স্বপ্ন ও ভবিষ্যৎ',
    subtitle: 'Unspoken Aspirations Beyond Societal Cages',
    icon: Sun,
    quote: 'Dreams are not born to die in silence; they are seeds waiting for the light.',
    description: 'Aratrika’s inner world is fueled by quiet, unyielding dreams of literary creation and freedom. In a world that often demands conformity, her aspirations become a beacon of light guiding her through adversity.',
    philosophicalNote: 'Explores how personal dreams resist the stifling weight of societal expectations.',
    symbolism: ['Late Night Candlelight', 'Open Window at Dawn', 'Untouched Parchment'],
    royalColor: 'from-[#D4AF37] to-[#E5A93C]',
    badge: 'Core Theme'
  },
  {
    id: 'identity',
    title: 'Identity',
    bengaliTitle: 'আত্মপরিচিতি ও অস্তিত্ব',
    subtitle: 'Discovering One’s True Voice in Sepia Ink',
    icon: Feather,
    quote: 'I am not defined by the silence imposed on me, but by the words I choose to write.',
    description: 'The journey of unearthing who Aratrika truly is beyond the roles assigned to her by society, school, and family. Through her journal entries, she constructs an authentic identity that cannot be erased.',
    philosophicalNote: 'Identity is an active act of creation, forged in the privacy of one’s conviction.',
    symbolism: ['Sepia Fountain Pen', 'Handwritten Cursive', 'Reflective Riverbanks'],
    royalColor: 'from-[#B93826] to-[#8B2213]',
    badge: 'Self-Discovery'
  },
  {
    id: 'ambition',
    title: 'Ambition',
    bengaliTitle: 'সংকল্প ও উচ্চাকাঙ্ক্ষা',
    subtitle: 'The Uncompromising Drive to Articulate Truth',
    icon: Flame,
    quote: 'True ambition is not seeking applause; it is refusing to let your truth be buried.',
    description: 'The quiet yet formidable determination driving Aratrika, Krittika, and author Pratyay Saha to complete a 219-page literary monument against all academic and social pressures.',
    philosophicalNote: 'Ambition reimagined as a sacred devotion to truth and creative excellence.',
    symbolism: ['219 Manuscript Pages', 'Burnished Gold Seal', 'Nocturnal Desk'],
    royalColor: 'from-[#D85A2A] to-[#B93826]',
    badge: 'Drive & Craft'
  },
  {
    id: 'friendship',
    title: 'Friendship',
    bengaliTitle: 'বন্ধুত্ব ও সহমর্মিতা',
    subtitle: 'Loyalty & Unbreakable Bonds',
    icon: Heart,
    quote: 'A true friend is the mirror that reflects your strength when your own eyes are dimmed.',
    description: 'The deeply moving bonds between Aratrika, Krittika, and Prangik. Their loyalty forms a human sanctuary where vulnerability is shielded and artistic passion is championed.',
    philosophicalNote: 'Friendship as a protective fortress against isolation and societal prejudice.',
    symbolism: ['Shared School Courtyard', 'Hand-bound Manuscripts', 'Encouraging Notes'],
    royalColor: 'from-[#9E472A] to-[#D4AF37]',
    badge: 'Human Bond'
  },
  {
    id: 'family',
    title: 'Family',
    bengaliTitle: 'পরিবার ও সমাজ',
    subtitle: 'The Intergenerational Tapestry',
    icon: Scroll,
    quote: 'Love and expectations often walk hand in hand, sometimes comforting, sometimes constraining.',
    description: 'The nuanced dynamic with Mr. and Mrs. Saha, highlighting the tension between traditional parental protection, societal fear, and deep ancestral affection.',
    philosophicalNote: 'Family is both the root from which we grow and the soil we must sometimes transcend.',
    symbolism: ['Ancestral Courtyard', 'Prayer Brass Lamp', 'Generational Letters'],
    royalColor: 'from-[#8B2213] to-[#B93826]',
    badge: 'Generational Dynamics'
  },
  {
    id: 'self-expression',
    title: 'Self-Expression',
    bengaliTitle: 'আত্মপ্রকাশ ও মুক্তি',
    subtitle: 'Writing as an Indestructible Sanctuary',
    icon: Shield,
    quote: 'Some voices are silenced in life, but their words live louder than ever.',
    description: 'When speech withers under pressure, writing becomes the ultimate act of liberation and catharsis. The novel is a tribute to the immortal resonance of the written word.',
    philosophicalNote: 'Self-expression is humanity’s ultimate victory over impermanence and oblivion.',
    symbolism: ['Sepia Inkpots', 'Technodef Press Consecration', 'Immortal Manuscript'],
    royalColor: 'from-[#2A5C8A] to-[#1E3A5F]',
    badge: 'Literary Creed'
  }
];

export const NovelThemes: React.FC<NovelThemesProps> = ({
  isDark,
  onContinueJourney
}) => {
  const [activeThemeId, setActiveThemeId] = useState<string>(THEMES_DATA[0].id);

  const activeTheme = THEMES_DATA.find(t => t.id === activeThemeId) || THEMES_DATA[0];
  const IconComponent = activeTheme.icon;

  const handleSelectTheme = (id: string) => {
    setActiveThemeId(id);
    try {
      audioSynth.playNow();
    } catch {}
  };

  return (
    <section 
      id="novel-themes" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Background Radiant Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[700px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Royal Container Enclosure */}
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
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>THEMATIC ARCHITECTURE</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            THEMES & MOTIFS
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "Beneath the narrative surface lies an intricate tapestry of Bengal philosophy, solitude, and the immortality of the written word."
          </p>
        </div>

        {/* 
          ==================================================================
          THEME SELECTION NAVIGATION PILLS
          ==================================================================
        */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mb-10 sm:mb-12">
          {THEMES_DATA.map((theme) => {
            const isSelected = theme.id === activeThemeId;
            const ThemeIcon = theme.icon;

            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-2xl font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D85A2A] text-white border-[#FFE58F]/70 shadow-lg scale-105'
                    : isDark
                      ? 'bg-[#19120D] text-[#DCD0C4] border-[#3E2D20] hover:border-[#D4AF37]/60 hover:bg-[#221811]'
                      : 'bg-[#FAF5ED] text-[#4A382A] border-[#E8DFC8] hover:border-[#B93826]/50 hover:bg-white'
                }`}
              >
                <ThemeIcon className={`w-4 h-4 ${isSelected ? 'text-amber-200' : 'text-[#D4AF37]'}`} />
                <span>{theme.title.split(' ')[0]} {theme.title.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* 
          ==================================================================
          ACTIVE THEME ILLUMINATED SPOTLIGHT CARD
          ==================================================================
        */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTheme.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl p-6 sm:p-10 border transition-all ${
              isDark 
                ? 'bg-gradient-to-b from-[#1E150F] to-[#120C08] border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.15)]' 
                : 'bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE3] border-[#E5A93C]/50 shadow-xl'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Royal Motif Icon & Inscription */}
              <div className="lg:col-span-5 flex flex-col items-center text-center p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${activeTheme.royalColor} text-white flex items-center justify-center shadow-2xl mb-4 border border-white/20`}>
                  <IconComponent className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>

                <span className="px-3 py-1 rounded-full bg-[#B93826]/15 text-[#B93826] dark:text-[#E5A93C] text-[10px] font-cinzel font-bold uppercase tracking-widest mb-2 border border-[#D4AF37]/40">
                  {activeTheme.badge}
                </span>

                <h3 className={`font-cinzel text-xl sm:text-2xl font-black ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
                  {activeTheme.title}
                </h3>
                
                <p className="font-serif text-sm font-semibold text-[#8B2213] dark:text-[#D4AF37] mt-1">
                  {activeTheme.bengaliTitle}
                </p>

                {/* Thematic Quote Inscription */}
                <div className="mt-5 p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-left w-full relative">
                  <Quote className="w-5 h-5 text-[#D4AF37] mb-1.5 opacity-80" />
                  <p className="font-cormorant italic text-base sm:text-lg text-[#9E472A] dark:text-[#FFE58F] font-bold leading-snug">
                    "{activeTheme.quote}"
                  </p>
                </div>
              </div>

              {/* Right Column: Deep Thematic Exegesis */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C] mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Narrative Manifestation</span>
                  </h4>
                  <p className="font-serif text-sm sm:text-base md:text-lg leading-relaxed text-[#3A2D23] dark:text-[#DCD0C4]">
                    {activeTheme.description}
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#D4AF37]/10 dark:bg-white/5 border border-[#D4AF37]/30">
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#ECC480] mb-1">
                    Philosophical Resonance
                  </h4>
                  <p className="font-serif text-xs sm:text-sm italic text-[#5A4535] dark:text-[#B8A89A]">
                    {activeTheme.philosophicalNote}
                  </p>
                </div>

                {/* Literary Symbols Pill Badges */}
                <div>
                  <h5 className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                    Key Literary Symbols in the Novel
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {activeTheme.symbolism.map((sym, sIdx) => (
                      <span 
                        key={sIdx}
                        className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-cinzel font-semibold text-[#8B2213] dark:text-[#FFD778] border border-[#D4AF37]/30"
                      >
                        ✦ {sym}
                      </span>
                    ))}
                  </div>
                </div>

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
              <span>Continue Journey: Meet The Protagonist</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
