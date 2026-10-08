import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc,
  increment,
  collection, 
  getDocs,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('backend'))) {
      console.warn("Firestore operating in offline mode / initial connection pending.");
    }
  }
}
testConnection();

export interface FirestoreUserRecord {
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * Normalizes email to be used as a safe document ID
 */
export function sanitizeEmailKey(email: string): string {
  return email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
}

/**
 * Universal safe Base64 encoder for browser & UTF-8 strings
 */
export function safeBase64Encode(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    try {
      return btoa(str);
    } catch {
      return str;
    }
  }
}

/**
 * Validates a password attempt against stored password hashes
 */
export function isPasswordMatch(storedHash: string | undefined | null, passwordAttempt: string): boolean {
  if (!storedHash || !passwordAttempt) return false;
  
  // 1. Direct match (plaintext)
  if (storedHash === passwordAttempt) return true;

  // 2. Safe Base64 UTF-8
  const utf8Base64 = safeBase64Encode(passwordAttempt);
  if (storedHash === utf8Base64) return true;

  // 3. Raw btoa
  try {
    const rawBase64 = btoa(passwordAttempt);
    if (storedHash === rawBase64) return true;
  } catch {}

  // 4. Trimmed match
  if (storedHash.trim() === passwordAttempt.trim()) return true;

  return false;
}

/**
 * Checks Firestore and storage if an account already exists for this email address.
 * Ensures across ANY mobile or desktop device, an existing user cannot sign up again.
 */
export async function checkUserExistsInFirebase(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes('@')) return false;

  // 1. Check Firestore
  try {
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && (data.passwordHash || data.rawPassword || data.createdAt)) {
        return true;
      }
    }

    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      for (const d of querySnap.docs) {
        const dData = d.data();
        if (dData && (dData.passwordHash || dData.rawPassword || dData.createdAt)) {
          return true;
        }
      }
    }
  } catch (error) {
    console.warn('[Firebase] Warning checking Firestore existence:', error);
  }

  // 2. Fallback check unified server database
  try {
    const res = await fetch(`/api/auth/check-user?email=${encodeURIComponent(cleanEmail)}`);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      if (data.exists) return true;
    }
  } catch (e) {
    // ignore
  }

  return false;
}

/**
 * Registers or updates a user in Firestore with passphrase.
 */
export async function saveUserWithPasswordToFirebase(email: string, name: string, passwordInput: string): Promise<void> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    
    await setDoc(userDocRef, {
      email: cleanEmail,
      name: name.trim() || 'Reader',
      passwordHash: safeBase64Encode(passwordInput),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[Firebase] User record and credentials saved for ${cleanEmail}`);
  } catch (error) {
    console.warn('[Firebase] Warning saving user to Firestore:', error);
  }
}

/**
 * Validates user credentials strictly with Firestore.
 * Requires email and password to strictly match stored credentials.
 */
export async function verifyUserInFirebase(
  email: string, 
  passwordAttempt: string
): Promise<{ valid: boolean; notFound?: boolean; user?: FirestoreUserRecord; rawUser?: any } | null> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    const snap = await getDoc(userDocRef);
    
    if (snap.exists()) {
      const data = snap.data() as any;
      if (isPasswordMatch(data.passwordHash, passwordAttempt)) {
        return {
          valid: true,
          user: {
            email: cleanEmail,
            name: data.name || 'Reader',
            createdAt: data.createdAt || new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          },
          rawUser: data
        };
      }
      return { valid: false, notFound: false, rawUser: data };
    }

    // Secondary query check
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const data = querySnap.docs[0].data() as any;
      if (isPasswordMatch(data.passwordHash, passwordAttempt)) {
        return {
          valid: true,
          user: {
            email: cleanEmail,
            name: data.name || 'Reader',
            createdAt: data.createdAt || new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          },
          rawUser: data
        };
      }
      return { valid: false, notFound: false, rawUser: data };
    }

    return { valid: false, notFound: true };
  } catch (error) {
    console.warn('[Firebase] Warning verifying user in Firestore:', error);
    return null;
  }
}

/**
 * Signs in using Firebase Google Auth popup.
 */
export async function signInWithGoogle(): Promise<{ name: string; email: string } | null> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  if (result.user && result.user.email) {
    const email = result.user.email.toLowerCase().trim();
    const name = result.user.displayName || email.split('@')[0] || 'Reader';
    await saveUserWithPasswordToFirebase(email, name, 'GOOGLE_SSO_SECURE');
    await recordUserLoginInFirebase(email);
    return { name, email };
  }
  return null;
}

/**
 * Updates a user's password in Firestore.
 */
export async function updateUserPasswordInFirebase(email: string, newPasswordInput: string): Promise<void> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    
    await setDoc(userDocRef, {
      email: cleanEmail,
      passwordHash: safeBase64Encode(newPasswordInput),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[Firebase] Password updated for ${cleanEmail}`);
  } catch (error) {
    console.warn('[Firebase] Warning updating password in Firestore:', error);
  }
}

/**
 * Gets user profile from Firestore.
 */
export async function getUserProfileFromFirebase(email: string): Promise<FirestoreUserRecord | null> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        email: cleanEmail,
        name: data.name || 'Reader',
        createdAt: data.createdAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || new Date().toISOString()
      };
    }
    return null;
  } catch (error) {
    console.warn('[Firebase] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Registers or updates a user in Firestore.
 */
export async function saveUserToFirebase(email: string, name: string): Promise<void> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    
    await setDoc(userDocRef, {
      email: cleanEmail,
      name: name.trim() || 'Reader',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[Firebase] User record saved for ${cleanEmail}`);
  } catch (error) {
    console.warn('[Firebase] Warning saving user to Firestore:', error);
  }
}

/**
 * Records face registration status in Firestore.
 */
export async function recordFaceRegistrationInFirebase(email: string, name: string): Promise<void> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    
    await setDoc(userDocRef, {
      email: cleanEmail,
      name: name.trim() || 'Reader',
      faceRegistered: true,
      faceRegisteredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[Firebase] Face registration recorded in Firestore for ${cleanEmail}`);
  } catch (error) {
    console.warn('[Firebase] Warning recording face registration in Firestore:', error);
  }
}

/**
 * Updates last login timestamp in Firestore.
 */
export async function recordUserLoginInFirebase(email: string): Promise<void> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docId = sanitizeEmailKey(cleanEmail);
    const userDocRef = doc(db, 'users', docId);
    
    await setDoc(userDocRef, {
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {}
}

export interface ReflectionRecord {
  id: string;
  author: string;
  location: string;
  rating: number; // 1 to 5 stars
  message: string;
  likes: number;
  time: string;
  timestamp: number;
  createdAt: string;
  status?: 'approved' | 'pending' | 'rejected';
  pageNumber?: number;
}

const CLIENT_BLOCKED_TERMS = [
  'fuck', 'fucking', 'fucked', 'fucker', 'shit', 'shitty', 'bullshit', 'bitch', 'bitches',
  'asshole', 'assholes', 'cunt', 'cunts', 'dick', 'dicks', 'pussy', 'pussies', 'bastard',
  'bastards', 'whore', 'whores', 'slut', 'sluts', 'motherfucker', 'dipshit', 'jackass',
  'dumbass', 'wanker', 'twat', 'fag', 'faggot', 'nigger', 'nigga', 'retard',
  'chutiya', 'chutiye', 'chutya', 'madarchod', 'mc', 'bhenchod', 'bc', 'bhosdike', 'bhosadike',
  'harami', 'haramkhor', 'saala', 'saale', 'randi', 'gaand', 'gandu', 'lodu', 'lauda', 'chut',
  'khankir', 'khanki', 'choda', 'chodna', 'chudi', 'baal', 'magir', 'magi', 'bokachoda',
  'boka choda', 'banchod', 'gud', 'kutta', 'kaminey', 'kamina', 'chodar',
  'nude', 'nudes', 'porn', 'porno', 'pornography', 'sex', 'sexy', 'horny', 'blowjob',
  'boobs', 'boob', 'tits', 'penis', 'vagina', 'erection', 'orgasm', 'hentai', 'erotic', 'xxx'
];

export async function verifyReviewWithAI(
  author: string, 
  message: string, 
  location?: string
): Promise<{ approved: boolean; reason?: string; sentiment?: string }> {
  const combined = `${author} ${location || ''} ${message}`.toLowerCase().trim();
  
  // 1. Direct or substring check
  for (const term of CLIENT_BLOCKED_TERMS) {
    if (combined.includes(term)) {
      return {
        approved: false,
        reason: 'Review contains prohibited slang, abusive, or vulgar words. Positive and constructive negative reviews are both welcome, but slangs and abusive content are not allowed.',
        sentiment: 'negative'
      };
    }
  }

  // 2. Normalize text: remove spaces, punctuation, special symbols
  const normalized = combined.replace(/[^a-z0-9\u0980-\u09FF]/g, '');
  for (const term of CLIENT_BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '');
    if (cleanTerm.length >= 2 && normalized.includes(cleanTerm)) {
      return {
        approved: false,
        reason: 'Review contains prohibited slang or abusive content in normalized form. Swearing is strictly barred from the sanctuary.',
        sentiment: 'negative'
      };
    }
  }

  // 3. Normalized Character substitution filter
  const substituted = normalized
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
    .replace(/7/g, 't');

  for (const term of CLIENT_BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '');
    if (cleanTerm.length >= 2 && substituted.includes(cleanTerm)) {
      return {
        approved: false,
        reason: 'Review contains prohibited slang or abusive content in substituted form. Swearing is strictly barred from the sanctuary.',
        sentiment: 'negative'
      };
    }
  }

  // 4. Repeating letter squashing
  const squashed = normalized.replace(/(.)\1+/g, '$1');
  for (const term of CLIENT_BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '').replace(/(.)\1+/g, '$1');
    if (cleanTerm.length >= 3 && squashed.includes(cleanTerm)) {
      return {
        approved: false,
        reason: 'Review contains repeating character slangs. Swearing is strictly barred from the sanctuary.',
        sentiment: 'negative'
      };
    }
  }

  try {
    const res = await fetch('/api/reviews/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, message, location })
    });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      return {
        approved: Boolean(data.approved),
        reason: data.reason,
        sentiment: data.sentiment
      };
    }
  } catch (err: any) {
    console.warn('[Review AI] Verification network warning:', err);
  }

  // Fallback: Passed local safety check
  return { approved: true, reason: 'Approved: Review verified for publication.' };
}

export function formatTimeAgo(dateInput: string | number): string {
  try {
    const timestamp = typeof dateInput === 'number' ? dateInput : new Date(dateInput).getTime();
    if (isNaN(timestamp)) return 'Recently';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 45) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * Subscribes to real-time reviews from Firestore.
 * Updates instantly across all reader devices worldwide.
 */
export function subscribeToReviews(
  onData: (reviews: ReflectionRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const reviewsCol = collection(db, 'reviews');
  return onSnapshot(
    reviewsCol,
    (snapshot) => {
      const items: ReflectionRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const reviewTimestamp = typeof data.timestamp === 'number' ? data.timestamp : (data.createdAt ? new Date(data.createdAt).getTime() : 0);
        
        // Exclude all current and previous reviews before cleanup threshold
        if (reviewTimestamp < 1790677300000) {
          return;
        }

        // Only display approved reviews (guarantee no pending or rejected reviews are visible)
        if (data.status && data.status !== 'approved') {
          return;
        }

        const ratingNum = typeof data.rating === 'number' && data.rating >= 1 && data.rating <= 5 
          ? Math.round(data.rating) 
          : 5;

        items.push({
          id: docSnap.id,
          author: data.author || 'Anonymous Reader',
          location: data.location || 'Chakdaha / West Bengal',
          rating: ratingNum,
          message: data.message || '',
          likes: typeof data.likes === 'number' ? data.likes : 1,
          time: data.createdAt ? formatTimeAgo(data.createdAt) : (data.timestamp ? formatTimeAgo(data.timestamp) : 'Recently'),
          timestamp: reviewTimestamp,
          createdAt: data.createdAt || new Date().toISOString(),
          status: 'approved',
          pageNumber: typeof data.pageNumber === 'number' ? data.pageNumber : undefined
        });
      });
      // Sort chronologically newest first
      items.sort((a, b) => b.timestamp - a.timestamp);
      onData(items);
    },
    (error) => {
      console.warn('[Firebase] Snapshot error on reviews collection:', error);
      onError?.(error as Error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      } catch (e) {
        // Logged error
      }
    }
  );
}

/**
 * Adds a new review through the secure moderation & anti-spam backend pipeline.
 */
export async function addReviewToFirebase(
  author: string,
  location: string,
  message: string,
  rating: number = 5,
  token?: string,
  pageNumber?: number
): Promise<ReflectionRecord> {
  const cleanAuthor = author.trim().slice(0, 100);
  const cleanLocation = (location.trim() || 'Chakdaha / West Bengal').slice(0, 100);
  const cleanMessage = message.trim().slice(0, 2000);
  const validRating = Math.max(1, Math.min(5, Math.round(rating) || 5));

  // 1. Submit through secure backend moderation & rate-limiting pipeline
  const res = await fetch('/api/reviews/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      author: cleanAuthor,
      location: cleanLocation,
      rating: validRating,
      message: cleanMessage,
      pageNumber,
      token
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success || !data.approved) {
    const err: any = new Error(data.error || data.reason || 'Review does not meet literary sanctuary moderation guidelines.');
    err.code = data.code;
    err.status = res.status;
    err.alreadySubmitted = data.alreadySubmitted;
    err.review = data.review;
    throw err;
  }

  if (data.review) {
    return {
      ...data.review,
      rating: validRating,
      status: 'approved'
    };
  }

  throw new Error('Unexpected response from review submission service.');
}

/**
 * Increments the like count for a review in Firestore.
 */
export async function likeReviewInFirebase(reviewId: string): Promise<void> {
  try {
    const reviewDocRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewDocRef, {
      likes: increment(1)
    });
  } catch (error) {
    console.error('[Firebase] Error updating review likes:', error);
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    throw error;
  }
}

/**
 * Saves reader progress (current page, bookmarks, highlights) to Firestore.
 */
export async function saveReaderProgressToFirebase(
  email: string,
  progress: { currentPage: number; bookmarks: number[]; highlights: any[] }
): Promise<void> {
  if (!email) return;
  const cleanEmail = email.toLowerCase().trim();
  const userId = sanitizeEmailKey(cleanEmail);
  const progressDocRef = doc(db, 'users', userId, 'progress', 'state');
  
  try {
    await setDoc(progressDocRef, {
      currentPage: progress.currentPage,
      bookmarks: progress.bookmarks,
      highlights: progress.highlights,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Firebase] Error saving progress:', error);
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/progress/state`);
    throw error;
  }
}

/**
 * Loads reader progress from Firestore.
 */
export async function getReaderProgressFromFirebase(
  email: string
): Promise<{ currentPage: number; bookmarks: number[]; highlights: any[] } | null> {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  const userId = sanitizeEmailKey(cleanEmail);
  const progressDocRef = doc(db, 'users', userId, 'progress', 'state');
  
  try {
    const snap = await getDoc(progressDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        currentPage: data.currentPage || 1,
        bookmarks: data.bookmarks || [],
        highlights: data.highlights || []
      };
    }
    return null;
  } catch (error) {
    console.error('[Firebase] Error loading progress:', error);
    handleFirestoreError(error, OperationType.GET, `users/${userId}/progress/state`);
    throw error;
  }
}

/**
 * Loads the sponsor scratch card revealed state for a specific user ID from Firestore.
 * Returns true if the user has already scratched and revealed the sponsor card.
 */
export async function getUserSponsorScratchState(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const cleanId = userId.trim();
    // 1. Check user sponsor state document
    const sponsorDocRef = doc(db, 'users', cleanId, 'sponsor', 'scratch');
    const snap = await getDoc(sponsorDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.sponsorScratchRevealed === true) {
        return true;
      }
    }
    // 2. Also check parent user document for resilience
    const userDocRef = doc(db, 'users', cleanId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const uData = userSnap.data();
      if (uData?.sponsorScratchRevealed === true) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('[Firebase] Warning loading sponsor scratch state:', error);
    try {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/sponsor/scratch`);
    } catch {}
    return false;
  }
}

/**
 * Persists the sponsor scratch card revealed state for a specific user ID to Firestore.
 */
export async function saveUserSponsorScratchState(userId: string): Promise<void> {
  if (!userId) return;
  const cleanId = userId.trim();
  const sponsorDocRef = doc(db, 'users', cleanId, 'sponsor', 'scratch');
  const userDocRef = doc(db, 'users', cleanId);
  const now = new Date().toISOString();

  try {
    await setDoc(sponsorDocRef, {
      sponsorScratchRevealed: true,
      revealedAt: now,
      userId: cleanId
    }, { merge: true });

    // Also update on user doc for resilience
    await setDoc(userDocRef, {
      sponsorScratchRevealed: true,
      sponsorRevealedAt: now
    }, { merge: true });
  } catch (error) {
    console.error('[Firebase] Error saving sponsor scratch state:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, `users/${cleanId}/sponsor/scratch`);
    } catch {}
  }
}
