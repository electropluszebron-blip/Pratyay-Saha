import React, { useState } from 'react';
import { Quote as QuoteIcon, Sparkles, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { FAMOUS_QUOTES } from '../data/bookData';

interface QuoteSharerProps {
  isDark: boolean;
}

export const QuoteSharer: React.FC<QuoteSharerProps> = ({
  isDark
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const activeQuote = FAMOUS_QUOTES[currentIndex];

  const nextQuote = () => {
    setCurrentIndex((currentIndex + 1) % FAMOUS_QUOTES.length);
  };

  const prevQuote = () => {
    setCurrentIndex((currentIndex - 1 + FAMOUS_QUOTES.length) % FAMOUS_QUOTES.length);
  };

  return (
    <section id="quote-section" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Header (Clean - No numbers) */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B93826]/10 text-[#B93826] text-xs font-cinzel font-bold tracking-widest uppercase mb-3">
          <QuoteIcon className="w-3.5 h-3.5" />
          <span>IMMORTAL LINES & QUOTES</span>
        </div>
        <h3 className={`font-cinzel text-2xl sm:text-3xl font-extrabold tracking-wide mb-3 ${
          isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
        }`}>
          Voices That Never Wilt
        </h3>
        <p className="text-xs sm:text-sm text-[#6C5441] dark:text-[#C4B3A2]">
          Poetic excerpts and philosophical reflections from the novel.
        </p>
      </div>

      {/* Glossy Quote Card */}
      <div className={`relative rounded-3xl p-8 sm:p-12 border transition-all duration-300 shadow-2xl ${
        isDark 
          ? 'bg-gradient-to-b from-[#221B16] to-[#16120E] border-[#D4AF37]/40' 
          : 'bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE2] border-[#D4AF37]/50'
      }`}>
        
        {/* Top Gold Corner Accents */}
        <div className="flex items-center justify-between text-xs font-cinzel text-[#D4AF37] mb-6">
          <span className="font-bold tracking-widest uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> {activeQuote.chapter} · {activeQuote.theme}
          </span>
          <span className="font-mono opacity-80">{currentIndex + 1} of {FAMOUS_QUOTES.length}</span>
        </div>

        {/* Large Quote Mark */}
        <div className="text-center mb-6">
          <QuoteIcon className="w-10 h-10 mx-auto text-[#B93826] opacity-60" />
        </div>

        {/* Quote Prose */}
        <blockquote className="font-cormorant italic text-xl sm:text-3xl text-center leading-relaxed mb-6 max-w-2xl mx-auto font-medium">
          "{activeQuote.text}"
        </blockquote>

        {/* Speaker attribution */}
        <div className="text-center mb-8">
          <p className="font-cinzel font-bold text-sm sm:text-base text-[#9E472A] dark:text-[#ECC480] tracking-wide">
            — {activeQuote.speaker}
          </p>
          <p className="text-[11px] font-sans opacity-60">
            Wilting of Words by Pratyay Saha · Published by Technodef
          </p>
        </div>

        {/* Carousel Navigation (No copy quote button) */}
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-black/10 dark:border-white/10">
          <button
            onClick={prevQuote}
            className={`p-2.5 rounded-full border transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isDark 
                ? 'border-[#443325] hover:border-[#D4AF37] hover:bg-white/5 text-white' 
                : 'border-[#E8DFC8] hover:border-[#B93826] hover:bg-black/5 text-[#554131]'
            }`}
            title="Previous Quote"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={nextQuote}
            className="px-5 py-2.5 rounded-full bg-[#B93826] hover:bg-[#962A1C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#B93826]/30 transition-all hover:scale-105"
            title="Next Quote"
          >
            <span>Next Quote</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </section>
  );
};
