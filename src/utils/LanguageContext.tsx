import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'bn' | 'hi';

export interface LanguageOption {
  code: AppLanguage;
  name: string; // Native name
  englishName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' }
];

export function normalizeLanguageCode(input?: string | null): AppLanguage {
  if (!input) return 'en';
  const clean = input.trim().toLowerCase();
  if (clean === 'bn' || clean === 'bangla' || clean === 'bengali' || clean === 'বাংলা') {
    return 'bn';
  }
  if (clean === 'hi' || clean === 'hindi' || clean === 'हिन्दी' || clean === 'हिंदी') {
    return 'hi';
  }
  return 'en';
}

export function languageCodeToLabel(code: AppLanguage): string {
  switch (code) {
    case 'bn':
      return 'বাংলা';
    case 'hi':
      return 'हिन्दी';
    default:
      return 'English';
  }
}

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage | string) => void;
  t: (key: string) => string;
}

const STORAGE_KEY = 'wilting_app_language';

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return normalizeLanguageCode(saved);
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: AppLanguage | string) => {
    const normalized = normalizeLanguageCode(lang);
    setLanguageState(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
      document.documentElement.lang = normalized;
    } catch {}
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {}
  }, [language]);

  const t = (key: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English
    return TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Brand & General
    appTitle: "WILTING OF WORDS",
    appSubtitle: "A poignantly crafted page-by-page digital reading experience exploring voice, survival, and identity of Aratrika.",
    publishedBy: "PUBLISHED BY TECHNODEF PRESS",
    enterWebsite: "ENTER WEBSITE",
    enterSanctuary: "ENTER SANCTUARY",
    home: "Home",
    about: "About",
    contact: "Contact",
    reader: "Reader",
    search: "Search",
    share: "Share",
    voiceAssistant: "Voice Assistant",
    tagline: "“Some voices are silenced in life, but their words live louder than ever.”",
    launchedOn: "Launched on:",
    launchDate: "29th November, 2026",
    
    // Auth & Verification Portal
    welcomeBack: "Welcome Back",
    continueJourney: "CONTINUE YOUR READING JOURNEY",
    createAccount: "Create Your Account",
    beginJourney: "BEGIN YOUR READING JOURNEY",
    signIn: "Sign In",
    signUp: "Sign Up",
    fullName: "Full Name",
    emailAddress: "Email Address",
    password: "Password",
    repeatPassphrase: "Repeat Passphrase",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    orContinueWith: "or continue with",
    googleSignIn: "Google",
    emailOtp: "Email OTP",
    faceId: "Face ID",
    secureAuth: "Secure Authentication",
    privacyProtected: "Privacy Protected",
    instantAccess: "Instant Access",
    editorialArchive: "Editorial Archive",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    help: "Help",
    readReflectBelong: "READ • REFLECT • BELONG",
    sendOtp: "Create Account & Send OTP",
    passwordsMatch: "Passphrases match",
    passwordsDontMatch: "Passphrases do not match",
    saveAndContinue: "Save Passphrase & Continue",

    // Face Biometric Verification Modal
    securityBadge: "SECURITY",
    faceVerificationTitle: "Face Verification",
    faceVerificationSubtitle: "We need to verify your identity to keep your account safe and secure.",
    stepCaptureFace: "Capture Face",
    stepMatch: "Match",
    stepVerify: "Verify",
    stepComplete: "Complete",
    useCamera: "Use Camera",
    takeSelfie: "Take Selfie",
    liveWebcam: "Live Webcam",
    cameraInstructions: "Position your face in the oval and tap Capture",
    cameraTapPrompt: "Tap here to open native Android camera and take a selfie",
    analyzingBiometrics: "Analyzing biometric facial landmarks…",
    guidelineFullFace: "Show your full face",
    guidelineGoodLighting: "Make sure you're in good lighting",
    guidelineNoGlasses: "Remove glasses, hats or masks",
    yourSecurityMatters: "Your Security Matters",
    zeroTrustBadge: "Zero-Trust Identity Protection",
    securityExplainer: "Face verification helps us make sure it’s really you — keeping your account safe and your progress protected.",
    securityPoint1: "Prevents unauthorized access",
    securityPoint2: "Matches your face at sign in",
    securityPoint3: "Works with advanced AI technology",
    privacyHeader: "Your privacy is important",
    privacyText: "Your face data is encrypted and never shared.",
    idVerifiedSuccess: "Identity Verified Successfully",
    
    // Header & Navigation Menu
    masterMenu: "Sanctuary Master Menu",
    profile: "Profile",
    sanctuarySettings: "Sanctuary Preferences",
    authorSupport: "Author & Press Support",
    readingStats: "Reading Sanctuary Goals",
    searchIndex: "Concordance Search Index",
    shareApp: "Share App & Live Link",
    officialPoster: "Official Book Poster",
    claimCertificate: "Claim Certificate",
    seraphAi: "Seraph AI Companion",
    signOut: "Sign Out",
    
    // Settings Modal
    settingsTitle: "Sanctuary Preferences",
    settingsSubtitle: "Personalize your reading comfort, typography, and atmospheric lighting.",
    languageChoice: "Sanctuary Language",
    languageChoiceSubtitle: "Choose your primary language for reading and navigation.",
    paletteTitle: "Sanctuary Color Palette",
    paletteSubtitle: "Toggle between Terracotta Parchment and Royal Midnight Mahogany.",
    royalDark: "Royal Dark",
    parchment: "Parchment",
    autoNightTitle: "Astronomical Auto Night Mode",
    autoNightSubtitle: "Automatically transition themes based on your location's precise sunrise & sunset times.",
    candlelightTitle: "Candlelight Ambient Aura",
    candlelightSubtitle: "Subtle golden candlelight glow across the entire reading viewport.",
    pageTurnSound: "Physical Page Turn Sound",
    typographyTitle: "Sanctuary Typography Style",
    resetCache: "Reset Local Reading Cache",

    // Main Sections
    aboutTheBook: "ABOUT THE BOOK",
    storyAndPhilosophy: "The Story & Philosophy",
    keyCharacters: "Key Characters & Perspectives",
    aboutTheAuthor: "ABOUT THE AUTHOR",
    authorRole: "Author & Literary Scholar",
    readingAnalytics: "Reading Analytics",
    locationVerified: "Satellite Location Verified"
  },

  bn: {
    // Brand & General
    appTitle: "উইল্টিং অফ ওয়ার্ডস",
    appSubtitle: "অরাত্রিকার কণ্ঠ, অস্তিত্ব ও আত্মপরিচয়ের এক মর্মস্পর্শী পৃষ্ঠাভিত্তিক সাহিত্যিক ডিজিটাল পাঠযাত্রা।",
    publishedBy: "টেকনোডেফ প্রেস দ্বারা প্রকাশিত",
    enterWebsite: "ওয়েবসাইটে প্রবেশ করুন",
    enterSanctuary: "সাহিত্য আশ্রমে প্রবেশ করুন",
    home: "মূল পাতা",
    about: "পুস্তক পরিচিতি",
    contact: "যোগাযোগ",
    reader: "ই-রিডার",
    search: "অনুসন্ধান",
    share: "শেয়ার",
    voiceAssistant: "ভয়েস সহকারী",
    tagline: "“কিছু কণ্ঠ জীবনে স্তব্ধ হয়ে যায়, কিন্তু তাদের শব্দগুলো চিরকাল সবচেয়ে উচ্চকণ্ঠে বেঁচে থাকে।”",
    launchedOn: "প্রকাশের তারিখ:",
    launchDate: "২৯ নভেম্বর, ২০২৬",

    // Auth & Verification Portal
    welcomeBack: "স্বাগতম",
    continueJourney: "আপনার সাহিত্য পাঠযাত্রা পুনরায় শুরু করুন",
    createAccount: "নতুন অ্যাকাউন্ট তৈরি করুন",
    beginJourney: "আপনার সাহিত্যিক পাঠযাত্রা শুরু করুন",
    signIn: "সাইন ইন",
    signUp: "সাইন আপ",
    fullName: "পুরো নাম",
    emailAddress: "ইমেল ঠিকানা",
    password: "পাসওয়ার্ড",
    repeatPassphrase: "পাসওয়ার্ড পুনরায় লিখুন",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    resetPassword: "পাসওয়ার্ড রিসেট করুন",
    orContinueWith: "অথবা এর মাধ্যমে প্রবেশ করুন",
    googleSignIn: "গুগল",
    emailOtp: "ইমেল ওটিপি",
    faceId: "ফেস আইডি",
    secureAuth: "সুরক্ষিত প্রমাণীকরণ",
    privacyProtected: "গোপনীয়তা সুরক্ষিত",
    instantAccess: "তাৎক্ষণিক প্রবেশ",
    editorialArchive: "সম্পাদনা আর্কাইভ",
    termsOfService: "ব্যবহারের শর্তাবলী",
    privacyPolicy: "গোপনীয়তা নীতি",
    help: "সাহায্য",
    readReflectBelong: "পঠন • অনুধ্যান • একাত্মতা",
    sendOtp: "অ্যাকাউন্ট তৈরি ও ওটিপি পাঠান",
    passwordsMatch: "উভয় পাসওয়ার্ড মিলে গেছে",
    passwordsDontMatch: "পাসওয়ার্ড মেলেনি",
    saveAndContinue: "পাসওয়ার্ড সংরক্ষণ করে এগিয়ে যান",

    // Face Biometric Verification Modal
    securityBadge: "নিরাপত্তা ও যাচাইকরণ",
    faceVerificationTitle: "মুখমণ্ডল যাচাইকরণ",
    faceVerificationSubtitle: "আপনার অ্যাকাউন্ট ও পাঠ প্রগতির সর্বোচ্চ সুরক্ষার জন্য মুখমণ্ডল বায়োমেট্রিক নিশ্চিতকরণ আবশ্যক।",
    stepCaptureFace: "ছবি তুলুন",
    stepMatch: "মিলকরণ",
    stepVerify: "যাচাইকরণ",
    stepComplete: "সম্পন্ন",
    useCamera: "ক্যামেরা ব্যবহার করুন",
    takeSelfie: "সেলফি তুলুন",
    liveWebcam: "লাইভ ওয়েবক্যাম",
    cameraInstructions: "আপনার মুখ ডিম্বাকৃতির ফ্রেমে রাখুন এবং ক্যাপচার বোতামে চাপুন",
    cameraTapPrompt: "আপনার ফোনের ক্যামেরা খুলে সেলফি তুলতে এখানে স্পর্শ করুন",
    analyzingBiometrics: "বায়োমেট্রিক মুখের গঠন বিশ্লেষণ করা হচ্ছে…",
    guidelineFullFace: "সম্পূর্ণ মুখমণ্ডল স্পষ্টভাবে প্রদর্শন করুন",
    guidelineGoodLighting: "পর্যাপ্ত আলোতে ছবি তুলুন",
    guidelineNoGlasses: "চশমা, টুপি বা মাস্ক খুলে ফেলুন",
    yourSecurityMatters: "আপনার নিরাপত্তা আমাদের অগ্রাধিকার",
    zeroTrustBadge: "জিরো-ট্রাস্ট পরিচয় সুরক্ষা",
    securityExplainer: "ফেস ভেরিফিকেশন নিশ্চিত করে যে এটি সত্যিই আপনি — যা আপনার অ্যাকাউন্টের সম্পূর্ণ নিরাপত্তা ও প্রগতি রক্ষা করে।",
    securityPoint1: "অননুমোদিত প্রবেশ সম্পূর্ণরূপে প্রতিরোধ করে",
    securityPoint2: "সাইন ইনের সময় মুখ মিলিয়ে তাৎক্ষণিক অনুমতি দেয়",
    securityPoint3: "অত্যাধুনিক কৃত্রিম বুদ্ধিমত্তা প্রযুক্তি দ্বারা পরিচালিত",
    privacyHeader: "আপনার গোপনীয়তা সুরক্ষিত",
    privacyText: "আপনার বায়োমেট্রিক তথ্য এনক্রিপ্ট করা থাকে এবং কখনোই কারো সাথে ভাগ করা হয় না।",
    idVerifiedSuccess: "পরিচয় সফলভাবে যাচাইকৃত হয়েছে",

    // Header & Navigation Menu
    masterMenu: "সানকচুয়ারি প্রধান মেনু",
    profile: "প্রোফাইল",
    sanctuarySettings: "আশ্রম সেটিংস",
    authorSupport: "লেখক ও প্রেস সহায়তা",
    readingStats: "পঠন লক্ষ্য ও বিশ্লেষণ",
    searchIndex: "শব্দকোষ অনুসন্ধান সূচী",
    shareApp: "অ্যাপ লিঙ্ক ও শেয়ার করুন",
    officialPoster: "অফিসিয়াল বইয়ের পোস্টার",
    claimCertificate: "সনদপত্র সংগ্রহ করুন",
    seraphAi: "সেরাফ এআই সঙ্গী",
    signOut: "সাইন আউট",

    // Settings Modal
    settingsTitle: "সানকচুয়ারি পছন্দসমূহ",
    settingsSubtitle: "আপনার পঠন স্বাচ্ছন্দ্য, টাইপোগ্রাফি এবং আলোর বিন্যাস পরিবর্তন করুন।",
    languageChoice: "অ্যাপের ভাষা",
    languageChoiceSubtitle: "পঠন এবং নেভিগেশনের জন্য আপনার পছন্দের ভাষা নির্বাচন করুন।",
    paletteTitle: "রঙের থিম প্যালেট",
    paletteSubtitle: "টেরাকোটা পার্চমেন্ট এবং মধ্যরাত্রির রয়েল ডার্কের মধ্যে পরিবর্তন করুন।",
    royalDark: "রয়েল ডার্ক",
    parchment: "পার্চমেন্ট",
    autoNightTitle: "জ্যোতির্বৈজ্ঞানিক অটো নাইট মোড",
    autoNightSubtitle: "আপনার অবস্থানের সূর্যোদয় ও সূর্যাস্তের সঠিক সময় অনুযায়ী থিম স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।",
    candlelightTitle: "প্রদীপের স্নিগ্ধ আলো",
    candlelightSubtitle: "পুরো পঠন ক্ষেত্রে মৃদু সোনালী প্রদীপের দ্যুতি।",
    pageTurnSound: "বাস্তব পাতার শব্দ",
    typographyTitle: "ফন্ট স্টাইল",
    resetCache: "লোকাল ক্যাশ রিসেট করুন",

    // Main Sections
    aboutTheBook: "পুস্তক পরিচিতি",
    storyAndPhilosophy: "গল্প ও দর্শন",
    keyCharacters: "মূল চরিত্র ও দৃষ্টিকোণ",
    aboutTheAuthor: "লেখক পরিচিতি",
    authorRole: "লেখক ও সাহিত্য গবেষক",
    readingAnalytics: "পঠন বিশ্লেষণ",
    locationVerified: "স্যাটেলাইট অবস্থান যাচাইকৃত"
  },

  hi: {
    // Brand & General
    appTitle: "विल्टिंग ऑफ वर्ड्स",
    appSubtitle: "अरात्रिका की आवाज़, संघर्ष और पहचान की मार्मिक पृष्ठ-दर-पृष्ठ डिजिटल पठन यात्रा।",
    publishedBy: "टेक्नोडेफ प्रेस द्वारा प्रकाशित",
    enterWebsite: "वेबसाइट में प्रवेश करें",
    enterSanctuary: "साहित्य कुंज में प्रवेश करें",
    home: "होम",
    about: "पुस्तक परिचय",
    contact: "संपर्क",
    reader: "ई-रीडर",
    search: "खोजें",
    share: "शेयर करें",
    voiceAssistant: "वॉइस सहायक",
    tagline: "“कुछ आवाज़ें ज़िंदगी में खामोश हो जाती हैं, लेकिन उनके शब्द पहले से भी अधिक गूँजते हैं।”",
    launchedOn: "विमोचन तिथि:",
    launchDate: "२९ नवंबर, २०२६",

    // Auth & Verification Portal
    welcomeBack: "वापसी पर स्वागत है",
    continueJourney: "अपनी पठन यात्रा जारी रखें",
    createAccount: "नया खाता बनाएं",
    beginJourney: "अपनी साहित्यिक पठन यात्रा शुरू करें",
    signIn: "साइन इन",
    signUp: "साइन अप",
    fullName: "पूरा नाम",
    emailAddress: "ईमेल पता",
    password: "पासवर्ड",
    repeatPassphrase: "पासवर्ड पुनः दर्ज करें",
    forgotPassword: "पासवर्ड भूल गए?",
    resetPassword: "पासवर्ड रीसेट करें",
    orContinueWith: "या इसके माध्यम से जारी रखें",
    googleSignIn: "गूगल",
    emailOtp: "ईमेल ओटीपी",
    faceId: "फेस आईडी",
    secureAuth: "सुरक्षित प्रमाणीकरण",
    privacyProtected: "गोपनीयता सुरक्षित",
    instantAccess: "त्वरित प्रवेश",
    editorialArchive: "संपादकीय पुरालेख",
    termsOfService: "सेवा की शर्तें",
    privacyPolicy: "गोपनीयता नीति",
    help: "सहायता",
    readReflectBelong: "पढ़ें • विचारें • जुड़ें",
    sendOtp: "खाता बनाएं और ओटीपी भेजें",
    passwordsMatch: "पासवर्ड मेल खाते हैं",
    passwordsDontMatch: "पासवर्ड मेल नहीं खाते",
    saveAndContinue: "पासवर्ड सुरक्षित कर आगे बढ़ें",

    // Face Biometric Verification Modal
    securityBadge: "सुरक्षा एवं सत्यापन",
    faceVerificationTitle: "चेहरा सत्यापन",
    faceVerificationSubtitle: "आपके खाते और पठन प्रगति की पूर्ण सुरक्षा सुनिश्चित करने के लिए पहचान सत्यापन आवश्यक है।",
    stepCaptureFace: "फोटो लें",
    stepMatch: "मिलान",
    stepVerify: "सत्यापन",
    stepComplete: "पूर्ण",
    useCamera: "कैमरा खोलें",
    takeSelfie: "सेल्फी लें",
    liveWebcam: "लाइव वेबकैम",
    cameraInstructions: "अपना चेहरा अंडाकार फ्रेम में रखें और कैप्चर पर टैप करें",
    cameraTapPrompt: "फ़ोन का कैमरा खोलने और सेल्फी लेने के लिए यहाँ टैप करें",
    analyzingBiometrics: "चेहरे की बायोमेट्रिक संरचना का विश्लेषण किया जा रहा है…",
    guidelineFullFace: "अपना पूरा चेहरा स्पष्ट दिखाएं",
    guidelineGoodLighting: "पर्याप्त रोशनी में फोटो लें",
    guidelineNoGlasses: "चश्मा, टोपी या मास्क हटा दें",
    yourSecurityMatters: "आपकी सुरक्षा सर्वोपरि है",
    zeroTrustBadge: "ज़ीरो-ट्रस्ट पहचान सुरक्षा",
    securityExplainer: "फेस वेरिफिकेशन यह सुनिश्चित करता है कि यह वास्तव में आप ही हैं — जिससे आपका खाता और प्रगति सुरक्षित रहती है।",
    securityPoint1: "अनधिकृत प्रवेश को पूरी तरह रोकता है",
    securityPoint2: "साइन इन करते समय तुरंत चेहरे का मिलान करता है",
    securityPoint3: "उन्नत एआई तकनीक द्वारा संचालित",
    privacyHeader: "आपकी गोपनीयता सुरक्षित है",
    privacyText: "आपका बायोमेट्रिक डेटा एन्क्रिप्टेड है और कभी साझा नहीं किया जाता।",
    idVerifiedSuccess: "पहचान सफलतापूर्वक सत्यापित हुई",

    // Header & Navigation Menu
    masterMenu: "मुख्य मेनू",
    profile: "प्रोफाइल",
    sanctuarySettings: "साहित्य कुंज सेटिंग्स",
    authorSupport: "लेखक एवं प्रेस सहायता",
    readingStats: "पठन लक्ष्य एवं आँकड़े",
    searchIndex: "शब्दकोश अनुक्रमणिका",
    shareApp: "ऐप लिंक और शेयर करें",
    officialPoster: "आधिकारिक पुस्तक पोस्टर",
    claimCertificate: "प्रमाणपत्र प्राप्त करें",
    seraphAi: "सेराफ एआई साथी",
    signOut: "साइन आउट",

    // Settings Modal
    settingsTitle: "साहित्य कुंज प्राथमिकताएं",
    settingsSubtitle: "अपनी पठन सुविधा, टाइपोग्राफी और वातावरण के अनुसार अनुकूलित करें।",
    languageChoice: "ऐप की भाषा",
    languageChoiceSubtitle: "पठन और नेविगेशन के लिए अपनी प्राथमिक भाषा चुनें।",
    paletteTitle: "रंग पैलेट",
    paletteSubtitle: "टेराकोटा चर्मपत्र और मध्यरात्रि रॉयल डार्क के बीच बदलें।",
    royalDark: "रॉयल डार्क",
    parchment: "चर्मपत्र",
    autoNightTitle: "खगोलीय ऑटो नाइट मोड",
    autoNightSubtitle: "आपके स्थान के सूर्योदय और सूर्यास्त के सटीक समय अनुसार थीम स्वतः बदल जाएगी।",
    candlelightTitle: "मोमबत्ती की स्वर्णिम आभा",
    candlelightSubtitle: "पठन क्षेत्र में सुखद स्वर्णिम मोमबत्ती का प्रकाश।",
    pageTurnSound: "पृष्ठ पलटने की ध्वनि",
    typographyTitle: "फ़ॉन्ट शैली",
    resetCache: "रीडिंग कैश रीसेट करें",

    // Main Sections
    aboutTheBook: "पुस्तक परिचय",
    storyAndPhilosophy: "कथा और दर्शन",
    keyCharacters: "प्रमुख पात्र एवं दृष्टिकोण",
    aboutTheAuthor: "लेखक परिचय",
    authorRole: "लेखक एवं साहित्य शोधकर्ता",
    readingAnalytics: "पठन विश्लेषण",
    locationVerified: "सैटेलाइट स्थान सत्यापित"
  }
};
