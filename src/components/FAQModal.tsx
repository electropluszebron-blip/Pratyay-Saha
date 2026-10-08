import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Award, 
  Feather, 
  ShieldCheck, 
  Clock, 
  PenTool, 
  Volume2
} from 'lucide-react';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onOpenCertificate?: () => void;
  onOpenSupport?: () => void;
}

interface FAQItem {
  id: string;
  category: 'story' | 'reader' | 'certificate' | 'author';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'story',
    question: 'What is the novel "Wilting of Words" about?',
    answer: '“Wilting of Words” by author Pratyay Saha is a poignant literary masterpiece that chronicles the emotional journey of Aratrika — a young, courageous visionary whose silent thoughts, hidden wounds, and highest aspirations are committed to her sacred diary. Set against the terracotta heritage and monsoon riverbanks of Bengal, the novel confronts societal silence and generational memory, proving that while human voices may be suppressed, written words remain eternal.'
  },
  {
    id: 'faq-2',
    category: 'story',
    question: 'Who are the central characters in the book?',
    answer: 'The primary dramatis personae include:\n• Aratrika: The courageous protagonist whose diary preserves her authentic voice.\n• Krittika: "The Successor", Aratrika’s classmate who undergoes a profound awakening and carries forward Aratrika’s legacy.\n• Prangik: "The Preserver", an ardent admirer who recovers and safeguards Aratrika’s handwritten manuscript.\n• Mr. & Mrs. Saha: Aratrika’s parents, embodying the heavy societal expectations and complex filial pressures of traditional society.'
  },
  {
    id: 'faq-3',
    category: 'author',
    question: 'Who is the author Pratyay Saha?',
    answer: 'Pratyay Saha is an exceptional young scholar and novelist born on November 29, 2008, hailing from Chakdaha in the Nadia district of West Bengal. He achieved a remarkable 99.4% in CBSE Class 10 and currently pursues science in Class XI at St. Mary’s Arcadian School. An accomplished debater, classical orator, and writer, his dream is to serve society through both medicine and transformative literature.'
  },
  {
    id: 'faq-4',
    category: 'certificate',
    question: 'How do I earn the Royal Certificate of Literary Mastery?',
    answer: 'To preserve the supreme prestige of the royal testament, the Certificate of Literary Mastery is unlocked strictly after completing 30 minutes of authentic, focused reading inside the E-Reader Cabinet. The chronometer operates exclusively while you are actively viewing or turning pages in the E-Reader, preventing passive background accrual. Once the 30-minute threshold is verified, you can download the official vector PDF or receive the classical light Bengali heritage testament directly via email.'
  },
  {
    id: 'faq-5',
    category: 'reader',
    question: 'Why does my reading time only record inside the E-Reader?',
    answer: 'In accordance with our sanctuary authenticity standards, time is tracked exclusively when the Digital Reader Cabinet is in active foreground view and you are reading or navigating pages. Browsing other sections of the website or leaving the tab in the background will pause the reading timer to ensure every certificate reflects genuine literary engagement.'
  },
  {
    id: 'faq-6',
    category: 'reader',
    question: 'How do Margin Annotations and Bookmarks work?',
    answer: 'Inside the E-Reader Cabinet, click the "Annotate" tool in the top toolbar. You can select from five royal ink palettes (Imperial Gold, Rose Carmine, Emerald Ink, Bengal Indigo, Terracotta Sunset) and write persistent personal reflections or quote notes. You can also click the golden ribbon at the top right of any manuscript page to toggle instant bookmarks. Both annotations and bookmarks sync to your Cloud profile.'
  },
  {
    id: 'faq-7',
    category: 'reader',
    question: 'Can I submit reviews to the Reader Reflections registry?',
    answer: 'Yes! Readers are warmly encouraged to share authentic impressions in the Reader Reflections section. Honest positive and critical literary opinions are freely expressed while maintaining respectful sanctuary guidelines. To maintain authenticity, review submissions are permanently linked to your verified reader profile name.'
  },
  {
    id: 'faq-8',
    category: 'author',
    question: 'Who published the manuscript?',
    answer: 'The novel is published under Technodef Press, the literary publishing division of Technodef dedicated to immortalizing independent literary creations and classical cultural arts.'
  },
  {
    id: 'faq-9',
    category: 'reader',
    question: 'Is the page turning sound realistic, and can I adjust audio?',
    answer: 'Yes! The reader uses a custom physical Web Audio synthesis that replicates the natural rustle of classical book parchment on every page flip. You can toggle page turn sounds or adjust the ambient classical flute soundtrack volume anytime via the Header or Sanctuary Settings.'
  }
];

export const FAQModal: React.FC<FAQModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onOpenCertificate,
  onOpenSupport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'story' | 'reader' | 'certificate' | 'author'>('all');
  const [openItems, setOpenItems] = useState<string[]>(['faq-1', 'faq-4']);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-3xl rounded-3xl border-2 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh] transition-all ${
          isDark 
            ? 'bg-[#18110C] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-100">
                Frequently Asked Questions
              </h3>
              <p className="text-[10px] font-serif italic text-amber-200/80">
                Royal Inquiries &amp; Sanctuary Guidance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-[#D4AF37]/25 space-y-3 bg-[#8B2213]/5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions on Aratrika, 30-min certificate, author, reader..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-black/30 border border-[#D4AF37]/40 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#B93826]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-cinzel font-bold">
            {[
              { id: 'all', label: 'All Inquiries' },
              { id: 'story', label: 'Story & Characters' },
              { id: 'certificate', label: '30-Min Certificate' },
              { id: 'reader', label: 'E-Reader & Audio' },
              { id: 'author', label: 'Author & Press' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#8B2213] text-white shadow-sm'
                    : 'bg-stone-200/60 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Accordion List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <HelpCircle className="w-10 h-10 mx-auto text-[#D4AF37]/60 mb-2" />
              <p className="font-cinzel text-sm font-bold">No Inquiries Found</p>
              <p className="text-xs font-serif mt-1">Try adjusting your search terms or browse all categories.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpenItem = openItems.includes(faq.id);
              return (
                <div 
                  key={faq.id}
                  className={`rounded-2xl border transition-all ${
                    isOpenItem 
                      ? 'border-[#D4AF37] bg-amber-500/[0.04] shadow-sm' 
                      : 'border-stone-300 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 hover:border-[#D4AF37]/60'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <span className="font-cinzel text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100">
                      {faq.question}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-[#D4AF37] transition-transform duration-200 shrink-0 ${
                      isOpenItem ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {isOpenItem && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#D4AF37]/20 text-xs sm:text-sm font-serif text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Support Quick Link */}
        <div className="p-3.5 sm:p-4 border-t border-[#D4AF37]/30 bg-[#8B2213]/5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-stone-600 dark:text-stone-400 font-serif italic">
            Have a question not listed here?
          </span>
          {onOpenSupport && (
            <button
              onClick={() => {
                onClose();
                onOpenSupport();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white font-cinzel font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-sm cursor-pointer"
            >
              Contact Sanctuary Support
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
