import React, { useState, useEffect } from 'react';
import { X, History, Volume2, Bookmark, Trash2, Search, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

export interface GlossaryHistoryItem {
  id: string;
  word: string;
  phonetic: string;
  bengali: string;
  definition: string;
  timestamp: number;
  savedToVault?: boolean;
}

interface GlossaryHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: GlossaryHistoryItem[];
  onClearHistory: () => void;
  onSaveToVault?: (item: GlossaryHistoryItem) => void;
  onOpenPronunciation?: (item: GlossaryHistoryItem) => void;
  isDark?: boolean;
}

export const GlossaryHistoryDrawer: React.FC<GlossaryHistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyItems,
  onClearHistory,
  onSaveToVault,
  onOpenPronunciation,
  isDark = true
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredItems = historyItems.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bengali.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSpeak = (word: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.85;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      } else {
        audioSynth.playNow();
      }
    } catch {
      audioSynth.playNow();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`relative w-full max-w-md h-full shadow-2xl flex flex-col border-l overflow-hidden ${
            isDark 
              ? 'bg-[#140E0A] border-[#D4AF37]/40 text-[#FAF5EE]' 
              : 'bg-[#FFFDF9] border-[#E5A93C]/40 text-[#2D1E16]'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-[#B93826] dark:text-[#D4AF37]" />
              <div>
                <h3 className="font-cinzel text-lg font-bold">Glossary Lookup History</h3>
                <span className="text-[10px] font-mono opacity-60">
                  {historyItems.length} words looked up
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 opacity-70" />
            </button>
          </div>

          {/* Search Filter Bar */}
          <div className="p-4 border-b border-black/10 dark:border-white/10 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Search history (English, বাংলা)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 px-4 opacity-70">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]" />
                <p className="font-cinzel text-sm font-bold">No Lookup History Yet</p>
                <p className="font-serif text-xs mt-1">
                  Tap or click any word in the reader to view Bengali & Hindi meanings!
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDark 
                      ? 'bg-[#1C1510] border-[#3E2F23] hover:border-[#D4AF37]/50' 
                      : 'bg-[#FAF6EF] border-[#E8DFC8] hover:border-[#B93826]/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-cinzel text-base font-black capitalize text-[#9E472A] dark:text-[#FFE58F]">
                          {item.word}
                        </h4>
                        <span className="text-[10px] font-mono opacity-60 text-[#D4AF37]">
                          {item.phonetic}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono opacity-50 block">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(item.word)}
                        title="Listen Audio Pronunciation"
                        className="p-1.5 rounded-lg bg-[#B93826]/10 text-[#B93826] dark:text-[#D4AF37] hover:bg-[#B93826]/20 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {onOpenPronunciation && (
                        <button
                          onClick={() => onOpenPronunciation(item)}
                          title="Open Interactive Pronunciation Guide"
                          className="p-1.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors text-[10px] font-cinzel font-bold"
                        >
                          IPA
                        </button>
                      )}

                      {onSaveToVault && (
                        <button
                          onClick={() => onSaveToVault(item)}
                          title="Save to Lexicon Vault"
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.savedToVault 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meanings */}
                  <div className="space-y-1.5 text-xs font-serif pt-1 border-t border-black/5 dark:border-white/5">
                    <div className="text-[#8B2213] dark:text-[#FFE58F]">
                      <span className="font-bold text-[10px] uppercase font-cinzel opacity-70">বাংলা অর্থ (Bengali): </span>
                      {item.bengali}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {historyItems.length > 0 && (
            <div className="p-4 border-t border-black/10 dark:border-white/10 shrink-0 bg-black/5 dark:bg-white/5">
              <button
                onClick={onClearHistory}
                className="w-full py-2.5 rounded-xl border border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-cinzel font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Lookup History</span>
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
