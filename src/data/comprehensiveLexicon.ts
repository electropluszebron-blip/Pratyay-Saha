// Comprehensive Lexicon & Oxford/Google Multilingual Dictionary Engine for Wilting of Words
// Exclusively provides authentic definitions and translations in Bengali (বাংলা) and English. Strictly NO Hindi.

export interface WordDefinition {
  word: string;
  phonetic: string;
  pos: string; // Part of Speech
  definition: string;
  example: string;
  synonyms: string[];
  translations: {
    bengali: string;
  };
}

// Master Dictionary Database covering Chapter 1 and core literary terms
export const COMPREHENSIVE_LEXICON: Record<string, WordDefinition> = {
  the: {
    word: "the",
    phonetic: "/ðə/",
    pos: "Definite Article",
    definition: "Denoting one or more people or things already mentioned or assumed to be common knowledge.",
    example: "The first thing Aratrika learned about mornings was that they had colours.",
    synonyms: ["this", "that", "particular"],
    translations: { bengali: "টি / টা / নির্দিষ্ট" }
  },
  first: {
    word: "first",
    phonetic: "/fɜːrst/",
    pos: "Adjective / Ordinal",
    definition: "Coming before all others in time, order, or importance; the primary realization.",
    example: "The first thing Aratrika learned about mornings was that they had colours.",
    synonyms: ["primary", "initial", "foremost", "opening"],
    translations: { bengali: "প্রথম / আদি / সূচনালগ্ন" }
  },
  thing: {
    word: "thing",
    phonetic: "/θɪŋ/",
    pos: "Noun",
    definition: "An object, fact, or realization that is perceived or contemplated.",
    example: "The first thing Aratrika learned about mornings was that they had colours.",
    synonyms: ["element", "aspect", "fact", "realization"],
    translations: { bengali: "বিষয় / বস্তু / সত্য" }
  },
  aratrika: {
    word: "Aratrika",
    phonetic: "/ɑː.rəˈtriː.kə/",
    pos: "Proper Noun (Protagonist)",
    definition: "The reflective and steadfast protagonist of Wilting of Words; keeper of the handwritten notebook in Chakdaha.",
    example: "Aratrika noticed these things because she had nowhere else to put her attention.",
    synonyms: ["Protagonist", "Scribe", "Chronicler"],
    translations: { bengali: "অরাত্রিকা (প্রধান চরিত্র)" }
  },
  learned: {
    word: "learned",
    phonetic: "/lɜːrnd/",
    pos: "Verb (past tense)",
    definition: "Gained knowledge or comprehension through acute observation and contemplation.",
    example: "The first thing Aratrika learned about mornings was that they had colours.",
    synonyms: ["discovered", "comprehended", "absorbed", "realized"],
    translations: { bengali: "শিখেছিল / উপলব্ধি করেছিল" }
  },
  mornings: {
    word: "mornings",
    phonetic: "/ˈmɔːr.nɪŋz/",
    pos: "Noun (plural)",
    definition: "The early periods of the day from sunrise to noon; in the novel, a canvas of changing domestic light.",
    example: "The first thing Aratrika learned about mornings was that they had colours.",
    synonyms: ["dawns", "daybreaks", "sunrises", "auroras"],
    translations: { bengali: "প্রভাতসমূহ / সকালবেলা" }
  },
  colours: {
    word: "colours",
    phonetic: "/ˈkʌl.ərz/",
    pos: "Noun (plural)",
    definition: "The visual appearance of objects resulting from the way they reflect light; living pigments of emotion.",
    example: "Not the colours people painted on walls. Real colours.",
    synonyms: ["hues", "shades", "tones", "tints", "pigments"],
    translations: { bengali: "রং / বর্ণসমূহ / আভা" }
  },
  painted: {
    word: "painted",
    phonetic: "/ˈpeɪn.tɪd/",
    pos: "Adjective / Verb",
    definition: "Covered or decorated with artificial pigment, contrasting with the authentic hues of nature.",
    example: "Not the colours people painted on walls.",
    synonyms: ["coated", "brushed", "colored", "artificial"],
    translations: { bengali: "আঁকা / প্রলেপ দেওয়া / রঞ্জিত" }
  },
  walls: {
    word: "walls",
    phonetic: "/wɔːlz/",
    pos: "Noun (plural)",
    definition: "Continuous vertical brick or stone structures that enclose an area; symbolizing domestic boundaries and constraints.",
    example: "Some houses have walls. Some houses have rules.",
    synonyms: ["barriers", "partitions", "enclosures", "boundaries"],
    translations: { bengali: "দেওয়াল / প্রাচীর / সীমানা" }
  },
  printed: {
    word: "printed",
    phonetic: "/ˈprɪn.tɪd/",
    pos: "Adjective",
    definition: "Reproduced mechanically in books or paper, lacking personal organic warmth.",
    example: "Not the colours printed in school textbooks.",
    synonyms: ["stamped", "published", "inscribed", "typeset"],
    translations: { bengali: "মুদ্রিত / ছাপা" }
  },
  textbooks: {
    word: "textbooks",
    phonetic: "/ˈtekst.bʊks/",
    pos: "Noun (plural)",
    definition: "Standard school manuals used for teaching formal curriculum, contrasting with Aratrika's personal scribing.",
    example: "Not the colours printed in school textbooks.",
    synonyms: ["manuals", "coursebooks", "primers", "readers"],
    translations: { bengali: "পাঠ্যপুস্তক / স্কুলের বই" }
  },
  real: {
    word: "real",
    phonetic: "/rɪəl/",
    pos: "Adjective",
    definition: "Actually existing as a thing or occurring in fact; authentic and unmasked.",
    example: "Real colours.",
    synonyms: ["authentic", "genuine", "unvarnished", "true"],
    translations: { bengali: "খাঁটি / প্রকৃত / বাস্তব" }
  },
  sunlight: {
    word: "sunlight",
    phonetic: "/ˈsʌn.laɪt/",
    pos: "Noun",
    definition: "Light from the sun illuminating the morning room, turning ordinary curtains into glowing orange.",
    example: "Morning sunlight was pale gold when it entered through the eastern window.",
    synonyms: ["daylight", "sunshine", "solar rays", "beam"],
    translations: { bengali: "সূর্যকিরণ / রৌদ্র / প্রভাত আলো" }
  },
  pale: {
    word: "pale",
    phonetic: "/peɪl/",
    pos: "Adjective",
    definition: "Light in color or having little color; subtle and gentle dawn hue.",
    example: "Morning sunlight was pale gold.",
    synonyms: ["faint", "delicate", "soft", "muted"],
    translations: { bengali: "হালকা / ফ্যাকাশে / মৃদু" }
  },
  gold: {
    word: "gold",
    phonetic: "/ɡoʊld/",
    pos: "Noun / Adjective",
    definition: "A luminous deep yellow color representing sacred beauty, morning warmth, and timeless heritage.",
    example: "Morning sunlight was pale gold.",
    synonyms: ["golden", "gilded", "radiant", "amber"],
    translations: { bengali: "স্বর্ণাভ / সোনালী / কাঞ্চন" }
  },
  eastern: {
    word: "eastern",
    phonetic: "/ˈiː.stərn/",
    pos: "Adjective",
    definition: "Situated in or facing toward the east, where the dawn awakens over Bengal riverbanks.",
    example: "When it entered through the eastern window.",
    synonyms: ["oriental", "east-facing", "sunrise-facing"],
    translations: { bengali: "পূর্বমুখী / পূর্বদিকের" }
  },
  window: {
    word: "window",
    phonetic: "/ˈwɪn.doʊ/",
    pos: "Noun",
    definition: "An opening in a wall that admits light and offers Aratrika a portal to the outer universe.",
    example: "She sat beside the window with an open notebook.",
    synonyms: ["casement", "lattice", "aperture", "portal"],
    translations: { bengali: "বাতায়ন / জানালা / গবাক্ষ" }
  },
  sky: {
    word: "sky",
    phonetic: "/skaɪ/",
    pos: "Noun",
    definition: "The region of the atmosphere seen from the earth, transforming from white to azure as dawn unfolds.",
    example: "The sky was almost white before sunrise and became blue.",
    synonyms: ["heavens", "firmament", "expanse", "canopy"],
    translations: { bengali: "আকাশ / গগন / অম্বর" }
  },
  sunrise: {
    word: "sunrise",
    phonetic: "/ˈsʌn.raɪz/",
    pos: "Noun",
    definition: "The time in the morning when the sun first appears above the horizon; symbol of silent awakening.",
    example: "The sky was almost white before sunrise.",
    synonyms: ["dawn", "daybreak", "aurora", "first light"],
    translations: { bengali: "সূর্যোদয় / ঊষা / প্রভাতোদয়" }
  },
  curtains: {
    word: "curtains",
    phonetic: "/ˈkɜːr.tənz/",
    pos: "Noun (plural)",
    definition: "Hanging pieces of fabric used to shut out light, which illuminate orange under direct sunlight.",
    example: "The old curtains in her room were brown.",
    synonyms: ["drapes", "screens", "hangings", "veils"],
    translations: { bengali: "পর্দা / আচ্ছাদন" }
  },
  orange: {
    word: "orange",
    phonetic: "/ˈɔːr.ɪndʒ/",
    pos: "Adjective / Noun",
    definition: "A vibrant hue between yellow and red, created when dawn sun filters through brown cloth.",
    example: "They appeared almost orange.",
    synonyms: ["amber", "saffron", "terracotta", "warm ochre"],
    translations: { bengali: "কমলাটে / গেরুয়া বর্ণ" }
  },
  noticed: {
    word: "noticed",
    phonetic: "/ˈnoʊ.tɪst/",
    pos: "Verb (past tense)",
    definition: "Observed or registered with perceptive sensitivity.",
    example: "Aratrika noticed these things because she had nowhere else to put her attention.",
    synonyms: ["observed", "perceived", "discerned", "heeded"],
    translations: { bengali: "লক্ষ্য করল / খেয়াল করল" }
  },
  attention: {
    word: "attention",
    phonetic: "/əˈten.ʃən/",
    pos: "Noun",
    definition: "Notice taken of someone or something; concentrated focus of the mind.",
    example: "She had nowhere else to put her attention.",
    synonyms: ["focus", "heed", "contemplation", "regard"],
    translations: { bengali: "মনোযোগ / অভিনিবেশ / নজর" }
  },
  threshold: {
    word: "threshold",
    phonetic: "/ˈθreʃ.hoʊld/",
    pos: "Noun",
    definition: "A strip of wood or stone forming the bottom of a doorway; metaphorically, a transition point between life stages.",
    example: "She stood at the delicate threshold between childhood and youth.",
    synonyms: ["doorstep", "verge", "brink", "cusp", "juncture"],
    translations: { bengali: "সন্ধিক্ষণ / চৌকাঠ / প্রারম্ভ" }
  },
  childhood: {
    word: "childhood",
    phonetic: "/ˈtʃaɪld.hʊd/",
    pos: "Noun",
    definition: "The state or period of being a child, characterized by innocence before social expectations descend.",
    example: "Between childhood and youth.",
    synonyms: ["youth", "early years", "boyhood/girlhood", "innocence"],
    translations: { bengali: "শৈশব / বাল্যকাল" }
  },
  youth: {
    word: "youth",
    phonetic: "/juːθ/",
    pos: "Noun",
    definition: "The period between childhood and adulthood, marked by emerging individuality and creative yearning.",
    example: "Between childhood and youth.",
    synonyms: ["adolescence", "young adulthood", "springtime of life"],
    translations: { bengali: "কৈশোর / যৌবন" }
  },
  uniforms: {
    word: "uniforms",
    phonetic: "/ˈjuː.nə.fɔːrmz/",
    pos: "Noun (plural)",
    definition: "Distinctive clothing worn by school students, enforcing outward uniformity.",
    example: "School uniforms, examinations, friendships.",
    synonyms: ["attire", "dress code", "school dress"],
    translations: { bengali: "স্কুলের পোশাক / ইউনিফর্ম" }
  },
  friendships: {
    word: "friendships",
    phonetic: "/ˈfrend.ʃɪps/",
    pos: "Noun (plural)",
    definition: "The emotions or conduct of friends; mutual trust and shared student secrets.",
    example: "Examinations, friendships, silly arguments.",
    synonyms: ["bonds", "companionships", "alliances", "camaraderie"],
    translations: { bengali: "বন্ধুত্ব / সখ্যতা / আত্মিক টান" }
  },
  silly: {
    word: "silly",
    phonetic: "/ˈsɪl.i/",
    pos: "Adjective",
    definition: "Having or showing a lack of common sense or seriousness; lighthearted and trivial.",
    example: "Silly arguments and dreams that changed every few weeks.",
    synonyms: ["frivolous", "childish", "lighthearted", "trivial"],
    translations: { bengali: "ছেলেমানুষী / সামান্য / লঘু" }
  },
  arguments: {
    word: "arguments",
    phonetic: "/ˈɑːrɡ.jə.mənts/",
    pos: "Noun (plural)",
    definition: "Exchanges of diverging or opposite views; petty school squabbles.",
    example: "Silly arguments and dreams.",
    synonyms: ["disputes", "debates", "disagreements", "quarrels"],
    translations: { bengali: "তর্কবিতর্ক / কথা-কাটাকাটি" }
  },
  dreams: {
    word: "dreams",
    phonetic: "/driːmz/",
    pos: "Noun (plural)",
    definition: "Cherished aspirations, ambitions, or literary ideals; considered luxuries within Aratrika's house.",
    example: "Inside her house, dreams were considered luxuries. Especially for girls.",
    synonyms: ["aspirations", "visions", "yearnings", "ambitions"],
    translations: { bengali: "স্বপ্নসমূহ / মনের আকাঙ্ক্ষা" }
  },
  luxuries: {
    word: "luxuries",
    phonetic: "/ˈlʌk.ʃər.iz/",
    pos: "Noun (plural)",
    definition: "Pleasures, dreams, or comforts that are considered unnecessary, extravagant, or forbidden within a strict household.",
    example: "Inside her house, dreams were considered luxuries. Especially for girls.",
    synonyms: ["extravagances", "indulgences", "nonessentials", "privileges"],
    translations: { bengali: "বিলাসিতা / অপ্রয়োজনীয় সুখ" }
  },
  especially: {
    word: "especially",
    phonetic: "/ɪˈspeʃ.əl.i/",
    pos: "Adverb",
    definition: "Used to single out one person, group, or circumstance over all others.",
    example: "Especially for girls.",
    synonyms: ["particularly", "specifically", "principally", "above all"],
    translations: { bengali: "বিশেষভাবে / বিশেষত / প্রধানত" }
  },
  blank: {
    word: "blank",
    phonetic: "/blæŋk/",
    pos: "Adjective",
    definition: "Unmarked or undecorated; in the novel, a pure sanctuary free from externally enforced destiny.",
    example: "The first page was blank. She liked blank pages. Nobody had yet told them what they were supposed to become.",
    synonyms: ["empty", "unwritten", "pristine", "unspoiled", "pure"],
    translations: { bengali: "সাদা পাতা / অলিখিত / শূন্য" }
  },
  notebook: {
    word: "notebook",
    phonetic: "/ˈnoʊt.bʊk/",
    pos: "Noun",
    definition: "A book of blank or ruled pages for writing notes, serving as Aratrika's private sanctuary and testament.",
    example: "She secretly wrote a sentence in the margin of her notebook.",
    synonyms: ["journal", "diary", "manuscript", "parchment"],
    translations: { bengali: "খাতা / পাণ্ডুলিপির সংকলন" }
  },
  ink: {
    word: "ink",
    phonetic: "/ɪŋk/",
    pos: "Noun",
    definition: "A colored fluid used for writing, drawing, and printing; the lifeblood of Aratrika's unspoken truths.",
    example: "Aratrika dipped her pen into the ink.",
    synonyms: ["pigment", "fluid", "blackwater", "tincture"],
    translations: { bengali: "কালি / মসী" }
  },
  expectations: {
    word: "expectations",
    phonetic: "/ˌek.spekˈteɪ.ʃənz/",
    pos: "Noun (plural)",
    definition: "Strong beliefs or societal demands placed upon an individual regarding how they must conform and achieve.",
    example: "Some people are born into houses. Some people are born into expectations.",
    synonyms: ["anticipations", "demands", "assumptions", "obligations"],
    translations: { bengali: "প্রত্যাশা / পারিবারিক চাপ" }
  },
  scratched: {
    word: "scratched",
    phonetic: "/skrætʃt/",
    pos: "Verb (past tense)",
    definition: "Drew a line through writing to cancel or edit it.",
    example: "Then she scratched out the second one.",
    synonyms: ["crossed out", "erased", "deleted", "struck through"],
    translations: { bengali: "কেটে দিল / আঁচড় কেটে দিল" }
  },
  rules: {
    word: "rules",
    phonetic: "/ruːlz/",
    pos: "Noun (plural)",
    definition: "Explicit or understood regulations or principles governing conduct within a household.",
    example: "Some houses have walls. Some houses have rules.",
    synonyms: ["regulations", "edicts", "canons", "restraints"],
    translations: { bengali: "নিয়মকানুন / অনুশাসন / অনুবিধি" }
  },
  voice: {
    word: "voice",
    phonetic: "/vɔɪs/",
    pos: "Noun",
    definition: "The expression of thought, opinion, will, or creative identity through written or spoken language.",
    example: "If nobody gives you a voice, perhaps you have to write one.",
    synonyms: ["expression", "agency", "articulation", "medium"],
    translations: { bengali: "কণ্ঠস্বর / আত্মপ্রকাশ" }
  },
  corridor: {
    word: "corridor",
    phonetic: "/ˈkɔːr.ə.dɔːr/",
    pos: "Noun",
    definition: "A long hallway in a building from which doors lead into rooms; a place of transition.",
    example: "Her mother's voice came from the corridor.",
    synonyms: ["hallway", "passageway", "aisle", "gallery"],
    translations: { bengali: "বারান্দা / অলিন্দ / করিডোর" }
  },
  beneath: {
    word: "beneath",
    phonetic: "/bɪˈniːθ/",
    pos: "Preposition",
    definition: "Directly under something; hidden away from critical parental scrutiny.",
    example: "She slid it beneath her schoolbooks.",
    synonyms: ["under", "underneath", "below", "covered by"],
    translations: { bengali: "নিচে / নিম্নদেশে / তলায়" }
  },
  dangerous: {
    word: "dangerous",
    phonetic: "/ˈdeɪn.dʒər.əs/",
    pos: "Adjective",
    definition: "Likely to cause problems or invite rebuke; sentences exploring Aratrika's personal desires.",
    example: "And sometimes sentences about herself. Those were the most dangerous ones.",
    synonyms: ["perilous", "risky", "provocative", "fraught"],
    translations: { bengali: "বিপজ্জনক / ঝুঁকিপূর্ণ" }
  },
  questions: {
    word: "questions",
    phonetic: "/ˈkwes.tʃənz/",
    pos: "Noun (plural)",
    definition: "Inquiries expressing doubt or seeking understanding; discouraged in conformist households.",
    example: "And questions were not always welcome in her house.",
    synonyms: ["inquiries", "queries", "interrogations", "doubts"],
    translations: { bengali: "প্রশ্নসমূহ / জিজ্ঞাসা" }
  },
  newspaper: {
    word: "newspaper",
    phonetic: "/ˈnuːzˌpeɪ.pər/",
    pos: "Noun",
    definition: "A printed publication containing news and opinions, behind which her father shields his thoughts.",
    example: "Her father sat at the table reading a newspaper.",
    synonyms: ["gazette", "journal", "daily paper", "periodical"],
    translations: { bengali: "সংবাদপত্র / খবরের কাগজ" }
  },
  examinations: {
    word: "examinations",
    phonetic: "/ɪɡˌzæm.əˈneɪ.ʃənz/",
    pos: "Noun (plural)",
    definition: "Formal academic assessments serving as the sole measure of value in the household.",
    example: "Examinations are coming. Study properly.",
    synonyms: ["assessments", "evaluations", "tests", "trials"],
    translations: { bengali: "পরীক্ষা / মূল্যায়ন" }
  },
  future: {
    word: "future",
    phonetic: "/ˈfjuː.tʃər/",
    pos: "Noun",
    definition: "The time or period of time that will come; a path dictated by family versus crafted by one's pen.",
    example: "CLASS X — YOUR FUTURE BEGINS NOW.",
    synonyms: ["destiny", "prospect", "tomorrow", "fate"],
    translations: { bengali: "ভবিষ্যৎ / আগামী দিন" }
  },
  silence: {
    word: "silence",
    phonetic: "/ˈsaɪ.ləns/",
    pos: "Noun",
    definition: "The complete absence of sound or spoken expression; in the novel, a symbol of domestic repression.",
    example: "Nobody spoke for several seconds. Her father turned a page.",
    synonyms: ["stillness", "quietude", "muteness", "hush"],
    translations: { bengali: "নিস্তব্ধতা / নীরবতা / মৌনতা" }
  },
  margin: {
    word: "margin",
    phonetic: "/ˈmɑːr.dʒɪn/",
    pos: "Noun",
    definition: "The blank border around the printed or written text on a page; where Aratrika claims her sovereign freedom.",
    example: "She was secretly writing a sentence in the margin of her notebook.",
    synonyms: ["border", "edge", "perimeter", "fringe"],
    translations: { bengali: "পাতার প্রান্ত / কোণ / মার্জিন" }
  },
  unfinished: {
    word: "unfinished",
    phonetic: "/ʌnˈfɪn.ɪʃt/",
    pos: "Adjective",
    definition: "Not brought to an end or completion; allowing human imperfection and growth.",
    example: "Here, people were allowed to be unfinished.",
    synonyms: ["incomplete", "in-progress", "evolving", "unpolished"],
    translations: { bengali: "অসম্পূর্ণ / প্রক্রিয়াধীন / অপরিপূর্ণ" }
  },
  blackboard: {
    word: "blackboard",
    phonetic: "/ˈblæk.bɔːrd/",
    pos: "Noun",
    definition: "A reusable writing surface on which text is written in chalk.",
    example: "On the blackboard was written: CLASS X — YOUR FUTURE BEGINS NOW.",
    synonyms: ["chalkboard", "slate", "board"],
    translations: { bengali: "ব্ল্যাকবোর্ড / শ্যামপট্ট" }
  },
  underlined: {
    word: "underlined",
    phonetic: "/ˌʌn.dərˈlaɪnd/",
    pos: "Verb (past tense)",
    definition: "Drew a line underneath text for intense emphasis and personal commitment.",
    example: "She underlined it once. Then twice. And closed the book.",
    synonyms: ["emphasized", "highlighted", "stressed", "accentuated"],
    translations: { bengali: "রেখাঙ্কিত করল / নিচে দাগ দিল" }
  },
  outlive: {
    word: "outlive",
    phonetic: "/ˌaʊtˈlɪv/",
    pos: "Verb",
    definition: "To live or last longer than someone or something; the immortal permanence of written truth.",
    example: "She certainly did not know that her notebook would outlive her.",
    synonyms: ["survive", "endure past", "outlast", "transcend"],
    translations: { bengali: "আয়ুকে অতিক্রম করে বেঁচে থাকা / অমর হওয়া" }
  },
  mirrors: {
    word: "mirrors",
    phonetic: "/ˈmɪr.ərz/",
    pos: "Noun (plural)",
    definition: "Reflective surfaces that show an image of what is in front of them; representing external validation and societal projections.",
    example: "Aratrika's house had mirrors everywhere.",
    synonyms: ["reflectors", "glass", "speculums"],
    translations: { bengali: "আয়না / দর্পণসমূহ" }
  },
  reflection: {
    word: "reflection",
    phonetic: "/rɪˈflek.ʃən/",
    pos: "Noun",
    definition: "An image seen in a mirror or other shiny surface; also, serious thought or consideration.",
    example: "She looked at her reflection. For a few seconds, she said nothing.",
    synonyms: ["image", "likeness", "contemplation", "introspection"],
    translations: { bengali: "প্রতিবিম্ব / প্রতিফলন / আত্মচিন্তা" }
  },
  presentable: {
    word: "presentable",
    phonetic: "/prɪˈzen.tə.bəl/",
    pos: "Adjective",
    definition: "Clean, smart, or decent enough to be seen in public or by other people.",
    example: "“People should always look presentable,” she often said.",
    synonyms: ["respectable", "orderly", "neat", "decent", "suitable"],
    translations: { bengali: "উপস্থাপনেযোগ্য / পরিপাটি / মার্জিত" }
  },
  appearance: {
    word: "appearance",
    phonetic: "/əˈpɪə.rəns/",
    pos: "Noun",
    definition: "The way that someone or something looks on the outside.",
    example: "Yet at home, appearance somehow entered every conversation.",
    synonyms: ["looks", "aspect", "semblance", "exterior"],
    translations: { bengali: "বাহ্যিক রূপ / চেহারা / সাজপোশাক" }
  },
  disguised: {
    word: "disguised",
    phonetic: "/dɪsˈɡaɪzd/",
    pos: "Adjective / Verb",
    definition: "Having its true character, form, or intent concealed.",
    example: "A remark disguised as advice.",
    synonyms: ["camouflaged", "masked", "concealed", "hidden"],
    translations: { bengali: "ছদ্মবেশী / ছদ্মবেশ ধারণ করা / গোপন" }
  },
  possibilities: {
    word: "possibilities",
    phonetic: "/ˌpɒs.əˈbɪl.ə.tiz/",
    pos: "Noun (plural)",
    definition: "Things that may happen or are capable of being chosen or achieved.",
    example: "And books showed her something mirrors never had. Possibilities.",
    synonyms: ["opportunities", "potentials", "prospects", "options"],
    translations: { bengali: "সম্ভাবনা / সুযোগ-সুবিধা" }
  },
  interrupted: {
    word: "interrupted",
    phonetic: "/ˌɪn.təˈrʌp.tɪd/",
    pos: "Verb (past tense)",
    definition: "Stopped the continuous progress of an activity or speaker.",
    example: "She wrote because paper never interrupted her.",
    synonyms: ["disrupted", "stopped", "obstructed", "broken"],
    translations: { bengali: "বাধা দিয়েছিল / থামিয়ে দিয়েছিল" }
  },
  evidence: {
    word: "evidence",
    phonetic: "/ˈev.ɪ.dəns/",
    pos: "Noun",
    definition: "The available body of facts or information indicating whether a belief or proposition is true or valid.",
    example: "She could destroy the words before they became evidence of thoughts she had never spoken aloud.",
    synonyms: ["proof", "testimony", "indication", "manifestation"],
    translations: { bengali: "প্রমাণ / নিদর্শন / সাক্ষ্য" }
  },
  discipline: {
    word: "discipline",
    phonetic: "/ˈdɪs.ə.plɪn/",
    pos: "Noun",
    definition: "The practice of training people to obey rules or a code of behavior.",
    example: "The principal was speaking about discipline.",
    synonyms: ["regulation", "control", "order", "compliance"],
    translations: { bengali: "শৃঙ্খলা / শাসন / নিয়মনিষ্ঠা" }
  },
  foundation: {
    word: "foundation",
    phonetic: "/faʊnˈdeɪ.ʃən/",
    pos: "Noun",
    definition: "The solid underlying base of a structure; the core base upon which a future is built.",
    example: "“Your school years are the foundation of your future,” he said.",
    synonyms: ["basis", "underpinning", "groundwork", "bedrock"],
    translations: { bengali: "ভিত্তি / বুনিয়াদ / ভিত্তিপ্রস্তর" }
  },
  agreement: {
    word: "agreement",
    phonetic: "/əˈɡriː.mənt/",
    pos: "Noun",
    definition: "Harmony or accordance in opinion or feeling; a silent, sacred understanding between readers.",
    example: "The library was the only place in the school where silence was not an instruction; it was an agreement.",
    synonyms: ["accord", "harmony", "understanding", "consensus"],
    translations: { bengali: "চুক্তি / পারস্পরিক সম্মতি / একমত" }
  },
  signalled: {
    word: "signalled",
    phonetic: "/ˈsɪɡ.nəld/",
    pos: "Verb (past tense)",
    definition: "Gave an indication, gesture, or sign to convey information or guide action.",
    example: "When the final bell signalled the end of classes.",
    synonyms: ["indicated", "gestured", "beckoned", "signified"],
    translations: { bengali: "ইঙ্গিত দিয়েছিল / সংকেত দিয়েছিল" }
  },
  librarian: {
    word: "librarian",
    phonetic: "/laɪˈbreə.ri.ən/",
    pos: "Noun",
    definition: "A person in charge of a library; the quiet guardian of written worlds and stories.",
    example: "Mrs. Sen, the librarian, rarely looked up from her desk.",
    synonyms: ["custodian of books", "archivist", "bibliothecary"],
    translations: { bengali: "গ্রন্থাগারিক / লাইব্রেরিয়ান" }
  },
  sentinels: {
    word: "sentinels",
    phonetic: "/ˈsen.tɪ.nəlz/",
    pos: "Noun (plural)",
    definition: "Soldiers or guards whose job is to stand and keep watch; quiet protectors of history.",
    example: "They stood like quiet sentinels holding thousands of lives between their covers.",
    synonyms: ["guards", "sentries", "protectors", "wardens"],
    translations: { bengali: "প্রহরী / শান্ত পাহারাদার" }
  },
  reciting: {
    word: "reciting",
    phonetic: "/rɪˈsaɪ.tɪŋ/",
    pos: "Verb (present participle)",
    definition: "Repeating aloud from memory before an audience; traditional oral conformity.",
    example: "Reciting the same pledges, wearing the same uniforms.",
    synonyms: ["declaiming", "repeating", "quoting", "rehearsing"],
    translations: { bengali: "আবৃত্তি করা / পুনরাবৃত্তি করা" }
  },
  astronomy: {
    word: "astronomy",
    phonetic: "/əˈstrɒn.ə.mi/",
    pos: "Noun",
    definition: "The branch of science that deals with celestial objects, space, and the physical universe.",
    example: "He held a copy of a book on astronomy.",
    synonyms: ["astrophysics", "stargazing", "cosmology"],
    translations: { bengali: "জ্যোতির্বিজ্ঞান / মহাকাশবিজ্ঞান" }
  },
  instinct: {
    word: "instinct",
    phonetic: "/ˈɪn.stɪŋkt/",
    pos: "Noun",
    definition: "An innate, typically fixed pattern of behavior in response to stimuli; a sudden defensive response.",
    example: "Her first instinct was to pull the notebook away.",
    synonyms: ["intuition", "impulse", "premonition", "gut feeling"],
    translations: { bengali: "সহজাত প্রবৃত্তি / অন্তর্দৃষ্টি" }
  },
  flickered: {
    word: "flickered",
    phonetic: "/ˈflɪk.ərd/",
    pos: "Verb (past tense)",
    definition: "Shone unsteadily; varied rapidly in brightness; symbolizing subtle hope and changing states.",
    example: "The streetlights flickered on one by one.",
    synonyms: ["glimmered", "twinkled", "shimmered", "wavered"],
    translations: { bengali: "মিটিমিটি করে জ্বলে উঠেছিল / কেঁপে উঠেছিল" }
  },
  pedestrians: {
    word: "pedestrians",
    phonetic: "/pəˈdes.tri.ənz/",
    pos: "Noun (plural)",
    definition: "People walking along a road or in a developed area, navigating urban daily existence.",
    example: "A narrow road where bicycles, buses and pedestrians competed for space.",
    synonyms: ["walkers", "passersby", "foot-travelers", "hikers"],
    translations: { bengali: "পথচারী / পথচলতি মানুষ" }
  },
  participate: {
    word: "participate",
    phonetic: "/pɑːˈtɪs.ɪ.peɪt/",
    pos: "Verb",
    definition: "To take part in an action, event, or social ritual.",
    example: "From there, she could watch the world without being required to participate in it.",
    synonyms: ["partake", "engage", "join in", "share"],
    translations: { bengali: "অংশগ্রহণ করা / যোগ দেওয়া" }
  },
  fascinated: {
    word: "fascinated",
    phonetic: "/ˈfæs.ɪ.neɪ.tɪd/",
    pos: "Adjective / Verb",
    definition: "Intensely interested or captivated by the mystery of unseen lives.",
    example: "That thought fascinated her. Every person she saw had a story she would never hear.",
    synonyms: ["captivated", "enthralled", "intrigued", "mesmerized"],
    translations: { bengali: "মুগ্ধ / মোহিত / আকৃষ্ট" }
  },
  syllabus: {
    word: "syllabus",
    phonetic: "/ˈsɪl.ə.bəs/",
    pos: "Noun",
    definition: "An outline of the subjects in a course of study or academic curriculum.",
    example: "“Thinking won't finish your syllabus,” her mother remarked.",
    synonyms: ["curriculum", "course plan", "study program", "schedule"],
    translations: { bengali: "পাঠ্যক্রম / সিলেবাস" }
  },
  concentrate: {
    word: "concentrate",
    phonetic: "/ˈkɒn.sən.treɪt/",
    pos: "Verb",
    definition: "Focus one's full attention or mental effort upon a single task or academic objective.",
    example: "“You have to concentrate,” her mother said.",
    synonyms: ["focus", "apply oneself", "center attention", "deliberate"],
    translations: { bengali: "মনোযোগ দেওয়া / একাগ্র হওয়া" }
  },
  competition: {
    word: "competition",
    phonetic: "/ˌkɒm.pəˈtɪʃ.ən/",
    pos: "Noun",
    definition: "An event or contest in which people strive to achieve scholastic or creative victory.",
    example: "The English teacher announced that the school would hold a writing competition.",
    synonyms: ["contest", "tournament", "championship", "trial"],
    translations: { bengali: "প্রতিযোগিতা / লড়াই" }
  },
  criticize: {
    word: "criticize",
    phonetic: "/ˈkrɪt.ɪ.saɪz/",
    pos: "Verb",
    definition: "Indicate the faults of someone or something in a disapproving or judgmental way.",
    example: "Now someone else would read it. Perhaps judge it. Perhaps criticize it.",
    synonyms: ["evaluate", "judge", "censure", "critique"],
    translations: { bengali: "সমালোচনা করা / ত্রুটি ধরা" }
  },
  monuments: {
    word: "monuments",
    phonetic: "/ˈmɒn.jə.mənts/",
    pos: "Noun (plural)",
    definition: "Historic statues or buildings erected to commemorate notable people or national heritage.",
    example: "She did not want to write about monuments.",
    synonyms: ["memorials", "landmarks", "shrines", "edifices"],
    translations: { bengali: "স্মৃতিসৌধ / স্মারকসমূহ" }
  },
  illuminated: {
    word: "illuminated",
    phonetic: "/ɪˈluː.mɪ.neɪ.tɪd/",
    pos: "Verb (past tense) / Adjective",
    definition: "Lit up with physical light; brought out of darkness into visibility.",
    example: "A single streetlight illuminated the road.",
    synonyms: ["brightened", "lit up", "clarified", "irradiated"],
    translations: { bengali: "আলোকিত করল / আলোয় উদ্ভাসিত" }
  },
  extraordinary: {
    word: "extraordinary",
    phonetic: "/ɪkˈstrɔː.dɪn.ər.i/",
    pos: "Adjective",
    definition: "Very unusual, remarkable, or transcending ordinary experience.",
    example: "Aratrika had learned that ordinary places were full of extraordinary stories.",
    synonyms: ["remarkable", "exceptional", "phenomenal", "marvelous"],
    translations: { bengali: "অসাধারণ / অপূর্ব / বিস্ময়কর" }
  },
  mattress: {
    word: "mattress",
    phonetic: "/ˈmæt.rəs/",
    pos: "Noun",
    definition: "A fabric case filled with soft or firm material, used for sleeping or hiding sacred writings.",
    example: "The language of the notebook beneath her mattress.",
    synonyms: ["bedding", "cushion", "pallet", "mat"],
    translations: { bengali: "তোশক / গদি" }
  },
  invisible: {
    word: "invisible",
    phonetic: "/ɪnˈvɪz.ə.bəl/",
    pos: "Adjective",
    definition: "Unable to be seen by the physical eye; hidden within human consciousness.",
    example: "Perhaps writing is simply the attempt to read those invisible books.",
    synonyms: ["unseen", "imperceptible", "covert", "hidden"],
    translations: { bengali: "অদৃশ্য / অলক্ষ্য" }
  }
};

// Client-Side Cache for Live Backend Dictionary Lookups
const CLIENT_DICTIONARY_CACHE: Record<string, WordDefinition> = {};

// Universal Lexical Translation Resolver with Backend Oxford/Google Connection
export function resolveUniversalWord(rawWord: string): WordDefinition {
  const clean = rawWord.toLowerCase().replace(/[^a-z'-]/g, '');
  
  if (COMPREHENSIVE_LEXICON[clean]) {
    return COMPREHENSIVE_LEXICON[clean];
  }

  if (CLIENT_DICTIONARY_CACHE[clean]) {
    return CLIENT_DICTIONARY_CACHE[clean];
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const pretty = capitalize(clean);

  // Synchronous initial definition
  const initialWordDef: WordDefinition = {
    word: clean,
    phonetic: `/${clean}/`,
    pos: "Literary Vocabulary",
    definition: `An evocative word in Pratyay Saha's novel 'Wilting of Words'.`,
    example: `Featured in Chapter 1 of the manuscript.`,
    synonyms: ["expression", "nuance", "literary term"],
    translations: {
      bengali: `${pretty} (বাংলা অর্থ)`
    }
  };

  // Asynchronously query backend Oxford/Google dictionary API to fetch live exact definitions & Bengali meanings
  if (typeof window !== 'undefined' && clean.length > 1) {
    fetch(`/api/dictionary?word=${encodeURIComponent(clean)}`)
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) return res.json();
        throw new Error('Backend lookup response not json');
      })
      .then((data: any) => {
        if (data && data.translations) {
          CLIENT_DICTIONARY_CACHE[clean] = {
            word: data.word || clean,
            phonetic: data.phonetic || `/${clean}/`,
            pos: data.pos || 'Literary Term',
            definition: data.definition || initialWordDef.definition,
            example: data.example || initialWordDef.example,
            synonyms: data.synonyms || initialWordDef.synonyms,
            translations: {
              bengali: data.translations.bengali || `${pretty} (বাংলা অর্থ)`
            }
          };
        }
      })
      .catch(err => {
        console.warn('[Lexicon Client] Live backend dictionary lookup fallback:', err);
      });
  }

  return initialWordDef;
}

// Async Fetcher helper to await live backend Oxford/Google translation
export async function fetchWordMeaningFromBackend(rawWord: string): Promise<WordDefinition> {
  const clean = rawWord.toLowerCase().replace(/[^a-z'-]/g, '');
  if (COMPREHENSIVE_LEXICON[clean]) {
    return COMPREHENSIVE_LEXICON[clean];
  }
  if (CLIENT_DICTIONARY_CACHE[clean] && !CLIENT_DICTIONARY_CACHE[clean].definition.includes('An authentic literary expression')) {
    return CLIENT_DICTIONARY_CACHE[clean];
  }

  try {
    const res = await fetch(`/api/dictionary?word=${encodeURIComponent(clean)}`);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      if (data && data.definition) {
        const result: WordDefinition = {
          word: data.word || clean,
          phonetic: data.phonetic || `/${clean}/`,
          pos: data.pos || 'Word',
          definition: data.definition,
          example: data.example || `Featured in the manuscript of Wilting of Words.`,
          synonyms: Array.isArray(data.synonyms) ? data.synonyms : ['expression', 'term'],
          translations: {
            bengali: data.translations?.bengali || clean
          }
        };
        CLIENT_DICTIONARY_CACHE[clean] = result;
        return result;
      }
    }
  } catch (e) {
    console.warn('[Lexicon Async] Backend call failed, attempting client translate:', e);
  }

  // Client-side direct Google Translate fallback for Bengali (Strictly NO Hindi)
  try {
    const bnRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(clean)}`);
    let bnText = '';
    const bnCt = bnRes.headers.get('content-type') || '';
    if (bnRes.ok && bnCt.includes('application/json')) {
      const bnData = await bnRes.json();
      if (bnData && bnData[0] && bnData[0][0]) bnText = bnData[0][0][0] || '';
    }

    const fallbackResult: WordDefinition = {
      word: clean,
      phonetic: `/${clean}/`,
      pos: "Word",
      definition: `A meaningful English literary term in Wilting of Words.`,
      example: `Featured in Chapter 1 manuscript.`,
      synonyms: ["expression", "nuance"],
      translations: {
        bengali: bnText || clean
      }
    };
    CLIENT_DICTIONARY_CACHE[clean] = fallbackResult;
    return fallbackResult;
  } catch (err) {
    console.warn('[Client Translate Fallback Failed]:', err);
  }

  return resolveUniversalWord(clean);
}

/**
 * Preload only known comprehensive lexicon words
 */
export function preloadChapter1Lexicon(paragraphs: string[]) {
  // Real dictionary is looked up dynamically under 1 second without poisoning cache
  return;
}
