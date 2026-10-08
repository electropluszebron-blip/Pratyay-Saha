import React, { useState, useEffect, useRef } from 'react';
import { LiteraryBookCoverPoster } from './LiteraryBookCoverPoster';

export const SplashLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleFinish = () => {
    if (fadeOut) return;
    setFadeOut(true);
    setTimeout(() => {
      onCompleteRef.current();
    }, 450);
  };

  useEffect(() => {
    // Smooth progress fill over ~1.2 seconds with fallback safety
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinish();
          return 100;
        }
        return prev + 3.5;
      });
    }, 40);

    // Hard fallback: never stay on splash for more than 1.8s
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div 
      onClick={handleFinish}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060606] text-[#FAF5EE] transition-opacity duration-500 select-none cursor-pointer overflow-hidden ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      title="Click or tap to enter sanctuary"
    >
      {/* 
        ==================================================================
        RECREATING THE 2ND REFERENCE IMAGE IN PLACE OF 1ST IMAGE
        - 9:16 vertical ratio preserved
        - Pure black with subtle warm champagne gold lighting
        - Top right '— TECHNODEF —'
        - Center rounded square with minimalist book icon
        - '— ⚜ LITERARY SANCTUARY —'
        - 'WILTING OF WORDS'
        - 'Pratyay Saha • Technodef Press'
        - '— • • • —'
        - Dramatic bottom glowing open book
        ==================================================================
      */}
      <div className="relative w-full h-full max-w-[500px] flex items-center justify-center">
        <LiteraryBookCoverPoster className="shadow-2xl" />
      </div>

      {/* Subtle Bottom Entry Hint & Delicate Champagne Gold Progress Line */}
      <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-20 space-y-2 px-6">
        <div className="w-28 sm:w-36 h-[1.5px] bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#C5A059] via-[#FFE58F] to-[#C5A059] transition-all duration-100 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[9px] font-bodoni tracking-[0.28em] text-[#C5A059]/80 uppercase">
          TAP ANYWHERE TO ENTER
        </p>
      </div>
    </div>
  );
};
