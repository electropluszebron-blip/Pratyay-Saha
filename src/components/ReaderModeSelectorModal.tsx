import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Bookmark, 
  MoreVertical, 
  ArrowRight, 
  Sparkles, 
  Library, 
  User, 
  Volume2, 
  VolumeX, 
  Settings, 
  FileText, 
  Check, 
  X,
  Trash2,
  ExternalLink,
  BookMarked
} from 'lucide-react';

interface ReaderModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNormal: () => void;
  onSelectInteractive: () => void;
  onSelectImmersive?: () => void;
  isDark?: boolean;
  onOpenSearch?: () => void;
  onOpenBookmarks?: () => void;
  onOpenProfile?: () => void;
  onOpenLibrary?: () => void;
  onOpenSettings?: () => void;
  onOpenExam?: () => void;
  currentUser?: { name?: string; email?: string } | null;
}

// Corner filigree ornament component
const CornerOrnament: React.FC<{ color: string; position: 'tl' | 'tr' | 'bl' | 'br' }> = ({ color, position }) => {
  const rotationClass = {
    tl: '',
    tr: 'rotate-90',
    br: 'rotate-180',
    bl: '-rotate-90'
  }[position];

  const posClass = {
    tl: 'top-2 left-2',
    tr: 'top-2 right-2',
    br: 'bottom-2 right-2',
    bl: 'bottom-2 left-2'
  }[position];

  return (
    <div className={`absolute ${posClass} w-4 h-4 pointer-events-none select-none ${rotationClass}`}>
      <svg viewBox="0 0 20 20" fill="none" className="w-full h-full">
        <path
          d="M2,2 L14,2 C9,2 2,9 2,14 L2,2 Z"
          fill={color}
          fillOpacity="0.12"
        />
        <path
          d="M2,18 L2,2 L18,2"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="5" cy="5" r="1.2" fill={color} />
        <path
          d="M4,10 C4,6 6,4 10,4"
          stroke={color}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
      </svg>
    </div>
  );
};

export const ReaderModeSelectorModal: React.FC<ReaderModeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectNormal,
  onSelectInteractive,
  onSelectImmersive,
  isDark = false,
  onOpenSearch,
  onOpenBookmarks,
  onOpenProfile,
  onOpenLibrary,
  onOpenSettings,
  onOpenExam,
  currentUser
}) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'center' | 'bookmarks' | 'profile'>('home');
  const [savedBookmarks, setSavedBookmarks] = useState<number[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('wilting_of_words_bookmarks');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setSavedBookmarks(parsed);
          }
        }
      } catch (e) {
        console.warn('Error reading bookmarks:', e);
      }
    }
  }, [isOpen, showBookmarksDrawer]);

  // Click outside to close three-dot menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Toggle soundtrack audio
  const handleToggleSoundtrack = () => {
    const audioEl = document.getElementById('exclusive-bg-music-player') as HTMLAudioElement | null;
    if (audioEl) {
      if (audioEl.paused) {
        audioEl.play().then(() => setIsPlayingAudio(true)).catch(() => setIsPlayingAudio(false));
      } else {
        audioEl.pause();
        setIsPlayingAudio(false);
      }
    }
  };

  const handleRemoveBookmark = (page: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedBookmarks.filter(p => p !== page);
    setSavedBookmarks(updated);
    try {
      localStorage.setItem('wilting_of_words_bookmarks', JSON.stringify(updated));
    } catch {}
  };

  const handleLaunchToPage = (page: number) => {
    setShowBookmarksDrawer(false);
    onClose();
    onSelectNormal();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Choose Reading Experience"
    >
      {/* Main Luxury Container - Mobile full screen, Tablet/Desktop centered high-end phone/tablet card */}
      <div 
        className="relative w-full h-full sm:h-[94vh] sm:max-w-md md:max-w-lg lg:max-w-xl sm:rounded-[32px] sm:border sm:border-[#DECBA3] bg-[#FAF7F0] text-[#2D241E] shadow-[0_20px_60px_rgba(45,36,30,0.22)] flex flex-col overflow-hidden"
      >
        {/* ============================================================ */}
        {/* HEADER: Clean Ivory/White Header Matching Reference 1:1    */}
        {/* ============================================================ */}
        <header className="relative z-30 shrink-0 bg-[#FAF7EE] border-b border-[#E6DBBE]/80 px-4 sm:px-5 pt-3.5 pb-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            {/* Left section: Back Arrow + Emblem + Title */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={onClose}
                aria-label="Go back"
                className="p-1.5 -ml-1.5 rounded-full text-[#382B21] hover:bg-[#EFE8D6] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Circular Gold-Bordered Book Emblem */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#C5A059] bg-gradient-to-br from-[#F5EEDD] via-[#ECE1C4] to-[#DFCE9F] flex items-center justify-center shadow-sm shrink-0">
                <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#3A2818] stroke-[2.2]" />
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col">
                <h1 className="font-cinzel text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#2D241E] leading-snug">
                  CHOOSE READING<br />
                  EXPERIENCE
                </h1>
                <p className="font-cormorant italic text-[11px] sm:text-xs text-[#6B5A4E] leading-none mt-0.5">
                  Writing of Words &bull; Pratyay Saha
                </p>
              </div>
            </div>

            {/* Right section: Search, Bookmark, Three-dot Menu */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Search Icon */}
              <button
                onClick={() => {
                  if (onOpenSearch) onOpenSearch();
                }}
                aria-label="Search concordance"
                className="p-2 rounded-full text-[#382B21] hover:bg-[#EFE8D6] transition-colors cursor-pointer"
                title="Search Book & Lexicon"
              >
                <Search className="w-4.5 h-4.5 stroke-[2]" />
              </button>

              {/* Bookmark Icon */}
              <button
                onClick={() => {
                  setShowBookmarksDrawer(prev => !prev);
                  if (onOpenBookmarks) onOpenBookmarks();
                }}
                aria-label="View bookmarks"
                className="relative p-2 rounded-full text-[#382B21] hover:bg-[#EFE8D6] transition-colors cursor-pointer"
                title="Saved Bookmarks"
              >
                <Bookmark className={`w-4.5 h-4.5 stroke-[2] ${savedBookmarks.length > 0 ? 'fill-[#C5A059] text-[#C5A059]' : ''}`} />
                {savedBookmarks.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B93826]" />
                )}
              </button>

              {/* Three-Dot Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(prev => !prev)}
                  aria-label="More options"
                  aria-expanded={showMenu}
                  className="p-2 rounded-full text-[#382B21] hover:bg-[#EFE8D6] transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4.5 h-4.5 stroke-[2]" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FCFAF5] border border-[#DFCBA0] shadow-[0_12px_32px_rgba(45,36,30,0.18)] py-2 z-50 animate-scale-in font-serif">
                    <div className="px-3.5 py-1.5 border-b border-[#EAE0CA] mb-1">
                      <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#A07830]">
                        Reading Sanctuary
                      </p>
                      <p className="text-xs text-[#6B5A4E]">
                        Writing of Words Edition
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleToggleSoundtrack();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-[#2D241E] hover:bg-[#F3EBD8] flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {isPlayingAudio ? <Volume2 className="w-4 h-4 text-[#A07830]" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
                        <span>Classical Soundtrack</span>
                      </span>
                      <span className="text-[10px] font-sans font-bold text-[#A07830]">
                        {isPlayingAudio ? 'PLAYING' : 'MUTED'}
                      </span>
                    </button>

                    {onOpenSearch && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onOpenSearch();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-[#2D241E] hover:bg-[#F3EBD8] flex items-center gap-2 transition-colors"
                      >
                        <Search className="w-4 h-4 text-[#A07830]" />
                        <span>Concordance Search</span>
                      </button>
                    )}

                    {onOpenExam && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onOpenExam();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-[#2D241E] hover:bg-[#F3EBD8] flex items-center gap-2 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#A07830]" />
                        <span>Scholastic Examination</span>
                      </button>
                    )}

                    {onOpenSettings && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onOpenSettings();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-[#2D241E] hover:bg-[#F3EBD8] flex items-center gap-2 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#A07830]" />
                        <span>Sanctuary Settings</span>
                      </button>
                    )}

                    <div className="border-t border-[#EAE0CA] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onClose();
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-[#8B2213] hover:bg-[#F3EBD8] flex items-center gap-2 transition-colors font-semibold"
                      >
                        <X className="w-4 h-4" />
                        <span>Return to Sanctuary</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Very Subtle Gold Ornamental Line with Classical Flourishes */}
          <div className="w-full h-2 mt-1 relative flex items-center justify-center overflow-hidden">
            <svg 
              className="w-full h-2 text-[#C5A059]" 
              viewBox="0 0 400 8" 
              fill="none" 
              preserveAspectRatio="none"
            >
              <path 
                d="M0,4 L140,4 C160,4 175,1 190,1 C195,1 198,4 200,6 C202,4 205,1 210,1 C225,1 240,4 260,4 L400,4" 
                stroke="currentColor" 
                strokeWidth="0.8" 
                strokeOpacity="0.65" 
              />
              <circle cx="200" cy="6" r="1.2" fill="currentColor" />
              <circle cx="190" cy="1" r="0.9" fill="currentColor" />
              <circle cx="210" cy="1" r="0.9" fill="currentColor" />
            </svg>
          </div>
        </header>

        {/* ============================================================ */}
        {/* MAIN BODY: Scrollable Canvas with Literary Background & Cards*/}
        {/* ============================================================ */}
        <div className="relative flex-1 overflow-y-auto px-4 sm:px-5 pt-3 pb-24 scroll-smooth">
          
          {/* Decorative Corner Watermark Illustrations matching Reference */}
          {/* Top-Left: Stacked Antique Books & Quill */}
          <div className="absolute -top-3 -left-3 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none select-none opacity-45 sm:opacity-55 mix-blend-multiply overflow-hidden z-0">
            <img 
              src="/src/assets/images/antique_books_quill_corner_1791471104563.jpg" 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain -translate-x-4 -translate-y-4"
            />
          </div>

          {/* Top-Right: Open Manuscript & Laurel Foliage */}
          <div className="absolute -top-3 -right-3 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none select-none opacity-45 sm:opacity-55 mix-blend-multiply overflow-hidden z-0">
            <img 
              src="/src/assets/images/open_book_foliage_corner_1791471119314.jpg" 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain translate-x-4 -translate-y-4"
            />
          </div>

          {/* ============================================================ */}
          {/* MAIN INTRODUCTION: Symmetrical Gold Flourish & Editorial Text*/}
          {/* ============================================================ */}
          <div className="relative z-10 text-center my-3 sm:my-4 max-w-sm sm:max-w-md mx-auto">
            {/* Top Flourish Line: "Select how you would like to experience" */}
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#C5A059]" />
              <span className="text-[#C5A059] text-[10px]">✦</span>
              <p className="font-cormorant text-[#4A3E38] text-[13px] sm:text-[14px] font-medium tracking-normal">
                Select how you would like to experience
              </p>
              <span className="text-[#C5A059] text-[10px]">✦</span>
              <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#C5A059]" />
            </div>

            {/* Bottom Title: "Writing of Words today:" */}
            <p className="font-cormorant text-[15px] sm:text-[17px] text-[#4A3E38] leading-tight">
              <span className="italic font-bold text-[#8E2818] tracking-wide">
                Writing of Words
              </span>{' '}
              <span className="italic font-medium text-[#4A3E38]">today:</span>
            </p>
          </div>

          {/* ============================================================ */}
          {/* THREE READING EXPERIENCE CARDS STACKED VERTICALLY            */}
          {/* ============================================================ */}
          <div className="relative z-10 space-y-3.5 sm:space-y-4 max-w-md sm:max-w-lg mx-auto">

            {/* ---------------------------------------------------------- */}
            {/* CARD 1 — FLIPBOOK READER (Antique Gold Accent)             */}
            {/* ---------------------------------------------------------- */}
            <div 
              onClick={() => {
                onClose();
                onSelectNormal();
              }}
              className="relative p-3.5 sm:p-4 rounded-[22px] sm:rounded-3xl border border-[#DFCBA0] bg-[#FCFAF4] hover:bg-[#FFFDF9] shadow-[0_4px_18px_rgba(180,140,80,0.08)] hover:shadow-[0_8px_24px_rgba(180,140,80,0.18)] transition-all duration-300 cursor-pointer group flex items-center justify-between gap-3 sm:gap-4 overflow-hidden"
            >
              {/* Corner Filigree Ornaments */}
              <CornerOrnament color="#DFCBA0" position="tl" />
              <CornerOrnament color="#DFCBA0" position="tr" />
              <CornerOrnament color="#DFCBA0" position="bl" />
              <CornerOrnament color="#DFCBA0" position="br" />

              {/* Left Side: Refined Vintage Illustration Thumbnail */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-[#E5D7B7] shadow-sm bg-[#F5EEDD]">
                <img 
                  src="/src/assets/images/flipbook_vintage_quill_1791470816645.jpg" 
                  alt="Flipbook Heritage Edition"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Middle Content */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Uppercase Kicker */}
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans font-bold text-[#A67C33] tracking-[0.18em] uppercase">
                  <Sparkles className="w-2.5 h-2.5 text-[#A67C33] shrink-0" />
                  <span>HERITAGE EDITION</span>
                </div>

                {/* Card Title */}
                <h2 className="font-cinzel text-sm sm:text-base font-bold text-[#2D241E] tracking-wider mt-0.5 leading-tight group-hover:text-[#8E2818] transition-colors">
                  FLIPBOOK READER
                </h2>

                {/* Description */}
                <p className="font-cormorant text-[11px] sm:text-[12.5px] text-[#5C4F44] leading-snug mt-1">
                  Full 219-page visual edition with real paper texture and natural page-turn sounds.
                </p>

                {/* Bottom CTA */}
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-cinzel font-bold text-[#A67C33] group-hover:text-[#7A5518] mt-2 tracking-wider">
                  <span>LAUNCH FLIPBOOK</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Far Right: Circular Subtle Gold Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5EEDC] border border-[#DFCBA0] flex items-center justify-center text-[#7C5A20] shadow-sm group-hover:bg-[#EEDEB9] group-hover:scale-105 group-hover:shadow transition-all shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* CARD 2 — INTERACTIVE MODE (Muted Burgundy Accent)          */}
            {/* ---------------------------------------------------------- */}
            <div 
              onClick={() => {
                onClose();
                onSelectInteractive();
              }}
              className="relative p-3.5 sm:p-4 rounded-[22px] sm:rounded-3xl border border-[#ECC8CE] bg-[#FDF9F8] hover:bg-[#FFFDFC] shadow-[0_4px_18px_rgba(160,50,70,0.08)] hover:shadow-[0_8px_24px_rgba(160,50,70,0.18)] transition-all duration-300 cursor-pointer group flex items-center justify-between gap-3 sm:gap-4 overflow-hidden"
            >
              {/* Corner Filigree Ornaments */}
              <CornerOrnament color="#E5B2BA" position="tl" />
              <CornerOrnament color="#E5B2BA" position="tr" />
              <CornerOrnament color="#E5B2BA" position="bl" />
              <CornerOrnament color="#E5B2BA" position="br" />

              {/* Left Side: Refined Illuminated Library Illustration */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-[#ECC8CE] shadow-sm bg-[#FAF0F2]">
                <img 
                  src="/src/assets/images/interactive_glowing_book_1791470831852.jpg" 
                  alt="Scholastic Interactive Mode"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Middle Content */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Uppercase Kicker */}
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans font-bold text-[#8E2838] tracking-[0.18em] uppercase">
                  <Sparkles className="w-2.5 h-2.5 text-[#8E2838] shrink-0" />
                  <span>SCHOLASTIC INSIGNIA</span>
                </div>

                {/* Card Title */}
                <h2 className="font-cinzel text-sm sm:text-base font-bold text-[#6E1C29] tracking-wider mt-0.5 leading-tight group-hover:text-[#4A0F19] transition-colors">
                  INTERACTIVE MODE
                </h2>

                {/* Description */}
                <p className="font-cormorant text-[11px] sm:text-[12.5px] text-[#5C4F44] leading-snug mt-1">
                  Chapter 1 text with illuminated Drop Cap, Lexicon Vault translations for all words, and Recaps.
                </p>

                {/* Bottom CTA */}
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-cinzel font-bold text-[#8E2838] group-hover:text-[#52131D] mt-2 tracking-wider">
                  <span>OPEN INTERACTIVE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Far Right: Circular Subtle Burgundy Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F9ECEE] border border-[#E8BFC7] flex items-center justify-center text-[#8E2838] shadow-sm group-hover:bg-[#F3DEE2] group-hover:scale-105 group-hover:shadow transition-all shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* CARD 3 — IMMERSIVE MODE (Muted Sage-Green Accent)          */}
            {/* ---------------------------------------------------------- */}
            <div 
              onClick={() => {
                onClose();
                if (onSelectImmersive) onSelectImmersive();
                else onSelectInteractive();
              }}
              className="relative p-3.5 sm:p-4 rounded-[22px] sm:rounded-3xl border border-[#CFDEC9] bg-[#F8FAF6] hover:bg-[#FDFFFC] shadow-[0_4px_18px_rgba(60,110,70,0.08)] hover:shadow-[0_8px_24px_rgba(60,110,70,0.18)] transition-all duration-300 cursor-pointer group flex items-center justify-between gap-3 sm:gap-4 overflow-hidden"
            >
              {/* Corner Filigree Ornaments */}
              <CornerOrnament color="#BACDB3" position="tl" />
              <CornerOrnament color="#BACDB3" position="tr" />
              <CornerOrnament color="#BACDB3" position="bl" />
              <CornerOrnament color="#BACDB3" position="br" />

              {/* Left Side: Classical Botanical Foliage & Landscape */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden border border-[#CFDEC9] shadow-sm bg-[#EEF4EC]">
                <img 
                  src="/src/assets/images/immersive_nature_scroll_1791470851078.jpg" 
                  alt="Sanctuary Immersive Mode"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Middle Content */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Uppercase Kicker */}
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans font-bold text-[#3C6E47] tracking-[0.18em] uppercase">
                  <span className="text-xs leading-none">🍃</span>
                  <span>SANCTUARY FOCUS</span>
                </div>

                {/* Card Title */}
                <h2 className="font-cinzel text-sm sm:text-base font-bold text-[#244A2F] tracking-wider mt-0.5 leading-tight group-hover:text-[#142F1C] transition-colors">
                  IMMERSIVE MODE
                </h2>

                {/* Description */}
                <p className="font-cormorant text-[11px] sm:text-[12.5px] text-[#5C4F44] leading-snug mt-1">
                  Distraction-free canvas with line-by-line focus ruler, speech read-aloud, and clean typography.
                </p>

                {/* Bottom CTA */}
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-cinzel font-bold text-[#3C6E47] group-hover:text-[#18361F] mt-2 tracking-wider">
                  <span>LAUNCH IMMERSIVE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Far Right: Circular Subtle Sage Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ECF3E9] border border-[#C5D7BF] flex items-center justify-center text-[#3C6E47] shadow-sm group-hover:bg-[#DEEBD7] group-hover:scale-105 group-hover:shadow transition-all shrink-0">
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* BOOKMARKS QUICK DRAWER OVERLAY                               */}
        {/* ============================================================ */}
        {showBookmarksDrawer && (
          <div className="absolute inset-x-0 bottom-16 top-16 bg-[#FAF7F0]/95 backdrop-blur-md z-40 p-5 flex flex-col border-t border-[#DFCBA0] animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0CA]">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#A07830] fill-[#A07830]" />
                <h3 className="font-cinzel font-bold text-sm tracking-wider uppercase text-[#2D241E]">
                  Saved Bookmarks
                </h3>
              </div>
              <button
                onClick={() => setShowBookmarksDrawer(false)}
                className="p-1 rounded-full hover:bg-stone-200/50 text-[#5C4F44]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {savedBookmarks.length === 0 ? (
                <div className="text-center py-10 px-4 font-serif text-[#6B5A4E]">
                  <BookMarked className="w-10 h-10 text-[#C5A059] mx-auto mb-3 opacity-60" />
                  <p className="text-sm font-semibold">No Bookmarks Saved Yet</p>
                  <p className="text-xs text-[#8A796D] mt-1 max-w-xs mx-auto leading-relaxed">
                    While reading inside the Flipbook or Interactive reader, tap the bookmark ribbon to save pages here for instant retrieval.
                  </p>
                  <button
                    onClick={() => {
                      setShowBookmarksDrawer(false);
                      onClose();
                      onSelectNormal();
                    }}
                    className="mt-5 px-4 py-2 rounded-xl bg-[#F0E5CD] border border-[#DFCBA0] text-xs font-cinzel font-bold text-[#7A5518] hover:bg-[#E8D8B6] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Open Flipbook on Page 1</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-cormorant italic text-[#7A695C] mb-2">
                    Tap any page to open directly in the Flipbook Reader:
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {savedBookmarks.map((page) => (
                      <div
                        key={page}
                        onClick={() => handleLaunchToPage(page)}
                        className="p-3 rounded-xl bg-[#FCFAF4] border border-[#DFCBA0] hover:border-[#8E2818] shadow-sm flex items-center justify-between cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-[#A07830] fill-[#A07830]" />
                          <span className="font-cinzel text-xs font-bold text-[#2D241E]">
                            Page {page}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleRemoveBookmark(page, e)}
                          title="Remove bookmark"
                          className="p-1 rounded-full text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FIXED BOTTOM NAVIGATION BAR: 1:1 Matching Reference Design   */}
        {/* ============================================================ */}
        <nav 
          aria-label="Bottom Navigation"
          className="relative z-30 shrink-0 bg-[#FAF7EE] border-t border-[#E6DBBE]/80 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] px-3 py-2 flex items-center justify-around"
        >
          {/* 1. Home Item */}
          <button
            onClick={() => {
              setActiveTab('home');
              onClose();
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[#9E6F2E] cursor-pointer group"
          >
            <BookOpen className="w-5 h-5 stroke-[2.2] text-[#9E6F2E]" />
            <span className="text-[10px] font-sans font-bold tracking-tight text-[#9E6F2E]">
              Home
            </span>
            <span className="w-4 h-0.5 bg-[#9E6F2E] rounded-full -mt-0.5" />
          </button>

          {/* 2. Library Item */}
          <button
            onClick={() => {
              setActiveTab('library');
              if (onOpenLibrary) {
                onClose();
                onOpenLibrary();
              }
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[#736357] hover:text-[#9E6F2E] cursor-pointer group transition-colors"
          >
            <Library className="w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-sans font-medium tracking-tight">
              Library
            </span>
          </button>

          {/* 3. Center Elevated Action: Circular Gold Button with Open Book */}
          <div className="relative -mt-6 flex flex-col items-center">
            <button
              onClick={() => {
                setActiveTab('center');
                // Scroll reading cards to top or highlight
                const el = document.querySelector('.overflow-y-auto');
                if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Reading Experiences Active"
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#B58628] via-[#D5AF48] to-[#F5D888] border-2 border-[#FFFFFF] shadow-[0_4px_14px_rgba(180,130,40,0.38)] flex items-center justify-center text-[#2A1805] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <BookOpen className="w-5 h-5 stroke-[2.4]" />
            </button>
          </div>

          {/* 4. Bookmarks Item */}
          <button
            onClick={() => {
              setActiveTab('bookmarks');
              setShowBookmarksDrawer(prev => !prev);
              if (onOpenBookmarks) onOpenBookmarks();
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[#736357] hover:text-[#9E6F2E] cursor-pointer group transition-colors"
          >
            <Bookmark className={`w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform ${savedBookmarks.length > 0 ? 'fill-[#DFCBA0]' : ''}`} />
            <span className="text-[10px] font-sans font-medium tracking-tight">
              Bookmarks
            </span>
          </button>

          {/* 5. Profile Item */}
          <button
            onClick={() => {
              setActiveTab('profile');
              if (onOpenProfile) {
                onClose();
                onOpenProfile();
              }
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 px-3 text-[#736357] hover:text-[#9E6F2E] cursor-pointer group transition-colors"
          >
            <User className="w-5 h-5 stroke-[1.8] group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-sans font-medium tracking-tight">
              Profile
            </span>
          </button>
        </nav>

      </div>
    </div>
  );
};
