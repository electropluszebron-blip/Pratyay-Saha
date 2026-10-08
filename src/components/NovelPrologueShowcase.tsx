import React from 'react';
import { BookOpen, Sparkles, Feather, Compass, Heart, ScrollText, ArrowDownCircle, ArrowDown } from 'lucide-react';
import { NOVEL_META } from '../data/bookData';

interface NovelPrologueShowcaseProps {
  isDark: boolean;
  onOpenEBook: () => void;
  onExploreAuthor: () => void;
  onContinueJourney?: () => void;
}

export const NovelPrologueShowcase: React.FC<NovelPrologueShowcaseProps> = ({
  isDark,
  onOpenEBook,
  onExploreAuthor,
  onContinueJourney
}) => {
  return (
    <section 
      id="novel-prologue" 
      className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden text-center"
    >
      {/* Dynamic Ambient Radiant Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[650px] h-[280px] sm:h-[400px] bg-gradient-to-r from-[#D4AF37]/25 via-[#B93826]/20 to-[#E5A93C]/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* World-Class Glass Card Wrapper */}
      <div className={`relative rounded-3xl p-6 sm:p-12 border transition-all duration-500 ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_50px_rgba(212,175,55,0.15)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.15)]'
      }`}>
        
        {/* Cultural Decorative Corner Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]/70 rounded-tl-lg" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]/70 rounded-tr-lg" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]/70 rounded-bl-lg" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]/70 rounded-br-lg" />

        {/* Top Ornament Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#B93826]/15 via-[#E5A93C]/20 to-[#B93826]/15 border border-[#D4AF37]/50 text-[#B93826] dark:text-[#E5A93C] text-[11px] sm:text-xs font-cinzel font-bold tracking-widest uppercase mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>A MASTERPIECE NOVEL BY {NOVEL_META.authorName.toUpperCase()}</span>
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>

        {/* 
          GLOWING, VIBRANT, ANIMATED TITLE: WILTING OF WORDS
          Explicitly visible always with dynamic golden shimmering rays
        */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-cinzel text-2xl sm:text-5xl md:text-7xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_4px_25px_rgba(212,175,55,0.45)] break-words">
            WILTING OF WORDS
          </h2>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
        </div>

        {/* Poignant & World-Class Literary Exposition Lines */}
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5 text-center">
          <p className="font-cormorant italic text-xl sm:text-2xl md:text-3xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "Some voices are silenced in life, but their words live louder than ever."
          </p>

          <p className="font-serif text-sm sm:text-base md:text-lg text-[#4A382A] dark:text-[#E6D7CA] leading-relaxed">
            When grief and societal silence threaten to extinguish human expression, the written word stands as an indomitable sanctuary. In <strong className="font-cinzel text-[#B93826] dark:text-[#E5A93C]">Wilting of Words</strong>, author Pratyay Saha chronicles the transformative journey of Aratrika as she uncovers a generational chronicle written in sepia fountain ink—discovering that true voice never truly wilts, but patiently waits to be awakened.
          </p>

          <p className="font-serif text-xs sm:text-sm text-[#7A6250] dark:text-[#B8A89A] leading-relaxed max-w-2xl mx-auto">
            An evocative blend of antique Bengal heritage, deep philosophical awakening, and the enduring resonance of love captured across 219 authentic manuscript pages.
          </p>
        </div>

        {/* 4 World-Class Feature Pillars */}
        <div className="mt-8 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 backdrop-blur-sm">
            <ScrollText className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C] mb-2" />
            <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#1A1410] dark:text-[#FAF7F2]">219 Pages</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">High-res manuscript with zoom & bookmarks</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 backdrop-blur-sm">
            <Heart className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C] mb-2" />
            <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#1A1410] dark:text-[#FAF7F2]">Emotional Catharsis</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">A poignant narrative of grief & courage</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 backdrop-blur-sm">
            <Compass className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#B93826] dark:text-[#E5A93C] mb-2" />
            <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#1A1410] dark:text-[#FAF7F2]">Bengal Heritage</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Terracotta courtyards & monsoon riverbanks</p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 backdrop-blur-sm">
            <Feather className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C] mb-2" />
            <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#1A1410] dark:text-[#FAF7F2]">Pure Literary Craft</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Written by Pratyay Saha, published by Technodef</p>
          </div>
        </div>

        {/* Dynamic Guided Journey & Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {onContinueJourney && (
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: Story & Philosophy</span>
              <ArrowDown className="w-4 h-4 animate-bounce ml-0.5 text-amber-200" />
            </button>
          )}

          <button
            onClick={onExploreAuthor}
            className={`px-6 py-3.5 rounded-full border text-xs sm:text-sm font-cinzel font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 ${
              isDark 
                ? 'border-[#D4AF37]/50 text-[#FFE58F] bg-white/5 hover:bg-white/10' 
                : 'border-[#B93826]/40 text-[#8B2213] bg-black/5 hover:bg-black/10'
            }`}
          >
            <Feather className="w-4 h-4 text-[#D85A2A]" />
            <span>About the Author</span>
          </button>

          <button
            onClick={onOpenEBook}
            className={`px-6 py-3.5 rounded-full border text-xs sm:text-sm font-cinzel font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 ${
              isDark 
                ? 'border-stone-700 text-stone-300 bg-black/30 hover:bg-black/50' 
                : 'border-stone-300 text-stone-700 bg-white/40 hover:bg-white/70'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#B93826] dark:text-[#E5A93C]" />
            <span>Direct E-Reader</span>
          </button>
        </div>

      </div>
    </section>
  );
};
