import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Heart, 
  BookOpen, 
  MessageSquare, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ReflectionRecord } from '../firebase';

interface ReviewArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  reviews: ReflectionRecord[];
  onLike: (id: string) => void;
  likedIds: string[];
}

export const ReviewArchiveModal: React.FC<ReviewArchiveModalProps> = ({
  isOpen,
  onClose,
  isDark,
  reviews,
  onLike,
  likedIds
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | 'critical'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 8;

  if (!isOpen) return null;

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '5') return r.rating === 5;
    if (selectedFilter === '4') return r.rating === 4;
    if (selectedFilter === '3') return r.rating === 3;
    if (selectedFilter === 'critical') return r.rating <= 2;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const currentReviews = filteredReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Compute aggregate statistics from approved reviews
  const validRatings = reviews.filter(r => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5);
  const averageRating = validRatings.length > 0
    ? (validRatings.reduce((acc, curr) => acc + curr.rating, 0) / validRatings.length).toFixed(1)
    : '5.0';

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const scrollContainer = document.getElementById('archive-modal-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-3xl rounded-3xl border-2 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] transition-all ${
          isDark 
            ? 'bg-[#18110C] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Modal Top Banner */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-100 flex items-center gap-1.5">
                <span>Sanctuary Review Archive</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </h3>
              <p className="text-[10px] font-serif italic text-amber-200/80">
                Complete Collection of Verified Reader Impressions &amp; Critiques
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close archive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div id="archive-modal-scroll" className="p-4 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Aggregate Kindle-style Rating Dashboard */}
          <div className={`p-5 rounded-2xl border ${
            isDark ? 'bg-[#1F1712] border-[#3E2D20]' : 'bg-[#FAF4E8] border-[#E8DFC8]'
          } flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm`}>
            
            {/* Left: Overall Star Display */}
            <div className="text-center sm:text-left space-y-1 shrink-0">
              <span className="font-cinzel text-[10px] tracking-wider uppercase font-bold text-amber-600 dark:text-amber-400 block">
                Audience Evaluation
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="font-cinzel text-4xl sm:text-5xl font-black text-[#8B2213] dark:text-[#FFE58F]">
                  {averageRating}
                </span>
                <span className="text-xs sm:text-sm font-serif opacity-70">
                  out of 5
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 py-0.5">
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
              </div>
              <p className="text-[11px] font-serif text-stone-600 dark:text-stone-400">
                {reviews.length} {reviews.length === 1 ? 'verified review' : 'verified reviews'}
              </p>
            </div>

            {/* Right: Kindle-style Rating Breakdown Bars */}
            <div className="w-full sm:max-w-xs space-y-1.5 text-xs font-serif">
              {[5, 4, 3, 2, 1].map((starLevel) => {
                const count = ratingCounts[starLevel as keyof typeof ratingCounts] || 0;
                const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={starLevel} className="flex items-center gap-2">
                    <span className="w-10 text-[11px] font-sans opacity-80 flex items-center gap-0.5 justify-end">
                      {starLevel} <Star className="w-2.5 h-2.5 fill-current text-amber-500 inline" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-[10px] font-mono opacity-70 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-cinzel font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-[#D4AF37]" /> Filter:
            </span>
            {[
              { id: 'all', label: `All (${reviews.length})` },
              { id: '5', label: `5 Stars (${ratingCounts[5]})` },
              { id: '4', label: `4 Stars (${ratingCounts[4]})` },
              { id: '3', label: `3 Stars (${ratingCounts[3]})` },
              { id: 'critical', label: `Critiques (${ratingCounts[2] + ratingCounts[1]})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFilter(f.id as any);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full font-cinzel text-[11px] font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedFilter === f.id
                    ? 'bg-[#8B2213] text-white shadow-xs border border-[#D4AF37]/50'
                    : 'bg-black/5 dark:bg-white/5 text-stone-700 dark:text-stone-300 border border-black/10 dark:border-white/10 hover:border-[#D4AF37]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {currentReviews.length > 0 ? (
              currentReviews.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isDark ? 'bg-[#1A130E] border-[#38281B]' : 'bg-white border-[#E8DEC9]'
                  } shadow-xs`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B2213] to-[#D4AF37] text-white flex items-center justify-center text-xs font-bold font-cinzel shadow-xs shrink-0 mt-0.5">
                        {item.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
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

                        {/* Kindle-Style 5 Stars */}
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
                      onClick={() => onLike(item.id)}
                      title="Appreciate this review"
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
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
              <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
                <MessageSquare className="w-8 h-8 mx-auto text-amber-600/50 mb-2" />
                <p className="font-cinzel text-xs font-bold uppercase text-stone-600 dark:text-stone-400">
                  No Reviews Matching This Filter
                </p>
                <p className="text-xs font-serif text-stone-400 mt-1">
                  Try selecting another star rating filter or 'All' to browse reflections.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed font-cinzel text-xs font-bold flex items-center gap-1 hover:border-[#D4AF37] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="font-mono text-xs opacity-75">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 disabled:opacity-30 disabled:cursor-not-allowed font-cinzel text-xs font-bold flex items-center gap-1 hover:border-[#D4AF37] transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
