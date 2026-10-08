import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Feather, 
  Heart, 
  BookOpen, 
  Compass, 
  ArrowDown, 
  Image as ImageIcon, 
  Quote, 
  Star,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';
import aratrikaDefaultImg from '../assets/images/aratrika_protagonist_portrait_1790603312837.jpg';
import heritageArtImg from '../assets/images/bengali_cultural_heritage_1790355992872.jpg';
import literaryArtImg from '../assets/images/bengali_literary_art_1790356005509.jpg';

interface ProtagonistGalleryProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

export interface CharacterProfile {
  id: string;
  name: string;
  bengaliName: string;
  role: string;
  identity: string;
  image: string;
  customImage?: string;
  archetype: string;
  quote: string;
  biography: string;
  keyMoments: string[];
  personalityTraits: { trait: string; level: number }[];
  sanctuaryItem: string;
}

const INITIAL_CHARACTERS: CharacterProfile[] = [
  {
    id: 'aratrika',
    name: 'Aratrika',
    bengaliName: 'আরাত্রিকা',
    role: 'Protagonist & Silent Scribe',
    identity: 'Keeper of the Inherited Sepia Journal',
    image: aratrikaDefaultImg,
    archetype: 'The Introspective Chronicler',
    quote: 'I do not write because I have answers; I write because the silence became too heavy to carry alone.',
    biography: 'A contemplative and resolute young woman living in the heritage-rich riverbank town of Chakdaha. Trapped between family expectations and societal suppression, Aratrika discovers that her pen is a sanctuary where her true voice refuses to wilt.',
    keyMoments: [
      'Inscribing the first line during the midnight monsoon storm.',
      'Turning personal struggles and dreams into an unbreakable voice.',
      'Confronting societal silence with her completed manuscript.'
    ],
    personalityTraits: [
      { trait: 'Inner Fortitude', level: 95 },
      { trait: 'Literary Empathy', level: 98 },
      { trait: 'Quiet Defiance', level: 90 },
      { trait: 'Philosophical Depth', level: 94 }
    ],
    sanctuaryItem: 'Antique Leather-Bound Sepia Journal'
  },
  {
    id: 'mrs-saha',
    name: 'Mrs. Saha',
    bengaliName: 'মা (মিসেস সাহা)',
    role: 'Mother & Family Anchor',
    identity: 'Protective Mother & Cultural Traditionalist',
    image: heritageArtImg,
    archetype: 'The Protective Matriarch',
    quote: 'A mother’s caution is born not from coldness, but from knowing how hard the world can be for a woman.',
    biography: 'Aratrika’s mother, representing the complex interplay between maternal instinct, traditional family structures, and protective caution. While initially urging Aratrika to follow conventional paths, her love for her daughter runs deeper than societal expectations.',
    keyMoments: [
      'Guarding the family courtyard during the storm.',
      'Quietly observing Aratrika’s late-night writing light.',
      'Understanding her daughter’s deep literary calling.'
    ],
    personalityTraits: [
      { trait: 'Maternal Devotion', level: 96 },
      { trait: 'Traditional Grace', level: 90 },
      { trait: 'Protective Caution', level: 94 },
      { trait: 'Emotional Depth', level: 88 }
    ],
    sanctuaryItem: 'Silver Conch Shell & Prayer Brass Lamp'
  },
  {
    id: 'mr-saha',
    name: 'Mr. Saha',
    bengaliName: 'বাবা (মিঃ সাহা)',
    role: 'Father & Head of House',
    identity: 'Dignified Patriarch & Teacher',
    image: literaryArtImg,
    archetype: 'The Guiding Patriarch',
    quote: 'Education is the key, but courage is what opens the door.',
    biography: 'Aratrika’s father, symbolizing the weight of social responsibilities, parental ambition, and academic discipline. Though torn between conventional security and Aratrika’s artistic passion, his ultimate wish is for her to stand strong and proud in the world.',
    keyMoments: [
      'Guarding Aratrika through academic milestones in Chakdaha.',
      'Holding back tears upon seeing her published words.',
      'Reconciling traditional expectations with her artistic fire.'
    ],
    personalityTraits: [
      { trait: 'Academic Discipline', level: 94 },
      { trait: 'Paternal Duty', level: 95 },
      { trait: 'Quiet Pride', level: 92 },
      { trait: 'Moral Integrity', level: 91 }
    ],
    sanctuaryItem: 'Vintage Reading Glasses & Bookshelf'
  },
  {
    id: 'krittika',
    name: 'Krittika',
    bengaliName: 'কৃত্তিকা',
    role: 'Close Friend & Confidante',
    identity: 'Aratrika’s Loyal Classmate',
    image: aratrikaDefaultImg,
    archetype: 'The Successor & Catalyst',
    quote: 'If your voice breaks, I will be here to amplify your words.',
    biography: 'Aratrika’s closest school friend at St. Mary’s. Vibrant, loyal, and outspoken, Krittika acts as the bridge between Aratrika’s quiet internal world and the external student community, encouraging her to share her manuscript with the world.',
    keyMoments: [
      'Reading the initial draft pages in the school courtyard.',
      'Encouraging Aratrika during times of doubt.',
      'Helping preserve and spread the literary manuscript.'
    ],
    personalityTraits: [
      { trait: 'Fierce Loyalty', level: 98 },
      { trait: 'Vibrant Spirit', level: 92 },
      { trait: 'Empathetic Bond', level: 95 },
      { trait: 'Courage', level: 89 }
    ],
    sanctuaryItem: 'Hand-woven Bookmark & Ink Refill'
  },
  {
    id: 'prangik',
    name: 'Prangik',
    bengaliName: 'প্রাঙ্গিক',
    role: 'Secret Admirer & Preserver',
    identity: 'Chakdaha Scholar & Silent Supporter',
    image: literaryArtImg,
    archetype: 'The Devoted Preserver',
    quote: 'I loved her words before I ever dared to tell her how much I revered her spirit.',
    biography: 'A thoughtful young scholar who silently admires Aratrika’s intellect and poetic soul. Prangik understands the profound depth of her writing and becomes instrumental in preserving her literary legacy and ensuring her voice reaches publication.',
    keyMoments: [
      'First hearing Aratrika recite her poetry at the literary gathering.',
      'Carefully collecting and binding her loose draft sheets.',
      'Safeguarding the manuscript for Technodef Press publication.'
    ],
    personalityTraits: [
      { trait: 'Quiet Devotion', level: 97 },
      { trait: 'Literary Respect', level: 96 },
      { trait: 'Generosity of Soul', level: 93 },
      { trait: 'Steadfast Loyalty', level: 95 }
    ],
    sanctuaryItem: 'Sepia Inkpot & Leather Binding Ribbon'
  },
  {
    id: 'narrator',
    name: 'The Narrator',
    bengaliName: 'কথক (চিরন্তন কণ্ঠ)',
    role: 'The Eternal Literary Voice',
    identity: 'Omniscient Literary Observer',
    image: heritageArtImg,
    archetype: 'The Omniscient Observer',
    quote: 'Words do not belong to the person who writes them; they belong to everyone who needed to hear them.',
    biography: 'The atmospheric, poetically rich omniscient voice that weaves the narrative of Wilting of Words. The Narrator bridges the gap between Aratrika’s personal journal and the timeless universal themes of truth, memory, and human survival.',
    keyMoments: [
      'Framing the opening prologue in Chakdaha.',
      'Illuminating the inner emotional landscape of the characters.',
      'Delivering the final epilogue on the immortality of writing.'
    ],
    personalityTraits: [
      { trait: 'Poetic Omniscience', level: 100 },
      { trait: 'Atmospheric Resonance', level: 98 },
      { trait: 'Universal Wisdom', level: 97 },
      { trait: 'Literary Elegance', level: 99 }
    ],
    sanctuaryItem: 'The Sepia Manuscript of Wilting of Words'
  }
];

export const ProtagonistGallery: React.FC<ProtagonistGalleryProps> = ({
  isDark,
  onContinueJourney
}) => {
  const characters = INITIAL_CHARACTERS;
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('aratrika');

  const selectedChar = characters.find(c => c.id === selectedCharacterId) || characters[0];

  const handleSelect = (id: string) => {
    setSelectedCharacterId(id);
    try {
      audioSynth.playNow();
    } catch {}
  };

  return (
    <section 
      id="protagonist-gallery" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Dynamic Ambient Royal Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[700px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B93826]/15 to-[#E5A93C]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

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
            <User className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>DRAMATIS PERSONAE</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            MEET OUR PROTAGONISTS
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "Characters born of antique ink, carrying the living pulse of courage across the riverbanks of Bengal."
          </p>
        </div>

        {/* 
          ==================================================================
          CHARACTER SELECTOR NAVIGATION TABS
          ==================================================================
        */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 sm:mb-12">
          {characters.map((char) => {
            const isSelected = char.id === selectedCharacterId;
            return (
              <button
                key={char.id}
                onClick={() => handleSelect(char.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#8B2213] via-[#B93826] to-[#D85A2A] text-white border-[#FFE58F] shadow-xl scale-[1.03]'
                    : isDark
                      ? 'bg-[#18120E] text-[#DCD0C4] border-[#3E2D20] hover:border-[#D4AF37]/60 hover:bg-[#201712]'
                      : 'bg-[#FAF5ED] text-[#4A382A] border-[#E8DFC8] hover:border-[#B93826]/50 hover:bg-white'
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md shrink-0">
                  <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold truncate max-w-[120px]">
                    {char.name}
                  </h4>
                  <span className={`text-[10px] font-serif block opacity-85 ${isSelected ? 'text-amber-100' : 'text-[#8B2213] dark:text-[#D4AF37]'}`}>
                    {char.bengaliName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 
          ==================================================================
          ACTIVE PROTAGONIST SPOTLIGHT DOSSIER & ARTWORK
          ==================================================================
        */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedChar.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl p-6 sm:p-10 border transition-all ${
              isDark 
                ? 'bg-gradient-to-b from-[#1E150F] to-[#120C08] border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.15)]' 
                : 'bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE3] border-[#E5A93C]/50 shadow-xl'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Left Column: Royal Portrait Frame with Upload / Preview Capability */}
              <div className="lg:col-span-5 flex flex-col items-center text-center">
                
                {/* Royal Portrait Frame with Golden filigree */}
                <div className="relative group w-56 sm:w-64 aspect-[4/5] rounded-3xl overflow-hidden p-2 bg-[#1E140D] border-3 border-[#D4AF37] shadow-2xl">
                  {/* Glowing Aura Ring */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#D4AF37] via-[#B93826] to-[#E5A93C] opacity-75 blur-md pointer-events-none animate-pulse" />
                  
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black border border-[#D4AF37]/50">
                    <img 
                      src={selectedChar.image} 
                      alt={selectedChar.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Bottom Royal Ribbon */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 text-center">
                      <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-[#B93826] to-[#D85A2A] text-white text-[10px] font-cinzel font-bold uppercase tracking-widest border border-amber-300 shadow-md">
                        {selectedChar.archetype}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name & Bengali Calligraphy Title */}
                <div className="mt-4">
                  <h3 className={`font-cinzel text-2xl sm:text-3xl font-black ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
                    {selectedChar.name}
                  </h3>
                  <p className="font-cormorant italic text-base sm:text-lg font-bold text-[#8B2213] dark:text-[#E5A93C]">
                    {selectedChar.bengaliName}
                  </p>
                  <p className="font-serif text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {selectedChar.identity}
                  </p>
                </div>

              </div>

              {/* Right Column: In-Depth Character Lore & Traits */}
              <div className="lg:col-span-7 space-y-5 text-left">
                
                {/* Character Quote Inscription */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#B93826]/10 via-[#E5A93C]/15 to-[#B93826]/10 border border-[#D4AF37]/40 relative">
                  <Quote className="w-5 h-5 text-[#D4AF37] mb-1 opacity-80" />
                  <p className="font-cormorant italic text-base sm:text-xl text-[#9E472A] dark:text-[#FFE58F] font-bold leading-relaxed">
                    "{selectedChar.quote}"
                  </p>
                </div>

                {/* Biography */}
                <div>
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C] mb-1.5 flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5" />
                    <span>Character Chronicle</span>
                  </h4>
                  <p className="font-serif text-sm sm:text-base leading-relaxed text-[#3A2D23] dark:text-[#DCD0C4]">
                    {selectedChar.biography}
                  </p>
                </div>

                {/* Key Narrative Moments */}
                <div>
                  <h4 className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C] mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>Key Narrative Pivots</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedChar.keyMoments.map((moment, mIdx) => (
                      <li key={mIdx} className="text-xs sm:text-sm font-serif text-[#4A382A] dark:text-[#D0C3B5] flex items-start gap-2">
                        <span className="text-[#D4AF37] mt-0.5">✦</span>
                        <span>{moment}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Personality Affinity Bars */}
                <div className="pt-2">
                  <h5 className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5">
                    Character Resonance Spectrum
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedChar.personalityTraits.map((t, tIdx) => (
                      <div key={tIdx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-cinzel font-bold text-[#8B2213] dark:text-[#ECC480]">
                          <span>{t.trait}</span>
                          <span>{t.level}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#B93826] to-[#E5A93C]" 
                            style={{ width: `${t.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step-by-Step Guided Journey Button */}
        {onContinueJourney && (
          <div className="mt-10 sm:mt-14 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: Visual & Manuscript Gallery</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
