import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Settings, 
  Keyboard, 
  X, 
  Sparkles, 
  Send, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';

interface WOWAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDark?: boolean;
  userName?: string;
  onOpenReader?: () => void;
  onOpenImmersive?: () => void;
  onJumpToSection?: (sectionId: string) => void;
  onOpenCertificate?: () => void;
  onOpenExam?: () => void;
  onOpenAdmin?: () => void;
  onOpenSettings?: () => void;
  onOpenSearch?: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onToggleTheme?: () => void;
  onOpenFAQ?: () => void;
  onOpenSupport?: () => void;
}

export const WOWAssistant: React.FC<WOWAssistantProps> = ({
  isOpen = false,
  onClose,
  isDark = false,
  userName,
  onOpenReader,
  onOpenImmersive,
  onJumpToSection,
  onOpenCertificate,
  onOpenExam,
  onOpenAdmin,
  onOpenSettings,
  onOpenSearch,
  onOpenAuth,
  onSignOut,
  onToggleTheme,
  onOpenFAQ,
  onOpenSupport
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [showKeyboardInput, setShowKeyboardInput] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [greetingText, setGreetingText] = useState<string>('How may I help you?');
  const [responseNotice, setResponseNotice] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const isExecutingRef = useRef<boolean>(false);

  const getTimeGreeting = (name?: string) => {
    const hour = new Date().getHours();
    let prefix = 'Good morning';
    if (hour >= 12 && hour < 17) {
      prefix = 'Good afternoon';
    } else if (hour >= 17 || hour < 4) {
      prefix = 'Good evening';
    }
    const cleanName = name && name.trim() ? name.trim().split(' ')[0] : 'Reader';
    return `${prefix}, ${cleanName}! How may I help you?`;
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const speakText = (text: string, onDone?: () => void) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) {
      onDone?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Retain utterance in ref to prevent V8 garbage collection mid-speech
      activeUtteranceRef.current = utterance;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick high-quality natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('en-US'))
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => {
        activeUtteranceRef.current = null;
        onDone?.();
      };
      utterance.onerror = (e) => {
        console.warn('[WOWAssistant TTS Warning]:', e);
        activeUtteranceRef.current = null;
        onDone?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[WOWAssistant TTS] Error:', e);
      activeUtteranceRef.current = null;
      onDone?.();
    }
  };

  // When modal is opened, play full greeting, then start listening cleanly
  useEffect(() => {
    if (isOpen) {
      isExecutingRef.current = false;
      const greeting = getTimeGreeting(userName);
      setGreetingText(greeting);
      setTranscript('');
      setResponseNotice(null);
      setActionNotice(null);
      setShowKeyboardInput(false);
      
      // Speak personalized greeting and start listening only after greeting finishes
      speakText(greeting, () => {
        startListening();
      });
    } else {
      stopListening();
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      activeUtteranceRef.current = null;
    }
  }, [isOpen, userName]);

  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setResponseNotice('Voice recognition is not supported in this browser. Please use keyboard.');
      setShowKeyboardInput(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        latestTranscriptRef.current = '';
        setResponseNotice(null);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }
        const text = fullTranscript.trim();
        if (text) {
          setTranscript(text);
          latestTranscriptRef.current = text;
        }

        if (event.results[event.results.length - 1].isFinal) {
          executeCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setResponseNotice('Microphone access denied. Tap keyboard icon to type.');
        } else if (event.error !== 'aborted') {
          setResponseNotice('Tap microphone to speak instruction.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (!isExecutingRef.current && latestTranscriptRef.current && latestTranscriptRef.current.trim()) {
          executeCommand(latestTranscriptRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[Speech Recognition] Error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  const closeAssistantWithDelay = (delayMs = 1000) => {
    setTimeout(() => {
      stopListening();
      onClose?.();
    }, delayMs);
  };

  const executeCommand = (cmd: string) => {
    if (!cmd || !cmd.trim() || isExecutingRef.current) return;
    const raw = cmd.toLowerCase().trim();
    isExecutingRef.current = true;
    setIsProcessing(true);
    let reply = `Executing command: "${cmd}"`;
    let action = '';
    let shouldAutoClose = false;

    // 1. Core Navigation & App Action Commands with Robust Multi-word Matching
    if (/\b(read|reader|reading|book|novel|manuscript|chapter|kindle|open reader|start reading)\b/i.test(raw)) {
      reply = 'Opening Reader...';
      action = 'Opening Reader';
      shouldAutoClose = true;
      onOpenReader?.();
    } else if (/\b(immersive|fullscreen|full screen|focus|sanctuary reader)\b/i.test(raw)) {
      reply = 'Opening Immersive Sanctuary Reader...';
      action = 'Opening Immersive Reader';
      shouldAutoClose = true;
      onOpenImmersive?.();
    } else if (/\b(music|sound|song|audio|soundtrack|tune|ambient|play|pause|track)\b/i.test(raw)) {
      audioSynth.togglePlay();
      reply = 'Toggling background music.';
      action = 'Toggling Music';
      shouldAutoClose = true;
    } else if (/\b(author|writer|creator|pratyay|saha|who wrote|biography|about author)\b/i.test(raw)) {
      reply = 'Navigating to Author Desk...';
      action = 'Navigating to Author Desk';
      shouldAutoClose = true;
      onJumpToSection?.('author-section');
    } else if (/\b(cert|certificate|degree|diploma|award|claim|mastery|download certificate|my certificate)\b/i.test(raw)) {
      reply = 'Opening Royal Certificate portal...';
      action = 'Opening Certificate Portal';
      shouldAutoClose = true;
      onOpenCertificate?.();
    } else if (/\b(exam|quiz|test|assessment|chapter exam|questions)\b/i.test(raw)) {
      reply = 'Opening Chapter Exam Assessment...';
      action = 'Opening Chapter Exam';
      shouldAutoClose = true;
      onOpenExam?.();
    } else if (/\b(admin|dashboard|portal|console|management)\b/i.test(raw)) {
      reply = 'Opening Administrative Portal...';
      action = 'Opening Admin Portal';
      shouldAutoClose = true;
      onOpenAdmin?.();
    } else if (/\b(search|find|lookup|look up|concordance|explore)\b/i.test(raw)) {
      reply = 'Opening Concordance Search...';
      action = 'Opening Search';
      shouldAutoClose = true;
      onOpenSearch?.();
    } else if (/\b(setting|settings|preference|preferences|config|configuration)\b/i.test(raw)) {
      reply = 'Opening Reader Settings...';
      action = 'Opening Settings';
      shouldAutoClose = true;
      onOpenSettings?.();
    } else if (/\b(dark|light|theme|night|day|mode|toggle theme|switch theme)\b/i.test(raw)) {
      onToggleTheme?.();
      reply = 'Switching display color theme.';
      action = 'Switching Theme';
      shouldAutoClose = true;
    } else if (/\b(faq|question|questions|help|guide|how to)\b/i.test(raw)) {
      reply = 'Opening Sanctuary FAQ...';
      action = 'Opening FAQ';
      shouldAutoClose = true;
      onOpenFAQ?.();
    } else if (/\b(support|contact|reach out|issue|feedback|report)\b/i.test(raw)) {
      reply = 'Opening Reader Support Portal...';
      action = 'Opening Support';
      shouldAutoClose = true;
      onOpenSupport?.();
    } else if (/\b(sign in|signin|log in|login|account|profile)\b/i.test(raw)) {
      reply = 'Opening Reader Sign-In portal...';
      action = 'Opening Sign-In';
      shouldAutoClose = true;
      onOpenAuth?.();
    } else if (/\b(sign out|signout|log out|logout)\b/i.test(raw)) {
      reply = 'Signing out from your session.';
      action = 'Signing Out';
      shouldAutoClose = true;
      onSignOut?.();
    } else if (/\b(close|exit|dismiss|cancel|bye|goodbye|stop|quit|nevermind|never mind)\b/i.test(raw)) {
      reply = 'Closing assistant.';
      action = 'Closing Assistant';
      shouldAutoClose = true;
    } 
    // 2. Intelligent Conversational Q&A Responses
    else if (/\b(what is|synopsis|story|plot|tell me about|about book)\b/i.test(raw)) {
      reply = '"Wilting of Words" is an evocative psychological novel by Pratyay Saha, set across Bengal, exploring silence, memory, and profound identity.';
      action = 'Synopsis Provided';
    } else if (/\b(aratrika|subhash|character|characters|protagonist)\b/i.test(raw)) {
      reply = 'The novel centers on Aratrika—a solitary narrator navigating unspoken truths and the echoes of her companion Subhash.';
      action = 'Character Info Provided';
    } else if (/\b(how many pages|pages|length|how long)\b/i.test(raw)) {
      reply = 'The complete unedited manuscript contains 219 sepia ink pages with an authentic Bengali aesthetic.';
      action = 'Manuscript Info Provided';
    } else {
      reply = "Sorry, I couldn't understand what you said. Please try again.";
      action = 'Query Unrecognized';
      isExecutingRef.current = false;
    }

    setResponseNotice(reply);
    setActionNotice(action);
    setIsProcessing(false);
    speakText(reply);

    if (shouldAutoClose) {
      closeAssistantWithDelay(1100);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    executeCommand(inputText);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="w-full sm:w-[440px] max-w-lg bg-[#FAF8F5] text-stone-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col p-6 sm:p-8 animate-slide-up relative"
      >
        {/* Top Bar with Back Arrow on Left */}
        <div className="flex items-center justify-between w-full mb-8">
          <button
            type="button"
            onClick={() => {
              stopListening();
              onClose?.();
            }}
            className="p-2 -ml-2 rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6 text-stone-700" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="p-2 rounded-full text-stone-500 hover:text-stone-800 transition-colors"
              title={ttsEnabled ? 'Mute Speech Feedback' : 'Enable Speech Feedback'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-stone-700" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>
            <button
              type="button"
              onClick={() => {
                stopListening();
                onClose?.();
              }}
              className="p-2 -mr-2 rounded-full text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </div>

        {/* Center Prompt Title matching Google Voice UI */}
        <div className="text-center min-h-[50px] flex flex-col items-center justify-center mb-8 px-4">
          <h2 className="text-lg sm:text-2xl font-normal text-stone-800 tracking-tight transition-all">
            {transcript || greetingText || (isListening ? 'Listening...' : 'Try saying something')}
          </h2>
          {responseNotice && (
            <p className="text-xs text-amber-900 mt-2 font-medium bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-full animate-fade-in">
              {responseNotice}
            </p>
          )}
          {actionNotice && (
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{actionNotice}</span>
            </span>
          )}
        </div>

        {/* Main Center Microphone Button with Animated Ripple Waves */}
        <div className="flex items-center justify-center my-4 relative">
          {/* Animated Blue Pulse Rings */}
          {isListening && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-blue-400/20 animate-ping pointer-events-none" />
              <div className="absolute w-28 h-28 rounded-full bg-blue-500/30 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer relative z-10 ${
              isListening
                ? 'bg-[#1a73e8] text-white shadow-blue-500/40 ring-4 ring-blue-300'
                : 'bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-blue-500/25'
            }`}
            title={isListening ? 'Stop Listening' : 'Tap to Speak'}
          >
            {isListening ? (
              <Mic className="w-9 h-9 sm:w-11 sm:h-11 text-white animate-bounce" />
            ) : (
              <Mic className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
            )}
          </button>
        </div>

        {/* Action Controls Row (Settings on Left, Keyboard on Right) */}
        <div className="flex items-center justify-between w-full mt-10 mb-6 px-4">
          <button
            type="button"
            onClick={() => onOpenSettings?.()}
            className="p-3 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 transition-all cursor-pointer"
            title="Settings"
          >
            <Settings className="w-6 h-6 text-stone-600" />
          </button>

          <button
            type="button"
            onClick={() => setShowKeyboardInput(!showKeyboardInput)}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              showKeyboardInput
                ? 'bg-stone-200 text-stone-900'
                : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
            title="Keyboard Input"
          >
            <Keyboard className="w-6 h-6 text-stone-600" />
          </button>
        </div>

        {/* Keyboard Input Field (Toggleable) */}
        {showKeyboardInput && (
          <form onSubmit={handleFormSubmit} className="mb-6 flex items-center gap-2 animate-slide-up">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type command (e.g. Open reader)..."
              className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-500 shadow-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-40 text-white cursor-pointer shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
