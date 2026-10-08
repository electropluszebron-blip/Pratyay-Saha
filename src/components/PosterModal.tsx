import React, { useState } from 'react';
import { X, Download, Share2, Sparkles, Check } from 'lucide-react';
import { LiteraryBookCoverPoster } from './LiteraryBookCoverPoster';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Wilting of Words - Official Book Poster',
          text: 'Official literary book-cover poster of Wilting of Words by Pratyay Saha, published by Technodef Press.',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/literary_book_cover.jpg';
    link.download = 'Wilting_of_Words_Literary_Poster.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md select-none overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-[460px] flex flex-col items-center my-auto">
        
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between py-2 mb-2 text-[#FFE58F]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-bodoni text-xs uppercase tracking-[0.25em] text-[#DFBE88]">
              Official Book Poster
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download High-Res Poster"
              className="p-2 rounded-full border border-[#D4AF37]/40 bg-[#16120D] text-[#FFE58F] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShare}
              title="Share Poster"
              className="p-2 rounded-full border border-[#D4AF37]/40 bg-[#16120D] text-[#FFE58F] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 rounded-full border border-stone-700 bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 9:16 Frame */}
        <div className="w-full rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.2)] border border-[#D4AF37]/40">
          <LiteraryBookCoverPoster className="w-full max-h-[82vh]" />
        </div>

        <p className="mt-3 text-[10px] font-bodoni text-[#C5A059]/80 tracking-[0.25em] text-center uppercase">
          Technodef Press &bull; First Edition Official Artwork
        </p>
      </div>
    </div>
  );
};
