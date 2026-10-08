import React, { useState, useEffect } from 'react';
import { Sparkles, Power, Megaphone, X, ShieldCheck, AlertTriangle, RefreshCw, MapPin, ShieldAlert } from 'lucide-react';
import { Header } from './components/Header';
import { locationVerificationService, LocationVerificationState, VerifiedLocation } from './services/locationVerificationService';
import { HeroCoverSection } from './components/HeroCoverSection';
import { InteractiveHubCards } from './components/InteractiveHubCards';
import { NovelPrologueShowcase } from './components/NovelPrologueShowcase';
import { AboutTheBook } from './components/AboutTheBook';
import { BehindTheBook } from './components/BehindTheBook';
import { NovelThemes } from './components/NovelThemes';
import { ProtagonistGallery } from './components/ProtagonistGallery';
import { BookGallery } from './components/BookGallery';
import { WritersTimeline } from './components/WritersTimeline';
import { WritersDesk } from './components/WritersDesk';
import { BeyondTheShell } from './components/BeyondTheShell';
import { AuthorSection } from './components/AuthorSection';
import { PressRecognition } from './components/PressRecognition';
import { EditionAnnouncement } from './components/EditionAnnouncement';
import { ReaderCabinet } from './components/ReaderCabinet';
import { QuoteSharer } from './components/QuoteSharer';
import { ReaderReflections } from './components/ReaderReflections';
import { Footer } from './components/Footer';
import { IndianCulturalCanvas } from './components/IndianCulturalCanvas';
import { QuickJumpBar } from './components/QuickJumpBar';
import { audioSynth } from './services/audioSynth';
import { EntranceGate } from './components/EntranceGate';
import { AuthPortal, AuthUser } from './components/AuthPortal';
import { PreciseLocationBarrier } from './components/PreciseLocationBarrier';
import { BookPreviewModal } from './components/BookPreviewModal';
import { SampleChapterModal } from './components/SampleChapterModal';
import { CopyrightModal } from './components/CopyrightModal';
import { CertificateModal } from './components/CertificateModal';
import { SeraphAssistant } from './components/SeraphAssistant';
import { WOWAssistant } from './components/WOWAssistant';
import { SearchModal } from './components/SearchModal';
import { ReadingStatsModal } from './components/ReadingStatsModal';
import { SanctuaryCredits } from './components/SanctuaryCredits';
import { SponsorScratchSection } from './components/SponsorScratchSection';
import { RoyalMenuDrawer } from './components/RoyalMenuDrawer';
import { FAQModal } from './components/FAQModal';
import { SupportModal } from './components/SupportModal';
import { SettingsModal } from './components/SettingsModal';
import { calculateSunCycle } from './utils/sunTime';
import { LegalInfoModal } from './components/LegalInfoModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { ReaderModeSelectorModal } from './components/ReaderModeSelectorModal';
import { KindleInteractiveReader } from './components/KindleInteractiveReader';
import { ImmersiveReaderModal } from './components/ImmersiveReaderModal';
import { ChapterExamModal } from './components/ChapterExamModal';
import { AnimatedFeatureExplainer } from './components/AnimatedFeatureExplainer';
import { ReaderDashboard } from './components/ReaderDashboard';
import { ChakdahaInteractiveMap } from './components/ChakdahaInteractiveMap';
import { AdminPWAModal } from './components/admin/AdminPWAModal';
import { ShareAppModal } from './components/ShareAppModal';
import { SplashLoader } from './components/SplashLoader';
import { PosterModal } from './components/PosterModal';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wilting_theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [isAutoNightMode, setIsAutoNightMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wilting_auto_night_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isAmbientLit, setIsAmbientLit] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wilting_ambient_lighting') === 'true';
    } catch {
      return false;
    }
  });

  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wilting_entered') === 'true' || Boolean(localStorage.getItem('wilting_auth_user'));
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('wilting_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthPortal, setShowAuthPortal] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signup' | 'signin'>('signin');
  const [locState, setLocState] = useState<LocationVerificationState>(() => locationVerificationService.getState());
  const [verifiedLoc, setVerifiedLoc] = useState<VerifiedLocation | null>(() => locationVerificationService.getVerifiedLocation());
  const [showLocationBarrier, setShowLocationBarrier] = useState<boolean>(false);
  const [locationBarrierContext, setLocationBarrierContext] = useState<string>('Sanctuary Access');
  const [secRemaining, setSecRemaining] = useState<number>(() => locationVerificationService.getSecondsRemaining());
  const [showWOWAssistant, setShowWOWAssistant] = useState<boolean>(false);

  const lastReportedLocationRef = React.useRef<{ lat: number; lon: number; time: number } | null>(null);

  const reportLocation = async (lat: number, lon: number) => {
    // Throttle location reporting to once every 10 minutes max
    const now = Date.now();
    if (
      lastReportedLocationRef.current &&
      now - lastReportedLocationRef.current.time < 600000 &&
      Math.abs(lastReportedLocationRef.current.lat - lat) < 0.001 &&
      Math.abs(lastReportedLocationRef.current.lon - lon) < 0.001
    ) {
      return;
    }
    lastReportedLocationRef.current = { lat, lon, time: now };

    try {
      let city = 'GPS Capture';
      let region = 'Sensor Coordinate';
      let country = 'Device Satellite';
      let address = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

      // Asynchronous reverse geocoding in background without blocking
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.ok ? res.json() : null)
        .then(geoData => {
          if (geoData?.display_name) address = geoData.display_name;
          if (geoData?.address) {
            city = geoData.address.city || geoData.address.town || geoData.address.village || city;
            region = geoData.address.state || geoData.address.region || region;
            country = geoData.address.country || country;
          }
          fetch('/api/auth/record-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser?.email || 'guest_reader@wiltingofwords.com',
              latitude: lat,
              longitude: lon,
              ip: 'GPS_SENSOR_ONLY',
              address,
              city,
              region,
              country
            })
          }).catch(() => {});
        })
        .catch(() => {});
    } catch (e) {
      console.warn('[Location Record] Notice:', e);
    }
  };

  useEffect(() => {
    // Continuous Precise Location Monitoring
    const unsubscribe = locationVerificationService.subscribe((state, location) => {
      setLocState(state);
      setVerifiedLoc(location);

      if (state === 'VALID' && location) {
        reportLocation(location.latitude, location.longitude);
        setShowLocationBarrier(false);
      }
    });

    // Handle security invalidation if location lost during auth flow (only for unauthenticated sessions)
    const unregisterInvalidation = locationVerificationService.onAuthInvalidated(() => {
      const savedUser = localStorage.getItem('wilting_auth_user');
      if (savedUser || currentUser) {
        return; // Location verification not required for signed-up users
      }
      console.warn('[App] Location security violation triggered session invalidation.');
      setShowLocationBarrier(true);
      setCurrentUser(null);
      try {
        localStorage.removeItem('wilting_auth_user');
        localStorage.removeItem('wilting_auth_token');
      } catch {}
    });

    return () => {
      unsubscribe();
      unregisterInvalidation();
    };
  }, []);

  // Modal States
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showReaderModeSelector, setShowReaderModeSelector] = useState<boolean>(false);
  const [showKindleReader, setShowKindleReader] = useState<boolean>(false);
  const [showChapterExamModal, setShowChapterExamModal] = useState<boolean>(false);
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);
  const [showCopyrightModal, setShowCopyrightModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [showSeraphModal, setShowSeraphModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showReadingStatsModal, setShowReadingStatsModal] = useState<boolean>(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState<boolean>(false);
  const [showFAQModal, setShowFAQModal] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy' | 'info'>('info');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false);
  const [showImmersiveReader, setShowImmersiveReader] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showPosterModal, setShowPosterModal] = useState<boolean>(false);
  const [showAdminPWAModal, setShowAdminPWAModal] = useState<boolean>(() => {
    try {
      return window.location.search.includes('mode=admin') || window.location.hash.includes('admin');
    } catch {
      return false;
    }
  });

  // Global Admin App Settings (Maintenance mode, App Suspended, AI status, Announcements)
  const [globalAppSettings, setGlobalAppSettings] = useState<{
    maintenanceMode: boolean;
    appSuspended: boolean;
    aiEnabled: boolean;
    announcement: string;
  }>({
    maintenanceMode: false,
    appSuspended: false,
    aiEnabled: true,
    announcement: ''
  });

  const [dismissedAnnouncement, setDismissedAnnouncement] = useState<boolean>(false);
  const [securitySignoutNotice, setSecuritySignoutNotice] = useState<boolean>(false);
  const [userBlockedNotice, setUserBlockedNotice] = useState<string | null>(null);

  // Fetch Global App Settings from Backend
  useEffect(() => {
    fetch('/api/settings/global')
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setGlobalAppSettings({
            maintenanceMode: Boolean(data.maintenanceMode),
            appSuspended: Boolean(data.appSuspended || data.maintenanceMode),
            aiEnabled: Boolean(data.aiEnabled !== false),
            announcement: data.announcement || ''
          });
        }
      })
      .catch(() => {});

    // Separate dedicated admin portal access via URL query parameter or hash (e.g. ?admin=true or #admin)
    const handleUrlChange = () => {
      try {
        const isAdminUrl = window.location.search.includes('admin') || 
                           window.location.hash.includes('admin') || 
                           window.location.pathname.includes('/admin');
        if (isAdminUrl) {
          setShowAdminPWAModal(true);
        }
      } catch {}
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const currentLoc = locationVerificationService.getVerifiedLocation();
    if (currentLoc) {
      reportLocation(currentLoc.latitude, currentLoc.longitude);
    }
  }, [currentUser?.email]);

  // Ultra-fast real-time verification to ensure blocked or deleted user is simultaneously signed out
  useEffect(() => {
    if (!currentUser) return;

    const checkSessionStatus = () => {
      const token = localStorage.getItem('wilting_auth_token');
      if (token) {
        fetch('/api/auth/session-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
          .then(res => res.json())
          .then(data => {
            if (data.blocked || (!data.valid && data.error?.toLowerCase().includes('blocked'))) {
              try {
                localStorage.removeItem('wilting_auth_token');
                localStorage.removeItem('wilting_auth_user');
                localStorage.removeItem('wilting_entered');
              } catch {}
              setCurrentUser(null);
              setHasEntered(false);
              setAuthInitialMode('signin');
              setShowAuthPortal(true);
              setUserBlockedNotice('Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance.');
            } else if (data.deleted || (!data.valid && data.error?.toLowerCase().includes('deleted'))) {
              try {
                localStorage.removeItem('wilting_auth_token');
                localStorage.removeItem('wilting_auth_user');
                localStorage.removeItem('wilting_entered');
              } catch {}
              setCurrentUser(null);
              setHasEntered(false);
              setAuthInitialMode('signup');
              setShowAuthPortal(true);
              setUserBlockedNotice('Your account has been deleted by the administrator. Please Sign Up to create an account.');
            }
          })
          .catch(() => {});
      }
    };

    // Run verification immediately on mount, focus, and every 1.5 seconds
    checkSessionStatus();
    const interval = setInterval(checkSessionStatus, 1500);

    // Cross-tab broadcast listener for 0ms instantaneous signout when admin blocks/deletes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wilting_auth_broadcast') {
        try {
          const payload = JSON.parse(e.newValue || '{}');
          if (payload && (payload.action === 'block' || payload.action === 'delete')) {
            const myEmail = currentUser.email.toLowerCase().trim();
            if (!payload.email || payload.email.toLowerCase().trim() === myEmail) {
              localStorage.removeItem('wilting_auth_token');
              localStorage.removeItem('wilting_auth_user');
              localStorage.removeItem('wilting_entered');
              setCurrentUser(null);
              setHasEntered(false);
              if (payload.action === 'block') {
                setAuthInitialMode('signin');
                setShowAuthPortal(true);
                setUserBlockedNotice('Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance.');
              } else {
                setAuthInitialMode('signup');
                setShowAuthPortal(true);
                setUserBlockedNotice('Your account has been deleted by the administrator. Please Sign Up to create an account.');
              }
            }
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkSessionStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkSessionStatus);
    };
  }, [currentUser]);

  // Verify server-side session token on startup
  useEffect(() => {
    audioSynth.init();

    const token = localStorage.getItem('wilting_auth_token');
    if (token) {
      fetch('/api/auth/session-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            try {
              localStorage.removeItem('wilting_auth_token');
              localStorage.removeItem('wilting_auth_user');
              localStorage.removeItem('wilting_entered');
            } catch {}
            setCurrentUser(null);
            setHasEntered(false);
            if (data.blocked || data.error?.toLowerCase().includes('blocked')) {
              setAuthInitialMode('signin');
              setShowAuthPortal(true);
              setUserBlockedNotice('Your account is blocked by the administrator. Please contact electroplus.zebron@gmail.com for assistance.');
            } else if (data.deleted || data.error?.toLowerCase().includes('deleted')) {
              setAuthInitialMode('signup');
              setShowAuthPortal(true);
              setUserBlockedNotice('Your account has been deleted by the administrator. Please Sign Up to create an account.');
            }
          } else if (data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleToggleAmbientLit = () => {
    const next = !isAmbientLit;
    setIsAmbientLit(next);
    try {
      localStorage.setItem('wilting_ambient_lighting', String(next));
    } catch {}
  };

  const handleSetIsDark = (dark: boolean) => {
    setIsDark(dark);
    try {
      localStorage.setItem('wilting_theme', dark ? 'dark' : 'light');
    } catch {}

    // Disable Auto Night Mode if user manually switches theme
    if (isAutoNightMode) {
      setIsAutoNightMode(false);
      try {
        localStorage.setItem('wilting_auto_night_mode', 'false');
      } catch {}
    }
  };

  const handleToggleAutoNightMode = () => {
    const next = !isAutoNightMode;
    setIsAutoNightMode(next);
    try {
      localStorage.setItem('wilting_auto_night_mode', String(next));
    } catch {}
  };

  // Astronomical Auto Night Mode Background Sync Timer
  useEffect(() => {
    if (!isAutoNightMode) return;

    const syncThemeWithSunCycle = () => {
      const loc = verifiedLoc || locationVerificationService.getVerifiedLocation();
      const sunCycle = calculateSunCycle(loc?.latitude, loc?.longitude);
      setIsDark(sunCycle.isNight);
      try {
        localStorage.setItem('wilting_theme', sunCycle.isNight ? 'dark' : 'light');
      } catch {}
    };

    syncThemeWithSunCycle();

    const interval = setInterval(syncThemeWithSunCycle, 30000);
    return () => clearInterval(interval);
  }, [isAutoNightMode, verifiedLoc]);

  const handleJumpToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navHeader = document.querySelector('header');
      const headerHeight = navHeader ? navHeader.offsetHeight : 70;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 12;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  const handleAuthenticated = (user: AuthUser) => {
    // Location verification is not required for signed-up users
    setCurrentUser(user);
    setShowAuthPortal(false);
    setShowLocationBarrier(false);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('wilting_auth_user');
      localStorage.removeItem('wilting_auth_token');
      localStorage.removeItem('wilting_entered');
    } catch {}
    setCurrentUser(null);
    setHasEntered(false);
    setShowAuthPortal(false);
  };

  const handleOpenAuth = (mode: 'signup' | 'signin' = 'signin') => {
    setAuthInitialMode(mode);
    setShowAuthPortal(true);
  };

  const handleOpenLegal = (tab: 'terms' | 'privacy' | 'info') => {
    setLegalTab(tab);
    setShowLegalModal(true);
  };

  const handleAccountDeleted = () => {
    try {
      localStorage.removeItem('wilting_auth_user');
      localStorage.removeItem('wilting_auth_token');
      localStorage.removeItem('wilting_entered');
    } catch {}
    setCurrentUser(null);
    setHasEntered(false);
    setShowAuthPortal(false);
    setShowDeleteAccountModal(false);
  };

  if (showAdminPWAModal) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <AdminPWAModal
          isOpen={true}
          onClose={() => {
            setShowAdminPWAModal(false);
            try {
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch {}
          }}
          currentUser={currentUser}
          onOpenAuth={() => {
            setAuthInitialMode('signin');
            setShowAuthPortal(true);
          }}
        />
      </div>
    );
  }

  if (showSplash) {
    return <SplashLoader onComplete={() => setShowSplash(false)} />;
  }

  if (!hasEntered) {
    return (
      <EntranceGate 
        onEnter={() => {
          setHasEntered(true);
          try {
            localStorage.setItem('wilting_entered', 'true');
          } catch {}
          const saved = localStorage.getItem('wilting_auth_user');
          if (saved) {
            try {
              setCurrentUser(JSON.parse(saved));
            } catch {
              setAuthInitialMode('signin');
              setShowAuthPortal(true);
            }
          } else {
            setAuthInitialMode('signin');
            setShowAuthPortal(true);
          }
        }}
      />
    );
  }

  if (!currentUser) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center relative transition-colors duration-300 ${
        isDark ? 'bg-alpona-dark text-[#FAF7F2]' : 'bg-alpona-pattern text-[#2D241E]'
      }`}>
        <IndianCulturalCanvas isDark={isDark} />
        <AuthPortal
          isOpen={true}
          initialMode={authInitialMode}
          onAuthenticated={handleAuthenticated}
        />
        {userBlockedNotice && (
          <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-4 bg-red-950 border border-red-500 rounded-2xl text-xs text-red-200 shadow-2xl flex items-start gap-2.5 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-[10px] text-red-300 mb-0.5">Security Notice</span>
              <p>{userBlockedNotice}</p>
            </div>
            <button onClick={() => setUserBlockedNotice(null)} className="text-red-400 hover:text-white font-bold ml-auto">✕</button>
          </div>
        )}
      </div>
    );
  }

  // Strict Location Gate for Authenticated / Main Page Entry (Bypassed for already signed-up users per user request)
  const isPreciseLocationValid = true;

  if (currentUser && !isPreciseLocationValid) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center relative transition-colors duration-300 ${
        isDark ? 'bg-alpona-dark text-[#FAF7F2]' : 'bg-alpona-pattern text-[#2D241E]'
      }`}>
        <IndianCulturalCanvas isDark={isDark} />
        <PreciseLocationBarrier
          isOpen={true}
          title="Precise Location Required"
          contextAction="Entering Main Sanctuary"
          onVerified={() => {
            setShowLocationBarrier(false);
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen w-full max-w-[100vw] overflow-x-hidden relative transition-colors duration-300 ${
        isDark ? 'bg-alpona-dark text-[#FAF7F2]' : 'bg-alpona-pattern text-[#2D241E]'
      }`}
    >
      {/* Global Administrative Announcement Banner */}
      {globalAppSettings.announcement && (
        <div className="bg-gradient-to-r from-amber-900 via-red-900 to-amber-900 text-amber-100 px-4 py-2 text-center text-xs font-serif tracking-wide border-b border-amber-500/30 flex items-center justify-center gap-2 relative z-40 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span>{globalAppSettings.announcement}</span>
        </div>
      )}

      {/* Website Maintenance Mode Overlay (Active when maintenanceMode is true) */}
      {globalAppSettings.maintenanceMode && currentUser?.email !== 'electroplus.zebron@gmail.com' && (
        <div className="fixed inset-0 z-[100] bg-[#120D0A] text-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-lg bg-[#1E1713] border border-amber-900/60 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 text-2xl font-serif">
              🏛️
            </div>
            <h1 className="text-2xl font-serif text-amber-200">The Sanctuary Under Scheduled Maintenance</h1>
            <p className="text-sm text-amber-100/80 leading-relaxed font-serif">
              “Wilting of Words” is currently undergoing scheduled literary maintenance & archive updates managed via the WhatsApp Business Command Center.
            </p>
            <div className="p-3 bg-amber-950/40 border border-amber-800/30 rounded-lg text-xs text-amber-300 font-mono">
              Status: Maintenance Mode Active · Admin WhatsApp Portal Operational
            </div>
            <p className="text-xs text-amber-400/60 font-sans">
              Please check back shortly as we curate the manuscript.
            </p>
          </div>
        </div>
      )}

      {/* Website Suspended Overlay (Active when appSuspended is true) */}
      {globalAppSettings.appSuspended && currentUser?.email !== 'electroplus.zebron@gmail.com' && (
        <div className="fixed inset-0 z-[100] bg-[#120D0A] text-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-lg bg-[#1E1713] border border-red-900/60 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 text-2xl font-serif animate-pulse">
              ⚠️
            </div>
            <h1 className="text-2xl font-serif text-red-200">The Sanctuary Is Temporarily Disabled</h1>
            <p className="text-sm text-red-100/80 leading-relaxed font-serif">
              The “Wilting of Words” application has been temporarily disabled by the administrator. Normal user access is currently suspended.
            </p>
            <div className="p-3 bg-red-950/40 border border-red-800/30 rounded-lg text-xs text-red-300 font-mono">
              Status: Suspended by Administrator · Secure Cloud Control Active
            </div>
          </div>
        </div>
      )}

      {/* 
        WARM SANCTUARY AMBIENT LIGHTING OVERLAY (Toggleable Candlelight Aura)
      */}
      {isAmbientLit && (
        <div 
          className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-700 bg-gradient-to-b from-amber-500/[0.04] via-amber-600/[0.02] to-amber-700/[0.05] shadow-[inset_0_0_120px_rgba(212,175,55,0.18)]"
          aria-hidden="true"
        />
      )}

      {/* Background Indian Cultural Heritage Canvas with Konark & Bishnupur Mandalas */}
      <IndianCulturalCanvas isDark={isDark} />

      {/* Header with Three-Dot Menu on Left, Title, and Action Controls */}
      <Header
        isDark={isDark}
        setIsDark={handleSetIsDark}
        isAmbientLit={isAmbientLit}
        onToggleAmbientLit={handleToggleAmbientLit}
        onJumpToSection={handleJumpToSection}
        onOpenPreview={() => setShowReaderModeSelector(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenSeraph={() => setShowSeraphModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenReadingStats={() => setShowReadingStatsModal(true)}
        onOpenMenu={() => setShowMenuDrawer(true)}
        onOpenFAQ={() => setShowFAQModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenDeleteAccount={() => setShowDeleteAccountModal(true)}
        user={currentUser}
        onOpenAuth={() => handleOpenAuth('signin')}
        onSignOut={handleSignOut}
        onOpenWOW={() => setShowWOWAssistant(true)}
        onOpenShare={() => setShowShareModal(true)}
      />

      {/* Hero Cover Showcase at Top */}
      <HeroCoverSection
        isDark={isDark}
        onContinueJourney={() => handleJumpToSection('about-novel')}
        onExploreAuthor={() => handleJumpToSection('author-section')}
        onStartReading={() => handleJumpToSection('reader-cabinet')}
        onOpenPreview={() => setShowReaderModeSelector(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenSeraph={() => setShowSeraphModal(true)}
        onOpenPoster={() => setShowPosterModal(true)}
      />

      {/* On-Screen Interactive Floating Cards Hub */}
      <InteractiveHubCards
        isDark={isDark}
        onJumpToSection={handleJumpToSection}
        onOpenPreview={() => setShowReaderModeSelector(true)}
        onOpenAuth={() => handleOpenAuth('signin')}
      />

      {/* Animated Sanctuary Features Guide (Middle of Main Page) */}
      <AnimatedFeatureExplainer
        isDark={isDark}
        onOpenReader={() => setShowKindleReader(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenExam={() => setShowChapterExamModal(true)}
        onJumpToSection={handleJumpToSection}
      />

      {/* Reader Scholastic Dashboard (Aesthetic Light Theme with Premium Typography) */}
      <ReaderDashboard
        onOpenReader={() => setShowKindleReader(true)}
        onOpenImmersiveReader={() => setShowImmersiveReader(true)}
        onOpenExam={() => setShowChapterExamModal(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenReflections={() => handleJumpToSection('reflections-section')}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 w-full max-w-[100vw] overflow-x-hidden">
        
        {/* World-Class Glowing Title & Novel Exposition */}
        <NovelPrologueShowcase
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('about-novel')}
          onOpenEBook={() => handleJumpToSection('reader-cabinet')}
          onExploreAuthor={() => handleJumpToSection('author-section')}
        />

        {/* About the Book */}
        <AboutTheBook
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('novel-themes')}
        />

        {/* Themes & Motifs */}
        <NovelThemes
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('protagonist-gallery')}
        />

        {/* Characters Section & Interactive Gallery */}
        <ProtagonistGallery
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('chakdaha-map')}
        />

        {/* Geographical Immersion: Interactive Map of Chakdaha */}
        <ChakdahaInteractiveMap
          isDark={isDark}
          onReadChapter={() => setShowKindleReader(true)}
        />

        {/* Behind the Book */}
        <BehindTheBook
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('book-gallery')}
        />

        {/* The Book Gallery: Visual & Manuscript Showcase */}
        <BookGallery
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('writers-journey')}
        />

        {/* The Writing Journey: Chronological Timeline */}
        <WritersTimeline
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('writers-desk')}
        />

        {/* The Writer's Desk */}
        <WritersDesk
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('beyond-the-shell')}
        />

        {/* Sneak Beyond The Shell */}
        <BeyondTheShell
          isDark={isDark}
          currentUser={currentUser}
          onContinueJourney={() => handleJumpToSection('author-section')}
        />

        {/* About the Author */}
        <AuthorSection
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('press-section')}
        />

        {/* Press & Recognition Section */}
        <PressRecognition
          isDark={isDark}
        />

        {/* Edition Announcement */}
        <EditionAnnouncement
          isDark={isDark}
          onContinueJourney={() => handleJumpToSection('reader-cabinet')}
        />

        {/* Digital Reader Cabinet (219 Pages, Sound, Margin Notes, Concordance) */}
        <ReaderCabinet
          isDark={isDark}
          currentUser={currentUser}
          onAuthTrigger={() => {
            setAuthInitialMode('signin');
            setShowAuthPortal(true);
          }}
        />

        {/* Famous Quotes */}
        <QuoteSharer
          isDark={isDark}
        />

        {/* Community Reader Reflections */}
        <ReaderReflections
          isDark={isDark}
          currentUser={currentUser}
          onOpenAuth={() => handleOpenAuth('signin')}
        />

        {/* Credits & Acknowledgements Section */}
        <SanctuaryCredits
          isDark={isDark}
        />

        {/* Premium Sponsor Scratch-to-Reveal Section */}
        <SponsorScratchSection
          isDark={isDark}
          currentUser={currentUser}
        />
      </main>

      {/* Footer */}
      <Footer
        isDark={isDark}
        onOpenCopyright={() => setShowCopyrightModal(true)}
        onOpenAdmin={() => setShowAdminPWAModal(true)}
      />

      {/* Floating Professional Quick Jump Bar */}
      <QuickJumpBar
        isDark={isDark}
        onJumpToSection={handleJumpToSection}
      />

      {/* 
        ====================================================================
        ROYAL SANCTUARY SLIDE-OVER DRAWER (THREE-DOT MENU ON LEFT)
        Contains ALL sanctuary navigation, reader tools, and system options
        ====================================================================
      */}
      <RoyalMenuDrawer
        isOpen={showMenuDrawer}
        onClose={() => setShowMenuDrawer(false)}
        isDark={isDark}
        user={currentUser}
        onJumpToSection={handleJumpToSection}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenReadingStats={() => setShowReadingStatsModal(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenExam={() => setShowChapterExamModal(true)}
        onOpenFAQ={() => setShowFAQModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenLegal={handleOpenLegal}
        onOpenDeleteAccount={() => setShowDeleteAccountModal(true)}
        onOpenAuth={() => handleOpenAuth('signin')}
        onSignOut={handleSignOut}
        onOpenShare={() => setShowShareModal(true)}
        onOpenPoster={() => setShowPosterModal(true)}
      />

      {/* Frequently Asked Questions (FAQ) Modal */}
      <FAQModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        isDark={isDark}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
      />

      {/* Reader Support & Help Desk Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        isDark={isDark}
        user={currentUser}
      />

      {/* Sanctuary Settings & Audio Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isDark={isDark}
        setIsDark={handleSetIsDark}
        isAmbientLit={isAmbientLit}
        onToggleAmbientLit={handleToggleAmbientLit}
        isAutoNightMode={isAutoNightMode}
        onToggleAutoNightMode={handleToggleAutoNightMode}
      />

      {/* Terms of Service, Privacy Policy & Website Info Modal */}
      <LegalInfoModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        isDark={isDark}
        initialTab={legalTab}
      />

      {/* Delete Account Modal (Email OTP Verification) */}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        isDark={isDark}
        user={currentUser}
        onAccountDeleted={handleAccountDeleted}
      />

      {/* Reader Authentication Portal Modal */}
      <AuthPortal
        isOpen={showAuthPortal}
        initialMode={authInitialMode}
        onClose={() => setShowAuthPortal(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Floating Book Preview Modal */}
      <BookPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        isDark={isDark}
        onOpenSampleChapter={() => setShowSampleModal(true)}
      />

      {/* Dedicated Sample Chapter Reader Modal */}
      <SampleChapterModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        isDark={isDark}
      />

      {/* Discreet Copyright Modal */}
      <CopyrightModal
        isOpen={showCopyrightModal}
        onClose={() => setShowCopyrightModal(false)}
        isDark={isDark}
      />

      {/* Royal Certificate Conferment Modal (Strict 30-Min Threshold) */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        isDark={isDark}
        user={currentUser}
      />

      {/* Seraph AI Literary Guardian & Companion Drawer */}
      <SeraphAssistant
        isOpen={showSeraphModal}
        onClose={() => setShowSeraphModal(false)}
        isDark={isDark}
        onOpenCertificate={() => setShowCertificateModal(true)}
      />
      <WOWAssistant 
        isOpen={showWOWAssistant}
        onClose={() => setShowWOWAssistant(false)}
        isDark={isDark} 
        userName={currentUser?.name || 'Reader'}
        onOpenReader={() => setShowKindleReader(true)}
        onOpenImmersive={() => setShowImmersiveReader(true)}
        onJumpToSection={handleJumpToSection}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenExam={() => setShowChapterExamModal(true)}
        onOpenAdmin={() => setShowAdminPWAModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenAuth={() => handleOpenAuth('signin')}
        onSignOut={handleSignOut}
        onToggleTheme={() => handleSetIsDark(!isDark)}
        onOpenFAQ={() => setShowFAQModal(true)}
        onOpenSupport={() => setShowSupportModal(true)}
      />

      {/* 100% Functional Concordance Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        isDark={isDark}
        onJumpToSection={handleJumpToSection}
      />

      {/* Detailed Reading Sanctuary Analytics & Stats Modal */}
      <ReadingStatsModal
        isOpen={showReadingStatsModal}
        onClose={() => setShowReadingStatsModal(false)}
        isDark={isDark}
        user={currentUser}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenSeraph={() => setShowSeraphModal(true)}
      />

      {/* Reader Mode Selector Modal */}
      <ReaderModeSelectorModal
        isOpen={showReaderModeSelector}
        onClose={() => setShowReaderModeSelector(false)}
        onSelectNormal={() => setShowPreviewModal(true)}
        onSelectInteractive={() => setShowKindleReader(true)}
        onSelectImmersive={() => setShowImmersiveReader(true)}
        isDark={isDark}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenProfile={() => handleOpenAuth('signin')}
        onOpenLibrary={() => {
          setShowReaderModeSelector(false);
          handleJumpToSection('book-cabinet');
        }}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenExam={() => setShowChapterExamModal(true)}
        currentUser={currentUser}
      />

      {/* Kindle Interactive Reader Mode */}
      <KindleInteractiveReader
        isOpen={showKindleReader}
        onClose={() => setShowKindleReader(false)}
        onLaunchImmersive={() => {
          setShowKindleReader(false);
          setShowImmersiveReader(true);
        }}
      />

      {/* Immersive Distraction-Free Reader Mode */}
      <ImmersiveReaderModal
        isOpen={showImmersiveReader}
        onClose={() => setShowImmersiveReader(false)}
      />

      {/* Chapter 1 Textual Scholastic Examination Modal */}
      <ChapterExamModal
        isOpen={showChapterExamModal}
        onClose={() => setShowChapterExamModal(false)}
        isDark={isDark}
        onOpenReader={() => setShowKindleReader(true)}
      />

      {/* Private Mobile-First Administrator Remote Control PWA */}
      <AdminPWAModal
        isOpen={showAdminPWAModal}
        onClose={() => setShowAdminPWAModal(false)}
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth('signin')}
      />

      {/* Share Genuine App Modal */}
      <ShareAppModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        isDark={isDark}
      />

      {/* Official Book Cover Poster Modal */}
      <PosterModal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
      />

      {/* Mandatory Precise Location Guard Barrier Modal */}
      <PreciseLocationBarrier
        isOpen={showLocationBarrier}
        title="Precise Location Required"
        contextAction={locationBarrierContext}
        onClose={() => setShowLocationBarrier(false)}
        onVerified={() => setShowLocationBarrier(false)}
      />
    </div>
  );
}
