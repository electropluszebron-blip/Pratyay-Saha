import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Feather, Flame, ArrowDown, Compass, Award, Clock, CheckCircle2 } from 'lucide-react';
import { NOVEL_META } from '../data/bookData';
import { KonarkSunWheelMandala } from './KonarkSunWheelMandala';
import { activeTimeTracker } from '../services/activeTimeTracker';
import { Proper3DBook } from './Proper3DBook';

interface HeroCoverSectionProps {
  isDark: boolean;
  onStartReading: () => void;
  onContinueJourney?: () => void;
  onExploreAuthor?: () => void;
  onOpenPreview?: () => void;
  onOpenCertificate?: () => void;
  onOpenSeraph?: () => void;
  onOpenPoster?: () => void;
}

export const HeroCoverSection: React.FC<HeroCoverSectionProps> = ({
  isDark,
  onStartReading,
  onContinueJourney = onStartReading,
  onExploreAuthor,
  onOpenPreview,
  onOpenCertificate,
  onOpenSeraph,
  onOpenPoster
}) => {
  const [activeFormatted, setActiveFormatted] = useState<string>(() => activeTimeTracker.getFormattedTime());
  const [progressPercent, setProgressPercent] = useState<number>(() => activeTimeTracker.getProgressPercentage());
  const [isQualified, setIsQualified] = useState<boolean>(() => activeTimeTracker.isQualified());

  useEffect(() => {
    const unsubscribe = activeTimeTracker.subscribe((_secs, qualified) => {
      setActiveFormatted(activeTimeTracker.getFormattedTime());
      setProgressPercent(activeTimeTracker.getProgressPercentage());
      setIsQualified(qualified);
    });
    return unsubscribe;
  }, []);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <section 
      id="hero-cover" 
      className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center overflow-hidden text-center"
    >
      {/* 
        GPU Accelerated Ambient Keyframe Animations to prevent lagging or jerking
      */}
      <style>{`
        @keyframes sun-pulsate {
          0%, 100% { opacity: 0.45; transform: scale(1) translate3d(0,0,0); }
          50% { opacity: 0.7; transform: scale(1.06) translate3d(0,0,0); }
        }
        @keyframes radial-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .gpu-pulse {
          animation: sun-pulsate 12s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .gpu-spin {
          animation: radial-spin 80s linear infinite;
          will-change: transform;
        }
      `}</style>

      {/* 
        SACRED ROTATING MANDALAS & SUN WHEELS (Konark & Bishnupur Style) WITH EXPLICIT ACCELERATED BACKGROUND ANIMATIONS
      */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center justify-center gpu-pulse">
        <div className="gpu-spin">
          <KonarkSunWheelMandala
            size={580}
            isDark={isDark}
            opacity={isDark ? 0.6 : 0.45}
            showBindu={true}
            className="scale-90 sm:scale-100 transition-transform duration-700"
          />
        </div>
        <div className="absolute w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full bg-gradient-to-tr from-[#E5A93C]/20 via-[#B93826]/15 to-[#D85A2A]/20 blur-3xl -z-10" />
      </div>

      {/* Prominent Hero Header Showcase */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
        
        {/* Top Publisher Ribbon */}
        <div className="mb-4 sm:mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D85A2A] text-white text-[11px] sm:text-xs font-cinzel font-bold tracking-widest uppercase shadow-xl border border-[#FFE58F]/60">
          <span>PUBLISHED BY TECHNODEF PRESS</span>
        </div>

        {/* Title */}
        <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_4px_25px_rgba(212,175,55,0.45)] mb-2">
          WILTING OF WORDS
        </h1>

        {/* Subtitle & Author */}
        <p className="font-cormorant italic text-lg sm:text-2xl font-bold text-[#8B2213] dark:text-[#FFE58F] tracking-wide mb-2">
          A Novel by Pratyay Saha
        </p>

        {/* Atmospheric Tagline */}
        <p className="font-serif text-xs sm:text-sm md:text-base text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed mb-6">
          "Some voices are silenced in life, but their words live louder than ever."
        </p>

        {/* 
          ==================================================================
          1. THE OFFICIAL 3D HARDCOVER BOOK (PHYSICAL REALISTIC DEPTH)
          ==================================================================
        */}
        <Proper3DBook 
          size="lg" 
          onClick={onContinueJourney} 
          showExploreHUD={true} 
          className="mb-10 mt-3 z-10" 
        />

        {/* Explore and Meet the Author Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center max-w-lg mb-8 z-10">
          <button
            onClick={onOpenPreview}
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#E5A93C] hover:brightness-110 text-white font-cinzel font-extrabold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border border-[#FFE58F]/80 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-200 stroke-[2.5]" />
            <span>Open E-Book</span>
          </button>

          <button
            onClick={onContinueJourney}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border border-[#FFE58F]/60 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-200" />
            <span>Explore the Book</span>
          </button>

          <button
            onClick={onExploreAuthor}
            className={`w-full sm:w-auto px-6 py-3 rounded-full border text-xs sm:text-sm font-cinzel font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
              isDark 
                ? 'border-[#D4AF37]/60 text-[#FFE58F] bg-white/5 hover:bg-white/10' 
                : 'border-[#B93826]/50 text-[#8B2213] bg-black/5 hover:bg-black/10'
            }`}
          >
            <Feather className="w-4 h-4 text-[#D85A2A]" />
            <span>Meet the Author</span>
          </button>

          {onOpenPoster && (
            <button
              onClick={onOpenPoster}
              className={`w-full sm:w-auto px-6 py-3 rounded-full border text-xs sm:text-sm font-cinzel font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                isDark 
                  ? 'border-[#D4AF37]/80 text-[#FFE58F] bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                  : 'border-[#D4AF37] text-[#8B2213] bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 shadow-[0_2px_10px_rgba(212,175,55,0.2)]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Official Poster</span>
            </button>
          )}
        </div>

        {/* 
          ==================================================================
          2. MAJESTIC ROYAL TIMER & CERTIFICATE PORTAL CARD (PLACED AFTER COVER AS REQUESTED)
          ==================================================================
        */}
        <div className="mb-8 w-full max-w-lg p-6 rounded-3xl border-2 border-double border-[#D4AF37] bg-gradient-to-b from-[#FCFAF5] via-[#FAF2E5] to-[#F5EEDB] text-stone-850 shadow-[0_20px_45px_-12px_rgba(212,175,55,0.25),0_0_30px_rgba(139,34,19,0.06),-4px_4px_0_0_rgba(212,175,55,0.25)] relative overflow-hidden z-10 hover:-translate-y-1 transition-all duration-300">
          
          {/* Subtle cover backdrop watermark */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.05] bg-cover bg-center"
            style={{ backgroundImage: `url('/cover.webp')`, mixBlendMode: 'multiply' }}
          />

          {/* Symmetrical Fine Royal Corner Lines (Clean - No *+* symbols!) */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t border-l border-[#8B2213]/40 animate-pulse" />
          <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t border-r border-[#8B2213]/40 animate-pulse" />
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b border-l border-[#8B2213]/40 animate-pulse" />
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b border-r border-[#8B2213]/40 animate-pulse" />

          {/* Ambient Glow Pulse inside */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFE58F]/15 to-transparent -translate-x-full animate-[shimmer_4s_infinite] pointer-events-none" />

          {/* Header Description - Fully Centered and Polished */}
          <div className="text-center relative z-10 pb-2.5">
            <span className="text-[10px] font-cinzel font-black uppercase tracking-[0.25em] text-[#8B2213] block mb-1">
              Official Credential Portal
            </span>
            <h4 className="font-cinzel text-xs sm:text-sm font-bold text-stone-900 tracking-[0.06em] leading-snug">
              Claim Your Certificate of Literary Mastery
            </h4>
          </div>

          {/* Majestic Premium Claim Button & Seraph AI Button */}
          <div className="mt-4 pt-4 border-t border-[#D4AF37]/35 flex flex-col sm:flex-row gap-3.5 relative z-10">
            <button
              onClick={onOpenCertificate}
              className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#A13320] via-[#B93826] to-[#811D11] hover:brightness-110 text-white font-cinzel font-black text-xs sm:text-[13px] tracking-[0.1em] uppercase shadow-[0_4px_18px_rgba(185,56,38,0.35),-3px_3px_0_0_rgba(212,175,55,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(185,56,38,0.45)] active:scale-95 active:translate-y-0 transition-all duration-300 flex items-center justify-center cursor-pointer border border-[#FFE58F]/50"
            >
              <span>Download Royal Certificate</span>
            </button>

            {onOpenSeraph && (
              <button
                onClick={onOpenSeraph}
                className="px-6 py-4 rounded-2xl bg-gradient-to-b from-white to-[#FAF6EF] hover:brightness-105 text-[#8B2213] border border-[#D4AF37] font-cinzel font-black text-xs sm:text-[13px] tracking-[0.1em] uppercase transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.08),-3px_3px_0_0_rgba(139,34,19,0.2)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
              >
                <span>Seraph AI</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 
        ==================================================================
        DYNAMIC ROYAL ART INTEGRATED ON-SCREEN CARDS (Immediate Grand Welcome)
        ==================================================================
      */}
      <div className="relative z-10 mt-10 sm:mt-14 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
        
        {/* Card 1: Sacred Manuscript Archival */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${
          isDark 
            ? 'bg-[#1A130E]/90 border-[#D4AF37]/35 shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:border-[#D4AF37]' 
            : 'bg-[#FAF6EF]/90 border-[#E5DBC7] shadow-lg hover:border-[#B93826]/60 hover:bg-white'
        }`}>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#B93826] to-[#D85A2A] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-[#FFD778]" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-serif italic">AUTHENTIC MANUSCRIPT</span>
              <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#2D1E16] dark:text-[#FAF5EE]">
                219 Sepia Ink Pages
              </h4>
            </div>
          </div>
          <p className="font-serif text-xs leading-relaxed text-[#5A4535] dark:text-[#C5B7A8]">
            Complete unedited literary chronicle with interactive high-resolution reader and page bookmarks.
          </p>
        </div>

        {/* Card 2: Royal Heritage & Territory */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${
          isDark 
            ? 'bg-[#1A130E]/90 border-[#D4AF37]/35 shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:border-[#D4AF37]' 
            : 'bg-[#FAF6EF]/90 border-[#E5DBC7] shadow-lg hover:border-[#B93826]/60 hover:bg-white'
        }`}>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#E5A93C] to-[#D4AF37] text-stone-950 flex items-center justify-center shadow-md">
              <Feather className="w-4 h-4 text-[#8B2213]" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-serif italic">BENGAL HERITAGE</span>
              <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#2D1E16] dark:text-[#FAF5EE]">
                Chakdaha Sanctuary
              </h4>
            </div>
          </div>
          <p className="font-serif text-xs leading-relaxed text-[#5A4535] dark:text-[#C5B7A8]">
            Deep Bengal terracotta aesthetics and monsoon riverbank imagery woven into Aratrika's memories.
          </p>
        </div>

        {/* Card 3: Royal Digital Archives */}
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${
          isDark 
            ? 'bg-[#1A130E]/90 border-[#D4AF37]/35 shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:border-[#D4AF37]' 
            : 'bg-[#FAF6EF]/90 border-[#E5DBC7] shadow-lg hover:border-[#B93826]/60 hover:bg-white'
        }`}>
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#B93826] text-white flex items-center justify-center shadow-md">
              <Award className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-serif italic">LITERARY AWARD</span>
              <h4 className="font-cinzel text-xs sm:text-sm font-bold text-[#2D1E16] dark:text-[#FAF5EE]">
                Conferment Registry
              </h4>
            </div>
          </div>
          <p className="font-serif text-xs leading-relaxed text-[#5A4535] dark:text-[#C5B7A8]">
            Earn your light Bengali heritage Certificate of Literary Mastery verified by publisher Technodef.
          </p>
        </div>

      </div>

      {/* Down Arrow Indicator */}
      <div 
        className="relative z-10 mt-12 sm:mt-16 animate-bounce cursor-pointer flex flex-col items-center" 
        onClick={() => {
          const el = document.getElementById('about-novel');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#B93826] dark:text-[#E5A93C] mb-1 block uppercase">
          Venture Below
        </span>
        <ArrowDown className="w-4 h-4 text-[#B93826] dark:text-[#E5A93C]" />
      </div>

    </section>
  );
};
