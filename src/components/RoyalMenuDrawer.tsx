import React from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  LifeBuoy, 
  Settings, 
  Award, 
  Search, 
  BarChart3, 
  Users, 
  Layers, 
  Feather, 
  LogOut, 
  Sparkles, 
  User, 
  Bookmark, 
  GraduationCap,
  LayoutDashboard,
  Share2
} from 'lucide-react';
import { AuthUser } from './AuthPortal';

interface RoyalMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  user: AuthUser | null;
  onJumpToSection: (sectionId: string) => void;
  onOpenSearch: () => void;
  onOpenReadingStats: () => void;
  onOpenCertificate: () => void;
  onOpenExam: () => void;
  onOpenFAQ: () => void;
  onOpenSupport: () => void;
  onOpenSettings: () => void;
  onOpenLegal: (tab: 'terms' | 'privacy' | 'info') => void;
  onOpenDeleteAccount: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenShare?: () => void;
  onOpenPoster?: () => void;
}

export const RoyalMenuDrawer: React.FC<RoyalMenuDrawerProps> = ({
  isOpen,
  onClose,
  isDark,
  user,
  onJumpToSection,
  onOpenSearch,
  onOpenReadingStats,
  onOpenCertificate,
  onOpenExam,
  onOpenFAQ,
  onOpenSupport,
  onOpenSettings,
  onSignOut,
  onOpenAuth,
  onOpenShare,
  onOpenPoster
}) => {
  if (!isOpen) return null;

  const handleNavigate = (sectionId: string) => {
    onJumpToSection(sectionId);
    onClose();
  };

  const username = user 
    ? (user.name || user.email.split('@')[0])
    : 'Guest Reader';

  const userInitial = username.substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div 
        className={`relative w-[310px] sm:w-[330px] h-full shadow-[15px_0_45px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden border-r border-[#D4AF37]/50 transition-all ${
          isDark 
            ? 'bg-[#120C08] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] text-[#2D241E]'
        }`}
      >
        {/* Subtle Golden Grid Art Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

        {/* Brand Royal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#721B10] via-[#8F2618] to-[#721B10] text-white relative shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFE58F]/50 to-transparent" />
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#D4AF37]/60 bg-black/30 flex items-center justify-center p-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#FFE58F] stroke-current fill-none animate-[spin_40s_linear_infinite]" strokeWidth="3.5">
                <circle cx="50" cy="50" r="42" strokeDasharray="4 6" />
                <circle cx="50" cy="50" r="28" />
                <circle cx="50" cy="50" r="14" fill="#D4AF37" fillOpacity="0.4" />
              </svg>
            </div>
            <div>
              <span className="font-cinzel text-sm sm:text-base font-black tracking-[0.16em] block leading-none text-[#FFE58F] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                TECHNODEF
              </span>
              <span className="text-[9px] font-serif italic text-amber-200/90 tracking-widest mt-0.5 block">
                LITERARY SANCTUARY
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition-all cursor-pointer border border-white/5 active:scale-95 shadow-inner"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
          
          {/* Section: MAIN ACTIONS */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="h-px w-3 bg-gradient-to-r from-[#B93826] to-transparent" />
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-[0.2em] text-[#B93826] dark:text-[#E5A93C]">
                Sanctuary Navigation
              </span>
            </div>
            <div className="space-y-2.5">
              {/* Dashboard */}
              <button
                onClick={() => handleNavigate('reader-cabinet')}
                className="w-full px-4 py-3 rounded-xl text-left text-xs font-cinzel font-bold flex items-center justify-between bg-gradient-to-b from-[#A13320] via-[#8B2213] to-[#71160C] text-white shadow-[0_4px_12px_rgba(139,34,19,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_18px_rgba(212,175,55,0.4)] hover:brightness-105 active:scale-98 transition-all cursor-pointer border border-[#FFE58F]/50 group"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-amber-200 group-hover:rotate-6 transition-transform" />
                  <span className="tracking-wider">Reading Cabinet</span>
                </div>
                <span className="text-[8px] tracking-widest text-[#FFE58F]/70 uppercase font-sans">Enter &rarr;</span>
              </button>

              {/* Chapter 1 Exam (Authentic text questions) */}
              <button
                onClick={() => { onClose(); onOpenExam(); }}
                className="w-full px-4 py-3 rounded-xl text-left text-xs font-cinzel font-bold flex items-center justify-between bg-gradient-to-b from-[#FAF4E5] to-[#E9DCBF] dark:from-[#211913] dark:to-[#17110B] text-[#721B10] dark:text-[#FFE58F] border border-[#D4AF37]/50 shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:border-[#D4AF37] active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-[#D4AF37]" />
                  <span className="tracking-wider">Chapter 1 Scholastic Exam</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B93826] dark:bg-[#FFE58F] animate-pulse" />
              </button>

              {/* Literary Certificate */}
              <button
                onClick={() => { onClose(); onOpenCertificate(); }}
                className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8B2213] dark:hover:text-[#FFE58F] hover:bg-[#D4AF37]/10 active:scale-98 transition-all flex items-center justify-between border border-transparent hover:border-[#D4AF37]/30 hover:shadow-[0_2px_10px_rgba(212,175,55,0.1)] cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-[#D4AF37]/80 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wider">Royal Certificate of Mastery</span>
                </div>
                <span className="text-[9px] font-sans opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]">&bull;</span>
              </button>

              {/* Reading Stats */}
              <button
                onClick={() => { onClose(); onOpenReadingStats(); }}
                className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8B2213] dark:hover:text-[#FFE58F] hover:bg-[#D4AF37]/10 active:scale-98 transition-all flex items-center justify-between border border-transparent hover:border-[#D4AF37]/30 hover:shadow-[0_2px_10px_rgba(212,175,55,0.1)] cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-[#D4AF37]/80 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wider">Reading Sanctuary Goals</span>
                </div>
                <span className="text-[9px] font-sans opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]">&bull;</span>
              </button>

              {/* Search Index */}
              <button
                onClick={() => { onClose(); onOpenSearch(); }}
                className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8B2213] dark:hover:text-[#FFE58F] hover:bg-[#D4AF37]/10 active:scale-98 transition-all flex items-center justify-between border border-transparent hover:border-[#D4AF37]/30 hover:shadow-[0_2px_10px_rgba(212,175,55,0.1)] cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-[#D4AF37]/80 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wider">Concordance Search Index</span>
                </div>
                <span className="text-[9px] font-sans opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]">&bull;</span>
              </button>

              {/* Share Genuine App Link */}
              {onOpenShare && (
                <button
                  onClick={() => { onClose(); onOpenShare(); }}
                  className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-bold text-amber-700 dark:text-amber-300 hover:text-[#8B2213] dark:hover:text-[#FFE58F] bg-amber-500/10 hover:bg-[#D4AF37]/20 active:scale-98 transition-all flex items-center justify-between border border-amber-500/30 hover:border-[#D4AF37] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                    <span className="tracking-wider">Share App &amp; Live Link</span>
                  </div>
                  <span className="text-[9px] font-sans font-bold text-amber-600 dark:text-amber-400">Share &rarr;</span>
                </button>
              )}

              {/* Official Book Cover Poster */}
              {onOpenPoster && (
                <button
                  onClick={() => { onClose(); onOpenPoster(); }}
                  className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-bold text-[#E5A93C] hover:text-[#FFE58F] bg-gradient-to-r from-[#D4AF37]/15 to-[#B93826]/10 hover:bg-[#D4AF37]/25 active:scale-98 transition-all flex items-center justify-between border border-[#D4AF37]/50 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                    <span className="tracking-wider">Official Book Poster</span>
                  </div>
                  <span className="text-[9px] font-sans font-bold text-[#FFE58F]">View &rarr;</span>
                </button>
              )}
            </div>
          </div>

          {/* Section: PREFERENCES & SUPPORT */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="h-px w-3 bg-gradient-to-r from-[#B93826] to-transparent" />
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-[0.2em] text-[#B93826] dark:text-[#E5A93C]">
                Sanctuary Settings &amp; Concierge
              </span>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => { onClose(); onOpenSettings(); }}
                className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8B2213] dark:hover:text-[#FFE58F] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-between border border-transparent hover:border-[#D4AF37]/20 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-stone-400 group-hover:rotate-45 transition-transform" />
                  <span className="tracking-wider">Sanctuary Preferences</span>
                </div>
              </button>

              <button
                onClick={() => { onClose(); onOpenSupport(); }}
                className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8B2213] dark:hover:text-[#FFE58F] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-between border border-transparent hover:border-[#D4AF37]/20 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <LifeBuoy className="w-4 h-4 text-stone-400 group-hover:bounce transition-all" />
                  <span className="tracking-wider">Author &amp; Press Support</span>
                </div>
              </button>

              <button
                onClick={() => { onClose(); onOpenFAQ(); }}
                className="w-full px-4 py-2.5 rounded-xl text-left text-xs font-cinzel font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8B2213] dark:hover:text-[#FFE58F] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-between border border-transparent hover:border-[#D4AF37]/20 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-stone-400" />
                  <span className="tracking-wider">Frequently Asked Questions</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section: NOVEL SECTIONS */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="h-px w-3 bg-gradient-to-r from-[#B93826] to-transparent" />
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-[0.2em] text-[#B93826] dark:text-[#E5A93C]">
                Manuscript Chapters &amp; Arcs
              </span>
            </div>
            <div className="space-y-1 bg-black/5 dark:bg-black/25 rounded-2xl p-2 border border-stone-200/50 dark:border-stone-800/80">
              {[
                { id: 'hero-cover', label: 'Novel Cover & Edition', icon: Bookmark, index: 'I' },
                { id: 'sanctuary-features-explainer', label: 'Sanctuary Platform Guide', icon: Sparkles, index: 'II' },
                { id: 'prologue-showcase', label: 'Prologue & Excerpts', icon: Feather, index: 'III' },
                { id: 'about-novel', label: 'About The Novel', icon: BookOpen, index: 'IV' },
                { id: 'protagonist-gallery', label: 'Characters & Arcs', icon: Users, index: 'V' },
                { id: 'novel-themes', label: 'Philosophical Themes', icon: Layers, index: 'VI' },
                { id: 'behind-the-book', label: 'Behind The Book', icon: HelpCircle, index: 'VII' },
                { id: 'book-gallery', label: 'Visual Archives Gallery', icon: Sparkles, index: 'VIII' },
                { id: 'author-section', label: 'Author Pratyay Saha', icon: User, index: 'IX' },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="w-full px-3 py-2 rounded-xl text-left font-serif text-xs text-stone-600 dark:text-stone-400 hover:text-[#8B2213] dark:hover:text-[#FFE58F] hover:bg-[#D4AF37]/15 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#D4AF37]/20"
                  >
                    <div className="flex items-center gap-3">
                      <ItemIcon className="w-3.5 h-3.5 text-[#D4AF37]/75 group-hover:text-[#D4AF37] group-hover:scale-105 transition-all" />
                      <span className="font-serif italic tracking-wide">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-sans font-bold text-stone-400 dark:text-stone-600 tracking-wider font-mono uppercase">{item.index}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* User Card bottom segment (Tactile 3D design) */}
        <div className="p-4 border-t border-[#D4AF37]/40 bg-gradient-to-b from-black/5 to-black/20 dark:from-black/20 dark:to-black/50 flex items-center justify-between gap-3 relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B2213] to-[#D4AF37] text-white font-cinzel font-bold text-xs flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] shrink-0 border border-[#D4AF37]">
              {userInitial}
            </div>
            
            <div className="min-w-0">
              <div className="font-cinzel text-xs font-black text-stone-900 dark:text-stone-100 truncate leading-none">
                {username}
              </div>
              <div className="text-[9px] font-sans font-bold text-[#8B2213] dark:text-[#E5A93C] tracking-[0.15em] uppercase mt-1 leading-none">
                {user ? 'Verified Reader' : 'Guest Reader'}
              </div>
            </div>
          </div>

          {user ? (
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-2.5 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-500/10 active:scale-95 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-b from-[#8B2213] to-[#71160C] text-white font-cinzel font-bold text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md border border-[#FFE58F]/50"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
