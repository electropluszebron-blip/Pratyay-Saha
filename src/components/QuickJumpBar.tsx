import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowUp, Scroll, Layers, User, Image as ImageIcon, Feather } from 'lucide-react';

interface QuickJumpBarProps {
  isDark: boolean;
  onJumpToSection: (sectionId: string) => void;
}

export const QuickJumpBar: React.FC<QuickJumpBarProps> = ({
  isDark,
  onJumpToSection
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // If user has scrolled past top hero
      if (window.scrollY > 300) {
        // Check if reader cabinet is currently in viewport
        const readerEl = document.getElementById('reader-cabinet');
        if (readerEl) {
          const rect = readerEl.getBoundingClientRect();
          // If reader is taking up significant portion of the viewport, hide the floating pill
          const isInReader = rect.top < window.innerHeight * 0.75 && rect.bottom > 100;
          if (isInReader) {
            setIsVisible(false);
            return;
          }
        }
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside aria-label="Page navigation" className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 transform-gpu max-w-[95vw]">
      <nav aria-label="Quick jump links" className={`flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full border backdrop-blur-xl shadow-2xl ${
        isDark 
          ? 'bg-[#1C1510]/95 border-[#D4AF37]/50 text-[#FAF7F2] shadow-[0_8px_32px_rgba(0,0,0,0.8)]' 
          : 'bg-[#FAF8F5]/95 border-[#D4AF37]/50 text-[#2D241E] shadow-[0_8px_32px_rgba(185,56,38,0.2)]'
      }`}>
        
        {/* Scroll to Top */}
        <button
          onClick={() => onJumpToSection('hero-cover')}
          title="Back to Top"
          className="p-2 rounded-full text-xs font-cinzel font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center text-stone-500 dark:text-stone-300"
        >
          <ArrowUp className="w-3.5 h-3.5 text-[#D4AF37]" />
        </button>

        {/* Jump to Themes */}
        <button
          onClick={() => onJumpToSection('novel-themes')}
          title="Themes & Motifs"
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-cinzel font-bold text-stone-700 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-1"
        >
          <Layers className="w-3.5 h-3.5 text-[#B93826] dark:text-[#E5A93C]" />
          <span className="hidden md:inline">Themes</span>
        </button>

        {/* Jump to Characters */}
        <button
          onClick={() => onJumpToSection('protagonist-gallery')}
          title="Protagonists & Characters"
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-cinzel font-bold text-stone-700 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-1"
        >
          <User className="w-3.5 h-3.5 text-[#B93826] dark:text-[#E5A93C]" />
          <span className="hidden md:inline">Characters</span>
        </button>

        {/* Jump to Gallery */}
        <button
          onClick={() => onJumpToSection('book-gallery')}
          title="Visual & Manuscript Gallery"
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-cinzel font-bold text-stone-700 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-1"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#B93826] dark:text-[#E5A93C]" />
          <span className="hidden md:inline">Gallery</span>
        </button>

        {/* Jump to Timeline */}
        <button
          onClick={() => onJumpToSection('writers-journey')}
          title="Jump to The Writing Journey"
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-cinzel font-bold text-stone-700 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center gap-1"
        >
          <Scroll className="w-3.5 h-3.5 text-[#B93826] dark:text-[#E5A93C]" />
          <span className="hidden sm:inline">Timeline</span>
        </button>

        {/* Highlighted Direct Jump to E-Reader */}
        <button
          onClick={() => onJumpToSection('reader-cabinet')}
          title="Jump directly to E-Reader"
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-cinzel font-bold bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg border border-[#FFE58F]/60"
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>E-Reader</span>
        </button>

      </nav>
    </aside>
  );
};
