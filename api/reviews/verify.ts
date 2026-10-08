import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { parseRequestBody } from '../_lib/shared';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Forbidden slang, profanity, sexual terms, and abusive markers across English, Hindi, Bengali
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
  // Manipulative scam markers
  'free crypto', 't.me/', 'telegram:', 'whatsapp:', 'wa.me/', 'cash app', 'dm me on',
  'click here to win', 'bit.ly/', 'tinyurl.com/', 'invest now', 'make money fast'
];

function localRuleCheck(text: string): { approved: boolean; reason?: string } {
  const lower = text.toLowerCase().trim();
  
  // 1. Direct or substring check
  for (const term of BLOCKED_TERMS) {
    if (lower.includes(term)) {
      return {
        approved: false,
        reason: 'Review contains prohibited slang, abusive, or inappropriate words. Constructive negative critiques and positive impressions are both welcome, but vulgarity, slangs, sexual content, and abuse are strictly barred.'
      };
    }
  }

  // 2. Normalize text: remove spaces, punctuation, special symbols
  // This blocks spaced-out bypasses like "f u c k" or "b o k a c h o d a"
  const normalized = lower.replace(/[^a-z0-9\u0980-\u09FF]/g, ''); // includes Bengali characters \u0980-\u09FF
  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '');
    if (cleanTerm.length >= 2 && normalized.includes(cleanTerm)) {
      return {
        approved: false,
        reason: 'Review contains prohibited slang or abusive content in normalized form. Constructive reviews are welcome, but vulgarity is strictly barred.'
      };
    }
  }

  // 3. Normalized Character substitution filter
  // Map common leetspeak substitutions to standard characters
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

  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '');
    if (cleanTerm.length >= 2 && substituted.includes(cleanTerm)) {
      return {
        approved: false,
        reason: 'Review contains prohibited slang or abusive content in substituted form. Constructive reviews are welcome, but vulgarity is strictly barred.'
      };
    }
  }

  // 4. Repeating letter squashing (blocks "fuuuuck", "shiiiiiit")
  const squashed = normalized.replace(/(.)\1+/g, '$1');
  for (const term of BLOCKED_TERMS) {
    const cleanTerm = term.replace(/[^a-z0-9\u0980-\u09FF]/g, '').replace(/(.)\1+/g, '$1');
    if (cleanTerm.length >= 3 && squashed.includes(cleanTerm)) {
      return {
        approved: false,
        reason: 'Review contains repeating character slangs. Constructive reviews are welcome, but vulgarity is strictly barred.'
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS' || req.method === 'GET') {
    return res.status(200).json({ success: true, ready: true });
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ success: true, ready: true });
  }

  try {
    const body = await parseRequestBody(req);
    const { author, message, location } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ 
        approved: false, 
        reason: 'Review message cannot be empty.' 
      });
    }

    const cleanAuthor = typeof author === 'string' ? author.trim() : 'Reader';
    const cleanMessage = message.trim();
    const cleanLocation = typeof location === 'string' ? location.trim() : '';
    const fullTextToCheck = `${cleanAuthor} ${cleanLocation} ${cleanMessage}`;

    // 1. Fast, zero-tolerance local safety check
    const localResult = localRuleCheck(fullTextToCheck);
    if (!localResult.approved) {
      return res.status(200).json({
        approved: false,
        reason: localResult.reason,
        sentiment: 'negative'
      });
    }

    // 2. High-Fidelity Gemini AI Verification
    if (GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const prompt = `You are Seraph AI, the Review Verification & Moderation Guardian for the novel "Wilting of Words" by Pratyay Saha.
Inspect this reader review submission:
Author Name: "${cleanAuthor}"
Review Text: "${cleanMessage}"

CRITICAL VERIFICATION POLICIES:
1. NEGATIVE REVIEWS ARE COMPLETELY ALLOWED:
   - Critical opinions, dislike of the plot, characters, tragedy, pacing, or literary choices MUST BE APPROVED.
   - Example allowed: "I didn't like how Aratrika gave up, the pacing in chapter 3 felt slow, 2 stars." (APPROVED: Constructive/negative critique)
   - Example allowed: "Too sad and depressing for my taste, not what I wanted." (APPROVED: Honest negative feedback)

2. POSITIVE REVIEWS ARE COMPLETELY ALLOWED:
   - Praise, emotional touch, philosophical appreciation, love for characters. (APPROVED)

3. FORBIDDEN CONTENT (MUST BE REJECTED WITH approved=false):
   - Slangs, vulgarities, swear words, cuss words, or profanities in ANY language (English, Hindi, Bengali, Hinglish, etc.).
   - Abusive attacks, harassment, personal insults, bullying, hate speech, or derogatory slurs.
   - Sexually explicit, suggestive, erotic, NSFW, or pornographic content.
   - Harsh, degrading, toxic, or excessively cruel personal malice.
   - Manipulative content: phishing, spam links, commercial advertising, scams, or misleading tricks.

Output ONLY a valid JSON object matching this schema:
{
  "approved": boolean,
  "reason": string,
  "sentiment": "positive" | "negative" | "neutral"
}
If approved is false, provide a polite explanation explaining why (e.g. "Contains abusive language or slang which is barred from the sanctuary. Honest positive or negative critiques are welcome without abusive or vulgar phrasing.").`;

        let response;
        const models = ['gemini-3.8-flash'];
        for (const m of models) {
          try {
            response = await ai.models.generateContent({
              model: m,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                responseMimeType: 'application/json'
              }
            });
            break;
          } catch (modelErr) {
            console.warn(`[Review Verify] Model ${m} failed, trying next...`);
          }
        }
        if (!response) {
          throw new Error('All review verification models failed.');
        }

        const rawText = response.text || '';
        try {
          const parsed = JSON.parse(rawText);
          return res.status(200).json({
            approved: Boolean(parsed.approved),
            reason: parsed.reason || (parsed.approved ? 'Review verified by Seraph AI.' : 'Review does not meet community sanctuary guidelines.'),
            sentiment: parsed.sentiment || 'neutral'
          });
        } catch (parseErr) {
          console.warn('[Review Verify] JSON parse fallback from Gemini:', rawText);
        }
      } catch (geminiError: any) {
        console.error('[Review Verify] Gemini API error, falling back to local heuristic checks:', geminiError.message);
      }
    }

    // 3. Fallback: Passed local heuristic checks
    return res.status(200).json({
      approved: true,
      reason: 'Review meets community standards.',
      sentiment: 'neutral'
    });

  } catch (error: any) {
    console.error('[Review Verify] Error handling review:', error);
    return res.status(500).json({ 
      approved: false, 
      reason: 'Internal verification service error. Please try again.' 
    });
  }
}
