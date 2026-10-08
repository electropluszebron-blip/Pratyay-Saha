import React, { useState } from 'react';
import { 
  Feather, 
  Sparkles, 
  Clock, 
  Flame, 
  Compass, 
  BookOpen, 
  Coffee, 
  Music, 
  Award, 
  CheckCircle2, 
  ArrowDown, 
  FileText,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../services/audioSynth';
import deskImg from '../assets/images/writers_desk_sanctuary_1790603331850.jpg';

interface WritersDeskProps {
  isDark: boolean;
  onContinueJourney?: () => void;
}

interface DeskArtifact {
  id: string;
  name: string;
  category: string;
  icon: any;
  quote: string;
  description: string;
  stats: string;
}

const DESK_ARTIFACTS: DeskArtifact[] = [
  {
    id: 'fountain-pen',
    name: 'Vintage Gold-Nib Fountain Pen',
    category: 'The Sacred Instrument',
    icon: Feather,
    quote: 'A keyboard types words; a fountain pen bleeds them onto paper.',
    description: 'The primary handwritten instrument used to draft the initial opening stanzas and character dialogue. The tactile friction of nib on parchment dictated the rhythmic cadence of the novel’s prose.',
    stats: 'Over 85,000 words drafted by hand'
  },
  {
    id: 'sepia-ink',
    name: 'Archival Sepia Pelikan Ink',
    category: 'The Literary Medium',
    icon: Sparkles,
    quote: 'Black ink is for contracts; sepia ink is for memories that refuse to fade.',
    description: 'Carefully chosen to give the manuscript its warm, antique Bengali parchment aesthetic. The sepia hue mirrors the terracotta temples of Bishnupur and the monsoon mudbanks of Chakdaha.',
    stats: '4 glass inkpots emptied during drafting'
  },
  {
    id: 'midnight-lamp',
    name: 'The Midnight Brass Oil Lamp',
    category: 'The Night Sanctuary',
    icon: Flame,
    quote: 'The world sleeps, but Aratrika’s story demands the silence of 2:00 AM.',
    description: 'Writing sessions occurred predominantly between midnight and dawn in author Pratyay Saha’s Chakdaha sanctuary, while balancing Class XI Science coursework during the day.',
    stats: '231 nights of nocturnal writing'
  },
  {
    id: 'tanpura-ragas',
    name: 'Indian Classical Tanpura & Raga Megh',
    category: 'Acoustic Resonance',
    icon: Music,
    quote: 'Music provides the wind beneath the sail of quiet sentences.',
    description: 'The background score of the author’s creative mind—slow classical Indian ragas (Raga Megh for monsoon scenes, Raga Bhairav for dawn revelations) playing softly to sustain emotional depth.',
    stats: 'Continuous meditative inspiration'
  }
];

export const WritersDesk: React.FC<WritersDeskProps> = ({
  isDark,
  onContinueJourney
}) => {
  const [activeArtifactId, setActiveArtifactId] = useState<string>('fountain-pen');
  const activeArtifact = DESK_ARTIFACTS.find(a => a.id === activeArtifactId) || DESK_ARTIFACTS[0];
  const IconComponent = activeArtifact.icon;

  const handleSelect = (id: string) => {
    setActiveArtifactId(id);
    try {
      audioSynth.playNow();
    } catch {}
  };

  return (
    <section 
      id="writers-desk" 
      className="relative py-14 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden"
    >
      {/* Dynamic Ambient Royal Aura */}
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
            <Feather className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>CREATIVE SANCTUARY</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          
          <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-wider uppercase leading-tight sparkle-gold-text drop-shadow-[0_2px_20px_rgba(212,175,55,0.4)]">
            THE WRITER’S DESK
          </h2>

          <div className="mt-3.5 flex items-center justify-center gap-3">
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] bg-[#B93826] shadow-sm animate-pulse" />
            <span className="h-[1.5px] w-12 sm:w-28 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <p className="mt-4 font-cormorant italic text-lg sm:text-2xl text-[#9E472A] dark:text-[#FFE58F] font-semibold leading-relaxed">
            "Step inside the quiet nocturnal workspace in Chakdaha where Wilting of Words was born."
          </p>
        </div>

        {/* 
          ==================================================================
          MASTER STILL LIFE DESK SHOWCASE WITH INTERACTIVE ARTIFACT HOTSPOTS
          ==================================================================
        */}
        <div className="relative rounded-3xl overflow-hidden p-3 bg-[#18120D] border-2 border-[#D4AF37] shadow-2xl mb-10">
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black">
            <img 
              src={deskImg} 
              alt="Pratyay Saha's Writer's Desk" 
              className="w-full h-full object-cover"
            />
            
            {/* Ambient Darkened Bottom Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-4 sm:p-8">
              <div className="text-left text-white max-w-2xl">
                <span className="px-3 py-1 rounded-full bg-[#B93826] text-[10px] sm:text-xs font-cinzel font-bold tracking-widest uppercase border border-amber-300 shadow-md">
                  Chakdaha Nocturnal Sanctuary
                </span>
                <h3 className="font-cinzel text-lg sm:text-2xl font-black mt-2 text-[#FFE58F]">
                  Where 219 Pages Were Consecrated in Sepia Ink
                </h3>
                <p className="font-serif text-xs sm:text-sm text-stone-300 mt-1 hidden sm:block">
                  Written by author Pratyay Saha during the quiet midnight hours, commemorating his landmark publication release.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 
          ==================================================================
          INTERACTIVE ARTIFACT EXPLORER CARDS
          ==================================================================
        */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {DESK_ARTIFACTS.map((artifact) => {
            const isSelected = artifact.id === activeArtifactId;
            const ArtIcon = artifact.icon;

            return (
              <button
                key={artifact.id}
                onClick={() => handleSelect(artifact.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#8B2213] to-[#B93826] text-white border-[#FFE58F] shadow-xl scale-[1.02]'
                    : isDark
                      ? 'bg-[#18120E] text-[#DCD0C4] border-[#3E2D20] hover:border-[#D4AF37]/60'
                      : 'bg-[#FAF5ED] text-[#4A382A] border-[#E8DFC8] hover:border-[#B93826]/50'
                }`}
              >
                <div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 ${
                    isSelected ? 'bg-white/20 text-amber-200' : 'bg-[#D4AF37]/15 text-[#D4AF37]'
                  }`}>
                    <ArtIcon className="w-4 h-4" />
                  </div>
                  <h4 className="font-cinzel text-xs sm:text-sm font-bold truncate">
                    {artifact.name}
                  </h4>
                  <span className="text-[10px] font-mono opacity-80 block truncate mt-0.5">
                    {artifact.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Artifact In-Depth Spotlight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArtifact.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl p-6 sm:p-8 border transition-all text-left ${
              isDark 
                ? 'bg-[#1C1510] border-[#D4AF37]/45 shadow-xl' 
                : 'bg-[#FFFDF9] border-[#E5A93C]/50 shadow-xl'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#B93826] to-[#E5A93C] text-white flex items-center justify-center shadow-lg">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-cinzel font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C]">
                    {activeArtifact.category}
                  </span>
                  <h3 className={`font-cinzel text-lg sm:text-xl font-bold ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
                    {activeArtifact.name}
                  </h3>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs font-cinzel font-bold text-[#8B2213] dark:text-[#FFE58F]">
                ✦ {activeArtifact.stats}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="font-cormorant italic text-base sm:text-lg font-bold text-[#9E472A] dark:text-[#FFE58F]">
                "{activeArtifact.quote}"
              </p>
              <p className="font-serif text-sm sm:text-base leading-relaxed text-[#4A382A] dark:text-[#DCD0C4]">
                {activeArtifact.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 
          ==================================================================
          ANIMATED WRITING METRICS & CRAFTSMANSHIP RADAR
          ==================================================================
        */}
        <div className="mt-10 pt-8 border-t border-black/10 dark:border-white/10">
          <h4 className="font-cinzel text-center text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C] mb-6">
            Craftsmanship & Publication Metrics
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <FileText className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C] mx-auto mb-1" />
              <span className="font-cinzel text-xl sm:text-2xl font-black text-[#9E472A] dark:text-[#FFE58F] block">
                219 Pages
              </span>
              <span className="text-[10px] font-mono text-stone-500 uppercase">
                Finished Manuscript
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <Clock className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C] mx-auto mb-1" />
              <span className="font-cinzel text-xl sm:text-2xl font-black text-[#9E472A] dark:text-[#FFE58F] block">
                231 Days
              </span>
              <span className="text-[10px] font-mono text-stone-500 uppercase">
                Writing Trajectory
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <Award className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C] mx-auto mb-1" />
              <span className="font-cinzel text-xl sm:text-2xl font-black text-[#9E472A] dark:text-[#FFE58F] block">
                6 Drafts
              </span>
              <span className="text-[10px] font-mono text-stone-500 uppercase">
                Editorial Revisions
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <Sparkles className="w-5 h-5 text-[#B93826] dark:text-[#E5A93C] mx-auto mb-1" />
              <span className="font-cinzel text-xl sm:text-2xl font-black text-[#9E472A] dark:text-[#FFE58F] block">
                100%
              </span>
              <span className="text-[10px] font-mono text-stone-500 uppercase">
                Handcrafted Devotion
              </span>
            </div>

          </div>
        </div>

        {/* Step-by-Step Guided Journey Button */}
        {onContinueJourney && (
          <div className="mt-10 sm:mt-14 flex justify-center">
            <button
              onClick={onContinueJourney}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#B93826] via-[#D85A2A] to-[#E5A93C] hover:from-[#A22B1A] hover:to-[#D4992C] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-[#FFE58F]/60 group"
            >
              <Compass className="w-4 h-4 text-amber-200 group-hover:rotate-45 transition-transform duration-500" />
              <span>Continue Journey: Sneak Beyond The Shell</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-amber-200 ml-0.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
