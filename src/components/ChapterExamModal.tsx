import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  GraduationCap,
  Scroll,
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioSynth } from '../services/audioSynth';

interface ChapterExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onOpenReader?: () => void;
}

interface Question {
  id: number;
  question: string;
  context: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation: string;
}

// 100% Human-curated canonical questions strictly based on Chapter 1 of the Interactive Reader
const CHAPTER_1_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What was the very first realization Aratrika made about mornings?",
    context: "Chapter 1: The Colour of Morning • Opening Paragraph",
    options: [
      "That mornings were always quiet and cold",
      "That mornings had real colours, not textbook colours",
      "That sunrise arrived too quickly in Chakdaha",
      "That her school uniform was waiting in the corridor"
    ],
    correctIndex: 1,
    explanation: "Aratrika learned that mornings had real colours—pale gold when sunlight entered through her eastern window, turning the sky white before sunrise.",
    citation: "Page 1: 'The first thing Aratrika learned about mornings was that they had colours. Not the colours people painted on walls. Not the colours printed in school textbooks. Real colours.'"
  },
  {
    id: 2,
    question: "What did Aratrika appreciate most about the first blank page of her notebook?",
    context: "Chapter 1: The Colour of Morning • Page 1",
    options: [
      "The delicate quality of the paper",
      "That nobody had yet told it what it was supposed to become",
      "The hand-painted cover she had created",
      "The date stamped on the corner by her teacher"
    ],
    correctIndex: 1,
    explanation: "Aratrika loved blank pages because, unlike her own life governed by family expectations, nobody had yet dictated their purpose.",
    citation: "Page 1: 'She sat beside the window with an open notebook. The first page was blank. She liked blank pages. Nobody had yet told them what they were supposed to become.'"
  },
  {
    id: 3,
    question: "Inside Aratrika's household, how were dreams viewed, particularly for daughters?",
    context: "Chapter 1: The House of Expectations",
    options: [
      "They were considered essential investments",
      "They were considered luxuries",
      "They were considered dangerous rebellions",
      "They were celebrated as sacred aspirations"
    ],
    correctIndex: 1,
    explanation: "In her traditional household, aspirations and dreams were considered unnecessary luxuries, especially for young girls who were expected to conform.",
    citation: "Page 1: 'But inside her house, dreams were considered luxuries. Especially for girls.'"
  },
  {
    id: 4,
    question: "What sentence did Aratrika write in her notebook and then scratch out to replace?",
    context: "Chapter 1: The Notebook Inscription",
    options: [
      "“Some people are born into houses. Some people are born into expectations.”",
      "“Some houses have walls. Some houses have rules.”",
      "“If nobody gives you a voice, perhaps you have to write one.”",
      "“Why does everyone ask what I scored but nobody asks what I thought?”"
    ],
    correctIndex: 0,
    explanation: "She originally wrote 'Some people are born into expectations' before scratching it out and writing 'Some houses have walls. Some houses have rules.'",
    citation: "Page 1: 'Aratrika dipped her pen into the ink. Then she wrote: Some people are born into houses. Some people are born into expectations. She stopped... then she scratched out the second one.'"
  },
  {
    id: 5,
    question: "Why did Aratrika refuse to call her writing book an ordinary 'diary'?",
    context: "Chapter 1: The Secret Writing",
    options: [
      "Because it was assigned as homework by her literature teacher",
      "Because a diary was something private, whereas this notebook was where she kept the things she could not say aloud",
      "Because her mother occasionally checked its pages",
      "Because she planned to publish it in the local newspaper"
    ],
    correctIndex: 1,
    explanation: "A diary was merely private, but her notebook was an existential sanctuary where she stored the dangerous questions and thoughts she was forbidden from vocalizing.",
    citation: "Page 2: 'That notebook was not a diary. At least, she did not call it one. A diary was something private. This was different. This was where she kept the things she could not say.'"
  },
  {
    id: 6,
    question: "At the breakfast table, what was her father doing when he confronted her about writing?",
    context: "Chapter 1: The Family Breakfast",
    options: [
      "Listening to the morning radio",
      "Reading a newspaper while rustling the pages",
      "Drinking tea and writing notes",
      "Talking to a neighbor near the front gate"
    ],
    correctIndex: 1,
    explanation: "Her father was sitting with a newspaper, speaking in short, curt sentences, asking why she was always writing instead of studying.",
    citation: "Page 2: 'Her father sat at the table reading a newspaper... The newspaper rustled. Her father looked at her. “Why are you always writing?”'"
  },
  {
    id: 7,
    question: "What comparison did her father draw when warning her about upcoming examinations?",
    context: "Chapter 1: Parental Pressure",
    options: [
      "He compared her to her school headmaster",
      "He pointed out her cousin who got very good marks last year",
      "He compared her to her older brother",
      "He reminded her of her previous semester's rank"
    ],
    correctIndex: 1,
    explanation: "Conversations in the house were built on comparisons and expectations; her father pressured her with her cousin's examination scores.",
    citation: "Page 2: '“Examinations are coming.” “Yes.” “Your cousin got very good marks last year.” Aratrika nodded. “Study properly.”'"
  },
  {
    id: 8,
    question: "Why did Aratrika feel a sense of relief inside her noisy school corridor?",
    context: "Chapter 1: The School Environment",
    options: [
      "Because she could escape the surveillance of teachers",
      "Because here, people were allowed to be unfinished and make mistakes without the world ending",
      "Because her best friends were waiting for her",
      "Because there were no examinations scheduled that week"
    ],
    correctIndex: 1,
    explanation: "Unlike the oppressive perfectionism of home, school allowed human imperfection—students could forget a poem or answer wrong, and life went on.",
    citation: "Page 3: 'The school corridor was loud with footsteps, conversations and laughter. Aratrika liked it. Here, people were allowed to be unfinished.'"
  },
  {
    id: 9,
    question: "What phrase was inscribed in chalk on the blackboard of her Class X classroom?",
    context: "Chapter 1: The Classroom Blackboard",
    options: [
      "KNOWLEDGE IS WEALTH",
      "CLASS X — YOUR FUTURE BEGINS NOW",
      "EXAMINATIONS BRING SUCCESS",
      "WELCOME TO THE ACADEMIC YEAR"
    ],
    correctIndex: 1,
    explanation: "The blackboard announced that their future was beginning, prompting Aratrika to wonder whether futures began in classrooms or much earlier in what people told you.",
    citation: "Page 3: 'She entered her classroom and took her usual seat. On the blackboard was written: CLASS X — YOUR FUTURE BEGINS NOW.'"
  },
  {
    id: 10,
    question: "What defining sentence did Aratrika secretly write in the margin of her notebook and underline twice?",
    context: "Chapter 1: The Final Margin Inscription",
    options: [
      "“Some houses have walls. Some houses have rules.”",
      "“Silence is the only armor a girl can wear.”",
      "“If nobody gives you a voice, perhaps you have to write one.”",
      "“A notebook will always outlive its writer.”"
    ],
    correctIndex: 2,
    explanation: "In the quiet margins of her notebook beneath her schoolbooks, Aratrika wrote her historic manifesto of personal autonomy and underlined it twice.",
    citation: "Page 3: 'For now, she was simply a student sitting in Class X... secretly writing a sentence in the margin of her notebook: If nobody gives you a voice, perhaps you have to write one. She underlined it once. Then twice. And closed the book.'"
  }
];

export const ChapterExamModal: React.FC<ChapterExamModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onOpenReader
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showCitation, setShowCitation] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ = CHAPTER_1_QUESTIONS[currentIdx];
  const totalQuestions = CHAPTER_1_QUESTIONS.length;
  const isAnswered = selectedAnswers[currentQ.id] !== undefined;
  const currentSelection = selectedAnswers[currentQ.id];

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
    try {
      audioSynth.playNow();
    } catch {}
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowCitation(false);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowCitation(false);
    }
  };

  const calculateScore = () => {
    let score = 0;
    CHAPTER_1_QUESTIONS.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    if (score >= 7) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#D4AF37', '#B93826', '#E5A93C']
        });
      } catch {}
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setShowCitation(false);
  };

  const finalScore = calculateScore();
  const percentage = Math.round((finalScore / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      
      {/* 
        AESTHETIC ROYAL MODAL CONTAINER
        Styled to match the main page aesthetic: Gold double borders #D4AF37, rich crimson accents #8B2213, Cinzel & Cormorant typography
      */}
      <div 
        className={`relative w-full max-w-2xl rounded-3xl border-2 border-double shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] transition-all ${
          isDark 
            ? 'bg-[#16100B] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Top Royal Banner */}
        <div className="px-5 py-4 border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-100">
                Chapter 1 Scholastic Examination
              </h3>
              <p className="text-[10px] font-serif italic text-amber-200/80">
                The Colour of Morning &bull; Verified Textual Comprehension
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Exam"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="px-5 py-2.5 border-b border-[#D4AF37]/25 flex items-center justify-between text-xs font-cinzel font-bold bg-[#D4AF37]/5">
          <span className="text-[#8B2213] dark:text-[#E5A93C] flex items-center gap-1.5">
            <Scroll className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Question {currentIdx + 1} of {totalQuestions}</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sans opacity-70">
              Answered: {Object.keys(selectedAnswers).length}/{totalQuestions}
            </span>
            <div className="w-24 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8B2213] to-[#D4AF37] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          
          {isSubmitted ? (
            /* ========================================================= */
            /* FINAL EXAMINATION SCORECARD & SCHOLASTIC CONFERMENT       */
            /* ========================================================= */
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-[#D4AF37]/30 to-[#8B2213]/30 border-2 border-[#D4AF37] flex items-center justify-center text-3xl shadow-xl">
                {percentage >= 70 ? '👑' : '📜'}
              </div>

              <div>
                <span className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C] block mb-1">
                  Examination Result Conferred
                </span>
                <h4 className="font-cinzel text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">
                  {percentage >= 90 ? 'Mastery of Chapter 1' : percentage >= 70 ? 'Scholastic Honors' : 'Literary Apprentice'}
                </h4>
                <p className="text-xs font-serif text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
                  {percentage >= 70 
                    ? "Congratulations! You have demonstrated deep textual understanding of Aratrika's unspoken world in Chakdaha."
                    : "You have completed the examination. Revisit Chapter 1 inside the E-Reader to deepen your grasp of the nuances."
                  }
                </p>
              </div>

              {/* Score Display Card */}
              <div className="p-5 rounded-2xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 max-w-sm mx-auto flex items-center justify-around shadow-inner">
                <div>
                  <div className="font-cinzel text-3xl font-black text-[#8B2213] dark:text-[#FFE58F]">
                    {finalScore}/{totalQuestions}
                  </div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Correct Answers
                  </div>
                </div>

                <div className="h-10 w-[1px] bg-[#D4AF37]/40" />

                <div>
                  <div className="font-cinzel text-3xl font-black text-[#D4AF37]">
                    {percentage}%
                  </div>
                  <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Accuracy Rate
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleRestart}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#D4AF37]/60 text-xs font-cinzel font-bold uppercase tracking-wider hover:bg-[#D4AF37]/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Retake Examination</span>
                </button>

                {onOpenReader && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReader();
                    }}
                    className="w-full sm:w-auto px-7 py-2.5 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#E5A93C] text-white text-xs font-cinzel font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-200" />
                    <span>Open E-Reader Chapter 1</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* QUESTION QUESTION PRESENTATION (Textbook Accurate)        */
            /* ========================================================= */
            <div className="space-y-5 animate-fade-in">
              {/* Question Header & Context */}
              <div>
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#B93826] dark:text-[#E5A93C] block mb-1">
                  {currentQ.context}
                </span>
                <h4 className="font-serif text-lg sm:text-xl font-bold leading-relaxed text-stone-900 dark:text-stone-100">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = currentSelection === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-md text-[#8B2213] dark:text-[#FFE58F] font-semibold' 
                          : 'border-stone-300 dark:border-stone-800 hover:border-[#D4AF37]/60 hover:bg-black/5 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-cinzel font-bold ${
                        isSelected 
                          ? 'border-[#B93826] bg-[#B93826] text-white' 
                          : 'border-stone-400 dark:border-stone-600'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-xs sm:text-sm font-serif leading-relaxed">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Canonical Citation Accordion */}
              <div className="pt-2">
                <button
                  onClick={() => setShowCitation(!showCitation)}
                  className="text-[11px] font-cinzel font-bold text-[#8B2213] dark:text-[#E5A93C] flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{showCitation ? "Hide Textual Excerpt" : "Inspect Chapter 1 Excerpt & Citation"}</span>
                </button>

                {showCitation && (
                  <div className="mt-2 p-3.5 rounded-xl bg-amber-500/10 border border-[#D4AF37]/35 text-xs font-serif italic text-stone-700 dark:text-stone-300 leading-relaxed animate-fade-in">
                    {currentQ.citation}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Navigation Toolbar */}
        {!isSubmitted && (
          <div className="px-5 py-3.5 border-t border-[#D4AF37]/30 bg-black/5 dark:bg-white/5 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-cinzel font-bold uppercase tracking-wider flex items-center gap-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIdx === totalQuestions - 1 ? (
              <button
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#E5A93C] text-white font-cinzel font-bold text-xs uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span>Submit Exam</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-[#8B2213] hover:bg-[#B93826] text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
