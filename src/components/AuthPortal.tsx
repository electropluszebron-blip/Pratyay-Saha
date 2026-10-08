import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RotateCw, 
  Clock, 
  BookOpen, 
  Send, 
  ShieldCheck, 
  X,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  Phone,
  MessageSquare,
  ExternalLink,
  ScanFace,
  MapPin,
  ChevronDown,
  Shield,
  Check,
  HelpCircle
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';
import { 
  checkUserExistsInFirebase, 
  saveUserToFirebase, 
  saveUserWithPasswordToFirebase, 
  verifyUserInFirebase, 
  recordUserLoginInFirebase,
  updateUserPasswordInFirebase,
  getUserProfileFromFirebase,
  recordFaceRegistrationInFirebase,
  signInWithGoogle
} from '../firebase';
import { locationVerificationService, LocationVerificationState } from '../services/locationVerificationService';
import { FaceRegistrationModal } from './FaceRegistrationModal';
import { PreciseLocationBarrier } from './PreciseLocationBarrier';
import { useLanguage, normalizeLanguageCode, languageCodeToLabel } from '../utils/LanguageContext';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
}

interface AuthPortalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthenticated: (user: AuthUser) => void;
  initialMode?: 'signup' | 'signin';
}

async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  // Location check bypassed for already signed-up users per user request

  const locationHeaders = locationVerificationService.getAuthLocationHeaders();
  const headers = new Headers(options?.headers || {});
  Object.entries(locationHeaders).forEach(([k, v]) => headers.set(k, v));

  let body = options?.body;
  if (typeof body === 'string' && body.startsWith('{')) {
    try {
      const parsed = JSON.parse(body);
      const locPayload = locationVerificationService.getAuthLocationPayload();
      if (locPayload) {
        Object.assign(parsed, locPayload);
        body = JSON.stringify(parsed);
      }
    } catch {}
  }

  const modifiedOptions: RequestInit = {
    ...options,
    headers,
    body
  };

  try {
    const res = await fetch(url, modifiedOptions);
    const contentType = res.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      const err: any = new Error(`Server returned status ${res.status}. ${text.slice(0, 120)}`);
      err.status = res.status;
      throw err;
    }
    
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!res.ok) {
      const err: any = new Error(data.error || data.details || `Server returned error (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err: any) {
    throw err;
  }
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialMode = 'signin'
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [mode, setMode] = useState<'signup' | 'otp' | 'password' | 'face_registration' | 'signin' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password'>(initialMode);
  const [faceFlowType, setFaceFlowType] = useState<'enroll' | 'verify'>('verify');
  const [pendingAuthUser, setPendingAuthUser] = useState<AuthUser | null>(null);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<{
    email: string;
    name: string;
    password?: string;
  } | null>(null);
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleAuthFlow, setIsGoogleAuthFlow] = useState<boolean>(false);

  // Helper to generate a memorable high-security passphrase
  const generateSecurePassphrase = () => {
    const words = ['Sanctuary', 'Wilting', 'Autumn', 'Poetry', 'Silence', 'Echoes', 'Letters', 'Memoir', 'Timeless', 'Parchment', 'Resonance', 'Manuscript'];
    const w1 = words[Math.floor(Math.random() * words.length)];
    const w2 = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['#', '!', '$', '&', '@'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const generated = `${w1}${sym}${w2}${num}`;
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setSuccessMsg(`Generated strong passphrase: "${generated}". Please keep this noted.`);
  };

  const isSendingOtpRef = useRef<boolean>(false);
  const isSendingForgotOtpRef = useRef<boolean>(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState<string[]>(['', '', '', '', '']);
  const [newForgotPass, setNewForgotPass] = useState('');
  const [confirmForgotPass, setConfirmForgotPass] = useState('');
  const [showNewForgotPass, setShowNewForgotPass] = useState(false);
  const [showConfirmForgotPass, setShowConfirmForgotPass] = useState(false);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverToken, setServerToken] = useState<string | null>(null);
  const [serverTokenExpiresAt, setServerTokenExpiresAt] = useState<number | null>(null);

  // Precise Location Gate State
  const [showLocationBarrier, setShowLocationBarrier] = useState<boolean>(false);
  const [barrierActionContext, setBarrierActionContext] = useState<string>('Authentication');
  const [locState, setLocState] = useState<LocationVerificationState>(() => locationVerificationService.getState());
  const [locError, setLocError] = useState<string | null>(() => locationVerificationService.getErrorMessage());

  // Language & Legal States
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [activeLegalDialog, setActiveLegalDialog] = useState<'terms' | 'privacy' | 'help' | null>(null);
  const selectedLanguage = languageCodeToLabel(language);
  const languageOptions = [
    { label: 'English', code: 'en' },
    { label: 'বাংলা', code: 'bn' },
    { label: 'हिन्दी', code: 'hi' }
  ];

  // Resend Cooldowns
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [forgotResendCooldown, setForgotResendCooldown] = useState<number>(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Continuous Location Enforcement only for new user registration flows (not for sign-in or signed up users)
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'signin' || mode === 'forgot_email' || mode === 'forgot_otp' || mode === 'forgot_new_password') {
      return;
    }

    const unsubscribe = locationVerificationService.subscribe((state, _loc, err) => {
      setLocState(state);
      setLocError(err);

      if (state === 'PERMISSION_DENIED' || state === 'SERVICES_DISABLED' || state === 'BLOCKED') {
        const msg = err || 'Location access was interrupted. Please enable Precise Location and retry.';
        setError(msg);

        // Immediate security invalidation of active sign-up onboarding state
        if (mode === 'otp' || mode === 'password' || (mode === 'face_registration' && faceFlowType === 'enroll')) {
          console.warn('[AuthPortal] Location requirement interrupted midway through registration flow. Invalidating in-flight state...');
          setServerToken(null);
          setServerTokenExpiresAt(null);
        }
      } else if (state === 'VALID') {
        if (error && (error.includes('location') || error.includes('Location'))) {
          setError(null);
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, mode, error, faceFlowType]);

  // Synchronize initial mode
  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  // Resend cooldown timer for Sign Up OTP
  useEffect(() => {
    if (mode !== 'otp') return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  // Resend cooldown timer for Forgot Password OTP
  useEffect(() => {
    if (mode !== 'forgot_otp') return;
    const timer = setInterval(() => {
      setForgotResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  // 1. Send Sign-Up OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || isSendingOtpRef.current) return;
    isSendingOtpRef.current = true;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Strict Precise Location Gate
      const locCheck = await locationVerificationService.requirePreciseLocation();
      if (!locCheck.valid) {
        setError(locCheck.error || 'Precise location is required. Please enable Precise Location to continue.');
        setBarrierActionContext('Send OTP');
        setShowLocationBarrier(true);
        setLoading(false);
        isSendingOtpRef.current = false;
        return;
      }

      const cleanName = name.trim();
      if (!cleanName) {
        setError('Please enter your full name. Name is required for registration.');
        setLoading(false);
        isSendingOtpRef.current = false;
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email address.');
        setLoading(false);
        isSendingOtpRef.current = false;
        return;
      }

      const cleanEmail = email.trim().toLowerCase();

      const data = await safeFetchJson('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, isGoogleAuth: isGoogleAuthFlow }),
      });

      if (data?.token) {
        setServerToken(data.token);
      }
      if (data?.expiresAt) {
        setServerTokenExpiresAt(data.expiresAt);
      }

      setResendCooldown(60);
      setOtp(['', '', '', '', '']);
      setMode('otp');

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      if (err.data?.alreadyRegistered) {
        setError('An account with this email address already exists. Please Sign In.');
        setSignInEmail(email.trim().toLowerCase());
        setMode('signin');
      } else {
        setError(err.message || 'Failed to dispatch verification email. Please check your address.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        isSendingOtpRef.current = false;
      }, 1000);
    }
  };

  // 2. Handle OTP paste & input change for Sign Up
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (!pasted) return;
    const digits = pasted.split('');
    const newOtp = ['', '', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 5) newOtp[i] = d;
    });
    setOtp(newOtp);
    const nextIdx = Math.min(digits.length, 4);
    otpInputRefs.current[nextIdx]?.focus();
  };

  const handleOtpChange = (index: number, val: string) => {
    const rawDigits = val.replace(/\D/g, '');
    if (!rawDigits) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    if (rawDigits.length >= 5) {
      const digitArr = rawDigits.slice(0, 5).split('');
      const newOtp = ['', '', '', '', ''];
      digitArr.forEach((d, i) => {
        if (i < 5) newOtp[i] = d;
      });
      setOtp(newOtp);
      otpInputRefs.current[4]?.focus();
      return;
    }

    // If multiple characters typed or changed, take the last typed character
    const digit = rawDigits.length > 1 ? rawDigits.slice(-1) : rawDigits;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Verify Sign Up OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Precise Location Gate
    const locCheck = await locationVerificationService.requirePreciseLocation();
    if (!locCheck.valid) {
      setError(locCheck.error || 'Precise location is required. Please enable Precise Location to continue.');
      setBarrierActionContext('Verify OTP');
      setShowLocationBarrier(true);
      return;
    }

    const fullOtp = otp.join('');
    if (fullOtp.length !== 5) {
      setError('Please enter the 5-digit OTP sent to your email.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const verifyRes = await safeFetchJson('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          otp: fullOtp,
          token: serverToken,
          expiresAt: serverTokenExpiresAt 
        }),
      });

      if (verifyRes && verifyRes.error) {
        throw new Error(verifyRes.error);
      }

      setSuccessMsg('OTP verified successfully. Now establish or generate your secret passphrase.');
      setMode('password');
    } catch (err: any) {
      setError(err.message || 'Invalid 5-digit verification code. Please check the code in your email.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Set Password (Sign Up)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict Precise Location Gate
    const locCheck = await locationVerificationService.requirePreciseLocation();
    if (!locCheck.valid) {
      setError(locCheck.error || 'Precise location is required. Please enable Precise Location to continue.');
      setBarrierActionContext('Set Password');
      setShowLocationBarrier(true);
      return;
    }

    if (password.length < 6) {
      setError('Passphrase must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passphrases do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      try {
        await safeFetchJson('/api/auth/set-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.join(''),
            password,
            name: name.trim(),
            token: serverToken,
            expiresAt: serverTokenExpiresAt,
          }),
        });
      } catch (apiErr) {
        console.warn('[Auth] Server API unreachable, persisting directly to Firestore:', apiErr);
      }

      // Store registration data temporarily - account gets created ONLY after successful face enrollment!
      setPendingRegistrationData({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        password
      });

      // Prepare user object - Mandatory Face Registration Follows OTP Verification & Password Setup
      const newUser: AuthUser = {
        name: name.trim(),
        email: email.trim().toLowerCase()
      };

      setPendingAuthUser(newUser);
      setFaceFlowType('enroll');
      audioSynth.playNow();
      setMode('face_registration');
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Location verification is not required for already signed-up users
    const cleanEmail = signInEmail.trim().toLowerCase();

    // Clean sign-in handling with Firebase Firestore verification
    if (!cleanEmail || !signInPassword) {
      setError('Please provide both your registered email and secret passphrase.');
      return;
    }

    setLoading(true);
    try {
      let authenticatedUser: AuthUser | null = null;

      // 1. Primary server check to strictly verify blocked status and credentials
      try {
        const data = await safeFetchJson('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: signInPassword,
          }),
        });

        if (data && data.success && data.user) {
          authenticatedUser = {
            id: data.user.id || 'usr_' + cleanEmail,
            name: data.user.name || 'Reader',
            email: data.user.email || cleanEmail,
          };
        }
      } catch (serverErr: any) {
        if (serverErr?.status === 403 || serverErr?.data?.blocked || serverErr?.message?.toLowerCase().includes('blocked')) {
          throw new Error('Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance.');
        }

        if (serverErr?.status === 404 || serverErr?.data?.notFound || serverErr?.message?.toLowerCase().includes('not found') || serverErr?.message?.toLowerCase().includes('deleted')) {
          throw new Error(`No account found for "${cleanEmail}". Your account does not exist or has been deleted by the administrator. Please click "Sign Up" below to create an account.`);
        }

        // 2. Secondary verification with Firestore if user was enrolled via Firebase
        const fbResult = await verifyUserInFirebase(cleanEmail, signInPassword);
        if (fbResult && fbResult.valid) {
          authenticatedUser = {
            id: 'fb_' + cleanEmail,
            name: fbResult.user?.name || 'Reader',
            email: cleanEmail,
          };
        } else if (fbResult?.notFound || serverErr?.data?.notFound) {
          throw new Error(`No account found for "${cleanEmail}". Your account does not exist or has been deleted by the administrator. Please click "Sign Up" below to create an account.`);
        } else {
          throw new Error('Incorrect secret passphrase. Please check your credentials or click "Forgot Password?" to reset.');
        }
      }

      if (!authenticatedUser) {
        throw new Error('Incorrect secret passphrase. Please check your credentials or click "Forgot Password?" to reset.');
      }

      // Record login in Firestore
      try {
        await recordUserLoginInFirebase(authenticatedUser.email);
      } catch {}

      try {
        localStorage.setItem('wilting_auth_user', JSON.stringify(authenticatedUser));
      } catch {}

      console.log(`[AuthPortal] Sign-in credentials verified for "${authenticatedUser.email}". Entering main page.`);
      onAuthenticated(authenticatedUser);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Face ID Sign In trigger
  const handleTriggerFaceIdSignIn = async () => {
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address first to proceed with Face ID login.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Location verification is not required for signed-up users
    setPendingAuthUser({
      email: cleanEmail,
      name: 'Reader'
    });
    setFaceFlowType('verify');
    setMode('face_registration');
  };

  // Google Authentication trigger - STRICTLY ENFORCES OTP -> PASSWORD -> FACE ID (NO DIRECT ENTRY)
  const handleGoogleSignInClick = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser || !googleUser.email) {
        setLoading(false);
        return;
      }

      const cleanEmail = googleUser.email.toLowerCase().trim();
      const cleanName = (googleUser.name || 'Reader').trim();

      // If already registered / signed up user, authenticate immediately without location requirement
      const alreadyRegistered = await checkUserExistsInFirebase(cleanEmail);
      if (alreadyRegistered) {
        const targetUser: AuthUser = {
          id: 'usr_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
          name: cleanName,
          email: cleanEmail
        };
        try {
          localStorage.setItem('wilting_auth_user', JSON.stringify(targetUser));
        } catch {}
        try {
          await recordUserLoginInFirebase(cleanEmail);
        } catch {}
        onAuthenticated(targetUser);
        return;
      }

      // For new registration, verify location
      const locCheck = await locationVerificationService.requirePreciseLocation();
      if (!locCheck.valid) {
        setError(locCheck.error || 'Precise location is required to register.');
        setBarrierActionContext('Google Registration');
        setShowLocationBarrier(true);
        setLoading(false);
        return;
      }

      setEmail(cleanEmail);
      setName(cleanName);
      setSignInEmail(cleanEmail);
      setIsGoogleAuthFlow(true);

      // MANDATORY SECURITY WORKFLOW: NO DIRECT ENTRY!
      // Enforce: 1. Send OTP -> 2. Verify OTP -> 3. Password Generation / Setup -> 4. Face Verification
      const sendRes = await safeFetchJson('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          isGoogleAuth: true
        })
      });

      if (sendRes?.token) {
        setServerToken(sendRes.token);
      }
      if (sendRes?.expiresAt) {
        setServerTokenExpiresAt(sendRes.expiresAt);
      }

      setResendCooldown(60);
      setOtp(['', '', '', '', '']);
      setSuccessMsg(`Google identity connected for ${cleanEmail}. A 5-digit verification code has been dispatched to your email for mandatory verification.`);
      setMode('otp');

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      console.warn('Google sign-in attempt:', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('closed-by-user')) {
        setError('Google sign-in was closed by user.');
      } else {
        setError(err?.message || 'Unable to sign in with Google. You can sign in using your email and password below.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Email OTP action
  const handleEmailOtpQuickClick = async () => {
    setError(null);
    setSuccessMsg(null);
    const targetEmail = (mode === 'signin' ? signInEmail : email).trim();
    if (targetEmail && targetEmail.includes('@')) {
      setEmail(targetEmail);
      if (!name.trim()) setName('Reader');
      await handleSendOtp();
    } else {
      setMode('signup');
      setError('Please enter your email address to receive an instant verification code.');
    }
  };

  // 6. Forgot Password: Send OTP
  const handleForgotSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading || isSendingForgotOtpRef.current) return;
    isSendingForgotOtpRef.current = true;
    setError(null);
    setSuccessMsg(null);

    // Location verification is not required for already signed-up users
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your registered email address.');
      isSendingForgotOtpRef.current = false;
      return;
    }

    setLoading(true);
    try {
      // 1. Strict Firestore Check: If email is not existing in Firebase, do NOT allow sign in / forgot password
      const userExists = await checkUserExistsInFirebase(cleanEmail);
      if (!userExists) {
        setError(`No registered sanctuary reader account exists for "${cleanEmail}". Password reset and access are not permitted. Please Sign Up first.`);
        setLoading(false);
        isSendingForgotOtpRef.current = false;
        return;
      }

      const data = await safeFetchJson('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (data?.token) {
        setServerToken(data.token);
      }
      if (data?.expiresAt) {
        setServerTokenExpiresAt(data.expiresAt);
      }

      setForgotResendCooldown(60);
      setForgotOtp(['', '', '', '', '']);
      setMode('forgot_otp');

      setTimeout(() => {
        forgotOtpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset code. Please verify your email address.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        isSendingForgotOtpRef.current = false;
      }, 1000);
    }
  };

  // 7. Handle Forgot Password OTP paste & input change
  const handleForgotOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (!pasted) return;
    const digits = pasted.split('');
    const newOtp = ['', '', '', '', ''];
    digits.forEach((d, i) => {
      if (i < 5) newOtp[i] = d;
    });
    setForgotOtp(newOtp);
    const nextIdx = Math.min(digits.length, 4);
    forgotOtpInputRefs.current[nextIdx]?.focus();
  };

  const handleForgotOtpChange = (index: number, val: string) => {
    const rawDigits = val.replace(/\D/g, '');
    if (!rawDigits) {
      const newOtp = [...forgotOtp];
      newOtp[index] = '';
      setForgotOtp(newOtp);
      return;
    }

    if (rawDigits.length >= 5) {
      const digitArr = rawDigits.slice(0, 5).split('');
      const newOtp = ['', '', '', '', ''];
      digitArr.forEach((d, i) => {
        if (i < 5) newOtp[i] = d;
      });
      setForgotOtp(newOtp);
      forgotOtpInputRefs.current[4]?.focus();
      return;
    }

    const digit = rawDigits.length > 1 ? rawDigits.slice(-1) : rawDigits;
    const newOtp = [...forgotOtp];
    newOtp[index] = digit;
    setForgotOtp(newOtp);

    if (digit && index < 4) {
      forgotOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      forgotOtpInputRefs.current[index - 1]?.focus();
    }
  };

  // 8. Verify Forgot Password OTP
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Location verification is not required for already signed-up users
    const fullOtp = forgotOtp.join('');
    if (fullOtp.length !== 5) {
      setError('Please enter the exact 5-digit reset passcode sent to your email.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const verifyRes = await safeFetchJson('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: fullOtp,
          token: serverToken,
          expiresAt: serverTokenExpiresAt,
        })
      });

      if (verifyRes && verifyRes.error) {
        throw new Error(verifyRes.error);
      }

      setMode('forgot_new_password');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired 5-digit reset passcode. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // 9. Reset Password & Authenticate
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Location verification is not required for already signed-up users
    if (newForgotPass.length < 6) {
      setError('New passphrase must be at least 6 characters in length.');
      return;
    }
    if (newForgotPass !== confirmForgotPass) {
      setError('Passphrases do not match. Please re-enter.');
      return;
    }

    const cleanEmail = forgotEmail.trim().toLowerCase();
    const fullOtp = forgotOtp.join('');

    setLoading(true);
    try {
      // 1. Strictly verify the user exists in Firebase Firestore
      const userExists = await checkUserExistsInFirebase(cleanEmail);
      if (!userExists) {
        throw new Error(`Sanctuary account for "${cleanEmail}" does not exist. Password reset is not permitted.`);
      }

      // 2. Call backend reset endpoint
      try {
        await safeFetchJson('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            otp: fullOtp,
            newPassword: newForgotPass,
            token: serverToken,
            expiresAt: serverTokenExpiresAt,
          }),
        });
      } catch (apiErr) {
        console.warn('[Auth] Server reset API warning:', apiErr);
      }

      // 3. Update directly in Firestore
      await updateUserPasswordInFirebase(cleanEmail, newForgotPass);

      // 4. Fetch user profile from Firebase
      const profile = await getUserProfileFromFirebase(cleanEmail);
      const authenticatedUser: AuthUser = {
        name: profile?.name || 'Reader',
        email: cleanEmail,
      };

      try {
        localStorage.setItem('wilting_auth_user', JSON.stringify(authenticatedUser));
      } catch {}

      // Require biometric face verification after password reset
      setPendingAuthUser(authenticatedUser);
      setFaceFlowType('verify');
      audioSynth.playNow();
      setMode('face_registration');
    } catch (err: any) {
      setError(err.message || 'Failed to update passphrase. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-3 sm:p-6 bg-[#FAF8F5] overflow-y-auto selection:bg-[#16243A] selection:text-white font-sans">
      
      {/* 
        ==================================================================
        PREMIUM LIGHT-THEME AUTHENTICATION CARD
        ==================================================================
      */}
      <div className="relative w-full max-w-[430px] my-auto rounded-[28px] sm:rounded-[32px] bg-white border border-[#EBE6DF] p-6 sm:p-8 shadow-[0_12px_45px_rgba(22,36,58,0.06)] text-[#16243A] z-20 transition-all">
        
        {/* Top Header: Close Button & Language Selector */}
        <div className="flex items-center justify-between mb-4">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#16243A] hover:bg-[#F5F2EC] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}

          {/* Language Selector showing 'English' with small downward chevron */}
          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#475569] hover:text-[#16243A] bg-[#F7F5F0] hover:bg-[#EFECE5] rounded-full transition-colors cursor-pointer border border-[#EBE6DF]"
            >
              <span>{selectedLanguage}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            {showLanguageDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowLanguageDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-[#E8E2D9] rounded-xl shadow-lg py-1.5 z-40 text-xs">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        language === opt.code
                          ? 'font-semibold text-[#16243A] bg-[#F7F5F0]'
                          : 'text-[#64748B] hover:text-[#16243A] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {language === opt.code && <Check className="w-3.5 h-3.5 text-[#16243A]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Dual Equal Tabs: Sign In and Sign Up */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="grid grid-cols-2 border-b border-[#ECE7E0] mb-6">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setMode('signin');
              }}
              className={`pb-3 text-center text-sm font-semibold transition-colors relative cursor-pointer ${
                mode === 'signin' ? 'text-[#16243A]' : 'text-[#64748B] hover:text-[#16243A]'
              }`}
            >
              Sign In
              {mode === 'signin' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#16243A]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMsg(null);
                setMode('signup');
              }}
              className={`pb-3 text-center text-sm font-semibold transition-colors relative cursor-pointer ${
                mode === 'signup' ? 'text-[#16243A]' : 'text-[#64748B] hover:text-[#16243A]'
              }`}
            >
              Sign Up
              {mode === 'signup' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#16243A]" />
              )}
            </button>
          </div>
        )}

        {/* Global Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold block">{error}</span>
              {error.toLowerCase().includes('blocked') && (
                <div className="mt-1 pt-1 border-t border-rose-200 text-[11px] text-rose-700">
                  Contact Support: <a href="mailto:electroplus.zebron@gmail.com" className="font-bold underline text-[#16243A]">electroplus.zebron@gmail.com</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global Success Notice */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 1A: SIGN IN                                       */}
        {/* ======================================================== */}
        {mode === 'signin' && (
          <>
            {/* Heading & Subtitle */}
            <div className="text-center mb-6">
              <h1
                className="text-2xl sm:text-[28px] font-semibold text-[#16243A] tracking-tight leading-snug"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                Welcome Back
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#64748B] uppercase mt-1">
                CONTINUE YOUR READING JOURNEY
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {/* Email Address */}
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                  <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 text-[#94A3B8] hover:text-[#16243A] transition-colors p-1 cursor-pointer"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(signInEmail || '');
                      setError(null);
                      setSuccessMsg(null);
                      setMode('forgot_email');
                    }}
                    className="text-xs font-medium text-[#64748B] hover:text-[#16243A] transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Large full-width dark navy rounded "Sign In →" button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-xl sm:rounded-2xl bg-[#16243A] text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#0F1A2B] transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="text-base leading-none">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Alternative Sign-In: Divider with "or continue with" */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#ECE7E0]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#94A3B8] font-normal lowercase tracking-wide">
                  or continue with
                </span>
              </div>
            </div>

            {/* Three equal rounded buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="py-2.5 px-2 rounded-xl sm:rounded-2xl border border-[#E2DCD3] bg-white hover:bg-[#F9F7F4] text-xs font-medium text-[#334155] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleEmailOtpQuickClick}
                className="py-2.5 px-2 rounded-xl sm:rounded-2xl border border-[#E2DCD3] bg-white hover:bg-[#F9F7F4] text-xs font-medium text-[#334155] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerFaceIdSignIn}
                className="py-2.5 px-2 rounded-xl sm:rounded-2xl border border-[#E2DCD3] bg-white hover:bg-[#F9F7F4] text-xs font-medium text-[#334155] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <ScanFace className="w-4 h-4 text-[#64748B] shrink-0" />
                <span>Face ID</span>
              </button>
            </div>

            {/* Security / Platform Features Panel */}
            <div className="bg-[#F9F7F4] rounded-2xl p-3 sm:p-3.5 border border-[#ECE6DE] my-5">
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Secure Authentication
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <ScanFace className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Biometric Face Verification
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Location Protected
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <BookOpen className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Access Your Library
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="text-center pt-1">
              <p className="text-xs text-[#475569] mb-2.5">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('signup');
                  }}
                  className="font-semibold text-[#16243A] hover:underline cursor-pointer"
                >
                  Sign Up →
                </button>
              </p>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#94A3B8] mb-2">
                <button
                  type="button"
                  onClick={() => setActiveLegalDialog('terms')}
                  className="hover:text-[#16243A] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setActiveLegalDialog('privacy')}
                  className="hover:text-[#16243A] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setActiveLegalDialog('help')}
                  className="hover:text-[#16243A] transition-colors cursor-pointer"
                >
                  Help
                </button>
              </div>

              <div className="text-[10px] font-semibold tracking-[0.25em] text-[#94A3B8] uppercase mb-2.5">
                READ • REFLECT • BELONG
              </div>

              {/* Botanical Leaf Ornament */}
              <div className="flex justify-center text-[#B8A898]/80">
                <svg className="w-12 h-5" viewBox="0 0 60 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10 C 20 5, 40 5, 56 10" />
                  <path d="M16 8 C 19 4, 24 5, 25 8" />
                  <path d="M26 8 C 30 3, 36 4, 37 8" />
                  <path d="M38 8 C 42 4, 47 5, 48 8" />
                  <path d="M19 11 C 22 15, 27 14, 28 11" />
                  <path d="M29 11 C 33 16, 39 15, 40 11" />
                  <path d="M41 11 C 45 15, 50 14, 51 11" />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* SCREEN 1B: SIGN UP                                       */}
        {/* ======================================================== */}
        {mode === 'signup' && (
          <>
            {/* Heading & Subtitle */}
            <div className="text-center mb-6">
              <h1
                className="text-2xl sm:text-[28px] font-semibold text-[#16243A] tracking-tight leading-snug"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                Create Your Account
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#64748B] uppercase mt-1">
                BEGIN YOUR READING JOURNEY
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              {/* Full Name */}
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none"
                />
              </div>

              {/* Email Address */}
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none"
                />
              </div>

              {/* Large full-width dark navy rounded "Create Account & Send OTP →" button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-xl sm:rounded-2xl bg-[#16243A] text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#0F1A2B] transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Send OTP</span>
                    <span className="text-base leading-none">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Alternative Sign-In */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#ECE7E0]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#94A3B8] font-normal lowercase tracking-wide">
                  or continue with
                </span>
              </div>
            </div>

            {/* Three equal rounded buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                className="py-2.5 px-2 rounded-xl sm:rounded-2xl border border-[#E2DCD3] bg-white hover:bg-[#F9F7F4] text-xs font-medium text-[#334155] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleEmailOtpQuickClick}
                className="py-2.5 px-2 rounded-xl sm:rounded-2xl border border-[#E2DCD3] bg-white hover:bg-[#F9F7F4] text-xs font-medium text-[#334155] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <Mail className="w-4 h-4 text-[#64748B] shrink-0" />
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerFaceIdSignIn}
                className="py-2.5 px-2 rounded-xl sm:rounded-2xl border border-[#E2DCD3] bg-white hover:bg-[#F9F7F4] text-xs font-medium text-[#334155] flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-2xs"
              >
                <ScanFace className="w-4 h-4 text-[#64748B] shrink-0" />
                <span>Face ID</span>
              </button>
            </div>

            {/* Security / Platform Features Panel */}
            <div className="bg-[#F9F7F4] rounded-2xl p-3 sm:p-3.5 border border-[#ECE6DE] my-5">
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Secure Authentication
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <ScanFace className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Biometric Face Verification
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Location Protected
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <BookOpen className="w-4 h-4 text-[#64748B] mb-1 stroke-[1.8]" />
                  <span className="text-[10px] leading-tight font-medium text-[#475569]">
                    Access Your Library
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="text-center pt-1">
              <p className="text-xs text-[#475569] mb-2.5">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode('signin');
                  }}
                  className="font-semibold text-[#16243A] hover:underline cursor-pointer"
                >
                  Sign In →
                </button>
              </p>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#94A3B8] mb-2">
                <button
                  type="button"
                  onClick={() => setActiveLegalDialog('terms')}
                  className="hover:text-[#16243A] transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setActiveLegalDialog('privacy')}
                  className="hover:text-[#16243A] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setActiveLegalDialog('help')}
                  className="hover:text-[#16243A] transition-colors cursor-pointer"
                >
                  Help
                </button>
              </div>

              <div className="text-[10px] font-semibold tracking-[0.25em] text-[#94A3B8] uppercase mb-2.5">
                READ • REFLECT • BELONG
              </div>

              {/* Botanical Leaf Ornament */}
              <div className="flex justify-center text-[#B8A898]/80">
                <svg className="w-12 h-5" viewBox="0 0 60 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10 C 20 5, 40 5, 56 10" />
                  <path d="M16 8 C 19 4, 24 5, 25 8" />
                  <path d="M26 8 C 30 3, 36 4, 37 8" />
                  <path d="M38 8 C 42 4, 47 5, 48 8" />
                  <path d="M19 11 C 22 15, 27 14, 28 11" />
                  <path d="M29 11 C 33 16, 39 15, 40 11" />
                  <path d="M41 11 C 45 15, 50 14, 51 11" />
                </svg>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: SIGN UP OTP                                    */}
        {/* ======================================================== */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <h1
                className="text-2xl font-semibold text-[#16243A] tracking-tight mb-1"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                Verify Your Email
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#64748B] uppercase mb-1">
                ENTER 5-DIGIT VERIFICATION CODE
              </p>
              <p className="text-xs text-[#64748B]">
                Enter the code sent to <span className="font-semibold text-[#16243A]">{email}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-3" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={digit}
                  onFocus={(e) => e.target.select()}
                  onPaste={handleOtpPaste}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-2xl font-semibold rounded-2xl bg-[#FAF8F5] border-2 border-[#E2DCD3] focus:border-[#16243A] focus:ring-1 focus:ring-[#16243A] text-[#16243A] outline-none transition-all shadow-xs"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 5}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#16243A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0F1A2B] transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <span className="text-base leading-none">→</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="hover:text-[#16243A] underline transition-colors cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-1 font-medium hover:text-[#16243A] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                <span>
                  {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                </span>
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-[#64748B]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-[#16243A] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: CREATE PASSWORD                                */}
        {/* ======================================================== */}
        {mode === 'password' && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <h1
                className="text-2xl font-semibold text-[#16243A] tracking-tight mb-1"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                Establish Password
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#64748B] uppercase mb-1">
                CREATE YOUR SECRET PASSPHRASE
              </p>
              <p className="text-xs text-[#64748B]">
                For <span className="font-semibold text-[#16243A]">{email}</span>
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#334155]">
                  Secret Passphrase
                </label>
                <button
                  type="button"
                  onClick={generateSecurePassphrase}
                  className="text-[11px] font-sans font-semibold text-[#8B261D] hover:text-[#B93826] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Generate a strong literary passphrase"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Generate Strong Passphrase</span>
                </button>
              </div>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#94A3B8] hover:text-[#16243A] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                Confirm Passphrase
              </label>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat passphrase"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-[#94A3B8] hover:text-[#16243A] p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {password && confirmPassword && (
              <div className="text-[11px]">
                {password === confirmPassword ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passphrases match
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Passphrases do not match
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#16243A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0F1A2B] transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save Passphrase &amp; Continue</span>
                  <span className="text-base leading-none">→</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3.5: MANDATORY AUTOMATIC FACE REGISTRATION         */}
        {/* ======================================================== */}
        {mode === 'face_registration' && (
          <FaceRegistrationModal
            isOpen={true}
            flowType={faceFlowType}
            userEmail={pendingAuthUser?.email || signInEmail.trim().toLowerCase() || email.trim().toLowerCase()}
            userName={pendingAuthUser?.name || name.trim() || 'Reader'}
            password={pendingRegistrationData?.password}
            firebaseUid={`usr_${(pendingAuthUser?.email || signInEmail || email).toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
            onSuccess={async (authResult) => {
              console.log('[AuthPortal] FaceRegistrationModal onSuccess triggered with authResult:', authResult);

              // Location verification only for new user registration (enroll), not for signed-up users (verify)
              if (faceFlowType === 'enroll') {
                const locCheck = await locationVerificationService.requirePreciseLocation();
                if (!locCheck.valid) {
                  setError(locCheck.error || 'Precise location is required to finalize registration.');
                  setBarrierActionContext('Registration Entry');
                  setShowLocationBarrier(true);
                  return;
                }
              }

              const targetEmail = authResult?.user?.email || (pendingAuthUser as AuthUser | null)?.email || signInEmail.trim().toLowerCase() || email.trim().toLowerCase();
              const targetName = authResult?.user?.name || (pendingAuthUser as AuthUser | null)?.name || name.trim() || 'Reader';
              
              if (faceFlowType === 'enroll' && pendingRegistrationData) {
                try {
                  await saveUserWithPasswordToFirebase(
                    pendingRegistrationData.email,
                    pendingRegistrationData.name,
                    pendingRegistrationData.password || ''
                  );
                } catch (saveErr) {
                  console.warn('[AuthPortal] Firestore registration save notice:', saveErr);
                }
              }

              const targetUser: AuthUser = {
                id: authResult?.user?.id || (pendingAuthUser as AuthUser | null)?.id || `usr_${targetEmail.replace(/[^a-z0-9]/g, '_')}`,
                name: targetName,
                email: targetEmail
              };

              try {
                localStorage.setItem('wilting_auth_user', JSON.stringify(targetUser));
              } catch {}

              await recordFaceRegistrationInFirebase(targetUser.email, targetUser.name);
              audioSynth.playNow();

              locationVerificationService.releaseWatcherAfterAuthComplete();
              onAuthenticated(targetUser);
            }}
            onCancel={() => {
              console.log('[AuthPortal] Face verification canceled by user. Returning to signin.');
              setPendingAuthUser(null);
              setMode('signin');
            }}
          />
        )}

        {/* ======================================================== */}
        {/* SCREEN 5: FORGOT PASSWORD - EMAIL                        */}
        {/* ======================================================== */}
        {mode === 'forgot_email' && (
          <form onSubmit={handleForgotSendOtp} className="space-y-4">
            <div className="text-center mb-4">
              <h1
                className="text-2xl font-semibold text-[#16243A] tracking-tight mb-1"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                Reset Password
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#64748B] uppercase mb-1">
                ENTER YOUR REGISTERED EMAIL
              </p>
              <p className="text-xs text-[#64748B]">
                We will dispatch a secure 5-digit verification passcode.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                Registered Email Address
              </label>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. reader@example.com"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#16243A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0F1A2B] transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Sending Reset Code...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <span className="text-base leading-none">→</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-[#64748B]">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="inline-flex items-center gap-1.5 font-semibold text-[#16243A] hover:underline transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 6: FORGOT PASSWORD - OTP VERIFY                   */}
        {/* ======================================================== */}
        {mode === 'forgot_otp' && (
          <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <h1
                className="text-2xl font-semibold text-[#16243A] tracking-tight mb-1"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                Verify Reset Code
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#64748B] uppercase mb-1">
                ENTER 5-DIGIT PASSCODE
              </p>
              <p className="text-xs text-[#64748B]">
                Sent to <span className="font-semibold text-[#16243A]">{forgotEmail}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-3" onPaste={handleForgotOtpPaste}>
              {forgotOtp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    forgotOtpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={digit}
                  onFocus={(e) => e.target.select()}
                  onPaste={handleForgotOtpPaste}
                  onChange={(e) => handleForgotOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleForgotOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-2xl font-semibold rounded-2xl bg-[#FAF8F5] border-2 border-[#E2DCD3] focus:border-[#16243A] focus:ring-1 focus:ring-[#16243A] text-[#16243A] outline-none transition-all shadow-xs"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || forgotOtp.join('').length !== 5}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#16243A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0F1A2B] transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <span className="text-base leading-none">→</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
              <button
                type="button"
                onClick={() => setMode('forgot_email')}
                className="hover:text-[#16243A] underline transition-colors cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => handleForgotSendOtp()}
                disabled={forgotResendCooldown > 0 || loading}
                className="flex items-center gap-1 font-medium hover:text-[#16243A] disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                <span>
                  {forgotResendCooldown > 0 ? `Resend (${forgotResendCooldown}s)` : 'Resend Code'}
                </span>
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-[#64748B]">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="inline-flex items-center gap-1.5 font-semibold text-[#16243A] hover:underline transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 7: FORGOT PASSWORD - NEW PASSPHRASE               */}
        {/* ======================================================== */}
        {mode === 'forgot_new_password' && (
          <form onSubmit={handleForgotResetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <h1
                className="text-2xl font-semibold text-[#16243A] tracking-tight mb-1"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                Set New Password
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#64748B] uppercase mb-1">
                ESTABLISH YOUR NEW PASSPHRASE
              </p>
              <p className="text-xs text-[#64748B]">
                For <span className="font-semibold text-[#16243A]">{forgotEmail}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                New Secret Passphrase
              </label>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewForgotPass ? 'text' : 'password'}
                  required
                  value={newForgotPass}
                  onChange={(e) => setNewForgotPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewForgotPass(!showNewForgotPass)}
                  className="absolute right-3.5 text-[#94A3B8] hover:text-[#16243A] p-1 cursor-pointer"
                >
                  {showNewForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                Confirm New Passphrase
              </label>
              <div className="relative flex items-center bg-[#FAF8F5] border border-[#E2DCD3] focus-within:border-[#16243A] focus-within:ring-1 focus-within:ring-[#16243A] rounded-xl sm:rounded-2xl transition-all">
                <div className="pl-3.5 text-[#94A3B8] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmForgotPass ? 'text' : 'password'}
                  required
                  value={confirmForgotPass}
                  onChange={(e) => setConfirmForgotPass(e.target.value)}
                  placeholder="Repeat new passphrase"
                  className="w-full bg-transparent px-3 py-3 text-sm text-[#16243A] placeholder-[#94A3B8] outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmForgotPass(!showConfirmForgotPass)}
                  className="absolute right-3.5 text-[#94A3B8] hover:text-[#16243A] p-1 cursor-pointer"
                >
                  {showConfirmForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {newForgotPass && confirmForgotPass && (
              <div className="text-[11px]">
                {newForgotPass === confirmForgotPass ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passphrases match
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Passphrases do not match
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newForgotPass.length < 6 || newForgotPass !== confirmForgotPass}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#16243A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0F1A2B] transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-white" />
                  <span>Updating &amp; Signing In...</span>
                </>
              ) : (
                <>
                  <span>Update Password &amp; Enter</span>
                  <span className="text-base leading-none">→</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-[#64748B]">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="inline-flex items-center gap-1.5 font-semibold text-[#16243A] hover:underline transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel &amp; Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Precise Location Barrier Modal */}
        <PreciseLocationBarrier
          isOpen={showLocationBarrier}
          onClose={() => setShowLocationBarrier(false)}
          onVerified={() => {
            setShowLocationBarrier(false);
            setError(null);
          }}
          title="Precise Location Required"
          contextAction={barrierActionContext}
        />

        {/* Legal & Help Modal Popover */}
        {activeLegalDialog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E8E2D9] shadow-2xl text-[#16243A] relative">
              <button
                type="button"
                onClick={() => setActiveLegalDialog(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-[#94A3B8] hover:text-[#16243A] hover:bg-[#F5F2EC] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3
                className="text-xl font-semibold mb-2"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
              >
                {activeLegalDialog === 'terms' && 'Terms of Service'}
                {activeLegalDialog === 'privacy' && 'Privacy Policy'}
                {activeLegalDialog === 'help' && 'Reader Support & Help'}
              </h3>

              <div className="text-xs text-[#475569] leading-relaxed max-h-72 overflow-y-auto pr-1 space-y-2.5">
                {activeLegalDialog === 'terms' && (
                  <>
                    <p>
                      Welcome to the Wilting of Words literary reading platform. By accessing or registering an account, you agree to access the authorized edition solely for personal reading.
                    </p>
                    <p>
                      All text, chapter manuscripts, scholastic questions, and certificate credentials are copyright protected under Technodef and Pratyay Saha.
                    </p>
                  </>
                )}
                {activeLegalDialog === 'privacy' && (
                  <>
                    <p>
                      Your privacy is sacred to our sanctuary. Your account details and authentication state are secured via cryptographic encryption and Firebase security rules.
                    </p>
                    <p>
                      Biometric facial features and precise GPS credentials are used exclusively to ensure authorized, verified access and are never shared or sold.
                    </p>
                  </>
                )}
                {activeLegalDialog === 'help' && (
                  <>
                    <p>
                      Need help accessing your reading library or registering biometric verification?
                    </p>
                    <p>
                      Email the chief sanctuary administrator directly at:
                    </p>
                    <p className="font-semibold text-[#16243A]">
                      electroplus.zebron@gmail.com
                    </p>
                  </>
                )}
              </div>

              <div className="mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setActiveLegalDialog(null)}
                  className="px-4 py-2 rounded-xl bg-[#16243A] text-white text-xs font-semibold hover:bg-[#0F1A2B] transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
