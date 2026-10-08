import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShieldAlert, 
  Mail, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import { AuthUser } from './AuthPortal';
import { activeTimeTracker } from '../services/activeTimeTracker';
import { locationVerificationService } from '../services/locationVerificationService';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  user: AuthUser | null;
  onAccountDeleted: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  isDark,
  user,
  onAccountDeleted
}) => {
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [otpSentNotification, setOtpSentNotification] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleRequestOtp = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auth/send-delete-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name || 'Reader'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch account deletion OTP email.');
      }

      // Store server code
      if (data.code) {
        setGeneratedOtp(data.code);
      }

      setIsProcessing(false);
      setStep('otp');
      setOtpSentNotification(`Verification 6-digit OTP dispatched to your email address (${user.email}). Please check your inbox.`);
    } catch (err: any) {
      console.warn('[Delete OTP Error]:', err);
      setIsProcessing(false);
      setErrorMsg(err.message || 'Failed to send account deletion OTP email. Please try again.');
    }
  };

  const handleVerifyAndDelete = async () => {
    setErrorMsg(null);
    const cleanEntered = enteredOtp.trim();
    
    if (!cleanEntered || cleanEntered.length < 5) {
      setErrorMsg('Please enter the exact 6-digit OTP code dispatched to your email address.');
      return;
    }

    if (generatedOtp && cleanEntered !== generatedOtp.trim()) {
      setErrorMsg('Invalid verification OTP code. Please enter the exact 6-digit code sent to your email.');
      return;
    }

    setIsProcessing(true);

    try {
      // Purge account from server and Firestore
      await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email
        })
      });
    } catch (e) {
      console.warn('Backend user delete warning:', e);
    }

    try {
      // Permanently erase all local reader artifacts
      const emailKey = user.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      localStorage.removeItem('wilting_auth_user');
      localStorage.removeItem(`wilting_active_reading_seconds_${emailKey}`);
      localStorage.removeItem(`wow_face_registered_${user.email.toLowerCase().trim()}`);
      localStorage.removeItem('wilting_reader_name');
      localStorage.removeItem('wilting_reader_location');
      localStorage.removeItem('wilting_of_words_bookmarks');
      localStorage.removeItem('wilting_of_words_highlights_v2');
      localStorage.removeItem('wilting_of_words_last_page');
      localStorage.removeItem('wilting_of_words_visited_pages');
      
      activeTimeTracker.resetTime();
      activeTimeTracker.setUser(null);
    } catch (e) {
      console.warn('Error purging user storage:', e);
    }

    setIsProcessing(false);
    onAccountDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-md rounded-3xl border-2 shadow-2xl overflow-hidden my-auto flex flex-col transition-all ${
          isDark 
            ? 'bg-[#18110C] border-red-500/60 text-[#FAF5EE]' 
            : 'bg-[#FCFAF5] border-red-600/50 text-[#2D241E]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-500/30 bg-gradient-to-r from-red-900 via-rose-900 to-red-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-200" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-100">
                Permanent Account Deletion
              </h3>
              <p className="text-[10px] font-serif italic text-red-200/80">
                Email OTP Verification Protocol
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {step === 'confirm' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-serif leading-relaxed text-red-900 dark:text-red-200">
                <div className="flex items-center gap-1.5 font-cinzel font-bold uppercase text-[11px] mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Irreversible Sanctuary Action</span>
                </div>
                Deleting your account will permanently scrub your reading chronometer progress, certificate eligibility, bookmarks, margin notes, and Cloud sync profile for:
                <strong className="block mt-1 font-sans text-stone-900 dark:text-stone-100">{user.email}</strong>
              </div>

              <p className="text-xs font-serif text-stone-600 dark:text-stone-400 leading-relaxed">
                To guarantee security and avoid accidental erasure, an authentication <strong>6-digit OTP code</strong> will be dispatched to your email address before finalizing deletion.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Dispatch Email OTP</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-cinzel text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {otpSentNotification && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-[#D4AF37] shrink-0" />
                  <div>
                    <span className="font-cinzel font-bold block uppercase text-[10px]">Email Dispatch:</span>
                    <span className="font-serif">{otpSentNotification}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-cinzel font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                  Enter 6-Digit Email OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl sm:text-2xl font-bold py-3 rounded-xl bg-white dark:bg-black/30 border border-red-400 focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900 dark:text-stone-100"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleVerifyAndDelete}
                  disabled={isProcessing || enteredOtp.length !== 6}
                  className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying &amp; Erasing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Confirm &amp; Delete Account</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  className="px-3.5 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-cinzel hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
                  title="Resend or go back"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
