import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Sparkles, 
  PenTool, 
  Globe, 
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Star,
  BookOpen,
  Info,
  Check,
  X as XIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  subscribeToReviews, 
  addReviewToFirebase, 
  likeReviewInFirebase,
  ReflectionRecord 
} from '../firebase';
import { AuthUser } from './AuthPortal';
import { ReviewArchiveModal } from './ReviewArchiveModal';

interface ReaderReflectionsProps {
  isDark: boolean;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: '1 Star · Critical / Major Flaws',
  2: '2 Stars · Fair / Needs Improvement',
  3: '3 Stars · Good / Thoughtful Story',
  4: '4 Stars · Very Good / Engaging Prose',
  5: '5 Stars · Exceptional / Loved It'
};

export const ReaderReflections: React.FC<ReaderReflectionsProps> = ({
  isDark,
  currentUser,
  onOpenAuth
}) => {
  const [reflections, setReflections] = useState<ReflectionRecord[]>([]);
  const [authorName, setAuthorName] = useState(() => {
    try {
      return currentUser?.name || currentUser?.email.split('@')[0] || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (currentUser) {
      setAuthorName(currentUser.name || currentUser.email.split('@')[0]);
    }
  }, [currentUser]);

  const [location, setLocation] = useState(() => {
    try {
      return localStorage.getItem('wilting_reader_location') || '';
    } catch {
      return '';
    }
  });

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error'; canRetry?: boolean } | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [existingUserReview, setExistingUserReview] = useState<ReflectionRecord | null>(null);
  const [isCheckingUserReview, setIsCheckingUserReview] = useState(false);

  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wow_liked_reflections');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Check if current authenticated user has already submitted a review
  useEffect(() => {
    if (!currentUser) {
      setExistingUserReview(null);
      return;
    }

    let isMounted = true;
    const checkUserReview = async () => {
      try {
        setIsCheckingUserReview(true);
        const token = localStorage.getItem('wilting_auth_token') || '';
        if (!token) return;

        const res = await fetch('/api/reviews/check-user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.hasReviewed && data.review) {
            setExistingUserReview({
              id: data.review.id,
              author: data.review.author || currentUser.name || 'Verified Reader',
              location: data.review.location || 'Chakdaha / West Bengal',
              rating: Number(data.review.rating) || 5,
              message: data.review.message,
              likes: data.review.likes || 1,
              time: data.review.time || 'Engraved in Registry',
              createdAt: data.review.createdAt || new Date().toISOString(),
              timestamp: Date.now(),
              status: 'approved'
            });
          }
        }
      } catch (e) {
        console.warn('[Reflections] Notice checking user review:', e);
      } finally {
        if (isMounted) setIsCheckingUserReview(false);
      }
    };

    checkUserReview();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Subscribe to live Firestore reviews
  useEffect(() => {
    const unsubscribe = subscribeToReviews((liveReviews) => {
      setReflections(liveReviews || []);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter approved reviews only
  const approvedReviews = reflections.filter(r => !r.status || r.status === 'approved');

  // Compute dynamic average rating from approved reviews only
  const ratedReviews = approvedReviews.filter(r => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5);
  const averageRating = ratedReviews.length > 0
    ? (ratedReviews.reduce((sum, r) => sum + r.rating, 0) / ratedReviews.length).toFixed(1)
    : '5.0';

  // Main review feed shows EXACTLY the 5 newest approved reviews
  const mainFeedReviews = approvedReviews.slice(0, 5);

  const handleRatingSelect = (selectedStar: number) => {
    setRating(selectedStar);
    if (feedbackMsg?.type === 'error' && feedbackMsg.text.includes('star rating')) {
      setFeedbackMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory User Authentication check
    if (!currentUser) {
      setFeedbackMsg({
        type: 'error',
        text: 'Authentication Required: Please sign in to your reader account to post a verified review on the sanctuary wall.'
      });
      if (onOpenAuth) onOpenAuth();
      return;
    }

    // 2. Mandatory Star Rating Check
    if (!rating || rating < 1 || rating > 5) {
      setFeedbackMsg({
        type: 'error',
        text: 'Mandatory Star Rating: Please select an interactive rating from 1 to 5 stars before submitting your review.'
      });
      return;
    }

    // 3. Mandatory Review Text Check
    if (!message.trim() || message.trim().length < 10) {
      setFeedbackMsg({
        type: 'error',
        text: 'Please write a thoughtful review containing at least 10 characters describing your impressions, thoughts, or suggestions.'
      });
      return;
    }

    // 4. Strict No Emojis or Emoticons client validation
    const containsEmoji = (text: string) => /[\p{Extended_Pictographic}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u.test(text);
    const containsEmoticon = (text: string) => [
      /(?<!\d)[:;=8B]-?[)D(\]\[|pPoO](?!\d)/,
      /(?<!\d)[:;=]-?3(?!\d)/,
      /(?<![a-zA-Z0-9])[:;=][cCsS](?![a-zA-Z0-9])/,
      /\b[xX]-?[dD]\b/,
      /<3|<\/3|[♡♥]/,
      /-_-|T_T|T-T|T\.T|Q_Q|Q\.Q|\^_+\^|\^-\^|\^\.\^|\^\^/,
      /o_O|O_o|o_o|O_O|o\.O|O\.o|OwO|UwU|owo|uwu/,
      />[:;=-]?[()]/
    ].some(p => p.test(text));

    if (containsEmoji(message) || containsEmoticon(message)) {
      setFeedbackMsg({
        type: 'error',
        text: 'Emojis and emoticons are strictly prohibited in literary reviews. Please remove all emojis and emoticons (e.g. smileys, hearts, :) ) and use text only.'
      });
      return;
    }

    // 5. Client-side flood protection (minimum 15s between clicks)
    const now = Date.now();
    if (now - lastSubmissionTime < 15000) {
      const waitSec = Math.ceil((15000 - (now - lastSubmissionTime)) / 1000);
      setFeedbackMsg({
        type: 'error',
        text: `Please wait ${waitSec} second${waitSec === 1 ? '' : 's'} before submitting another review.`
      });
      return;
    }

    if (submitting) return;

    setFeedbackMsg(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('wilting_auth_token') || '';
      
      // Save location in localStorage for convenience
      try {
        if (location.trim()) {
          localStorage.setItem('wilting_reader_location', location.trim());
        }
      } catch {}

      // Submit through secure backend moderation & rate-limiting pipeline
      const created = await addReviewToFirebase(
        authorName.trim(),
        location.trim() || 'Chakdaha / West Bengal',
        message.trim(),
        rating,
        token
      );

      setLastSubmissionTime(Date.now());
      setExistingUserReview(created);
      
      // Optimistically insert into local feed
      setReflections(prev => {
        if (prev.some(r => r.id === created.id)) return prev;
        return [created, ...prev];
      });

      // Clear input fields
      setMessage('');
      setRating(0);
      setHoverRating(0);

      setFeedbackMsg({
        type: 'success',
        text: 'Your review has been verified and engraved into the permanent public sanctuary registry!'
      });
      
      try {
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });
      } catch {}

      setTimeout(() => {
        setFeedbackMsg(null);
      }, 7000);

    } catch (err: any) {
      console.error('[Reflections] Submission error:', err);
      const isTech = err.code === 'technical_failure';
      if (err.review) {
        setExistingUserReview(err.review);
      }
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Could not post review. Please ensure your submission meets sanctuary guidelines.',
        canRetry: isTech
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedIds.includes(id)) return;
    const newLiked = [...likedIds, id];
    setLikedIds(newLiked);
    try {
      localStorage.setItem('wow_liked_reflections', JSON.stringify(newLiked));
    } catch {}

    // Optimistically update UI
    setReflections(prev => prev.map(r => r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r));

    // Update in Firestore permanently
    try {
      await likeReviewInFirebase(id);
    } catch (e) {
      console.warn('[Reflections] Could not increment like in Firestore:', e);
    }
  };

  return (
    <section id="reflections-section" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B93826]/10 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-3 border border-[#D4AF37]/35 shadow-xs">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>PERMANENT READER SANCTUARY FEED</span>
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>

        <h3 className={`font-cinzel text-2xl sm:text-4xl font-extrabold tracking-wide mb-3 ${
          isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
        }`}>
          Reader Reflections &amp; Reviews
        </h3>

        <p className="text-xs sm:text-sm text-[#6C5441] dark:text-[#C4B3A2] leading-relaxed">
          Every review is permanently stored and synchronized live across all readers. Share your authentic impressions—both praise and critical reviews are welcomed.
        </p>
      </div>

      {/* Review Submission Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border mb-10 sm:mb-14 shadow-xl transition-all ${
        isDark ? 'bg-[#1C1613] border-[#3E2D20]' : 'bg-white border-[#E8DFC8]'
      }`}>
        {!currentUser ? (
          <div className="py-8 px-4 text-center max-w-md mx-auto space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-cinzel text-base font-bold text-stone-900 dark:text-stone-100">
              Verified Reader Authentication Required
            </h4>
            <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed">
              To safeguard our literary sanctuary from vulgar slangs, trolls, and impersonation, readers must be signed into an authenticated account to publish reflections.
            </p>
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D4AF37] text-white font-cinzel text-xs font-bold uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Sign In to Post Review
              </button>
            )}
          </div>
        ) : existingUserReview ? (
          <div className="py-2 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-3 flex-wrap pb-3.5 border-b border-[#D4AF37]/25">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>YOUR PERMANENT ENGRAVED REFLECTION</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </h4>
                  <p className="text-[11px] font-serif text-stone-600 dark:text-stone-400">
                    Engraved in the sanctuary registry · 1 review per reader limit enforced
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-cinzel font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25">
                ENGRAVED &amp; APPROVED
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border ${
              isDark ? 'bg-[#181310] border-[#38281B]' : 'bg-[#FAF6EF] border-[#E8DEC9]'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= (existingUserReview.rating || 5)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300 dark:text-stone-600'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 ml-1.5">
                    {existingUserReview.rating || 5}.0 / 5
                  </span>
                </div>
                <span className="text-[10px] font-sans opacity-60 text-stone-500 dark:text-stone-400">
                  {existingUserReview.location} · {existingUserReview.time}
                </span>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed font-serif text-stone-800 dark:text-stone-200 pl-2 border-l-2 border-[#D4AF37]/50 italic">
                "{existingUserReview.message}"
              </p>
            </div>

            <p className="text-[11px] text-center font-serif text-stone-500 dark:text-stone-400 opacity-80 pt-1">
              To preserve authentic literary credibility, each verified reader account is permitted exactly one permanent review. Thank you for enriching the sanctuary!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Form Hierarchy: YOUR NAME * (VERIFIED ACCOUNT) & CITY / LOCATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80 font-cinzel text-stone-700 dark:text-stone-300">
                  YOUR NAME * <span className="text-[9px] text-amber-600 dark:text-amber-400 uppercase font-sans font-bold">(VERIFIED ACCOUNT)</span>
                </label>
                <input
                  type="text"
                  required
                  disabled
                  value={authorName}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-stone-100/60 dark:bg-stone-800/40 opacity-80 cursor-not-allowed focus:outline-none text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80 font-cinzel text-stone-700 dark:text-stone-300">
                  CITY / LOCATION
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chakdaha / West Bengal"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#B93826] text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            {/* 2. Form Hierarchy: YOUR RATING * (Amazon Kindle 5-Star System) */}
            <div className="p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-semibold font-cinzel text-stone-700 dark:text-stone-300">
                  YOUR RATING * <span className="text-[10px] font-sans font-normal text-amber-600 dark:text-amber-400">(Required)</span>
                </label>
                <span className="text-xs font-serif italic text-stone-600 dark:text-stone-400">
                  {hoverRating > 0 
                    ? RATING_DESCRIPTIONS[hoverRating] 
                    : rating > 0 
                      ? RATING_DESCRIPTIONS[rating] 
                      : 'Tap a star to rate from 1 to 5'}
                </span>
              </div>

              {/* Interactive 5-Star Row */}
              <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating from 1 to 5 stars">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isActive = (hoverRating || rating) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => handleRatingSelect(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-lg hover:bg-amber-500/10 focus:outline-none transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                      title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                      aria-label={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                          isActive
                            ? 'fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Form Hierarchy: YOUR THOUGHTS & CRITIQUE * */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <label className="block text-xs font-semibold font-cinzel text-stone-700 dark:text-stone-300">
                  YOUR THOUGHTS &amp; CRITIQUE *
                </label>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-sans">
                  Positive feedback, constructive critique &amp; suggestions welcomed
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your authentic reflections—what resonated with you, constructive critique, pacing suggestions, character thoughts, or advice for the author..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#B93826] resize-none text-stone-900 dark:text-stone-100"
              />
              <div className="flex items-center justify-between text-[10px] font-sans text-stone-400 dark:text-stone-500 mt-1 px-1">
                <span>Plain text only · No emojis or emoticons allowed</span>
                <span>{message.length}/2000</span>
              </div>
            </div>

            {/* 4. Elegant Literary Review Guidelines Box */}
            <div className="p-3.5 rounded-2xl border border-[#D4AF37]/35 bg-[#FAF6EE]/70 dark:bg-[#1A130F]/70 text-xs font-serif">
              <div className="flex items-center gap-1.5 font-cinzel text-[10px] font-bold tracking-widest uppercase text-[#8B2213] dark:text-[#E5A93C] mb-2">
                <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>REVIEW GUIDELINES</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] leading-relaxed">
                <div className="space-y-1 text-emerald-700 dark:text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Positive reviews are welcome</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Constructive criticism is welcome</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Suggestions are welcome</span>
                  </div>
                </div>

                <div className="space-y-1 text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <XIcon className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>No spam or promotional links</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <XIcon className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>No slangs, vulgar or abusive language</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <XIcon className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>No sexual content or unrelated promotions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error or Success Feedback Alert */}
            {feedbackMsg && (
              <div className={`flex items-start justify-between gap-2.5 p-3.5 rounded-2xl border text-xs leading-relaxed animate-fade-in ${
                feedbackMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                <div className="flex items-start gap-2.5 flex-1">
                  {feedbackMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  )}
                  <div className="font-serif">
                    <span>{feedbackMsg.text}</span>
                  </div>
                </div>

                {feedbackMsg.canRetry && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="shrink-0 px-3 py-1 rounded-full bg-[#B93826] hover:bg-[#8B2213] text-white text-[10px] font-cinzel font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] opacity-70 font-sans text-stone-500 dark:text-stone-400">
                <Globe className="w-3.5 h-3.5 text-[#B93826] shrink-0" />
                <span>Visible in real-time across every device upon moderation approval</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-7 py-2.5 bg-[#B93826] hover:bg-[#8B2213] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-xs font-cinzel font-bold tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#B93826]/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Flame className="w-3.5 h-3.5 animate-pulse text-amber-200" />
                    <span>VERIFYING &amp; PUBLISHING...</span>
                  </>
                ) : (
                  <>
                    <span>POST REVIEW</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Kindle-Style Aggregate Rating Display Above Feed */}
      <div className={`p-5 rounded-2xl border mb-6 transition-all ${
        isDark ? 'bg-[#181310] border-[#38281B]' : 'bg-[#FAF6EF] border-[#E8DEC9]'
      } flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm`}>
        <div className="flex items-center gap-3.5">
          <div className="text-center sm:text-left">
            <span className="font-cinzel text-3xl font-black text-[#8B2213] dark:text-[#FFE58F]">
              {averageRating}
            </span>
            <span className="text-xs font-serif opacity-70 ml-1">/ 5</span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-stone-300 dark:text-stone-600'
                  }`}
                />
              ))}
              <span className="font-cinzel font-bold text-xs ml-1.5 text-stone-800 dark:text-stone-200">
                {averageRating} / 5
              </span>
            </div>
            <p className="text-[11px] font-serif text-stone-600 dark:text-stone-400">
              Based on {approvedReviews.length} approved verified reader {approvedReviews.length === 1 ? 'reflection' : 'reflections'}
            </p>
          </div>
        </div>

        {approvedReviews.length > 5 && (
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="text-xs font-cinzel font-bold tracking-wider text-[#B93826] dark:text-[#E5A93C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All {approvedReviews.length} Reviews</span>
            <span>&rarr;</span>
          </button>
        )}
      </div>

      {/* Main Review Feed: EXACTLY 5 Most Recent Approved Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 mb-1">
          <h4 className="font-cinzel text-xs sm:text-sm font-bold tracking-widest uppercase text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <span>RECENT REFLECTIONS</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-mono">
              Showing {mainFeedReviews.length} of {approvedReviews.length}
            </span>
          </h4>
        </div>

        {mainFeedReviews.length > 0 ? (
          mainFeedReviews.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#181310] border-[#38281B]' : 'bg-[#FAF6EF] border-[#E8DEC9]'
              } shadow-xs hover:border-[#D4AF37]/50`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B93826] to-[#D85A2A] text-white flex items-center justify-center text-xs font-bold font-cinzel shadow-sm shrink-0 mt-0.5">
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-xs sm:text-sm font-cinzel text-stone-900 dark:text-stone-100">
                        {item.author}
                      </h5>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-serif font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        Verified Reader
                      </span>
                      {item.pageNumber && (
                        <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 text-[9px] font-cinzel text-[#8B2213] dark:text-[#E5A93C] font-semibold">
                          Pg {item.pageNumber}
                        </span>
                      )}
                    </div>

                    {/* Kindle-Style 5-Star Visual */}
                    <div className="flex items-center gap-1 text-amber-500 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (item.rating || 5)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 ml-1">
                        {item.rating || 5}.0
                      </span>
                    </div>

                    <p className="text-[10px] opacity-65 font-sans text-stone-600 dark:text-stone-400 mt-0.5">
                      {item.location} · {item.time}
                    </p>
                  </div>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => handleLike(item.id)}
                  title="Appreciate this review"
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                    likedIds.includes(item.id)
                      ? 'bg-rose-500/20 text-rose-500 font-semibold'
                      : 'bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 text-gray-500 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${likedIds.includes(item.id) ? 'fill-current' : ''}`} />
                  <span className="font-mono text-[11px]">{item.likes}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200 font-serif pt-1 pl-1 border-l-2 border-[#D4AF37]/30">
                "{item.message}"
              </p>
            </div>
          ))
        ) : (
          <div className={`text-center py-12 px-4 rounded-3xl border ${
            isDark ? 'bg-[#181310]/60 border-[#38281B]' : 'bg-[#FAF6EF]/60 border-[#E8DEC9]'
          }`}>
            <PenTool className="w-8 h-8 mx-auto text-[#B93826] opacity-60 mb-2.5" />
            <p className="font-cinzel text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              No Public Reviews Yet
            </p>
            <p className="text-xs opacity-75 font-serif italic text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Be the first reader to share your verified review and star rating above!
            </p>
          </div>
        )}

        {/* 8. Full Review Archive Button: “UNLEASH MORE REVIEWS” */}
        {approvedReviews.length > 5 && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D4AF37] hover:brightness-110 text-white font-cinzel font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2.5 mx-auto border border-amber-300/40 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>UNLEASH MORE REVIEWS ({approvedReviews.length - 5} MORE)</span>
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            </button>
          </div>
        )}
      </div>

      {/* Review Archive Modal */}
      <ReviewArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        isDark={isDark}
        reviews={approvedReviews}
        onLike={handleLike}
        likedIds={likedIds}
      />

    </section>
  );
};
