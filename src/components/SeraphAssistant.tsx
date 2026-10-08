import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Award, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw,
  MessageSquare,
  HelpCircle,
  BrainCircuit
} from 'lucide-react';
import { activeTimeTracker } from '../services/activeTimeTracker';

interface SeraphAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onOpenCertificate: () => void;
}

interface Message {
  id: string;
  sender: 'seraph' | 'user';
  text: string;
  timestamp: string;
}

export const SeraphAssistant: React.FC<SeraphAssistantProps> = ({
  isOpen,
  onClose,
  isDark,
  onOpenCertificate
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'seraph',
      text: `Hello! I am Seraph, your literary AI companion for "Wilting of Words". You can ask me anything about the characters, plot, themes, historical context of Bengal, writing craft, or your Certificate progress.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    "Tell me about Aratrika's character",
    "What is the significance of the title?",
    "Explain the theme of silence",
    "How do I qualify for the Certificate?",
    "Tell me about author Pratyay Saha",
    "What inspired the setting of Chakdaha?"
  ];

  const handleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'seraph',
        text: `Chat reset. What would you like to explore next about "Wilting of Words"?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!forcedText) setInputText('');
    setIsLoading(true);

    // Fast-path for Certificate Status
    const lower = textToSend.toLowerCase();
    if (lower.includes('certificate') || lower.includes('status') || lower.includes('eligibility')) {
      setTimeout(() => {
        const timeFormatted = activeTimeTracker.getFormattedTime();
        const qualified = activeTimeTracker.isQualified();
        const replyText = qualified
          ? `🎉 Magnificent! You have completed over 30 minutes of reading (${timeFormatted}) and are fully qualified for the official Certificate of Literary Mastery signed by author Pratyay Saha! Click below to claim it.`
          : `⏳ Your E-Reader active reading time is currently ${timeFormatted}. To qualify for the official Certificate signed by Pratyay Saha, you need at least 30 minutes of authentic reading inside the E-Reader. Keep turning pages in the manuscript!`;

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'seraph',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      const response = await fetch('/api/seraph/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
        })
      });

      const data = await response.json();
      let replyText = data.text || data.reply || '';

      if (!replyText) {
        const q = textToSend.toLowerCase();
        if (q.includes('aratrika')) {
          replyText = `Aratrika is the courageous protagonist of Wilting of Words. Her narrative explores the emotional sanctuary between silence and expression as she navigates her personal aspirations and familial expectations in Bengal.`;
        } else if (q.includes('theme') || q.includes('dreams') || q.includes('identity')) {
          replyText = `The central themes of Wilting of Words revolve around the Sanctuary of the Silenced Voice, Generational Memory, Monsoon Riverbanks, and the courage to reclaim one's authentic identity against unspoken constraints.`;
        } else if (q.includes('pratyay') || q.includes('author') || q.includes('technodef')) {
          replyText = `Pratyay Saha is an insightful novelist whose evocative prose bridges traditional Indian heritage and contemporary literary aesthetics. Wilting of Words is published under Technodef Press.`;
        } else {
          replyText = `In Wilting of Words, every chapter reflects the delicate balance between unspoken emotions and eternal ink. Feel free to explore the manuscript reader or check your active screen reading progress for the author-signed Certificate.`;
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'seraph',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'seraph',
          text: `Wilting of Words is a poignant novel by Pratyay Saha exploring identity, memory, and silence. You can ask me any question or check your Certificate progress!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      
      {/* 
        MODERN AI DIALOG MODAL
        Clean SaaS interface with dark slate #0f172a, purple #6366f1 accent, smooth borders, and modern chat layout 
      */}
      <div 
        className="relative w-full max-w-lg h-[86vh] max-h-[720px] rounded-3xl border border-slate-800 bg-[#0f172a] shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Modern Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0b1120]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#6366f1] text-white flex items-center justify-center shadow-md shadow-indigo-600/30 font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-black text-white tracking-tight">
                  Seraph AI
                </span>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  Gemini Powered
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Ask anything about the novel, characters &amp; author
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              title="Reset Conversation"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500 hover:text-white text-slate-400 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0a0f1d]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user' 
                  ? 'bg-slate-700 text-white' 
                  : 'bg-[#6366f1] text-white shadow-sm'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#6366f1] text-white rounded-tr-none shadow-md shadow-indigo-600/20 font-sans'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm font-sans'
              }`}>
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400">
                  <span>{msg.timestamp}</span>
                  
                  {msg.sender === 'seraph' && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        title="Read aloud"
                        className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 font-sans text-[11px]"
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                        <span>{speakingId === msg.id ? "Stop" : "Speak"}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy message"
                        className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 font-sans text-[11px]"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-sans font-medium p-2 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-[#6366f1]" />
              <span>Seraph is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0b1120] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-sans font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Modern Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-[#0f172a] flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Seraph anything about the novel, plot, themes..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#6366f1] placeholder-slate-500 font-sans"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-[#6366f1] hover:bg-indigo-500 text-white flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-indigo-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Quick Check Bottom Bar */}
        <div className="px-4 py-2.5 bg-[#0b1120] border-t border-slate-800/80 flex items-center justify-between text-xs font-sans">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>30-Min Certificate Eligibility</span>
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenCertificate();
            }}
            className="text-[#6366f1] hover:text-indigo-400 font-bold transition-colors cursor-pointer"
          >
            Check Progress &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
