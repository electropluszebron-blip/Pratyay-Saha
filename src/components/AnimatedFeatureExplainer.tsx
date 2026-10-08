import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Award, 
  GraduationCap, 
  Volume2, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Eye,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface AnimatedFeatureExplainerProps {
  isDark: boolean;
  onOpenReader: () => void;
  onOpenCertificate: () => void;
  onOpenExam: () => void;
  onJumpToSection: (sectionId: string) => void;
}

interface FeatureSpotlight {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  icon: any;
  actionText: string;
  actionHandler: 'reader' | 'certificate' | 'exam' | 'audio' | 'reflections';
  accentGradient: string;
  iconBg: string;
}

const SANCTUARY_FEATURES: FeatureSpotlight[] = [
  {
    id: 'reader-feature',
    badge: 'Art-Integrated E-Reader',
    title: 'Interactive Manuscript Reader',
    subtitle: '219 Pages • Bilingual Reading • Real-time Lexicon',
    description: 'Immerse yourself into Aratrika’s story with interactive typography. Tap any word to view phonetic pronunciation, definitions, and meanings exclusively in Bengali and Hindi.',
    highlights: [
      'Tap any word for instant dictionary & pronunciation',
      'Side-by-side English + Bengali parallel reading',
      'Distraction-free focus line ruler and dyslexia-friendly font'
    ],
    icon: BookOpen,
    actionText: 'Open Interactive Reader',
    actionHandler: 'reader',
    accentGradient: 'from-[#8B2213] via-[#B93826] to-[#E5A93C]',
    iconBg: 'bg-[#B93826]'
  },
  {
    id: 'certificate-feature',
    badge: 'Conferred Literary Distinction',
    title: '30-Minute Author-Signed Certificate',
    subtitle: 'Authentic Screen Immersion • Official Digital Credential',
    description: 'A genuine literary milestone: Spend at least 30 minutes of authentic reading inside the manuscript reader to unlock an official Certificate of Literary Mastery, personally signed by novelist Pratyay Saha.',
    highlights: [
      'Automated active reading time tracker',
      'High-resolution vector seal with anti-counterfeit hash',
      'One-click instant PDF download with your name'
    ],
    icon: Award,
    actionText: 'Inspect Certificate Progress',
    actionHandler: 'certificate',
    accentGradient: 'from-[#D4AF37] via-[#E5A93C] to-[#B93826]',
    iconBg: 'bg-[#D4AF37]'
  },
  {
    id: 'exam-feature',
    badge: 'Scholastic Assessment',
    title: 'Chapter 1 Literary Examination',
    subtitle: '100% Canonical Data • Zero AI Hallucinations',
    description: 'Test your understanding of the subtle family dynamics, morning colours, and secret margin writing in Chapter 1. Carefully crafted textual MCQs with direct chapter citations.',
    highlights: [
      'Comprehensive multiple-choice chapter tests',
      'Direct textual quotes from the manuscript',
      'Earn prestigious Scholastic Honors and royal seals'
    ],
    icon: GraduationCap,
    actionText: 'Take Chapter 1 Exam',
    actionHandler: 'exam',
    accentGradient: 'from-[#6366f1] via-[#8B2213] to-[#D4AF37]',
    iconBg: 'bg-[#8B2213]'
  },
  {
    id: 'audio-feature',
    badge: 'Meditative Soundscapes',
    title: 'Atmospheric Sanctuary Soundtrack',
    subtitle: 'Classical Indian Instrumentation • Continuous Ambient Score',
    description: 'Crafted specifically to accompany Pratyay Saha’s evocative prose. Features soothing sitar, bansuri flute reflections, and tanpura resonance reflecting the monsoons of Nadia.',
    highlights: [
      'Integrated native audio engine with seamless loop',
      'One-tap global speaker toggle in header',
      'Acoustically calibrated for deep focus and reading flow'
    ],
    icon: Volume2,
    actionText: 'Toggle Soundtrack Playback',
    actionHandler: 'audio',
    accentGradient: 'from-[#D85A2A] via-[#E5A93C] to-[#8B2213]',
    iconBg: 'bg-[#D85A2A]'
  },
  {
    id: 'community-feature',
    badge: 'Sanctuary Community',
    title: 'Verified Reader Reflections Wall',
    subtitle: 'Real-time Community • Multi-lingual Anti-Slang Protection',
    description: 'Join readers across the globe on the literary sanctuary wall. Share constructive critiques, favorite quotes, and heartfelt impressions with authenticated reader verification.',
    highlights: [
      'Strict verification shielding against vulgarity and slangs',
      'Real-time Firestore synchronization across all devices',
      'Public praise and constructive literary critiques welcome'
    ],
    icon: MessageSquare,
    actionText: 'Visit Community Reflections',
    actionHandler: 'reflections',
    accentGradient: 'from-[#B93826] via-[#D4AF37] to-[#8B2213]',
    iconBg: 'bg-[#8B2213]'
  }
];

export const AnimatedFeatureExplainer: React.FC<AnimatedFeatureExplainerProps> = ({
  isDark,
  onOpenReader,
  onOpenCertificate,
  onOpenExam,
  onJumpToSection
}) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-cycle through features every 5 seconds unless hovered/interacted
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % SANCTUARY_FEATURES.length);
    }, 5200);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentFeature = SANCTUARY_FEATURES[activeIdx];
  const IconComponent = currentFeature.icon;

  const handleAction = () => {
    switch (currentFeature.actionHandler) {
      case 'reader':
        onOpenReader();
        break;
      case 'certificate':
        onOpenCertificate();
        break;
      case 'exam':
        onOpenExam();
        break;
      case 'audio':
        audioSynth.togglePlay();
        break;
      case 'reflections':
        onJumpToSection('reader-reflections');
        break;
    }
  };

  return (
    <section 
      id="sanctuary-features-explainer"
      className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Soft Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[280px] sm:h-[400px] bg-gradient-to-r from-[#D4AF37]/10 via-[#B93826]/10 to-[#E5A93C]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Enclosure Box */}
      <div className={`relative rounded-3xl p-6 sm:p-10 border-2 border-double transition-all duration-500 shadow-2xl overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-br from-[#1A120D] via-[#140D09] to-[#120B07] border-[#D4AF37]/45 text-[#FAF5EE]' 
          : 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EAD6] border-[#D4AF37]/50 text-[#2D241E]'
      }`}>
        
        {/* Cultural Corner Filigree Accents */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]/70 rounded-tl-md" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]/70 rounded-tr-md" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]/70 rounded-bl-md" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]/70 rounded-br-md" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/45 text-[#B93826] dark:text-[#E5A93C] text-[11px] font-cinzel font-bold uppercase tracking-widest mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>SANCTUARY PLATFORM GUIDE</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          <h3 className="font-cinzel text-2xl sm:text-4xl font-black uppercase tracking-wide sparkle-gold-text leading-tight">
            How The E-Book Sanctuary Works
          </h3>

          <p className="mt-2 font-cormorant italic text-sm sm:text-lg text-stone-600 dark:text-stone-300">
            "Everything you need to read, explore, test your comprehension, and earn literary honors."
          </p>
        </div>

        {/* Interactive Feature Category Pills (Navigation) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {SANCTUARY_FEATURES.map((feat, idx) => {
            const isActive = activeIdx === idx;
            const FeatIcon = feat.icon;

            return (
              <button
                key={feat.id}
                onClick={() => {
                  setActiveIdx(idx);
                  try { audioSynth.playNow(); } catch {}
                }}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-cinzel font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isActive 
                    ? 'border-[#D4AF37] bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white shadow-lg scale-105' 
                    : isDark 
                      ? 'border-[#3E2D20] bg-black/30 text-stone-400 hover:text-white hover:border-[#D4AF37]/50' 
                      : 'border-[#E5DBC7] bg-white/70 text-stone-600 hover:text-stone-900 hover:border-[#B93826]/50'
                }`}
              >
                <FeatIcon className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">{feat.badge}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Feature Spotlight Box */}
        <div className="relative min-h-[290px] sm:min-h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature.id}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              {/* Left Column: Visual Icon & Title */}
              <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl ${currentFeature.iconBg} text-white flex items-center justify-center shadow-xl border-2 border-[#D4AF37] shrink-0`}>
                  <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C]">
                    {currentFeature.badge}
                  </span>
                  <h4 className="font-cinzel text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5 leading-snug">
                    {currentFeature.title}
                  </h4>
                  <p className="text-xs font-serif italic text-stone-500 dark:text-stone-400 mt-1">
                    {currentFeature.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Column: Narrative Description & Highlights */}
              <div className="md:col-span-7 space-y-4">
                <p className="font-serif text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
                  {currentFeature.description}
                </p>

                {/* Bullet Highlights */}
                <div className="space-y-2">
                  {currentFeature.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2 text-xs font-serif text-stone-600 dark:text-stone-400">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action Trigger */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleAction}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#E5A93C] text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-[#FFE58F]/50"
                  >
                    <span>{currentFeature.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] font-sans opacity-60">
                    Step {activeIdx + 1} of {SANCTUARY_FEATURES.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Interactive Pagination Dots & Manual Stepper */}
        <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={() => setActiveIdx(prev => (prev === 0 ? SANCTUARY_FEATURES.length - 1 : prev - 1))}
            className="w-8 h-8 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
            aria-label="Previous Feature"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {SANCTUARY_FEATURES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setActiveIdx(dotIdx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIdx === dotIdx ? 'w-8 bg-[#B93826] dark:bg-[#E5A93C]' : 'w-2 bg-stone-400/40 hover:bg-stone-400/70'
                }`}
                aria-label={`Go to feature ${dotIdx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveIdx(prev => (prev + 1) % SANCTUARY_FEATURES.length)}
            className="w-8 h-8 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
            aria-label="Next Feature"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
