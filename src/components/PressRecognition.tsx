import React, { useState } from 'react';
import { 
  Newspaper, 
  Award, 
  Sparkles, 
  Mail, 
  Send, 
  CheckCircle2, 
  Feather, 
  Flame, 
  Clock, 
  Building, 
  BookOpen, 
  Megaphone,
  Radio,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface PressRecognitionProps {
  isDark: boolean;
}

export const PressRecognition: React.FC<PressRecognitionProps> = ({ isDark }) => {
  const [inquirySent, setUploadSent] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setUploadSent(true);
    try { audioSynth.playNow(); } catch {}
  };

  return (
    <section 
      id="press-section" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[700px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Main Royal Container Enclosure */}
      <div className={`relative rounded-3xl p-6 sm:p-12 border transition-all duration-500 shadow-2xl ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_60px_rgba(212,175,55,0.12)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.14)]'
      }`}>
        
        {/* Cultural Corner Filigree Accents */}
        <div className="absolute top-3.5 left-3.5 w-7 h-7 border-t-2 border-l-2 border-[#D4AF37]/75 rounded-tl-lg" />
        <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-2 border-r-2 border-[#D4AF37]/75 rounded-tr-lg" />
        <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-2 border-l-2 border-[#D4AF37]/75 rounded-bl-lg" />
        <div className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-2 border-r-2 border-[#D4AF37]/75 rounded-br-lg" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/45 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Newspaper className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>MEDIA & RECOGNITION</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            PRESS & RECOGNITION
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "Official press releases, school literary features, interview archives, and editorial reviews."
          </p>
        </div>

        {/* 
          ==================================================================
          PUBLICATION ANNOUNCEMENT & COMING SOON PRESS PLAQUE
          ==================================================================
        */}
        <div className={`rounded-3xl p-8 sm:p-12 border transition-all text-center relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-b from-[#1F150F] via-[#170F0B] to-[#120C08] border-[#D4AF37]/50 shadow-2xl' 
            : 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EA] to-[#F5EAD6] border-[#E5A93C]/55 shadow-xl'
        }`}>
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Top Seal Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] text-white text-[11px] font-cinzel font-bold tracking-widest uppercase shadow-md border border-[#FFE58F]">
              <Flame className="w-3.5 h-3.5 text-amber-200" />
              <span>TECHNODEF PRESS OFFICIAL LANDMARK</span>
            </div>

            <h3 className={`font-cinzel text-2xl sm:text-4xl font-black uppercase tracking-wide ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
              Press & Features — Coming Soon
            </h3>

            <p className="font-serif text-sm sm:text-base md:text-lg text-[#5A4535] dark:text-[#D0C3B5] leading-relaxed max-w-2xl mx-auto">
              As <strong className="font-cinzel text-[#B93826] dark:text-[#E5A93C]">Wilting of Words</strong> prepares for its official planned publication on <span className="font-bold underline decoration-[#D4AF37]">29 November 2026</span>, official media coverage, school literary features, interviews, and literary critical reviews will be archived here.
            </p>

            {/* Supported Press Categories Preview Pills */}
            <div className="pt-2">
              <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
                Archival Press Categories
              </h5>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs font-cinzel font-bold">
                <span className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 text-[#8B2213] dark:text-[#FFE58F] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Literary Articles</span>
                </span>

                <span className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 text-[#8B2213] dark:text-[#FFE58F] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Author Interviews</span>
                </span>

                <span className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 text-[#8B2213] dark:text-[#FFE58F] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>School Features (St. Mary’s)</span>
                </span>

                <span className="px-3.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 text-[#8B2213] dark:text-[#FFE58F] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Honors & Recognitions</span>
                </span>
              </div>
            </div>

            {/* Media Inquiry Form */}
            <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 max-w-md mx-auto space-y-3">
              <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#B93826] dark:text-[#E5A93C] mb-2">
                Press & Media Inquiries
              </h5>
              
              {inquirySent ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-cinzel font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Inquiry received! Contacting: technodef.admin@gmail.com</span>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter press/journalist email..."
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-sans border focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                      isDark ? 'bg-black/40 border-[#3E2D20] text-white' : 'bg-white border-[#E8DFC8] text-stone-900'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B93826] to-[#E5A93C] text-white font-cinzel font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Inquire</span>
                  </button>
                </form>
              )}

              {/* Direct Mailto to Admin */}
              <div className="pt-1">
                <a
                  href={`mailto:technodef.admin@gmail.com?subject=Press%20%26%20Editorial%20Inquiry%20-%20Wilting%20of%20Words&body=Hello%20Technodef%20Press%20Team%2C%0A%0AWe%20would%20like%20to%20inquire%20regarding%20media%20coverage%2C%20author%20interviews%2C%20or%20editorial%20features%20for%20the%20novel%20'Wilting%20of%20Words'.%0A%0APress%20Outlet%3A%20%0AJournalist%20Name%3A%20%0AContact%3A%20${encodeURIComponent(emailInput || '')}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-indigo-500/30 text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Email Admin: technodef.admin@gmail.com</span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
