import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Scroll, 
  Feather, 
  MapPin, 
  Award, 
  Download, 
  CheckCircle2, 
  Compass, 
  ArrowDown, 
  BookOpen, 
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { audioSynth } from '../services/audioSynth';
import { AuthUser } from './AuthPortal';

interface BeyondTheShellProps {
  isDark: boolean;
  currentUser?: AuthUser | null;
  onContinueJourney?: () => void;
}

interface ShellSecret {
  id: string;
  title: string;
  category: string;
  tagline: string;
  badge: string;
  revealedContent: string;
  secondaryNote: string;
}

const SHELL_SECRETS: ShellSecret[] = [
  {
    id: 'deleted-prologue',
    title: 'The Omitted Midnight Stanza',
    category: 'Deleted Fragment',
    tagline: 'Lines removed during the 25 September Revision',
    badge: 'Draft 2 Archive',
    revealedContent: '“Before the ink touched paper, the silence had already surrendered. We do not write to be understood by the masses; we write so that the loneliest soul on the riverbank knows they were never truly alone.”',
    secondaryNote: 'Penned on 18 May 2026, later distilled into Aratrika’s opening monologue.'
  },
  {
    id: 'author-diary-entry',
    title: '12 April 2026 — The Diary Inscription',
    category: 'Author’s Diary',
    tagline: 'Exact journal entry from the day the story was conceived',
    badge: 'Genesis Artifact',
    revealedContent: '“12.04.2026 • 2:14 AM — Today, something began. A title struck me like a drop of cold rainwater: Wilting of Words. It is not about defeat. It is about how words refuse to wither even when voices break. I will finish this manuscript for publication.”',
    secondaryNote: 'Recorded in author Pratyay Saha’s personal notebook.'
  },
  {
    id: 'geographical-trail',
    title: 'The Chakdaha–Bishnupur Trail',
    category: 'Geographical Lore',
    tagline: 'The real-world landscapes behind the fictional narrative',
    badge: 'Literary Map',
    revealedContent: 'The riverbank scenes correspond directly to the Hooghly river stretch at Chakdaha, while the temple terracotta motifs were inspired by the 17th-century terracotta shrines of Bishnupur, Bankura.',
    secondaryNote: 'Every terracotta arch described in chapter 3 corresponds to an actual architectural landmark.'
  },
  {
    id: 'symbolism-of-219',
    title: 'The Mystery of 219 Pages',
    category: 'Structural Symbolism',
    tagline: 'Why the manuscript is precisely 219 pages in length',
    badge: 'Numerological Key',
    revealedContent: '219 pages represents 21 (the day the first draft was finished: 21 July) and 9 (September, when the final revision concluded). It also mirrors the 219 days of unbroken handwritten discipline.',
    secondaryNote: 'Every chapter structure was architected with intentional mathematical symmetry.'
  }
];

export const BeyondTheShell: React.FC<BeyondTheShellProps> = ({
  isDark,
  currentUser,
  onContinueJourney
}) => {
  const [unlockedSecrets, setUnlockedSecrets] = useState<string[]>(['deleted-prologue']);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  const toggleUnlock = (id: string) => {
    try {
      audioSynth.playNow();
    } catch {}

    if (unlockedSecrets.includes(id)) {
      setUnlockedSecrets(unlockedSecrets.filter(s => s !== id));
    } else {
      setUnlockedSecrets([...unlockedSecrets, id]);
      try {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 }
        });
      } catch {}
    }
  };

  const handleOpenCertificate = () => {
    setShowCertificateModal(true);
    try {
      audioSynth.playNow();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <section 
      id="beyond-the-shell" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Dynamic Ambient Royal Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[750px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Royal Enclosure Container */}
      <div className={`relative rounded-3xl p-6 sm:p-12 border transition-all duration-500 shadow-2xl ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_60px_rgba(212,175,55,0.12)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.14)]'
      }`}>
        
        {/* Cultural Corner Filigree Accents */}
        <div className="absolute top-3.5 left-3.5 w-7 h-7 border-t-2 border-l-2 border-[#D4AF37]/75 rounded-tl-lg" />
        <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-2 border-r-2 border-[#D4AF37]/75 rounded-tr-lg" />
        <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-2 border-l-2 border-[#D4AF37]/75 rounded-bl-lg" />
        <div className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-2 border-r-2 border-[#D4AF37]/75 rounded-br-lg" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/45 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Key className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>EXCLUSIVES & ARCHIVES</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            SNEAK BEYOND THE SHELL
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "Unlock unreleased prologue fragments, author diary secrets, and claims your First Edition Reader Seal."
          </p>
        </div>

        {/* 
          ==================================================================
          INTERACTIVE SECRET ARCHIVE CARDS (UNFOLD ON CLICK)
          ==================================================================
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 sm:mb-14">
          {SHELL_SECRETS.map((secret) => {
            const isUnlocked = unlockedSecrets.includes(secret.id);

            return (
              <motion.div
                key={secret.id}
                layout
                className={`rounded-3xl p-5 sm:p-7 border transition-all duration-300 text-left relative overflow-hidden ${
                  isUnlocked
                    ? isDark 
                      ? 'bg-gradient-to-b from-[#221811] to-[#150F0B] border-[#E5A93C] shadow-[0_0_35px_rgba(229,169,60,0.2)]'
                      : 'bg-gradient-to-b from-[#FFFDF9] to-[#F8EFE2] border-[#B93826] shadow-xl'
                    : isDark
                      ? 'bg-[#18120E] border-[#3E2D20] hover:border-[#D4AF37]/60'
                      : 'bg-[#FAF6EF] border-[#E5DBC7] hover:border-[#B93826]/50'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#B93826]/15 text-[#B93826] dark:text-[#E5A93C] text-[10px] font-cinzel font-bold uppercase tracking-widest border border-[#D4AF37]/40">
                      {secret.badge}
                    </span>
                    <h3 className={`font-cinzel text-base sm:text-lg font-bold mt-1.5 ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
                      {secret.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleUnlock(secret.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0 ${
                      isUnlocked
                        ? 'bg-[#B93826] text-white shadow-md'
                        : 'bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/30'
                    }`}
                    title={isUnlocked ? 'Hide Secret' : 'Reveal Secret'}
                  >
                    {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>

                <p className="font-serif text-xs text-stone-500 dark:text-stone-400 mb-3">
                  {secret.tagline}
                </p>

                {/* Animated Unlocked Inscription */}
                <AnimatePresence>
                  {isUnlocked ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 mt-2 space-y-2">
                        <p className="font-cormorant italic text-sm sm:text-base font-bold text-[#9E472A] dark:text-[#FFE58F] leading-relaxed">
                          {secret.revealedContent}
                        </p>
                        <p className="font-serif text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-black/5 dark:border-white/5">
                          ✦ {secret.secondaryNote}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => toggleUnlock(secret.id)}
                      className="w-full py-2.5 rounded-xl border border-dashed border-[#D4AF37]/50 text-xs font-cinzel font-bold text-[#B93826] dark:text-[#E5A93C] hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Click to Unseal Fragment</span>
                    </button>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>

        {/* 
          ==================================================================
          ROYAL READER CERTIFICATE GENERATOR BANNER
          ==================================================================
        */}
        <div className={`rounded-3xl p-6 sm:p-8 border transition-all text-center relative overflow-hidden ${
          isDark 
            ? 'bg-gradient-to-r from-[#2A1E14] via-[#1F150D] to-[#2A1E14] border-[#D4AF37]/60 shadow-2xl' 
            : 'bg-gradient-to-r from-[#FFF8EE] via-[#FAF1E3] to-[#FFF8EE] border-[#E5A93C]/60 shadow-xl'
        }`}>
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B93826]/15 border border-[#D4AF37]/50 text-[#B93826] dark:text-[#E5A93C] text-[11px] font-cinzel font-bold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" />
              <span>COLLECTOR'S CONSECRATION</span>
            </div>

            <h3 className={`font-cinzel text-xl sm:text-2xl font-black ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
              Personalized Reader Consecration Scroll
            </h3>

            <p className="font-serif text-xs sm:text-sm text-[#5A4535] dark:text-[#D0C3B5] leading-relaxed">
              Every registered reader in the Wilting of Words sanctuary receives an official First Edition Reader Seal, honoring their literary companionship.
            </p>

            <button
              onClick={handleOpenCertificate}
              className="mt-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto border border-[#FFE58F]/60"
            >
              <Award className="w-4 h-4 text-amber-200" />
              <span>Claim Your Reader Certificate</span>
            </button>
          </div>
        </div>

        {/* Certificate Modal */}
        <AnimatePresence>
          {showCertificateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCertificateModal(false)}
              className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-xl w-full bg-[#18120D] border-3 border-[#D4AF37] rounded-3xl p-6 sm:p-10 shadow-2xl text-center text-white"
              >
                {/* Filigree Borders */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37]" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37]" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37]" />

                <div className="space-y-4">
                  <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-[#D4AF37]">
                    TECHNODEF LITERARY PRESS • OFFICIAL CONSECRATION
                  </span>

                  <h3 className="font-cinzel text-2xl sm:text-3xl font-black text-[#FFE58F]">
                    CERTIFICATE OF SANCTUARY
                  </h3>

                  <div className="h-[1.5px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />

                  <p className="font-serif text-xs text-stone-300">
                    This certifies that the esteemed reader
                  </p>

                  <div className="py-2 px-4 rounded-xl bg-white/5 border border-[#D4AF37]/50 inline-block font-cinzel text-lg sm:text-xl font-bold text-[#FFD778]">
                    {currentUser?.name || 'Devoted Reader'}
                  </div>

                  <p className="font-cormorant italic text-sm sm:text-base text-stone-300 leading-relaxed max-w-md mx-auto">
                    is officially enrolled in the first edition archives of <strong className="text-amber-200 font-cinzel">Wilting of Words</strong> by Author Pratyay Saha.
                  </p>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-stone-400">
                    <span>First Edition: 2026</span>
                    <span>Publisher: Technodef</span>
                    <span>ID: WOW-READER-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>

                  <button
                    onClick={() => setShowCertificateModal(false)}
                    className="mt-4 px-6 py-2 rounded-full bg-[#B93826] text-white font-cinzel text-xs font-bold uppercase tracking-wider hover:bg-[#A22B1A] transition-all"
                  >
                    Close Certificate
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step-by-Step Guided Journey Button */}
        {onContinueJourney && (
          <div className="mt-10 sm:mt-14 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: Community Reflections</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
