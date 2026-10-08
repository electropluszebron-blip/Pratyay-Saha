import React, { useState } from 'react';
import { audioSynth } from '../services/audioSynth';
import { X, Calendar, Menu, ArrowRight } from 'lucide-react';

interface EntranceGateProps {
  onEnter: () => void;
}

export const EntranceGate: React.FC<EntranceGateProps> = ({ onEnter }) => {
  const [isFading, setIsFading] = useState<boolean>(false);
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);

  const handleEnter = () => {
    try {
      audioSynth.playNow();
    } catch (e) {
      console.warn('Audio playback notice:', e);
    }

    setIsFading(true);
    // Proceed to Step 3: Existing Verification Page
    setTimeout(() => {
      onEnter();
    }, 280);
  };

  return (
    <div
      className={`fixed inset-0 w-full h-full z-[90] flex flex-col bg-[#FAF7F2] text-[#1A1614] overflow-y-auto overflow-x-hidden select-none transition-opacity duration-300 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(ellipse 90% 60% at 75% 20%, rgba(245, 237, 224, 0.7) 0%, rgba(250, 247, 242, 0.95) 70%),
          radial-gradient(ellipse 50% 40% at 20% 80%, rgba(243, 232, 217, 0.45) 0%, transparent 60%)
        `
      }}
    >
      {/* ========================================================= */}
      {/* 1. TOP EDITORIAL NAVIGATION BAR                           */}
      {/* ========================================================= */}
      <header className="w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pt-6 sm:pt-8 pb-4 flex items-center justify-between z-20 relative">
        {/* Left: Lotus Icon + Brand Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Delicate Line-Art Lotus Blossom SVG */}
          <svg 
            className="w-7 h-7 sm:w-8 sm:h-8 text-[#8A6B47] shrink-0" 
            viewBox="0 0 48 48" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.6"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Center petal */}
            <path d="M24 8 C22 17, 22 25, 24 34 C26 25, 26 17, 24 8 Z" />
            {/* Inner left petal */}
            <path d="M24 16 C18 20, 15 27, 20 33 C22 31, 23 27, 24 22" />
            {/* Inner right petal */}
            <path d="M24 16 C30 20, 33 27, 28 33 C26 31, 25 27, 24 22" />
            {/* Outer left petal */}
            <path d="M20 25 C12 26, 8 32, 13 36 C16 35, 19 33, 22 30" />
            {/* Outer right petal */}
            <path d="M28 25 C36 26, 40 32, 35 36 C32 35, 29 33, 26 30" />
            {/* Base water line */}
            <path d="M16 38 C20 39.5, 28 39.5, 32 38" />
          </svg>
          <span className="font-bodoni tracking-[0.22em] text-xs sm:text-sm font-semibold uppercase text-[#1A1614]">
            Wilting of Words
          </span>
        </div>

        {/* Center: Editorial Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-9 font-sans text-[11px] tracking-[0.2em] uppercase text-[#4A3E36]">
          <span className="text-[#1A1614] font-semibold pb-1 border-b border-[#1A1614] cursor-default">
            Home
          </span>
          <button
            onClick={() => setShowAboutModal(true)}
            className="hover:text-[#1A1614] transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => setShowContactModal(true)}
            className="hover:text-[#1A1614] transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right: Literary Tagline (Desktop) */}
        <div className="hidden lg:block text-right">
          <span className="font-sans text-[10.5px] uppercase tracking-[0.2em] text-[#7C5835] font-medium">
            A book that heals, inspires, and stays.
          </span>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setShowMobileNav(!showMobileNav)}
          className="md:hidden p-2 text-[#1A1614] hover:text-[#8A6B47] transition-colors focus:outline-none"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 stroke-[1.8]" />
        </button>
      </header>

      {/* Mobile Navigation Dropdown */}
      {showMobileNav && (
        <div className="md:hidden bg-[#F6F1E8] border-b border-[#E8DFC8] px-6 py-4 space-y-3 font-sans text-xs uppercase tracking-[0.18em] text-[#4A3E36] z-30">
          <div className="font-semibold text-[#1A1614]">Home</div>
          <button
            onClick={() => { setShowAboutModal(true); setShowMobileNav(false); }}
            className="block text-left w-full hover:text-[#1A1614]"
          >
            About
          </button>
          <button
            onClick={() => { setShowContactModal(true); setShowMobileNav(false); }}
            className="block text-left w-full hover:text-[#1A1614]"
          >
            Contact
          </button>
          <div className="pt-2 text-[10px] tracking-wider text-[#8A6B47] normal-case italic border-t border-[#E8DFC8]/60">
            "A book that heals, inspires, and stays."
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN EDITORIAL HERO CONTENT                            */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col justify-center py-6 sm:py-10 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Editorial Typography & Call To Action */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left order-1">
            
            {/* Botanical 3-Leaf Sprout Motif */}
            <div className="mb-4 sm:mb-6 text-[#8A6B47]">
              <svg 
                className="w-6 h-6 sm:w-7 sm:h-7" 
                viewBox="0 0 28 28" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.6"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Center upright sprout leaf */}
                <path d="M14 6 C13 11, 13 16, 14 22 C15 16, 15 11, 14 6 Z" />
                {/* Left graceful curved leaf */}
                <path d="M14 13 C9 14, 6 18, 9 22 C11 20, 13 17, 14 15" />
                {/* Right graceful curved leaf */}
                <path d="M14 13 C19 14, 22 18, 19 22 C17 20, 15 17, 14 15" />
              </svg>
            </div>

            {/* Grand Editorial Staggered Title */}
            <h1 className="font-bodoni font-normal tracking-[0.03em] uppercase text-[#1A1614] leading-[0.92] select-none">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[78px] font-normal">
                WILTING
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl italic font-cormorant font-normal text-[#5A4A3E] my-1 sm:my-2 tracking-[0.08em] lowercase">
                of
              </span>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[78px] font-normal">
                WORDS
              </span>
            </h1>

            {/* Subtitle / Poetic Tagline */}
            <p className="mt-5 sm:mt-6 font-cormorant italic text-base sm:text-lg md:text-[20px] text-[#4A3E36] max-w-md leading-relaxed font-normal">
              &ldquo;Some voices are silenced in life, but their words live louder than ever.&rdquo;
            </p>

            {/* Hardcover Book Mockup on Mobile (Positioned in natural reading order) */}
            <div className="w-full flex justify-center my-7 lg:hidden order-3">
              <div className="relative w-[220px] sm:w-[260px] aspect-[1/1.45] select-none">
                {/* Realistic Contact Shadow Under Book */}
                <div 
                  className="absolute -bottom-6 left-[6%] w-[88%] h-8 bg-[#2A2018]/35 rounded-[100%] blur-xl pointer-events-none"
                />
                
                {/* Book Assembly */}
                <div 
                  className="relative w-full h-full flex [perspective:1200px]"
                  style={{
                    filter: 'drop-shadow(0 16px 28px rgba(35, 25, 18, 0.22)) drop-shadow(0 4px 10px rgba(35, 25, 18, 0.15))'
                  }}
                >
                  {/* Spine Face */}
                  <div 
                    className="w-[28px] sm:w-[32px] h-full bg-[#110D0A] rounded-l-[3px] border-l border-t border-b border-[#3D2D1E] relative overflow-hidden shrink-0 flex items-center justify-center shadow-[-3px_0_8px_rgba(0,0,0,0.5)]"
                    style={{
                      background: 'linear-gradient(90deg, #1A1410 0%, #0A0806 35%, #18120E 80%, #0D0907 100%)'
                    }}
                  >
                    {/* Spine embossed vertical text */}
                    <div 
                      className="whitespace-nowrap font-bodoni text-[7.5px] sm:text-[9px] font-bold tracking-[0.25em] text-[#E5C07B] uppercase -rotate-90 select-none opacity-90"
                    >
                      WILTING OF WORDS &bull; PRATYAY SAHA
                    </div>
                    {/* Spine lighting sheen */}
                    <div className="absolute inset-y-0 left-[2px] w-[2px] bg-white/15 pointer-events-none" />
                  </div>

                  {/* Front Cover Board */}
                  <div className="flex-1 h-full rounded-r-[4px] overflow-hidden relative border-t border-r border-b border-[#3D2D1E]/40 bg-[#0C0907]">
                    <img
                      src="/cover.webp"
                      alt="Wilting of Words by Pratyay Saha"
                      className="w-full h-full object-cover block select-none pointer-events-none"
                    />
                    {/* Left Hinge Groove / Embossed French Seam */}
                    <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
                    {/* Soft Gloss Sheen Across Cover */}
                    <div 
                      className="absolute inset-0 pointer-events-none" 
                      style={{
                        background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 45%, rgba(0,0,0,0.2) 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Information */}
            <div className="mt-6 sm:mt-7 flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A6B47] shrink-0">
                <Calendar className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10.5px] font-semibold tracking-[0.22em] text-[#7C5835] uppercase">
                  Launched on:
                </span>
                <span className="font-bodoni text-base sm:text-lg font-medium text-[#1A1614] tracking-wide">
                  29th November, 2026
                </span>
              </div>
            </div>

            {/* Primary Action Button: ENTER WEBSITE */}
            <div className="mt-7 sm:mt-8 w-full sm:w-auto">
              <button
                onClick={handleEnter}
                className="w-full sm:w-auto px-9 sm:px-11 py-3.5 sm:py-4 rounded-full font-sans text-xs sm:text-[13px] font-semibold tracking-[0.2em] uppercase text-white bg-[#85603F] hover:bg-[#725032] active:bg-[#63442A] transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(133,96,63,0.42)] hover:shadow-[0_12px_28px_-6px_rgba(133,96,63,0.55)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
                aria-label="Enter Website to proceed to verification"
              >
                <span>ENTER WEBSITE</span>
                <ArrowRight className="w-4 h-4 stroke-[2] transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Realistic 3D Standing Hardcover Mockup with Atmospheric Sunlight (Desktop) */}
          <div className="lg:col-span-6 hidden lg:flex items-center justify-center relative order-2 py-4">
            
            {/* Soft Ambient Window Sunlight & Floral Backdrop Container */}
            <div className="relative w-full max-w-[540px] aspect-[4/3] flex items-center justify-center">
              
              {/* Natural Sunlight Glow */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-60"
                style={{
                  background: 'radial-gradient(ellipse 65% 55% at 60% 45%, rgba(248, 240, 226, 0.8) 0%, transparent 70%)'
                }}
              />

              {/* Stacked Hardcover Books & Ceramic Flora Background Accent (Right side of desk) */}
              <div className="absolute right-2 top-8 bottom-12 w-48 pointer-events-none opacity-45 overflow-hidden">
                <img 
                  src="/editorial_desk_bg.jpg" 
                  alt="" 
                  className="w-full h-full object-cover object-right filter blur-[1px] mix-blend-multiply" 
                />
              </div>

              {/* Realistic Contact Shadow on Tabletop */}
              <div 
                className="absolute bottom-4 left-[24%] w-[58%] h-9 bg-[#241A12]/30 rounded-[100%] blur-2xl pointer-events-none"
              />
              <div 
                className="absolute bottom-6 left-[28%] w-[50%] h-4 bg-[#140E0A]/40 rounded-[100%] blur-md pointer-events-none"
              />

              {/* Standing Hardcover Book Entity */}
              <div 
                className="relative w-[280px] md:w-[310px] aspect-[1/1.45] select-none z-10 transition-transform duration-500 hover:-translate-y-1"
                style={{
                  filter: 'drop-shadow(0 24px 38px rgba(35, 25, 18, 0.28)) drop-shadow(0 6px 14px rgba(35, 25, 18, 0.18))'
                }}
              >
                <div className="w-full h-full flex [perspective:1400px]">
                  
                  {/* 1. Spine (Left Edge with Curved Shading and Embossed Title) */}
                  <div 
                    className="w-[36px] md:w-[40px] h-full rounded-l-[4px] border-l border-t border-b border-[#3D2D1E]/60 relative overflow-hidden shrink-0 flex items-center justify-center shadow-[-4px_0_12px_rgba(0,0,0,0.6)]"
                    style={{
                      background: 'linear-gradient(90deg, #1C1510 0%, #0A0806 32%, #1A130E 78%, #0C0907 100%)'
                    }}
                  >
                    {/* Embossed Vertical Spine Typography */}
                    <div 
                      className="whitespace-nowrap font-bodoni text-[9.5px] md:text-[10.5px] font-semibold tracking-[0.28em] text-[#E5C07B] uppercase -rotate-90 select-none opacity-95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                    >
                      WILTING OF WORDS &bull; PRATYAY SAHA
                    </div>

                    {/* Spine Lighting Highlight Sheen */}
                    <div className="absolute inset-y-0 left-[3px] w-[3px] bg-white/20 pointer-events-none" />
                    
                    {/* Headband Cloth Accents at Top & Bottom */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#8B2213] border-b border-[#D4AF37]" />
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#8B2213] border-t border-[#D4AF37]" />
                  </div>

                  {/* 2. Front Hardcover Board (Showcasing the Actual Existing Cover Image) */}
                  <div className="flex-1 h-full rounded-r-[5px] overflow-hidden relative border-t border-r border-b border-[#3D2D1E]/50 bg-[#0C0907] shadow-[inset_1px_0_2px_rgba(255,255,255,0.15)]">
                    <img
                      src="/cover.webp"
                      alt="Wilting of Words by Pratyay Saha - Published by Technodef"
                      className="w-full h-full object-cover block select-none pointer-events-none"
                    />

                    {/* Realistic Hardcover Left Hinge Groove / French Joint */}
                    <div className="absolute inset-y-0 left-0 w-[7px] bg-gradient-to-r from-black/80 via-black/35 to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 left-[6px] w-[1px] bg-white/20 pointer-events-none" />

                    {/* Dynamic Editorial Sunlight Sheen */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-70"
                      style={{
                        background: 'linear-gradient(118deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 42%, rgba(0,0,0,0.25) 100%)'
                      }}
                    />

                    {/* Top & Right Hardcover Overhang Edge Highlights */}
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-white/30 via-white/10 to-transparent pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-[1.5px] bg-gradient-to-b from-white/35 via-white/10 to-black/40 pointer-events-none" />
                  </div>

                </div>

                {/* Subtle Tabletop Mirror Reflection Blur */}
                <div 
                  className="absolute -bottom-[65px] inset-x-0 h-[60px] opacity-15 overflow-hidden [transform:scaleY(-1)] filter blur-[3px] pointer-events-none"
                  style={{
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 80%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 80%)'
                  }}
                >
                  <img
                    src="/cover.webp"
                    alt=""
                    className="w-full h-full object-cover object-bottom"
                  />
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. BOTTOM EDITORIAL FEATURE ROW                           */}
      {/* ========================================================= */}
      <footer className="w-full border-t border-[#E8DFC8]/75 bg-[#F8F3EA]/70 mt-auto py-7 sm:py-9 z-20 relative">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 items-center justify-items-center">
            
            {/* Feature 1: An Emotional Journey */}
            <div className="flex flex-col items-center text-center space-y-2.5 w-full md:border-r md:border-[#E0D5BE]/60 last:border-r-0 md:px-4">
              <svg 
                className="w-5 h-5 text-[#8A6B47]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.6"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M4 19.5 A2.5 2.5 0 0 1 6.5 17 H20" />
                <path d="M6.5 2 H20 v20 H6.5 A2.5 2.5 0 0 1 4 19.5 v-15 A2.5 2.5 0 0 1 6.5 2 z" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <div className="font-sans text-[10.5px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#1A1614] uppercase leading-snug">
                <div>An Emotional</div>
                <div>Journey</div>
              </div>
            </div>

            {/* Feature 2: Deeply Heartfelt */}
            <div className="flex flex-col items-center text-center space-y-2.5 w-full md:border-r md:border-[#E0D5BE]/60 last:border-r-0 md:px-4">
              <svg 
                className="w-5 h-5 text-[#8A6B47]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.6"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
                <line x1="17.5" y1="15" x2="9" y2="15" />
              </svg>
              <div className="font-sans text-[10.5px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#1A1614] uppercase leading-snug">
                <div>Deeply</div>
                <div>Heartfelt</div>
              </div>
            </div>

            {/* Feature 3: A Story That Stays */}
            <div className="flex flex-col items-center text-center space-y-2.5 w-full md:border-r md:border-[#E0D5BE]/60 last:border-r-0 md:px-4">
              <svg 
                className="w-5 h-5 text-[#8A6B47]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.6"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 4 C11 8, 11 12, 12 17 C13 12, 13 8, 12 4 Z" />
                <path d="M12 9 C8 11, 7 15, 10 18 C11 17, 11.5 15, 12 13" />
                <path d="M12 9 C16 11, 17 15, 14 18 C13 17, 12.5 15, 12 13" />
                <path d="M9 19 C11 20, 13 20, 15 19" />
              </svg>
              <div className="font-sans text-[10.5px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#1A1614] uppercase leading-snug">
                <div>A Story That</div>
                <div>Stays</div>
              </div>
            </div>

            {/* Feature 4: For Every Dreamer */}
            <div className="flex flex-col items-center text-center space-y-2.5 w-full md:px-4">
              <svg 
                className="w-5 h-5 text-[#8A6B47]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.6"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* 4-Point Editorial Diamond Star */}
                <path d="M12 2 L13.8 9.2 L21 11 L13.8 12.8 L12 20 L10.2 12.8 L3 11 L10.2 9.2 Z" />
              </svg>
              <div className="font-sans text-[10.5px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#1A1614] uppercase leading-snug">
                <div>For Every</div>
                <div>Dreamer</div>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* OPTIONAL LIGHTWEIGHT DIALOGS: ABOUT & CONTACT             */}
      {/* ========================================================= */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF7F2] border border-[#D5C7B0] max-w-lg w-full rounded-2xl p-7 shadow-2xl text-[#1A1614] relative">
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-5 right-5 text-[#8A6B47] hover:text-[#1A1614] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bodoni text-2xl font-bold uppercase tracking-wider mb-2 text-[#1A1614]">
              About Wilting of Words
            </h3>
            <p className="font-cormorant italic text-base text-[#8A6B47] mb-4">
              A novel by Pratyay Saha &bull; Published by Technodef
            </p>
            <p className="font-serif text-sm leading-relaxed text-[#4A3E36] mb-4">
              Wilting of Words is an evocative exploration of silence, memory, and creative resurrection. Through poignant prose and timeless reflections, it stands as a testament that what remains unsaid in life often reverberates the loudest.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-6 py-2 rounded-full font-sans text-xs tracking-widest uppercase bg-[#85603F] text-white hover:bg-[#725032] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF7F2] border border-[#D5C7B0] max-w-md w-full rounded-2xl p-7 shadow-2xl text-[#1A1614] relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-5 right-5 text-[#8A6B47] hover:text-[#1A1614] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bodoni text-2xl font-bold uppercase tracking-wider mb-2 text-[#1A1614]">
              Technodef Press
            </h3>
            <p className="font-cormorant italic text-base text-[#8A6B47] mb-4">
              Literary Publications &amp; Editorial Inquiries
            </p>
            <div className="font-serif text-sm leading-relaxed text-[#4A3E36] space-y-2 mb-6">
              <p><strong>Publisher:</strong> Technodef Press</p>
              <p><strong>Official Launch:</strong> 29th November, 2026</p>
              <p><strong>Inquiries:</strong> support@technodef.com</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-6 py-2 rounded-full font-sans text-xs tracking-widest uppercase bg-[#85603F] text-white hover:bg-[#725032] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
