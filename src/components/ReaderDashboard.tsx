import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  GraduationCap, 
  Languages, 
  Flame, 
  MessageSquare, 
  ChevronRight, 
  Sparkles, 
  Compass, 
  Feather, 
  ShieldCheck, 
  Clock, 
  Volume2, 
  Eye, 
  BookmarkCheck,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';

interface ReaderDashboardProps {
  onOpenReader: () => void;
  onOpenImmersiveReader: () => void;
  onOpenExam: () => void;
  onOpenCertificate: () => void;
  onOpenReflections: () => void;
}

export const ReaderDashboard: React.FC<ReaderDashboardProps> = ({
  onOpenReader,
  onOpenImmersiveReader,
  onOpenExam,
  onOpenCertificate,
  onOpenReflections
}) => {
  const [savedWordCount, setSavedWordCount] = useState<number>(4);
  const [readingStreak, setReadingStreak] = useState<number>(17);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wow_saved_words');
      if (saved) {
        setSavedWordCount(JSON.parse(saved).length);
      }
    } catch {}
  }, []);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Light Theme Premium Dashboard Frame */}
      <div className="bg-[#FAF7F0] border-2 border-[#E3D7BF] rounded-3xl shadow-xl p-6 sm:p-10 text-[#2C1D14] relative overflow-hidden">
        
        {/* Subtle Heritage Gold Corner Accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#8B2213]/10 to-transparent rounded-tr-full pointer-events-none" />

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E3D7BF] pb-8 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B2213]/10 text-[#8B2213] text-[11px] font-cinzel font-bold tracking-widest uppercase border border-[#D4AF37]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>READER SCHOLASTIC DASHBOARD</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-cinzel font-extrabold text-[#2C1D14] tracking-wide">
              Manuscript Reading &amp; Learning Hub
            </h2>
            
            <p className="text-xs sm:text-sm font-serif text-[#6C5441] max-w-2xl leading-relaxed">
              Explore your personal reading progression, live multilingual vocabulary translations, and interactive scholastic tools for <em>Wilting of Words</em> by Pratyay Saha.
            </p>
          </div>

          {/* Quick Immersion Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                audioSynth.playTurnSound();
                onOpenImmersiveReader();
              }}
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border-2 border-[#D4AF37]/60 text-[#8B2213] text-xs font-cinzel font-bold tracking-wider flex items-center gap-2 shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Immersive Mode</span>
            </button>

            <button
              onClick={() => {
                audioSynth.playTurnSound();
                onOpenReader();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] hover:from-[#A02616] hover:to-[#C9402C] text-white text-xs font-cinzel font-bold tracking-wider flex items-center gap-2 shadow-md shadow-[#8B2213]/25 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border border-[#D4AF37]/40"
            >
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>Open Reader</span>
            </button>
          </div>
        </div>

        {/* 4 Core Scholastic Metrics Cards (Light Premium Styling, No Unnecessary Emojis) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-b border-[#E3D7BF] relative z-10">
          
          {/* 1. Chapter Progress */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DEC9] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#8B2213]">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#6C5441]">Chapter Progress</span>
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-xl sm:text-2xl font-cinzel font-extrabold text-[#2C1D14]">
              Chapter 1
            </div>
            <div className="w-full bg-[#EFE9DC] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B2213] to-[#D4AF37] h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] font-serif text-[#6C5441]">
              The Colour of Morning • 100% Inscribed
            </p>
          </div>

          {/* 2. Reading Streak */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DEC9] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#8B2213]">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#6C5441]">Reading Streak</span>
              <Flame className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-xl sm:text-2xl font-cinzel font-extrabold text-[#2C1D14]">
              {readingStreak} Days
            </div>
            <p className="text-[10px] font-serif text-[#6C5441]">
              Continuous daily contemplation
            </p>
          </div>

          {/* 3. Multilingual Lexicon Vault */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DEC9] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#8B2213]">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#6C5441]">Lexicon Vault</span>
              <Languages className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-xl sm:text-2xl font-cinzel font-extrabold text-[#2C1D14]">
              {savedWordCount} Words
            </div>
            <p className="text-[10px] font-serif text-[#6C5441]">
              5 languages translated in real time
            </p>
          </div>

          {/* 4. Scholastic Standing */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DEC9] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#8B2213]">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#6C5441]">Scholastic Status</span>
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-xl sm:text-2xl font-cinzel font-extrabold text-[#2C1D14]">
              Honors Ready
            </div>
            <p className="text-[10px] font-serif text-[#6C5441]">
              Eligible for Author-Signed Certificate
            </p>
          </div>

        </div>

        {/* Interactive Feature Portals Matrix */}
        <div className="pt-8 space-y-6 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-cinzel font-bold text-[#2C1D14] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>Interactive Reading &amp; Scholastic Portals</span>
            </h3>
            <span className="text-xs font-serif text-[#6C5441]">
              All features grounded in authentic Chapter 1 canon
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Immersive Reading Portal */}
            <div 
              onClick={() => {
                audioSynth.playTurnSound();
                onOpenImmersiveReader();
              }}
              className="p-6 rounded-2xl bg-white hover:bg-[#FDFBF7] border border-[#E8DEC9] hover:border-[#D4AF37] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B2213]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B2213] group-hover:scale-105 transition-transform">
                  <Maximize2 className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-base font-cinzel font-bold text-[#2C1D14] group-hover:text-[#8B2213] transition-colors flex items-center justify-between">
                    <span>Immersive Mode</span>
                    <ArrowUpRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs font-serif text-[#6C5441] mt-1.5 leading-relaxed">
                    Distraction-free reading canvas with illuminated drop cap, line ruler, audio speech narration, and clean contrast themes.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E8DEC9] flex items-center justify-between text-xs font-cinzel font-bold text-[#8B2213]">
                <span>Launch Immersive Reader</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 2. Chapter 1 Scholastic Exam */}
            <div 
              onClick={() => {
                audioSynth.playTurnSound();
                onOpenExam();
              }}
              className="p-6 rounded-2xl bg-white hover:bg-[#FDFBF7] border border-[#E8DEC9] hover:border-[#D4AF37] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B2213]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B2213] group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-base font-cinzel font-bold text-[#2C1D14] group-hover:text-[#8B2213] transition-colors flex items-center justify-between">
                    <span>Chapter 1 Exam</span>
                    <ArrowUpRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs font-serif text-[#6C5441] mt-1.5 leading-relaxed">
                    Test your memory and deep literary comprehension with 10 questions drawn verbatim from Chapter 1's morning narrative.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E8DEC9] flex items-center justify-between text-xs font-cinzel font-bold text-[#8B2213]">
                <span>Start Scholastic Test</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 3. Author-Signed Certificate Portal */}
            <div 
              onClick={() => {
                audioSynth.playTurnSound();
                onOpenCertificate();
              }}
              className="p-6 rounded-2xl bg-white hover:bg-[#FDFBF7] border border-[#E8DEC9] hover:border-[#D4AF37] transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B2213]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#8B2213] group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-base font-cinzel font-bold text-[#2C1D14] group-hover:text-[#8B2213] transition-colors flex items-center justify-between">
                    <span>Royal Certificate</span>
                    <ArrowUpRight className="w-4 h-4 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs font-serif text-[#6C5441] mt-1.5 leading-relaxed">
                    Generate and download your official author-signed certificate inscribed with your name and serialized verification seal.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E8DEC9] flex items-center justify-between text-xs font-cinzel font-bold text-[#8B2213]">
                <span>View Certificate</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Daily Canon Inscription Callout Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#F5EEDB] via-[#FAF7F0] to-[#F5EEDB] border border-[#D4AF37]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-[#8B2213] block">
                DAILY CANON INSCRIPTION
              </span>
              <p className="text-sm sm:text-base font-serif italic font-bold text-[#2C1D14]">
                “If nobody gives you a voice, perhaps you have to write one.”
              </p>
              <p className="text-[11px] font-serif text-[#6C5441]">
                — Aratrika • Chapter 1: The Colour of Morning (Page 3)
              </p>
            </div>

            <button
              onClick={() => {
                audioSynth.playTurnSound();
                onOpenReader();
              }}
              className="px-5 py-2 rounded-xl bg-white border border-[#D4AF37] text-[#8B2213] hover:bg-[#8B2213] hover:text-white font-cinzel text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer shrink-0"
            >
              Read in Context
            </button>
          </div>

        </div>

      </div>

    </section>
  );
};
