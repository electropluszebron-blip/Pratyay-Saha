import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ExternalLink, HandMetal, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { auth, getUserSponsorScratchState, saveUserSponsorScratchState, sanitizeEmailKey } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthUser } from './AuthPortal';

interface SponsorScratchSectionProps {
  isDark?: boolean;
  currentUser: AuthUser | null;
}

const PROXY_SPONSOR_IMG = '/api/sponsor/image';
const PRIMARY_SPONSOR_IMG = 'https://lh3.googleusercontent.com/d/1zQ8HHZEyi1eEStlId35ECOYd8jjU0Y4_';
const FALLBACK_SPONSOR_IMG = 'https://drive.google.com/uc?export=view&id=1zQ8HHZEyi1eEStlId35ECOYd8jjU0Y4_';
const SPONSOR_DESTINATION_URL = 'https://paper-x.ai.studio';

export const SponsorScratchSection: React.FC<SponsorScratchSectionProps> = ({
  currentUser
}) => {
  const [firebaseUid, setFirebaseUid] = useState<string | null>(() => {
    return auth.currentUser?.uid || currentUser?.id || (currentUser?.email ? sanitizeEmailKey(currentUser.email) : null);
  });
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);
  const [isScratching, setIsScratching] = useState<boolean>(false);
  const [scratchPercent, setScratchPercent] = useState<number>(0);
  const [imageSrc, setImageSrc] = useState<string>(PROXY_SPONSOR_IMG);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [hasErrorImage, setHasErrorImage] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isCompletingRef = useRef<boolean>(false);

  // Sync Firebase Auth UID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser?.uid) {
        setFirebaseUid(fbUser.uid);
      } else if (currentUser?.id) {
        setFirebaseUid(currentUser.id);
      } else if (currentUser?.email) {
        setFirebaseUid(sanitizeEmailKey(currentUser.email));
      } else {
        setFirebaseUid(null);
      }
    });

    if (currentUser?.id) {
      setFirebaseUid(currentUser.id);
    } else if (currentUser?.email) {
      setFirebaseUid(sanitizeEmailKey(currentUser.email));
    }

    return () => unsubscribe();
  }, [currentUser]);

  // Load persistent scratch state from Firebase Firestore for the authenticated UID
  useEffect(() => {
    let isMounted = true;

    async function loadUserState() {
      if (!firebaseUid) {
        // Not logged in: Default to unscratched card
        if (isMounted) {
          setIsRevealed(false);
          setIsLoadingState(false);
        }
        return;
      }

      setIsLoadingState(true);
      try {
        const revealed = await getUserSponsorScratchState(firebaseUid);
        if (isMounted) {
          setIsRevealed(revealed);
        }
      } catch (err) {
        console.warn('[SponsorSection] Could not load state from Firebase, failing gracefully:', err);
        if (isMounted) {
          setIsRevealed(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingState(false);
        }
      }
    }

    loadUserState();

    return () => {
      isMounted = false;
    };
  }, [firebaseUid]);

  // Draw scratch canvas cover
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 340;
    const height = rect.height || 220;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // 1. Multi-tone vibrant luxury gradient (Rose, Sunset Amber, Violet, Warm Gold)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#F43F5E');    // Rose
    gradient.addColorStop(0.3, '#FB7185');  // Soft Coral
    gradient.addColorStop(0.65, '#8B5CF6'); // Purple / Violet
    gradient.addColorStop(1, '#F59E0B');    // Sunset Amber
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle decorative overlay pattern (micro-dots and soft circles)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let x = 18; x < width; x += 28) {
      for (let y = 18; y < height; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Soft satin sheen arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width * 0.42, height * 0.35, -Math.PI / 6, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Central elegant label badge
    const badgeW = 200;
    const badgeH = 46;
    const badgeX = (width - badgeW) / 2;
    const badgeY = (height - badgeH) / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.stroke();

    // Text: "Scratch to reveal"
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('✨  Scratch to reveal', width / 2, height / 2);

    isCompletingRef.current = false;
    setScratchPercent(0);
  }, [isRevealed]);

  // Re-draw when canvas is available and not revealed
  useEffect(() => {
    if (!isRevealed && !isLoadingState) {
      const timer = setTimeout(() => {
        setupCanvas();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, isLoadingState, setupCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isRevealed && !isLoadingState) {
        setupCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isRevealed, isLoadingState, setupCanvas]);

  // Check how much has been scratched
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || isCompletingRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      const { width, height } = canvas;
      // Sample pixels with a step of 16 for high performance
      const step = 16;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      let totalSamples = 0;
      let transparentSamples = 0;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];
          totalSamples++;
          if (alpha < 60) {
            transparentSamples++;
          }
        }
      }

      if (totalSamples === 0) return;
      const percent = (transparentSamples / totalSamples) * 100;
      setScratchPercent(Math.round(percent));

      // 45% - 55% threshold: automatically complete reveal
      if (percent >= 48 && !isCompletingRef.current) {
        isCompletingRef.current = true;
        completeReveal();
      }
    } catch (e) {
      // In case of any browser security or cross-origin canvas issue, fallback
      console.warn('[Scratch] Sample check notice:', e);
    }
  }, [isRevealed]);

  // Complete reveal with animation, confetti, and Firebase persistence
  const completeReveal = () => {
    setIsRevealed(true);

    // Trigger subtle, tasteful sparkles
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#F43F5E', '#8B5CF6', '#F59E0B', '#10B981'],
        disableForReducedMotion: true
      });
    } catch {}

    // Persist to Firebase for the logged-in user
    if (firebaseUid) {
      saveUserSponsorScratchState(firebaseUid).catch((err) => {
        console.warn('[SponsorSection] Firebase save notice:', err);
      });
    }
  };

  // Scratch drawing mechanics
  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || isCompletingRef.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 42;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, 21, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsScratching(true);
    lastPointRef.current = null;
    scratchAt(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    scratchAt(e.clientX, e.clientY);
    checkScratchPercentage();
  };

  const handleMouseUp = () => {
    setIsScratching(false);
    lastPointRef.current = null;
    checkScratchPercentage();
  };

  // Touch handlers (prevent page scroll during active scratching)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsScratching(true);
      lastPointRef.current = null;
      const touch = e.touches[0];
      scratchAt(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    if (touch) {
      scratchAt(touch.clientX, touch.clientY);
      checkScratchPercentage();
    }
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
    lastPointRef.current = null;
    checkScratchPercentage();
  };

  return (
    <section 
      aria-label="Special Sponsor Section"
      className="w-full py-16 sm:py-20 bg-gradient-to-b from-[#FDFBF7] via-[#FAF6EF] to-[#F5EFE6] text-stone-900 border-t border-stone-200/80 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Header Label: Small elegant label */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 border border-stone-200/80 shadow-xs mb-3 text-stone-600">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-stone-700">
            A Little Surprise
          </span>
        </div>

        {/* Refined Heading */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {isRevealed ? 'Our Featured Partner' : 'Scratch to Reveal'}
        </h2>

        {/* Short Subtitle */}
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
          {isRevealed 
            ? 'Thank you for exploring with us. Tap below to visit our featured partner.' 
            : 'Uncover something special. Drag across the card to discover our featured sponsor.'}
        </p>

        {/* Compact, Colorful Premium Scratch Card Container */}
        <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px] aspect-[4/3] rounded-2xl sm:rounded-3xl border border-stone-200/90 bg-white shadow-xl shadow-stone-300/40 p-2.5 transition-all">
          
          {/* Card Frame Inner */}
          <div 
            ref={containerRef}
            className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center select-none"
          >
            {/* UNDERLYING REVEALED CONTENT */}
            <a
              href={SPONSOR_DESTINATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Paper-X official sponsor website (opens in a new tab)"
              tabIndex={isRevealed ? 0 : -1}
              className={`relative w-full h-full block group focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/50 transition-all ${
                isRevealed ? 'cursor-pointer' : 'pointer-events-none'
              }`}
            >
              {/* Image Container with Smooth Reveal Animation */}
              <div className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden rounded-lg transition-all duration-700 ${
                isRevealed ? 'opacity-100 scale-100 filter-none' : 'opacity-90 scale-98'
              }`}>
                {!hasErrorImage ? (
                  <img
                    src={imageSrc}
                    alt="Paper-X Sponsor"
                    referrerPolicy="no-referrer"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      if (imageSrc === PROXY_SPONSOR_IMG) {
                        setImageSrc(PRIMARY_SPONSOR_IMG);
                      } else if (imageSrc === PRIMARY_SPONSOR_IMG) {
                        setImageSrc(FALLBACK_SPONSOR_IMG);
                      } else {
                        setHasErrorImage(true);
                      }
                    }}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ) : (
                  // Zero-Broken-Image Policy Fallback Container
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-500 via-purple-600 to-amber-500 text-white text-center">
                    <Sparkles className="w-8 h-8 mb-2 animate-bounce" />
                    <span className="font-serif font-bold text-lg">Paper-X</span>
                    <span className="text-xs text-white/90 mt-1">Creative AI Studio</span>
                  </div>
                )}

                {/* Subtle Glass Shimmer Overlay when Revealed */}
                {isRevealed && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}

                {/* Clean Tap to Visit Badge */}
                {isRevealed && (
                  <div className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium shadow-md group-hover:bg-rose-600 transition-colors">
                    <span>Visit Partner</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
            </a>

            {/* TOP SCRATCH CANVAS LAYER (Only active when not revealed) */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
                className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-500 z-10 ${
                  isLoadingState ? 'opacity-0' : 'opacity-100'
                }`}
                aria-label="Scratch card canvas. Drag to scratch and reveal the sponsor."
              />
            )}
          </div>

          {/* Micro Progress / Status below Card (Hidden when revealed) */}
          {!isRevealed && (
            <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-stone-500">
              <div className="flex items-center gap-1">
                <HandMetal className="w-3 h-3 text-rose-500 animate-bounce" />
                <span>Use finger or mouse to scratch</span>
              </div>
              <div className="tabular-nums font-mono text-[10px] text-stone-600">
                {scratchPercent > 0 ? `${scratchPercent}% Scratched` : 'Interactive'}
              </div>
            </div>
          )}
        </div>

        {/* Sponsor Destination Direct Link for Accessibility */}
        <div className="mt-6 text-center">
          <a
            href={SPONSOR_DESTINATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-rose-600 transition-colors underline-offset-4 hover:underline"
          >
            <span>Learn more about paper-x.ai.studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </section>
  );
};
