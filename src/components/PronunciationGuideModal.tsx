import React, { useState } from 'react';
import { Volume2, X, Sparkles, Languages, Play, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface PronunciationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  word?: string;
  phonetic?: string;
  bengaliTranslation?: string;
  definition?: string;
  isDark?: boolean;
}

export const PronunciationGuideModal: React.FC<PronunciationGuideModalProps> = ({
  isOpen,
  onClose,
  word = 'Aratrika',
  phonetic = '/ɑː.rə.trɪ.kɑː/',
  bengaliTranslation = 'আরাত্রিকা - সন্ধ্যার সান্ধ্য দীপ / নীরব লেখিকা',
  definition = 'The protagonist whose pen becomes a sanctuary; carrying the light of unspoken truth.',
  isDark = true
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(0.85); // Normal vs Slow rate
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Syllable breakdown generator
  const getSyllables = (w: string) => {
    if (!w) return ['A', 'ra', 'tri', 'ka'];
    const parts = w.match(/.{1,3}/g) || [w];
    return parts;
  };

  const handleSpeak = (customRate?: number) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = customRate || rate;
        utterance.pitch = 1.0;
        utterance.lang = 'en-US';

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        window.speechSynthesis.speak(utterance);
      } else {
        audioSynth.playNow();
      }
    } catch {
      setIsPlaying(false);
    }
  };

  const syllables = getSyllables(word);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden ${
            isDark 
              ? 'bg-[#18110B] border-[#D4AF37]/50 text-[#FAF5EE]' 
              : 'bg-[#FFFDF9] border-[#E5A93C]/50 text-[#2D1E16]'
          }`}
        >
          {/* Header Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 opacity-70" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B93826]/10 text-[#B93826] dark:text-[#E5A93C] text-[10px] font-cinzel font-bold tracking-widest uppercase border border-[#D4AF37]/30 mb-2">
              <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>INTERACTIVE PRONUNCIATION GUIDE</span>
            </div>

            <h3 className="font-cinzel text-3xl font-black capitalize text-[#9E472A] dark:text-[#FFE58F]">
              {word}
            </h3>
            
            <p className="font-mono text-sm opacity-75 mt-1 text-[#D4AF37]">
              {phonetic}
            </p>
          </div>

          {/* Syllable Stress Breakdown */}
          <div className="mb-6 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
            <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest opacity-60 block mb-2">
              Syllable Stress Breakdown
            </span>
            <div className="flex items-center justify-center gap-2">
              {syllables.map((s, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-3 py-1.5 rounded-xl bg-gradient-to-br from-[#B93826] to-[#D85A2A] text-white font-cinzel font-bold text-sm shadow-md">
                    {s.toUpperCase()}
                  </span>
                  {idx < syllables.length - 1 && <span className="text-[#D4AF37] font-bold">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Bengali Meaning Display (Strictly NO Hindi) */}
          <div className="space-y-3 mb-6 text-left">
            <div className="p-3.5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              <span className="text-[10px] font-cinzel font-bold text-[#B93826] dark:text-[#E5A93C] uppercase block mb-1">
                Bengali Meaning (বাংলা অর্থ)
              </span>
              <p className="font-serif text-sm font-semibold text-[#8B2213] dark:text-[#FFE58F]">
                {bengaliTranslation}
              </p>
            </div>

            {definition && (
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-serif leading-relaxed opacity-85">
                <span className="font-bold block mb-0.5">English Definition:</span>
                {definition}
              </div>
            )}
          </div>

          {/* Interactive Speech Controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSpeak(0.9)}
              disabled={isPlaying}
              className="py-3 rounded-2xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] hover:from-[#A22B1A] hover:to-[#B93826] text-white font-cinzel font-bold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
            >
              <Volume2 className={`w-4 h-4 text-amber-200 ${isPlaying ? 'animate-bounce' : ''}`} />
              <span>Normal Audio</span>
            </button>

            <button
              onClick={() => handleSpeak(0.5)}
              disabled={isPlaying}
              className="py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#C29F2B] text-slate-900 font-cinzel font-bold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
            >
              <RotateCcw className="w-4 h-4 text-slate-900" />
              <span>Listen Slow (0.5x)</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
