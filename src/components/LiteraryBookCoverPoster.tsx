import React from 'react';

interface LiteraryBookCoverPosterProps {
  className?: string;
  onEnter?: () => void;
  showEnterAction?: boolean;
}

export const LiteraryBookCoverPoster: React.FC<LiteraryBookCoverPosterProps> = ({
  className = '',
  onEnter,
  showEnterAction = false,
}) => {
  return (
    <div
      className={`relative w-full h-full max-w-[500px] aspect-[9/16] max-h-[100dvh] mx-auto flex flex-col justify-between overflow-hidden bg-[#070707] text-[#FAF7F2] select-none ${className}`}
      style={{
        boxShadow: '0 0 50px rgba(0,0,0,0.95), 0 0 100px rgba(212, 175, 55, 0.1)',
      }}
    >
      {/* 
        ==================================================================
        CINEMATIC VOLUMETRIC LIGHTING (Upper-Left Ambient Beam)
        Exact match for reference: soft diagonal ray entering from top-left
        ==================================================================
      */}
      <div 
        className="absolute -top-16 -left-16 w-[420px] h-[580px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 75% 85% at 0% 0%, rgba(225, 185, 115, 0.22) 0%, rgba(185, 140, 75, 0.12) 30%, rgba(130, 95, 45, 0.04) 58%, transparent 78%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Secondary Soft Ambient Depth in Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 32%, rgba(220, 180, 100, 0.04) 0%, transparent 65%)'
        }}
      />

      {/* 
        ==================================================================
        TOP SECTION: TOP-RIGHT "— TECHNODEF —"
        Exact match for reference: top right position, thin gold lines
        ==================================================================
      */}
      <div className="relative z-20 w-full pt-8 sm:pt-10 px-7 sm:px-9 flex justify-end items-center">
        <div className="inline-flex items-center gap-2 sm:gap-2.5">
          <span className="w-5 sm:w-7 h-[1px] bg-[#C5A059]/75" />
          <span className="font-bodoni text-[9.5px] sm:text-[11px] font-medium tracking-[0.36em] text-[#D4B07B] uppercase select-none">
            TECHNODEF
          </span>
          <span className="w-5 sm:w-7 h-[1px] bg-[#C5A059]/75" />
        </div>
      </div>

      {/* 
        ==================================================================
        CENTER SECTION: ICON, LITERARY SANCTUARY, TITLE, AUTHOR, DIVIDER
        Symmetrically balanced with generous, elegant negative space
        ==================================================================
      */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 -mt-4 sm:-mt-6">
        
        {/* 1. Rounded-Square Container with Metallic Gold Border & Radiant Glow */}
        <div className="relative group mb-6 sm:mb-7">
          {/* Radiant Soft Outer Warm Glow */}
          <div className="absolute -inset-2.5 rounded-[36px] bg-gradient-to-b from-[#E7C98C]/25 via-[#C5A059]/12 to-transparent blur-md opacity-85" />
          
          <div 
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] sm:rounded-[32px] flex items-center justify-center border border-[#DFBF88]/75 bg-gradient-to-b from-[#14100D] via-[#0C0A08] to-[#070605]"
            style={{
              boxShadow: '0 0 35px rgba(223, 191, 136, 0.24), inset 0 0 18px rgba(223, 191, 136, 0.08)'
            }}
          >
            {/* Minimalist Open-Book Icon in Champagne Gold */}
            <svg 
              viewBox="0 0 54 54" 
              className="w-11 h-11 sm:w-12 sm:h-12 text-[#E2C38E] drop-shadow-[0_0_8px_rgba(226,195,142,0.5)]"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Left Page Arch */}
              <path d="M 10 16 C 17 12.5, 23.5 13.5, 27 17.5 C 23.5 22, 17 21, 10 24.5 Z" fill="rgba(226,195,142,0.05)" />
              {/* Right Page Arch */}
              <path d="M 44 16 C 37 12.5, 30.5 13.5, 27 17.5 C 30.5 22, 37 21, 44 24.5 Z" fill="rgba(226,195,142,0.05)" />
              {/* Full Open Book Wings matching reference */}
              <path d="M 9.5 16.5 C 17 13.2, 23 14.2, 27 18 C 31 14.2, 37 13.2, 44.5 16.5 V 38.5 C 37 35.5, 31 36.5, 27 40 C 23 36.5, 17 35.5, 9.5 38.5 Z" />
              {/* Center Crease / Spine Line */}
              <path d="M 27 18 V 40" strokeWidth="2.2" />
            </svg>
          </div>
        </div>

        {/* 2. Literary Sanctuary Label with Botanical Leaf & Flanking Lines */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 mb-4 sm:mb-5 w-full max-w-[340px]">
          {/* Left Line */}
          <div className="flex-1 h-[1px] bg-gradient-to-l from-[#C5A059]/85 to-transparent" />
          
          <div className="inline-flex items-center gap-2 shrink-0">
            {/* Elegant Botanical Three-Leaf Emblem */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#DFBE88] fill-current drop-shadow-[0_0_4px_rgba(223,190,136,0.4)] shrink-0"
            >
              {/* Center upright petal */}
              <path d="M 12 2.5 C 13.4 6.2, 13.4 11, 12 14.2 C 10.6 11, 10.6 6.2, 12 2.5 Z" />
              {/* Left curving leaf */}
              <path d="M 11 12 C 6.8 11.5, 3.8 14.2, 4.8 17.2 C 7.8 17.8, 10.5 15.2, 11 12 Z" />
              {/* Right curving leaf */}
              <path d="M 13 12 C 17.2 11.5, 20.2 14.2, 19.2 17.2 C 16.2 17.8, 13.5 15.2, 13 12 Z" />
              {/* Base stem */}
              <circle cx="12" cy="18" r="1.1" />
            </svg>
            <span className="font-bodoni text-[10px] sm:text-[11.5px] font-medium tracking-[0.28em] text-[#DFBE88] uppercase select-none">
              LITERARY SANCTUARY
            </span>
          </div>

          {/* Right Line */}
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C5A059]/85 to-transparent" />
        </div>

        {/* 3. Main Title: WILTING OF WORDS */}
        <h1 
          className="font-bodoni text-[28px] sm:text-[35px] md:text-[40px] font-semibold tracking-[0.09em] text-[#EAD8B2] text-center uppercase leading-tight mb-2 sm:mb-2.5 drop-shadow-[0_2px_18px_rgba(234,216,178,0.35)] select-none"
        >
          WILTING OF WORDS
        </h1>

        {/* 4. Author & Publisher Line */}
        <p className="font-cormorant italic text-[14px] sm:text-[16px] tracking-wide text-[#D8C6A5] text-center mb-5 sm:mb-6 select-none">
          Pratyay Saha &bull; Technodef Press
        </p>

        {/* 5. Decorative Ornamental Divider: Line • • • Line */}
        <div className="flex items-center justify-center gap-2.5 w-full max-w-[210px]">
          {/* Left gold line */}
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-l from-[#C5A059]/90 to-transparent" />
          
          {/* Three gold dots: middle dot brighter & larger */}
          <div className="inline-flex items-center gap-1.5 shrink-0 px-1">
            <span className="w-1 h-1 rounded-full bg-[#B8934E]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE8AF] shadow-[0_0_7px_rgba(255,232,175,0.85)]" />
            <span className="w-1 h-1 rounded-full bg-[#B8934E]" />
          </div>

          {/* Right gold line */}
          <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-[#C5A059]/90 to-transparent" />
        </div>

        {/* Optional Action Button */}
        {showEnterAction && onEnter && (
          <div className="mt-7">
            <button
              onClick={onEnter}
              className="px-7 py-2.5 rounded-full border border-[#D4AF37]/60 bg-gradient-to-b from-[#1E1610]/90 to-[#0F0B07]/95 text-[#FFE58F] text-[11px] font-bodoni tracking-[0.25em] uppercase hover:border-[#D4AF37] hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-all duration-300 cursor-pointer"
            >
              Enter Sanctuary &rarr;
            </button>
          </div>
        )}

      </div>

      {/* 
        ==================================================================
        BOTTOM SECTION: DRAMATIC CINEMATIC OPEN BOOK
        Exact match for reference: upper edges/pages visible emerging from darkness,
        sweeping arcs with luminous champagne-gold rim lighting and center glow.
        ==================================================================
      */}
      <div className="relative z-10 w-full h-[180px] sm:h-[225px] shrink-0 mt-auto overflow-hidden">
        
        {/* Soft Golden Crease Glow emanating upward from spine */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-52 sm:w-72 h-36 sm:h-48 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 65% 75% at 50% 92%, rgba(229, 185, 115, 0.45) 0%, rgba(185, 140, 75, 0.18) 45%, transparent 75%)',
          }}
        />

        {/* High-Precision SVG Rendering of Curved Open Book Pages */}
        <svg
          viewBox="0 0 600 240"
          preserveAspectRatio="none"
          className="w-full h-full text-[#DFBF88] drop-shadow-[0_-6px_20px_rgba(223,191,136,0.3)] relative z-10"
        >
          <defs>
            {/* Champagne Gold Gradient for Top Rim of Left Page */}
            <linearGradient id="goldRimLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DFBF88" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#FFF2D6" stopOpacity="1" />
              <stop offset="100%" stopColor="#C5A059" stopOpacity="0.85" />
            </linearGradient>

            {/* Champagne Gold Gradient for Top Rim of Right Page */}
            <linearGradient id="goldRimRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#FFF2D6" stopOpacity="1" />
              <stop offset="100%" stopColor="#DFBF88" stopOpacity="0.95" />
            </linearGradient>

            {/* Deep Dark Warm Charcoal Page Fills */}
            <linearGradient id="pageFillLeft" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#221A13" stopOpacity="0.92" />
              <stop offset="35%" stopColor="#130F0B" stopOpacity="0.97" />
              <stop offset="100%" stopColor="#070707" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="pageFillRight" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#221A13" stopOpacity="0.92" />
              <stop offset="35%" stopColor="#130F0B" stopOpacity="0.97" />
              <stop offset="100%" stopColor="#070707" stopOpacity="1" />
            </linearGradient>

            {/* Multi-page fine leaf lines gradient */}
            <linearGradient id="stackedPages" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#E2C38E" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#C5A059" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Base Page Bodies - Smooth sweeping curves fanning out */}
          <path
            d="M 0 168 Q 140 184 300 220 L 300 240 L 0 240 Z"
            fill="url(#pageFillLeft)"
          />
          <path
            d="M 600 168 Q 460 184 300 220 L 300 240 L 600 240 Z"
            fill="url(#pageFillRight)"
          />

          {/* Secondary Stacked Page Arcs (Faint depth lines underneath) */}
          <path
            d="M -10 192 Q 150 206 300 231"
            fill="none"
            stroke="url(#stackedPages)"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <path
            d="M 610 192 Q 450 206 300 231"
            fill="none"
            stroke="url(#stackedPages)"
            strokeWidth="1.2"
            opacity="0.55"
          />

          <path
            d="M -10 180 Q 150 196 300 226"
            fill="none"
            stroke="url(#stackedPages)"
            strokeWidth="1.4"
            opacity="0.7"
          />
          <path
            d="M 610 180 Q 450 196 300 226"
            fill="none"
            stroke="url(#stackedPages)"
            strokeWidth="1.4"
            opacity="0.7"
          />

          <path
            d="M -10 170 Q 150 187 300 222"
            fill="none"
            stroke="url(#stackedPages)"
            strokeWidth="1.6"
            opacity="0.8"
          />
          <path
            d="M 610 170 Q 450 187 300 222"
            fill="none"
            stroke="url(#stackedPages)"
            strokeWidth="1.6"
            opacity="0.8"
          />

          {/* Primary Top Rim of Open Book (The glowing curved golden edge matching reference) */}
          <path
            d="M -10 160 C 130 175, 220 188, 300 218"
            fill="none"
            stroke="url(#goldRimLeft)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M 610 160 C 470 175, 380 188, 300 218"
            fill="none"
            stroke="url(#goldRimRight)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Ultra-bright golden center crease highlight & spine dip */}
          <ellipse
            cx="300"
            cy="219"
            rx="9"
            ry="3.8"
            fill="#FFF2D6"
            opacity="0.85"
          />

          {/* Deep Spine Crease Line */}
          <path
            d="M 300 218 L 300 240"
            stroke="#120E0A"
            strokeWidth="2"
          />
        </svg>

        {/* Soft Vignette Overlay at very bottom */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#070707] to-transparent pointer-events-none" />
      </div>

    </div>
  );
};
