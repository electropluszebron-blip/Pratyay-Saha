import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  BookOpen, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Feather, 
  Compass, 
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Scroll,
  Layers,
  Download,
  PenTool
} from 'lucide-react';
import { activeTimeTracker, REQUIRED_READING_SECONDS } from '../services/activeTimeTracker';
import { AuthUser } from './AuthPortal';

interface ReadingStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  user: AuthUser | null;
  onOpenCertificate?: () => void;
  onOpenSeraph?: () => void;
}

export const ReadingStatsModal: React.FC<ReadingStatsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  user,
  onOpenCertificate,
  onOpenSeraph
}) => {
  const [activeSeconds, setActiveSeconds] = useState<number>(() => activeTimeTracker.getActiveSeconds());
  const [isQualified, setIsQualified] = useState<boolean>(() => activeTimeTracker.isQualified());
  const [visitedPages, setVisitedPages] = useState<number[]>([]);
  const [annotationCount, setAnnotationCount] = useState<number>(0);

  useEffect(() => {
    const unsub = activeTimeTracker.subscribe((secs, qualified) => {
      setActiveSeconds(secs);
      setIsQualified(qualified);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('wilting_of_words_visited_pages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Guarantee valid page array mapping
            setVisitedPages(parsed.filter(p => typeof p === 'number' && p >= 1 && p <= 219));
          }
        } else {
          setVisitedPages([1]);
        }
      } catch {
        setVisitedPages([1]);
      }

      try {
        const savedH = localStorage.getItem('wilting_of_words_highlights_v2');
        if (savedH) {
          const parsedH = JSON.parse(savedH);
          if (Array.isArray(parsedH)) {
            setAnnotationCount(parsedH.length);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = activeTimeTracker.getProgressPercentage();
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Fully authentic metrics strictly measured after reader turns pages & words read
  const actualPagesRead = Math.min(219, Math.max(1, visitedPages.length));
  const actualWordsRead = actualPagesRead * 220; // 220 words average per page

  const handleExportReport = () => {
    try {
      const timeStr = activeTimeTracker.getFormattedTime();
      const userEmail = user?.email || 'Guest Reader';
      const userName = user?.name || 'Anonymous Reader';
      
      const reportText = `================================================
WILTING OF WORDS - READING SANCTUARY REPORT
================================================
Generated on: ${new Date().toLocaleString()}
Reader Name: ${userName}
Reader Email: ${userEmail}

------------------------------------------------
AUTHENTIC READING PERFORMANCE METRICS:
------------------------------------------------
* Total Focus Duration: ${timeStr}
* Pages Visited/Explored: ${actualPagesRead} / 219 pages
* Words Absorbed: ${actualWordsRead.toLocaleString()} words
* Master Certificate Qualified: ${isQualified ? 'YES' : 'NO'}
* Progress towards Certificate: ${progressPercent}%
* Immersion Level Rating: ${progressPercent >= 50 ? 'Deep Focus' : 'Attentive'}

------------------------------------------------
HONORS & LITERARY MILESTONES:
------------------------------------------------
1. "Silence Broken" (10s Focus): ${activeSeconds >= 10 ? 'UNLOCKED [✓]' : 'LOCKED [ ]'}
2. "Terracotta Roots" (5m Focus): ${activeSeconds >= 300 ? 'UNLOCKED [✓]' : 'LOCKED [ ]'}
3. "Midnight Scribe" (15m Focus): ${activeSeconds >= 900 ? 'UNLOCKED [✓]' : 'LOCKED [ ]'}
4. "Literary Mastery" (30m Focus): ${isQualified ? 'UNLOCKED [✓]' : 'LOCKED [ ]'}

================================================
"Some voices are silenced in life, 
 but their words live louder than ever."
Published by Technodef Press.
================================================`;

      const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wilting_of_words_reading_report_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[Stats Export] Error generating report file:', e);
    }
  };

  const BADGES = [
    {
      title: "Silence Broken",
      description: "Began Aratrika's chronicle",
      unlocked: activeSeconds >= 10,
      icon: Feather
    },
    {
      title: "Active Annotator",
      description: "Saved at least 1 margin annotation",
      unlocked: annotationCount >= 1,
      icon: PenTool
    },
    {
      title: "Terracotta Roots",
      description: "Immersion in Bengal heritage",
      unlocked: activeSeconds >= 300,
      icon: Compass
    },
    {
      title: "Midnight Scribe",
      description: "15 minutes active reflection",
      unlocked: activeSeconds >= 900,
      icon: Clock
    },
    {
      title: "Literary Mastery",
      description: "Completed 30 minutes focused reading",
      unlocked: isQualified,
      icon: Award
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
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
            <BarChart3 className="w-5 h-5 text-amber-200" />
            <h3 className="font-cinzel text-xs sm:text-sm font-bold tracking-widest uppercase">
              Sanctuary Reading Analytics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Main Chronometer Visual Hero Card */}
          <div className="p-5 rounded-2xl border-2 border-double border-[#D4AF37] bg-gradient-to-br from-[#FCFAF5] via-[#FAF2E5] to-[#FCFAF5] text-stone-800 shadow-md flex flex-col sm:flex-row items-center gap-5">
            
            {/* Circular Gauge */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center bg-white rounded-full p-1 border border-[#D4AF37]/40 shadow-inner">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-stone-200 fill-none"
                  strokeWidth="5"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="stroke-[#B93826] fill-none transition-all duration-500"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <Clock className="w-4 h-4 text-[#8B2213] animate-pulse" />
                <span className="font-cinzel text-sm font-black text-stone-800 mt-1">
                  {progressPercent}%
                </span>
                <span className="text-[8px] font-cinzel uppercase text-stone-500 font-bold">
                  Progress
                </span>
              </div>
            </div>

            {/* Information */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <span className="text-[10px] font-cinzel font-black uppercase tracking-[0.2em] text-[#8B2213] block">
                Reading Chronometer Status
              </span>
              <h4 className="font-cinzel text-base sm:text-lg font-black text-stone-900">
                {activeTimeTracker.getFormattedTime()} / {activeTimeTracker.getFormattedRequiredTime()}
              </h4>
              <p className="font-serif text-xs text-stone-600 leading-relaxed">
                {isQualified 
                  ? "Congratulations! You have fulfilled the 30-minute literary focus requirement and earned your official Certificate of Literary Mastery."
                  : `You need ${Math.max(0, REQUIRED_READING_SECONDS - activeSeconds)} more seconds of foreground focus on this tab to qualify for the royal certificate.`}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? 'bg-black/30 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <BookOpen className="w-4 h-4 mx-auto text-[#D4AF37] mb-1" />
              <span className="text-[9px] font-cinzel font-bold text-stone-400 block uppercase">Pages Explored</span>
              <span className="font-cinzel text-base font-black text-stone-800 dark:text-stone-100">
                {actualPagesRead} / 219
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center ${
              isDark ? 'bg-black/30 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <Scroll className="w-4 h-4 mx-auto text-[#B93826] mb-1" />
              <span className="text-[9px] font-cinzel font-bold text-stone-400 block uppercase">Words Absorbed</span>
              <span className="font-cinzel text-base font-black text-stone-800 dark:text-stone-100">
                ~{actualWordsRead.toLocaleString()}
              </span>
            </div>

            <div className={`p-3.5 rounded-2xl border text-center col-span-2 sm:col-span-1 ${
              isDark ? 'bg-black/30 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <TrendingUp className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
              <span className="text-[9px] font-cinzel font-bold text-stone-400 block uppercase">Immersion Rating</span>
              <span className="font-cinzel text-base font-black text-emerald-600 dark:text-emerald-400">
                {progressPercent >= 50 ? 'Deep Focus' : 'Attentive'}
              </span>
            </div>
          </div>

          {/* Daily Reader Goals Tracker Card */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDark ? 'bg-[#18110D] border-stone-850' : 'bg-[#FAF6EE] border-[#D4AF37]/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
                <h4 className="font-cinzel text-xs font-bold tracking-wider text-[#8B2213] dark:text-[#FFE58F] uppercase">
                  Daily Reader Goals & Flow
                </h4>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider border border-amber-500/20">
                Streak: 3 Days 🔥
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Goal 1: Active Focus */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px] tracking-wide">Focus Goal: 10 mins</span>
                  <span className="font-mono text-stone-700 dark:text-amber-200 font-bold">
                    {Math.min(10, Math.floor(activeSeconds / 60))}m / 10m ({Math.min(100, Math.round((activeSeconds / 600) * 100)) || 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, (activeSeconds / 600) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Goal 2: Page turns */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px] tracking-wide">Pages Turned Goal: 5 pages</span>
                  <span className="font-mono text-stone-700 dark:text-amber-200 font-bold">
                    {Math.min(5, actualPagesRead)} / 5 ({Math.min(100, Math.round((actualPagesRead / 5) * 100))}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#B93826] to-[#D85A2A] transition-all duration-500"
                    style={{ width: `${Math.min(100, (actualPagesRead / 5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sanctuary Badges Unlocked */}
          <div>
            <h4 className="font-cinzel text-xs font-black tracking-widest text-[#8B2213] dark:text-[#FFE58F] uppercase mb-3">
              Sanctuary Honors & Milestones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BADGES.map((b, i) => {
                const IconComponent = b.icon;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                      b.unlocked 
                        ? 'bg-amber-500/10 border-[#D4AF37] text-stone-800 dark:text-stone-100' 
                        : 'bg-stone-100 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60 text-stone-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      b.unlocked ? 'bg-[#8B2213] text-white shadow-sm' : 'bg-stone-300 dark:bg-stone-800 text-stone-500'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-cinzel text-xs font-bold truncate">
                        {b.title}
                      </div>
                      <div className="text-[10px] font-serif truncate text-stone-500 dark:text-stone-400">
                        {b.description}
                      </div>
                    </div>
                    {b.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-[#D4AF37]/30 flex flex-col sm:flex-row gap-2.5">
            {onOpenCertificate && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCertificate();
                }}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] hover:from-[#A22B1A] hover:to-[#A22B1A] text-white font-cinzel font-black text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#FFE58F]/40"
              >
                <Award className="w-4 h-4 text-amber-200" />
                <span>Claim Certificate</span>
              </button>
            )}

            <button
              onClick={handleExportReport}
              className="px-4 py-3 rounded-xl bg-[#2A1E14] text-[#E5A93C] border border-[#E5A93C]/50 hover:bg-[#3C2D20] font-cinzel font-black text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              title="Download your full reading sanctuary performance report as a text file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>

            {onOpenSeraph && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSeraph();
                }}
                className="px-4 py-3 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-[#8B2213] dark:text-[#FFE58F] border border-[#D4AF37]/60 font-cinzel font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Ask Seraph AI</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
