import React from 'react';
import { 
  BookOpen, 
  Users, 
  Layers, 
  Feather, 
  HelpCircle, 
  Scroll, 
  Image as ImageIcon, 
  Newspaper,
  Sparkles,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { motion } from 'motion/react';
import { audioSynth } from '../services/audioSynth';

interface InteractiveHubCardsProps {
  isDark: boolean;
  onJumpToSection: (sectionId: string) => void;
  onOpenPreview: () => void;
  onOpenAuth?: () => void;
}

interface HubCard {
  id: string;
  title: string;
  subtitle: string;
  sectionId: string;
  icon: any;
  gradient: string;
  badge: string;
}

const HUB_CARDS: HubCard[] = [
  {
    id: 'book-card',
    title: 'The Book',
    subtitle: 'Synopsis, 219 Pages & Reading Sanctuary',
    sectionId: 'about-novel',
    icon: BookOpen,
    gradient: 'from-[#B93826] to-[#D85A2A]',
    badge: '219 Pages'
  },
  {
    id: 'characters-card',
    title: 'Characters',
    subtitle: 'Aratrika, Krittika, Prangik & Parents',
    sectionId: 'protagonist-gallery',
    icon: Users,
    gradient: 'from-[#D4AF37] to-[#E5A93C]',
    badge: 'Dramatis Personae'
  },
  {
    id: 'themes-card',
    title: 'Themes',
    subtitle: 'Dreams, Identity, Ambition & Family',
    sectionId: 'novel-themes',
    icon: Layers,
    gradient: 'from-[#2A5C8A] to-[#1E3A5F]',
    badge: 'Philosophical Motifs'
  },
  {
    id: 'author-card',
    title: 'The Author',
    subtitle: 'Pratyay Saha Biography & Note',
    sectionId: 'author-section',
    icon: Feather,
    gradient: 'from-[#8B2213] to-[#B93826]',
    badge: 'Pratyay Saha'
  },
  {
    id: 'behind-card',
    title: 'Behind the Book',
    subtitle: 'Inspiration, Title Meaning & Process',
    sectionId: 'behind-the-book',
    icon: HelpCircle,
    gradient: 'from-[#9E472A] to-[#D4AF37]',
    badge: 'Literary Genesis'
  },
  {
    id: 'journey-card',
    title: 'Writing Journey',
    subtitle: 'Chronological Timeline (12 Apr → 29 Nov)',
    sectionId: 'writers-journey',
    icon: Scroll,
    gradient: 'from-[#E5A93C] to-[#B93826]',
    badge: '231 Days'
  },
  {
    id: 'gallery-card',
    title: 'Gallery',
    subtitle: 'Covers, Character Art & Manuscripts',
    sectionId: 'book-gallery',
    icon: ImageIcon,
    gradient: 'from-[#1E3A5F] to-[#D4AF37]',
    badge: 'Visual Archives'
  },
  {
    id: 'press-card',
    title: 'Press & Recognition',
    subtitle: 'Media Articles, Features & Reviews',
    sectionId: 'press-section',
    icon: Newspaper,
    gradient: 'from-[#B93826] to-[#E5A93C]',
    badge: 'Coming Soon'
  }
];

export const InteractiveHubCards: React.FC<InteractiveHubCardsProps> = ({
  isDark,
  onJumpToSection,
  onOpenPreview,
  onOpenAuth
}) => {
  const handleCardClick = (card: HubCard) => {
    onJumpToSection(card.sectionId);
  };

  return (
    <section className="relative py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden select-none">
      
      {/* Top Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B93826]/10 border border-[#D4AF37]/40 text-[#B93826] dark:text-[#E5A93C] text-[11px] font-cinzel font-bold uppercase tracking-widest shadow-sm mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>EXPLORE THE NOVEL WORLD</span>
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>
        <h3 className={`font-cinzel text-xl sm:text-2xl font-black ${isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'}`}>
          Interactive Sanctuary Hub
        </h3>
      </div>

      {/* Floating Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {HUB_CARDS.map((card, idx) => {
          const CardIcon = card.icon;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => handleCardClick(card)}
              className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl relative overflow-hidden flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#18120D]/90 border-[#3E2D20] hover:border-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.2)]' 
                  : 'bg-[#FAF6EF]/90 border-[#E5DBC7] hover:border-[#B93826] shadow-lg hover:shadow-[0_20px_40px_rgba(185,56,38,0.18)]'
              }`}
            >
              {/* Subtle Ambient Radial Hover Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${card.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <CardIcon className="w-5 h-5" />
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 text-[9px] font-cinzel font-bold text-[#8B2213] dark:text-[#FFE58F] uppercase tracking-wider">
                    {card.badge}
                  </span>
                </div>

                <h4 className={`font-cinzel text-base sm:text-lg font-bold group-hover:text-[#B93826] dark:group-hover:text-[#E5A93C] transition-colors ${
                  isDark ? 'text-[#FAF5EE]' : 'text-[#2D1E16]'
                }`}>
                  {card.title}
                </h4>

                <p className="font-serif text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {card.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-cinzel font-bold text-[#B93826] dark:text-[#E5A93C]">
                <span>Explore Section</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>

            </motion.div>
          );
        })}
      </div>

    </section>
  );
};
