import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Eye, 
  X, 
  ZoomIn, 
  BookOpen, 
  Compass, 
  ArrowDown, 
  Feather, 
  Flame, 
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

import coverImg from '/cover.webp';
import authorImg from '/author.webp';
import heritageImg from '../assets/images/bengali_cultural_heritage_1790355992872.jpg';
import literaryArtImg from '../assets/images/bengali_literary_art_1790356005509.jpg';
import heroCoverImg from '../assets/images/hero_book_cover_1790355954378.jpg';
import deskImg from '../assets/images/writers_desk_sanctuary_1790603331850.jpg';
import aratrikaImg from '../assets/images/aratrika_protagonist_portrait_1790603312837.jpg';

interface BookGalleryProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: 'cover' | 'manuscript' | 'heritage' | 'artefact';
  categoryLabel: string;
  image: string;
  subtitle: string;
  description: string;
  aspect: string;
  details: string[];
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'official-cover',
    title: 'The Official Cover Art',
    category: 'cover',
    categoryLabel: 'Cover Art',
    image: coverImg,
    subtitle: 'Technodef First Edition Visual Identity',
    description: 'The golden embossed typography and terracotta filigree that encapsulate the poignant journey of Wilting of Words.',
    aspect: 'aspect-[3/4]',
    details: ['Published 2026', 'Royal Gold Typography', 'Vintage Bengal Silhouette']
  },
  {
    id: 'manuscript-sanctuary',
    title: 'The Writer’s Desk Sanctuary',
    category: 'artefact',
    categoryLabel: 'Writer’s Artefact',
    image: deskImg,
    subtitle: 'Chakdaha Writing Quarters',
    description: 'The antique mahogany drafting table where 219 pages were penned with sepia ink, under midnight oil lamps.',
    aspect: 'aspect-[16/10]',
    details: ['Sepia Pelikan Ink', 'Vintage Brass Lamp', '219 Manuscript Sheets']
  },
  {
    id: 'aratrika-portrait',
    title: 'Aratrika: The Silent Scribe',
    category: 'manuscript',
    categoryLabel: 'Character Art',
    image: aratrikaImg,
    subtitle: 'Protagonist Visual Representation',
    description: 'Oil canvas study of Aratrika clutching the inherited journal under the terracotta arches of Chakdaha.',
    aspect: 'aspect-[4/5]',
    details: ['Protagonist Study', 'Terracotta Arches', 'Sepia Leather Journal']
  },
  {
    id: 'bengal-heritage-motifs',
    title: 'Bishnupur & Bengal Heritage',
    category: 'heritage',
    categoryLabel: 'Cultural Heritage',
    image: heritageImg,
    subtitle: 'Architectural Inspiration',
    description: 'Traditional terracotta temple geometry and intricate Bengali terracotta carvings that breathe life into the novel’s world.',
    aspect: 'aspect-[4/3]',
    details: ['Terracotta Architecture', 'Konark Geometry', 'Bengal River Valley']
  },
  {
    id: 'literary-calligraphy-art',
    title: 'Sepia Ink & Calligraphy Plates',
    category: 'manuscript',
    categoryLabel: 'Manuscript Art',
    image: literaryArtImg,
    subtitle: 'Antique Script Study',
    description: 'Vintage calligraphic flourishes and handwritten manuscript textures honoring Bengal’s classic literary tradition.',
    aspect: 'aspect-[4/3]',
    details: ['Antique Bengali Calligraphy', 'Fountain Pen Shading', 'Archival Parchment']
  },
  {
    id: 'author-portrait-plate',
    title: 'Author Pratyay Saha',
    category: 'artefact',
    categoryLabel: 'Author Plate',
    image: authorImg,
    subtitle: 'Young Scholar & Novelist',
    description: 'Portrait of author Pratyay Saha, whose dedication across 231 days brought Wilting of Words from an idea to a published novel.',
    aspect: 'aspect-[4/5]',
    details: ['Class XI Science Scholar', 'Technodef Press Author', 'Chakdaha Sanctuary']
  },
  {
    id: 'hero-emblem-cover',
    title: 'Alternate Emblem Edition',
    category: 'cover',
    categoryLabel: 'Cover Art',
    image: heroCoverImg,
    subtitle: 'Commemorative Edition Concept',
    description: 'A study in deep crimson and radiant gold, designed for the luxury hardbound limited collector’s release.',
    aspect: 'aspect-[3/4]',
    details: ['Collector’s Edition', 'Crimson Velvet Tone', 'Sun Wheel Mandala']
  }
];

export const BookGallery: React.FC<BookGalleryProps> = ({
  isDark,
  onContinueJourney
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeCategory === 'all' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  const handleOpenPreview = (item: GalleryItem) => {
    setPreviewItem(item);
    try {
      audioSynth.playNow();
    } catch {}
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
  };

  const categories = [
    { id: 'all', label: 'All Visuals' },
    { id: 'cover', label: 'Cover Editions' },
    { id: 'manuscript', label: 'Manuscript & Art' },
    { id: 'heritage', label: 'Bengal Heritage' },
    { id: 'artefact', label: 'Writer’s Artefacts' }
  ];

  return (
    <section 
      id="book-gallery" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Background Radiant Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[750px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Royal Enclosure Container */}
      <div className={`relative rounded-3xl p-6 sm:p-12 border transition-all duration-500 shadow-2xl ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_60px_rgba(212,175,55,0.12)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.14)]'
      }`}>
        
        {/* Cultural Corner Filigree Accents */}
        <div className="absolute top-3.5 left-3.5 w-7 h-7 border-t-2 border-l-2 border-[#D4AF37]/75 rounded-tl-lg" />
        <div className="absolute top-3.5 right-3.5 w-7 h-7 border-t-2 border-r-2 border-[#D4AF37]/75 rounded-tr-lg" />
        <div className="absolute bottom-3.5 left-3.5 w-7 h-7 border-b-2 border-l-2 border-[#D4AF37]/75 rounded-bl-lg" />
        <div className="absolute bottom-3.5 right-3.5 w-7 h-7 border-b-2 border-r-2 border-[#D4AF37]/75 rounded-br-lg" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/45 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>VISUAL ARCHIVES</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            THE BOOK GALLERY
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "A visual exhibition of manuscript plates, Bengal terracotta iconography, and royal cover designs."
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {categories.map((cat) => {
            const isSelected = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  try { audioSynth.playNow(); } catch {}
                }}
                className={`px-4 py-2 rounded-2xl font-cinzel text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#FFE58F] shadow-lg scale-105'
                    : isDark
                      ? 'bg-[#18120E] text-[#DCD0C4] border-[#3E2D20] hover:border-[#D4AF37]/60'
                      : 'bg-[#FAF5ED] text-[#4A382A] border-[#E8DFC8] hover:border-[#B93826]/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              onClick={() => handleOpenPreview(item)}
              className={`group relative cursor-pointer rounded-3xl overflow-hidden p-2.5 border transition-all duration-500 hover:scale-[1.03] ${
                isDark 
                  ? 'bg-[#18120D] border-[#3E2D20] hover:border-[#D4AF37] shadow-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]' 
                  : 'bg-[#FAF6EF] border-[#E5DBC7] hover:border-[#B93826] shadow-md hover:shadow-2xl'
              }`}
            >
              {/* Image Container with Aspect Ratio */}
              <div className={`relative w-full ${item.aspect} rounded-2xl overflow-hidden bg-black`}>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
                  <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#B93826] to-[#E5A93C] text-white text-xs font-cinzel font-bold tracking-wider flex items-center gap-1.5 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View In High Res</span>
                  </div>
                </div>

                {/* Top Badge */}
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm text-[9px] font-cinzel font-bold text-[#FFD778] border border-[#D4AF37]/50 uppercase tracking-widest">
                  {item.categoryLabel}
                </div>
              </div>

              {/* Title & Caption */}
              <div className="p-3 text-left">
                <h4 className={`font-cinzel text-xs sm:text-sm font-bold truncate ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
                  {item.title}
                </h4>
                <p className="font-serif text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {previewItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePreview}
              className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full bg-[#18120D] border-2 border-[#D4AF37] rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={handleClosePreview}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#B93826] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 flex items-center justify-center bg-black/80 rounded-2xl p-2 border border-[#D4AF37]/40 max-h-[60vh] overflow-hidden">
                    <img 
                      src={previewItem.image} 
                      alt={previewItem.title} 
                      className="max-h-[55vh] w-auto object-contain rounded-xl shadow-2xl"
                    />
                  </div>

                  <div className="md:col-span-5 text-left space-y-4">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-[#B93826]/20 border border-[#D4AF37]/50 text-[#FFD778] text-[10px] font-cinzel font-bold uppercase tracking-widest">
                        {previewItem.categoryLabel}
                      </span>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-black text-[#FAF5EE] mt-2">
                        {previewItem.title}
                      </h3>
                      <p className="font-cormorant italic text-sm sm:text-base text-[#D4AF37] font-semibold mt-0.5">
                        {previewItem.subtitle}
                      </p>
                    </div>

                    <p className="font-serif text-xs sm:text-sm leading-relaxed text-[#DCD0C4]">
                      {previewItem.description}
                    </p>

                    <div className="pt-2 border-t border-white/10">
                      <h5 className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                        Archival Specifications
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {previewItem.details.map((det, dIdx) => (
                          <span key={dIdx} className="px-2.5 py-1 rounded-md bg-white/5 border border-[#D4AF37]/30 text-[10px] font-cinzel text-amber-200">
                            ✦ {det}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step-by-Step Guided Journey Button */}
        {onContinueJourney && (
          <div className="mt-10 sm:mt-14 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: The Writer's Desk</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
