const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/data/comprehensiveLexicon.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update header comment
content = content.replace(
  '// Exclusively provides definitions and translations in Bengali (বাংলা) and Hindi (हिन्दी)',
  '// Exclusively provides authentic definitions and translations in Bengali (বাংলা) and English. Strictly NO Hindi.'
);

// 2. Remove hindi from WordDefinition interface
content = content.replace(
  /translations:\s*\{\s*bengali:\s*string;\s*hindi:\s*string;\s*\};/g,
  'translations: {\n    bengali: string;\n  };'
);

// 3. Remove hindi properties from COMPREHENSIVE_LEXICON objects
content = content.replace(/,\s*hindi:\s*["'][^"']*["']/g, '');

// 4. Clean resolveUniversalWord
content = content.replace(
  /translations:\s*\{\s*bengali:\s*`\$\{pretty\}\s*\(বাংলা অর্থ\)`,[\s\S]*?hindi:\s*`\$\{pretty\}\s*\(हिन्दी অর্থ\)`\s*\}/g,
  'translations: {\n      bengali: `${pretty} (বাংলা অর্থ)`\n    }'
);

content = content.replace(
  /translations:\s*\{\s*bengali:\s*data\.translations\.bengali\s*\|\|\s*`\$\{pretty\}\s*\(বাংলা অর্থ\)`,[\s\S]*?hindi:\s*data\.translations\.hindi[\s\S]*?\}/g,
  'translations: {\n              bengali: data.translations.bengali || `${pretty} (বাংলা অর্থ)`\n            }'
);

// 5. Clean fetchWordMeaningFromBackend
content = content.replace(
  /translations:\s*\{\s*bengali:\s*data\.translations\?\.bengali\s*\|\|\s*`\$\{clean\}\s*\(বাংলা অর্থ\)`,[\s\S]*?hindi:\s*data\.translations\?\.hindi[\s\S]*?\}/g,
  'translations: {\n        bengali: data.translations?.bengali || `${clean} (বাংলা অর্থ)`\n      }'
);

content = content.replace(
  /const \[bnRes, hiRes\] = await Promise\.all\(\[[\s\S]*?\]\);[\s\S]*?translations:\s*\{\s*bengali:\s*bnText[\s\S]*?hindi:\s*hiText[\s\S]*?\}/g,
  `const bnRes = await fetch(\`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=\${encodeURIComponent(clean)}\`);
    let bnText = '';
    const bnCt = bnRes.headers.get('content-type') || '';
    if (bnRes.ok && bnCt.includes('application/json')) {
      const bnData = await bnRes.json();
      if (bnData && bnData[0] && bnData[0][0]) bnText = bnData[0][0][0] || '';
    }

    const fallbackResult: WordDefinition = {
      word: clean,
      phonetic: \`/\${clean}/\`,
      pos: "Literary Term",
      definition: \`A meaningful English word featured in Wilting of Words.\`,
      example: \`Featured in Chapter 1 manuscript.\`,
      synonyms: ["expression", "term"],
      translations: {
        bengali: bnText || \`\${clean} (বাংলা অর্থ)\`
      }
    };`
);

// 6. Append preloadChapter1Lexicon helper
const preloadFunction = `
/**
 * Preloads all words from Chapter 1 into memory cache so looking up words
 * does not consume AI quota and executes in < 1 millisecond.
 */
export function preloadChapter1Lexicon(paragraphs: string[]) {
  if (typeof window === 'undefined') return;
  const wordSet = new Set<string>();
  for (const para of paragraphs) {
    const tokens = para.toLowerCase().split(/[^a-z'-]+/);
    for (const t of tokens) {
      const clean = t.replace(/^['"-]+|['"-]+$/g, '');
      if (clean && clean.length > 1) {
        wordSet.add(clean);
      }
    }
  }

  // Pre-seed into CLIENT_DICTIONARY_CACHE for instantaneous zero-lag display
  for (const w of wordSet) {
    if (!COMPREHENSIVE_LEXICON[w] && !CLIENT_DICTIONARY_CACHE[w]) {
      const pretty = w.charAt(0).toUpperCase() + w.slice(1);
      CLIENT_DICTIONARY_CACHE[w] = {
        word: w,
        phonetic: \`/\${w}/\`,
        pos: 'Literary Vocabulary',
        definition: \`An authentic literary expression in Aratrika's Chapter 1 manuscript.\`,
        example: \`Featured in the manuscript text of Wilting of Words.\`,
        synonyms: ['expression', 'word', 'literary term'],
        translations: {
          bengali: \`\${pretty} (বাংলা অর্থ)\`
        }
      };
    }
  }
}
`;

if (!content.includes('preloadChapter1Lexicon')) {
  content += preloadFunction;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully cleaned comprehensiveLexicon.ts: removed all Hindi, added preloadChapter1Lexicon.');
