import React, { useState, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { NOVEL_META } from '../data/bookData';

interface Proper3DBookProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showExploreHUD?: boolean;
  className?: string;
}

export const Proper3DBook: React.FC<Proper3DBookProps> = ({
  size = 'md',
  onClick,
  showExploreHUD = true,
  className = ''
}) => {
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 8, y: -24 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scaled dimensions for realistic book proportions (width:height ~ 1:1.45, spine ~ 28px)
  const config = {
    sm: {
      width: 'w-[165px] sm:w-[185px]',
      height: 'h-[245px] sm:h-[275px]',
      spineW: 24,
      depth: 26,
      overhang: 3
    },
    md: {
      width: 'w-[195px] sm:w-[225px] md:w-[240px]',
      height: 'h-[290px] sm:h-[335px] md:h-[355px]',
      spineW: 28,
      depth: 30,
      overhang: 3.5
    },
    lg: {
      width: 'w-[225px] sm:w-[265px] md:w-[285px]',
      height: 'h-[335px] sm:h-[395px] md:h-[425px]',
      spineW: 32,
      depth: 34,
      overhang: 4
    }
  }[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // 0 to width
    const y = e.clientY - rect.top;  // 0 to height
    const percentX = (x / rect.width) * 2 - 1; // -1 to 1
    const percentY = (y / rect.height) * 2 - 1; // -1 to 1

    // Smooth subtle tilt
    setRotate({
      x: 6 - percentY * 12,
      y: -22 + percentX * 24
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 8, y: -24 });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block select-none cursor-pointer group [perspective:1400px] ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label="3D Hardcover Book: Wilting of Words by Pratyay Saha"
    >
      {/* 
        =========================================================
        NATURAL AMBIENT CONTACT DROP SHADOWS UNDERNEATH BOOK
        =========================================================
      */}
      <div 
        className="absolute -bottom-7 left-[8%] w-[84%] h-7 bg-black/70 rounded-[100%] blur-xl transition-all duration-500 ease-out group-hover:scale-105 group-hover:bg-black/85 group-hover:blur-2xl pointer-events-none"
      />
      <div 
        className="absolute -bottom-4 left-[20%] w-[60%] h-3.5 bg-[#8B2213]/30 rounded-[100%] blur-md transition-all duration-500 pointer-events-none"
      />

      {/* 
        =========================================================
        MAIN 3D BOOK ENCLOSURE
        =========================================================
      */}
      <div 
        className={`relative ${config.width} ${config.height} [transform-style:preserve-3d] transition-transform duration-300 ease-out`}
        style={{
          transform: `rotateY(${rotate.y}deg) rotateX(${rotate.x}deg) rotateZ(-1deg) ${isHovered ? 'translateY(-6px)' : ''}`
        }}
      >
        {/* ========================================================= */}
        {/* 1. FRONT COVER BOARD (Hardcover with realistic overhang)  */}
        {/* ========================================================= */}
        <div 
          className="absolute inset-0 rounded-r-md overflow-hidden bg-[#0c0907] border-t border-r border-b border-[#D4AF37]/50 shadow-[12px_16px_40px_rgba(0,0,0,0.85)] [backface-visibility:hidden] z-30"
          style={{ transform: 'translateZ(0px)' }}
        >
          {/* Main Book Cover Artwork */}
          <img
            src="/cover.webp"
            alt="Wilting of Words - Hardcover Edition"
            className="w-full h-full object-cover select-none block"
            loading="eager"
          />

          {/* Hardcover Left Hinge Groove / Embossed French Seam (Essential for real book look) */}
          <div className="absolute top-0 bottom-0 left-[18px] w-[6px] bg-gradient-to-r from-black/75 via-black/25 to-white/25 pointer-events-none shadow-[inset_1px_0_3px_rgba(0,0,0,0.9),inset_-1px_0_2px_rgba(255,255,255,0.4)] z-40" />
          
          {/* Left Spine Wrap Shadow */}
          <div className="absolute top-0 bottom-0 left-0 w-[18px] bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none z-30" />

          {/* Metallic Gold Corner Protectors on Top-Right & Bottom-Right */}
          <div className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-bl from-[#FFE58F] via-[#D4AF37] to-amber-900 shadow-xs pointer-events-none z-40 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-85" />
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tl from-[#FFE58F] via-[#D4AF37] to-amber-900 shadow-xs pointer-events-none z-40 [clip-path:polygon(100%_100%,0_100%,100%_0)] opacity-85" />

          {/* Hardcover Gloss / Dynamic Light Sheen */}
          <div 
            className="absolute inset-0 opacity-55 group-hover:opacity-85 transition-opacity duration-500 pointer-events-none z-30" 
            style={{
              background: 'linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.20) 42%, rgba(255,255,255,0) 62%)'
            }}
          />

          {/* Beveled Top & Right Hardcover Edges */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-white/35 via-white/15 to-transparent pointer-events-none z-40" />
          <div className="absolute top-0 bottom-0 right-0 w-[1.5px] bg-gradient-to-b from-white/45 via-white/10 to-black/50 pointer-events-none z-40" />

          {/* Explore HUD Overlay on Hover */}
          {showExploreHUD && (
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-3 z-50 backdrop-blur-[1px]">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D4AF37] text-white text-[11px] font-cinzel font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xl scale-95 group-hover:scale-105 transition-transform duration-300 border border-white/50">
                <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                <span>Read Novel</span>
              </div>
              <span className="text-[10px] font-serif italic text-amber-200 mt-2 text-center drop-shadow-md">
                219 Pages &bull; Tap to Open E-Book
              </span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. REALISTIC CURVED SPINE (Left 3D Curvature & Ribs)      */}
        {/* ========================================================= */}
        <div 
          className="absolute top-0 bottom-0 left-0 origin-left [transform:rotateY(-90deg)] [transform-style:preserve-3d] z-20 overflow-hidden shadow-[inset_0_0_14px_rgba(0,0,0,0.95)] border-r border-[#D4AF37]/50 rounded-l-xs"
          style={{
            width: `${config.spineW}px`,
            transform: `rotateY(-90deg) translateX(-${config.spineW}px)`
          }}
        >
          {/* Rich Leather / Cloth Spine Texture */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-[#24130b] to-black/70" />
          
          {/* Embossed Raised Spine Bands (Headband, Center Ribs & Tailband) */}
          <div className="absolute top-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-85" />
          <div className="absolute top-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFE58F] to-transparent opacity-65" />
          
          <div className="absolute top-1/4 left-0 right-0 h-[1.5px] bg-[#D4AF37]/40" />
          <div className="absolute top-3/4 left-0 right-0 h-[1.5px] bg-[#D4AF37]/40" />

          <div className="absolute bottom-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-85" />
          <div className="absolute bottom-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFE58F] to-transparent opacity-65" />

          {/* Vertical Spine Title & Author Stamped in Foil Gold */}
          <div className="relative h-full w-full flex flex-col justify-between py-6 items-center select-none text-[8px] font-cinzel tracking-[0.2em] uppercase leading-none [writing-mode:vertical-rl] rotate-180">
            <span className="text-[#E5A93C] font-bold text-[7.5px] tracking-widest drop-shadow-sm">
              {NOVEL_META.authorName}
            </span>
            <span className="font-extrabold text-white text-[9px] tracking-[0.22em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              WILTING OF WORDS
            </span>
            <span className="text-[#D4AF37]/90 text-[7px] tracking-widest">
              TECHNODEF
            </span>
          </div>

          {/* 3D Cylindrical Highlight */}
          <div className="absolute top-0 bottom-0 left-[28%] w-[38%] bg-white/15 pointer-events-none blur-[1px]" />
        </div>

        {/* ========================================================= */}
        {/* 3. REALISTIC FORE-EDGE PAGES BLOCK (Right side thickness) */}
        {/* ========================================================= */}
        <div 
          className="absolute top-[3px] bottom-[3px] right-0 bg-[#F4ECD8] origin-right [transform:rotateY(90deg)] [transform-style:preserve-3d] z-20 shadow-[inset_0_0_10px_rgba(0,0,0,0.4)] border-l border-amber-900/30"
          style={{
            width: `${config.depth - 2}px`
          }}
        >
          {/* Fine Paper Leaf Deckle Lines */}
          <div 
            className="w-full h-full opacity-65"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.5px, #C4B59D 1.5px, #C4B59D 2.5px, #DFD4BE 2.5px, #DFD4BE 4px)'
            }}
          />
          {/* Fore-edge shadow gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20 pointer-events-none" />
          
          {/* Silk Ribbon Bookmark Tail */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[7px] h-7 bg-[#8B2213] rounded-b-xs shadow-md border-t border-amber-300/40" />
        </div>

        {/* ========================================================= */}
        {/* 4. TOP & BOTTOM INNER PAGES BLOCK                         */}
        {/* ========================================================= */}
        {/* Top Edge */}
        <div 
          className="absolute left-[3px] right-[3px] top-0 bg-[#EFE7D2] origin-top [transform:rotateX(90deg)] [transform-style:preserve-3d] z-20 shadow-[inset_0_0_8px_rgba(0,0,0,0.35)]"
          style={{ height: `${config.depth - 2}px` }}
        >
          <div 
            className="w-full h-full opacity-55"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1.5px, #C4B59D 1.5px, #C4B59D 2.5px)'
            }}
          />
        </div>

        {/* Bottom Edge */}
        <div 
          className="absolute left-[3px] right-[3px] bottom-0 bg-[#E2D8C0] origin-bottom [transform:rotateX(-90deg)] [transform-style:preserve-3d] z-20 shadow-[inset_0_0_8px_rgba(0,0,0,0.45)]"
          style={{ height: `${config.depth - 2}px` }}
        >
          <div 
            className="w-full h-full opacity-55"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1.5px, #C4B59D 1.5px, #C4B59D 2.5px)'
            }}
          />
        </div>

        {/* ========================================================= */}
        {/* 5. BACK COVER BOARD (Underneath page block)               */}
        {/* ========================================================= */}
        <div 
          className="absolute inset-0 rounded-r-md bg-[#160E0A] z-10 border border-[#D4AF37]/35 shadow-[0_22px_45px_rgba(0,0,0,0.9)]"
          style={{
            transform: `translateZ(-${config.depth}px)`
          }}
        />

      </div>
    </div>
  );
};
