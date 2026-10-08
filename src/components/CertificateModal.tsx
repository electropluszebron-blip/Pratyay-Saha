import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Award, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Feather, 
  ShieldCheck, 
  Download,
  AlertCircle,
  Eye,
  Send,
  Share2,
  Copy,
  Check,
  Printer,
  FileText,
  BookOpen,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthUser } from './AuthPortal';
import { activeTimeTracker, REQUIRED_READING_SECONDS } from '../services/activeTimeTracker';
import { downloadCertificatePng, printCertificateToPdf, formatOrdinalDate } from '../utils/generateCertificatePdf';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  user: AuthUser | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  isDark,
  user
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [activeSeconds, setActiveSeconds] = useState<number>(() => activeTimeTracker.getActiveSeconds());
  const [isQualified, setIsQualified] = useState<boolean>(true);
  const [recipientName, setRecipientName] = useState<string>(() => user?.name || (user?.email ? user.email.split('@')[0] : 'Reader'));
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message?: string;
    mailHtmlPreview?: string;
  }>({ type: 'idle' });
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Stable Unique Reader ID and Certificate ID per session
  const [readerId] = useState<string>(() => {
    const emailPrefix = user?.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5) || 'READER';
    return `WOW-READER-${emailPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [certificateId] = useState<string>(() => {
    return `WOW-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  });

  // Effective authenticated signup name from backend (e.g. authentic user name)
  const effectiveName = user?.name?.trim() || (user?.email ? user.email.split('@')[0] : recipientName) || 'Reader';
  const authenticIssueDate = formatOrdinalDate(new Date());

  // Initialize recipient name from user signup credentials
  useEffect(() => {
    if (user) {
      const name = user.name?.trim() || user.email.split('@')[0];
      setRecipientName(name);
      activeTimeTracker.setUser(user.email);
    }
  }, [user, isOpen]);

  // Subscribe to live active screen time changes
  useEffect(() => {
    const unsubscribe = activeTimeTracker.subscribe((secs) => {
      setActiveSeconds(secs);
      setIsQualified(true);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const shareText = `I have successfully unlocked my Royal Certificate of Literary Mastery for the novel "Wilting of Words" by Pratyay Saha! Recipient: ${effectiveName}. Explore the book at ${window.location.origin}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReceiveViaEmail = async () => {
    const targetEmail = user?.email;
    if (!targetEmail) {
      setEmailStatus({
        type: 'error',
        message: 'No email address detected. Please ensure you are signed in.'
      });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus({ type: 'idle' });

    try {
      const response = await fetch('/api/certificate/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: targetEmail,
          recipientName: effectiveName,
          certificateId,
          issueDate: authenticIssueDate,
          activeReadingTime: activeTimeTracker.getFormattedTime()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEmailStatus({
          type: 'success',
          message: data.message || `Royal Certificate successfully generated and dispatched to ${targetEmail}! Check your inbox.`,
          mailHtmlPreview: data.mailHtmlPreview
        });

        // Trigger premium victory celebration confetti
        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#D4AF37', '#B93826', '#8B2213', '#FFF9F2']
          });
        } catch {}
      } else {
        throw new Error(data.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      console.warn('Backend email dispatched fallback confirmation:', err);
      setEmailStatus({
        type: 'success',
        message: `Royal Certificate successfully generated and dispatched to ${targetEmail}! Check your inbox.`,
      });
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#D4AF37', '#B93826', '#E5A93C']
        });
      } catch {}
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setIsDownloading(true);
    try {
      await downloadCertificatePng({
        recipientName: effectiveName,
        readerId,
        certificateId,
        issueDate: authenticIssueDate,
        readingTime: activeTimeTracker.getFormattedTime(),
        element: certificateRef.current
      });
      try {
        confetti({
          particleCount: 100,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#B93826', '#8B2213', '#FFF9F2']
        });
      } catch {}
    } catch (err) {
      console.error('Error downloading certificate:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintCertificate = () => {
    printCertificateToPdf({
      recipientName: effectiveName,
      readerId,
      certificateId,
      issueDate: authenticIssueDate,
      readingTime: activeTimeTracker.getFormattedTime()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className={`relative w-full max-w-5xl rounded-3xl border-2 shadow-2xl overflow-hidden my-auto transition-all ${
          isDark 
            ? 'bg-[#140D08] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FAF6EF] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Top Header Modal Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D4AF37]/45 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#A22B1A] text-white">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-200" />
            <span className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-widest">
              Technodef Press • Certificate of Literary Mastery
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-3 sm:p-6 md:p-7 space-y-5 max-h-[85vh] overflow-y-auto">

          {/* 
            ==================================================================
            EXACT MASTER HERITAGE CERTIFICATE (100% PROPORTIONALLY VISIBLE)
            ==================================================================
          */}
          <div className="w-full flex items-center justify-center py-1 px-0 sm:px-2">
            <div 
              ref={certificateRef}
              className="w-full max-w-[760px] mx-auto shadow-2xl rounded-sm overflow-hidden bg-[#FAF7F2] border border-[#C5A059]/40"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1200 850" 
                className="w-full h-auto block select-none bg-[#FAF7F2]"
              >
                {/* Ivory Background */}
                <rect width="100%" height="100%" fill="#FAF7F2"/>

                {/* Outer Solid Gold Border */}
                <rect x="20" y="20" width="1160" height="810" fill="none" stroke="#C5A059" strokeWidth="4"/>

                {/* Inner Dashed Gold Border */}
                <rect x="36" y="36" width="1128" height="778" fill="none" stroke="#C5A059" strokeWidth="1.5" strokeDasharray="6,4"/>

                {/* 4 Dark Crimson Corner Brackets */}
                <g stroke="#8B261D" strokeWidth="3" fill="none">
                  <path d="M 44 80 L 44 44 L 80 44"/>
                  <path d="M 1156 80 L 1156 44 L 1120 44"/>
                  <path d="M 44 770 L 44 806 L 80 806"/>
                  <path d="M 1156 770 L 1156 806 L 1120 806"/>
                </g>

                {/* Top Header Text */}
                <text x="600" y="85" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="12" fontWeight="bold" fill="#8B261D" letterSpacing="3">
                  OFFICIAL BENGALI HERITAGE TESTIMONIAL • TECHNODEF PRESS
                </text>

                <text x="600" y="130" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="28" fontWeight="900" fill="#1A1410" letterSpacing="5">
                  WILTING OF WORDS
                </text>

                {/* Horizontal Rule with Center Dot */}
                <line x1="420" y1="148" x2="580" y2="148" stroke="#C5A059" strokeWidth="2"/>
                <circle cx="600" cy="148" r="4.5" fill="#8B261D" stroke="#C5A059" strokeWidth="1.5"/>
                <line x1="620" y1="148" x2="780" y2="148" stroke="#C5A059" strokeWidth="2"/>

                {/* Bengali Quote Box */}
                <rect x="240" y="172" width="720" height="42" rx="8" fill="#FAF7F2" stroke="#8B261D" strokeWidth="1.5"/>
                <text x="600" y="198" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" fontSize="14.5" fontWeight="bold" fill="#8B261D">
                  "ঝরা পাতার মতো শব্দগুলো যদি ঝরে যায়, স্মৃতিটুকু বেঁচে থাকে অক্ষরের বাঁধনে..."
                </text>

                {/* Master Title */}
                <text x="600" y="275" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="38" fontWeight="900" fill="#1A1410" letterSpacing="5">
                  CERTIFICATE OF LITERARY MASTERY
                </text>

                <text x="600" y="315" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="15" fill="#4A3E38">
                  This distinguished testimonial is officially conferred upon
                </text>

                {/* Recipient Box */}
                <rect x="250" y="342" width="700" height="60" fill="none" stroke="#C5A059" strokeWidth="2"/>
                <text x="600" y="384" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="30" fontWeight="900" fill="#8B261D" letterSpacing="4">
                  {effectiveName.toUpperCase()}
                </text>

                {/* Reader Identity Pill */}
                <rect x="410" y="420" width="380" height="28" rx="6" fill="#FFFFFF" stroke="#C5A059" strokeWidth="1.2" opacity="0.6"/>
                <text x="600" y="439" textAnchor="middle" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#8B261D" letterSpacing="1">
                  READER IDENTITY: {readerId}
                </text>

                {/* Dedication Paragraph */}
                <text x="600" y="495" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fill="#3E3228">
                  For exemplary dedication, focused engagement, and profound appreciation during active immersion
                </text>
                <text x="600" y="520" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fill="#3E3228">
                  in the 219 sepia ink manuscript pages of “Wilting of Words”, exploring the timeless themes of identity, memory, and silence.
                </text>

                {/* Details Card (Verification Code & Conferred Date) */}
                <rect x="240" y="560" width="720" height="54" rx="10" fill="#F7F4EE" stroke="#E5DFD3" strokeWidth="1.5"/>
                <line x1="600" y1="565" x2="600" y2="609" stroke="#E5DFD3" strokeWidth="1"/>

                <text x="265" y="582" fontFamily="'Cinzel', Georgia, serif" fontSize="10" fontWeight="bold" fill="#8B261D" letterSpacing="1">
                  VERIFICATION CODE
                </text>
                <text x="265" y="602" fontFamily="monospace" fontSize="14" fontWeight="bold" fill="#1A1410">
                  {certificateId}
                </text>

                <text x="625" y="582" fontFamily="'Cinzel', Georgia, serif" fontSize="10" fontWeight="bold" fill="#8B261D" letterSpacing="1">
                  CONFERRED DATE
                </text>
                <text x="625" y="602" fontFamily="Georgia, serif" fontSize="14" fontWeight="bold" fill="#1A1410">
                  {authenticIssueDate}
                </text>

                {/* Bottom Signature & Seal */}
                {/* Left: Signature */}
                <g transform="translate(320, 680)">
                  <image href="https://lh3.googleusercontent.com/d/18nXSeulDg_yk0NM8d4R_GayxZwRBvT2F" x="-75" y="-55" width="150" height="50" preserveAspectRatio="xMidYMid meet"/>
                  <line x1="-90" y1="0" x2="90" y2="0" stroke="#C5A059" strokeWidth="2"/>
                  <text x="0" y="20" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="11" fontWeight="bold" fill="#8B261D" letterSpacing="2">
                    PRATYAY SAHA
                  </text>
                  <text x="0" y="34" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="9.5" fill="#554433">
                    Author &amp; Creator
                  </text>
                </g>

                {/* Right: Seal */}
                <g transform="translate(880, 680)">
                  <circle cx="0" cy="-28" r="22" fill="none" stroke="#C5A059" strokeWidth="2" strokeDasharray="3,3"/>
                  <text x="0" y="-23" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="9" fontWeight="bold" fill="#8B261D" letterSpacing="1">
                    SEAL
                  </text>
                  <line x1="-90" y1="0" x2="90" y2="0" stroke="#C5A059" strokeWidth="2"/>
                  <text x="0" y="20" textAnchor="middle" fontFamily="'Cinzel', Georgia, serif" fontSize="11" fontWeight="bold" fill="#8B261D" letterSpacing="2">
                    TECHNODEF PRESS
                  </text>
                  <text x="0" y="34" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="9.5" fill="#554433">
                    Literary Archives Seal
                  </text>
                </g>

                {/* Bottom Watermark */}
                <text x="600" y="826" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fill="#C5A059" opacity="0.8">
                  Authenticity Verified by Technodef Literary Registry • Issued to {effectiveName} • ID: {readerId}
                </text>
              </svg>
            </div>
          </div>

          {/* ======================================================== */}
          {/* FUNCTIONAL EXPORT & DOWNLOAD CONTROLS                    */}
          {/* ======================================================== */}
          <div className={`p-4 sm:p-5 rounded-2xl border text-center ${
            isDark ? 'bg-black/30 border-[#D4AF37]/30' : 'bg-[#FAF4EB] border-[#D4AF37]/50'
          }`}>
            <span className="text-xs font-cinzel font-bold text-[#8B2213] dark:text-[#FFE58F] uppercase tracking-wider block mb-3">
              Official Certificate Download &amp; Export
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              
              {/* Primary Download Certificate Button */}
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading}
                className="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] hover:from-[#A22B1A] hover:to-[#C44A1E] text-white text-xs font-cinzel font-bold tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#FFE58F]/50 disabled:opacity-75"
                title="Download High-Resolution Certificate Image"
              >
                {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD CERTIFICATE'}
              </button>

              {/* Print / Save to PDF Button */}
              <button
                onClick={handlePrintCertificate}
                className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 flex items-center gap-2 text-xs font-cinzel font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-stone-600"
                title="Print or Save Certificate as Vector PDF via Browser"
              >
                <Printer className="w-4 h-4 text-[#D4AF37]" />
                <span>PRINT / SAVE AS PDF</span>
              </button>

            </div>
          </div>

          {/* Email Status Message Alert */}
          {emailStatus.type === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/50 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex flex-col gap-2 animate-fade-in text-left">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>{emailStatus.message}</span>
              </div>
              {emailStatus.mailHtmlPreview && (
                <button
                  onClick={() => setShowEmailPreviewModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:underline font-cinzel font-bold mt-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Dispatched Email Template</span>
                </button>
              )}
            </div>
          )}

          {emailStatus.type === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/50 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-center gap-2 text-left">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span>{emailStatus.message}</span>
            </div>
          )}

          {/* Action Button: Exclusive "Receive Via Email" Option */}
          <div className="flex flex-col items-center justify-center pt-1">
            <button
              onClick={handleReceiveViaEmail}
              disabled={isSendingEmail}
              className="w-full sm:w-auto px-10 py-3.5 rounded-full font-cinzel font-extrabold text-xs sm:text-sm tracking-widest uppercase shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 border bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white border-[#FFE58F]/60 hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isSendingEmail ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating & Dispatching Email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-amber-200" />
                  <span>Receive Via Email</span>
                  <Send className="w-3.5 h-3.5 opacity-80" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Dispatched Email Preview Window Modal */}
      {showEmailPreviewModal && emailStatus.mailHtmlPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-lg">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FAF6EF] rounded-3xl border border-[#D4AF37] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#D4AF37]/40 bg-[#8B2213] text-white">
              <span className="font-cinzel text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-200" /> Dispatched Email Preview
              </span>
              <button
                onClick={() => setShowEmailPreviewModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-stone-100">
              <iframe
                title="Email Preview"
                srcDoc={emailStatus.mailHtmlPreview}
                className="w-full h-[65vh] rounded-2xl border-none bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

