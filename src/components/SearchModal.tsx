import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  BookOpen, 
  User, 
  Sparkles, 
  Scroll, 
  Quote, 
  Award, 
  Compass, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';

export interface SearchResultItem {
  id: string;
  title: string;
  category: 'Chapters' | 'Characters' | 'Themes' | 'Journey' | 'Quotes' | 'Author';
  sectionId: string;
  snippet: string;
  bengaliSnippet?: string;
  relevanceTag?: string;
}

export const SEARCH_INDEX: SearchResultItem[] = [
  {
    id: 'ch-prologue',
    title: 'Prologue: The Silent Courtyard',
    category: 'Chapters',
    sectionId: 'novel-prologue',
    snippet: 'In the quiet ancestral house at Chakdaha, Aratrika stood by the carved mahogany lattice holding the yellowed sepia diary.',
    bengaliSnippet: 'নীরব উঠোনের মাঝে আরাত্রিকার নিঃশব্দ আর্তনাদ',
    relevanceTag: 'Chakdaha • Ancestral House'
  },
  {
    id: 'ch-1',
    title: 'Chapter I: Whispers in the Verandah',
    category: 'Chapters',
    sectionId: 'reader-cabinet',
    snippet: 'We do not fall silent out of weakness; we silence ourselves because some truths are too heavy for words to carry without breaking.',
    bengaliSnippet: 'স্মৃতির জাগরণ ও প্রথম হস্তলিপি',
    relevanceTag: 'Memory & Awakening'
  },
  {
    id: 'ch-2',
    title: 'Chapter II: Terracotta Shadows',
    category: 'Chapters',
    sectionId: 'reader-cabinet',
    snippet: 'The red soil of Bengal smelled of ancient fired terracotta. Art is the only rebellion that does not shed blood.',
    bengaliSnippet: 'পোড়ামাটির ছায়া ও অমর শিল্পকলা',
    relevanceTag: 'Terracotta Resilience'
  },
  {
    id: 'ch-3',
    title: 'Chapter III: The Monsoon Dialogue',
    category: 'Chapters',
    sectionId: 'reader-cabinet',
    snippet: 'Rain is never merely weather; it is an emotional architecture. "I didn’t just find the diary, Baba—I found my voice."',
    bengaliSnippet: 'বর্ষার সংলাপ ও প্রজন্মের সেতুবন্ধন',
    relevanceTag: 'Reconciliation'
  },
  {
    id: 'char-aratrika',
    title: 'Aratrika: The Silent Scribe',
    category: 'Characters',
    sectionId: 'protagonist-gallery',
    snippet: 'The visionary writer who turns her personal struggles, silent wounds, and convictions into an immortal voice.',
    bengaliSnippet: 'আরাত্রিকা — উপন্যাসের প্রাণ ও কণ্ঠস্বর',
    relevanceTag: 'Protagonist'
  },
  {
    id: 'char-krittika',
    title: 'Krittika: The Successor & Friend',
    category: 'Characters',
    sectionId: 'protagonist-gallery',
    snippet: 'Aratrika’s vibrant classmate and loyal successor who carries her literary legacy into the world.',
    bengaliSnippet: 'কৃত্তিকা — সহপাঠী ও উত্তরাধিকারী',
    relevanceTag: 'Friend & Ally'
  },
  {
    id: 'char-prangik',
    title: 'Prangik: The Preserver & Admirer',
    category: 'Characters',
    sectionId: 'protagonist-gallery',
    snippet: 'The devoted admirer of Aratrika’s writing who helps preserve her loose sepia manuscript sheets for Technodef Press.',
    bengaliSnippet: 'প্রাঙ্গিক — অনুরাগী ও পাণ্ডুলিপি সংরক্ষক',
    relevanceTag: 'Preserver'
  },
  {
    id: 'char-saha',
    title: 'Mr. & Mrs. Saha',
    category: 'Characters',
    sectionId: 'protagonist-gallery',
    snippet: 'Aratrika’s parents representing the complicated interplay between parental caution, social expectations, and deep familial love.',
    bengaliSnippet: 'মিঃ ও মিসেস সাহা — পরিবার ও সমাজ',
    relevanceTag: 'Family & Tradition'
  },
  {
    id: 'theme-voice',
    title: 'Theme: The Sanctuary of the Silenced Voice',
    category: 'Themes',
    sectionId: 'novel-themes',
    snippet: 'Explores how unspoken thoughts refuse to perish in silence, finding immortal sanctuary through ink on paper.',
    bengaliSnippet: 'নীরবতার প্রাচীর ভেঙে উচ্চারিত স্বর',
    relevanceTag: 'Core Motif'
  },
  {
    id: 'theme-terracotta',
    title: 'Theme: Terracotta Soil & Bengal Roots',
    category: 'Themes',
    sectionId: 'novel-themes',
    snippet: 'Terracotta temples of Bishnupur and the riverbank breeze of Nadia weave the sacred heritage backdrop of the novel.',
    bengaliSnippet: 'বাংলার ঐতিহ্য ও পোড়ামাটির শেকড়',
    relevanceTag: 'Cultural Heritage'
  },
  {
    id: 'journey-inception',
    title: 'Writing Journey: The Idea & First Words',
    category: 'Journey',
    sectionId: 'writers-journey',
    snippet: 'Inception of the novel on 12 April 2026, marking the genesis of the 219-page manuscript.',
    bengaliSnippet: '১২ এপ্রিল ২০২৬ — প্রথম ভাবনা ও লেখার সূচনা',
    relevanceTag: 'Milestone: 12 April 2026'
  },
  {
    id: 'journey-draft',
    title: 'Writing Journey: The Complete First Draft',
    category: 'Journey',
    sectionId: 'writers-journey',
    snippet: 'Completion of the full 219 manuscript pages on 21 July 2026 following months of rigorous writing.',
    bengaliSnippet: '২১ জুলাই ২০২৬ — সম্পূর্ণ প্রথম খসড়া',
    relevanceTag: 'Milestone: 21 July 2026'
  },
  {
    id: 'author-pratyay',
    title: 'Author: Pratyay Saha',
    category: 'Author',
    sectionId: 'author-section',
    snippet: 'Scholar, orator, and author from Chakdaha (99.4% CBSE Class 10 achiever) whose literary passion created Wilting of Words.',
    bengaliSnippet: 'প্রত্যয় সাহা — লেখক ও কৃতী শিক্ষার্থী',
    relevanceTag: 'Author Biography'
  },
  {
    id: 'quote-silent',
    title: 'Quote: "Some voices are silenced in life..."',
    category: 'Quotes',
    sectionId: 'quote-sharer',
    snippet: '"Some voices are silenced in life, but their words live louder than ever." — Key thesis quote from Wilting of Words.',
    bengaliSnippet: 'স্মৃতিটুকু বেঁচে থাকে অক্ষরের বাঁধনে...',
    relevanceTag: 'Iconic Epigraph'
  }
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onJumpToSection: (sectionId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onJumpToSection
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      try {
        audioSynth.playNow();
      } catch {}
    } else {
      setQuery('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['All', 'Chapters', 'Characters', 'Themes', 'Journey', 'Quotes', 'Author'];

  const filteredResults = SEARCH_INDEX.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q) ||
      (item.bengaliSnippet && item.bengaliSnippet.toLowerCase().includes(q)) ||
      (item.relevanceTag && item.relevanceTag.toLowerCase().includes(q))
    );
  });

  const handleSelectResult = (sectionId: string) => {
    onJumpToSection(sectionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl border-2 shadow-2xl overflow-hidden my-auto transition-all ${
          isDark 
            ? 'bg-[#18110C] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/35 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Search className="w-5 h-5 text-amber-200" />
            <h3 className="font-cinzel text-xs sm:text-sm font-bold tracking-widest uppercase">
              Sanctuary Concordance Search
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar Input Container */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/20">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
            isDark 
              ? 'bg-black/50 border-[#D4AF37]/40 focus-within:border-[#D4AF37]' 
              : 'bg-white border-[#E8DEC9] focus-within:border-[#B93826]'
          }`}>
            <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chapters, Aratrika, terracotta themes, quotes..."
              className="w-full bg-transparent border-none text-sm font-serif focus:outline-none placeholder-stone-400 focus:ring-0 text-stone-800 dark:text-stone-100"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="text-stone-400 hover:text-stone-100 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-[10px] sm:text-xs font-cinzel font-bold tracking-wider uppercase transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#8B2213] text-white border border-[#D4AF37] shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-900/60 text-stone-600 dark:text-stone-300 hover:bg-stone-200 border border-stone-200 dark:border-stone-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results List */}
        <div className="p-4 sm:p-5 max-h-[50vh] overflow-y-auto space-y-3">
          {filteredResults.length > 0 ? (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectResult(item.sectionId)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group text-left ${
                  isDark 
                    ? 'bg-[#201712] border-[#D4AF37]/20 hover:border-[#D4AF37] hover:bg-[#281C15]' 
                    : 'bg-white border-[#E8DEC9] hover:border-[#B93826] hover:bg-[#FFFDF9]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-cinzel text-xs sm:text-sm font-bold text-[#8B2213] dark:text-[#FFE58F] group-hover:underline">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-cinzel font-bold uppercase bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <p className="font-serif text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>

                {item.bengaliSnippet && (
                  <p className="font-cormorant italic text-[11px] text-[#8B2213] dark:text-[#D4AF37] mt-1 font-bold">
                    {item.bengaliSnippet}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-stone-400">
              <Search className="w-8 h-8 mx-auto text-stone-400 mb-2 opacity-60" />
              <p className="font-cinzel text-xs font-bold uppercase tracking-wider">
                No matching manuscript inscriptions found
              </p>
              <p className="font-serif text-xs mt-1 text-stone-500">
                Try searching for "Aratrika", "Terracotta", "Chapter", "Chakdaha", or "Pratyay".
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Tip */}
        <div className="px-5 py-3 border-t border-[#D4AF37]/25 bg-stone-50 dark:bg-stone-950/60 text-center text-[10px] font-serif text-stone-500">
          Showing {filteredResults.length} sanctuary entries • Click any result to navigate directly
        </div>
      </div>
    </div>
  );
};
