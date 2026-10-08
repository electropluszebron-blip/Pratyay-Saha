import React from 'react';
import { GraduationCap, BookOpen, Building, Sparkles, MapPin, Compass, ArrowDown } from 'lucide-react';
import { AUTHOR_BIO } from '../data/bookData';

interface AuthorSectionProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

export const AuthorSection: React.FC<AuthorSectionProps> = ({
  isDark,
  onContinueJourney
}) => {
  return (
    <section id="author-section" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto overflow-hidden">
      
      {/* Background Ambient Radiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[550px] h-[320px] sm:h-[550px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Professional Dynamic & Elegant Background Section Enclosure */}
      <div className={`relative rounded-3xl p-6 sm:p-12 transition-all duration-500 border ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_50px_rgba(212,175,55,0.12)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.15)]'
      } text-center`}>
        
        {/* Cultural Decorative Corner Accents */}
        <div className="absolute top-3.5 left-3.5 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]/70 rounded-tl-lg" />
        <div className="absolute top-3.5 right-3.5 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]/70 rounded-tr-lg" />
        <div className="absolute bottom-3.5 left-3.5 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]/70 rounded-bl-lg" />
        <div className="absolute bottom-3.5 right-3.5 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]/70 rounded-br-lg" />

        {/* Author Circular Golden Framed Portrait (ONLY Author's Picture - No switcher) */}
        <div className="relative mx-auto w-40 h-40 sm:w-52 sm:h-52 mb-6 select-none">
          {/* Animated Golden Halo Ring */}
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#B93826] to-[#ECC480] opacity-80 blur-md transition-opacity duration-300 animate-pulse" />
          
          {/* Circular Image Container */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#D4AF37] shadow-2xl bg-[#2A1E14]">
            <img
              src="/author.webp"
              alt={AUTHOR_BIO.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover shadow-inner"
              loading="eager"
            />
          </div>

          {/* Author Badge overlay at bottom */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#8B3A1C] via-[#B93826] to-[#D85A2A] text-white border border-[#FFE58F] text-[10px] sm:text-xs font-cinzel font-bold tracking-widest uppercase shadow-xl whitespace-nowrap">
            AUTHOR
          </div>
        </div>

        {/* Section Title */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B93826]/10 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-2">
          <span>ABOUT THE AUTHOR</span>
        </div>

        {/* Author Name */}
        <h3 className={`font-cinzel text-3xl sm:text-4xl font-extrabold tracking-wide mb-2 ${
          isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
        }`}>
          {AUTHOR_BIO.name}
        </h3>

        {/* Location Badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-cinzel text-[#8B3A1C] dark:text-[#E5A93C] mb-6 font-semibold">
          <MapPin className="w-3.5 h-3.5 text-[#B93826]" />
          <span>Chakdaha, Nadia • West Bengal</span>
        </div>

        {/* Biography Paragraph */}
        <p className={`text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 font-serif ${
          isDark ? 'text-[#D5C7B8]' : 'text-[#503E31]'
        }`}>
          {AUTHOR_BIO.bio}
        </p>

        {/* Key Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto text-left">
          
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#1C1613] border-[#3E2D20]' : 'bg-[#FAF6EF] border-[#E8DFC8]'
          } flex items-center gap-3.5`}>
            <div className="w-10 h-10 rounded-xl bg-[#8B3A1C]/15 text-[#8B3A1C] dark:text-[#ECC480] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">99.4% CBSE Class 10</p>
              <p className="text-[11px] opacity-70">Academic Excellence & Merit</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#1C1613] border-[#3E2D20]' : 'bg-[#FAF6EF] border-[#E8DFC8]'
          } flex items-center gap-3.5`}>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Recitation | Debate | Literature</p>
              <p className="text-[11px] opacity-70">Art of Oratory & Creative Expression</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#1C1613] border-[#3E2D20]' : 'bg-[#FAF6EF] border-[#E8DFC8]'
          } flex items-center gap-3.5`}>
            <div className="w-10 h-10 rounded-xl bg-[#8B3A1C]/15 text-[#8B3A1C] dark:text-[#ECC480] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">St. Mary’s Arcadian School</p>
              <p className="text-[11px] opacity-70">Class XI Science</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-[#1C1613] border-[#3E2D20]' : 'bg-[#FAF6EF] border-[#E8DFC8]'
          } flex items-center gap-3.5`}>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Published by Technodef</p>
              <p className="text-[11px] opacity-70">Literary Heritage Preservation</p>
            </div>
          </div>

        </div>

        {/* Author Quote */}
        <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 max-w-xl mx-auto">
          <p className="font-cormorant italic text-sm sm:text-base opacity-85">
            "Words are not mere symbols on parchment; they are the vessels of human healing and cultural memory."
          </p>
          <p className="text-[11px] font-cinzel text-[#D4AF37] font-semibold mt-1">
            — PRATYAY SAHA • CHAKDAHA
          </p>
        </div>

        {/* Step-by-Step Guided Journey Button */}
        {onContinueJourney && (
          <div className="mt-8 sm:mt-10 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: Edition Announcement</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
