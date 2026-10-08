import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw,
  Maximize2, 
  Minimize2, 
  BookOpen,
  Bookmark,
  Volume2,
  VolumeX,
  ArrowLeft,
  X,
  Trash2,
  Check,
  Sparkles,
  Layers,
  Highlighter,
  MessageSquare,
  MessageSquareQuote,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Feather,
  Send,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Heart,
  Flame,
  CheckCircle2,
  PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { audioSynth } from '../services/audioSynth';
import { soundEffects } from '../services/soundEffects';
import { 
  addReviewToFirebase, 
  verifyReviewWithAI, 
  subscribeToReviews, 
  likeReviewInFirebase, 
  ReflectionRecord,
  saveReaderProgressToFirebase,
  getReaderProgressFromFirebase
} from '../firebase';
import { AuthUser } from './AuthPortal';
import { activeTimeTracker } from '../services/activeTimeTracker';

interface ReaderCabinetProps {
  isDark: boolean;
  currentUser?: AuthUser | null;
  onAuthTrigger?: () => void;
}

interface PageHighlight {
  page: number;
  color: string;
  colorName: string;
  note?: string;
  createdAt: string;
}

const TOTAL_PAGES = 219;
const LAST_PAGE_KEY = 'wilting_of_words_last_page';
const BOOKMARKS_KEY = 'wilting_of_words_bookmarks';
const HIGHLIGHTS_KEY = 'wilting_of_words_highlights_v2';

const HIGHLIGHT_PALETTE = [
  { name: 'Imperial Gold', hex: '#F59E0B', bg: 'rgba(245, 158, 11, 0.28)', border: '#F59E0B' },
  { name: 'Rose Carmine', hex: '#E11D48', bg: 'rgba(225, 29, 72, 0.25)', border: '#E11D48' },
  { name: 'Emerald Ink', hex: '#10B981', bg: 'rgba(16, 185, 129, 0.25)', border: '#10B981' },
  { name: 'Bengal Indigo', hex: '#6366F1', bg: 'rgba(99, 102, 241, 0.25)', border: '#6366F1' },
  { name: 'Terracotta Sunset', hex: '#EA580C', bg: 'rgba(234, 88, 12, 0.25)', border: '#EA580C' }
];

export const ReaderCabinet: React.FC<ReaderCabinetProps> = ({
  isDark,
  currentUser = null,
  onAuthTrigger
}) => {
  // Read initial saved page from localStorage if available, defaulting to Page 1
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LAST_PAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_PAGES) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Unable to read localStorage:', e);
    }
    return 1;
  });

  // Saved bookmark pages array
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Unable to read bookmarks from localStorage:', e);
    }
    return [];
  });

  // Saved text/page highlights array
  const [highlights, setHighlights] = useState<PageHighlight[]>(() => {
    try {
      const saved = localStorage.getItem(HIGHLIGHTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Unable to read highlights from localStorage:', e);
    }
    return [];
  });

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(1); // 1 = next, -1 = prev
  const [pageInput, setPageInput] = useState<string>(currentPage.toString());
  const [isPlaying, setIsPlaying] = useState<boolean>(() => audioSynth.getIsPlaying());
  
  // Drawers and Modals
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<boolean>(false);
  const [showHighlightDrawer, setShowHighlightDrawer] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [bookmarkToast, setBookmarkToast] = useState<{ message: string; type: 'add' | 'remove' | 'highlight' } | null>(null);

  // Highlighting active input state
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>(HIGHLIGHT_PALETTE[0].hex);
  const [highlightNoteInput, setHighlightNoteInput] = useState<string>('');

  // In-Reader Review submission states
  const [reviewAuthor, setReviewAuthor] = useState<string>(() => {
    try {
      return localStorage.getItem('wilting_reader_name') || '';
    } catch {
      return '';
    }
  });
  const [reviewLocation, setReviewLocation] = useState<string>(() => {
    try {
      return localStorage.getItem('wilting_reader_location') || '';
    } catch {
      return '';
    }
  });
  const [reviewMessage, setReviewMessage] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewVerifying, setReviewVerifying] = useState<boolean>(false);
  const [reviewFeedback, setReviewFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [communityReviews, setCommunityReviews] = useState<ReflectionRecord[]>([]);
  const [activeReviewTab, setActiveReviewTab] = useState<'write' | 'read'>('write');
  const [includePageTag, setIncludePageTag] = useState<boolean>(true);
  const [likedReviewIds, setLikedReviewIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wow_liked_reflections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Progress Syncing State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncFeedback, setSyncFeedback] = useState<string>('');

  // Track active reading time strictly when viewing the E-Reader
  useEffect(() => {
    const el = document.getElementById('reader-cabinet');
    if (!el || typeof IntersectionObserver === 'undefined') {
      activeTimeTracker.setIsInReader(true);
      return () => activeTimeTracker.setIsInReader(false);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0.15);
        activeTimeTracker.setIsInReader(isVisible);
      },
      { threshold: [0, 0.15, 0.5, 0.8] }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      activeTimeTracker.setIsInReader(false);
    };
  }, []);

  // 1. Auto-Load latest reading progress on mount or login
  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      setSyncStatus('idle');
      return;
    }

    const loadCloudProgress = async () => {
      try {
        setSyncStatus('syncing');
        const cloudData = await getReaderProgressFromFirebase(currentUser.email);
        if (cloudData) {
          // Compare with local and restore if newer/different
          const localLastPage = parseInt(localStorage.getItem(LAST_PAGE_KEY) || '1', 10);
          
          if (cloudData.currentPage !== localLastPage || 
              JSON.stringify(cloudData.bookmarks) !== JSON.stringify(bookmarks) || 
              JSON.stringify(cloudData.highlights) !== JSON.stringify(highlights)) {
            
            setCurrentPage(cloudData.currentPage);
            setBookmarks(cloudData.bookmarks);
            setHighlights(cloudData.highlights);
            
            localStorage.setItem(LAST_PAGE_KEY, cloudData.currentPage.toString());
            localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(cloudData.bookmarks));
            localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(cloudData.highlights));
            
            setSyncStatus('synced');
            setSyncFeedback('Successfully synchronized your progress from the cloud!');
            showToast('Progress synced from Cloud!', 'highlight');
          } else {
            setSyncStatus('synced');
          }
        } else {
          // If no cloud data, initialize it with current local state
          await saveReaderProgressToFirebase(currentUser.email, {
            currentPage,
            bookmarks,
            highlights
          });
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('[ReaderCabinet] Cloud sync loading failed:', err);
        setSyncStatus('error');
        setSyncFeedback('Cloud sync failed to fetch data.');
      }
    };

    loadCloudProgress();
  }, [currentUser]);

  // 2. Auto-Push updates to Firestore when reading state changes
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    // Debounce pushing progress to Firestore to prevent excessive writes
    const delayDebounce = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        await saveReaderProgressToFirebase(currentUser.email!, {
          currentPage,
          bookmarks,
          highlights
        });
        setSyncStatus('synced');
      } catch (err) {
        console.error('[ReaderCabinet] Cloud sync saving failed:', err);
        setSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, bookmarks, highlights, currentUser]);

  // Subscribe to live Firestore community reviews
  useEffect(() => {
    const unsub = subscribeToReviews((reviews) => {
      setCommunityReviews(reviews || []);
    });
    return unsub;
  }, []);

  // Swipe Gesture & Page Flip Interactive Drag States
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isHorizontalGesture = useRef<boolean | null>(null);

  // Sync with audio engine
  useEffect(() => {
    const unsub = audioSynth.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  // Save current page to localStorage & prefetch adjacent pages
  useEffect(() => {
    setPageInput(currentPage.toString());
    try {
      localStorage.setItem(LAST_PAGE_KEY, currentPage.toString());

      // Track visited pages for 100% authentic statistics calculation
      const visitedStr = localStorage.getItem('wilting_of_words_visited_pages');
      let visited: number[] = visitedStr ? JSON.parse(visitedStr) : [];
      if (!visited.includes(currentPage)) {
        visited.push(currentPage);
        localStorage.setItem('wilting_of_words_visited_pages', JSON.stringify(visited));
      }
    } catch (e) {}

    // Eagerly prefetch +/- 8 neighboring pages into browser memory
    const prefetchTargets = [
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
      currentPage + 4,
      currentPage - 1,
      currentPage - 2,
      currentPage - 3
    ];

    prefetchTargets.forEach(num => {
      if (num >= 1 && num <= TOTAL_PAGES) {
        const img = new Image();
        img.src = `/book_pages_webp/page_${num}.webp`;
      }
    });
  }, [currentPage]);

  // Save bookmarks array to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  // Save highlights array to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
    } catch (e) {}
  }, [highlights]);

  // Update current note input when page changes
  useEffect(() => {
    const existing = highlights.find(h => h.page === currentPage);
    if (existing) {
      setSelectedHighlightColor(existing.color);
      setHighlightNoteInput(existing.note || '');
    } else {
      setHighlightNoteInput('');
    }
  }, [currentPage, highlights]);

  // Prevent background body scrolling when in full screen mode, drawer or modal open
  useEffect(() => {
    if (isFullScreen || showBookmarksDrawer || showHighlightDrawer || showReviewModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen, showBookmarksDrawer, showHighlightDrawer, showReviewModal]);

  const isCurrentBookmarked = bookmarks.includes(currentPage);
  const currentHighlight = highlights.find(h => h.page === currentPage);

  const toggleBookmark = (targetPage: number = currentPage) => {
    const alreadyBookmarked = bookmarks.includes(targetPage);
    if (alreadyBookmarked) {
      setBookmarks(prev => prev.filter(p => p !== targetPage));
      showToast(`Removed Page ${targetPage} from bookmarks`, 'remove');
    } else {
      setBookmarks(prev => [...prev, targetPage].sort((a, b) => a - b));
      showToast(`Page ${targetPage} saved to bookmarks!`, 'add');
    }
  };

  const showToast = (message: string, type: 'add' | 'remove' | 'highlight') => {
    setBookmarkToast({ message, type });
    setTimeout(() => {
      setBookmarkToast(null);
    }, 2800);
  };

  // Highlighting handler
  const handleSaveHighlight = () => {
    const paletteObj = HIGHLIGHT_PALETTE.find(p => p.hex === selectedHighlightColor) || HIGHLIGHT_PALETTE[0];
    const newHighlight: PageHighlight = {
      page: currentPage,
      color: selectedHighlightColor,
      colorName: paletteObj.name,
      note: highlightNoteInput.trim() || undefined,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    setHighlights(prev => {
      const filtered = prev.filter(h => h.page !== currentPage);
      return [...filtered, newHighlight].sort((a, b) => a.page - b.page);
    });

    showToast(`Page ${currentPage} highlighted in ${paletteObj.name}!`, 'highlight');
    setShowHighlightDrawer(false);
  };

  const handleRemoveHighlight = (targetPage: number = currentPage) => {
    setHighlights(prev => prev.filter(h => h.page !== targetPage));
    showToast(`Highlight removed from Page ${targetPage}`, 'remove');
    setHighlightNoteInput('');
  };

  // Direct Review Action: Opens In-Reader Review Modal
  const handleOpenReviewModal = () => {
    setReviewFeedback(null);
    setShowReviewModal(true);
  };

  const handleLikeInModal = async (reviewId: string) => {
    if (likedReviewIds.includes(reviewId)) return;
    const newLiked = [...likedReviewIds, reviewId];
    setLikedReviewIds(newLiked);
    try {
      localStorage.setItem('wow_liked_reflections', JSON.stringify(newLiked));
    } catch {}

    setCommunityReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));

    try {
      await likeReviewInFirebase(reviewId);
    } catch (e) {
      console.warn('[ReaderCabinet] Error liking review:', e);
    }
  };

  const handleInReaderReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewMessage.trim() || reviewSubmitting || reviewVerifying) return;
    
    setReviewFeedback(null);
    setReviewVerifying(true);

    try {
      // 1. Mandatory AI Verification before submission:
      // Positive and negative opinions are BOTH permitted. Slangs, abusive, sexual, harsh, or manipulative content are blocked.
      const verifyResult = await verifyReviewWithAI(reviewAuthor.trim(), reviewMessage.trim(), reviewLocation.trim());
      if (!verifyResult.approved) {
        setReviewFeedback({
          type: 'error',
          text: verifyResult.reason || 'Your review contains language or content contrary to sanctuary guidelines. Positive and negative reviews are both welcome, but please avoid slangs, abusive, sexual, or harsh language.'
        });
        setReviewVerifying(false);
        return;
      }

      setReviewVerifying(false);
      setReviewSubmitting(true);

      // Save reader name & location for convenience
      try {
        localStorage.setItem('wilting_reader_name', reviewAuthor.trim());
        if (reviewLocation.trim()) {
          localStorage.setItem('wilting_reader_location', reviewLocation.trim());
        }
      } catch {}

      // 2. Save directly to Firestore with page tag if selected
      const pageToTag = includePageTag ? currentPage : undefined;
      const created = await addReviewToFirebase(
        reviewAuthor.trim(), 
        reviewLocation.trim(), 
        reviewMessage.trim(), 
        pageToTag
      );

      // Optimistically update community reviews list
      setCommunityReviews(prev => {
        if (prev.some(r => r.id === created.id)) return prev;
        return [created, ...prev];
      });

      setReviewFeedback({
        type: 'success',
        text: `Your review${pageToTag ? ` on Page ${pageToTag}` : ''} has been verified by Seraph AI and engraved into the permanent public registry!`
      });
      showToast(`Review published across all devices!`, 'add');
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 } });

      setReviewMessage('');
      setTimeout(() => {
        setReviewFeedback(null);
        setActiveReviewTab('read');
      }, 2400);
    } catch (err: any) {
      console.error('[ReaderCabinet] Review submit error:', err);
      setReviewFeedback({
        type: 'error',
        text: 'Failed to broadcast review to sanctuary registry. Please check your connection and try again.'
      });
    } finally {
      setReviewVerifying(false);
      setReviewSubmitting(false);
    }
  };

  // Direct Review Navigation Option (Scroll to full section)
  const handleScrollToReflections = () => {
    setShowReviewModal(false);
    if (isFullScreen) {
      setIsFullScreen(false);
    }
    setTimeout(() => {
      const el = document.getElementById('reflections-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const textarea = el.querySelector('textarea');
          if (textarea) {
            textarea.focus();
          }
        }, 500);
      }
    }, 150);
  };

  // Instantaneous Smooth Next Page with Sound
  const turnNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES) {
      soundEffects.playPageTurnSound();
      setDirection(1);
      setCurrentPage(prev => Math.min(TOTAL_PAGES, prev + 1));
    }
  }, [currentPage]);

  // Instantaneous Smooth Previous Page with Sound
  const turnPrev = useCallback(() => {
    if (currentPage > 1) {
      soundEffects.playPageTurnSound();
      setDirection(-1);
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  }, [currentPage]);

  // First & Last Page Quick Navigation
  const turnToFirst = useCallback(() => {
    if (currentPage !== 1) {
      soundEffects.playPageTurnSound();
      setDirection(-1);
      setCurrentPage(1);
      showToast('Jumped to First Page (Page 1)', 'add');
    }
  }, [currentPage]);

  const turnToLast = useCallback(() => {
    if (currentPage !== TOTAL_PAGES) {
      soundEffects.playPageTurnSound();
      setDirection(1);
      setCurrentPage(TOTAL_PAGES);
      showToast(`Jumped to Last Page (Page ${TOTAL_PAGES})`, 'add');
    }
  }, [currentPage]);

  // Fast Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        turnNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        turnPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        turnToFirst();
      } else if (e.key === 'End') {
        e.preventDefault();
        turnToLast();
      } else if (e.key === 'Escape') {
        if (showBookmarksDrawer) {
          setShowBookmarksDrawer(false);
        } else if (showHighlightDrawer) {
          setShowHighlightDrawer(false);
        } else if (isFullScreen) {
          setIsFullScreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turnNext, turnPrev, turnToFirst, turnToLast, isFullScreen, showBookmarksDrawer, showHighlightDrawer]);

  // --- SWIPE GESTURE & PAGE DRAGGING HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    isHorizontalGesture.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null || dragStartY.current === null) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    const deltaY = e.touches[0].clientY - dragStartY.current;

    if (isHorizontalGesture.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalGesture.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalGesture.current) {
      const resistance = (deltaX < 0 && currentPage >= TOTAL_PAGES) || (deltaX > 0 && currentPage <= 1) ? 0.2 : 0.75;
      setDragOffset(deltaX * resistance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (isHorizontalGesture.current && Math.abs(dragOffset) > 40) {
      if (dragOffset < 0 && currentPage < TOTAL_PAGES) {
        turnNext();
      } else if (dragOffset > 0 && currentPage > 1) {
        turnPrev();
      }
    }

    setDragOffset(0);
    dragStartX.current = null;
    dragStartY.current = null;
    isHorizontalGesture.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isHorizontalGesture.current = null;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - (dragStartY.current || 0);

    if (isHorizontalGesture.current === null) {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isHorizontalGesture.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalGesture.current) {
      const resistance = (deltaX < 0 && currentPage >= TOTAL_PAGES) || (deltaX > 0 && currentPage <= 1) ? 0.2 : 0.75;
      setDragOffset(deltaX * resistance);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (isHorizontalGesture.current && Math.abs(dragOffset) > 40) {
      if (dragOffset < 0 && currentPage < TOTAL_PAGES) {
        turnNext();
      } else if (dragOffset > 0 && currentPage > 1) {
        turnPrev();
      }
    }

    setDragOffset(0);
    dragStartX.current = null;
    dragStartY.current = null;
    isHorizontalGesture.current = null;
  };

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Math.abs(dragOffset) > 10) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX > rect.width * 0.55) {
      turnNext();
    } else if (clickX < rect.width * 0.45) {
      turnPrev();
    }
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= TOTAL_PAGES) {
      soundEffects.playPageTurnSound();
      setDirection(p > currentPage ? 1 : -1);
      setCurrentPage(p);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const getPageSrc = (pageNum: number) => {
    return `/book_pages_webp/page_${pageNum}.webp`;
  };

  const currentDragAngle = Math.max(-45, Math.min(45, (dragOffset / 280) * 45));

  return (
    <>
      <section id="reader-cabinet" className="px-2 sm:px-6 pt-4 pb-14 max-w-5xl mx-auto select-none">
        
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-3.5 px-2 text-[#B93826] dark:text-[#E5A93C] font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#B93826] dark:text-[#E5A93C]" />
            <span>DIGITAL MANUSCRIPT CABINET</span>
          </div>

          <div className="flex items-center gap-3 text-stone-500 text-[11px] font-sans font-medium">
            <span className="hidden sm:inline">219 Original Manuscript Pages</span>
            <span className="inline-flex items-center gap-1 text-[#E5A93C] font-cinzel font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Full Interactive Features</span>
            </span>
          </div>
        </div>

        {/* Standard Cabinet View */}
        <div className="relative rounded-[24px] sm:rounded-[36px] p-2 sm:p-4 bg-[#141210] border-t-4 border-r-4 border-[#D85A2A] border-b-2 border-l-2 border-[#1E1915] shadow-2xl shadow-black/80 overflow-hidden">
          
          {/* Inner Dark Reader Box */}
          <div className="rounded-[18px] sm:rounded-[28px] bg-[#110E0C] p-2.5 sm:p-4 text-white flex flex-col justify-between min-h-[640px] sm:min-h-[780px] relative overflow-hidden">
            
            {/* Top Control Bar with All Required Functionalities */}
            <div className="flex items-center justify-between gap-1 sm:gap-2 pb-2.5 mb-1 border-b border-[#241D17] flex-wrap">
              
              {/* Left Group: Page Navigation & First/Last Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* First Page Button */}
                <button
                  onClick={turnToFirst}
                  disabled={currentPage === 1}
                  title="Jump to First Page (Page 1)"
                  className="p-1 sm:p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-400 hover:text-[#E5A93C] hover:border-[#E5A93C]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-0.5 text-xs font-cinzel"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">First</span>
                </button>

                {/* Prev Page Button */}
                <button
                  onClick={turnPrev}
                  disabled={currentPage === 1}
                  title="Previous Page"
                  className="p-1 sm:p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Jump to Page Form */}
                <form onSubmit={handlePageSubmit} className="flex items-center gap-1 bg-[#1A1512] px-2 py-1 rounded-xl border border-[#2D241E] text-xs">
                  <span className="text-stone-400 font-cinzel text-[11px] hidden xs:inline">Pg</span>
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => setPageInput(currentPage.toString())}
                    className="w-8 sm:w-10 text-center bg-[#251E18] text-[#E5A93C] font-mono font-bold rounded px-1 py-0.5 border border-[#3A2D22] focus:outline-none text-xs"
                  />
                  <span className="text-stone-500 font-mono text-[11px]">/{TOTAL_PAGES}</span>
                </form>

                {/* Next Page Button */}
                <button
                  onClick={turnNext}
                  disabled={currentPage === TOTAL_PAGES}
                  title="Next Page"
                  className="p-1 sm:p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Last Page Button */}
                <button
                  onClick={turnToLast}
                  disabled={currentPage === TOTAL_PAGES}
                  title={`Jump to Last Page (Page ${TOTAL_PAGES})`}
                  className="p-1 sm:p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-400 hover:text-[#E5A93C] hover:border-[#E5A93C]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-0.5 text-xs font-cinzel"
                >
                  <span className="hidden md:inline text-[11px]">Last</span>
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Center/Right Group: Zoom & Highlights & Reviews */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-stone-300 shrink-0 ml-auto">
                
                {/* ZOOM CONTROLS (Visible on all devices!) */}
                <div className="flex items-center gap-0.5 bg-[#1C1815] p-0.5 rounded-lg border border-[#2D241E]">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(75, z - 15))}
                    title="Zoom Out"
                    className="p-1 sm:p-1.5 text-stone-400 hover:text-white transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5 stroke-[2]" />
                  </button>

                  <button
                    onClick={() => setZoomLevel(100)}
                    title="Reset Zoom to 100%"
                    className="px-1.5 py-0.5 font-cinzel text-[10px] sm:text-xs text-[#E5A93C] font-mono hover:text-white transition-colors"
                  >
                    {zoomLevel}%
                  </button>

                  <button
                    onClick={() => setZoomLevel(z => Math.min(180, z + 15))}
                    title="Zoom In"
                    className="p-1 sm:p-1.5 text-stone-400 hover:text-white transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>

                {/* HIGHLIGHT MENU BUTTON (Dedicated Highlight Menu) */}
                <button
                  onClick={() => setShowHighlightDrawer(true)}
                  title="Page Annotations & Highlighting Tool"
                  className={`p-1 sm:p-1.5 sm:px-2 rounded-lg border transition-all flex items-center gap-1 text-xs font-cinzel ${
                    currentHighlight
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-400 hover:text-white hover:border-[#D4AF37]/50'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" style={{ color: currentHighlight ? currentHighlight.color : undefined }} />
                  <span className="hidden sm:inline">Annotate</span>
                  {highlights.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">
                      {highlights.length}
                    </span>
                  )}
                </button>

                {/* DIRECT REVIEW OPTION BUTTON */}
                <button
                  onClick={handleOpenReviewModal}
                  title="Direct Review: Write or view reviews for this page"
                  className="p-1 sm:p-1.5 px-2 sm:px-2.5 rounded-lg border border-[#B93826] bg-[#B93826]/20 hover:bg-[#B93826] text-amber-200 hover:text-white transition-all flex items-center gap-1 text-xs font-cinzel cursor-pointer shadow-sm active:scale-95"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span className="text-[11px] font-bold">Review</span>
                  {communityReviews.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#B93826] text-white text-[10px] font-bold font-mono">
                      {communityReviews.length}
                    </span>
                  )}
                </button>

                {/* Bookmark Drawer Toggle Button with Counter Badge */}
                <button
                  onClick={() => setShowBookmarksDrawer(true)}
                  title="View Saved Bookmarks"
                  className={`p-1 sm:p-1.5 sm:px-2 rounded-lg border transition-all flex items-center gap-1 text-xs font-cinzel ${
                    bookmarks.length > 0 
                      ? 'bg-[#E5A93C]/15 border-[#E5A93C]/60 text-[#E5A93C]' 
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-400 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarks.length > 0 ? 'fill-current text-[#E5A93C]' : ''}`} />
                  <span className="hidden md:inline">Bookmarks</span>
                  {bookmarks.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#E5A93C] text-black text-[10px] font-bold font-mono">
                      {bookmarks.length}
                    </span>
                  )}
                </button>

                {/* Speaker Toggle inside Reader */}
                <button
                  type="button"
                  data-speaker-toggle="true"
                  onClick={() => audioSynth.togglePlay()}
                  title={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
                  className={`p-1 sm:p-1.5 rounded-lg border transition-all flex items-center justify-center text-xs ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-black border-[#D4AF37]' 
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-400 hover:text-white'
                  }`}
                >
                  {isPlaying ? <Volume2 className="w-3.5 h-3.5 text-black animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-[#E5A93C]" />}
                </button>

                {/* FULL SCREEN TOGGLE BUTTON */}
                <button
                  onClick={toggleFullScreen}
                  title="Full Screen Reader"
                  className="p-1 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white border border-[#FFE58F]/50 hover:scale-105 transition-all flex items-center gap-1 font-cinzel text-xs shadow-md font-bold"
                >
                  <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="hidden sm:inline">Full</span>
                </button>

              </div>

            </div>

            {/* PAGE STAGE WITH NATURAL SWIPE & 3D PAGE FLIP EFFECT */}
            <div 
              className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[490px] sm:min-h-[630px] my-auto py-1 overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Tap navigation margin hints */}
              <div 
                onClick={handlePageClick}
                className="relative w-full max-w-[480px] sm:max-w-[560px] h-[500px] sm:h-[630px] flex items-center justify-center"
                style={{ 
                  transform: `scale(${zoomLevel / 100})`, 
                  transformOrigin: 'center center', 
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  perspective: 1200
                }}
              >
                <div className="absolute inset-x-6 bottom-1 h-5 bg-black/70 blur-xl rounded-full pointer-events-none" />

                {/* Physical Book Spine & Shadow Frame */}
                <div className="relative w-full h-full bg-[#0E0C0A] rounded-2xl p-1.5 sm:p-2.5 shadow-2xl border border-[#2D241E] flex items-center justify-center overflow-hidden">
                  
                  {/* Subtle Book Spine Center Crease */}
                  <div className="absolute left-2 top-0 bottom-0 w-3 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none z-20" />
                  
                  {/* Realistic 3D Page Container */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <AnimatePresence initial={false} mode="wait">
                      <motion.div
                        key={currentPage}
                        initial={{ 
                          opacity: 0.3, 
                          rotateY: direction > 0 ? 45 : -45,
                          scale: 0.96,
                          x: direction > 0 ? 50 : -50,
                          transformOrigin: direction > 0 ? 'left center' : 'right center'
                        }}
                        animate={{ 
                          opacity: 1, 
                          rotateY: isDragging ? currentDragAngle : 0,
                          scale: 1,
                          x: isDragging ? dragOffset * 0.4 : 0,
                          transformOrigin: dragOffset < 0 ? 'left center' : 'right center'
                        }}
                        exit={{ 
                          opacity: 0.3, 
                          rotateY: direction > 0 ? -45 : 45,
                          scale: 0.96,
                          x: direction > 0 ? -50 : 50,
                          transformOrigin: direction > 0 ? 'right center' : 'left center'
                        }}
                        transition={isDragging ? { duration: 0 } : { duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                        style={{ 
                          transformStyle: 'preserve-3d', 
                          willChange: 'transform',
                          backfaceVisibility: 'hidden'
                        }}
                        className="w-full h-full flex items-center justify-center relative"
                      >
                      {/* The Printed Manuscript Page Sheet */}
                      <div className="relative max-h-[490px] sm:max-h-[615px] max-w-[96%] sm:max-w-[92%] rounded-lg sm:rounded-xl shadow-2xl overflow-hidden bg-[#FAFAF8] border border-stone-300/80">
                        
                        {/* Dynamic Book Page Spine Shadow Overlay during drag */}
                        {isDragging && Math.abs(dragOffset) > 5 && (
                          <div 
                            className="absolute inset-0 pointer-events-none z-30 transition-opacity"
                            style={{
                              background: dragOffset < 0 
                                ? 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 30%, transparent 100%)'
                                : 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 30%, transparent 100%)',
                              opacity: Math.min(0.8, Math.abs(dragOffset) / 120)
                            }}
                          />
                        )}

                        {/* Interactive Clickable Golden Bookmark Ribbon on Top Right */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(currentPage);
                          }}
                          title={isCurrentBookmarked ? "Click to unbookmark" : "Click to bookmark this page"}
                          className={`absolute top-0 right-4 sm:right-6 z-40 cursor-pointer group transition-all duration-300 ${
                            isCurrentBookmarked 
                              ? 'w-6 sm:w-7 h-11 sm:h-12 bg-gradient-to-b from-[#D4AF37] to-[#B8860B] shadow-lg' 
                              : 'w-5 sm:w-6 h-8 sm:h-9 bg-black/40 hover:bg-[#D4AF37]/80'
                          } rounded-b-md flex items-end justify-center pb-1.5`}
                        >
                          <Bookmark 
                            className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                              isCurrentBookmarked ? 'fill-black text-black' : 'text-stone-300 group-hover:text-black'
                            }`} 
                          />
                        </div>

                        {/* TEXT HIGHLIGHT OVERLAY (If page is highlighted) */}
                        {currentHighlight && (
                          <div 
                            className="absolute inset-0 pointer-events-none z-20 transition-all duration-500"
                            style={{
                              background: `linear-gradient(135deg, ${currentHighlight.color}15 0%, transparent 60%)`,
                              boxShadow: `inset 0 0 25px ${currentHighlight.color}30`
                            }}
                          >
                            <div 
                              className="absolute top-0 left-0 right-0 h-1.5"
                              style={{ backgroundColor: currentHighlight.color }}
                            />
                            {currentHighlight.note && (
                              <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded bg-black/80 backdrop-blur-sm border border-white/20 text-[10px] text-amber-200 font-serif line-clamp-1">
                                Note: {currentHighlight.note}
                              </div>
                            )}
                          </div>
                        )}

                        {/* High-Resolution Manuscript Page */}
                        <img
                          src={getPageSrc(currentPage)}
                          alt={`Wilting of Words - Page ${currentPage}`}
                          className="max-h-[490px] sm:max-h-[615px] w-auto h-auto object-contain block mx-auto select-none pointer-events-none"
                          loading="eager"
                          decoding="async"
                          draggable={false}
                        />
                      </div>
                    </motion.div>
                    </AnimatePresence>
                  </div>

                </div>
              </div>

              {/* Natural Swipe Gesture Instructions Hint */}
              <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-stone-500 font-sans tracking-wide">
                <button onClick={turnPrev} className="hover:text-stone-300 transition-colors">← Prev</button>
                <span className="w-1 h-1 rounded-full bg-[#E5A93C]" />
                <span className="text-stone-400 font-medium">Page {currentPage} of {TOTAL_PAGES}</span>
                <span className="w-1 h-1 rounded-full bg-[#E5A93C]" />
                <button onClick={turnNext} className="hover:text-stone-300 transition-colors">Next →</button>
              </div>

            </div>

            {/* Bottom Bar: Current Page Number + Range Slider + Reading Progress */}
            <div className="pt-2 sm:pt-3 flex items-center justify-between gap-4 relative">
              
              <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-[280px] sm:max-w-md">
                <button 
                  onClick={turnToFirst}
                  title="First Page"
                  className="text-stone-500 hover:text-[#E5A93C] text-[10px] font-cinzel uppercase shrink-0"
                >
                  Pg 1
                </button>
                <span className="font-mono text-xs sm:text-sm text-[#E5A93C] font-bold tabular-nums">
                  {currentPage}
                </span>
                <input
                  type="range"
                  min={1}
                  max={TOTAL_PAGES}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    soundEffects.playPageTurnSound();
                    setDirection(val > currentPage ? 1 : -1);
                    setCurrentPage(val);
                  }}
                  className="w-full h-1.5 accent-[#E5A93C] bg-[#2C241E] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                  {TOTAL_PAGES}
                </span>
                <button 
                  onClick={turnToLast}
                  title="Last Page"
                  className="text-stone-500 hover:text-[#E5A93C] text-[10px] font-cinzel uppercase shrink-0"
                >
                  Pg 219
                </button>
              </div>

              <div className="flex items-center gap-2 text-right text-[11px] sm:text-xs text-stone-400 font-cinzel">
                <span className="text-[#E5A93C] font-bold">{Math.round((currentPage / TOTAL_PAGES) * 100)}%</span>
                <span className="hidden sm:inline text-stone-500">Read</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* DEDICATED HIGHLIGHTING MENU / DRAWER (SEPARATE MENU AS REQUESTED) */}
      <AnimatePresence>
        {showHighlightDrawer && (
          <div className="fixed inset-0 z-[120] flex justify-end bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-w-md h-full bg-[#14100D] border-l border-[#2D241E] text-stone-200 flex flex-col p-4 sm:p-6 shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2B221B]">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#E5A93C]" />
                  <h3 className="font-cinzel text-base font-bold text-white tracking-wider">
                    ANNOTATIONS & HIGHLIGHTS
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#2A1E14] text-[#E5A93C] border border-[#E5A93C]/30 text-xs font-mono font-bold">
                    {highlights.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowHighlightDrawer(false)}
                  className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reader Profile & Cloud Progress Sync Panel */}
              <div className="p-3.5 rounded-2xl bg-[#1A1410] border border-[#D4AF37]/35 shadow-inner space-y-2.5 my-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-cinzel font-bold text-stone-400 tracking-wider">
                    CLOUD PROGRESS SYNC
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-sans font-bold uppercase ${
                    currentUser 
                      ? syncStatus === 'syncing'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : syncStatus === 'error'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone-500/10 text-stone-400 border border-stone-500/30'
                  }`}>
                    {currentUser 
                      ? syncStatus === 'syncing' 
                        ? 'SYNCING...' 
                        : syncStatus === 'error' 
                          ? 'SYNC ERROR' 
                          : 'CLOUD SYNCED'
                      : 'LOCAL ONLY'}
                  </span>
                </div>

                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-[#B93826] text-white flex items-center justify-center font-cinzel font-bold text-[9px] shrink-0">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="block text-[11px] font-bold text-stone-200 truncate leading-none mb-0.5">
                            {currentUser.name}
                          </span>
                          <span className="block text-[9px] text-stone-500 truncate leading-none">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#E5A93C] font-semibold shrink-0 bg-black/30 px-1.5 py-0.5 rounded">
                        Pg {currentPage}
                      </span>
                    </div>

                    {/* Sync Manual Controls */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={async () => {
                          try {
                            setSyncStatus('syncing');
                            await saveReaderProgressToFirebase(currentUser.email!, {
                              currentPage,
                              bookmarks,
                              highlights
                            });
                            setSyncStatus('synced');
                            showToast('Progress backed up to Cloud!', 'highlight');
                          } catch (e) {
                            setSyncStatus('error');
                          }
                        }}
                        disabled={syncStatus === 'syncing'}
                        className="py-1.5 px-2 rounded-lg bg-[#2A1F18]/80 border border-[#D4AF37]/30 hover:bg-[#3E2D21] transition-all text-[10px] font-cinzel font-bold text-amber-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Backup local bookmarks & highlights to Cloud"
                      >
                        <Send className="w-3 h-3" />
                        <span>PUSH CLOUD</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            setSyncStatus('syncing');
                            const cloudData = await getReaderProgressFromFirebase(currentUser.email!);
                            if (cloudData) {
                              setCurrentPage(cloudData.currentPage);
                              setBookmarks(cloudData.bookmarks);
                              setHighlights(cloudData.highlights);
                              setSyncStatus('synced');
                              showToast('Progress loaded from Cloud!', 'highlight');
                            } else {
                              showToast('No cloud progress found', 'remove');
                              setSyncStatus('idle');
                            }
                          } catch (e) {
                            setSyncStatus('error');
                          }
                        }}
                        disabled={syncStatus === 'syncing'}
                        className="py-1.5 px-2 rounded-lg bg-[#2A1F18]/80 border border-[#D4AF37]/30 hover:bg-[#3E2D21] transition-all text-[10px] font-cinzel font-bold text-amber-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Restore bookmarks & highlights from Cloud"
                      >
                        <Layers className="w-3 h-3" />
                        <span>LOAD CLOUD</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <p className="text-[11px] text-stone-500 font-serif">
                      Sign in to automatically sync your bookmarks, notes, and progress to the cloud.
                    </p>
                    <button
                      onClick={() => {
                        setShowHighlightDrawer(false);
                        if (onAuthTrigger) onAuthTrigger();
                      }}
                      className="px-4 py-1.5 rounded-full bg-[#B93826] hover:bg-[#8B2213] text-white text-[10px] font-cinzel font-bold tracking-wider cursor-pointer shadow transition-all"
                    >
                      CONNECT CLOUD ACCOUNT
                    </button>
                  </div>
                )}
              </div>

              {/* Highlight Action Panel for Current Page */}
              <div className="py-4 border-b border-[#2B221B] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-cinzel text-xs font-bold text-stone-300 uppercase">
                    Annotate Page {currentPage}
                  </span>
                  {currentHighlight && (
                    <button
                      onClick={() => handleRemoveHighlight(currentPage)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Note</span>
                    </button>
                  )}
                </div>

                {/* Color Palette Selector */}
                <div className="flex items-center gap-2">
                  {HIGHLIGHT_PALETTE.map((pal) => (
                    <button
                      key={pal.hex}
                      onClick={() => setSelectedHighlightColor(pal.hex)}
                      title={pal.name}
                      style={{ backgroundColor: pal.hex }}
                      className={`w-7 h-7 rounded-full transition-all flex items-center justify-center shadow-md cursor-pointer ${
                        selectedHighlightColor === pal.hex 
                          ? 'ring-2 ring-white scale-110' 
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {selectedHighlightColor === pal.hex && (
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Note/Quote Attachment Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-cinzel text-stone-400 uppercase tracking-wider block">
                    Write Margin Note & Page Annotation (Persistent)
                  </label>
                  <input
                    type="text"
                    value={highlightNoteInput}
                    onChange={(e) => setHighlightNoteInput(e.target.value)}
                    placeholder="e.g. Memorable quotes, character details, or personal critiques..."
                    className="w-full px-3 py-2 rounded-xl bg-[#1C1612] border border-[#3A2D22] text-xs text-stone-200 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  onClick={handleSaveHighlight}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] hover:from-[#A22B1A] hover:to-[#C44E20] text-white font-cinzel text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{currentHighlight ? 'Update Annotation' : 'Save Page Annotation'}</span>
                </button>
              </div>

              {/* List of All Highlighted Pages */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-3">
                <span className="text-[11px] font-cinzel text-stone-400 uppercase tracking-wider block mb-1">
                  Saved Annotations Directory ({highlights.length})
                </span>

                {highlights.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-stone-500">
                    <PenTool className="w-10 h-10 stroke-[1.2] text-[#E5A93C] mb-2 animate-bounce" />
                    <p className="font-cinzel text-xs text-stone-300">No Annotations Saved</p>
                    <p className="text-[11px] text-stone-500 max-w-xs mt-1">
                      Choose a color tag and scribble your margin notes above to document your thoughts while reading.
                    </p>
                  </div>
                ) : (
                  highlights.map((hl) => (
                    <div
                      key={`hl-${hl.page}`}
                      onClick={() => {
                        soundEffects.playPageTurnSound();
                        setDirection(hl.page > currentPage ? 1 : -1);
                        setCurrentPage(hl.page);
                        setShowHighlightDrawer(false);
                      }}
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        hl.page === currentPage 
                          ? 'bg-[#2A1E14] border-[#E5A93C] shadow-md shadow-[#E5A93C]/10' 
                          : 'bg-[#181310] border-[#2A2018] hover:border-[#3D2D20] hover:bg-[#1E1814]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-10 rounded-full shrink-0" 
                          style={{ backgroundColor: hl.color }} 
                        />

                        <div>
                          <div className="font-cinzel text-xs font-bold text-white group-hover:text-[#E5A93C] transition-colors flex items-center gap-2">
                            <span>Page {hl.page}</span>
                            <span 
                              className="text-[9px] px-1.5 py-0.2 rounded font-sans uppercase font-bold"
                              style={{ color: hl.color, backgroundColor: `${hl.color}20` }}
                            >
                              {hl.colorName}
                            </span>
                          </div>
                          {hl.note && (
                            <p className="text-[11px] text-stone-300 font-serif italic mt-0.5 line-clamp-1">
                              "{hl.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHighlight(hl.page);
                        }}
                        title="Remove Highlight"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="pt-3 border-t border-[#2B221B] flex items-center justify-between text-[11px] text-stone-500">
                <span>Highlights preserved in browser</span>
                {highlights.length > 0 && (
                  <button
                    onClick={() => {
                      setHighlights([]);
                      showToast('Cleared all highlights', 'remove');
                    }}
                    className="text-red-400/80 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEDICATED BOOKMARKS DRAWER (SLIDE-OVER PANEL) */}
      <AnimatePresence>
        {showBookmarksDrawer && (
          <div className="fixed inset-0 z-[120] flex justify-end bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-w-md h-full bg-[#14100D] border-l border-[#2D241E] text-stone-200 flex flex-col p-4 sm:p-6 shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2B221B]">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#E5A93C] fill-current" />
                  <h3 className="font-cinzel text-base font-bold text-white tracking-wider">
                    SAVED BOOKMARKS
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#2A1E14] text-[#E5A93C] border border-[#E5A93C]/30 text-xs font-mono font-bold">
                    {bookmarks.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowBookmarksDrawer(false)}
                  className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reader Profile & Cloud Progress Sync Panel */}
              <div className="p-3.5 rounded-2xl bg-[#1A1410] border border-[#D4AF37]/35 shadow-inner space-y-2.5 my-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-cinzel font-bold text-stone-400 tracking-wider">
                    CLOUD PROGRESS SYNC
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-sans font-bold uppercase ${
                    currentUser 
                      ? syncStatus === 'syncing'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : syncStatus === 'error'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone-500/10 text-stone-400 border border-stone-500/30'
                  }`}>
                    {currentUser 
                      ? syncStatus === 'syncing' 
                        ? 'SYNCING...' 
                        : syncStatus === 'error' 
                          ? 'SYNC ERROR' 
                          : 'CLOUD SYNCED'
                      : 'LOCAL ONLY'}
                  </span>
                </div>

                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-[#B93826] text-white flex items-center justify-center font-cinzel font-bold text-[9px] shrink-0">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <span className="block text-[11px] font-bold text-stone-200 truncate leading-none mb-0.5">
                            {currentUser.name}
                          </span>
                          <span className="block text-[9px] text-stone-500 truncate leading-none">
                            {currentUser.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#E5A93C] font-semibold shrink-0 bg-black/30 px-1.5 py-0.5 rounded">
                        Pg {currentPage}
                      </span>
                    </div>

                    {/* Sync Manual Controls */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={async () => {
                          try {
                            setSyncStatus('syncing');
                            await saveReaderProgressToFirebase(currentUser.email!, {
                              currentPage,
                              bookmarks,
                              highlights
                            });
                            setSyncStatus('synced');
                            showToast('Progress backed up to Cloud!', 'highlight');
                          } catch (e) {
                            setSyncStatus('error');
                          }
                        }}
                        disabled={syncStatus === 'syncing'}
                        className="py-1.5 px-2 rounded-lg bg-[#2A1F18]/80 border border-[#D4AF37]/30 hover:bg-[#3E2D21] transition-all text-[10px] font-cinzel font-bold text-amber-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Backup local bookmarks & highlights to Cloud"
                      >
                        <Send className="w-3 h-3" />
                        <span>PUSH CLOUD</span>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            setSyncStatus('syncing');
                            const cloudData = await getReaderProgressFromFirebase(currentUser.email!);
                            if (cloudData) {
                              setCurrentPage(cloudData.currentPage);
                              setBookmarks(cloudData.bookmarks);
                              setHighlights(cloudData.highlights);
                              setSyncStatus('synced');
                              showToast('Progress loaded from Cloud!', 'highlight');
                            } else {
                              showToast('No cloud progress found', 'remove');
                              setSyncStatus('idle');
                            }
                          } catch (e) {
                            setSyncStatus('error');
                          }
                        }}
                        disabled={syncStatus === 'syncing'}
                        className="py-1.5 px-2 rounded-lg bg-[#2A1F18]/80 border border-[#D4AF37]/30 hover:bg-[#3E2D21] transition-all text-[10px] font-cinzel font-bold text-amber-200 hover:text-white flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Restore bookmarks & highlights from Cloud"
                      >
                        <Layers className="w-3 h-3" />
                        <span>LOAD CLOUD</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <p className="text-[11px] text-stone-500 font-serif">
                      Sign in to automatically sync your bookmarks, notes, and progress to the cloud.
                    </p>
                    <button
                      onClick={() => {
                        setShowBookmarksDrawer(false);
                        if (onAuthTrigger) onAuthTrigger();
                      }}
                      className="px-4 py-1.5 rounded-full bg-[#B93826] hover:bg-[#8B2213] text-white text-[10px] font-cinzel font-bold tracking-wider cursor-pointer shadow transition-all"
                    >
                      CONNECT CLOUD ACCOUNT
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Actions */}
              <div className="py-3 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleBookmark(currentPage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241B15] border border-[#3E2D20] text-[#E5A93C] hover:bg-[#2F231B] transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isCurrentBookmarked ? 'Unbookmark Current' : `Bookmark Page ${currentPage}`}</span>
                </button>

                {bookmarks.length > 0 && (
                  <button
                    onClick={() => {
                      setBookmarks([]);
                      showToast('Cleared all bookmarks', 'remove');
                    }}
                    className="flex items-center gap-1 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Bookmarks List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
                {bookmarks.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
                    <Bookmark className="w-12 h-12 stroke-[1.2] text-stone-600 mb-3" />
                    <p className="font-cinzel text-sm text-stone-300 mb-1">No Bookmarks Saved</p>
                    <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                      Tap the golden silk ribbon on the top-right of any page or click "Mark" to save your place in the manuscript.
                    </p>
                  </div>
                ) : (
                  bookmarks.map((page) => (
                    <div
                      key={`bm-${page}`}
                      onClick={() => {
                        soundEffects.playPageTurnSound();
                        setDirection(page > currentPage ? 1 : -1);
                        setCurrentPage(page);
                        setShowBookmarksDrawer(false);
                      }}
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        page === currentPage 
                          ? 'bg-[#2A1E14] border-[#E5A93C] shadow-md shadow-[#E5A93C]/10' 
                          : 'bg-[#181310] border-[#2A2018] hover:border-[#3D2D20] hover:bg-[#1E1814]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Page Mini Thumbnail */}
                        <div className="w-10 h-14 rounded overflow-hidden border border-stone-700 bg-black shrink-0 relative">
                          <img
                            src={getPageSrc(page)}
                            alt={`Page ${page}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute top-0 right-0.5 w-2 h-3 bg-[#E5A93C] rounded-b-sm" />
                        </div>

                        <div>
                          <div className="font-cinzel text-sm font-bold text-white group-hover:text-[#E5A93C] transition-colors flex items-center gap-2">
                            <span>Manuscript Page {page}</span>
                            {page === currentPage && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#E5A93C] text-black font-sans font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 font-sans mt-0.5">
                            {Math.round((page / TOTAL_PAGES) * 100)}% through Wilting of Words
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(page);
                          }}
                          title="Remove bookmark"
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="pt-3 border-t border-[#2B221B] text-center text-[11px] text-stone-500 font-sans">
                Bookmarks are automatically preserved across your reading sessions.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEDICATED IN-READER REVIEW & REFLECTIONS MODAL */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#14100D] border-2 border-[#D4AF37]/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden text-stone-200 relative"
            >
              {/* Modal Header */}
              <div className="p-4 sm:px-6 border-b border-[#2C231C] bg-[#1A1410] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white flex items-center justify-center shadow-md shrink-0">
                    <MessageSquareQuote className="w-4 h-4 text-amber-200" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
                      <span>READER REFLECTIONS</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B93826]/20 border border-[#B93826]/40 text-amber-300 font-sans font-semibold">
                        Page {currentPage} of {TOTAL_PAGES}
                      </span>
                    </h3>
                    <p className="text-[11px] text-stone-400 font-serif">
                      Live sync across all readers • Permanent cloud archive
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-Header Tab Switcher */}
              <div className="flex border-b border-[#2C231C] bg-[#120E0B]">
                <button
                  onClick={() => setActiveReviewTab('write')}
                  className={`flex-1 py-2.5 px-3 text-xs font-cinzel font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                    activeReviewTab === 'write'
                      ? 'border-[#E5A93C] text-[#E5A93C] bg-white/5'
                      : 'border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>Write Review (Pg {currentPage})</span>
                </button>

                <button
                  onClick={() => setActiveReviewTab('read')}
                  className={`flex-1 py-2.5 px-3 text-xs font-cinzel font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                    activeReviewTab === 'read'
                      ? 'border-[#E5A93C] text-[#E5A93C] bg-white/5'
                      : 'border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>All Reviews ({communityReviews.length})</span>
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeReviewTab === 'write' ? (
                  <form onSubmit={handleInReaderReviewSubmit} className="space-y-3.5">
                    {/* Sanctuary Community Guidelines Banner */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed font-serif">
                      <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold font-cinzel tracking-wide block text-[11px] text-amber-200 mb-0.5">
                          SANCTUARY READER REGISTRY
                        </span>
                        <span>
                          Honest <strong>positive</strong> and <strong>constructive negative</strong> reviews are both welcomed! Please maintain thoughtful literary reflections.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-cinzel font-bold text-stone-300 mb-1">
                          YOUR NAME *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          placeholder="e.g. Pratyay Saha"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-[#1A1512] border border-[#3E2D20] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#E5A93C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-cinzel font-bold text-stone-300 mb-1">
                          CITY / LOCATION
                        </label>
                        <input
                          type="text"
                          value={reviewLocation}
                          onChange={(e) => setReviewLocation(e.target.value)}
                          placeholder="e.g. Bagula / West Bengal"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-[#1A1512] border border-[#3E2D20] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#E5A93C]"
                        />
                      </div>
                    </div>

                    {/* Page Tag Option */}
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <input
                        type="checkbox"
                        id="tag-page-checkbox"
                        checked={includePageTag}
                        onChange={(e) => setIncludePageTag(e.target.checked)}
                        className="rounded accent-[#B93826] cursor-pointer"
                      />
                      <label htmlFor="tag-page-checkbox" className="font-sans text-stone-300 cursor-pointer">
                        Tag this review with <strong className="text-[#E5A93C] font-mono">Page {currentPage}</strong> of Wilting of Words
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-cinzel font-bold text-stone-300">
                          YOUR REVIEW & CRITIQUE *
                        </label>
                        <span className="text-[10px] text-stone-400 font-sans">
                          Positive or negative critique accepted
                        </span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        placeholder={`Share your authentic impressions about ${includePageTag ? `Page ${currentPage}` : 'the novel'}... What moved you? What would you critique or change?`}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#1A1512] border border-[#3E2D20] text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#E5A93C] resize-none font-serif leading-relaxed"
                      />
                    </div>

                    {reviewFeedback && (
                      <div className={`flex items-start gap-2 p-3 rounded-2xl border text-xs leading-relaxed ${
                        reviewFeedback.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        {reviewFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                        )}
                        <span className="font-serif">{reviewFeedback.text}</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-[10px] text-stone-500 font-sans">
                        Broadcasts live to all readers globally
                      </span>

                      <button
                        type="submit"
                        disabled={reviewSubmitting || reviewVerifying}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#B93826] to-[#D85A2A] hover:opacity-95 text-white font-cinzel font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#B93826]/30 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {reviewVerifying ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-200" />
                            <span>VERIFYING WITH AI...</span>
                          </>
                        ) : reviewSubmitting ? (
                          <>
                            <Flame className="w-3.5 h-3.5 animate-pulse text-amber-200" />
                            <span>ENGRAVING IN CLOUD...</span>
                          </>
                        ) : (
                          <>
                            <span>ENGRAVE REVIEW</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-cinzel font-bold text-stone-300">
                        COMMUNITY ARCHIVE ({communityReviews.length})
                      </span>
                      <button
                        onClick={() => setActiveReviewTab('write')}
                        className="text-xs font-cinzel text-[#E5A93C] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Feather className="w-3 h-3" />
                        <span>Write a Review</span>
                      </button>
                    </div>

                    {communityReviews.length === 0 ? (
                      <div className="text-center py-10 px-4 rounded-2xl border border-[#2D241E] bg-[#181310] text-stone-400">
                        <MessageSquare className="w-8 h-8 mx-auto text-[#B93826] opacity-60 mb-2" />
                        <p className="font-cinzel text-xs font-bold text-stone-200">No Reviews in Archive</p>
                        <p className="text-xs text-stone-500 font-serif italic mt-1">
                          Previous reviews were cleared. Be the first reader to write a review!
                        </p>
                        <button
                          onClick={() => setActiveReviewTab('write')}
                          className="mt-3 px-4 py-1.5 rounded-full bg-[#B93826] text-white text-xs font-cinzel font-bold hover:bg-[#8B2213] transition-colors cursor-pointer"
                        >
                          Write the First Review
                        </button>
                      </div>
                    ) : (
                      communityReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3.5 rounded-2xl border border-[#2E241E] bg-[#181310] text-stone-200 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#B93826] to-[#D85A2A] text-white flex items-center justify-center text-[11px] font-bold font-cinzel">
                                {rev.author.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold font-cinzel text-xs text-stone-100">
                                    {rev.author}
                                  </span>
                                  {rev.pageNumber && (
                                    <span className="px-1.5 py-0.2 rounded bg-black/40 border border-[#D4AF37]/30 text-[9px] font-cinzel text-[#E5A93C] font-semibold">
                                      Pg {rev.pageNumber}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-stone-500 font-sans">
                                  {rev.location} · {rev.time}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleLikeInModal(rev.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                                likedReviewIds.includes(rev.id)
                                  ? 'bg-rose-500/20 text-rose-400 font-semibold'
                                  : 'bg-white/5 hover:bg-rose-500/10 text-stone-400 hover:text-rose-400'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${likedReviewIds.includes(rev.id) ? 'fill-current' : ''}`} />
                              <span className="font-mono text-[11px]">{rev.likes}</span>
                            </button>
                          </div>

                          <p className="text-xs font-serif leading-relaxed text-stone-300">
                            "{rev.message}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 px-6 border-t border-[#2C231C] bg-[#120E0B] flex items-center justify-between text-[11px] text-stone-500">
                <span>Permanently synced to all reader devices via Firestore</span>
                <button
                  onClick={handleScrollToReflections}
                  className="text-[#E5A93C] hover:underline font-cinzel text-[11px] cursor-pointer"
                >
                  View Full Page Feed ↓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEDICATED FULL-SCREEN IMMERSIVE READER MODAL WITH ALL TOOLS */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0806] text-white flex flex-col justify-between p-2 sm:p-4 overflow-hidden"
          >
            {/* Full Screen Top Control Bar */}
            <header className="flex items-center justify-between gap-1.5 sm:gap-2 p-2 sm:px-4 bg-[#14100D] rounded-2xl border border-[#2D241E] shadow-2xl flex-wrap">
              
              {/* Back & First/Last Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => setIsFullScreen(false)}
                  title="Back to normal view"
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1 font-cinzel text-xs font-bold shadow-lg border border-[#FFE58F]/50 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Back</span>
                </button>

                <button
                  onClick={turnToFirst}
                  disabled={currentPage === 1}
                  title="First Page"
                  className="p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={turnPrev}
                  disabled={currentPage === 1}
                  title="Previous Page"
                  className="p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="text-stone-300 font-mono text-xs bg-[#201813] px-2.5 py-1 rounded-lg border border-[#3E2D20] font-bold">
                  {currentPage} / {TOTAL_PAGES}
                </span>

                <button
                  onClick={turnNext}
                  disabled={currentPage === TOTAL_PAGES}
                  title="Next Page"
                  className="p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={turnToLast}
                  disabled={currentPage === TOTAL_PAGES}
                  title="Last Page"
                  className="p-1.5 rounded-lg bg-[#1C1815] border border-[#2D241E] text-stone-400 hover:text-white disabled:opacity-40"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Full Screen Top Actions (Right) */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
                
                {/* Full Screen Zoom Controls */}
                <div className="flex items-center gap-0.5 bg-[#1C1815] p-0.5 rounded-lg border border-[#2D241E]">
                  <button
                    onClick={() => setZoomLevel(z => Math.max(75, z - 15))}
                    title="Zoom Out"
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    <ZoomOut className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    title="Reset Zoom"
                    className="px-1 text-xs font-mono text-[#E5A93C]"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    onClick={() => setZoomLevel(z => Math.min(180, z + 15))}
                    title="Zoom In"
                    className="p-1 text-stone-400 hover:text-white"
                  >
                    <ZoomIn className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>

                {/* Highlight Button in Full Screen */}
                <button
                  onClick={() => setShowHighlightDrawer(true)}
                  title="Highlight Menu"
                  className="p-1.5 px-2.5 rounded-xl border border-[#2D241E] bg-[#1C1815] text-[#E5A93C] flex items-center gap-1 text-xs font-cinzel cursor-pointer"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Highlight</span>
                </button>

                {/* Direct Review in Full Screen */}
                <button
                  onClick={handleOpenReviewModal}
                  title="Write or view review on current page"
                  className="p-1.5 px-3 rounded-xl border border-[#B93826] bg-[#B93826]/30 hover:bg-[#B93826] text-amber-200 hover:text-white flex items-center gap-1.5 text-xs font-cinzel font-bold cursor-pointer transition-all shadow-md active:scale-95"
                >
                  <MessageSquareQuote className="w-3.5 h-3.5 text-[#E5A93C]" />
                  <span>Review</span>
                  {communityReviews.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#E5A93C] text-black text-[10px] font-bold font-mono">
                      {communityReviews.length}
                    </span>
                  )}
                </button>

                {/* Speaker Button in Full Screen */}
                <button
                  type="button"
                  data-speaker-toggle="true"
                  onClick={() => audioSynth.togglePlay()}
                  title={isPlaying ? 'Pause Music' : 'Play Music'}
                  className={`p-1.5 px-2.5 rounded-xl border transition-all text-xs font-cinzel font-bold flex items-center gap-1 ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93C] text-black border-[#D4AF37] shadow-md' 
                      : 'bg-[#1C1815] border-[#2D241E] text-stone-300 hover:text-white'
                  }`}
                >
                  {isPlaying ? <Volume2 className="w-3.5 h-3.5 text-black animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-[#E5A93C]" />}
                </button>

                {/* Close Full Screen Icon Button */}
                <button
                  onClick={() => setIsFullScreen(false)}
                  title="Exit Full Screen"
                  className="p-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 transition-all shadow-sm"
                >
                  <Minimize2 className="w-4 h-4 stroke-[2]" />
                </button>

              </div>
            </header>

            {/* Full Screen Page Display with Zoom and Swipe */}
            <main 
              className="flex-1 w-full flex flex-col items-center justify-center relative my-auto py-1 overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                onClick={handlePageClick}
                className="relative max-h-[80vh] max-w-[95%] sm:max-w-[85%] flex items-center justify-center"
                style={{ 
                  transform: `scale(${zoomLevel / 100})`, 
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  perspective: 1200 
                }}
              >
                <motion.div
                  key={currentPage}
                  initial={{ 
                    opacity: 0.85, 
                    rotateY: direction > 0 ? 30 : -30,
                    transformOrigin: direction > 0 ? 'left center' : 'right center'
                  }}
                  animate={{ 
                    opacity: 1, 
                    rotateY: isDragging ? currentDragAngle : 0,
                    x: isDragging ? dragOffset * 0.4 : 0,
                    transformOrigin: dragOffset < 0 ? 'left center' : 'right center'
                  }}
                  transition={isDragging ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  style={{ 
                    transformStyle: 'preserve-3d', 
                    willChange: 'transform',
                    backfaceVisibility: 'hidden'
                  }}
                  className="relative max-h-[80vh] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden bg-[#FAFAF8] border border-stone-300"
                >
                  {/* Dynamic Book Page Spine Shadow Overlay during drag */}
                  {isDragging && Math.abs(dragOffset) > 5 && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-30 transition-opacity"
                      style={{
                        background: dragOffset < 0 
                          ? 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 30%, transparent 100%)'
                          : 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 30%, transparent 100%)',
                        opacity: Math.min(0.8, Math.abs(dragOffset) / 120)
                      }}
                    />
                  )}

                  {/* Bookmark Ribbon on Top Right */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(currentPage);
                    }}
                    title={isCurrentBookmarked ? "Click to unbookmark" : "Click to bookmark this page"}
                    className={`absolute top-0 right-6 sm:right-8 z-40 cursor-pointer group transition-all duration-300 ${
                      isCurrentBookmarked 
                        ? 'w-7 sm:w-8 h-12 sm:h-14 bg-gradient-to-b from-[#D4AF37] to-[#B8860B] shadow-lg' 
                        : 'w-6 sm:w-7 h-9 sm:h-10 bg-black/40 hover:bg-[#D4AF37]/80'
                    } rounded-b-md flex items-end justify-center pb-2`}
                  >
                    <Bookmark 
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isCurrentBookmarked ? 'fill-black text-black' : 'text-stone-300 group-hover:text-black'
                      }`} 
                    />
                  </div>

                  {/* Highlight Overlay in Fullscreen */}
                  {currentHighlight && (
                    <div 
                      className="absolute inset-0 pointer-events-none z-20 transition-all duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${currentHighlight.color}15 0%, transparent 60%)`,
                        boxShadow: `inset 0 0 25px ${currentHighlight.color}30`
                      }}
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-2"
                        style={{ backgroundColor: currentHighlight.color }}
                      />
                    </div>
                  )}

                  <img
                    src={getPageSrc(currentPage)}
                    alt={`Wilting of Words - Page ${currentPage}`}
                    className="max-h-[80vh] w-auto h-auto object-contain block mx-auto select-none pointer-events-none"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </motion.div>
              </div>

              {/* Natural Swipe Gesture Instructions Hint */}
              <div className="flex items-center justify-center gap-3 pt-3 text-xs text-stone-500 font-sans tracking-wide">
                <span>← Swipe / tap left for previous</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                <span className="text-stone-300 font-medium">Page {currentPage} of {TOTAL_PAGES}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
                <span>Swipe / tap right for next →</span>
              </div>

            </main>

            {/* Full Screen Bottom Slider */}
            <footer className="flex items-center justify-between gap-4 p-2 sm:px-6 bg-[#14100D] rounded-2xl border border-[#2D241E]">
              <div className="flex items-center gap-3 flex-1 max-w-xl mx-auto">
                <button onClick={turnToFirst} className="text-stone-500 hover:text-[#E5A93C] text-xs font-cinzel">First</button>
                <span className="font-mono text-xs text-[#E5A93C] font-bold">
                  {currentPage}
                </span>
                <input
                  type="range"
                  min={1}
                  max={TOTAL_PAGES}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDirection(val > currentPage ? 1 : -1);
                    setCurrentPage(val);
                  }}
                  className="w-full h-1.5 accent-[#E5A93C] bg-[#2C241E] rounded-lg cursor-pointer"
                />
                <span className="font-mono text-xs text-stone-500">
                  {TOTAL_PAGES}
                </span>
                <button onClick={turnToLast} className="text-stone-500 hover:text-[#E5A93C] text-xs font-cinzel">Last</button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION POPUP */}
      <AnimatePresence>
        {bookmarkToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[150] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-cinzel font-bold border ${
              bookmarkToast.type === 'add' || bookmarkToast.type === 'highlight'
                ? 'bg-[#1C1814] border-[#E5A93C] text-[#E5A93C]' 
                : 'bg-[#1C1814] border-stone-600 text-stone-300'
            }`}
          >
            {bookmarkToast.type === 'highlight' ? (
              <Highlighter className="w-4 h-4 text-[#E5A93C]" />
            ) : (
              <Bookmark className={`w-4 h-4 ${bookmarkToast.type === 'add' ? 'fill-current text-[#E5A93C]' : 'text-stone-400'}`} />
            )}
            <span>{bookmarkToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
