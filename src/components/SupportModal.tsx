import React, { useState } from 'react';
import { 
  X, 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  Mail, 
  MessageSquare, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AuthUser } from './AuthPortal';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  user: AuthUser | null;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  isDark,
  user
}) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState<'reading' | 'certificate' | 'technical' | 'editorial'>('reading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; category: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `WOW-SUP-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedTicket({ id: ticketId, category });
      setIsSubmitting(false);
      setMessage('');
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#B93826', '#8B2213']
        });
      } catch {}
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl border-2 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] transition-all ${
          isDark 
            ? 'bg-[#18110C] border-[#D4AF37] text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-[#D4AF37] text-[#2D241E]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D4AF37]/40 bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-100">
                Reader Support &amp; Help Desk
              </h3>
              <p className="text-[10px] font-serif italic text-amber-200/80">
                Technodef Press Literary Concierge
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {submittedTicket ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-cinzel text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-200">
                Inquiry Successfully Logged!
              </h4>
              <p className="text-xs sm:text-sm font-serif text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                Your support ticket <strong className="font-mono text-amber-700 dark:text-amber-300">[{submittedTicket.id}]</strong> has been dispatched to author Pratyay Saha &amp; the Technodef Press concierge. A response will be delivered to <strong className="font-sans">{email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="mt-2 px-5 py-2 rounded-xl bg-[#8B2213] text-white font-cinzel text-xs font-bold uppercase tracking-wider hover:bg-[#B93826] transition-all cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-[#D4AF37]/35 text-xs font-serif leading-relaxed text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-1.5 font-cinzel font-bold text-[#8B2213] dark:text-[#FFE58F] uppercase text-[11px] mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Direct Author &amp; Press Assistance</span>
                </div>
                Encountering an issue claiming your 30-minute Royal Certificate, navigating the 219 pages of the manuscript, or have a literary inquiry? Send us a message and our team will assist you promptly.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-cinzel font-bold uppercase text-stone-600 dark:text-stone-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pratyay Saha"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-black/30 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-cinzel font-bold uppercase text-stone-600 dark:text-stone-400 mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. reader@technodef.com"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-black/30 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel font-bold uppercase text-stone-600 dark:text-stone-400 mb-1">
                  Inquiry Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-black/30 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="reading">E-Reader &amp; Manuscript Navigation</option>
                  <option value="certificate">30-Minute Royal Certificate Inquiry</option>
                  <option value="technical">Technical Bug or Audio Synthesis</option>
                  <option value="editorial">Editorial &amp; Author Query</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel font-bold uppercase text-stone-600 dark:text-stone-400 mb-1">
                  Describe Your Query *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your question, feedback, or technical assistance request..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-black/30 border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white font-cinzel font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Logging Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Support Ticket</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:technodef.admin@gmail.com?subject=Technodef%20Support%20%26%20Enquiry%20-%20${encodeURIComponent(category)}&body=Name%3A%20${encodeURIComponent(name)}%0AEmail%3A%20${encodeURIComponent(email)}%0ACategory%3A%20${encodeURIComponent(category)}%0A%0AQuery%3A%0A${encodeURIComponent(message || 'My inquiry details...')}`}
                  className="px-4 py-3 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-sans font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-slate-700 text-center"
                  title="Open mail directly in your default email application"
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Direct Email</span>
                </a>
              </div>
            </form>
          )}

          {/* Direct Admin Contact Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-indigo-500/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-indigo-300">
                  Direct Admin Maildesk
                </div>
                <div className="text-xs font-mono font-bold text-white truncate">
                  technodef.admin@gmail.com
                </div>
              </div>
            </div>
            <a
              href="mailto:technodef.admin@gmail.com?subject=Direct%20Inquiry%20to%20Technodef%20Admin"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-[11px] uppercase tracking-wider transition-all shrink-0 shadow-sm"
            >
              Compose Mail
            </a>
          </div>

          {/* Quick Troubleshooting Guide */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
            <h5 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#8B2213] dark:text-[#FFE58F] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Quick Instant Solutions</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-serif text-stone-600 dark:text-stone-400">
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                <strong className="block text-stone-800 dark:text-stone-200 font-cinzel">30-Min Certificate:</strong>
                Timer advances only while actively reading inside the E-Reader.
              </div>
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
                <strong className="block text-stone-800 dark:text-stone-200 font-cinzel">Direct Email:</strong>
                Reach us directly at <span className="font-sans text-amber-700 dark:text-amber-300">technodef.admin@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
