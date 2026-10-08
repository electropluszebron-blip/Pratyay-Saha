import React from 'react';
import { 
  Sparkles, 
  Award, 
  Feather, 
  CheckCircle2, 
  Code2, 
  Palette, 
  ShieldCheck, 
  BookOpen, 
  Heart, 
  Building,
  Terminal,
  FileCheck
} from 'lucide-react';

interface SanctuaryCreditsProps {
  isDark: boolean;
}

export const SanctuaryCredits: React.FC<SanctuaryCreditsProps> = ({ isDark }) => {
  return (
    <section id="credits-section" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B93826]/10 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-3 border border-[#D4AF37]/35 shadow-xs">
          <Award className="w-3.5 h-3.5" />
          <span>PORTAL ARCHITECTURE &amp; ACKNOWLEDGEMENTS</span>
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>

        <h3 className={`font-cinzel text-2xl sm:text-4xl font-extrabold tracking-wide mb-3 ${
          isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
        }`}>
          Credits &amp; Acknowledgements
        </h3>

        <p className="text-xs sm:text-sm text-[#6C5441] dark:text-[#C4B3A2] leading-relaxed font-serif">
          Honoring the creative authorship, engineering architecture, and quality assurance verification behind the <em>Wilting of Words</em> digital sanctuary.
        </p>
      </div>

      {/* Main Credits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Card 1: Author, Developer, Designer, HOD, Owner, Manufacturer - Pratyay Saha */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all relative overflow-hidden group shadow-xl ${
          isDark 
            ? 'bg-gradient-to-br from-[#1E1713] to-[#14100D] border-[#D4AF37]/60 hover:border-[#D4AF37]' 
            : 'bg-gradient-to-br from-[#FFFDF9] to-[#FBF6EE] border-[#D4AF37]/70 hover:border-[#B93826]'
        }`}>
          {/* Subtle Ambient Background Aura */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Corner Filigree */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#B93826]/50" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#B93826]/50" />

          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B2213] via-[#B93826] to-[#E5A93C] text-white flex items-center justify-center shadow-lg shrink-0 border border-[#FFE58F]/40">
              <Feather className="w-7 h-7 text-amber-100" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#B93826]/15 text-[#B93826] dark:text-[#E5A93C] text-[10px] font-cinzel font-bold tracking-wider uppercase border border-[#D4AF37]/40">
                  Primary Creator &bull; Head of Department
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-cinzel font-semibold">
                  Owner &bull; Manufacturer
                </span>
              </div>
              <h4 className="font-cinzel text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-wide">
                Pratyay Saha
              </h4>
              <p className="text-xs font-serif text-[#8B2213] dark:text-[#E5A93C] font-semibold">
                Author, Developer, Designer, Head Of Department, Owner, Manufacturer
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-serif mb-5">
            Novel author of <em>Wilting of Words</em>, lead full-stack developer, visual experience designer, owner, and manufacturer. Architected the digital manuscript cabinet, Seraph AI literary companion, reading statistics, and sanctuary themes.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-stone-700 dark:text-stone-300">
              <BookOpen className="w-3 h-3 text-[#B93826]" /> Novelist &amp; Author
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-stone-700 dark:text-stone-300">
              <Code2 className="w-3 h-3 text-[#D4AF37]" /> Full-Stack Architecture
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-stone-700 dark:text-stone-300">
              <Palette className="w-3 h-3 text-[#8B2213]" /> UI/UX Design &amp; Typography
            </span>
          </div>
        </div>

        {/* Card 2: QA Tester - Pratyay Saha */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all relative overflow-hidden group shadow-xl ${
          isDark 
            ? 'bg-gradient-to-br from-[#1E1713] to-[#14100D] border-[#D4AF37]/60 hover:border-[#D4AF37]' 
            : 'bg-gradient-to-br from-[#FFFDF9] to-[#FBF6EE] border-[#D4AF37]/70 hover:border-[#B93826]'
        }`}>
          {/* Subtle Ambient Background Aura */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Corner Filigree */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]/50" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]/50" />

          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1B4D3E] via-[#0D7A5F] to-[#20BF6B] text-white flex items-center justify-center shadow-lg shrink-0 border border-emerald-400/40">
              <FileCheck className="w-7 h-7 text-emerald-100" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-cinzel font-bold tracking-wider uppercase border border-emerald-500/40">
                  Quality Assurance
                </span>
                <span className="px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-600 dark:text-stone-300 text-[10px] font-cinzel font-semibold">
                  Lead QA Tester
                </span>
              </div>
              <h4 className="font-cinzel text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-wide">
                Pratyay Saha
              </h4>
              <p className="text-xs font-serif text-emerald-700 dark:text-emerald-400 font-semibold">
                QA Tester &amp; Quality Specialist
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-serif mb-5">
            Lead Quality Assurance verification specialist. Oversees sanctuary operations, cross-platform validation across devices, real-time sync verification, and quality release standards.
          </p>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-stone-700 dark:text-stone-300">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Executive &amp; Management
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-stone-700 dark:text-stone-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> QA &amp; Cross-Platform Testing
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-cinzel font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-stone-700 dark:text-stone-300">
              <Terminal className="w-3 h-3 text-[#D4AF37]" /> Release Integrity
            </span>
          </div>
        </div>

      </div>

      {/* Publisher Banner Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border text-center relative overflow-hidden ${
        isDark ? 'bg-[#16110E] border-[#3E2D20]' : 'bg-[#FAF4EB] border-[#E5D7C2]'
      }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white flex items-center justify-center shadow-md shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-cinzel font-bold text-[#8B2213] dark:text-[#FFE58F] uppercase tracking-widest block">
                PUBLISHED &amp; DISTRIBUTED BY
              </span>
              <h5 className="font-cinzel text-base font-bold text-stone-900 dark:text-stone-100">
                Technodef &bull; Technodef Press
              </h5>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-serif italic text-stone-500 dark:text-stone-400">
            <Heart className="w-3.5 h-3.5 text-[#B93826] fill-current" />
            <span>Dedicated to preserving Aratrika's voice and Bengali literary heritage.</span>
          </div>
        </div>
      </div>

    </section>
  );
};
