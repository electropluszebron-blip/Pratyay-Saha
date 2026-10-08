import React from 'react';
import { BookOpen, Cloud, ArrowRight, Sparkles, Feather, Stars } from 'lucide-react';
import { NOVEL_META } from '../data/bookData';
import confetti from 'canvas-confetti';

interface HeroProps {
  isDark: boolean;
  onReadNow: () => void;
  onSync: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  isDark,
  onReadNow,
  onSync
}) => {
  const handleReadClick = () => {
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 }
    });
    onReadNow();
  };

  return (
    <section className="relative pt-6 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Dynamic Animated Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[680px] h-[340px] sm:h-[680px] bg-gradient-to-tr from-[#D4AF37]/20 via-[#B93826]/15 to-[#F7D486]/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className="max-w-4xl mx-auto">
        
        {/* Main Glossy Hero Showcase Card */}
        <div className={`relative rounded-3xl p-6 sm:p-12 transition-all duration-500 hover:shadow-2xl ${
          isDark 
            ? 'glossy-card-dark border-[#4A3828]' 
            : 'glossy-card border-[#E5D7C2]'
        } text-center overflow-hidden`}>
          
          {/* Subtle Top Sparkling Ornaments */}
          <div className="absolute top-4 left-6 text-[#D4AF37] opacity-60 hidden sm:block">
            <Sparkles className="w-5 h-5 sparkle-star" />
          </div>
          <div className="absolute top-4 right-6 text-[#D4AF37] opacity-60 hidden sm:block">
            <Sparkles className="w-5 h-5 sparkle-star-delay-1" />
          </div>

          {/* Top Floating Book Artwork with Glowing Shimmer Border */}
          <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[420px] aspect-[16/9] mb-8 group perspective-1000">
            <div className="absolute -inset-2.5 bg-gradient-to-r from-[#D4AF37] via-[#B93826] to-[#F7D486] rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl transition-all duration-500 group-hover:scale-[1.03]">
              <img
                src="/src/assets/images/hero_book_cover_1790355954378.jpg"
                alt="Wilting of Words by Pratyay Saha Book Cover"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-[11px] font-cinzel text-[#D4AF37] tracking-widest font-semibold uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Technodef Edition
                </span>
                <span className="text-sm sm:text-base font-cinzel text-white font-bold tracking-wide">
                  Wilting of Words
                </span>
              </div>
            </div>
          </div>

          {/* Publisher & Author Metadata Line */}
          <div className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#B93826] uppercase mb-4 flex items-center justify-center gap-2">
            <span>PUBLISHER: {NOVEL_META.publisher}</span>
            <span className="text-[#D4AF37]">·</span>
            <span>AUTHOR: {NOVEL_META.authorName}</span>
          </div>

          {/* Animated Lively Sparkling Title */}
          <div className="relative inline-block mb-5">
            <h2 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black tracking-wide leading-tight sparkle-gold-text">
              WILTING OF WORDS
            </h2>
            {/* Sparkle decorative icons on the title */}
            <span className="absolute -top-3 -right-5 text-[#F7D486] hidden sm:inline-block">
              <Sparkles className="w-6 h-6 sparkle-star" />
            </span>
          </div>

          {/* Emotional Tagline Quote */}
          <p className="font-cormorant italic text-lg sm:text-2xl text-[#7E5739] dark:text-[#E0C9B1] max-w-2xl mx-auto mb-4 leading-relaxed font-medium">
            "{NOVEL_META.tagline}"
          </p>

          {/* Subtitle Exploration */}
          <p className="text-xs sm:text-sm text-[#6C5441] dark:text-[#BDB0A2] max-w-xl mx-auto mb-8 font-sans-clean leading-relaxed">
            {NOVEL_META.subtitle}
          </p>

          {/* Terracotta Motif Divider */}
          <div className="flex items-center justify-center gap-4 text-[#C88A58] dark:text-[#D4AF37] opacity-80 mb-8 select-none">
            <span className="w-12 h-[1px] bg-current opacity-40"></span>
            <span className="text-sm">♦</span>
            <span className="text-xs">✤</span>
            <Feather className="w-4 h-4 text-[#B93826]" />
            <span className="text-xs">✤</span>
            <span className="text-sm">♦</span>
            <span className="w-12 h-[1px] bg-current opacity-40"></span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            
            {/* Primary Maroon Pill CTA */}
            <button
              onClick={handleReadClick}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#7A2216] hover:bg-[#962A1C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest shadow-xl shadow-[#7A2216]/35 flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 group border border-[#D4AF37]/40"
            >
              <span>READ E-BOOK NOW</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Sync Across Devices */}
            <button
              onClick={onSync}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 ${
                isDark
                  ? 'bg-[#2A2019] border-[#D4AF37]/50 text-[#F5E6D3] hover:bg-[#382B21]'
                  : 'bg-[#FFF9EE] border-[#ECC480] text-[#78461E] hover:bg-[#FBEED7] shadow-sm'
              }`}
            >
              <Cloud className="w-4 h-4 text-[#D4AF37]" />
              <span>SYNC ACROSS PHONES</span>
            </button>

          </div>

        </div>

      </div>
    </section>
  );
};
