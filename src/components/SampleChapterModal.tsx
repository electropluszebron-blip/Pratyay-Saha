import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Feather, 
  Maximize2, 
  Minimize2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface SampleChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const SAMPLE_PAGES_COUNT = 10;

export const SampleChapterModal: React.FC<SampleChapterModalProps> = ({
  isOpen,
  onClose,
  isDark
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentPage < SAMPLE_PAGES_COUNT) {
      setCurrentPage(prev => prev + 1);
      try { audioSynth.playNow(); } catch {}
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      try { audioSynth.playNow(); } catch {}
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full ${
            isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-4xl h-[90vh] max-h-[800px] rounded-3xl'
          } border-2 border-[#D4AF37] shadow-[0_0_80px_rgba(212,175,55,0.3)] flex flex-col overflow-hidden ${
            isDark ? 'bg-[#18110D] text-[#FAF5EE]' : 'bg-[#FAF6EF] text-[#2C2117]'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-[#D4AF37]/30 bg-black/50 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#B93826] to-[#E5A93C] text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#FFE58F]">
                  SAMPLE CHAPTER — PROLOGUE & CHAPTER I
                </h3>
                <p className="text-[10px] font-serif text-stone-400">
                  Official Manuscript Excerpt • Wilting of Words
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#B93826] text-white hover:bg-[#A22B1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reading Display */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-black/60">
            <div className="relative max-h-full aspect-[3/4.2] h-full rounded-2xl shadow-2xl border border-[#D4AF37]/50 bg-[#FBF8F1] overflow-hidden">
              <img
                src={`/book_pages_webp/page_${currentPage}.webp`}
                alt={`Sample Page ${currentPage}`}
                className="w-full h-full object-contain block"
              />
            </div>

            {/* Left Nav */}
            <button
              onClick={handlePrev}
              disabled={currentPage <= 1}
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 text-white border border-[#D4AF37]/50 flex items-center justify-center ${
                currentPage <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#B93826]'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav */}
            <button
              onClick={handleNext}
              disabled={currentPage >= SAMPLE_PAGES_COUNT}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 text-white border border-[#D4AF37]/50 flex items-center justify-center ${
                currentPage >= SAMPLE_PAGES_COUNT ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#B93826]'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-3 border-t border-[#D4AF37]/30 bg-black/50 flex items-center justify-between">
            <span className="text-xs font-cinzel font-bold text-[#FFE58F]">
              Sample Page {currentPage} of {SAMPLE_PAGES_COUNT}
            </span>

            <div className="flex gap-1">
              {Array.from({ length: SAMPLE_PAGES_COUNT }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-6 h-6 rounded-md font-mono text-[10px] ${
                    currentPage === i + 1 
                      ? 'bg-[#B93826] text-white font-bold' 
                      : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
