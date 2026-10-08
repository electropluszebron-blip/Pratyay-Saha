import { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { getAppSettings } from '../_lib/firestoreServer';

const ai = new GoogleGenAI();

export interface ServerWordDefinition {
  word: string;
  phonetic: string;
  pos: string;
  definition: string;
  example: string;
  synonyms: string[];
  translations: {
    bengali: string;
  };
}

// Memory Cache for Backend Lookups
const SERVER_LEXICON_CACHE: Record<string, ServerWordDefinition> = {};

// Circuit Breaker State to bypass Gemini API calls if rate limits are encountered
let isGeminiRateLimited = false;
let rateLimitResetTime = 0;

export default async function dictionaryLookupHandler(req: Request, res: Response) {
  try {
    const rawWord = (req.query.word as string) || (req.body && req.body.word as string) || '';
    const cleanWord = rawWord.trim().toLowerCase().replace(/[^a-zA-Z'-]/g, '');

    if (!cleanWord) {
      return res.status(400).json({ error: 'Word parameter is required' });
    }

    // Return from server cache if available (< 5ms)
    if (SERVER_LEXICON_CACHE[cleanWord]) {
      return res.status(200).json(SERVER_LEXICON_CACHE[cleanWord]);
    }

    // 1. Fast Sub-Second Concurrent Dictionary & Bengali Meaning (< 250ms)
    try {
      const [dictPromise, bnPromise] = [
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`),
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(cleanWord)}`)
      ];

      const [dictRes, bnRes] = await Promise.all([
        dictPromise.catch(() => null),
        bnPromise.catch(() => null)
      ]);

      let definition = '';
      let pos = 'Word';
      let phonetic = `/${cleanWord}/`;
      let example = `Featured in the manuscript of Wilting of Words.`;
      let synonyms: string[] = ['expression', 'nuance'];
      let bengaliTranslation = '';

      if (dictRes && dictRes.ok) {
        const dictData = await dictRes.json().catch(() => null);
        if (Array.isArray(dictData) && dictData.length > 0) {
          const entry = dictData[0];
          if (entry.phonetic) phonetic = entry.phonetic;
          else if (entry.phonetics && entry.phonetics.length > 0) {
            phonetic = entry.phonetics.find((p: any) => p.text)?.text || phonetic;
          }

          if (entry.meanings && entry.meanings.length > 0) {
            const m = entry.meanings[0];
            if (m.partOfSpeech) pos = capitalize(m.partOfSpeech);
            if (m.definitions && m.definitions.length > 0) {
              definition = m.definitions[0].definition || '';
              if (m.definitions[0].example) example = m.definitions[0].example;
            }
            if (m.synonyms && m.synonyms.length > 0) {
              synonyms = m.synonyms.slice(0, 4);
            }
          }
        }
      }

      if (bnRes && bnRes.ok) {
        const bnData = await bnRes.json().catch(() => null);
        if (bnData && bnData[0] && bnData[0][0]) {
          bengaliTranslation = bnData[0][0][0] || '';
        }
      }

      if (definition) {
        const fastResult: ServerWordDefinition = {
          word: cleanWord,
          phonetic,
          pos,
          definition,
          example,
          synonyms,
          translations: {
            bengali: bengaliTranslation || capitalize(cleanWord)
          }
        };

        SERVER_LEXICON_CACHE[cleanWord] = fastResult;
        return res.status(200).json(fastResult);
      }
    } catch (fastErr) {
      console.warn('[Fast Dictionary Notice]:', fastErr);
    }

    // Check if Circuit Breaker is active
    const now = Date.now();
    let allowGemini = true;

    // Check global app settings from Firestore
    const settings = await getAppSettings();
    if (!settings.aiEnabled) {
      allowGemini = false;
    }

    if (isGeminiRateLimited) {
      if (now < rateLimitResetTime) {
        allowGemini = false;
      } else {
        isGeminiRateLimited = false;
      }
    }

    // Attempt Gemini 3.8 AI Dictionary Generation
    if (allowGemini) {
      try {
        const prompt = `You are a professional dictionary database and literary etymology expert for the novel "Wilting of Words".
Look up the English word: "${cleanWord}".
Generate accurate, concise, authentic Oxford-grade dictionary information.
Provide translation in Bengali (বাংলা) suited for a literary companion.
CRITICAL CONSTRAINT: Strictly DO NOT provide any Hindi meaning under any circumstances. Exclusively English definitions with Bengali literary translation.

Provide the response in the exact JSON format matching the schema.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                phonetic: { type: Type.STRING, description: 'Phonetic pronunciation (e.g. /əˈbaʊt/)' },
                pos: { type: Type.STRING, description: 'Part of speech (e.g. Noun, Verb, Adjective, Adverb)' },
                definition: { type: Type.STRING, description: 'Clear dictionary definition in English' },
                example: { type: Type.STRING, description: 'A realistic example sentence using the word' },
                synonyms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of 2 to 4 synonyms'
                },
                translations: {
                  type: Type.OBJECT,
                  properties: {
                    bengali: { type: Type.STRING, description: 'Meaning and translation of the word in Bengali (e.g. "সম্পর্কে")' }
                  },
                  required: ['bengali']
                }
              },
              required: ['word', 'phonetic', 'pos', 'definition', 'example', 'synonyms', 'translations']
            },
            temperature: 0.1
          }
        });

        const data = JSON.parse(response.text?.trim() || '{}');
        if (data && data.translations && data.translations.bengali) {
          const result: ServerWordDefinition = {
            word: data.word || cleanWord,
            phonetic: data.phonetic || `/${cleanWord}/`,
            pos: data.pos || 'Word',
            definition: data.definition || `The word '${cleanWord}' in literary context.`,
            example: data.example || `Used in Chapter 1 manuscript.`,
            synonyms: data.synonyms || ['term'],
            translations: {
              bengali: data.translations.bengali
            }
          };

          // Cache & return
          SERVER_LEXICON_CACHE[cleanWord] = result;
          return res.status(200).json(result);
        }
      } catch (err: any) {
        console.warn(`[Lexicon Notice] Transitioned to local high-speed fallback mode.`);
        const errMsg = err?.message || '';
        if (err?.status === 429 || errMsg.includes('quota') || errMsg.includes('Quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
          isGeminiRateLimited = true;
          rateLimitResetTime = Date.now() + 15 * 60 * 1000;
        }
      }
    }

    // Fast Concurrent Dictionary + Bengali Translation (< 300ms)
    try {
      const [dictPromise, bnPromise] = [
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`),
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(cleanWord)}`)
      ];

      const [dictRes, bnRes] = await Promise.all([
        dictPromise.catch(() => null),
        bnPromise.catch(() => null)
      ]);

      let definition = '';
      let pos = 'Word';
      let phonetic = `/${cleanWord}/`;
      let example = `Featured in the manuscript of Wilting of Words.`;
      let synonyms: string[] = ['expression', 'nuance'];
      let bengaliTranslation = '';

      if (dictRes && dictRes.ok) {
        const dictData = await dictRes.json().catch(() => null);
        if (Array.isArray(dictData) && dictData.length > 0) {
          const entry = dictData[0];
          if (entry.phonetic) phonetic = entry.phonetic;
          else if (entry.phonetics && entry.phonetics.length > 0) {
            phonetic = entry.phonetics.find((p: any) => p.text)?.text || phonetic;
          }

          if (entry.meanings && entry.meanings.length > 0) {
            const m = entry.meanings[0];
            if (m.partOfSpeech) pos = capitalize(m.partOfSpeech);
            if (m.definitions && m.definitions.length > 0) {
              definition = m.definitions[0].definition || '';
              if (m.definitions[0].example) example = m.definitions[0].example;
            }
            if (m.synonyms && m.synonyms.length > 0) {
              synonyms = m.synonyms.slice(0, 4);
            }
          }
        }
      }

      if (bnRes && bnRes.ok) {
        const bnData = await bnRes.json().catch(() => null);
        if (bnData && bnData[0] && bnData[0][0]) {
          bengaliTranslation = bnData[0][0][0] || '';
        }
      }

      if (definition) {
        const fastResult: ServerWordDefinition = {
          word: cleanWord,
          phonetic,
          pos,
          definition,
          example,
          synonyms,
          translations: {
            bengali: bengaliTranslation || capitalize(cleanWord)
          }
        };

        SERVER_LEXICON_CACHE[cleanWord] = fastResult;
        return res.status(200).json(fastResult);
      }
    } catch (fastErr) {
      console.warn('[Fast Dictionary Error, falling back to Gemini]:', fastErr);
    }

  } catch (err: any) {
    console.error('[Server Dictionary Error]:', err);
    return res.status(500).json({ error: 'Failed to process dictionary lookup' });
  }
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
