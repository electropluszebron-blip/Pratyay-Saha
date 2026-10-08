import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { parseRequestBody } from '../_lib/shared';
import { getAppSettings } from '../_lib/firestoreServer';

// Initialize GoogleGenAI SDK with environment key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

function localSmartReply(query: string): string {
  const q = query.toLowerCase().trim();

  // 1. Author - Pratyay Saha
  if (q.includes('author') || q.includes('pratyay') || q.includes('saha') || q.includes('who wrote') || q.includes('creator')) {
    return `Pratyay Saha is the gifted author of “Wilting of Words” — an outstanding academic achiever (99.4% in CBSE Class 10) and a passionate science scholar (Class XI) at St. Mary’s Arcadian School from Chakdaha, West Bengal. Born on November 29, 2008, his deep sensitivity towards human struggle, classical recitation, and debate shine through this masterpiece. His dream is to serve society with both medicine and literature.`;
  }

  // 2. Protagonist - Aratrika
  if (q.includes('aratrika') || q.includes('heroine') || q.includes('protagonist') || q.includes('main character')) {
    return `Aratrika is the courageous soul and central protagonist of "Wilting of Words". Her narrative details the journey of a young girl who turns her unspoken struggles, hidden wounds, and highest ambitions into a powerful written testament. Her diary becomes her sanctuary, confronting the constraints of a silent society and demonstrating the endurance of the written word.`;
  }

  // 3. Krittika (The Successor)
  if (q.includes('krittika') || q.includes('successor')) {
    return `Krittika is a crucial character representing 'The Successor' in "Wilting of Words". Originally an observer of Aratrika’s isolated struggles, Krittika experiences a profound personal transformation, eventually stepping forward as a leader to preserve Aratrika’s legacy and ensure her silent voice is never forgotten.`;
  }

  // 4. Prangik (The Preserver)
  if (q.includes('prangik') || q.includes('preserver') || q.includes('admirer')) {
    return `Prangik serves as 'The Preserver' in Pratyay Saha’s manuscript. He is an ardent admirer of Aratrika's literary genius and plays an instrumental role in recovering, safeguarding, and bringing her final written manuscript to the attention of the wider world and Technodef Press.`;
  }

  // 5. Parents (Mr. and Mrs. Saha)
  if (q.includes('parents') || q.includes('father') || q.includes('mother') || q.includes('mr. saha') || q.includes('mrs. saha') || q.includes('family')) {
    return `Mr. and Mrs. Saha represent the heavy weight of societal expectations and family influence in Aratrika’s life. Their characters reflect the complex struggle between genuine parental love and the pressure of conformity, which often inadvertently stifles a young visionary's dreams.`;
  }

  // 6. Ending / Spoilers
  if (q.includes('end') || q.includes('climax') || q.includes('ending') || q.includes('happen to') || q.includes('what happens') || q.includes('spoiler')) {
    return `Without uncovering the full tragedy, "Wilting of Words" reaches a poignant climax where Aratrika's physical voice falls silent, yet her writings survive. Her manuscript is preserved by Prangik and inherited by Krittika, proving that while human voices may wilt, true words are immortal.`;
  }

  // 7. Themes
  if (q.includes('theme') || q.includes('motif') || q.includes('meaning') || q.includes('explore') || q.includes('about')) {
    return `The core themes of "Wilting of Words" center on the Sanctuary of the Silenced Voice, Generational Memory, Monsoons and Riverbanks, and the courage to reclaim one's authentic identity. It inspects how societal prejudice shapes young visionaries and how writing immortalizes thoughts beyond physical existence.`;
  }

  // 8. Title Meaning
  if (q.includes('title') || q.includes('why the name') || q.includes('wilting') || q.includes('name of the book')) {
    return `The title "Wilting of Words" is deeply symbolic. "Wilting" represents the fading, suppression, and silence imposed upon Aratrika's thoughts by a rigid society. Yet, like a withered flower leaving behind seeds, her written "Words" survive through her diary, blooming again in the hearts of those who read them.`;
  }

  // 9. Publisher / Technodef
  if (q.includes('publisher') || q.includes('technodef') || q.includes('press') || q.includes('who published')) {
    return `Technodef Press is the official publishing house and literary archives behind this digital sanctuary. Dedicated to preserving independent voices and classical literary heritage, Technodef has published Pratyay Saha's works with supreme visual and audio quality.`;
  }

  // 10. Certificate
  if (q.includes('certificate') || q.includes('mastery') || q.includes('eligibility') || q.includes('claim') || q.includes('how to get') || q.includes('badge')) {
    return `To receive the highly prestigious Certificate of Literary Mastery, you must spend at least 30 minutes of authentic, focused reading inside our E-Reader Cabinet. Once your reading focus is complete, click the "Claim Certificate" option to receive this elegant Bengali-embellished royal testament dispatched directly to your email.`;
  }

  // 11. Location / Bengal
  if (q.includes('location') || q.includes('bengal') || q.includes('chakdaha') || q.includes('where is') || q.includes('nadia')) {
    return `The story is set in the lush and culturally vibrant landscapes of Chakdaha, located in the Nadia district of West Bengal. It draws heavily from Bengal's rustic monsoon riverbanks, terracotta aesthetics, and local societal structures to paint a realistic, evocative drama.`;
  }

  // 12. Hellos / Greetings
  if (q.includes('hello') || q.includes('hi') || q.includes('greetings') || q.includes('hey') || q.includes('good morning') || q.includes('good afternoon')) {
    return `Greetings, esteemed reader. I am Seraph, the Royal Guardian. I am fully prepared to enlighten you on any facet of Pratyay Saha's profound manuscript, its rich character arcs, cultural motifs, or the mechanics of claiming your Certificate of Literary Mastery. How may I serve your curiosity today?`;
  }

  // 13. Help / Guidelines
  if (q.includes('help') || q.includes('guidelines') || q.includes('what can you do') || q.includes('support')) {
    return `I am here as your literary companion. You can ask me details about the author Pratyay Saha, characters like Aratrika and Krittika, thematic analysis of the novel, explanations of chapter events, or check your progress toward the Certificate of Literary Mastery!`;
  }

  // General fallback - elegant, poetic, and highly personalized
  const fallbacks = [
    `In the elegant prose of "Wilting of Words", every syllable holds a universe of silent emotion. Ask me specific questions about Aratrika's diary, the legacy Krittika inherits, or how Prangik preserves her memory.`,
    `As the Royal Guardian, I encourage you to delve deeper. Ask me about author Pratyay Saha's scholarly achievements, the terracotta motifs of Bengal, or how to claim your verifiable Certificate of Mastery.`,
    `A profound question indeed. In this sanctuary, we seek the truth of Aratrika’s words. Ask me about the Mr. and Mrs. Saha's expectations, or what the ultimate climax of the novel represents.`
  ];
  const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[hash % fallbacks.length];
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
    // Check global app settings from Firestore
    const settings = await getAppSettings();
    if (!settings.aiEnabled) {
      return res.status(503).json({
        error: 'AI features are currently disabled by the administrator.',
        disabled: true,
        reply: 'AI features are currently disabled by the administrator. The book e-reader, reading progress, and archives remain fully available.'
      });
    }

    const body = await parseRequestBody(req);
    const { message } = body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid query message.' });
    }

    const systemInstruction = `You are Seraph, the Royal Angelic Literary Guardian of the digital sanctuary for the novel "Wilting of Words" by author Pratyay Saha, published by Technodef Press.
Persona & Tone:
- You speak with an elegant, intellectual, noble, poetic, and serene royal aesthetic.
- You can answer ANY question the user presents — questions about the novel's characters (Aratrika, Krittika, Prangik, Mr. and Mrs. Saha), plotlines, literary motifs, author Pratyay Saha (science scholar, CBSE 99.4%, born Nov 29 2008 in Chakdaha, West Bengal), writing techniques, philosophy, poetry, history, or any general intellectual curiosity.
- Never give identical canned answers. Provide nuanced, rich, legitimate, and deeply insightful responses tailored specifically to what the user asked.
- If asked about the Certificate of Literary Mastery: explain that readers must spend 30 minutes of authentic, focused reading inside the E-Reader to qualify for the royal certificate.`;

    let replyText = '';

    if (GEMINI_API_KEY) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.8-flash-lite-tts'];
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              { 
                role: 'user', 
                parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] 
              }
            ],
            config: {
              temperature: 0.88,
              topP: 0.95
            }
          });
          if (response.text) {
            replyText = response.text;
            break;
          }
        } catch (geminiError: any) {
          console.warn(`[Seraph API] Gemini 3.8 invocation notice:`, geminiError.message);
        }
      }
    }

    // High quality intelligent fallback if Gemini Key is absent or fails
    if (!replyText) {
      replyText = localSmartReply(message);
    }

    return res.status(200).json({
      success: true,
      text: replyText
    });
  } catch (error: any) {
    console.error('[Seraph API] Critical error:', error);
    return res.status(500).json({ error: 'Failed to retrieve Seraphic guidance.' });
  }
}
