import React, { useState } from 'react';
import { 
  Sprout, 
  PenTool, 
  Palette, 
  FileText, 
  RotateCw, 
  BookOpenCheck, 
  Sparkles, 
  Calendar, 
  Clock, 
  Compass, 
  ArrowDown, 
  CheckCircle2, 
  Scroll, 
  Feather,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WRITING_JOURNEY, WRITING_JOURNEY_SUMMARY, WritingMilestone } from '../data/bookData';
import { audioSynth } from '../services/audioSynth';

interface WritersTimelineProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

const iconMap = {
  Sprout: Sprout,
  PenTool: PenTool,
  Palette: Palette,
  FileText: FileText,
  RotateCw: RotateCw,
  BookOpenCheck: BookOpenCheck
};

export const WritersTimeline: React.FC<WritersTimelineProps> = ({
  isDark,
  onContinueJourney
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<number>(0);

  const handleSelect = (index: number) => {
    setSelectedMilestone(index);
    try {
      audioSynth.playNow();
    } catch {}
  };

  return (
    <section 
      id="writers-journey" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Dynamic Ambient Royal Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[750px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#D4AF37]/20 via-[#B93826]/15 to-[#E5A93C]/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Royal Enclosure Container */}
      <div className={`relative rounded-3xl p-6 sm:p-12 border transition-all duration-500 shadow-2xl ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_60px_rgba(212,175,55,0.14)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.15)]'
      }`}>
        
        {/* Cultural Corner Filigree Accents */}
        <div className="absolute top-3.5 left-3.5 w-7 h-7 border-t-2 border-l-2 border-[#D4AF37]/75 rounded-tl-lg" />
        <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-2 border-r-2 border-[#D4AF37]/75 rounded-tr-lg" />
        <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-2 border-l-2 border-[#D4AF37]/75 rounded-bl-lg" />
        <div className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-2 border-r-2 border-[#D4AF37]/75 rounded-br-lg" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/45 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Scroll className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>LITERARY CHRONICLES</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            THE WRITING JOURNEY
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "A manuscript written in ink, sculpted through discipline, and consecrated in publication."
          </p>
        </div>

        {/* 
          ==================================================================
          ANIMATED TIMELINE CARDS WITH DYNAMIC GOLD CONNECTOR PATHWAY
          ==================================================================
        */}
        <div className="relative">
          
          {/* Vertical Golden Connecting Spine (for desktop and tablet) */}
          <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 -translate-x-1/2 w-1 bg-gradient-to-b from-[#D4AF37] via-[#B93826] to-[#E5A93C] rounded-full opacity-60">
            <div className="w-full h-24 bg-gradient-to-b from-white to-[#FFD778] animate-[pulse_2s_infinite] blur-[1px]" />
          </div>

          <div className="space-y-6 sm:space-y-10">
            {WRITING_JOURNEY.map((milestone, idx) => {
              const IconComponent = iconMap[milestone.icon] || Feather;
              const isEven = idx % 2 === 0;
              const isSelected = selectedMilestone === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  onClick={() => handleSelect(idx)}
                  className={`relative cursor-pointer transition-all duration-300 rounded-3xl p-5 sm:p-7 border ${
                    isSelected
                      ? isDark 
                        ? 'bg-[#221811] border-[#E5A93C] shadow-[0_0_35px_rgba(229,169,60,0.3)] scale-[1.01]'
                        : 'bg-[#FFFDF9] border-[#B93826] shadow-[0_15px_40px_-10px_rgba(185,56,38,0.25)] scale-[1.01]'
                      : isDark
                        ? 'bg-[#18120E]/80 border-[#3D2C20] hover:border-[#D4AF37]/60 hover:bg-[#1E1510]'
                        : 'bg-[#FAF6EF]/90 border-[#E5DBC7] hover:border-[#B93826]/50 hover:bg-white'
                  } lg:w-[46%] ${isEven ? 'lg:mr-auto lg:text-right' : 'lg:ml-auto lg:text-left'}`}
                >
                  
                  {/* Central Node Marker on Desktop Spine */}
                  <div className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 border-[#D4AF37] shadow-xl items-center justify-center ${
                    isEven ? '-right-[52px]' : '-left-[52px]'
                  } ${
                    isSelected ? 'bg-[#B93826] text-white scale-110' : 'bg-[#1E140D] text-[#E5A93C]'
                  } transition-all duration-300 z-10`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Top Date & Stage Bar */}
                  <div className={`flex flex-wrap items-center gap-2 mb-3 ${isEven ? 'lg:justify-end' : 'lg:justify-start'}`}>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white text-[11px] font-cinzel font-bold tracking-widest uppercase shadow-sm">
                      <Calendar className="w-3 h-3 text-amber-200" />
                      <span>{milestone.date}</span>
                    </div>

                    <span className="text-[11px] font-cinzel font-semibold tracking-wider text-[#9E472A] dark:text-[#E5A93C] uppercase">
                      • {milestone.stage}
                    </span>
                  </div>

                  {/* Milestone Title with Royal Icon */}
                  <div className={`flex items-center gap-3 mb-2.5 ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${milestone.royalAura} text-white flex items-center justify-center shrink-0 shadow-md transform transition-transform group-hover:scale-110`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className={`font-cinzel text-lg sm:text-xl font-extrabold tracking-wide ${
                      isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
                    }`}>
                      {milestone.title}
                    </h3>
                  </div>

                  {/* Description Paragraph */}
                  <p className="font-serif text-sm sm:text-base leading-relaxed text-[#4A382A] dark:text-[#DCD0C4]">
                    {milestone.description}
                  </p>

                  {/* Bottom Tags */}
                  <div className={`mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-2 text-[10px] font-cinzel uppercase tracking-wider text-stone-500 dark:text-stone-400 ${
                    isEven ? 'lg:justify-end' : 'lg:justify-start'
                  }`}>
                    {milestone.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>

        {/* 
          ==================================================================
          ROYAL GRAND INSCRIPTION SCROLL: FROM AN IDEA TO A NOVEL
          ==================================================================
        */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`mt-14 sm:mt-20 rounded-3xl p-6 sm:p-10 border transition-all text-center relative overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-b from-[#1F150F] via-[#170F0B] to-[#120C08] border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.15)]' 
              : 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EA] to-[#F5EAD6] border-[#E5A93C]/55 shadow-[0_20px_50px_-15px_rgba(185,56,38,0.2)]'
          }`}
        >
          {/* Subtle Top Seal */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Feather className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C]" />
            <span className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C]">
              {WRITING_JOURNEY_SUMMARY.header}
            </span>
            <Feather className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C]" />
          </div>

          {/* Timeframe Banner */}
          <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] text-white font-cinzel font-black text-sm sm:text-lg tracking-widest uppercase shadow-xl mb-5 border border-[#FFE58F]/60">
            {WRITING_JOURNEY_SUMMARY.timeframe}
          </div>

          {/* Core Chronicle Message */}
          <p className="font-cormorant italic text-lg sm:text-2xl text-[#4A382A] dark:text-[#FAF5EE] font-semibold leading-relaxed max-w-3xl mx-auto">
            "{WRITING_JOURNEY_SUMMARY.quote}"
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-cinzel text-[#8B2213] dark:text-[#ECC480] uppercase tracking-wider font-bold">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <span>231 Days of Literary Craftsmanship • Authored by Pratyay Saha</span>
          </div>

          {/* Step-by-Step Continue Journey Button */}
          {onContinueJourney && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={onContinueJourney}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
              >
                <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
                <span>Continue Journey: The Writer's Desk</span>
                <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
              </button>
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
};
