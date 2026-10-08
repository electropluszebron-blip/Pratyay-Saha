import React from 'react';
import { BookOpen, Feather, Sparkles, User, Quote, Compass, ArrowDown } from 'lucide-react';
import { ABOUT_THE_BOOK } from '../data/bookData';

interface AboutTheBookProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

export const AboutTheBook: React.FC<AboutTheBookProps> = ({
  isDark,
  onContinueJourney
}) => {
  return (
    <section id="about-novel" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-[#E5A93C]/15 via-[#B93826]/15 to-[#D85A2A]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Section Card Enclosure with Dynamic Professional Background */}
      <div className={`relative rounded-3xl p-6 sm:p-12 border transition-all duration-500 ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.1)]' 
          : 'glossy-card border-[#E5A93C]/35 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.12)]'
      }`}>
        
        {/* Cultural Decorative Corner Accents */}
        <div className="absolute top-3.5 left-3.5 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]/70 rounded-tl-lg" />
        <div className="absolute top-3.5 right-3.5 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]/70 rounded-tr-lg" />
        <div className="absolute bottom-3.5 left-3.5 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]/70 rounded-bl-lg" />
        <div className="absolute bottom-3.5 right-3.5 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]/70 rounded-br-lg" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/40 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-4 shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ABOUT THE BOOK</span>
          </div>
          
          <h3 className={`font-cinzel text-2xl sm:text-4xl font-extrabold tracking-wide mb-6 ${
            isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
          }`}>
            The Story & Philosophy
          </h3>

          {/* Requirement 2: Dedicated Synopsis Paragraphs */}
          <div className="space-y-4 text-left sm:text-center font-serif text-sm sm:text-base md:text-lg leading-relaxed text-[#4A382A] dark:text-[#DCD0C4]">
            {ABOUT_THE_BOOK.paragraphs.map((paragraph, idx) => (
              <p key={idx}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Prominent Core Inscription Quote Banner */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#B93826]/10 via-[#E5A93C]/15 to-[#B93826]/10 border border-[#D4AF37]/40 relative">
            <Quote className="w-6 h-6 text-[#D4AF37] mx-auto mb-2 opacity-80" />
            <p className="font-cormorant italic text-lg sm:text-xl md:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-snug max-w-2xl mx-auto">
              "{ABOUT_THE_BOOK.quote}"
            </p>
          </div>
        </div>

        {/* Requirement 4: Key Characters & Perspectives */}
        <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <Feather className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C]" />
            <h4 className="font-cinzel text-base sm:text-lg font-bold uppercase tracking-wider text-[#B93826] dark:text-[#E5A93C]">
              Key Characters & Perspectives
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {ABOUT_THE_BOOK.characterDossier.map((char, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                  isDark 
                    ? 'bg-[#181310] border-[#3E2F23] hover:border-[#D4AF37]/60' 
                    : 'bg-[#FAF6F0] border-[#E8DEC9] hover:border-[#B93826]/50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B93826] to-[#E5A93C] text-white flex items-center justify-center font-bold text-xs font-cinzel shrink-0 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-cinzel text-sm sm:text-base font-bold text-[#9E472A] dark:text-[#ECC480] mb-0.5">
                      {char.name}
                    </h5>
                    <p className="text-[11px] font-semibold text-[#B93826] dark:text-[#D4AF37] mb-1.5 uppercase tracking-wide">
                      {char.role}
                    </p>
                    <p className="text-xs sm:text-sm opacity-85 font-serif leading-relaxed text-[#3A2D23] dark:text-[#D0C3B5]">
                      {char.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirement 5: Edition Specifications (Format and Soundtrack pairing removed) */}
        <div className={`mt-10 rounded-2xl p-5 sm:p-6 border text-center ${
          isDark ? 'bg-[#1C1612] border-[#4A3728]' : 'bg-[#F8F2E8] border-[#E8DEC9]'
        }`}>
          <div className="flex items-center justify-center gap-2 text-[#D4AF37] mb-3">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-cinzel text-xs font-bold tracking-widest uppercase text-[#B93826] dark:text-[#D4AF37]">
              Technodef Official Literary Release
            </span>
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
            {ABOUT_THE_BOOK.editionSpecs.map((spec, i) => (
              <div key={i} className="p-2">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block">
                  {spec.label}
                </span>
                <span className="text-xs font-bold font-cinzel text-[#9E472A] dark:text-[#ECC480]">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Guided Journey Button */}
        {onContinueJourney && (
          <div className="mt-8 sm:mt-10 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: Themes & Motifs</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>

    </section>
  );
};
