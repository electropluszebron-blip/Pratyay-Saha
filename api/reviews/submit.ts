import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { parseRequestBody } from '../_lib/shared';
import { verifySessionToken } from '../_lib/biometricService';
import { firestoreRestRequest, objectToFirestoreFields, getUserReview } from '../_lib/firestoreServer';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Detects Unicode emojis and pictographs.
 * Matches all standard Unicode Emoji, Pictographic, and Symbol ranges.
 */
export function containsEmoji(text: string): boolean {
  const emojiRegex = /[\p{Extended_Pictographic}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
  return emojiRegex.test(text);
}

/**
 * Detects text-based emoticons (e.g. :), :D, <3, T_T, xD, etc.).
 * Includes ASCII, kaomoji, and symbol-based emoticons.
 */
export function containsEmoticon(text: string): boolean {
  const emoticonPatterns = [
    /(?<!\d)[:;=8B]-?[)D(\]\[|pPoO](?!\d)/,
    /(?<!\d)[:;=]-?3(?!\d)/,
    /(?<![a-zA-Z0-9])[:;=][cCsS](?![a-zA-Z0-9])/,
    /\b[xX]-?[dD]\b/,
    /<3|<\/3|[♡♥]/,
    /-_-|T_T|T-T|T\.T|Q_Q|Q\.Q|\^_+\^|\^-\^|\^\.\^|\^\^/,
    /o_O|O_o|o_o|O_O|o\.O|O\.o|OwO|UwU|owo|uwu/,
    />[:;=-]?[()]/
  ];
  return emoticonPatterns.some(pattern => pattern.test(text));
}

// Prohibited terms for instant local pre-verification (English, Bengali, Hindi, Hinglish)
const BLOCKED_TERMS = [
  // English vulgarities / slangs
  'fuck', 'fucking', 'fucked', 'fucker', 'shit', 'shitty', 'bullshit', 'bitch', 'bitches',
  'asshole', 'assholes', 'cunt', 'cunts', 'dick', 'dicks', 'pussy', 'pussies', 'bastard',
  'bastards', 'whore', 'whores', 'slut', 'sluts', 'motherfucker', 'dipshit', 'jackass',
  'dumbass', 'wanker', 'twat', 'fag', 'faggot', 'nigger', 'nigga', 'retard',
  // Indian / Bengali / Hindi vulgarities / slangs
  'chutiya', 'chutiye', 'chutya', 'madarchod', 'mc', 'bhenchod', 'bc', 'bhosdike', 'bhosadike',
  'harami', 'haramkhor', 'saala', 'saale', 'randi', 'gaand', 'gandu', 'lodu', 'lauda', 'chut',
  'khankir', 'khanki', 'choda', 'chodna', 'chudi', 'baal', 'magir', 'magi', 'bokachoda',
  'boka choda', 'banchod', 'gud', 'kutta', 'kaminey', 'kamina', 'chodar',
  // Sexual / NSFW terms
  'nude', 'nudes', 'porn', 'porno', 'pornography', 'sex', 'sexy', 'horny', 'blowjob',
  'boobs', 'boob', 'tits', 'penis', 'vagina', 'erection', 'orgasm', 'hentai', 'erotic', 'xxx',
  // Threat / Abusive violence markers
  'kill yourself', 'kys', 'go die', 'die in a fire', 'hope you die', 'cut your',
  // Manipulative scam / spam markers
  'free crypto', 't.me/', 'telegram:', 'whatsapp:', 'wa.me/', 'cash app', 'dm me on',
  'click here to win', 'bit.ly/', 'tinyurl.com/', 'invest now', 'make money fast'
];

/**
 * Pre-checks for disguised slangs, vulgarities, and repetitive automated patterns
 */
function localRuleCheck(text: string): { approved: boolean; reason?: string } {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Length & word count checks
  if (trimmed.length < 10) {
    return {
      approved: false,
      reason: 'Review is too short. Please share at least 10 characters describing your authentic reflection or critique.'
    };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 3) {
    return {
      approved: false,
      reason: 'Please share at least 3 words describing your impressions, thoughts, or suggestions.'
    };
  }

  // 2. Disallow promotional links and external URLs
  const urlRegex = /(https?:\/\/|www\.|\.com\/|\.org\/|\.io\/|\.net\/|t\.me\/|wa\.me\/|bit\.ly\/)/i;
  if (urlRegex.test(trimmed)) {
    return {
      approved: false,
      reason: 'Promotional links, commercial advertisements, and external URLs are strictly forbidden in reader reviews.'
    };
  }

  // 3. Detect repetitive characters (e.g. "aaaaaaa", "!!!!!!!", "........")
  const repeatCharRegex = /(.)\1{4,}/;
  if (repeatCharRegex.test(trimmed)) {
    return {
      approved: false,
      reason: 'Excessive repeating characters detected. Please write your reflection using natural words.'
    };
  }

  // 4. Direct slang/profanity substring check
  for (const term of BLOCKED_TERMS) {
    if (lower.includes(term)) {
      return {
        approved: false,
        reason: 'Review contains prohibited slang, abusive, or vulgar phrasing. Constructive negative critiques and positive impressions are both welcome, but profanity and slangs are strictly barred.'
      };
    }
  }

  // 5. Normalized character & leetspeak check (blocks "f u c k", "b o k a c h o d a", "sh!t", "b!tch")
  const normalized = lower.replace(/[^a-z0-9\u0980-\u09FF]/g, '');
  const substituted = normalized
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/\$/g, 's')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b');

  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '');
    if (cleanTerm.length >= 3 && (normalized.includes(cleanTerm) || substituted.includes(cleanTerm))) {
      return {
        approved: false,
        reason: 'Review contains disguised profanity or abusive slang. Please maintain respectful sanctuary language.'
      };
    }
  }

  // 6. Squashed repeated letters check (blocks "fuuuuck", "shiiiit")
  const squashed = normalized.replace(/(.)\1+/g, '$1');
  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '').replace(/(.)\1+/g, '$1');
    if (cleanTerm.length >= 3 && squashed.includes(cleanTerm)) {
      return {
        approved: false,
        reason: 'Review contains disguised profanity with repeated letters. Please write using respectful language.'
      };
    }
  }

  return { approved: true };
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const { author, location, rating, message, pageNumber, token } = body || {};

    // ------------------------------------------------------------------------
    // STEP 1: AUTHENTICATED USER VERIFICATION
    // ------------------------------------------------------------------------
    const authHeader = req.headers.authorization || '';
    const sessionToken = token || authHeader.replace(/^Bearer\s+/i, '');

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        code: 'unauthenticated',
        error: 'Authentication Required: You must be signed in with a verified reader account to publish a reflection.'
      });
    }

    const sessionResult = verifySessionToken(sessionToken);
    if (!sessionResult.valid || !sessionResult.user) {
      return res.status(401).json({
        success: false,
        code: 'unauthenticated',
        error: 'Authentication Expired: Please sign in again to verify your reader identity.'
      });
    }

    const userEmail = sessionResult.user.email.toLowerCase().trim();
    const userUid = sessionResult.user.uid || `usr_${userEmail.replace(/[^a-z0-9]/g, '_')}`;
    const userName = (author && typeof author === 'string' && author.trim()) || sessionResult.user.name || 'Verified Reader';

    // ------------------------------------------------------------------------
    // STEP 2: ONE REVIEW PER USER RESTRICTION (CHECK BACKEND DATABASE)
    // ------------------------------------------------------------------------
    const existingReview = await getUserReview(userEmail, userUid);
    const cleanMessage = typeof message === 'string' ? message.trim() : '';
    const numRating = Number(rating);

    if (existingReview) {
      // Situation 4: Successful submission with lost response -> a retry must recognize the existing submission
      const existingText = (existingReview.message || '').trim();
      const existingRating = Number(existingReview.rating);

      if (existingText === cleanMessage && (isNaN(numRating) || existingRating === numRating)) {
        return res.status(200).json({
          success: true,
          approved: true,
          alreadySubmitted: true,
          review: {
            id: existingReview.id,
            author: existingReview.author || userName,
            location: existingReview.location || 'Chakdaha / West Bengal',
            rating: existingRating || 5,
            message: existingText,
            likes: existingReview.likes || 1,
            time: 'Engraved in Registry',
            createdAt: existingReview.createdAt || new Date().toISOString()
          },
          message: 'Your review has already been received and engraved into the permanent sanctuary registry.'
        });
      }

      // Situation 2: Already submitted review -> reject because the user already has a review
      return res.status(409).json({
        success: false,
        code: 'already_reviewed',
        error: 'You have already submitted your review for this novel. Each verified reader account is permitted exactly one permanent reflection.'
      });
    }

    // ------------------------------------------------------------------------
    // STEP 3: VALIDATE REVIEW INPUT
    // ------------------------------------------------------------------------
    if (!numRating || !Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        code: 'invalid_rating',
        error: 'Mandatory Star Rating: Please select an interactive rating from 1 to 5 stars before submitting.'
      });
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      return res.status(400).json({
        success: false,
        code: 'invalid_message',
        error: 'Review is too short. Please share at least 10 characters describing your authentic reflection or critique.'
      });
    }

    if (cleanMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        code: 'invalid_message',
        error: 'Review exceeds the 2,000 character sanctuary maximum limit.'
      });
    }

    const cleanLocation = typeof location === 'string' && location.trim()
      ? location.trim().slice(0, 100)
      : 'Chakdaha / West Bengal';

    // ------------------------------------------------------------------------
    // STEP 4: STRICT NO EMOJIS OR EMOTICONS ENFORCEMENT
    // ------------------------------------------------------------------------
    const fullTextToCheck = `${cleanMessage} ${cleanLocation}`;

    if (containsEmoji(fullTextToCheck) || containsEmoticon(fullTextToCheck)) {
      return res.status(400).json({
        success: false,
        code: 'emoji_prohibited',
        error: 'Emojis and emoticons are strictly prohibited in literary reviews. Please remove all emojis and emoticons (e.g. 😊, :), <3, etc.) and use text only.'
      });
    }

    // ------------------------------------------------------------------------
    // STEP 5: PRE-MODERATION (DISGUISE & VULGARITY CHECK)
    // ------------------------------------------------------------------------
    const preCheckResult = localRuleCheck(cleanMessage);
    if (!preCheckResult.approved) {
      return res.status(400).json({
        success: false,
        code: 'content_violation',
        error: preCheckResult.reason || 'Content Violation: Review contains prohibited slang, profanity, or abusive language.'
      });
    }

    // ------------------------------------------------------------------------
    // STEP 6: AI MODERATION USING GEMINI 3.8 FLASH
    // ------------------------------------------------------------------------
    if (GEMINI_API_KEY) {
      const prompt = `You are the Authoritative Literary Review Verification Guardian for the novel "Wilting of Words" by Pratyay Saha.
Examine this reader review submission carefully:

Reader: "${userName}"
Location: "${cleanLocation}"
Star Rating: ${numRating} out of 5 stars
Review Text: "${cleanMessage}"

MANDATORY RULES AND POLICIES:

1. ALLOW LEGITIMATE CRITICISM AND OPINIONS:
   - DO NOT reject a review simply because it is negative, critical, or expresses dissatisfaction!
   - Legitimate positive opinions, critical opinions, constructive criticism, suggestions, and genuine feedback MUST BE APPROVED (approved: true).
   - Examples of VALID CRITIQUES that MUST BE APPROVED:
     * "I didn't like the pacing in Chapter 2, felt too slow and dragged on. 2 stars." (APPROVED: legitimate critique)
     * "The ending was too tragic and depressing for my taste, wished Aratrika fought back more. 1 star." (APPROVED: honest negative opinion)
     * "Suggestions: dialogue felt slightly stiff in parts, but the themes were strong. 3 stars." (APPROVED: constructive feedback)
     * "Beautiful and poetic writing, loved the imagery. 5 stars." (APPROVED: positive feedback)

2. STRICT PROHIBITED CONTENT (REJECT WITH approved: false):
   - Slang or vulgar slang
   - Profanity or swear words (in English, Bengali, Hindi, Hinglish, or any language)
   - Abusive or insulting language, personal attacks, bullying
   - Offensive or discriminatory language, slurs
   - Hate speech
   - Sexually explicit, suggestive, erotic, or sexualized content
   - Obscene content
   - Harassment or threats
   - Spam or meaningless automated spam
   - Advertising or promotional content, external links, social media promotions
   - ANY emojis or emoticons (e.g. smileys, hearts, ASCII emoticons)

3. DISGUISE DETECTION:
   - You must detect and REJECT attempts to disguise prohibited content using:
     * Spaces (e.g. "f u c k")
     * Punctuation or symbols (e.g. "f*ck", "s.h.i.t", "b!tch")
     * Numbers (e.g. "b1tch", "chut1ya", "sh1t")
     * Altered spellings, phonetic misspellings (e.g. "fuk", "phuck", "btch")
     * Character substitutions or unusual capitalization (e.g. "FuCk", "bOkaChOdA")

Output JSON only matching this schema:
{
  "approved": boolean,
  "reason": string
}
If approved is true, set reason to "Approved: Review meets sanctuary literary standards."
If approved is false, explain the specific violation clearly and politely.`;

      let aiApproved = false;
      let aiReason = '';
      let technicalFailure = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !aiApproved && !technicalFailure) {
        attempts++;
        try {
          const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: 'application/json'
            }
          });

          if (response && response.text) {
            const parsed = JSON.parse(response.text);
            aiApproved = Boolean(parsed.approved);
            aiReason = parsed.reason || '';
            break;
          }
        } catch (geminiErr: any) {
          console.warn(`[AI Moderation] Gemini 3.8 Flash attempt ${attempts} warning:`, geminiErr.message);
          if (attempts >= maxAttempts) {
            technicalFailure = true;
          } else {
            await new Promise(r => setTimeout(r, 800 * attempts));
          }
        }
      }

      // Situation 3: Network/API/AI timeout or technical failure -> do NOT classify as prohibited!
      if (technicalFailure) {
        return res.status(503).json({
          success: false,
          code: 'technical_failure',
          error: 'The AI moderation system temporarily experienced technical latency. Your review was not rejected. Please tap Retry to resubmit.'
        });
      }

      // Situation 1: Content violation -> reject the review
      if (!aiApproved) {
        return res.status(400).json({
          success: false,
          code: 'content_violation',
          error: aiReason || 'Content Violation: Your review contains prohibited slang, profanity, or inappropriate content.'
        });
      }
    }

    // ------------------------------------------------------------------------
    // STEP 7: SAVE EXACTLY ONE REVIEW (IDEMPOTENT FIRESTORE STORAGE)
    // ------------------------------------------------------------------------
    const safeUidKey = (userUid || userEmail).replace(/[^a-zA-Z0-9_-]/g, '_');
    const docId = `rev_user_${safeUidKey}`;
    const now = Date.now();
    const createdAt = new Date().toISOString();

    const reviewDocData: Record<string, any> = {
      author: userName,
      location: cleanLocation,
      rating: numRating,
      message: cleanMessage,
      status: 'approved',
      likes: 1,
      timestamp: now,
      createdAt,
      userId: userUid,
      userEmail: userEmail
    };

    if (typeof pageNumber === 'number' && pageNumber >= 1 && pageNumber <= 219) {
      reviewDocData.pageNumber = pageNumber;
    }

    const fields = objectToFirestoreFields(reviewDocData);
    await firestoreRestRequest('PATCH', `reviews/${docId}`, { fields });

    // ------------------------------------------------------------------------
    // STEP 8: PUBLISH / DISPLAY ONLY AFTER SUCCESSFUL VALIDATION
    // ------------------------------------------------------------------------
    return res.status(200).json({
      success: true,
      approved: true,
      review: {
        id: docId,
        ...reviewDocData,
        time: 'Just now'
      }
    });

  } catch (error: any) {
    console.error('[Review Submit] Fatal pipeline error:', error);
    return res.status(500).json({
      success: false,
      code: 'server_error',
      error: 'An unexpected technical issue occurred while connecting to the sanctuary registry. Please retry in a few moments.'
    });
  }
}
