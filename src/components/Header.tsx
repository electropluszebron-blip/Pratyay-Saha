import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  User, 
  LogOut, 
  Sparkles, 
  Award, 
  Search, 
  Flame, 
  BarChart3,
  Bookmark,
  MoreVertical,
  Trash2,
  HelpCircle,
  LifeBuoy,
  Settings,
  Download,
  BookOpen,
  Mic,
  Share2,
  Languages,
  ChevronDown,
  Check
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';
import { AuthUser } from './AuthPortal';
import { activeTimeTracker } from '../services/activeTimeTracker';
import { useLanguage, SUPPORTED_LANGUAGES, languageCodeToLabel } from '../utils/LanguageContext';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (d: boolean) => void;
  isAmbientLit?: boolean;
  onToggleAmbientLit?: () => void;
  onJumpToSection?: (sectionId: string) => void;
  onOpenPreview?: () => void;
  onOpenCertificate?: () => void;
  onOpenSeraph?: () => void;
  onOpenSearch?: () => void;
  onOpenReadingStats?: () => void;
  onOpenMenu?: () => void;
  onOpenFAQ?: () => void;
  onOpenSupport?: () => void;
  onOpenSettings?: () => void;
  onOpenDeleteAccount?: () => void;
  user?: AuthUser | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onOpenWOW?: () => void;
  onOpenShare?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  setIsDark,
  isAmbientLit = false,
  onToggleAmbientLit,
  onJumpToSection,
  onOpenPreview,
  onOpenCertificate,
  onOpenSeraph,
  onOpenSearch,
  onOpenReadingStats,
  onOpenMenu,
  onOpenFAQ,
  onOpenSupport,
  onOpenSettings,
  onOpenDeleteAccount,
  user,
  onOpenAuth,
  onSignOut,
  onOpenWOW,
  onOpenShare,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => audioSynth.getIsPlaying());
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [activeFormatted, setActiveFormatted] = useState<string>(() => activeTimeTracker.getFormattedTime());
  const [progressPercent, setProgressPercent] = useState<number>(() => activeTimeTracker.getProgressPercentage());
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = audioSynth.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsubscribe = activeTimeTracker.subscribe(() => {
      setActiveFormatted(activeTimeTracker.getFormattedTime());
      setProgressPercent(activeTimeTracker.getProgressPercentage());
    });
    return unsubscribe;
  }, []);

  // Handle outside clicks to close profile card
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSpeaker = () => {
    audioSynth.togglePlay();
  };

  const handleScrollTo = (id: string) => {
    if (onJumpToSection) {
      onJumpToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const readerId = user 
    ? `WOW-READER-${user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5)}-${user.email.length * 123 % 9000 + 1000}`
    : 'WOW-READER-GUEST';

  return (
    <header className={`w-full sticky top-0 z-50 backdrop-blur-md transition-all duration-300 border-b ${
      isDark 
        ? 'bg-[#14100D]/95 border-[#D4AF37]/35 text-[#FAF7F2]' 
        : 'bg-[#FAF8F5]/95 border-[#D4AF37]/35 text-[#2C2117]'
    } px-2 sm:px-6 py-2 shadow-md overflow-visible`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand Left Group: Three-Dot Master Menu Button + Brand Logo + Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0">
          {/* Three-Dot Option on Left (Opens Comprehensive Royal Sanctuary Menu) */}
          <button
            type="button"
            onClick={onOpenMenu}
            title="Sanctuary Master Menu (All Options)"
            aria-label="Sanctuary Master Menu"
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-[#D4AF37]/60 bg-[#FAF7F2] dark:bg-[#1E1712] text-[#8B2213] dark:text-[#FFE58F] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <MoreVertical className="w-4 h-4 text-[#D4AF37]" />
          </button>

          <div 
            onClick={() => handleScrollTo('hero-cover')}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="w-8 h-8 rounded-full border border-[#D4AF37] flex items-center justify-center p-1 shrink-0 bg-[#FFFDF9]/60 dark:bg-[#201813] group-hover:scale-105 transition-transform duration-300 shadow-sm">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#C89B4C] stroke-current fill-none" strokeWidth="3">
                <circle cx="50" cy="50" r="42" strokeDasharray="3,3" />
                <circle cx="50" cy="50" r="28" />
                <circle cx="50" cy="50" r="14" fill="#C89B4C" fillOpacity="0.25" />
              </svg>
            </div>

            <h1 className="font-cinzel text-xs sm:text-sm font-black tracking-widest uppercase leading-none text-[#1A1410] dark:text-[#FAF7F2] group-hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0">
              TECHNODEF
            </h1>
          </div>
        </div>

        {/* 
          ==================================================================
          PREMIUM HEADER ACTION BUTTONS
          Only: Reader button, Search button, Speaker, and Profile icon
          ==================================================================
        */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative z-20">
          
          {/* 1. READER BUTTON */}
          {onOpenPreview && (
            <button
              type="button"
              onClick={onOpenPreview}
              title="Open E-Book & Kindle Reader"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#E5A93C] hover:brightness-110 text-white font-cinzel font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border border-[#FFE58F]/60 cursor-pointer shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden xs:inline">Reader</span>
            </button>
          )}

          {/* 2. SEARCH BUTTON */}
          <button
            type="button"
            onClick={onOpenSearch}
            title="Concordance Search"
            aria-label="Search"
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-[#D4AF37]/50 bg-[#FAF7F2] dark:bg-[#1E1712] text-[#8B2213] dark:text-[#FFE58F] hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Search className="w-4 h-4 text-[#D4AF37]" />
          </button>

          {/* 3. SHARE APP LINK BUTTON */}
          {onOpenShare && (
            <button
              type="button"
              onClick={onOpenShare}
              title="Get & Share App Link"
              aria-label="Share App"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-[#D4AF37]/60 bg-[#FAF7F2] dark:bg-[#1E1712] text-[#8B2213] dark:text-[#FFE58F] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <Share2 className="w-4 h-4 text-[#D4AF37]" />
            </button>
          )}

          {/* 4. WOW VOICE FEATURE BUTTON */}
          {onOpenWOW && (
            <button
              type="button"
              onClick={onOpenWOW}
              title="Open W.O.W. Voice Assistant"
              aria-label="W.O.W. Voice Assistant"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-amber-500/50 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <Mic className="w-4 h-4 text-amber-200 animate-pulse" />
            </button>
          )}

          {/* 4. USER PROFILE BUTTON */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5A93C] hover:brightness-110 flex items-center justify-center shadow-md border-2 border-[#D4AF37] transition-all cursor-pointer active:scale-95"
                title="View Reader Profile & Stats"
                aria-label="Reader Profile"
              >
                <User className="w-4 h-4 text-stone-950" />
              </button>

              {/* User Profile Pop-up Card */}
              {showProfileDropdown && (
                <div className={`absolute right-0 mt-3 w-80 p-5 rounded-2xl border-2 shadow-2xl z-40 transition-all ${
                  isDark 
                    ? 'bg-[#1C1510] border-[#D4AF37] text-white' 
                    : 'bg-[#FAF6EF] border-[#D4AF37] text-stone-800'
                }`}>
                  {/* Decorative Header */}
                  <div className="text-center pb-3 border-b border-[#D4AF37]/35 space-y-1">
                    <h4 className="font-cinzel text-xs font-black tracking-widest text-[#8B2213] dark:text-[#FFE58F]">
                      READER SANCTUARY PROFILE
                    </h4>
                    <span className="font-serif text-[11px] text-stone-400 italic">
                      Wilting of Words Registry
                    </span>
                  </div>

                  {/* Profile Details */}
                  <div className="py-4 space-y-3.5 text-left">
                    <div>
                      <span className="text-[9px] font-cinzel font-bold text-amber-600 dark:text-amber-400 block tracking-wider uppercase">Conferred Identity</span>
                      <span className="font-serif text-sm font-black text-stone-800 dark:text-stone-100">{user.name}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-cinzel font-bold text-amber-600 dark:text-amber-400 block tracking-wider uppercase">Sanctuary Email</span>
                      <span className="font-serif text-xs text-stone-500 dark:text-stone-300 truncate block">{user.email}</span>
                    </div>

                    <div>
                      <span className="text-[9px] font-cinzel font-bold text-amber-600 dark:text-amber-400 block tracking-wider uppercase">Unique Reader ID</span>
                      <span className="font-serif text-xs font-extrabold text-[#8B2213] dark:text-[#FFE58F] uppercase tracking-wider block bg-black/5 dark:bg-white/5 p-1.5 rounded-lg border border-[#D4AF37]/20">
                        {readerId}
                      </span>
                    </div>

                    {/* Progress Gauge & Stats Removed */}
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-serif font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Royal Certification Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Options Block */}
                  <div className="pt-2 border-t border-[#D4AF37]/35 space-y-2">
                    {/* View Reading Stats Button */}
                    {onOpenReadingStats && (
                      <button
                        onClick={() => {
                          onOpenReadingStats();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-[#D4AF37] text-xs font-cinzel font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all text-[#8B2213] dark:text-[#FFE58F] cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                        <span>View Reading Analytics</span>
                      </button>
                    )}

                    {onOpenCertificate && (
                      <button
                        onClick={() => {
                          onOpenCertificate();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white text-xs font-cinzel font-bold tracking-wider uppercase flex items-center justify-center gap-2 border border-[#FFE58F]/40 shadow-md cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-amber-200" />
                        <span>Claim Certificate</span>
                      </button>
                    )}

                    {onOpenSeraph && (
                      <button
                        onClick={() => {
                          onOpenSeraph();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-[#D4AF37]/60 hover:bg-stone-200 text-xs font-cinzel font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all text-stone-800 dark:text-stone-200 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span>Seraph AI Companion</span>
                      </button>
                    )}

                    {onOpenSettings && (
                      <button
                        onClick={() => {
                          onOpenSettings();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 hover:border-[#D4AF37] text-xs font-cinzel font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all text-stone-800 dark:text-stone-200 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Sanctuary Settings</span>
                      </button>
                    )}

                    {onOpenDeleteAccount && (
                      <button
                        onClick={() => {
                          onOpenDeleteAccount();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-cinzel font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Account (OTP)</span>
                      </button>
                    )}

                    {onSignOut && (
                      <button
                        onClick={() => {
                          onSignOut();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2 rounded-xl bg-[#8B2213]/10 hover:bg-[#8B2213]/20 text-[#B93826] text-xs font-cinzel font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out Registry</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E5A93C] hover:brightness-110 flex items-center justify-center shadow-md border-2 border-[#D4AF37] transition-all cursor-pointer active:scale-95"
                title="Sign In"
                aria-label="Sign In"
              >
                <User className="w-4 h-4 text-stone-950" />
              </button>
            )
          )}

        </div>

      </div>
    </header>
  );
};
