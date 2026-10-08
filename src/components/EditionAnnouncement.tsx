import React from 'react';
import { Calendar, Sparkles, Award, Star, Compass, ArrowDown, BookOpen } from 'lucide-react';
import { motion, type Variants } from 'motion/react';

interface EditionAnnouncementProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

export const EditionAnnouncement: React.FC<EditionAnnouncementProps> = ({
  isDark,
  onContinueJourney
}) => {
  const firstEditionText = "First Edition: 2026";
  const publishedOnText = "Published On: 29th November, 2026";

  // Staggered letter animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: 0.1
      }
    }
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 14,
        stiffness: 160
      }
    }
  };

  return (
    <section id="edition-announcement" className="relative py-8 sm:py-12 px-3 sm:px-6 max-w-4xl mx-auto overflow-hidden select-none">
      
      {/* Background Ultra-Realistic Radiant Halo Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] h-[200px] sm:h-[300px] bg-gradient-to-r from-[#D4AF37]/20 via-[#B93826]/20 to-[#ECC480]/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Luxury Golden Plaque Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`relative rounded-3xl p-6 sm:p-10 border transition-all duration-500 shadow-2xl overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-b from-[#1E1611]/95 via-[#15100D]/98 to-[#100C09]/95 border-[#D4AF37]/40 shadow-[0_0_60px_rgba(212,175,55,0.18)]' 
            : 'bg-gradient-to-b from-[#FFFDF9]/95 via-[#FAF5EC]/98 to-[#F5EAD8]/95 border-[#E5A93C]/45 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.18)]'
        }`}
      >
        {/* Cultural Corner Filigree Accents */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-md" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-md" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-md" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#D4AF37] rounded-br-md" />

        {/* Ambient Shimmer Sweep Animation Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmerGold_5s_infinite] pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/50 text-[#B93826] dark:text-[#ECC480] text-[10px] sm:text-xs font-cinzel font-bold tracking-widest uppercase shadow-sm">
            <Award className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            <span>OFFICIAL MANUSCRIPT RELEASE</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          </div>
          <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>

        {/* Dynamic Letter-by-Letter Animated Text Content */}
        <div className="space-y-4 text-center">
          
          {/* 1. FIRST EDITION: 2026 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-[1px] sm:gap-x-[2px] leading-tight"
          >
            {firstEditionText.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className={`font-cinzel text-xl sm:text-3xl md:text-4xl font-black tracking-wider uppercase inline-block ${
                  char === " " ? "w-2 sm:w-3" : ""
                } ${
                  index >= 15 // The "2026" part
                    ? 'text-[#B93826] dark:text-[#FFD572] drop-shadow-[0_0_15px_rgba(229,169,60,0.6)] font-extrabold'
                    : isDark ? 'text-[#FAF5EE]' : 'text-[#2C1F16]'
                }`}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          {/* Golden Divider with Rotating Star */}
          <div className="flex items-center justify-center gap-3 py-1">
            <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#B93826] to-[#E5A93C] flex items-center justify-center text-white shadow-md">
              <Star className="w-3.5 h-3.5 fill-current text-white animate-spin [animation-duration:12s]" />
            </div>
            <div className="h-[1.5px] w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#D4AF37] to-transparent" />
          </div>

          {/* 2. PUBLISHED ON: 29th NOVEMBER, 2026 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-x-[1px] sm:gap-x-[2px] leading-snug"
          >
            {publishedOnText.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className={`font-cormorant text-lg sm:text-2xl md:text-3xl font-bold tracking-wide inline-block ${
                  char === " " ? "w-1.5 sm:w-2" : ""
                } ${
                  index >= 14 // The "29th November, 2026" part
                    ? 'text-[#9E472A] dark:text-[#ECC480] drop-shadow-[0_0_12px_rgba(212,175,55,0.4)] font-extrabold italic'
                    : isDark ? 'text-[#D0C3B5]' : 'text-[#4A382A]'
                }`}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

        </div>

        {/* Bottom Subtext: Technodef Press Assurance */}
        <div className="mt-6 pt-4 border-t border-[#D4AF37]/25 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-cinzel text-stone-500 dark:text-stone-400">
          <Calendar className="w-3.5 h-3.5 text-[#B93826] dark:text-[#E5A93C]" />
          <span>Official Publication Release by Author Pratyay Saha • Technodef Press</span>
        </div>

        {/* Step-by-Step Guided Journey Button to Enter E-Reader */}
        {onContinueJourney && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>Continue Journey: Enter Digital E-Reader</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </motion.div>
    </section>
  );
};
