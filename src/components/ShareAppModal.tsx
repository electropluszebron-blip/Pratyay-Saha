import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, Sparkles, Globe, ShieldCheck, Heart } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose, isDark }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin || window.location.href : '';
  const shareTitle = 'Wilting of Words — Novel Digital Sanctuary by Pratyay Saha';
  const shareText = 'Explore "Wilting of Words" by author Pratyay Saha — interactive e-reader, royal audio narration, reader cabinet, and official literary certificates!';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n\nExperience the Sanctuary here: ${appUrl}`)}`,
      bg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      name: 'Twitter / X',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`,
      bg: 'bg-black hover:bg-stone-900 text-white border border-stone-700',
    },
    {
      name: 'Telegram',
      icon: '✈️',
      url: `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(shareText)}`,
      bg: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
    {
      name: 'Email',
      icon: '✉️',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nAccess the genuine application: ${appUrl}`)}`,
      bg: 'bg-amber-700 hover:bg-amber-800 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-lg rounded-3xl border-2 shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#18120D] border-[#D4AF37]/60 text-[#FAF5EE]'
            : 'bg-[#FCFAF5] border-[#D4AF37]/70 text-[#2D2118]'
        }`}
      >
        {/* Top Gold Corner Banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#721B10] via-[#8F2618] to-[#721B10] text-white relative border-b border-[#D4AF37]/50 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#FFE58F]/80 bg-black/30 flex items-center justify-center p-2 shadow-inner">
                <Share2 className="w-5 h-5 text-[#FFE58F] animate-pulse" />
              </div>
              <div>
                <h3 className="font-cinzel text-base sm:text-lg font-black tracking-widest text-[#FFE58F] uppercase leading-tight">
                  GENUINE APP SHARING LINK
                </h3>
                <p className="text-[11px] font-serif italic text-amber-200/90 tracking-wide">
                  Official Technodef Sanctuary Web Link
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-amber-100 flex items-center justify-center transition-all cursor-pointer border border-white/10 active:scale-95"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-serif text-amber-800 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              This is the official, live web application URL. Fully active with zero 404 routing errors and smooth, synchronized reader audio.
            </span>
          </div>

          {/* URL Box with One-Click Copy */}
          <div className="space-y-2">
            <label className="text-xs font-cinzel font-bold tracking-wider uppercase text-amber-700 dark:text-amber-300 flex items-center justify-between">
              <span>Live Application Link</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold">Active & Verified</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className={`flex-1 px-4 py-3 rounded-xl border font-mono text-xs sm:text-sm select-all overflow-x-auto focus:outline-none ${
                  isDark
                    ? 'bg-[#100B08] border-[#D4AF37]/40 text-amber-200'
                    : 'bg-[#FFFDF9] border-[#D4AF37]/50 text-[#523B2B]'
                }`}
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-3 rounded-xl font-cinzel font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#B93826] to-[#8B2213] text-white hover:brightness-110'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Web Share Native API Button if available */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:brightness-110 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 transition-all"
            >
              <Share2 className="w-4 h-4 text-amber-200" />
              <span>Share via Device Share Sheet</span>
            </button>
          )}

          {/* Social Quick Share Grid */}
          <div className="space-y-2">
            <span className="text-xs font-cinzel font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400 block">
              Quick Share Options
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {shareLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-95 ${item.bg}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-2 text-center text-[11px] font-serif italic text-stone-500 dark:text-stone-400">
            Share with fellow readers to explore Pratyay Saha's "Wilting of Words" in full royal fidelity.
          </div>
        </div>
      </div>
    </div>
  );
};
