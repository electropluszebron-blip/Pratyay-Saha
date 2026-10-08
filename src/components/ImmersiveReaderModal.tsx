import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Languages, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  BookmarkCheck, 
  Sparkles, 
  RotateCcw,
  Sliders,
  Type,
  Eye,
  BookOpen,
  MoreVertical,
  History,
  CloudRain,
  Square,
  Headphones,
  Mic,
  ArrowRight
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';
import { ambientAudio } from '../services/ambientAudio';
import { GlossaryHistoryDrawer, GlossaryHistoryItem } from './GlossaryHistoryDrawer';
import { PronunciationGuideModal } from './PronunciationGuideModal';
import { resolveUniversalWord, fetchWordMeaningFromBackend, WordDefinition, preloadChapter1Lexicon } from '../data/comprehensiveLexicon';

interface ImmersiveReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHAPTER_1_PARAGRAPHS = [
  "The first thing Aratrika learned about mornings was that they had colours.",
  "Not the colours people painted on walls. Not the colours printed in school textbooks. Real colours.",
  "Morning sunlight was pale gold when it entered through the eastern window. The sky was almost white before sunrise and became blue only after the neighbourhood had begun to wake. The old curtains in her room were brown, but when sunlight passed through them, they appeared almost orange.",
  "Aratrika noticed these things because she had nowhere else to put her attention.",
  "She stood at the delicate threshold between childhood and youth.",
  "It was supposed to be a time of school uniforms, examinations, friendships, silly arguments and dreams that changed every few weeks.",
  "But inside her house, dreams were considered luxuries. Especially for girls.",
  "She sat beside the window with an open notebook. The first page was blank. She liked blank pages. Nobody had yet told them what they were supposed to become.",
  "Outside, a vegetable seller called out to the early morning neighbourhood. Somewhere a bicycle bell rang twice. A bus groaned along the main road.",
  "Aratrika dipped her pen into the ink. Then she wrote:\nSome people are born into houses. Some people are born into expectations.",
  "She stopped. She read the two sentences again. Then she scratched out the second one. She wrote:\nSome houses have walls. Some houses have rules.",
  "That sounded better. She smiled. It was a very small smile. But it belonged entirely to her.",
  "“Aratrika!” Her mother's voice came from the corridor. She closed the notebook immediately. “Coming.” She slid it beneath her schoolbooks.",
  "That notebook was not a diary. At least, she did not call it one. A diary was something private. This was different. This was where she kept the things she could not say.",
  "There were sentences about school. Sentences about her teachers. Sentences about books. Sentences about the way people looked at one another. And sometimes sentences about herself. Those were the most dangerous ones.",
  "Because whenever Aratrika wrote about herself, she began asking questions. And questions were not always welcome in her house.",
  "At breakfast, the television was playing the morning news. Her father sat at the table reading a newspaper. Her mother was preparing tea. Aratrika stood quietly near the doorway.",
  "“You're late,” her father said.\n“Sorry.”\n“You have school.”\n“I know.”\n“Then why are you standing there?”",
  "She sat down. Nobody spoke for several seconds. Her father turned a page.",
  "“Examinations are coming.”\n“Yes.”\n“Your cousin got very good marks last year.”\nAratrika nodded.\n“Study properly.”\n“Yes.”",
  "That was how most conversations about her future happened. Short sentences. Instructions. Comparisons. Expectations. Never questions. Nobody asked what she wanted to become.",
  "Perhaps they assumed a girl did not need such a question. Perhaps they thought the answer would not matter.",
  "Aratrika did have an answer. She wanted to write. She wanted to speak. She wanted to stand somewhere someday and make people listen—not because she was loud, but because what she said mattered.",
  "She had never said this aloud. Instead, she took another sip of tea.",
  "The newspaper rustled. Her father looked at her.\n“Why are you always writing?”\nAratrika froze.\n“Nothing.”\n“I have seen your notebooks.”\n“They're school notes.”\n“Then study from them.”\n“Yes.”",
  "He returned to the newspaper. The conversation was over. But Aratrika's heart continued it.",
  "Why is writing considered useless? Why is studying only valuable when it produces marks? Why does everyone ask what I scored but nobody asks what I thought?",
  "She looked down at her plate. She knew better than to ask. So she ate quietly.",
  "At school, things were different. Not completely different. But enough.",
  "The school corridor was loud with footsteps, conversations and laughter. Aratrika liked it. Here, people were allowed to be unfinished.",
  "A student could make a mistake in mathematics. Someone could forget a poem. Someone could answer a question incorrectly. Someone could laugh too loudly. The world did not end.",
  "She entered her classroom and took her usual seat. On the blackboard was written:\nCLASS X — YOUR FUTURE BEGINS NOW",
  "Aratrika stared at the sentence. She wondered whether futures really began in classrooms. Or whether they began much earlier.",
  "Perhaps hers had begun the first time somebody told her she could not do something. Perhaps everyone's future began with a sentence someone else had spoken about them.",
  "She opened her textbook. The teacher entered.\n“Good morning.”\nThe class stood.\n“Good morning, ma'am.”\n“Sit down.”",
  "Chairs moved. Books opened. Pens clicked. And another ordinary school day began.",
  "Aratrika did not know that before the year ended, her marks would become a number people remembered. She did not know that her name would one day appear in places she had never imagined. She did not know that one day strangers would read the words she was hiding beneath her schoolbooks. She certainly did not know that her notebook would outlive her.",
  "For now, she was simply a student sitting in Class X, listening to a lesson while secretly writing a sentence in the margin of her notebook:\nIf nobody gives you a voice, perhaps you have to write one.",
  "She underlined it once. Then twice. And closed the book."
];

const PARAGRAPHS_PER_PAGE = 3;

export const ImmersiveReaderModal: React.FC<ImmersiveReaderModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [theme, setTheme] = useState<'ivory' | 'parchment' | 'dark' | 'sepia'>('ivory');
  const [fontSize, setFontSize] = useState<number>(20);
  const [lineSpacing, setLineSpacing] = useState<number>(2.0);
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [rulerY, setRulerY] = useState<number>(200);
  const [isPlayingNarration, setIsPlayingNarration] = useState<boolean>(false);
  const [isNarrationPaused, setIsNarrationPaused] = useState<boolean>(false);
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);
  const [autoAdvancePage, setAutoAdvancePage] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => audioSynth.getIsPlaying());
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1.0);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [savedWords, setSavedWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wow_saved_words');
      return saved ? JSON.parse(saved) : ['luxuries', 'voice', 'expectations', 'margin'];
    } catch {
      return ['luxuries', 'voice', 'expectations', 'margin'];
    }
  });

  const [is3DotMenuOpen, setIs3DotMenuOpen] = useState<boolean>(false);
  const [isGlossaryHistoryOpen, setIsGlossaryHistoryOpen] = useState<boolean>(false);
  const [isPronunciationGuideOpen, setIsPronunciationGuideOpen] = useState<boolean>(false);
  const [ambientMode, setAmbientMode] = useState<'none' | 'rain' | 'tanpura' | 'market' | 'courtyard'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  const [historyItems, setHistoryItems] = useState<GlossaryHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('wow_glossary_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pronunciationModalWord, setPronunciationModalWord] = useState<{
    word: string;
    phonetic: string;
    bengali: string;
    definition: string;
  }>({
    word: 'Aratrika',
    phonetic: '/ɑː.rə.trɪ.kɑː/',
    bengali: 'আরাত্রিকা - সন্ধ্যার সান্ধ্য দীপ',
    definition: 'The protagonist whose pen becomes a sanctuary.'
  });

  // Load available Web Speech API voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail && avail.length > 0) {
        setVoices(avail);
        if (!selectedVoiceURI) {
          const natural = avail.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Enhanced')));
          const eng = avail.find(v => v.lang.startsWith('en'));
          setSelectedVoiceURI(natural ? natural.voiceURI : (eng ? eng.voiceURI : avail[0].voiceURI));
        }
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceURI]);

  // Ensure no background music/soundscape runs automatically until speaker icon is explicitly pressed
  useEffect(() => {
    if (isOpen) {
      try {
        audioSynth.pause();
        ambientAudio.stopSoundscape();
      } catch {}
      setIsMusicPlaying(false);
      setAmbientMode('none');
    }
  }, [isOpen]);

  // Preload entire Chapter 1 authentic lexicon on mount
  useEffect(() => {
    preloadChapter1Lexicon(CHAPTER_1_PARAGRAPHS);
  }, []);

  const handleToggleSoundscape = (mode: 'none' | 'rain' | 'tanpura' | 'market' | 'courtyard') => {
    setAmbientMode(mode);
    if (mode === 'none') {
      ambientAudio.stopSoundscape();
    } else {
      ambientAudio.startSoundscape(mode);
    }
  };

  const totalPages = Math.ceil(CHAPTER_1_PARAGRAPHS.length / PARAGRAPHS_PER_PAGE);
  const currentParagraphs = CHAPTER_1_PARAGRAPHS.slice(
    currentPage * PARAGRAPHS_PER_PAGE,
    (currentPage + 1) * PARAGRAPHS_PER_PAGE
  );

  // Compute full text and structured character token mapping for synchronized word-by-word highlighting
  const fullPageText = useMemo(() => currentParagraphs.join(' '), [currentParagraphs]);

  const pageTokensByPara = useMemo(() => {
    let charCursor = 0;
    return currentParagraphs.map((para, pIdx) => {
      const rawTokens = para.split(/(\b[\w'-]+\b)/g);
      const paraTokens: {
        text: string;
        isWord: boolean;
        cleanWord: string;
        globalStart: number;
        globalEnd: number;
        paraIdx: number;
      }[] = [];

      for (let i = 0; i < rawTokens.length; i++) {
        const tokenText = rawTokens[i];
        if (!tokenText) continue;

        const globalStart = charCursor;
        const globalEnd = charCursor + tokenText.length;
        charCursor += tokenText.length;

        const cleanWord = tokenText.toLowerCase().replace(/[^a-z'-]/g, '');
        const isWord = cleanWord.length > 0 && /[\w'-]/.test(tokenText);

        paraTokens.push({
          text: tokenText,
          isWord,
          cleanWord,
          globalStart,
          globalEnd,
          paraIdx: pIdx
        });
      }

      if (pIdx < currentParagraphs.length - 1) {
        charCursor += 1;
      }

      return paraTokens;
    });
  }, [currentParagraphs]);

  // Flat list of words for progress counting
  const allWordTokens = useMemo(() => {
    const list: {
      text: string;
      cleanWord: string;
      globalStart: number;
      globalEnd: number;
      paraIdx: number;
    }[] = [];
    pageTokensByPara.forEach(paraTokens => {
      paraTokens.forEach(t => {
        if (t.isWord) list.push(t);
      });
    });
    return list;
  }, [pageTokensByPara]);

  const currentSpokenToken = useMemo(() => {
    if (activeCharIndex === null) return null;
    return allWordTokens.find(t => activeCharIndex >= t.globalStart && activeCharIndex < t.globalEnd) || null;
  }, [activeCharIndex, allWordTokens]);

  const currentSpokenWordNumber = useMemo(() => {
    if (!currentSpokenToken) return 0;
    const idx = allWordTokens.findIndex(t => t.globalStart === currentSpokenToken.globalStart);
    return idx >= 0 ? idx + 1 : 0;
  }, [currentSpokenToken, allWordTokens]);

  // Synchronized Speech Synthesis Engine
  const startNarrationFromIndex = (startIndex: number = 0) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const textToRead = fullPageText.slice(startIndex);
    if (!textToRead.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = narrationSpeed;

    if (selectedVoiceURI && voices.length > 0) {
      const v = voices.find(voice => voice.voiceURI === selectedVoiceURI);
      if (v) utterance.voice = v;
    }

    utterance.onboundary = (event) => {
      if (typeof event.charIndex === 'number') {
        const absoluteIndex = startIndex + event.charIndex;
        setActiveCharIndex(absoluteIndex);
      }
    };

    utterance.onend = () => {
      setActiveCharIndex(null);
      setIsPlayingNarration(false);
      setIsNarrationPaused(false);

      // Auto page advance if enabled and not on last page
      if (autoAdvancePage && currentPage < totalPages - 1) {
        audioSynth.playTurnSound();
        setCurrentPage(p => p + 1);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[TTS Narration] Speech synthesis notice:', e);
      setActiveCharIndex(null);
      setIsPlayingNarration(false);
      setIsNarrationPaused(false);
    };

    setActiveCharIndex(startIndex);
    setIsPlayingNarration(true);
    setIsNarrationPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleNarration = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingNarration) {
      if (isNarrationPaused) {
        window.speechSynthesis.resume();
        setIsNarrationPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsNarrationPaused(true);
      }
    } else {
      startNarrationFromIndex(0);
    }
  };

  const handleStopNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingNarration(false);
    setIsNarrationPaused(false);
    setActiveCharIndex(null);
  };

  // Stop narration on unmount or modal close; restart when turning pages if active
  useEffect(() => {
    if (!isOpen) {
      handleStopNarration();
      return;
    }

    if (isPlayingNarration) {
      setTimeout(() => {
        startNarrationFromIndex(0);
      }, 350);
    } else {
      setActiveCharIndex(null);
    }
  }, [currentPage, isOpen]);

  if (!isOpen) return null;

  const handleWordClick = async (rawWord: string) => {
    const cleanWord = rawWord.trim().toLowerCase().replace(/[^a-z'-]/g, '');
    if (!cleanWord) return;

    const resolved = resolveUniversalWord(cleanWord);
    setSelectedWord(resolved);
    audioSynth.playTurnSound();

    try {
      const fetched = await fetchWordMeaningFromBackend(cleanWord);
      setSelectedWord(fetched);

      // Record in Glossary History
      const newItem: GlossaryHistoryItem = {
        id: `${cleanWord}_${Date.now()}`,
        word: fetched.word,
        phonetic: fetched.phonetic,
        bengali: fetched.translations.bengali,
        definition: fetched.definition,
        timestamp: Date.now()
      };

      setHistoryItems(prev => {
        const filtered = prev.filter(p => p.word.toLowerCase() !== fetched.word.toLowerCase());
        const updated = [newItem, ...filtered];
        try { localStorage.setItem('wow_glossary_history', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } catch {}
  };

  const handlePronounce = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleSave = (word: string) => {
    const updated = savedWords.includes(word)
      ? savedWords.filter(w => w !== word)
      : [...savedWords, word];
    setSavedWords(updated);
    try {
      localStorage.setItem('wow_saved_words', JSON.stringify(updated));
    } catch {}
  };

  const themes = {
    ivory: {
      bg: 'bg-[#FAF7F0]',
      text: 'text-[#2C1D14]',
      sub: 'text-[#6C5441]',
      border: 'border-[#E3D7BF]',
      card: 'bg-white'
    },
    parchment: {
      bg: 'bg-[#F4ECE1]',
      text: 'text-[#281B12]',
      sub: 'text-[#5F4632]',
      border: 'border-[#DAC8B1]',
      card: 'bg-[#FBF6EE]'
    },
    sepia: {
      bg: 'bg-[#EEDEC5]',
      text: 'text-[#362215]',
      sub: 'text-[#7A5B44]',
      border: 'border-[#D9C4A6]',
      card: 'bg-[#F6EBD9]'
    },
    dark: {
      bg: 'bg-[#120E0B]',
      text: 'text-[#EDE4D5]',
      sub: 'text-[#B8A390]',
      border: 'border-[#2A1E17]',
      card: 'bg-[#1C1510]'
    }
  };

  const activeTheme = themes[theme];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${activeTheme.bg} ${activeTheme.text} select-none overflow-hidden animate-fade-in font-serif transition-colors duration-300`}>
      
      {/* Immersive Top Bar */}
      <header className={`px-4 sm:px-8 py-3.5 border-b ${activeTheme.border} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Back Button */}
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-cinzel font-bold cursor-pointer transition-all ${activeTheme.card} ${activeTheme.text} ${activeTheme.border} hover:border-[#D4AF37]`}
            title="Return to Main Sanctuary"
          >
            <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>Back</span>
          </button>

          <div className="w-8 h-8 rounded-xl bg-[#8B2213]/10 border border-[#D4AF37]/50 text-[#8B2213] dark:text-[#E5A93C] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <span className="font-cinzel text-xs sm:text-sm font-bold tracking-wider uppercase block">
              Immersive Scribing Canvas
            </span>
            <span className="text-[10px] font-serif opacity-75">
              Chapter 1: The Colour of Morning &bull; Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        </div>

        {/* Audio Narration, Music & Preferences Controls */}
        <div className="flex items-center gap-2">
          {/* Speaker Button: Background Music Control */}
          <button
            onClick={() => {
              const playing = audioSynth.getIsPlaying();
              if (playing) {
                audioSynth.pause();
                setIsMusicPlaying(false);
              } else {
                audioSynth.play();
                setIsMusicPlaying(true);
              }
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isMusicPlaying 
                ? 'bg-[#8B2213] text-white border-[#D4AF37]' 
                : `${activeTheme.card} ${activeTheme.text} ${activeTheme.border} hover:border-[#D4AF37]`
            }`}
            title={isMusicPlaying ? 'Mute Background Music' : 'Play Background Music'}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4 text-amber-200" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>
          
          {/* Synchronized Read Aloud Narration Button */}
          <button
            onClick={handleToggleNarration}
            className={`px-3.5 py-1.5 rounded-full text-xs font-cinzel font-bold flex items-center gap-2 transition-all cursor-pointer border ${
              isPlayingNarration 
                ? isNarrationPaused 
                  ? 'bg-amber-600 text-white border-amber-300' 
                  : 'bg-[#8B2213] text-white border-[#D4AF37] shadow-md shadow-amber-500/20' 
                : `${activeTheme.card} ${activeTheme.text} ${activeTheme.border} hover:border-[#D4AF37]`
            }`}
            title="Toggle Synchronized Text-to-Speech Narration"
          >
            {isPlayingNarration && !isNarrationPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span className="hidden sm:inline">Pause Voice</span>
              </>
            ) : isNarrationPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">Resume Voice</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Sync Read Aloud</span>
              </>
            )}
          </button>

          {/* Reading Focus Line Ruler */}
          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showRuler 
                ? 'bg-[#8B2213] text-white border-[#D4AF37]' 
                : `${activeTheme.card} ${activeTheme.text} ${activeTheme.border}`
            }`}
            title="Toggle Reading Guide Ruler"
          >
            <Eye className="w-4 h-4 text-[#D4AF37]" />
          </button>

          {/* Settings Drawer */}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className={`p-2 rounded-xl border ${activeTheme.card} ${activeTheme.text} ${activeTheme.border} hover:border-[#D4AF37] transition-colors cursor-pointer`}
            title="Appearance Settings"
          >
            <Settings className="w-4 h-4 text-[#D4AF37]" />
          </button>

          {/* 3-Dot Options Button */}
          <div className="relative">
            <button
              onClick={() => setIs3DotMenuOpen(!is3DotMenuOpen)}
              className={`p-2 rounded-xl border ${activeTheme.card} ${activeTheme.text} ${activeTheme.border} hover:border-[#D4AF37] transition-colors cursor-pointer flex items-center justify-center`}
              title="More Options"
            >
              <MoreVertical className="w-4 h-4 text-[#D4AF37]" />
            </button>

            {/* 3-Dot Menu Dropdown */}
            {is3DotMenuOpen && (
              <div className="absolute right-0 top-12 w-60 rounded-2xl bg-[#1C1510] text-[#FAF5EE] border border-[#D4AF37]/50 shadow-2xl p-3 z-50 space-y-2 text-left">
                
                {/* Glossary History Panel */}
                <button
                  onClick={() => {
                    setIsGlossaryHistoryOpen(true);
                    setIs3DotMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-[#2A1E16] text-xs font-cinzel font-bold flex items-center gap-2.5 transition-colors border border-transparent hover:border-[#D4AF37]/30"
                >
                  <History className="w-4 h-4 text-[#D4AF37]" />
                  <span>Glossary History Panel</span>
                </button>

                {/* Pronunciation Guide */}
                <button
                  onClick={() => {
                    setIsPronunciationGuideOpen(true);
                    setIs3DotMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-[#2A1E16] text-xs font-cinzel font-bold flex items-center gap-2.5 transition-colors border border-transparent hover:border-[#D4AF37]/30"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Pronunciation Guide</span>
                </button>

                {/* Ambient Soundscapes */}
                <div className="p-2.5 rounded-xl bg-[#140F0C] border border-[#D4AF37]/25 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-cinzel font-bold text-[#D4AF37] uppercase">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Ambient Soundscape</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {[
                      { id: 'none', label: 'Off' },
                      { id: 'rain', label: 'Monsoon Rain' },
                      { id: 'tanpura', label: 'Tanpura' },
                      { id: 'market', label: 'Market Bells' },
                      { id: 'courtyard', label: 'Petrichor' }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleToggleSoundscape(s.id as any)}
                        className={`p-1 rounded-md border text-center transition-all ${
                          ambientMode === s.id
                            ? 'bg-[#B93826] text-white border-amber-300 font-bold'
                            : 'bg-[#1C1510] text-[#C5B4A0] border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Close Immersive View */}
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border ${activeTheme.card} hover:bg-[#8B2213] hover:text-white ${activeTheme.border} transition-colors cursor-pointer ml-1`}
            title="Exit Immersive Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Synchronized Voice Reading Live Control Bar */}
      {(isPlayingNarration || isNarrationPaused) && (
        <div className="px-4 py-2 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white border-b border-[#D4AF37]/60 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs font-cinzel font-bold z-30 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/25 border border-amber-300/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
              <span className="text-[10px] tracking-widest text-amber-200 uppercase">
                {isNarrationPaused ? 'VOICE PAUSED' : 'SYNC VOICE READING'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 h-3.5">
              <span className={`w-0.5 bg-amber-200 transition-all ${isNarrationPaused ? 'h-1.5' : 'h-3.5 animate-bounce'}`} style={{ animationDelay: '0ms' }} />
              <span className={`w-0.5 bg-amber-200 transition-all ${isNarrationPaused ? 'h-2' : 'h-3.5 animate-bounce'}`} style={{ animationDelay: '150ms' }} />
              <span className={`w-0.5 bg-amber-200 transition-all ${isNarrationPaused ? 'h-1.5' : 'h-3.5 animate-bounce'}`} style={{ animationDelay: '300ms' }} />
            </div>

            <span className="text-[11px] font-serif text-amber-100/90 hidden md:inline">
              Word {currentSpokenWordNumber} of {allWordTokens.length}
              {currentSpokenToken ? ` · "${currentSpokenToken.cleanWord}"` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto Page Advance Toggle */}
            <button
              onClick={() => setAutoAdvancePage(!autoAdvancePage)}
              className={`px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase border transition-all cursor-pointer ${
                autoAdvancePage 
                  ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 shadow-xs' 
                  : 'bg-black/20 text-amber-200/70 border-white/20'
              }`}
              title="Automatically turn to next page when voice completes current page"
            >
              Auto Turn: {autoAdvancePage ? 'ON' : 'OFF'}
            </button>

            {/* Play/Pause */}
            <button
              onClick={handleToggleNarration}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/30 text-white cursor-pointer border border-white/20 transition-all"
              title={isNarrationPaused ? 'Resume Voice Reading' : 'Pause Voice Reading'}
            >
              {isNarrationPaused ? <Play className="w-3.5 h-3.5 text-amber-200" /> : <Pause className="w-3.5 h-3.5 text-amber-200" />}
            </button>

            {/* Stop */}
            <button
              onClick={handleStopNarration}
              className="p-1.5 rounded-full bg-rose-900/50 hover:bg-rose-800 text-white cursor-pointer border border-rose-400/40 transition-all"
              title="Stop Read Aloud"
            >
              <Square className="w-3.5 h-3.5 text-rose-200" />
            </button>
          </div>
        </div>
      )}

      {/* Main Immersive Canvas */}
      <main 
        className="flex-1 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto relative"
        onMouseMove={(e) => {
          if (showRuler) {
            const rect = e.currentTarget.getBoundingClientRect();
            setRulerY(e.clientY - rect.top - 18);
          }
        }}
      >
        {/* Floating Line Ruler */}
        {showRuler && (
          <div 
            className="absolute left-0 right-0 h-10 bg-amber-500/10 border-y border-[#D4AF37]/60 pointer-events-none z-20 transition-all duration-75 mix-blend-multiply dark:mix-blend-screen"
            style={{ top: `${rulerY}px` }}
          />
        )}

        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center space-y-8">
          
          {/* Chapter Opening Badge on First Page */}
          {currentPage === 0 && (
            <div className="text-center pb-4 mb-2 border-b border-[#D4AF37]/30 space-y-1">
              <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#8B2213] dark:text-[#E5A93C] uppercase">
                Canon Manuscript &bull; Wilting of Words
              </span>
              <h1 className="text-2xl sm:text-4xl font-cinzel font-extrabold tracking-wide text-[#8B2213] dark:text-[#E5A93C]">
                The Colour of Morning
              </h1>
            </div>
          )}

          {/* Paragraphs with Drop Cap, Synchronized TTS Highlighting, and Universal Tap Translation */}
          <div 
            className="space-y-8 text-justify leading-relaxed"
            style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
          >
            {pageTokensByPara.map((paraTokens, pIdx) => {
              const isFirstPara = currentPage === 0 && pIdx === 0;
              const isParagraphCurrentlyActive = currentSpokenToken && currentSpokenToken.paraIdx === pIdx;

              return (
                <p 
                  key={pIdx} 
                  className={`relative p-3 rounded-2xl transition-all duration-300 ${
                    isParagraphCurrentlyActive
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-[#D4AF37]/40 shadow-xs'
                      : ''
                  }`}
                >
                  {isFirstPara && (
                    <span 
                      className="float-left text-5xl sm:text-6xl font-cinzel font-extrabold text-[#8B2213] dark:text-[#E5A93C] mr-3.5 mb-1 mt-1 leading-none select-none px-3 py-1 bg-gradient-to-br from-[#D4AF37]/20 to-amber-500/10 border-2 border-[#D4AF37]/60 rounded-xl shadow-md"
                    >
                      T
                    </span>
                  )}

                  {paraTokens.map((token, tIdx) => {
                    let display = token.text;
                    if (isFirstPara && pIdx === 0 && tIdx === 0 && token.cleanWord === 'the') {
                      display = token.text.slice(1);
                    }

                    if (!token.isWord) {
                      return <span key={tIdx}>{display}</span>;
                    }

                    const isCurrentlySpoken = isPlayingNarration &&
                      activeCharIndex !== null &&
                      activeCharIndex >= token.globalStart &&
                      activeCharIndex < token.globalEnd;

                    return (
                      <span
                        key={tIdx}
                        onClick={() => {
                          if (isPlayingNarration || isNarrationPaused) {
                            startNarrationFromIndex(token.globalStart);
                          } else {
                            handleWordClick(token.cleanWord);
                          }
                        }}
                        className={`cursor-pointer rounded px-1 py-0.5 transition-all duration-150 inline-block ${
                          isCurrentlySpoken
                            ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-[#D4AF37] text-stone-950 font-black shadow-lg shadow-amber-500/50 scale-110 ring-2 ring-[#8B2213] dark:ring-[#D4AF37] z-20 mx-0.5'
                            : 'hover:bg-[#D4AF37]/25 underline decoration-dotted decoration-[#D4AF37]/40'
                        }`}
                        title={isPlayingNarration ? `Jump voice reading to '${token.cleanWord}'` : `Tap to translate '${token.cleanWord}'`}
                      >
                        {display}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>

        </div>

        {/* Bottom Paging Controller */}
        <footer className={`max-w-3xl mx-auto w-full pt-6 mt-8 border-t ${activeTheme.border} flex items-center justify-between font-cinzel text-xs font-bold shrink-0`}>
          <button
            onClick={() => {
              if (currentPage > 0) {
                audioSynth.playTurnSound();
                setCurrentPage(p => p - 1);
              }
            }}
            disabled={currentPage === 0}
            className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              currentPage === 0 
                ? 'opacity-30 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/50 shadow-md'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-[#8B2213] dark:text-[#E5A93C] tracking-widest uppercase">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={() => {
              if (currentPage < totalPages - 1) {
                audioSynth.playTurnSound();
                setCurrentPage(p => p + 1);
              }
            }}
            disabled={currentPage === totalPages - 1}
            className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              currentPage === totalPages - 1 
                ? 'opacity-30 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/50 shadow-md'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </main>

      {/* Floating Universal Word Translation Modal */}
      {selectedWord && (
        <aside className={`absolute bottom-6 right-6 z-40 w-80 sm:w-96 p-5 rounded-2xl ${activeTheme.card} border-2 border-[#D4AF37]/60 shadow-2xl backdrop-blur-md animate-slide-in text-[#2C1D14] dark:text-[#FAF5EE]`}>
          <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-2 mb-2">
            <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#E5A93C] flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Lexicon Multilingual Translation</span>
            </span>
            <button onClick={() => setSelectedWord(null)} className="opacity-60 hover:opacity-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-cinzel font-bold text-[#8B2213] dark:text-[#E5A93C] capitalize">
                  {selectedWord.word}
                </h4>
                <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  {selectedWord.phonetic} &bull; {selectedWord.pos}
                </span>
              </div>
              <button
                onClick={() => handlePronounce(selectedWord.word)}
                className="p-1.5 rounded-lg border border-[#D4AF37]/40 hover:bg-[#D4AF37]/15 cursor-pointer text-[#8B2213] dark:text-[#E5A93C]"
                title="Listen to Pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-serif opacity-90 leading-relaxed">
              {selectedWord.definition}
            </p>

            {/* Authentic Bengali Lexicon Translation */}
            <div className="space-y-1.5 pt-1.5">
              <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#E5A93C]">
                Bengali Meaning (বাংলা অর্থ)
              </span>
              <div className="text-xs font-serif">
                <div className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[#D4AF37]/25">
                  <span className="mt-0.5 block leading-relaxed font-medium">{selectedWord.translations.bengali}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#D4AF37]/25 flex justify-between gap-2">
            <button
              onClick={() => handleToggleSave(selectedWord.word)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-cinzel font-bold cursor-pointer transition-colors border ${
                savedWords.includes(selectedWord.word)
                  ? 'bg-emerald-700 text-white border-emerald-500'
                  : 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/50'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 inline mr-1" />
              <span>{savedWords.includes(selectedWord.word) ? 'Saved in Vault' : 'Save to Vault'}</span>
            </button>
          </div>
        </aside>
      )}

      {/* Preferences Drawer */}
      {showPreferences && (
        <aside className={`absolute top-16 right-6 z-40 w-80 p-5 rounded-2xl ${activeTheme.card} border-2 border-[#D4AF37]/60 shadow-2xl space-y-4 animate-fade-in font-cinzel text-xs`}>
          <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-2">
            <span className="font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#E5A93C]">
              Immersive Typography &amp; Voice
            </span>
            <button onClick={() => setShowPreferences(false)} className="opacity-60 hover:opacity-100 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Themes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase opacity-75">Canvas Theme</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'ivory', label: 'Ivory' },
                { id: 'parchment', label: 'Parch' },
                { id: 'sepia', label: 'Sepia' },
                { id: 'dark', label: 'Dark' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`py-1 rounded-lg border uppercase cursor-pointer ${theme === t.id ? 'border-[#D4AF37] bg-[#8B2213] text-white' : 'border-[#D4AF37]/20 opacity-70'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span>Text Size: {fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="16" 
              max="28" 
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full accent-[#8B2213] cursor-pointer"
            />
          </div>

          {/* Narration Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span>Voice Pace: {narrationSpeed}x</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0.75, 1.0, 1.25, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    setNarrationSpeed(speed);
                    if (isPlayingNarration) {
                      startNarrationFromIndex(activeCharIndex || 0);
                    }
                  }}
                  className={`py-1 rounded-lg border cursor-pointer ${narrationSpeed === speed ? 'border-[#D4AF37] bg-[#8B2213] text-white' : 'border-[#D4AF37]/20 opacity-70'}`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* TTS Voice Selector */}
          {voices.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-75 block">
                Synchronized Narrator Voice
              </label>
              <select
                value={selectedVoiceURI}
                onChange={(e) => {
                  setSelectedVoiceURI(e.target.value);
                  if (isPlayingNarration) {
                    startNarrationFromIndex(activeCharIndex || 0);
                  }
                }}
                className="w-full p-2 rounded-xl text-[11px] border border-[#D4AF37]/40 bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                {voices.filter(v => v.lang.startsWith('en')).map((v, i) => (
                  <option key={i} value={v.voiceURI} className="bg-stone-900 text-white">
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Auto Turn Page Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-[#D4AF37]/20">
            <span className="text-[10px] font-bold uppercase opacity-80">Auto Turn Page on Voice Finish</span>
            <button
              type="button"
              onClick={() => setAutoAdvancePage(!autoAdvancePage)}
              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${autoAdvancePage ? 'bg-[#8B2213]' : 'bg-stone-600'}`}
            >
              <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${autoAdvancePage ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </aside>
      )}

      {/* Glossary History Panel Drawer */}
      <GlossaryHistoryDrawer
        isOpen={isGlossaryHistoryOpen}
        onClose={() => setIsGlossaryHistoryOpen(false)}
        historyItems={historyItems}
        onClearHistory={() => {
          setHistoryItems([]);
          try { localStorage.removeItem('wow_glossary_history'); } catch {}
        }}
        onSaveToVault={(item) => handleToggleSave(item.word)}
        onOpenPronunciation={(item) => {
          setPronunciationModalWord({
            word: item.word,
            phonetic: item.phonetic,
            bengali: item.bengali,
            definition: item.definition
          });
          setIsPronunciationGuideOpen(true);
        }}
        isDark={theme === 'dark'}
      />

      {/* Interactive Pronunciation Guide Modal */}
      <PronunciationGuideModal
        isOpen={isPronunciationGuideOpen}
        onClose={() => setIsPronunciationGuideOpen(false)}
        word={pronunciationModalWord.word}
        phonetic={pronunciationModalWord.phonetic}
        bengaliTranslation={pronunciationModalWord.bengali}
        definition={pronunciationModalWord.definition}
        isDark={theme === 'dark'}
      />

    </div>
  );
};
