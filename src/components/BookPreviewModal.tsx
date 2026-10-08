import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Layers, 
  FileText,
  Volume2,
  VolumeX,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface BookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onOpenSampleChapter?: () => void;
  initialPage?: number;
}

const TOTAL_PAGES = 219;

export const BookPreviewModal: React.FC<BookPreviewModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onOpenSampleChapter,
  initialPage = 1
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage(prev => prev + 1);
      try { audioSynth.playNow(); } catch {}
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      try { audioSynth.playNow(); } catch {}
    }
  };

  const handlePageSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = parseInt(e.target.value, 10);
    if (!isNaN(p) && p >= 1 && p <= TOTAL_PAGES) {
      setCurrentPage(p);
    }
  };

  const getPageImageUrl = (pageNum: number) => {
    return `/book_pages_webp/page_${pageNum}.webp`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden select-none">
        
        {/* Floating Modal Main Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className={`relative w-full ${
            isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-5xl h-[92vh] max-h-[850px] rounded-3xl'
          } border-2 border-[#D4AF37] shadow-[0_0_80px_rgba(212,175,55,0.25)] flex flex-col overflow-hidden ${
            isDark ? 'bg-[#140E0A] text-[#FAF5EE]' : 'bg-[#FAF6EF] text-[#2C2117]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-4 sm:px-6 py-3 border-b border-[#D4AF37]/30 bg-black/40 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-cinzel text-xs sm:text-base font-bold text-[#FFE58F] tracking-wide flex items-center gap-1.5">
                  <span>WILTING OF WORDS</span>
                  <span className="text-[10px] font-mono text-stone-400 font-normal hidden sm:inline">• Preview</span>
                </h3>
                <p className="text-[10px] font-serif text-stone-400 hidden sm:block">
                  By Pratyay Saha • Published by Technodef
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-2">
              {onOpenSampleChapter && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSampleChapter();
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#B93826] text-white font-cinzel text-[11px] font-bold uppercase tracking-wider hover:bg-[#A22B1A] transition-all flex items-center gap-1.5 shadow-md"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Read Sample Chapter</span>
                </button>
              )}

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#B93826]/80 text-white hover:bg-[#B93826] transition-colors shadow-md"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reading Canvas Center Viewport */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-6 bg-black/60">
            
            {/* Page Container with Real Book Styling */}
            <div className={`relative max-h-full aspect-[3/4.2] h-full rounded-2xl shadow-2xl border border-[#D4AF37]/40 bg-[#FBF8F1] overflow-hidden flex items-center justify-center transition-transform duration-300 ${
              isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* Paper Texture Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5 pointer-events-none z-10" />

              <img
                key={currentPage}
                src={getPageImageUrl(currentPage)}
                alt={`Wilting of Words - Page ${currentPage}`}
                className="w-full h-full object-contain block select-none"
                loading="eager"
                onError={(e) => {
                  // Fallback if specific page missing
                  (e.target as HTMLImageElement).src = '/book_pages_webp/page_1.webp';
                }}
              />

              {/* Spine Line Shadow effect */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-20" />
            </div>

            {/* Left Nav Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 text-white border border-[#D4AF37]/50 flex items-center justify-center transition-all ${
                currentPage <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95 hover:bg-[#B93826] shadow-2xl'
              } z-30`}
              title="Previous Page"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage >= TOTAL_PAGES}
              className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 text-white border border-[#D4AF37]/50 flex items-center justify-center transition-all ${
                currentPage >= TOTAL_PAGES ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-95 hover:bg-[#B93826] shadow-2xl'
              } z-30`}
              title="Next Page"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* Bottom Footer Control Bar */}
          <div className="px-4 sm:px-8 py-3 border-t border-[#D4AF37]/30 bg-black/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            
            {/* Page Slider + Input */}
            <div className="flex items-center gap-3 w-full sm:w-auto max-w-md">
              <span className="text-xs font-cinzel font-bold text-[#FFE58F] whitespace-nowrap">
                Page {currentPage} of {TOTAL_PAGES}
              </span>

              <input
                type="range"
                min={1}
                max={TOTAL_PAGES}
                value={currentPage}
                onChange={handlePageSliderChange}
                className="w-full accent-[#B93826] cursor-pointer"
              />
            </div>

            {/* Quick Navigation Jump Buttons */}
            <div className="flex items-center gap-2 text-xs font-cinzel">
              <button
                onClick={() => setCurrentPage(1)}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
              >
                Cover
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
              >
                Prologue
              </button>
              <button
                onClick={() => setCurrentPage(10)}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
              >
                Chapter 1
              </button>
            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
