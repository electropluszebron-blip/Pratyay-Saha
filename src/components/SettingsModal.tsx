import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Eye, 
  Type, 
  Flame, 
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Languages
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';
import { soundEffects } from '../services/soundEffects';
import { activeTimeTracker } from '../services/activeTimeTracker';
import { calculateSunCycle, SunCycleTimes } from '../utils/sunTime';
import { locationVerificationService } from '../services/locationVerificationService';
import { useLanguage, SUPPORTED_LANGUAGES } from '../utils/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  isAmbientLit: boolean;
  onToggleAmbientLit: () => void;
  isAutoNightMode: boolean;
  onToggleAutoNightMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  setIsDark,
  isAmbientLit,
  onToggleAmbientLit,
  isAutoNightMode,
  onToggleAutoNightMode
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(() => audioSynth.getIsPlaying());
  const [pageSoundEnabled, setPageSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wow_page_sound') !== 'false';
    } catch {
      return true;
    }
  });
  const [fontChoice, setFontChoice] = useState<'cinzel' | 'serif' | 'sans'>(() => {
    try {
      return (localStorage.getItem('wow_font_choice') as any) || 'cinzel';
    } catch {
      return 'cinzel';
    }
  });
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // Real-time calculated sun cycle times for aesthetic local scheduling
  const [sunTimes, setSunTimes] = useState<SunCycleTimes | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loc = locationVerificationService.getVerifiedLocation();
      setSunTimes(calculateSunCycle(loc?.latitude, loc?.longitude));
    }
  }, [isOpen, isAutoNightMode]);

  useEffect(() => {
    const unsub = audioSynth.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleTogglePageSound = () => {
    const next = !pageSoundEnabled;
    setPageSoundEnabled(next);
    try {
      localStorage.setItem('wow_page_sound', String(next));
      if (next) soundEffects.playPageTurnSound();
    } catch {}
  };

  const handleFontChange = (f: 'cinzel' | 'serif' | 'sans') => {
    setFontChoice(f);
    try {
      localStorage.setItem('wow_font_choice', f);
      // Apply globally to document
      if (f === 'serif') {
        document.body.style.fontFamily = 'Georgia, serif';
      } else if (f === 'sans') {
        document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      } else {
        document.body.style.fontFamily = '';
      }
    } catch {}
  };

  const handleResetCache = () => {
    try {
      localStorage.removeItem('wilting_of_words_visited_pages');
      localStorage.removeItem('wilting_of_words_last_page');
      localStorage.removeItem('wilting_of_words_bookmarks');
      localStorage.removeItem('wilting_of_words_highlights_v2');
      activeTimeTracker.resetTime();
      setResetSuccess(true);
      setConfirmReset(false);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (e) {
      console.warn('Could not reset cache:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-xl rounded-3xl border-2 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[88vh] transition-all ${
          isDark 
            ? 'bg-[#18110C] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <Settings className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-100">
                Sanctuary Settings &amp; Preferences
              </h3>
              <p className="text-[10px] font-serif italic text-amber-200/80">
                Royal Aesthetic &amp; Reading Customization
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

        {/* Settings Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* 0. Primary Language (English, Bengali বাংলা, Hindi हिन्दी) */}
          <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-cinzel font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t('languageChoice')}</span>
                </div>
                <p className="text-xs font-serif text-stone-500 dark:text-stone-400 mt-0.5">
                  {t('languageChoiceSubtitle')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {SUPPORTED_LANGUAGES.map((langOpt) => (
                <button
                  key={langOpt.code}
                  type="button"
                  onClick={() => setLanguage(langOpt.code)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    language === langOpt.code
                      ? 'border-[#D4AF37] bg-[#8B2213] text-white shadow-md'
                      : 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-[#D4AF37]/50'
                  }`}
                >
                  <span className="font-bold">{langOpt.name}</span>
                  {langOpt.englishName !== langOpt.name && (
                    <span className="text-[10px] opacity-75">{langOpt.englishName}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Theme Mode (Dark Sanctuary vs Parchment Light) */}
          <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 flex items-center justify-between gap-3">
            <div>
              <div className="font-cinzel font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-[#D4AF37]" /> : <Sun className="w-4 h-4 text-[#B93826]" />}
                <span>{t('paletteTitle')}</span>
              </div>
              <p className="text-xs font-serif text-stone-500 dark:text-stone-400 mt-0.5">
                {t('paletteSubtitle')}
              </p>
              {isAutoNightMode && (
                <span className="inline-block mt-1.5 text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-serif font-semibold">
                  Auto Night Mode Active (Manual switch overrides)
                </span>
              )}
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-cinzel font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 hover:border-[#D4AF37] transition-all cursor-pointer"
            >
              {isDark ? t('royalDark') : t('parchment')}
            </button>
          </div>

          {/* Astronomical Auto Night Mode Setting */}
          <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-cinzel font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Astronomical Auto Night Mode</span>
                </div>
                <p className="text-xs font-serif text-stone-500 dark:text-stone-400 mt-0.5">
                  Automatically transition themes based on your location's precise sunrise &amp; sunset times.
                </p>
              </div>
              <button
                onClick={onToggleAutoNightMode}
                className={`px-3.5 py-1.5 rounded-xl border font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                  isAutoNightMode
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-500 border-stone-300 dark:border-stone-700 hover:border-amber-500/50'
                }`}
              >
                {isAutoNightMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            
            {isAutoNightMode && sunTimes && (
              <div className="pt-2.5 border-t border-stone-200 dark:border-stone-800 text-[11px] font-serif text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Sunrise: <strong className="text-stone-800 dark:text-stone-200">{sunTimes.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    Sunset: <strong className="text-stone-800 dark:text-stone-200">{sunTimes.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-500/5 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/10 text-[10px]">
                  <Navigation className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>
                    {sunTimes.usingFallback ? 'Default Chrono Mode' : 'Satellite Precise GPS'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Candlelight Ambient Aura */}
          <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 flex items-center justify-between gap-3">
            <div>
              <div className="font-cinzel font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Candlelight Ambient Aura</span>
              </div>
              <p className="text-xs font-serif text-stone-500 dark:text-stone-400 mt-0.5">
                Subtle golden candlelight glow across the entire reading viewport.
              </p>
            </div>
            <button
              onClick={onToggleAmbientLit}
              className={`px-3.5 py-1.5 rounded-xl border font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isAmbientLit
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-500 border-stone-300 dark:border-stone-700'
              }`}
            >
              {isAmbientLit ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* 3. Audio & Page Rustle Effects */}
          <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-cinzel font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Physical Page Turn Sound</span>
                </div>
                <p className="text-xs font-serif text-stone-500 dark:text-stone-400 mt-0.5">
                  Simulates realistic parchment paper friction on page transitions.
                </p>
              </div>
              <button
                onClick={handleTogglePageSound}
                className={`px-3.5 py-1.5 rounded-xl border font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  pageSoundEnabled
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-500 border-stone-300 dark:border-stone-700'
                }`}
              >
                {pageSoundEnabled ? 'Active' : 'Muted'}
              </button>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
              <div>
                <span className="font-cinzel text-xs font-bold text-stone-800 dark:text-stone-200">
                  Ambient Flute Soundtrack
                </span>
                <p className="text-[11px] font-serif text-stone-500 dark:text-stone-400">
                  Classical Indian raag soundtrack synthesizer.
                </p>
              </div>
              <button
                onClick={() => audioSynth.togglePlay()}
                className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-cinzel font-bold text-xs uppercase text-stone-800 dark:text-stone-200 hover:border-[#D4AF37] transition-all cursor-pointer"
              >
                {isPlaying ? 'Pause Music' : 'Play Music'}
              </button>
            </div>
          </div>

          {/* 4. Font Family Preference */}
          <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40 space-y-2">
            <div className="font-cinzel font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Type className="w-4 h-4 text-[#8B2213] dark:text-[#FFE58F]" />
              <span>Typography Styling</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'cinzel', label: 'Royal Cinzel' },
                { id: 'serif', label: 'Classical Serif' },
                { id: 'sans', label: 'Clean Sans' }
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleFontChange(font.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    fontChoice === font.id
                      ? 'border-[#D4AF37] bg-[#8B2213] text-white shadow-sm'
                      : 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-[#D4AF37]/50'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Reset E-Reader Cache */}
          <div className="p-4 rounded-2xl border border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/40">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="font-cinzel font-bold text-stone-900 dark:text-stone-100 block">
                  Reset Local Reading Cache
                </span>
                <p className="text-xs font-serif text-stone-500 dark:text-stone-400 mt-0.5">
                  Clears local page memory and restarts your session timer.
                </p>
              </div>

              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetCache}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-cinzel text-xs font-bold uppercase hover:bg-red-700 transition-all cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-cinzel transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Cache</span>
                </button>
              )}
            </div>

            {resetSuccess && (
              <div className="mt-3 p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reading cache &amp; session timer have been reset successfully!</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
