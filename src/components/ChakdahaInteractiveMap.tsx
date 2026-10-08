import React, { useState } from 'react';
import { MapPin, Compass, Sparkles, BookOpen, Volume2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface MapLocation {
  id: string;
  title: string;
  bengaliTitle: string;
  x: number; // SVG percentage
  y: number; // SVG percentage
  category: string;
  chapterRef: string;
  description: string;
  bengaliDescription: string;
  excerpt: string;
  iconBg: string;
}

const CHAKDAHA_LOCATIONS: MapLocation[] = [
  {
    id: 'courtyard',
    title: 'Ancestral Red-Oxide Courtyard',
    bengaliTitle: 'লাল সিমেন্টের উঠোন ও বারান্দা',
    x: 42,
    y: 48,
    category: 'Chapter 1 Sanctuary',
    chapterRef: 'Prologue & Page 2',
    description: 'The quiet ancestral house at Chakdaha where Aratrika stood by the carved mahogany lattice, holding the brittle diary with sepia fountain ink.',
    bengaliDescription: 'চাকদহের পৈতৃক বাড়ি যেখানে আরাত্রিকা মহোগনি কাঠের জানলার কাছে দাঁড়িয়ে পুরোনো সেপিয়া ডায়েরিটি খুঁজে পায়।',
    excerpt: '"There is a peculiar fragrance that clings to old red oxide floors right before the Nor\'wester strikes..."',
    iconBg: 'from-[#B93826] to-[#D85A2A]'
  },
  {
    id: 'riverbank',
    title: 'Hooghly Riverbank & Boat Ghat',
    bengaliTitle: 'হুগলী নদীর ঘাট ও পার',
    x: 22,
    y: 72,
    category: 'Riverbank Horizon',
    chapterRef: 'Chapter I (Page 4)',
    description: 'As twilight settles over the riverbank, conch shells announce the evening rituals while boatmen sing ancient folk melodies across the water.',
    bengaliDescription: 'গোধূলি বেলায় নদীর ঘাটে শাঁখের আওয়াজ এবং খেয়া নৌকার মাঝিদের ভাটিয়ালি গান।',
    excerpt: '"As twilight settled over the riverbank, the distant sound of conch shells announced the evening rituals..."',
    iconBg: 'from-[#2A5C8A] to-[#3B82F6]'
  },
  {
    id: 'music-academy',
    title: 'Chakdaha Music Academy & Station Market',
    bengaliTitle: 'সঙ্গীত একাডেমি ও স্টেশনের চত্বর',
    x: 58,
    y: 65,
    category: 'Cultural Resonance',
    chapterRef: 'Chapter I (Page 3)',
    description: 'The neighbouring music academy where the gentle hum of an afternoon tanpura resonates through the rustling mango trees.',
    bengaliDescription: 'পাশের সঙ্গীত একাডেমি থেকে ভেসে আসা দুপুরের তানপুরার সুর যা আমগাছের পাতার মর্মর শব্দের সাথে মিশে যায়।',
    excerpt: '"The gentle hum of an afternoon tanpura resonated from the neighbouring music academy..."',
    iconBg: 'from-[#8B2213] to-[#B93826]'
  },
  {
    id: 'terracotta-ruins',
    title: 'Historic Terracotta Temple Ruins',
    bengaliTitle: 'টেরাকোটা মন্দির ও পোড়ামাটির স্মৃতি',
    x: 82,
    y: 55,
    category: 'Heritage Craft',
    chapterRef: 'Chapter II (Page 5)',
    description: 'The ancient fired terracotta carvings along the countryside route where artisans poured their unspoken agony into clay tiles.',
    bengaliDescription: 'গ্রামের মেঠো পথের পাশে অবস্থিত ঐতিহাসিক টেরাকোটা মন্দির, যার পোড়ামাটির অলংকরণে শিল্পীরা ফুটিয়ে তুলেছেন অমর বার্তা।',
    excerpt: '"Art is the only rebellion that does not shed blood... clay in the kiln forgets its weakness."',
    iconBg: 'from-[#B85C38] to-[#E5A93C]'
  }
];

interface ChakdahaInteractiveMapProps {
  isDark: boolean;
  onReadChapter?: (chapterId: number) => void;
}

export const ChakdahaInteractiveMap: React.FC<ChakdahaInteractiveMapProps> = ({
  isDark,
  onReadChapter
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('courtyard');
  const selectedLoc = CHAKDAHA_LOCATIONS.find(l => l.id === selectedLocationId) || CHAKDAHA_LOCATIONS[0];

  const handleSelect = (id: string) => {
    setSelectedLocationId(id);
    try { audioSynth.playNow(); } catch {}
  };

  return (
    <section id="chakdaha-map" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[650px] h-[380px] sm:h-[650px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      <div className={`relative rounded-3xl p-6 sm:p-10 border transition-all duration-500 shadow-2xl ${
        isDark 
          ? 'glossy-card-dark border-[#D4AF37]/35 shadow-[0_0_50px_rgba(212,175,55,0.12)]' 
          : 'glossy-card border-[#E5A93C]/40 shadow-[0_20px_60px_-15px_rgba(185,56,38,0.14)]'
      }`}>

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/45 text-[#B93826] dark:text-[#E5A93C] text-xs font-cinzel font-bold tracking-widest uppercase mb-3 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>GEOGRAPHICAL IMMERSION</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>

          <h2 className="font-cinzel text-3xl sm:text-4xl font-black tracking-wider uppercase leading-tight sparkle-gold-text">
            INTERACTIVE MAP OF CHAKDAHA
          </h2>

          <p className="mt-2.5 font-cormorant italic text-base sm:text-xl text-[#9E472A] dark:text-[#FFE58F]">
            "Explore the actual riverbanks, courtyards, and school grounds that shaped Aratrika's story."
          </p>
        </div>

        {/* Grid Layout: Map & Location Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Map Canvas */}
          <div className="lg:col-span-7 relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl bg-[#1A120B]">
            {/* Map Canvas Background SVG */}
            <svg className="w-full h-full object-cover" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="600" fill="#18110B" />
              
              {/* River Hooghly Path */}
              <path 
                d="M 0 550 Q 200 450 180 300 T 250 0 L 0 0 Z" 
                fill="#1E3A5F" 
                opacity="0.85" 
              />
              <path 
                d="M 0 550 Q 200 450 180 300 T 250 0" 
                stroke="#60A5FA" 
                strokeWidth="6" 
                opacity="0.4"
                strokeDasharray="12 6"
              />

              {/* Grid Filigree Lines */}
              <path d="M 0 150 H 800 M 0 300 H 800 M 0 450 H 800 M 200 0 V 600 M 400 0 V 600 M 600 0 V 600" stroke="#D4AF37" strokeWidth="0.5" opacity="0.15" />

              {/* Railway & Road Networks */}
              <path d="M 450 600 L 520 0" stroke="#E5A93C" strokeWidth="3" strokeDasharray="8 4" opacity="0.6" />
              <path d="M 180 300 Q 350 250 650 350" stroke="#B93826" strokeWidth="2.5" opacity="0.5" />

              {/* Landmark Labels in Map SVG */}
              <text x="50" y="280" fill="#93C5FD" fontSize="13" fontFamily="Cinzel" fontWeight="bold" opacity="0.8">Hooghly River</text>
              <text x="490" y="580" fill="#ECC480" fontSize="11" fontFamily="Cinzel" opacity="0.7">Chakdaha Station Line</text>
            </svg>

            {/* Location Marker Pins */}
            {CHAKDAHA_LOCATIONS.map((loc) => {
              const isSelected = loc.id === selectedLocationId;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc.id)}
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-10 ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                  }`}
                >
                  {/* Glowing Pin Pulse Ring */}
                  <span className={`absolute -inset-2 rounded-full bg-gradient-to-r ${loc.iconBg} opacity-75 blur-xs ${isSelected ? 'animate-ping' : ''}`} />

                  {/* Pin Body */}
                  <div className={`relative px-2.5 py-1.5 rounded-full border border-amber-200 shadow-xl flex items-center gap-1 bg-gradient-to-r ${loc.iconBg} text-white`}>
                    <MapPin className="w-3.5 h-3.5 text-amber-200" />
                    <span className="font-cinzel text-[10px] font-bold tracking-wider uppercase whitespace-nowrap hidden sm:inline">
                      {loc.title.split(' ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Location Detail Card */}
          <div className="lg:col-span-5 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLoc.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-[#18120D] border-[#D4AF37]/40' : 'bg-[#FAF6EF] border-[#E8DFC8]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-0.5 rounded-full bg-[#B93826]/10 text-[#B93826] dark:text-[#E5A93C] text-[10px] font-cinzel font-bold tracking-widest uppercase border border-[#D4AF37]/30">
                    {selectedLoc.category}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">
                    {selectedLoc.chapterRef}
                  </span>
                </div>

                <h3 className={`font-cinzel text-xl font-bold ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
                  {selectedLoc.title}
                </h3>
                <p className="font-serif text-xs font-semibold text-[#8B2213] dark:text-[#E5A93C] mb-3">
                  {selectedLoc.bengaliTitle}
                </p>

                <p className="font-serif text-sm leading-relaxed opacity-90 mb-4 text-[#3A2D23] dark:text-[#DCD0C4]">
                  {selectedLoc.description}
                </p>

                <p className="font-serif text-xs leading-relaxed text-[#B93826] dark:text-[#D4AF37] mb-4 p-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  {selectedLoc.bengaliDescription}
                </p>

                {/* Excerpt Quote */}
                <div className="p-3 rounded-xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-5">
                  <p className="font-cormorant italic text-xs sm:text-sm text-[#9E472A] dark:text-[#FFE58F]">
                    {selectedLoc.excerpt}
                  </p>
                </div>

                {onReadChapter && (
                  <button
                    onClick={() => onReadChapter(1)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B93826] to-[#D85A2A] hover:from-[#A22B1A] hover:to-[#B93826] text-white font-cinzel font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                    <span>Read Corresponding Passage in Reader</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                  </button>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};
