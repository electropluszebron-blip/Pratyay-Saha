import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Info, 
  BookOpen, 
  Sparkles, 
  Feather, 
  Award, 
  CheckCircle2, 
  Lock
} from 'lucide-react';

interface LegalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  initialTab?: 'terms' | 'privacy' | 'info';
}

export const LegalInfoModal: React.FC<LegalInfoModalProps> = ({
  isOpen,
  onClose,
  isDark,
  initialTab = 'info'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'info'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-3xl rounded-3xl border-2 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[88vh] transition-all ${
          isDark 
            ? 'bg-[#18110C] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              {activeTab === 'terms' && <FileText className="w-4 h-4 text-amber-200" />}
              {activeTab === 'privacy' && <ShieldCheck className="w-4 h-4 text-amber-200" />}
              {activeTab === 'info' && <Info className="w-4 h-4 text-amber-200" />}
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-100">
                {activeTab === 'terms' && 'Terms of Service'}
                {activeTab === 'privacy' && 'Privacy & Sanctuary Policy'}
                {activeTab === 'info' && 'About Wilting of Words'}
              </h3>
              <p className="text-[10px] font-serif italic text-amber-200/80">
                Technodef Press Official Archives &amp; Standards
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#D4AF37]/30 bg-[#8B2213]/5 text-xs font-cinzel font-bold">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#B93826] text-[#B93826] dark:text-[#FFE58F] bg-white/40 dark:bg-black/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Website</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#B93826] text-[#B93826] dark:text-[#FFE58F] bg-white/40 dark:bg-black/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#B93826] text-[#B93826] dark:text-[#FFE58F] bg-white/40 dark:bg-black/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 font-serif text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          
          {/* TAB 1: ABOUT WEBSITE & MANUSCRIPT */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-[#D4AF37]/40 text-stone-800 dark:text-stone-200">
                <h4 className="font-cinzel font-bold text-sm sm:text-base text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  The Digital Literary Sanctuary of Wilting of Words
                </h4>
                <p>
                  This portal is the official digital sanctum created for author <strong>Pratyay Saha's</strong> celebrated novel, <em>“Wilting of Words”</em>, published under <strong>Technodef Press</strong>.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1.5">
                  1. The 219 Original Manuscript Pages
                </h5>
                <p>
                  Every individual page of the novel has been digitized in crisp, high-resolution WebP format directly from the author's manuscripts. Readers can navigate all 219 pages with butter-smooth 3D leaf transitions, audio paper rustle synthesis, margin annotations, and instant concordance search.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1.5">
                  2. Cultural &amp; Art Integration
                </h5>
                <p>
                  Designed with deep reverence for Indian cultural aesthetics, terracotta motifs of Chakdaha, Nadia district, West Bengal, classical alpona borders, and ancient royal typography. The ambient soundscape is driven by Web Audio synthesis of traditional Indian bamboo flute raags.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1.5">
                  3. The Royal Certificate of Literary Mastery
                </h5>
                <p>
                  To encourage authentic, focused reading and honor the author's work, the Certificate of Literary Mastery is conferred only after completing 30 minutes of foreground reading inside the E-Reader. It bears author Pratyay Saha's seal and is fully verifiable.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-300 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400">
                All rights reserved &copy; 2026 Pratyay Saha &amp; Technodef Press. Published under registered catalog archives.
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  1. Acceptance of Terms
                </h5>
                <p>
                  By accessing and exploring the Wilting of Words Digital Sanctuary, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please discontinue use of the sanctuary.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  2. Intellectual Property Rights
                </h5>
                <p>
                  The novel <em>“Wilting of Words”</em>, including all text, digitized manuscript pages, character names (Aratrika, Krittika, Prangik, Mr. &amp; Mrs. Saha), cover illustrations, and author notes, are the exclusive intellectual property of <strong>Pratyay Saha</strong> and <strong>Technodef Press</strong>. Unauthorized reproduction, distribution, scraping, commercial sale, or redistribution is strictly prohibited under international copyright laws.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  3. Reader Reflections &amp; Community Guidelines
                </h5>
                <p>
                  Readers are invited to submit authentic reviews and critical impressions. Submissions must not contain vulgar slangs, hate speech, abusive language, or fraudulent claims. Seraph AI moderates submissions to preserve community sanctuary standards while welcoming both positive and negative critical opinions.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  4. Certificate Issuance Criteria
                </h5>
                <p>
                  The Royal Certificate of Literary Mastery requires a verified minimum of 30 minutes active reading within the E-Reader Cabinet. Bypassing or attempting to alter the reading chronometer constitutes a breach of sanctuary integrity.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 font-cinzel font-bold uppercase mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sanctuary Privacy Guarantee</span>
                </div>
                We believe your reading journey is sacred. We never sell your data, display third-party advertisements, or track you across the web.
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  1. Information We Store
                </h5>
                <p>
                  When you sign in or read on the platform, we store minimal necessary data: your email address, profile name, active reading chronometer seconds, bookmarks, and page annotations. This data is used solely to synchronize your reading progress across your devices.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  2. Local Storage &amp; Cloud Security
                </h5>
                <p>
                  Reading progress and audio preferences are cached in your browser's local storage and encrypted in Google Cloud Firestore for authenticated users. All communication with our servers is secured with industry-standard TLS encryption.
                </p>
              </div>

              <div>
                <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-1">
                  3. Right to Account Deletion via Email OTP
                </h5>
                <p>
                  You possess the complete, unconditional right to delete your account and erase all associated reading data at any time. Account deletion requires two-factor email OTP verification to prevent accidental removal, instantly scrubbing your records permanently from our systems.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
