import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  SwitchCamera, 
  X, 
  Eye, 
  Shield, 
  User, 
  Sun, 
  Smile, 
  Glasses, 
  Check, 
  Sparkles,
  Smartphone,
  ChevronDown,
  Languages
} from 'lucide-react';
import { locationVerificationService } from '../services/locationVerificationService';
import { PreciseLocationBarrier } from './PreciseLocationBarrier';
import { useLanguage, SUPPORTED_LANGUAGES, languageCodeToLabel } from '../utils/LanguageContext';

export interface FaceAuthResult {
  sessionToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface FaceRegistrationModalProps {
  isOpen: boolean;
  userEmail: string;
  userName?: string;
  password?: string;
  firebaseUid?: string;
  flowType?: 'enroll' | 'verify'; // 'enroll' for signup, 'verify' for signin
  onSuccess: (authData?: FaceAuthResult) => void;
  onCancel?: () => void;
}

export const FaceRegistrationModal: React.FC<FaceRegistrationModalProps> = ({
  isOpen,
  userEmail,
  userName = 'Reader',
  password = '',
  firebaseUid = '',
  flowType = 'verify',
  onSuccess,
  onCancel
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'captured' | 'verifying' | 'success' | 'failed' | 'locked'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Take a selfie to verify');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  // Live Camera Stream State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Recovery State
  const [unlockCode, setUnlockCode] = useState<string>('');
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Precise Location Gate State
  const [showLocationBarrier, setShowLocationBarrier] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const androidCameraInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Continuous monitoring of precise location during face capture
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = locationVerificationService.subscribe((locState, _loc, locErr) => {
      if (locState === 'PERMISSION_DENIED' || locState === 'SERVICES_DISABLED' || locState === 'BLOCKED') {
        stopCamera();
        if (status === 'verifying' || isCameraActive) {
          setStatus('failed');
          setErrorMessage(locErr || 'Location access was interrupted. Please enable Location and retry.');
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, status, isCameraActive]);

  // Check available camera devices
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Stop camera stream safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start live webcam stream
  const startCamera = async (targetFacing: 'user' | 'environment' = facingMode) => {
    if (!isOpen) return;

    // Location verification only for new user registration (enroll), not for signed-up users (verify)
    if (flowType === 'enroll') {
      const locCheck = await locationVerificationService.requirePreciseLocation();
      if (!locCheck.valid) {
        setCameraError(locCheck.error || 'Precise location is required.');
        setShowLocationBarrier(true);
        return;
      }
    }

    setCameraLoading(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this browser. Please use native Android camera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: targetFacing,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setFacingMode(targetFacing);
    } catch (err: any) {
      setCameraError('Tap "Use Android Camera" below to capture your selfie.');
    } finally {
      setCameraLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setCapturedImage(null);
      setErrorMessage(null);
      setActiveStep(1);
      // Do not auto-request camera on mount to avoid permission prompt
      setIsCameraActive(false);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextMode);
  };

  // Capture frame from live video stream
  const captureSnapshot = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Trigger Android native camera file input
  const handleTriggerAndroidCamera = async () => {
    // Location verification only for new user registration (enroll), not for signed-up users (verify)
    if (flowType === 'enroll') {
      const locCheck = await locationVerificationService.requirePreciseLocation();
      if (!locCheck.valid) {
        setErrorMessage(locCheck.error || 'Precise location is required.');
        setShowLocationBarrier(true);
        return;
      }
    }

    if (androidCameraInputRef.current) {
      androidCameraInputRef.current.value = '';
      androidCameraInputRef.current.click();
    }
  };

  // Helper to resize/compress image to optimal dimensions for fast, sharp biometric verification
  const optimizeImageDataUrl = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Process photo selected from native camera input
  const handleAndroidFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && dataUrl.startsWith('data:image')) {
        const optimized = await optimizeImageDataUrl(dataUrl);
        setCapturedImage(optimized);
        stopCamera();
        handleProcessVerification(optimized);
      }
    };
    reader.readAsDataURL(file);
  };

  // Capture from live stream
  const handleCaptureClick = async () => {
    // Location verification only for new user registration (enroll), not for signed-up users (verify)
    if (flowType === 'enroll') {
      const locCheck = await locationVerificationService.requirePreciseLocation();
      if (!locCheck.valid) {
        setErrorMessage(locCheck.error || 'Precise location is required.');
        setShowLocationBarrier(true);
        return;
      }
    }

    if (!isCameraActive) {
      handleTriggerAndroidCamera();
      return;
    }
    const snapshot = captureSnapshot();
    if (snapshot) {
      const optimized = await optimizeImageDataUrl(snapshot);
      setCapturedImage(optimized);
      stopCamera();
      handleProcessVerification(optimized);
    } else {
      handleTriggerAndroidCamera();
    }
  };

  // Send photo to backend and enroll/verify user
  const handleProcessVerification = async (imageData: string) => {
    // Strict Precise Location Gate
    const locPayload = locationVerificationService.getAuthLocationPayload();
    if (!locPayload) {
      setStatus('failed');
      setActiveStep(1);
      setErrorMessage('Precise location is required. Approximate location is not supported. Please enable Precise location for this site and try again.');
      setShowLocationBarrier(true);
      return;
    }

    setStatus('verifying');
    setActiveStep(2);
    setStatusMessage('Analyzing biometric facial landmarks…');
    setErrorMessage(null);

    const cleanEmail = (userEmail || '').trim().toLowerCase();
    const endpoint = flowType === 'enroll' ? '/api/auth/enroll-face' : '/api/auth/verify-face';

    const payload: any = {
      email: cleanEmail,
      faceImage: imageData,
      timestamp: new Date().toISOString(),
      latitude: locPayload.latitude,
      longitude: locPayload.longitude,
      accuracy: locPayload.accuracy,
      locationTimestamp: locPayload.locationTimestamp,
      city: locPayload.city,
      region: locPayload.region,
      country: locPayload.country,
      address: locPayload.address
    };

    if (flowType === 'enroll') {
      payload.name = userName;
      payload.password = password;
      payload.firebaseUid = firebaseUid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    }

    try {
      setActiveStep(3);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...locationVerificationService.getAuthLocationHeaders()
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.status === 403 && data?.preciseLocationRequired) {
        setStatus('failed');
        setActiveStep(1);
        setErrorMessage(data?.error || 'Precise location is required.');
        setShowLocationBarrier(true);
        return;
      }

      if (res.status === 403 || data?.isLocked) {
        setStatus('locked');
        setErrorMessage(data?.error || 'Account locked after unsuccessful attempts. Please check your recovery code.');
        return;
      }

      if (!res.ok || !data || data.success !== true) {
        // If image quality check gave an explicit reason (e.g. covered face, blurry, hazy), display friendly prompt
        setStatus('failed');
        setActiveStep(1);
        setErrorMessage(data?.error || 'Authentic uncovered face not detected. Please uncover your face completely and retake photo.');
        return;
      }

      // SUCCESS! Complete all steps
      setActiveStep(4);
      setStatus('success');
      setStatusMessage('Identity Verified Successfully');

      // Mark session verified persistently so location is never re-blocked
      locationVerificationService.markSessionVerified();

      const authData: FaceAuthResult = {
        sessionToken: data.sessionToken || `tok_${Date.now()}`,
        user: {
          id: data.user?.id || firebaseUid || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
          name: data.user?.name || userName || 'Reader',
          email: cleanEmail
        }
      };

      try {
        localStorage.setItem('wilting_auth_user', JSON.stringify(authData.user));
        localStorage.setItem('wilting_auth_token', authData.sessionToken);
        localStorage.setItem('wilting_location_verified', 'true');
      } catch {}

      setTimeout(() => {
        onSuccess(authData);
      }, 1000);

    } catch (err: any) {
      console.warn('[FaceRegistrationModal] Verification error:', err);
      setStatus('failed');
      setActiveStep(1);
      setErrorMessage(err?.message || 'Face verification failed. Please ensure your entire uncovered face is visible and retake photo.');
    }
  };

  // Unlock recovery handler
  const handleUnlockAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockCode.trim()) return;
    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const res = await fetch('/api/auth/unlock-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, unlockCode: unlockCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('idle');
        setCapturedImage(null);
        startCamera();
      } else {
        setUnlockError(data.error || 'Invalid or expired recovery code.');
      }
    } catch {
      setUnlockError('Network error verifying code.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto">
      
      {/* Hidden Native Android Camera Input */}
      <input
        ref={androidCameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleAndroidFileChange}
        className="hidden"
      />

      {/* MAIN CONTAINER MATCHING SCREENSHOT (2-COLUMN LIGHT THEME DESIGN) */}
      <div className="bg-white border border-stone-200 rounded-3xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative text-stone-900 overflow-hidden my-auto">
        
        {/* Top Header: Language Selector & Close Button */}
        <div className="flex items-center justify-between mb-4 relative z-20">
          {/* Prominent Language Selector on Verification Page */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer border border-stone-200 shadow-2xs"
              title="Select Language"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              <span>{languageCodeToLabel(language)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>

            {showLanguageDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowLanguageDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-40 bg-white border border-stone-200 rounded-2xl shadow-xl py-1.5 z-40 text-xs">
                  {SUPPORTED_LANGUAGES.map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        language === opt.code
                          ? 'font-bold text-blue-600 bg-blue-50/60'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{opt.name}</span>
                        {opt.englishName !== opt.name && (
                          <span className="text-[10px] text-stone-400">{opt.englishName}</span>
                        )}
                      </div>
                      {language === opt.code && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Close Button */}
          {onCancel && (
            <button
              onClick={() => {
                stopCamera();
                onCancel();
              }}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* TOP TITLE AREA MATCHING SCREENSHOT */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{t('securityBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            {t('faceVerificationTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            {t('faceVerificationSubtitle')}
          </p>
        </div>

        {/* 4-STEP PROGRESS STEPPER MATCHING SCREENSHOT */}
        <div className="max-w-md mx-auto mb-8 px-4">
          <div className="relative flex items-center justify-between">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-stone-200 z-0" />
            {[
              { step: 1, label: t('stepCaptureFace') },
              { step: 2, label: t('stepMatch') },
              { step: 3, label: t('stepVerify') },
              { step: 4, label: t('stepComplete') }
            ].map((s) => {
              const isPastOrCurrent = activeStep >= s.step;
              const isCurrent = activeStep === s.step;
              return (
                <div key={s.step} className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : isPastOrCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border-2 border-stone-300 text-stone-400'
                  }`}>
                    {isPastOrCurrent && activeStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                    isCurrent ? 'text-blue-600' : 'text-stone-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACCOUNT LOCKED STATE */}
        {status === 'locked' ? (
          <div className="max-w-md mx-auto text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Account Temporarily Locked</h3>
            <p className="text-xs text-stone-500">
              Enter the 6-digit recovery unlock code sent to <strong>{userEmail}</strong> to reactivate face verification.
            </p>

            {unlockError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {unlockError}
              </div>
            )}

            <form onSubmit={handleUnlockAccount} className="space-y-3">
              <input
                type="text"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                placeholder="Enter 6-digit unlock code"
                maxLength={6}
                className="w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={isUnlocking}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
              >
                {isUnlocking ? 'Verifying Code…' : 'Unlock Account'}
              </button>
            </form>
          </div>
        ) : (
          /* TWO-COLUMN GRID LAYOUT MATCHING SCREENSHOT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: CAMERA VIEWFINDER & SHUTTER (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Camera Viewfinder Box with Oval Guide & Corner Brackets */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-stone-900 border border-stone-200 shadow-inner flex items-center justify-center">
                
                {/* Live Webcam Stream */}
                {isCameraActive && !capturedImage && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                )}

                {/* Captured Image Display */}
                {capturedImage && (
                  <img
                    src={capturedImage}
                    alt="Captured Face"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Camera Inactive: Use Camera Prompt */}
                {!isCameraActive && !capturedImage && (
                  <div 
                    onClick={handleTriggerAndroidCamera}
                    className="text-center p-6 space-y-3.5 text-white cursor-pointer hover:bg-stone-800/80 transition-colors rounded-2xl mx-4 my-auto border border-white/10 z-20"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center mx-auto text-blue-300 shadow-md">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <span className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all">
                        Use Camera
                      </span>
                      <p className="text-[11px] text-stone-300 pt-1">
                        Tap here to open native Android camera and take a selfie
                      </p>
                    </div>
                  </div>
                )}

                {/* White / Cyan Oval Guide Overlay Matching Screenshot */}
                {!capturedImage && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Centered Face Oval */}
                    <div className="w-[58%] h-[82%] rounded-[50%] border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
                    
                    {/* Corner Reticle Brackets Matching Screenshot */}
                    <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                    <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                    <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                    <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                  </div>
                )}

                {/* Verifying Laser Scan Overlay */}
                {status === 'verifying' && (
                  <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-10">
                    <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                      Analyzing Biometrics…
                    </span>
                  </div>
                )}

                {/* Switch Camera Button (if multiple cameras available) */}
                {hasMultipleCameras && isCameraActive && !capturedImage && (
                  <button
                    onClick={handleToggleFacingMode}
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all cursor-pointer shadow-md z-10"
                    title="Switch camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 3 Guidelines Matching Screenshot */}
              <div className="grid grid-cols-3 gap-2 text-center text-stone-600 pt-1">
                <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center justify-center gap-1.5">
                  <Smile className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-medium leading-tight">{t('guidelineFullFace')}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center justify-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-medium leading-tight">{t('guidelineGoodLighting')}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col items-center justify-center gap-1.5">
                  <Glasses className="w-4 h-4 text-stone-500" />
                  <span className="text-[10px] font-medium leading-tight">{t('guidelineNoGlasses')}</span>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Shutter / Capture Button Area Matching Screenshot */}
              <div className="flex flex-col items-center justify-center pt-2 space-y-2">
                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={handleCaptureClick}
                    disabled={status === 'verifying' || status === 'success'}
                    className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                    title="Capture Photo"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('stepCaptureFace')}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={handleTriggerAndroidCamera}
                      disabled={status === 'verifying' || status === 'success'}
                      className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Take Selfie"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('takeSelfie')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      disabled={cameraLoading || status === 'verifying'}
                      className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center gap-2 border border-stone-200 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      title="Start Live Webcam"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>{cameraLoading ? '...' : t('liveWebcam')}</span>
                    </button>
                  </div>
                )}
                <span className="text-xs font-semibold text-stone-600">
                  {isCameraActive ? t('cameraInstructions') : t('cameraTapPrompt')}
                </span>
              </div>

            </div>

            {/* RIGHT COLUMN: "YOUR SECURITY MATTERS" CARD (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border border-blue-100 rounded-3xl p-6 space-y-5">
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900 leading-tight">
                      {t('yourSecurityMatters')}
                    </h3>
                    <span className="text-[11px] text-blue-600 font-semibold">{t('zeroTrustBadge')}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {t('securityExplainer')}
                </p>

                {/* 3 Bullet Points Matching Screenshot */}
                <div className="space-y-3 pt-1 text-xs text-stone-700">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>{t('securityPoint1')}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{t('securityPoint2')}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span>{t('securityPoint3')}</span>
                  </div>
                </div>

                {/* Green Privacy Box Matching Screenshot */}
                <div className="p-3.5 rounded-2xl bg-[#EBFBF4] border border-[#B7F4D8] text-xs text-[#006644] space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t('privacyHeader')}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed pl-6">
                    {t('privacyText')}
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Precise Location Barrier Modal */}
        <PreciseLocationBarrier
          isOpen={showLocationBarrier}
          onClose={() => setShowLocationBarrier(false)}
          onVerified={() => {
            setShowLocationBarrier(false);
            setErrorMessage(null);
          }}
          title="Precise Location Required"
          contextAction="Biometric Face Verification"
        />

      </div>
    </div>
  );
};
