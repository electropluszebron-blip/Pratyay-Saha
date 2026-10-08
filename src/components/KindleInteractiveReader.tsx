import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Settings, 
  MessageSquare, 
  BookOpen, 
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Plus,
  Send,
  Compass,
  Feather,
  RefreshCw,
  Check,
  Copy,
  Flame,
  Award,
  BookMarked,
  BrainCircuit,
  Globe,
  Crown,
  ShieldCheck,
  Heart,
  User,
  Languages,
  Eye,
  Sliders,
  FileText,
  BookmarkCheck,
  Users,
  Sun,
  Scroll,
  Maximize2,
  MoreVertical,
  CloudRain,
  Music,
  MapPin,
  RotateCcw,
  History
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';
import { ambientAudio } from '../services/ambientAudio';
import { GlossaryHistoryDrawer, GlossaryHistoryItem } from './GlossaryHistoryDrawer';
import { PronunciationGuideModal } from './PronunciationGuideModal';
import { ChakdahaInteractiveMap } from './ChakdahaInteractiveMap';
import confetti from 'canvas-confetti';
import { resolveUniversalWord, fetchWordMeaningFromBackend, WordDefinition, COMPREHENSIVE_LEXICON, preloadChapter1Lexicon } from '../data/comprehensiveLexicon';

interface KindleInteractiveReaderProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchImmersive?: () => void;
}

// Chapter 1 Text (Authentic canon narrative from Wilting of Words by Pratyay Saha)
// NO age of protagonist is written anywhere
const CHAPTER_1_PARAGRAPHS = [
  "The first thing Aratrika learned about mornings was that they had colours.",
  "Not the colours people painted on walls. Not the colours printed in school textbooks. Real colours.",
  "Morning sunlight was pale gold when it entered through the eastern window. The sky was almost white before sunrise and became blue only after the neighbourhood had begun to wake. The old curtains in her room were brown, but when sunlight passed through them, they appeared almost orange.",
  "Aratrika noticed these things because she had nowhere else to put her attention.",
  "She stood at the delicate threshold between childhood and youth.",
  "It was supposed to be a time of school uniforms, examinations, friendships, silly arguments and dreams that changed every few weeks.",
  "But inside her house, dreams were considered luxuries. Especially for girls.",
  "She sat beside the window with an open notebook. The first page was blank. She liked blank pages. Nobody had yet told them what they were supposed to become.",
  "Outside, a vegetable seller called out to the early morning neighbourhood. Somewhere a bicycle bell rang twice. A bus groaned along the main road.",
  "Aratrika dipped her pen into the ink. Then she wrote:\nSome people are born into houses. Some people are born into expectations.",
  "She stopped. She read the two sentences again. Then she scratched out the second one. She wrote:\nSome houses have walls. Some houses have rules.",
  "That sounded better. She smiled. It was a very small smile. But it belonged entirely to her.",
  "“Aratrika!” Her mother's voice came from the corridor. She closed the notebook immediately. “Coming.” She slid it beneath her schoolbooks.",
  "That notebook was not a diary. At least, she did not call it one. A diary was something private. This was different. This was where she kept the things she could not say.",
  "There were sentences about school. Sentences about her teachers. Sentences about books. Sentences about the way people looked at one another. And sometimes sentences about herself. Those were the most dangerous ones.",
  "Because whenever Aratrika wrote about herself, she began asking questions. And questions were not always welcome in her house.",
  "At breakfast, the television was playing the morning news. Her father sat at the table reading a newspaper. Her mother was preparing tea. Aratrika stood quietly near the doorway.",
  "“You're late,” her father said.\n“Sorry.”\n“You have school.”\n“I know.”\n“Then why are you standing there?”",
  "She sat down. Nobody spoke for several seconds. Her father turned a page.",
  "“Examinations are coming.”\n“Yes.”\n“Your cousin got very good marks last year.”\nAratrika nodded.\n“Study properly.”\n“Yes.”",
  "That was how most conversations about her future happened. Short sentences. Instructions. Comparisons. Expectations. Never questions. Nobody asked what she wanted to become.",
  "Perhaps they assumed a girl did not need such a question. Perhaps they thought the answer would not matter.",
  "Aratrika did have an answer. She wanted to write. She wanted to speak. She wanted to stand somewhere someday and make people listen—not because she was loud, but because what she said mattered.",
  "She had never said this aloud. Instead, she took another sip of tea.",
  "The newspaper rustled. Her father looked at her.\n“Why are you always writing?”\nAratrika froze.\n“Nothing.”\n“I have seen your notebooks.”\n“They're school notes.”\n“Then study from them.”\n“Yes.”",
  "He returned to the newspaper. The conversation was over. But Aratrika's heart continued it.",
  "Why is writing considered useless? Why is studying only valuable when it produces marks? Why does everyone ask what I scored but nobody asks what I thought?",
  "She looked down at her plate. She knew better than to ask. So she ate quietly.",
  "At school, things were different. Not completely different. But enough.",
  "The school corridor was loud with footsteps, conversations and laughter. Aratrika liked it. Here, people were allowed to be unfinished.",
  "A student could make a mistake in mathematics. Someone could forget a poem. Someone could answer a question incorrectly. Someone could laugh too loudly. The world did not end.",
  "She entered her classroom and took her usual seat. On the blackboard was written:\nCLASS X — YOUR FUTURE BEGINS NOW",
  "Aratrika stared at the sentence. She wondered whether futures really began in classrooms. Or whether they began much earlier.",
  "Perhaps hers had begun the first time somebody told her she could not do something. Perhaps everyone's future began with a sentence someone else had spoken about them.",
  "She opened her textbook. The teacher entered.\n“Good morning.”\nThe class stood.\n“Good morning, ma'am.”\n“Sit down.”",
  "Chairs moved. Books opened. Pens clicked. And another ordinary school day began.",
  "Aratrika did not know that before the year ended, her marks would become a number people remembered. She did not know that her name would one day appear in places she had never imagined. She did not know that one day strangers would read the words she was hiding beneath her schoolbooks. She certainly did not know that her notebook would outlive her.",
  "For now, she was simply a student sitting in Class X, listening to a lesson while secretly writing a sentence in the margin of her notebook:\nIf nobody gives you a voice, perhaps you have to write one.",
  "She underlined it once. Then twice. And closed the book."
];

// Bilingual Bengali Translations (NO age of protagonist)
const BENGALI_PARAGRAPHS = [
  "ভোর সম্পর্কে অরাত্রিকার প্রথম শিক্ষা ছিল যে সকালগুলোর নিজস্ব বর্ণ থাকে।",
  "দেওয়ালে আঁকা রঙের মতো নয়। স্কুলের পাঠ্যবইয়ে ছাপা রঙের মতোও নয়। একেবারে প্রকৃত রঙ।",
  "পূর্বের জানালা দিয়ে যখন ভোরের সোনালী রোদ এসে পৌঁছাত, তা ছিল হালকা স্বর্ণাভ। সূর্যোদয়ের আগে আকাশ প্রায় সাদা থাকত, আর চারপাশের এলাকা জেগে ওঠার পরেই তা নীল হয়ে উঠত। তার ঘরের পুরানো পর্দাগুলো ছিল বাদামী, কিন্তু আলো ভেদ করে এলে তা কমলাটে দেখাত।",
  "অরাত্রিকা এসব খুঁটিয়ে দেখত কারণ তার মনোযোগ দেওয়ার মতো আর অন্য কিছু ছিল না।",
  "সে দাঁড়িয়েছিল শৈশব ও কৈশোরের সূক্ষ্ম সন্ধিক্ষণে।",
  "সময়টা হওয়ার কথা ছিল স্কুলের পোশাক, পরীক্ষা, বন্ধুত্ব, ছেলেমানুষী ঝগড়া আর কয়েক সপ্তাহ অন্তর বদলে যাওয়া স্বপ্নের।",
  "কিন্তু তার ঘরে স্বপ্ন দেখাকে বিলাসিতা মনে করা হত। বিশেষ করে মেয়েদের জন্য।",
  "সে জানালার পাশে একটি খোলা খাতা নিয়ে বসেছিল। প্রথম পাতাটি ছিল সম্পূর্ণ সাদা। তার সাদা পাতা খুব পছন্দ ছিল। কারণ কেউ তখনো তাদের বলে দেয়নি তাদের কী হয়ে ওঠার কথা ছিল।",
  "বাইরে ভোরের নিস্তব্ধ পাড়ায় এক সবজি বিক্রেতা হাঁক দিচ্ছিল। কোথাও একটা সাইকেলের ঘন্টি দুবার বেজে উঠল। প্রধান রাস্তায় একটা বাস গোঁ গোঁ করে চলে গেল।",
  "অরাত্রিকা কালিতে তার কলমটি ডুবিয়ে নিল। তারপর লিখল:\nকিছু মানুষ পরিবারে জন্ম নেয়। কিছু মানুষ প্রত্যাশায় জন্ম নেয়।",
  "সে থামল। দুটো বাক্য আবার পড়ল। তারপর দ্বিতীয় বাক্যটি কেটে দিল। লিখল:\nকিছু ঘরে দেওয়াল থাকে। কিছু ঘরে নিয়ম থাকে।",
  "এটা শুনতে ভালো শোনাল। সে হাসল। এক চিলতে হাসি। কিন্তু তা ছিল একান্তই তার নিজের।",
  "“অরাত্রিকা!” বারান্দা থেকে মায়ের ডাক এলো। সে সঙ্গে সঙ্গে খাতাটি বন্ধ করে দিল। “আসছি।” সে তা স্কুলের বইয়ের নিচে গুঁজে রাখল।",
  "সে খাতাটি কোনো ডায়েরি ছিল না। অন্তত সে এটিকে ডায়েরি বলত না। ডায়েরি ছিল ব্যক্তিগত কিছু। এটা ছিল অন্যরকম। এখানে সে সেই কথাগুলো লিখে রাখত যা সে মুখে বলতে পারত না।",
  "সেখানে ছিল স্কুল নিয়ে বাক্য। শিক্ষকদের নিয়ে বাক্য। বইপত্র নিয়ে বাক্য। একে অপরের দিকে মানুষ কীভাবে তাকায় তা নিয়ে বাক্য। আর কখনো কখনো নিজেকে নিয়ে লেখা বাক্য। সেগুলোই ছিল সবচেয়ে বিপজ্জনক।",
  "কারণ যখনই অরাত্রিকা নিজের সম্পর্কে লিখত, সে প্রশ্ন করতে শুরু করত। আর তার বাড়িতে প্রশ্ন সর্বদা স্বাগত পেত না।",
  "প্রাতরাশের টেবিলে টেলিভিশনে সকালের খবর চলছিল। বাবা টেবিলে বসে খবরের কাগজ পড়ছিলেন। মা চা বানাচ্ছিলেন। অরাত্রিকা দরজার কাছে চুপচাপ দাঁড়িয়ে রইল।",
  "“দেরি হয়ে গেল,” বাবা বললেন।\n“দুঃখিত।”\n“স্কুল আছে তো।”\n“জানি।”\n“তাহলে দাঁড়িয়ে আছ কেন?”",
  "সে বসল। কয়েক সেকেন্ড কেউ কথা বলল না। বাবা খবরের কাগজের পাতা ওল্টালেন।",
  "“পরীক্ষা এগিয়ে আসছে।”\n“হ্যাঁ।”\n“তোমার দিদি গত বছর খুব ভালো নম্বর পেয়েছে।”\nঅরাত্রিকা মাথা নাড়ল।\n“মন দিয়ে পড়াশোনা কোরো।”\n“হ্যাঁ।”",
  "তার ভবিষ্যৎ নিয়ে বেশিরভাগ কথোপকথন এমনই হতো। ছোট ছোট নির্দেশ। তুলনা। প্রত্যাশা। কখনো কোনো জিজ্ঞাসা নয়। কেউ জিজ্ঞেস করত না সে জীবনে কী হতে চায়।",
  "হয়তো তারা ধরে নিয়েছিল একটি মেয়ের এমন প্রশ্নের কোনো প্রয়োজন নেই। হয়তো তারা ভেবেছিল তার উত্তরের কোনো মূল্য নেই।",
  "অরাত্রিকার কাছে উত্তর ছিল। সে লিখতে চেয়েছিল। সে নিজের কথা বলতে চেয়েছিল। সে একদিন কোথাও দাঁড়িয়ে মানুষকে শোনাবার আকাঙ্ক্ষা রাখত—জোরে চেঁচিয়ে নয়, বরং তার কথার অন্তর্নিহিত মূল্যের শক্তিতে।",
  "সে কখনোই একথা মুখে বলেনি। তার বদলে সে চায়ে আরেকটা চুমুক দিল।",
  "খবরের কাগজ খসখস করে উঠল। বাবা তার দিকে তাকালেন।\n“তুমি সবসময় কী লেখ?”\nঅরাত্রিকা স্তব্ধ হয়ে গেল।\n“কিছু না।”\n“আমি তোমার খাতাগুলো দেখেছি।”\n“ওগুলো স্কুলের নোট।”\n“তাহলে ওগুলো থেকেই পড়াশোনা করো।”\n“হ্যাঁ।”",
  "বাবা আবার খবরের কাগজে মন দিলেন। কথাবার্তা শেষ। কিন্তু অরাত্রিকার মনের ভেতর কথা চলতেই থাকল।",
  "লেখালিখিকে কেন অর্থহীন ভাবা হয়? পড়াশোনা কেবল নম্বর পেলেই কেন মূল্যবান হয়? সবাই জিজ্ঞেস করে আমি কত নম্বর পেলাম, কিন্তু কেউ তো জিজ্ঞেস করে না আমি কী ভাবলাম?",
  "সে নিজের থালার দিকে তাকিয়ে রইল। সে জানত প্রশ্ন না করাই বুদ্ধিমানের কাজ। তাই সে নীরবে খেয়ে নিল।",
  "স্কুলে পরিস্থিতি ছিল ভিন্ন। পুরোপুরি আলাদা নয়, কিন্তু যথেষ্ট।",
  "স্কুলের বারান্দা ছিল পায়ের শব্দ, কথাবার্তা আর হাসিতে মুখরিত। অরাত্রিকার এটা ভালো লাগত। এখানে মানুষদের অসম্পূর্ণ থাকার অনুমতি ছিল।",
  "কোনো ছাত্র অঙ্কে ভুল করতে পারত। কেউ কবিতা ভুলে যেতে পারত। কেউ প্রশ্নের ভুল উত্তর দিতে পারত। কেউ হয়তো বেশি জোরে হেসে ফেলত। পৃথিবী তো ধ্বংস হয়ে যেত না।",
  "সে ক্লাসরুমে ঢুকে নিজের চেনা আসনে বসল। ব্ল্যাকবোর্ডে লেখা ছিল:\nদশম শ্রেণী — তোমাদের ভবিষ্যৎ এখন শুরু হচ্ছে",
  "অরাত্রিকা বাক্যটির দিকে তাকিয়ে রইল। সে ভাবল ভবিষ্যৎ কি সত্যিই ক্লাসরুমে শুরু হয়? নাকি অনেক আগেই তা শুরু হয়ে যায়?",
  "হয়তো তার ভবিষ্যৎ শুরু হয়েছিল সেই দিন, যেদিন প্রথম কেউ তাকে বলেছিল যে সে কিছু করতে পারবে না। হয়তো সবার ভবিষ্যৎ শুরু হয় তাদের সম্পর্কে অন্যের বলা কোনো একটি বাক্য দিয়ে।",
  "সে পাঠ্যবই খুলল। শিক্ষিকা ক্লাসে ঢুকলেন।\n“সুপ্রভাত।”\nসারা ক্লাস উঠে দাঁড়াল।\n“সুপ্রভাত, দিদিমণি।”\n“বস।”",
  "চেয়ার নড়ল। বই খুলল। কলম খসখস করল। এবং আরেকটি সাধারণ স্কুল দিন শুরু হলো।",
  "অরাত্রিকা জানত না যে বছর শেষ হওয়ার আগেই তার নম্বর এমন এক সংখ্যায় পরিণত হবে যা মানুষ মনে রাখবে। সে জানত না যে তার নাম একদিন এমন জায়গায় পৌঁছাবে যা সে কখনো কল্পনাও করেনি। সে জানত না যে অচেনা মানুষেরা একদিন স্কুলের বইয়ের নিচে লুকানো তার শব্দগুলো পড়বে। সে নিশ্চিতভাবেই জানত না যে তার খাতাটি তার আয়ুকেও অতিক্রম করে বেঁচে থাকবে।",
  "আপাতত, সে ছিল কেবল দশম শ্রেণীতে বসা এক শান্ত কিশোরী, যে শিক্ষিকার কথা শুনছিল আর গোপনে খাতার কোণে একটি বাক্য লিখে রাখছিল:\nযদি কেউ তোমাকে কণ্ঠ না দেয়, তবে তোমাকেই নিজের কণ্ঠ লিখে নিতে হবে।",
  "সে নিচে একবার দাগ দিল। তারপর দুবার। এবং খাতাটি বন্ধ করে দিল।"
];

// Chapter 2 Text: "A House Full of Mirrors" (Authentic canon narrative)
const CHAPTER_2_PARAGRAPHS = [
  "Aratrika's house had mirrors everywhere.",
  "There was one in the bedroom.",
  "One in the hallway.",
  "One beside the front door.",
  "And a small one in the bathroom.",
  "Her mother liked mirrors.",
  "“People should always look presentable,” she often said.",
  "Aratrika wondered why being presentable mattered so much.",
  "At school, nobody cared whether her hair was perfectly arranged when she was answering a difficult question.",
  "Nobody cared about her appearance when she was reading aloud.",
  "Nobody cared about how she looked when she solved a difficult mathematics problem.",
  "Yet at home, appearance somehow entered every conversation.",
  "“Look at yourself.”",
  "“Why don't you take better care of yourself?”",
  "“Don't go outside looking like that.”",
  "The comments were rarely dramatic.",
  "That was what made them difficult.",
  "They were small. Repeated. Ordinary.",
  "A sentence here. A comparison there. A remark disguised as advice.",
  "Over time, they became walls.",
  "Aratrika began avoiding mirrors.",
  "Not because she hated herself. Because she was tired of being told how she was supposed to see herself.",
  "One afternoon, she stood before the hallway mirror.",
  "She looked at her reflection. For a few seconds, she said nothing.",
  "Then she took out her notebook. She wrote:\nPerhaps the cruelest mirror is the one other people hold in front of you.",
  "She stared at the sentence. This time, she did not cross it out.",
  "That evening, rain began falling. Aratrika sat near the window. She watched water gather on the glass.",
  "The neighbourhood blurred. Lights became golden circles. People hurried home.",
  "She opened her notebook. For the first time, she wrote a paragraph instead of a sentence.",
  "She wrote about a girl who lived in a house where everyone told her what she looked like. The girl believed them.",
  "Then one day she stopped looking into mirrors. Instead, she looked into books. And books showed her something mirrors never had. Possibilities.",
  "Aratrika stopped writing. She read the paragraph again.",
  "Then she added one final line:\nShe did not need to become beautiful. She needed to become free.",
  "The rain became heavier. Aratrika smiled. This was why she wrote.",
  "Not because she believed every sentence she wrote was good. Not because she expected anyone to read it.",
  "She wrote because paper never interrupted her. Paper never laughed. Paper never compared her. Paper simply waited. And sometimes waiting was the beginning of being heard.",
  "The next morning, the rain had stopped. Drops of water clung to the leaves outside the window. The road was still wet, reflecting the pale morning sky.",
  "Aratrika packed her schoolbag. Before leaving, she looked at the notebook beneath her books. She hesitated.",
  "Then she took it out and opened to the previous night's writing. For a moment, she wondered whether she should tear the page out. Nobody would ever know.",
  "She could destroy the words before they became evidence of thoughts she had never spoken aloud.",
  "Her fingers touched the corner of the page. Then she stopped. “No,” she whispered.",
  "It was the first time she had ever defended something she had written.",
  "She closed the notebook. She put it back into her bag. And walked out of the room.",
  "At school, the morning assembly had already begun. Aratrika joined her classmates at the back of the line.",
  "The principal was speaking about discipline. “Your school years are the foundation of your future,” he said. “What you do today will shape who you become tomorrow.”",
  "Aratrika listened carefully. She liked the idea.",
  "But she wondered whether a person's future could really be built only from marks, uniforms and examination results.",
  "The national anthem began. Everyone stood straight. Aratrika looked toward the flag.",
  "For a moment, she imagined a country where nobody had to apologize for being different. Then the anthem ended.",
  "The students returned to their classrooms. The day continued.",
  "Mathematics. English. Science. History. Lunch. Another period. Another bell. Everything appeared ordinary.",
  "But inside Aratrika's schoolbag, a small notebook carried words that were slowly becoming something more than words. They were becoming a voice.",
  "And Aratrika was beginning to discover that a voice, once found, was difficult to silence."
];

// Chapter 2 Bilingual Bengali Translations (Authentic literary matching)
const CHAPTER_2_BENGALI_PARAGRAPHS = [
  "অরাত্রিকার বাড়িতে চারিদিকে শুধু আয়না ছিল।",
  "শোওয়ার ঘরে একটা ছিল।",
  "বারান্দার গলিতে একটা ছিল।",
  "সদর দরজার পাশে একটা।",
  "আর স্নানঘরে একটা ছোট্ট আয়না ছিল।",
  "তার মা আয়না পছন্দ করতেন।",
  "“মানুষের সবসময় নিজেকে গুছিয়ে পরিপাটি রাখা উচিত,” তিনি প্রায়ই বলতেন।",
  "অরাত্রিকা ভাবত পরিপাটি থাকাটা কেন এত গুরুত্বপূর্ণ।",
  "স্কুলে সে যখন কোনো কঠিন প্রশ্নের উত্তর দিত, তখন তার চুল নিখুঁতভাবে বিন্যস্ত আছে কি না তা নিয়ে কেউ মাথা ঘামাত না।",
  "সে যখন ক্লাসে জোরে জোরে রিডিং পড়ত, তখন তার বাহ্যিক রূপ নিয়ে কেউ ভাবত না।",
  "সে যখন কোনো জটিল অঙ্কের সমাধান করত, তখন তার চেহারা কেমন তা নিয়ে কেউ ভ্রুক্ষেপ করত না।",
  "তবুও বাড়িতে, চেহারা যেন কোনো না কোনোভাবে প্রতিটি আলোচনায় চলে আসত।",
  "“নিজেকে একবার দেখো।”",
  "“তুমি কেন নিজের একটু যত্ন নাও না?”",
  "“বাইরে অমনভাবে যেও না।”",
  "মন্তব্যগুলো খুব একটা নাটকীয় বা তীব্র ছিল না।",
  "আর সেটাই সেগুলোকে বেশি কষ্টদায়ক করে তুলত।",
  "সেগুলো ছিল ছোট। বারবার বলা। সাধারণ।",
  "এখানে একটা বাক্য। ওখানে একটা তুলনা। উপদেশের ছদ্মবেশে একটা টিপ্পনী।",
  "সময়ের সাথে সাথে, সেগুলো এক একটা দেওয়াল হয়ে দাঁড়িয়েছিল।",
  "অরাত্রিকা আয়না এড়িয়ে চলতে শুরু করল।",
  "নিজেকে ঘৃণা করত বলে নয়। বরং মানুষ যেভাবে তাকে দেখবে বলে ঠিক করে দিচ্ছিল, সেভাবে নিজেকে দেখতে দেখতে সে ক্লান্ত হয়ে পড়েছিল।",
  "এক বিকেলে, সে বারান্দার আয়নাটার সামনে গিয়ে দাঁড়াল।",
  "সে নিজের প্রতিবিম্বের দিকে তাকাল। কয়েক সেকেন্ড সে কিছুই বলল না।",
  "তারপর সে তার খাতাটি বের করল। সে লিখল:\nবোধহয় সবচেয়ে নিষ্ঠুর আয়না সেটাই, যা অন্য মানুষেরা তোমার চোখের সামনে ধরে রাখে।",
  "সে বাক্যটির দিকে স্থির দৃষ্টিতে তাকিয়ে রইল। এবার সে তা কেটে দিল না।",
  "সেদিন সন্ধ্যায় বৃষ্টি নামল। অরাত্রিকা জানালার পাশে বসল। জানালার কাচে জল জমতে দেখল সে।",
  "চারপাশটা কেমন ঝাপসা হয়ে গেল। আলোর বিন্দুগুলো সোনালী বৃত্তে পরিণত হলো। মানুষজন ব্যস্ত হয়ে ঘরে ফিরছিল।",
  "সে তার খাতাটি খুলল। এবার প্রথমবার সে কোনো একটি বাক্যের বদলে পুরো একটি অনুচ্ছেদ লিখল।",
  "সে এমন এক মেয়ের কথা লিখল যে এমন এক বাড়িতে থাকত যেখানে সবাই তাকে বলত সে দেখতে কেমন। মেয়েটি তাদের কথা বিশ্বাস করেছিল।",
  "তারপর একদিন সে আয়নায় তাকানো বন্ধ করে দিল। পরিবর্তে সে বইয়ের দিকে তাকাল। আর বই তাকে এমন কিছু দেখাল যা আয়না কখনো দেখাতে পারেনি। সম্ভাবনা।",
  "অরাত্রিকা লেখা থামাল। সে অনুচ্ছেদটি আবার পড়ল।",
  "তারপর সে শেষ একটি লাইন যুক্ত করল:\nতার সুন্দর হয়ে ওঠার প্রয়োজন ছিল না। তার প্রয়োজন ছিল স্বাধীন হয়ে ওঠার।",
  "বৃষ্টি আরও জোরে নামল। অরাত্রিকা হাসল। এই জন্যেই সে লিখত।",
  "সে যে তার লেখা প্রতিটি বাক্যকে খুব ভালো ভাবত তা নয়। কেউ কোনোদিন তার লেখা পড়বে এমন আশাও সে করত না।",
  "সে লিখত কারণ কাগজ তাকে কখনো থামিয়ে দিত না। কাগজ কখনো হাসত না। কাগজ কখনো তুলনা করত না। কাগজ কেবল নীরব অপেক্ষা করত। আর কখনো কখনো এই অপেক্ষাই ছিল শোনার শুরু।",
  "পরদিন সকালে বৃষ্টি থেমে গিয়েছিল। জানালার বাইরের পাতাগুলোয় জলের ফোঁটা জমে ছিল। রাস্তা তখনও ভিজে, ফিকে সকালের আকাশের প্রতিফলন দেখা যাচ্ছিল তাতে।",
  "অরাত্রিকা তার স্কুলের ব্যাগ গুছিয়ে নিল। যাওয়ার আগে সে বইয়ের নিচে রাখা খাতাটির দিকে তাকাল। সে ইতস্তত করল।",
  "তারপর সে খাতাটি বের করল এবং আগের রাতের লেখার পাতাটি খুলল। এক মুহূর্তের জন্য সে ভাবল পাতাটি ছিঁড়ে ফেলবে কি না। কেউ কখনো জানতে পারবে না।",
  "যে ভাবনার কথা সে কখনো মুখে বলেনি, তার প্রমাণ হয়ে ওঠার আগেই সে এই শব্দগুলোকে ধ্বংস করে দিতে পারত।",
  "তার আঙুলগুলো পাতার কোণ স্পর্শ করল। তারপর সে থামল। “না,” সে ফিসফিস করে বলল।",
  "এই প্রথমবার সে নিজের লেখা কিছুর পাশে দাঁড়িয়ে তাকে রক্ষা করল।",
  "সে খাতাটি বন্ধ করল। ব্যাগের ভেতর রেখে দিল। এবং ঘর থেকে বেরিয়ে গেল।",
  "স্কুলে ভোরের প্রার্থনা সভা ইতিমধ্যেই শুরু হয়ে গিয়েছিল। অরাত্রিকা লাইনের পেছনে তার সহপাঠীদের সাথে যোগ দিল।",
  "প্রধান শিক্ষক মহাশয় শৃঙ্খলা নিয়ে কথা বলছিলেন। “তোমাদের স্কুলের এই বছরগুলোই তোমাদের ভবিষ্যতের ভিত্তি,” তিনি বলছিলেন। “আজ তোমরা যা করবে, তাই তোমাদের আগামীকালকে রূপ দেবে।”",
  "অরাত্রিকা মন দিয়ে শুনল। তার এই ভাবনাটা বেশ পছন্দ হলো।",
  "কিন্তু সে ভাবল কোনো মানুষের ভবিষ্যৎ কি সত্যিই কেবল নম্বর, স্কুলের পোশাক আর পরীক্ষার ফল দিয়ে গড়ে উঠতে পারে?",
  "জাতীয় সঙ্গীত শুরু হলো। সবাই সোজা হয়ে দাঁড়াল। অরাত্রিকা পতাকার দিকে তাকাল।",
  "এক মুহূর্তের জন্য সে এমন এক দেশের কথা কল্পনা করল যেখানে কাউকে আলাদা হওয়ার জন্য ক্ষমা চাইতে হয় না। তারপর জাতীয় সঙ্গীত শেষ হলো।",
  "ছাত্রছাত্রীরা ক্লাসরুমে ফিরে গেল। দিনটি চলতে থাকল।",
  "গণিত। ইংরেজি। বিজ্ঞান। ইতিহাস। দুপুরের খাওয়া। আরেকটি পিরিয়ড। আরেকটি ঘণ্টা। সবকিছুই সাধারণ দেখাল।",
  "কিন্তু অরাত্রিকার স্কুলের ব্যাগের ভেতরে, একটা ছোট্ট খাতা এমন কিছু শব্দ বয়ে নিয়ে চলেছিল যা ধীরে ধীরে শব্দের চেয়েও বেশি কিছু হয়ে উঠছিল। তা একটি কণ্ঠস্বর হয়ে উঠছিল।",
  "এবং অরাত্রিকা আবিষ্কার করতে শুরু করেছিল যে, একবার পাওয়া কণ্ঠস্বরকে নীরব করা বড়ই কঠিন।"
];

// Chapter 3 Text: "The Quiet Library" (Authentic canon narrative)
const CHAPTER_3_PARAGRAPHS = [
  "The library was the only place in the school where silence was not an instruction; it was an agreement.",
  "Every afternoon, when the final bell signalled the end of classes and the corridors erupted with running footsteps and loud goodbyes, Aratrika walked toward the library.",
  "It smelled of old paper, polished wood, and rain.",
  "Mrs. Sen, the librarian, rarely looked up from her desk. She was an elderly woman with silver hair tied neatly in a bun and glasses that slipped down the bridge of her nose. She did not ask students why they were there. She did not demand to know their marks. She simply let them read.",
  "Aratrika loved the rows of tall wooden bookshelves. They stood like quiet sentinels holding thousands of lives between their covers.",
  "On this particular afternoon, she sat at a corner table near the tall window.",
  "Raindrops were beginning to tap against the glass again, blurring the courtyard outside.",
  "She took out her notebook.",
  "For the first time in days, she did not write poetry or observations. Instead, she wrote a question at the top of a clean page:\nWhy do people fear the things they do not understand?",
  "She stared at the words.",
  "She thought of her father reading his newspaper, measuring her worth in percentages. She thought of the mirrors at home, reflecting only what was on the outside. She thought of the school assembly, where thousands of students stood in straight lines, reciting the same pledges, wearing the same uniforms, trying desperately not to stand out.",
  "\"It is easier to follow a crowd than to build a road,\" a voice said softly.",
  "Aratrika jumped slightly and closed her notebook.",
  "Standing beside the table was Prangik. He was a quiet boy from her class, known mostly for carrying books that were far too thick for their age and for always sitting by himself during lunch. He held a copy of a book on astronomy.",
  "\"Did you say something?\" Aratrika asked, her heart beating a little faster.",
  "\"Just thinking out loud,\" Prangik said, pointing gently at the open page of her notebook before she could hide it completely. \"You write a lot.\"",
  "Aratrika felt a sudden rush of panic. Her first instinct was to pull the notebook away, to protect the secret space she had built for herself.",
  "Instead, she asked, \"Do you think it's wrong?\"",
  "Prangik pulled out the chair opposite her and sat down. He looked at her with steady, curious eyes.",
  "\"Writing? Why would writing be wrong?\"",
  "\"Not writing,\" Aratrika lowered her voice. \"Writing this. Questions. Thoughts. Things nobody tells you to think.\"",
  "Prangik smiled. It was a quiet, understanding smile that instantly made the tension leave Aratrika's shoulders.",
  "\"Everyone thinks those things,\" Prangik said. \"Most people are just too afraid to write them down.\"",
  "They sat in silence for a few moments, listening to the steady drumming of the rain against the windowpane.",
  "For Aratrika, something shifted in that quiet library. For the first time, she realized she wasn't entirely alone in her thoughts. There were others who looked at the world and saw more than just rules and expectations.",
  "When the library bell rang to signal closing time, Aratrika slipped her notebook back into her bag.",
  "As she stood up to leave, Prangik looked at her and said, \"Keep writing, Aratrika. Some people need to read things they're too afraid to say.\"",
  "She nodded, not trusting her voice to speak.",
  "Walking home through the damp evening air, the streetlights flickered on one by one. The world around her looked the same—the houses had the same walls, the rules were still in place, and her home still waited for her with its endless mirrors.",
  "But inside her schoolbag, the notebook felt a little lighter.",
  "And for the first time, Aratrika did not look down when she passed a mirror. She looked straight ahead."
];

// Chapter 3 Bilingual Bengali Translations (Authentic literary matching)
const CHAPTER_3_BENGALI_PARAGRAPHS = [
  "লাইব্রেরিটি ছিল স্কুলের একমাত্র জায়গা যেখানে নীরবতা কোনো নির্দেশ ছিল না; এটি ছিল একটি পারস্পরিক চুক্তি।",
  "প্রতিদিন বিকেলে, যখন শেষ ঘণ্টা ক্লাসের সমাপ্তি নির্দেশ করত এবং বারান্দাগুলো ছুটন্ত পায়ের শব্দ আর বিদায় জানানোর চিৎকারে ফেটে পড়ত, অরাত্রিকা লাইব্রেরির দিকে হেঁটে যেত।",
  "এটি পুরনো কাগজ, পালিশ করা কাঠ আর বৃষ্টির গন্ধ বয়ে আনত।",
  "গ্রন্থাগারিক মিসেস সেন খুব কমই তার ডেস্ক থেকে মাথা তুলতেন। তিনি ছিলেন মাথায় রুপোলি চুল পরিপাটি করে খোঁপা করা এবং নাকের ডগায় চশমা ঝুলে থাকা এক বৃদ্ধা। তিনি শিক্ষার্থীদের জিজ্ঞাসা করতেন না কেন তারা সেখানে এসেছে। তিনি তাদের নম্বর জানতেও চাইতেন না। তিনি স্রেফ তাদের পড়তে দিতেন।",
  "অরাত্রিকা কাঠের লম্বা বুকসেলফের সারিগুলোকে ভালোবাসত। মলাটের অন্তরালে হাজার হাজার জীবন ধরে রেখে তারা যেন শান্ত প্রহরীর মতো দাঁড়িয়ে থাকত।",
  "এই বিশেষ বিকেলে, সে লম্বা জানালার পাশের এক কোণের টেবিলে বসল।",
  "বৃষ্টির ফোঁটাগুলো আবার কাচের জানালার ওপর টোকা দিতে শুরু করেছিল, বাইরের উঠোনটাকে আবছা করে দিচ্ছিল।",
  "সে তার খাতাটি বের করল।",
  "বহু দিন পর প্রথমবার, সে কোনো কবিতা বা পর্যবেক্ষণ লিখল না। তার বদলে সে একটি পরিষ্কার পাতার একদম উপরে একটি প্রশ্ন লিখল:\nমানুষ কেন সেই জিনিসগুলোকে ভয় পায় যা তারা বুঝতে পারে না?",
  "সে শব্দগুলোর দিকে তাকিয়ে রইল।",
  "সে ভাবল তার বাবার কথা, যিনি খবরের কাগজ পড়তেন আর তার যোগ্যতাকে শতকরা হারে পরিমাপ করতেন। সে ভাবল বাড়ির আয়নাগুলোর কথা, যা কেবল বাইরের দিকটাকেই প্রতিফলিত করত। সে ভাবল স্কুলের প্রার্থনা সভার কথা, যেখানে হাজার হাজার শিক্ষার্থী সোজা লাইনে দাঁড়িয়ে একই শপথ আবৃত্তি করত, একই পোশাক পরত এবং মরিয়া হয়ে চেষ্টা করত সবার থেকে আলাদা না হতে।",
  "“রাস্তা তৈরি করার চেয়ে ভিড় অনুসরণ করা অনেক সহজ,” একটি কণ্ঠস্বর নরম করে বলল।",
  "অরাত্রিকা কিছুটা চমকে উঠল এবং খাতাটি বন্ধ করে দিল।",
  "টেবিলের পাশে দাঁড়িয়ে ছিল প্রাঙ্গিক। সে ছিল তার ক্লাসের এক শান্ত ছেলে, যে মূলত তার বয়সের তুলনায় অনেক বেশি মোটা বই বহন করার জন্য এবং দুপুরের খাবারের সময় সবসময় একা বসার জন্য পরিচিত ছিল। তার হাতে জ্যোতির্বিজ্ঞানের একটি বই ছিল।",
  "“তুমি কিছু বললে?” অরাত্রিকা জিজ্ঞেস করল, তার বুকের স্পন্দন কিছুটা বেড়ে গেল।",
  "“এমনি মনে মনে ভাবছিলাম,” প্রাঙ্গিক বলল এবং খাতাটি সম্পূর্ণ লুকিয়ে ফেলার আগেই মৃদু ইশারায় তার খোলা পৃষ্ঠার দিকে ইঙ্গিত করল। “তুমি অনেক লেখো।”",
  "অরাত্রিকা হঠাৎ আতঙ্কের এক তীব্র অনুভূতি টের পেল। তার প্রথম সহজাত প্রবৃত্তি ছিল খাতাটি টেনে সরিয়ে নেওয়া, নিজের জন্য গড়ে তোলা তার গোপন আশ্রয়টুকুকে রক্ষা করা।",
  "পরিবর্তে সে জিজ্ঞেস করল, “তুমি কি মনে করো এটা ভুল?”",
  "প্রাঙ্গিক তার বিপরীতের চেয়ারটি টেনে নিয়ে বসল। সে তার দিকে স্থির, কৌতূহলী চোখে তাকাল।",
  "“লেখা? লেখালিখি কেন ভুল হতে যাবে?”",
  "“সাধারণ লেখা নয়,” অরাত্রিকা গলার স্বর নামাল। “এইসব লেখা। প্রশ্ন। চিন্তা। এমন সব জিনিস যা তোমাকে কেউ ভাবতে বলেনি।”",
  "প্রাঙ্গিক হাসল। এটি ছিল এক শান্ত, সহমর্মী হাসি যা অরাত্রিকার কাঁধের সমস্ত জড়তা মুহূর্তেই দূর করে দিল।",
  "“সবাই এগুলো ভাবে,” প্রাঙ্গিক বলল। “বেশিরভাগ মানুষ কেবল সেগুলো লিখে রাখতে ভয় পায়।”",
  "তারা কয়েক মুহূর্ত নীরব হয়ে বসে রইল, জানালার কাচে বৃষ্টির একটানা রিনিঝিনি শব্দ শুনল।",
  "অরাত্রিকার জন্য, সেই শান্ত লাইব্রেরিতে যেন কোনো কিছুর পরিবর্তন ঘটল। প্রথমবার সে উপলব্ধি করল যে সে তার ভাবনায় সম্পূর্ণ একা নয়। এমন আরও মানুষ আছে যারা আকাশের দিকে তাকায় এবং শুধু নিয়ম আর প্রত্যাশার চেয়েও বেশি কিছু দেখতে পায়।",
  "যখন লাইব্রেরি বন্ধের ঘণ্টা বাজল, অরাত্রিকা তার খাতাটি ব্যাগের ভেতরে ঢুকিয়ে নিল।",
  "যাওয়ার জন্য উঠে দাঁড়াতেই প্রাঙ্গিক তার দিকে তাকাল এবং বলল, “লিখে যাও, অরাত্রিকা। কিছু মানুষের এমন কিছু জিনিস পড়া দরকার যা তারা নিজেরা মুখে বলতে ভয় পায়।”",
  "সে মাথা নাড়ল, মুখে বলার মতো সাহস তখন তার গলায় ছিল না।",
  "স্যাঁতসেঁতে সন্ধ্যার বাতাসের মধ্য দিয়ে বাড়ি ফেরার সময় রাস্তার আলোগুলো একে একে জ্বলে উঠল। তার চারপাশের পৃথিবীটা একই রকম দেখাচ্ছিল—বাড়িগুলোর একই রকম দেওয়াল ছিল, নিয়মগুলো বহাল ছিল এবং তার বাড়ি এখনও তার জন্য অপেক্ষা করছিল তার অনন্ত আয়নাগুলো নিয়ে।",
  "কিন্তু তার স্কুলের ব্যাগের ভেতরে খাতাটা আজ কিছুটা হালকা মনে হলো।",
  "এবং এই প্রথমবার, অরাত্রিকা কোনো আয়না অতিক্রম করার সময় চোখ নিচু করল না। সে সোজা সামনের দিকে তাকাল।"
];

// Chapter 4 Text: "The Girl at the Window" (Authentic canon narrative)
const CHAPTER_4_PARAGRAPHS = [
  "There was a window in Aratrika's room that faced the road. It was not a particularly beautiful view. There were houses packed closely together, electrical wires crossing the sky, a tea stall at the corner and a narrow road where bicycles, buses and pedestrians competed for space.",
  "But Aratrika loved the window. From there, she could watch the world without being required to participate in it. Every morning, she saw the same things: the milkman arriving, children walking to school, shopkeepers lifting their shutters, workers waiting for buses, women carrying shopping bags, and old men sitting outside the tea stall discussing the day's news.",
  "The neighbourhood was ordinary. But Aratrika had learned that ordinary places were full of extraordinary stories. She only had to notice them.",
  "One afternoon, she sat beside the window with her mathematics textbook open. The textbook had been open for almost twenty minutes. She had not read a single line. Her attention was outside.",
  "An old woman was walking slowly along the road. She stopped beside a small flower seller. The seller handed her a bunch of flowers. The woman counted some coins and gave them to him. Then she walked away.",
  "Aratrika wondered where she was going. Perhaps to a temple. Perhaps to someone's house. Perhaps to visit a person she loved. She would never know. That thought fascinated her. Every person she saw had a story she would never hear.",
  "She opened her notebook. 'Every window is a library,' she wrote. She paused. Then continued: 'Every person outside carries a book that nobody else can completely read.' She smiled. The sentence felt right. She wrote another: 'Perhaps writing is simply the attempt to read those invisible books.'",
  "“Aratrika.” She looked up. Her mother stood at the door. “Why are you sitting there again?” “I'm studying.” Her mother looked at the textbook. “You've been on the same page for half an hour.”",
  "Aratrika closed the notebook. “I was thinking.” “Thinking won't finish your syllabus.” Aratrika said nothing. Her mother sighed. “Your exams are important.” “I know.” “You have to concentrate.” “I will.”",
  "Her mother left. Aratrika looked at the closed textbook. She knew her mother was not entirely wrong. Examinations mattered. She wanted to do well. Very well. But sometimes she wished the adults around her understood that studying and thinking were not enemies. She opened the mathematics book again. This time, she began solving the problem.",
  "The following week, something unexpected happened at school. The English teacher announced that the school would hold a writing competition. The topic was: “The India I Want to See.”",
  "The classroom immediately became noisy. Some students were excited. Others complained. Aratrika remained silent. The teacher wrote the topic on the board. “Anyone who wants to participate can submit an entry by Friday.”",
  "A hand went up. “Ma'am, is there a word limit?” “About one thousand words.” Another student asked, “Can we write in Bengali?” “Yes.”",
  "Aratrika looked at the board. For several seconds, she could not move. Bengali. Her mother tongue. The language in which she thought when she was alone. The language of the poems she loved. The language of the notebook beneath her mattress.",
  "She raised her hand. “Yes, Aratrika?” “I'll participate.” The teacher nodded. “Good.” That simple decision frightened her. Until then, her writing had belonged only to her. Now someone else would read it. Perhaps judge it. Perhaps criticize it. Perhaps laugh at it. But she had already raised her hand. There was no taking it back.",
  "That evening, she sat beside the window. The sun was setting. The sky had turned orange. The road below was becoming quieter. She opened a fresh notebook. At the top of the first page, she wrote: The India I Want to See.",
  "Then she stopped. She did not want to write about monuments. She did not want to list famous achievements. She did not want to repeat sentences she had read in textbooks. She wanted to write about people.",
  "About the girl who was told that her dreams were too large. About the boy who was told that failure made him worthless. About families that measured children only by marks. About children who were taught to fear questions. About people who were judged before they were understood.",
  "She began writing. The words came slowly at first. Then faster. She wrote until the evening became night. She wrote until her fingers hurt. She wrote until the page was filled. Then she turned it over. And continued.",
  "Near midnight, she finally stopped. She read what she had written. It was not perfect. Some sentences were awkward. Some ideas needed improvement. But it was hers. She had not copied it from a book. She had not written what she thought someone wanted to hear. She had written what she believed.",
  "Aratrika placed the pages carefully inside a folder. Then she looked through the window. The street was almost empty. A single streetlight illuminated the road. She wondered how many people were awake behind the hundreds of windows around her. How many were studying. How many were dreaming. How many were afraid. How many had something to say but nobody willing to listen.",
  "She whispered to herself: “Maybe someday.” She did not know what the words meant. Maybe someday she would publish a book. Maybe someday she would speak before a crowd. Maybe someday she would change something. Or maybe someday she would simply understand herself better.",
  "For now, writing was enough. She closed the window. Then placed the folder beside her schoolbooks. For the first time, Aratrika was not hiding her words beneath the mattress. She was preparing to let them leave the room. And she did not yet know that once words leave their writer, they begin a journey of their own."
];

// Chapter 4 Bilingual Bengali Translations
const CHAPTER_4_BENGALI_PARAGRAPHS = [
  "অরাত্রিকার ঘরে একটা জানালা ছিল যা রাস্তার দিকে মুখ করা ছিল। দৃশ্যটি বিশেষ সুন্দর কিছু ছিল না। গাদাগাদি করে তৈরি বাড়ি, আকাশে তারের জাল, মোড়ের মাথায় চায়ের দোকান আর এক চিলতে রাস্তা যেখানে সাইকেল, বাস আর পথচারীরা চলাচলের জায়গার জন্য লড়াই করত।",
  "কিন্তু অরাত্রিকা জানালাটাকে ভালোবাসত। সেখান থেকে সে পৃথিবীর অংশ না হয়েও পৃথিবীকে দেখতে পেত। প্রতিদিন সকালে সে একই দৃশ্য দেখত: দুধওয়ালার আগমন, শিশুদের স্কুলে যাওয়া, দোকানদারদের ঝাঁপ তোলা, যাত্রীদের বাসের জন্য অপেক্ষা, কেনাকাটার ব্যাগ হাতে মহিলাদের যাওয়া আর চায়ের দোকানের সামনে বসে প্রবীণদের সংবাদপত্রের আলোচনা।",
  "এলাকাটা ছিল একেবারেই সাধারণ। কিন্তু অরাত্রিকা শিখেছিল যে সাধারণ জায়গাগুলোই অসাধারণ সব গল্পে ভরা থাকে। শুধু একটু খেয়াল করে দেখতে হয়।",
  "একদিন বিকেলে সে গণিতের পাঠ্যবই খুলে জানালার পাশে বসেছিল। বইটি প্রায় কুড়ি মিনিট ধরে খোলাই ছিল। সে একটা লাইনও পড়েনি। তার সমস্ত মনোযোগ ছিল জানালার বাইরে।",
  "রাস্তা দিয়ে এক বৃদ্ধা ধীরে ধীরে হেঁটে যাচ্ছিলেন। তিনি এক ছোট ফুল বিক্রেতার পাশে থামলেন। ফুলওয়ালা তার হাতে একগুচ্ছ ফুল তুলে দিল। বৃদ্ধা কিছু কয়েন গুনে তাকে দিলেন। তারপর তিনি হেঁটে চলে গেলেন।",
  "অরাত্রিকা ভাবল তিনি কোথায় যাচ্ছেন। হয়তো কোনো মন্দিরে। হয়তো কারও বাড়ি। কিংবা হয়তো যাকে ভালোবাসেন তার কাছে। সে কোনোদিন জানতে পারবে না। এই ভাবনাটাই তাকে মুগ্ধ করল। প্রতিটি মানুষের এমন এক গল্প থাকে যা অন্য কেউ কখনো শুনতে পায় না।",
  "সে তার খাতাটি খুলল। 'প্রতিটি জানালাই একটি লাইব্রেরি,' সে লিখল। সে একটু থামল। তারপর লিখল: 'বাইরের প্রতিটি মানুষ এমন একটি বই বহন করে যা অন্য কেউ সম্পূর্ণ পড়তে পারে না।' সে হাসল। বাক্যটা যথার্থ মনে হলো। সে আরেকটি লিখল: 'হয়তো লেখালিখি হলো সেই অদৃশ্য বইগুলো পড়ার এক বিনম্র প্রয়াস।'",
  "“অরাত্রিকা।” সে মুখ তুলে তাকাল। দরজায় মা দাঁড়িয়ে। “আবার ওখানে বসে আছ কেন?” “পড়ছি তো।” মা পাঠ্যবইয়ের দিকে তাকালেন। “আধঘণ্টা ধরে একই পাতায় বসে আছ।”",
  "অরাত্রিকা খাতাটা বন্ধ করল। “ভাবছিলাম।” “ভাবলে পাঠ্যক্রম শেষ হবে না।” অরাত্রিকা কিছু বলল না। মা দীর্ঘশ্বাস ফেললেন। “পরীক্ষাগুলো কিন্তু খুব জরুরি।” “জানি।” “মনোযোগ দিতে হবে।” “দেব।”",
  "মা চলে গেলেন। অরাত্রিকা বন্ধ বইটির দিকে তাকাল। সে জানত মা পুরোপুরি ভুল বলেননি। পরীক্ষার মূল্য আছে। সে ভালো ফল করতে চেয়েছিল। খুব ভালো। কিন্তু সে কখনো কখনো চাইত বড়রা বুঝুক যে পড়া আর ভাবনা একে অপরের শত্রু নয়। সে গণিতের বইটি আবার খুলল। এবার সে অঙ্কের সমাধান করতে শুরু করল।",
  "পরের সপ্তাহে স্কুলে এক অপ্রত্যাশিত ঘটনা ঘটল। ইংরেজি শিক্ষিকা ঘোষণা করলেন যে স্কুলে একটি রচনা প্রতিযোগিতা অনুষ্ঠিত হবে। বিষয় ছিল: “যে ভারতকে আমি দেখতে চাই।”",
  "ক্লাসরুম সঙ্গে সঙ্গে কোলাহলে মুখরিত হয়ে উঠল। কিছু ছাত্রছাত্রী উৎসাহিত হলো, কেউ কেউ অভিযোগ করল। অরাত্রিকা শান্ত হয়ে রইল। শিক্ষিকা ব্ল্যাকবোর্ডে বিষয়টি লিখলেন। “যে অংশগ্রহণ করতে চাও, শুক্রবারের মধ্যে জমা দেবে।”",
  "একজন হাত তুলল। “দিদিমণি, শব্দের কোনো সীমা আছে?” “প্রায় এক হাজার শব্দ।” আরেকজন জিজ্ঞেস করল, “বাংলায় লেখা যাবে?” “হ্যাঁ।”",
  "অরাত্রিকা ব্ল্যাকবোর্ডের দিকে তাকিয়ে রইল। কয়েক সেকেন্ড সে নড়তে পারল না। বাংলা। তার মাতৃভাষা। যে ভাষায় সে একা থাকলে চিন্তা করে। যে ভাষায় লেখা কবিতা সে ভালোবাসে। তার তোশকের নিচে রাখা খাতার ভাষা।",
  "সে হাত তুলল। “হ্যাঁ, অরাত্রিকা?” “আমি অংশগ্রহণ করব।” শিক্ষিকা মাথা নাড়লেন। “ভালো।” এই সাধারণ সিদ্ধান্তটি তাকে চমকে দিল। এতদিন তার লেখা কেবল তার একার ছিল। এবার অন্য কেউ তা পড়বে। হয়তো বিচার করবে। সমালোচনা করবে। হয়তো উপহাস করবে। কিন্তু সে ইতিমধ্যেই হাত তুলে ফেলেছে। ফিরিয়ে নেওয়ার উপায় নেই।",
  "সেদিন সন্ধ্যায় সে জানালার পাশে বসল। সূর্য অস্ত যাচ্ছিল। আকাশ কমলা বর্ণ ধারণ করেছিল। নিচের রাস্তাটা শান্ত হয়ে আসছিল। সে একটি নতুন খাতা খুলল। প্রথম পাতার শীর্ষে লিখল: যে ভারতকে আমি দেখতে চাই।",
  "তারপর সে থামল। সে স্মৃতিসৌধ নিয়ে লিখতে চায়নি। সে বিখ্যাত সাফল্যের তালিকা তৈরি করতে চায়নি। পাঠ্যবইয়ের মুখস্থ বাক্য আওড়াতে চায়নি। সে মানুষ নিয়ে লিখতে চেয়েছিল।",
  "সেই মেয়েটির কথা যাকে বলা হয়েছিল তার স্বপ্ন অনেক বেশি বড়। সেই ছেলেটির কথা যাকে বলা হয়েছিল ব্যর্থতা তাকে মূল্যহীন করে দেয়। সেইসব পরিবারের কথা যারা কেবল নম্বর দিয়ে সন্তানদের পরিমাপ করে। সেইসব শিশুর কথা যাদের প্রশ্ন করতে ভয় শেখানো হয়। সেই মানুষদের কথা যাদের বোঝার আগেই বিচার করে ফেলা হয়।",
  "সে লিখতে শুরু করল। প্রথমে শব্দগুলো ধীরে ধীরে এলো। তারপর দ্রুত। সে লিখল যতক্ষণ না সন্ধ্যা রাতে পরিণত হলো। লিখল যতক্ষণ না আঙুল ব্যথা করতে লাগল। যতক্ষণ না পাতাটি ভরে গেল। তারপর সে পাতা উল্টাল। এবং লিখে চলল।",
  "মধ্যরাতের কাছাকাছি সে অবশেষে থামল। সে যা লিখেছে তা পড়ল। এটি নিখুঁত ছিল না। কিছু বাক্য আড়ষ্ট ছিল। কিছু ভাবনার আরও উন্নতির প্রয়োজন ছিল। কিন্তু এটি ছিল তার নিজের। সে বই থেকে নকল করেনি। কেউ শুনতে চায় এমন ভেবে লেখেনি। সে তাই লিখেছে যা সে বিশ্বাস করে।",
  "অরাত্রিকা পাতাগুলো যত্ন করে একটি ফোল্ডারে রাখল। তারপর জানালার বাইরে তাকাল। রাস্তাটা প্রায় ফাঁকা। একটা একক ল্যাম্পপোস্ট রাস্তাটিকে আলোকিত করে রেখেছে। সে ভাবল চারপাশের শত শত জানালার ওপারে কত মানুষ এখন জেগে আছে। কতজন পড়ছে। কতজন স্বপ্ন দেখছে। কতজন ভীত। কতজনের কিছু বলার আছে কিন্তু শোনার মতো কেউ নেই।",
  "সে নিজের মনে ফিসফিস করল: “হয়তো কোনো একদিন।” সে জানত না এই কথার অর্থ কী। হয়তো কোনো একদিন সে বই প্রকাশ করবে। হয়তো কোনো একদিন জনতার সামনে কথা বলবে। হয়তো কোনো কিছু বদলে দেবে। অথবা হয়তো কোনো একদিন নিজেকে আরেকটু ভালোভাবে বুঝতে পারবে।",
  "আপাতত লেখালিখিই ছিল যথেষ্ট। সে জানালা বন্ধ করল। তারপর ফোল্ডারটি পাঠ্যবইয়ের পাশে রাখল। প্রথমবার অরাত্রিকা তার শব্দগুলো তোশকের নিচে লুকিয়ে রাখল না। সে তাদের ঘর ছেড়ে বেরিয়ে যাওয়ার জন্য প্রস্তুত করছিল। এবং সে তখনো জানত না যে শব্দ একবার লেখককে ছেড়ে গেলে, তারা নিজেদের এক অনন্ত যাত্রা শুরু করে।"
];

// Chapter 5 Text: "What They Called Her"
const CHAPTER_5_PARAGRAPHS = [
  "By the following Monday, the writing competition had become the most discussed event in Aratrika's class. Not because everyone cared about writing, but mostly because everyone wanted to know who would win.",
  "“I heard the winner gets a certificate.” “And a book set.” “No, I think there is a trophy.” “Who cares? I'll win anyway.” The classroom filled with predictions.",
  "Aratrika sat quietly at her desk. Her essay was inside her schoolbag. She had read it three times that morning. Each time, she found something she wanted to change. She had finally stopped herself. If she kept editing, she would never submit it.",
  "A girl dropped into the seat beside her. “Are you participating?” Aratrika looked up. It was Krittika. They had been classmates for years, though they were not particularly close. Krittika was confident, outspoken and rarely seemed afraid of saying what she thought. “Yes,” Aratrika replied.",
  "“What did you write about?” “The topic.” Krittika laughed. “You know what I meant.” Aratrika smiled. “I'm keeping it secret.” “Fine. Then I'll keep mine secret too.” “What did you write?” “That's a secret.” They both laughed. It was a small conversation.",
  "Krittika noticed things about Aratrika that many others didn't. She noticed that Aratrika rarely spoke unless she had something meaningful to say. She noticed that Aratrika always carried a notebook. She noticed that when teachers asked difficult questions, Aratrika often knew the answer but sometimes waited before raising her hand. And she noticed that Aratrika wrote whenever she was alone.",
  "One afternoon, Krittika saw her writing near the classroom window. “What are you writing?” Aratrika quickly closed the notebook. “Nothing.” “You always say that.” “Because it's usually nothing.” Krittika leaned against the desk. “Then why do you look so serious when you're writing nothing?”",
  "Aratrika laughed. “I don't know.” Krittika looked at the notebook. “You should publish something someday.” Aratrika looked surprised. “Why?” “Because you write all the time.” “That doesn't mean it's good.” “Neither does talking,” Krittika replied. “And I still talk.” Aratrika laughed again. For the first time, she saw Krittika differently.",
  "At home that evening, Aratrika placed her essay on the dining table. Mr. Saha was reading the newspaper. Mrs. Saha was arranging dinner. “What is that?” her father asked. “An essay.” “For school?” “Yes.” “Competition?” “Yes.”",
  "Mr. Saha picked up the pages. He read the title. The India I Want to See. He looked at Aratrika. “What have you written?” “About the kind of country I want.” He read the first paragraph. Then another. His expression became difficult for her to understand. Finally, he put the pages down.",
  "“You spend too much time thinking about things beyond your age.” Aratrika looked at him. “Is that bad?” “You should concentrate on your studies first.” “I do.” “Then let these things come later.” Aratrika wanted to ask when “later” would arrive. She didn't.",
  "Mrs. Saha quietly took the papers from the table. She read them. Unlike her husband, she did not immediately say anything. After a while, she handed them back. “Your handwriting is very neat,” she said. Aratrika smiled. “Thank you.” It was not the response she had hoped for. But it was enough.",
  "The next morning, something happened that Aratrika would remember for years. The teacher returned the essays. Some students were disappointed. Some were excited. A few immediately began comparing their marks. Aratrika waited. Her paper finally reached her desk.",
  "At the top was a red mark. Excellent. Underneath, the teacher had written: Your ideas are mature. Continue writing. Aratrika stared at the words. Continue writing. Again. Those three words seemed to follow her everywhere. She folded the paper carefully and placed it inside her notebook.",
  "Krittika leaned across. “What did you get?” Aratrika showed her. Krittika smiled. “I knew it.” “You didn't even read it.” “I didn't need to.” “How?” “You look different when you're proud of something.” Aratrika looked away. “I'm not proud.” “You are.” “Maybe a little.” Krittika smiled. “Good.”",
  "That afternoon, Aratrika went to the library. She liked the library because it was quiet without being lonely. She walked between the shelves. Books stood in rows, each carrying someone else's thoughts. She pulled out a Bengali literature book. As she opened it, a loose sheet of paper fell from between the pages. She picked it up. It contained a handwritten sentence: Words do not disappear merely because nobody hears them."
];

const CHAPTER_5_BENGALI_PARAGRAPHS = [
  "পরের সোমবারের মধ্যে, রচনা প্রতিযোগিতাটি অরাত্রিকার ক্লাসের সবচেয়ে আলোচিত ঘটনায় পরিণত হয়েছিল। সবাই লেখালিখি নিয়ে খুব যত্নশীল ছিল এমন নয়, বরং সবাই জানতে উদগ্রীব ছিল কে জিতবে।",
  "“আমি শুনেছি বিজয়ী একটি সার্টিফিকেট পাবে।” “আর একটি বইয়ের সেট।” “না, আমার মনে হয় একটা ট্রফি আছে।” “কে পরোয়া করে? আমিই তো জিতব।” শ্রেণীকক্ষটি নানারকম পূর্বাভাসে মুখরিত হয়ে উঠল।",
  "অরাত্রিকা তার আসনে চুপচাপ বসে রইল। তার রচনাটি তার স্কুলের ব্যাগের ভেতরে ছিল। সে সকালে এটি তিনবার পড়েছে। প্রতিবারই সে এমন কিছু পেয়েছে যা সে বদলাতে চেয়েছিল। অবশেষে সে নিজেকে থামাল। সে যদি সম্পাদনা করতেই থাকত, তবে তা আর কখনো জমা দিতে পারত না।",
  "একটি মেয়ে এসে তার পাশের আসনে বসল। “তুমি কি অংশ নিচ্ছ?” অরাত্রিকা মুখ তুলল। সে কৃত্তিকা। তারা বছরের পর বছর ধরে সহপাঠী ছিল, যদিও খুব একটা ঘনিষ্ট ছিল না। কৃত্তিকা ছিল আত্মবিশ্বাসী, স্পষ্টভাষী এবং যা মনে করত তা বলতে ভয় পেত না। “হ্যাঁ,” অরাত্রিকা উত্তর দিল।",
  "“কী নিয়ে লিখেছ?” “বিষয়টা নিয়ে।” কৃত্তিকা হেসে উঠল। “তুমি জানো আমি কী বলতে চেয়েছি।” অরাত্রিকা হাসল। “আমি গোপন রাখছি।” “বেশ। তাহলে আমিও আমারটা গোপন রাখব।” “কী লিখেছ তুমি?” “সেটা গোপন।” তারা দুজনেই হেসে উঠল। এটি ছিল একটি ছোট্ট কথোপকথন।",
  "কৃত্তিকা অরাত্রিকার এমন কিছু বিষয় লক্ষ করেছিল যা অনেকেই করেনি। সে লক্ষ করেছিল যে অরাত্রিকা খুব একটা কথা বলত না যদি না তার বলার মতো কিছু অর্থপূর্ণ বিষয় থাকত। সে লক্ষ করেছিল অরাত্রিকা সবসময় একটি খাতা সঙ্গে রাখত। সে লক্ষ করেছিল শিক্ষিকারা যখন কঠিন প্রশ্ন করতেন, অরাত্রিকা প্রায়ই তার উত্তর জানত কিন্তু হাত তোলার আগে কিছুটা অপেক্ষা করত। এবং সে লক্ষ করেছিল অরাত্রিকা যখনই একা থাকত তখনই কিছু লিখত।",
  "এক বিকেলে কৃত্তিকা তাকে জানালার পাশে লিখতে দেখল। “কী লিখছ তুমি?” অরাত্রিকা দ্রুত খাতাটি বন্ধ করে দিল। “কিছু না।” “তুমি সবসময় এই কথাই বলো।” “কারণ সাধারণত ওটা কিছু না-ই।” কৃত্তিকা ডেস্কের ওপর ঝুঁকল। “তাহলে কিছু না লিখে তোমার মুখ এত গম্ভীর কেন?”",
  "অরাত্রিকা হেসে উঠল। “জানি না।” কৃত্তিকা খাতাটির দিকে তাকাল। “তোমার কিছু একটা প্রকাশ করা উচিত কোনো একদিন।” অরাত্রিকা অবাক হলো। “কেন?” “কারণ তুমি সবসময় লেখো।” “তার মানে এই নয় যে তা ভালো।” “কথা বলাও তো সবসময় ভালো হয় না,” কৃত্তিকা উত্তর দিল। “তাও তো আমি কথা বলি।” অরাত্রিকা আবার হেসে উঠল। প্রথমবার সে কৃত্তিকাকে অন্যভাবে দেখল।",
  "সেদিন সন্ধ্যায় বাড়িতে অরাত্রিকা তার রচনাটি ডাইনিং টেবিলে রাখল। শ্রী সাহা খবরের কাগজ পড়ছিলেন। মিসেস সাহা রাতের খাবার সাজাচ্ছিলেন। “ওটা কী?” তার বাবা জিজ্ঞেস করলেন। “একটি রচনা।” “স্কুলের জন্য?” “হ্যাঁ।” “প্রতিযোগিতা?” “হ্যাঁ।”",
  "শ্রী সাহা পাতাগুলো তুলে নিলেন। তিনি শিরোনামটি পড়লেন। যে ভারতকে আমি দেখতে চাই। তিনি অরাত্রিকার দিকে তাকালেন। “তুমি কী লিখেছ?” “আমি কেমন দেশ চাই তা নিয়ে।” তিনি প্রথম অনুচ্ছেদটি পড়লেন। তারপর আরেকটি। তার অভিব্যক্তি অরাত্রিকার কাছে দুর্বোধ্য হয়ে উঠল। অবশেষে তিনি পাতাগুলো নামিয়ে রাখলেন।",
  "“তোমার বয়সের চেয়ে বেশি জটিল বিষয় নিয়ে তুমি অনেক বেশি ভাবো।” অরাত্রিকা তাঁর দিকে তাকাল। “এটা কি খারাপ?” “তোমার প্রথমে পড়াশোনায় মন দেওয়া উচিত।” “আমি দিই।” “তাহলে এইসবে মন পরে দিয়ো।” অরাত্রিকা জানতে চেয়েছিল “পরে” ঠিক কবে আসবে। সে জিজ্ঞেস করল না।",
  "মাতা মহাশয় নীরবে টেবিল থেকে কাগজগুলো তুলে নিলেন। তিনি সেগুলো পড়লেন। স্বামীর মতো তিনি সঙ্গে সঙ্গেই কিছু বললেন না। কিছুক্ষণ পর তিনি কাগজগুলো ফেরত দিলেন। “তোমার হাতের লেখা খুব সুন্দর,” তিনি বললেন। অরাত্রিকা হাসল। “ধন্যবাদ।” এটি তার কাঙ্ক্ষিত উত্তর ছিল না। কিন্তু তাতেই সে সন্তুষ্ট ছিল।",
  "পরের সকালে এমন এক ঘটনা ঘটল যা অরাত্রিকা বছরের পর বছর মনে রেখেছিল। শিক্ষিকা রচনাগুলো ফেরত দিলেন। কিছু শিক্ষার্থী হতাশ হলো। কেউ আনন্দিত হলো। কয়েকজন সঙ্গে সঙ্গে নম্বর মেলাতে শুরু করল। অরাত্রিকা অপেক্ষা করল। তার কাগজটি অবশেষে তার টেবিলে পৌঁছাল।",
  "সবার উপরে একটি লাল কালির দাগ ছিল। চমৎকার। নিচে শিক্ষিকা লিখেছিলেন: তোমার ভাবনাগুলো পরিণত। লিখে যাও। অরাত্রিকা শব্দগুলোর দিকে তাকিয়ে রইল। লিখে যাও। বারবার। এই তিনটি শব্দ যেন সর্বত্র তাকে অনুসরণ করছিল। সে কাগজটি সাবধানে ভাজ করে তার খাতার ভেতর রেখে দিল।",
  "কৃত্তিকা ঝুঁকে এল। “কত পেলে?” অরাত্রিকা তাকে দেখাল। কৃত্তিকা হাসল। “আমি জানতাম।” “তুমি তো পড়োইনি।” “আমার পড়ার প্রয়োজন ছিল না।” “কীভাবে?” “যখন তুমি কোনো কিছু নিয়ে গর্বিত থাকো, তখন তোমার চেহারা আলাদা দেখায়।” অরাত্রিকা চোখ ফিরিয়ে নিল। “আমি গর্বিত নই।” “তুমি আছো।” “হয়তো একটু।” কৃত্তিকা হাসল। “ভালো।”",
  "সেদিন বিকেলে অরাত্রিকা লাইব্রেরিতে গেল। সে লাইব্রেরি পছন্দ করত কারণ তা নির্জন ছিল কিন্তু নিঃসঙ্গ ছিল না। সে তাকগুলোর মাঝ দিয়ে হেঁটে গেল। বইগুলো সারিবদ্ধভাবে দাঁড়িয়ে ছিল, প্রতিটি অন্য কারও চিন্তা বহন করছিল। সে বাংলার একটি সাহিত্যের বই টান দিয়ে বের করল। বইটি খুলতেই পাতাগুলোর মাঝ থেকে একটি কাগজ খসে পড়ল। সে সেটি কুড়িয়ে নিল। তাতে একটি হাতে লেখা বাক্য ছিল: কারো না শোনার কারণে শব্দ কখনো হারিয়ে যায় না।"
];

// Chapter 6 Text: "Ink"
const CHAPTER_6_PARAGRAPHS = [
  "The first thing Prangik noticed about Aratrika was her handwriting on the classroom notice board beside the competition results. He had never known that she wrote. He had seen her in class—quiet, observant, always answering when called upon, but mostly staying within the boundaries of her own thoughts.",
  "A few days later in the library, Aratrika dropped her pen. It rolled across the wooden floor and stopped near Prangik's shoe. He picked it up and handed it back. “Here.” “Thank you.” Their eyes met briefly. “I saw your name on the writing competition list.” “Oh.” “You write?” “Sometimes.” “That's a lot of pages for sometimes.”",
  "Aratrika smiled faintly. “Who told you I write a lot?” “Mrs. Sen mentioned that you borrow extra notebooks.” “They're for notes.” “Notes don't usually require fountain pens and indigo ink.” Aratrika did not know what to say. For the first time, someone had noticed her details without judging them.",
  "They stood by the tall window as rain began to patter against the glass. “Do you ever feel like the things we say out loud are only a small part of who we are?” Prangik asked quietly. Aratrika looked at him, surprised. It was the exact question she had written in her notebook the previous evening."
];

const CHAPTER_6_BENGALI_PARAGRAPHS = [
  "প্রতিযোগিতার ফলাফলের পাশে ক্লাসের নোটিশ বোর্ডে প্রাঙ্গিক প্রথম যে জিনিসটি লক্ষ করেছিল তা হলো অরাত্রিকার হাতের লেখা। সে আগে জানত না যে সে লেখে। সে তাকে ক্লাসে দেখেছে—শান্ত, মনোযোগী, যখনই ডাকা হতো উত্তর দিত, কিন্তু মূলত নিজের ভাবনার সীমানার মধ্যেই থাকত।",
  "কয়েক দিন পর লাইব্রেরিতে, অরাত্রিকা তার কলমটি ফেলে দিল। এটি কাঠের মেঝেতে গড়িয়ে প্রাঙ্গিকের জুতোর কাছে গিয়ে থামল। সে সেটি তুলে ফিরিয়ে দিল। “এই নাও।” “ধন্যবাদ।” তাদের চোখ সামান্য মিলিত হলো। “আমি লেখার প্রতিযোগিতার তালিকায় তোমার নাম দেখেছি।” “ওহ।” “তুমি লেখো?” “মাঝে মাঝে।” “মাঝে খাতার এত পাতা ভরে যায় বুঝি?”",
  "অরাত্রিকা মৃদু হাসল। “তোমাকে কে বলল আমি অনেক লিখি?” “মিসেস সেন বলেছিলেন তুমি অতিরিক্ত খাতা ধার নাও।” “ওগুলো নোটের জন্য।” “নোটের জন্য সাধারণত ফাউন্টেন পেন আর নীল কালির প্রয়োজন হয় না।” অরাত্রিকা কী বলবে বুঝতে পারল না। এই প্রথম কেউ কোনো বিচার না করেই তার খুঁটিনাটি লক্ষ করল।",
  "তারা লম্বা জানালার পাশে দাঁড়াল যখন কাচে বৃষ্টির ফোঁটা পড়তে শুরু করল। “তোমার কি কখনো মনে হয় আমরা মুখে যা বলি তা আমাদের সত্তার একটা খুব ছোট অংশ মাত্র?” প্রাঙ্গিক নিচু গলায় জিজ্ঞেস করল। অরাত্রিকা অবাক হয়ে তার দিকে তাকাল। এটি ঠিক সেই প্রশ্নটি ছিল যা সে আগের সন্ধ্যায় তার খাতায় লিখেছিল।"
];

// Chapter 7 Text: "The Pages Between Them"
const CHAPTER_7_PARAGRAPHS = [
  "After that afternoon, Prangik noticed Aratrika more often—writing in the margins of time, guarding her notebook fiercely. When the teacher announced an assignment on someone who changed your thinking, Prangik found her in the corridor. “Have you decided who you're writing about?” “Not yet.” “Me neither.”",
  "Later, in the library, Aratrika quietly pushed one page toward him across the wooden table. “You can read this part.” Prangik read it without speaking. His eyes moved slowly across the lines. When he finished, he looked up. “This is good. It sounds like freedom.”",
  "Aratrika smiled. Not because he praised her, but because he read without laughing, without measuring her worth in percentages, and without telling her to concentrate on her syllabus. Trust had begun with a single page.",
  "Outside, the evening sky turned the colour of old parchment. The bell rang for dispersal. Students packed their bags and hurried out into the courtyard. But inside the quiet library, two young minds understood that words, once shared, belonged to both of them."
];

const CHAPTER_7_BENGALI_PARAGRAPHS = [
  "সেই বিকেলের পর, প্রাঙ্গিক অরাত্রিকাকে আরও ঘন ঘন লক্ষ করতে শুরু করল—সময়ের অবকাশে লেখা, তার খাতাটাকে যেন হিংস্রভাবে রক্ষা করা। যখন শিক্ষিকা এমন কাউকে নিয়ে অ্যাসাইনমেন্ট ঘোষণা করলেন যিনি আপনার চিন্তাধারা বদলে দিয়েছেন, প্রাঙ্গিক তাকে বারান্দায় খুঁজে পেল। “তুমি কার সম্পর্কে লিখবে ঠিক করেছ?” “এখনো না।” “আমারও ঠিক হয়নি।”",
  "পরে লাইব্রেরিতে, অরাত্রিকা কাঠের টেবিলের ওপর দিয়ে নিঃশব্দে একটি পাতা তার দিকে ঠেলে দিল। “তুমি এই অংশটা পড়তে পারো।” প্রাঙ্গিক কোনো কথা না বলে তা পড়ল। তার চোখগুলো ধীরে ধীরে লাইনের ওপর দিয়ে চলল। পড়া শেষ করে সে মুখ তুলল। “এটা খুব ভালো। এটা স্বাধীনতার মতো শোনায়।”",
  "অরাত্রিকা হাসল। তাই নয় যে সে প্রশংসা করেছে, বরং এই কারণে যে সে না হেসে, শতাংশে তার মূল্য মাপা ছাড়াই এবং সিলেবাসে মন দিতে বলা ছাড়াই তা পড়েছে। একটি পাতার মাধ্যমেই বিশ্বাসের সূচনা হয়েছিল।",
  "বাইরে সন্ধ্যার আকাশ প্রাচীন পার্চমেন্টের রঙ ধারণ করল। ছুটির ঘণ্টা বাজল। শিক্ষার্থীরা তাদের ব্যাগ গুছিয়ে উঠোনে ছুটে গেল। কিন্তু শান্ত লাইব্রেরির ভেতরে, দুটি তরুণ মন বুঝতে পেরেছিল যে শব্দ একবার ভাগ করে নিলে, তা উভয়েরই হয়ে ওঠে।"
];

const EXCLUDED_LEXICON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out', 
  'off', 'over', 'under', 'again', 'further', 'then', 'once', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 
  'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 
  'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 
  'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would', 'should', 'could', 'ought', 'not', 
  'no', 'yes', 'so', 'too', 'very', 'just', 'as', 'than', 'well', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'own', 'same', 'can', 'will'
]);

const PARAGRAPHS_PER_PAGE = 3;

export const KindleInteractiveReader: React.FC<KindleInteractiveReaderProps> = ({
  isOpen,
  onClose,
  onLaunchImmersive
}) => {
  // Navigation Tabs: 'read' | 'ai-summary' | 'dictionary' | 'gamification' | 'social'
  const [activeTab, setActiveTab] = useState<'read' | 'ai-summary' | 'dictionary' | 'gamification' | 'social'>('read');

  // Reader Customization State - Matching Main Page Heritage UI
  const [theme, setTheme] = useState<'parchment' | 'obsidian' | 'sepia' | 'ivory' | 'monsoon'>('parchment');
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineSpacing, setLineSpacing] = useState<number>(1.85);
  const [fontFamily, setFontFamily] = useState<'cormorant' | 'cinzel' | 'serif' | 'sans'>('cormorant');
  const [paragraphWidth, setParagraphWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [bilingualMode, setBilingualMode] = useState<boolean>(false);
  const [showFocusRuler, setShowFocusRuler] = useState<boolean>(false);
  const [rulerPosition, setRulerPosition] = useState<number>(180);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => audioSynth.getIsPlaying());

  // Dictionary & Language System State
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [dictionarySearch, setDictionarySearch] = useState<string>('');
  const [savedWords, setSavedWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wow_saved_words');
      return saved ? JSON.parse(saved) : ['luxuries', 'voice', 'expectations', 'margin'];
    } catch {
      return ['luxuries', 'voice', 'expectations', 'margin'];
    }
  });

  // AI Summary System State (Main Page Heritage Aesthetics)
  const [aiSummaryType, setAiSummaryType] = useState<'page' | 'chapter' | 'recap' | 'iforgot'>('page');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [customAiQuery, setCustomAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<{ title: string; content: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  // Gamification State (Royal Main Page Aesthetic)
  const [readingStreak, setReadingStreak] = useState<number>(17);
  const [celebrationModal, setCelebrationModal] = useState<string | null>(null);

  // Discussion & Comments (Canon chapter reflections)
  const [socialComments, setSocialComments] = useState<{ author: string; text: string; time: string }[]>([
    { author: 'Sayan Biswas', text: 'Aratrika\'s quiet resistance against parental comparison is universally relatable and deeply moving.', time: '2h ago' },
    { author: 'Pratyay Saha', text: 'The morning colours in Chapter 1 reflect how her soul notices subtle beauty despite domestic constraint.', time: '15m ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  const [activeChapter, setActiveChapter] = useState<number>(1);

  const paragraphs = activeChapter === 1 
    ? CHAPTER_1_PARAGRAPHS 
    : activeChapter === 2 
    ? CHAPTER_2_PARAGRAPHS 
    : activeChapter === 3 
    ? CHAPTER_3_PARAGRAPHS 
    : activeChapter === 4 
    ? CHAPTER_4_PARAGRAPHS
    : activeChapter === 5
    ? CHAPTER_5_PARAGRAPHS
    : activeChapter === 6
    ? CHAPTER_6_PARAGRAPHS
    : CHAPTER_7_PARAGRAPHS;

  const bengaliParagraphs = activeChapter === 1 
    ? BENGALI_PARAGRAPHS 
    : activeChapter === 2 
    ? CHAPTER_2_BENGALI_PARAGRAPHS 
    : activeChapter === 3 
    ? CHAPTER_3_BENGALI_PARAGRAPHS 
    : activeChapter === 4 
    ? CHAPTER_4_BENGALI_PARAGRAPHS
    : activeChapter === 5
    ? CHAPTER_5_BENGALI_PARAGRAPHS
    : activeChapter === 6
    ? CHAPTER_6_BENGALI_PARAGRAPHS
    : CHAPTER_7_BENGALI_PARAGRAPHS;

  const totalPages = Math.ceil(paragraphs.length / PARAGRAPHS_PER_PAGE);
  const currentParagraphs = paragraphs.slice(
    currentPage * PARAGRAPHS_PER_PAGE,
    (currentPage + 1) * PARAGRAPHS_PER_PAGE
  );
  const currentBengaliParagraphs = bengaliParagraphs.slice(
    currentPage * PARAGRAPHS_PER_PAGE,
    (currentPage + 1) * PARAGRAPHS_PER_PAGE
  );

  // 3-Dot Options & Audio Soundscapes State
  const [is3DotMenuOpen, setIs3DotMenuOpen] = useState<boolean>(false);
  const [isGlossaryHistoryOpen, setIsGlossaryHistoryOpen] = useState<boolean>(false);
  const [isPronunciationGuideOpen, setIsPronunciationGuideOpen] = useState<boolean>(false);
  const [showChakdahaMap, setShowChakdahaMap] = useState<boolean>(false);
  const [ambientMode, setAmbientMode] = useState<'none' | 'rain' | 'tanpura' | 'market' | 'courtyard'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  // Glossary History Items State
  const [historyItems, setHistoryItems] = useState<GlossaryHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('wow_glossary_history');
      return saved ? JSON.parse(saved) : [
        {
          id: 'h1',
          word: 'aratrika',
          phonetic: '/ɑː.rəˈtriː.kə/',
          bengali: 'অরাত্রিকা - সন্ধ্যার দীপ / নীরব লেখিকা',
          definition: 'The protagonist of Wilting of Words; keeper of the handwritten notebook in Chakdaha.',
          timestamp: Date.now() - 3600000
        },
        {
          id: 'h2',
          word: 'luxuries',
          phonetic: '/ˈlʌk.ʃər.iz/',
          bengali: 'বিলাসিতা / প্রাচুর্য',
          definition: 'Inessential, desirable things; inside Aratrika\'s house, dreams were considered luxuries.',
          timestamp: Date.now() - 1800000
        }
      ];
    } catch {
      return [];
    }
  });

  // Ensure no background music/soundscape runs automatically until speaker icon is explicitly pressed
  useEffect(() => {
    if (isOpen) {
      try {
        audioSynth.pause();
        ambientAudio.stopSoundscape();
      } catch {}
      setIsMusicPlaying(false);
      setAmbientMode('none');
    }
  }, [isOpen]);

  // Lexicon Preload
  useEffect(() => {
    preloadChapter1Lexicon(CHAPTER_1_PARAGRAPHS);
  }, []);

  // SRS Flashcard Mode State
  const [flashcardMode, setFlashcardMode] = useState<boolean>(false);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState<number>(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState<boolean>(false);
  const [pronunciationModalWord, setPronunciationModalWord] = useState<{
    word: string;
    phonetic: string;
    bengali: string;
    definition: string;
  }>({
    word: 'Aratrika',
    phonetic: '/ɑː.rə.trɪ.kɑː/',
    bengali: 'আরাত্রিকা - সন্ধ্যার সান্ধ্য দীপ',
    definition: 'The protagonist whose pen becomes a sanctuary.'
  });

  // Toggle Soundscape Helper
  const handleToggleSoundscape = (mode: 'none' | 'rain' | 'tanpura' | 'market' | 'courtyard') => {
    setAmbientMode(mode);
    if (mode === 'none') {
      ambientAudio.stopSoundscape();
    } else {
      ambientAudio.startSoundscape(mode);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientAudio.setVolume(vol);
  };

  if (!isOpen) return null;

  // Universal Dynamic Word Lookup (Translations in Bengali & Hindi via Backend)
  const handleWordClick = async (word: string) => {
    const cleanWord = word.trim().toLowerCase().replace(/[^a-z'-]/g, '');
    if (!cleanWord || EXCLUDED_LEXICON_WORDS.has(cleanWord) || cleanWord.length <= 2) {
      return;
    }

    const isPredefined = !!COMPREHENSIVE_LEXICON[cleanWord];
    if (isPredefined) {
      const initial = resolveUniversalWord(cleanWord);
      setSelectedWord(initial);
      audioSynth.playTurnSound();
    }

    try {
      const fetched = await fetchWordMeaningFromBackend(cleanWord);

      if (!isPredefined) {
        audioSynth.playTurnSound();
      }
      setSelectedWord(fetched);

      // Record in Glossary History
      const newItem: GlossaryHistoryItem = {
        id: `${cleanWord}_${Date.now()}`,
        word: fetched.word,
        phonetic: fetched.phonetic,
        bengali: fetched.translations.bengali,
        definition: fetched.definition,
        timestamp: Date.now()
      };

      setHistoryItems(prev => {
        const filtered = prev.filter(p => p.word.toLowerCase() !== fetched.word.toLowerCase());
        const updated = [newItem, ...filtered];
        try { localStorage.setItem('wow_glossary_history', JSON.stringify(updated)); } catch {}
        return updated;
      });
    } catch (err) {
      console.warn('Word click lookup error:', err);
    }
  };

  const handleToggleSaveWord = (word: string) => {
    const updated = savedWords.includes(word)
      ? savedWords.filter(w => w !== word)
      : [...savedWords, word];
    setSavedWords(updated);
    try {
      localStorage.setItem('wow_saved_words', JSON.stringify(updated));
    } catch {}
  };

  // Web Speech Pronunciation
  const handlePronounce = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // AI Summary System - Deterministic & Canon-grounded
  const handleFetchAiSummary = (type: 'page' | 'chapter' | 'recap' | 'iforgot', customQ?: string) => {
    setAiSummaryType(type);
    setAiLoading(true);

    setTimeout(() => {
      let respTitle = '';
      let respContent = '';

      if (customQ) {
        respTitle = `Insight: "${customQ}"`;
        if (activeChapter === 1) {
          respContent = `Regarding your inquiry on Chapter 1: Aratrika's private scribing symbolizes the unyielding human desire for self-determination. In a household where marks and conformity define value, her notebook becomes the sacred boundary between external expectations and her authentic inner voice. Her father's pragmatic demands reflect generational caution, while Aratrika's quiet observation of morning light reflects an artist's refusal to let her perceptions be muted.`;
        } else {
          respContent = `Regarding your inquiry on Chapter 2: The omnipresence of mirrors in her mother's home represents external societal eyes, constantly forcing conformity and physical presentability. By avoiding these mirrors, Aratrika refuses to let her self-worth be dictated by external appearance. Her writing near the rain-soaked window symbolizes her escape from physical mirrors into books—spaces of endless possibilities—where she learns she doesn't need to become beautiful, but rather free.`;
        }
      } else if (type === 'page') {
        respTitle = `Page ${currentPage + 1} Summary & Narrative Analysis`;
        if (activeChapter === 1) {
          if (currentPage === 0) {
            respContent = `SUMMARY (Page 1):
• Morning Light: Aratrika observes the true, unpainted colours of dawn from her window.
• Domestic Constraints: Dreams are dismissed as impractical luxuries for girls in her conservative home.
• The Blank Page: She unscrews her fountain pen and crafts the poignant aphorism: "Some houses have walls. Some houses have rules."

KEY THEMES:
• Sanctuary of the Notebook: The paper is the only realm where nobody dictates what she must become.
• Visual Symbolism: Light passing through curtains turns brown fabric into orange, mirroring her inner transformation.`;
          } else if (currentPage === 1) {
            respContent = `SUMMARY (Page 2):
• Family Interaction: At breakfast, her father inspects his newspaper and issues curt instructions regarding school and examinations.
• Comparison: She is compared to a cousin who attained high academic marks; no one inquires into what she actually desires.
• Interrogation: Her father demands to know why she is constantly writing; she conceals her literary thoughts beneath schoolbooks.

KEY THEMES:
• Transactional Existence: Academic success is the only recognized metric of child worth in the household.
• Silent Defiance: Aratrika complies outwardly while preserving her fierce internal critique.`;
          } else {
            respContent = `SUMMARY (Page 3 & Chapter Conclusion):
• School Sanctuary: In the school corridors, Aratrika discovers a space where people are allowed to be "unfinished."
• The Blackboard Motto: "CLASS X — YOUR FUTURE BEGINS NOW" prompts her to question whether futures truly begin in classrooms or in the constraints imposed by others.
• The Core Inscription: In the margin of her notebook, Aratrika pens the novel's defining declaration: "If nobody gives you a voice, perhaps you have to write one." She underlines it twice.

KEY THEMES:
• Claiming Agency: The margin of an ordinary notebook becomes a monumental testament of resistance.`;
          }
        } else {
          // Chapter 2 page summaries
          if (currentPage < 5) {
            respContent = `SUMMARY (Chapter 2 - Page ${currentPage + 1}):
• The House of Mirrors: Aratrika's mother places mirrors everywhere, emphasizing that "people should always look presentable."
• School vs. Home: At school, her appearance does not matter when reading aloud or solving math problems, yet at home it dominates conversations.
• Mirror Avoidance: Aratrika begins to avoid mirrors, tired of being told how to view herself.

KEY THEMES:
• Projections of Self: Mirrors represent external, superficial social expectations.
• True Worth: Aratrika values intellectual and creative competence over outward appearance.`;
          } else if (currentPage < 12) {
            respContent = `SUMMARY (Chapter 2 - Page ${currentPage + 1}):
• Hallway Realization: Aratrika stares at her reflection and writes a powerful line: "Perhaps the cruelest mirror is the one other people hold in front of you."
• Rainy Solitude: As rain falls outside, she writes her first full paragraph instead of a single sentence.
• Books as Possibilities: She writes of a girl who stops looking into mirrors and looks into books instead, discovering dynamic possibilities.

KEY THEMES:
• Escaping the Gaze: Books provide an expansive, internal sanctuary compared to the narrow, flat reflection of physical mirrors.
• Sovereignty of the Pen: Transitioning to paragraph-length writing shows her growing literary confidence.`;
          } else {
            respContent = `SUMMARY (Chapter 2 - Page ${currentPage + 1} & Chapter Conclusion):
• Final Line: Aratrika writes: "She did not need to become beautiful. She needed to become free."
• Defending Her Words: The next morning, her fingers touch the page. She hesitates, but decides not to tear it out, whispering "No" in her first act of self-defense.
• Voice Found: At school, the principal preaches discipline, but Aratrika's notebook carries words that are slowly becoming a voice.

KEY THEMES:
• Emotional Resilience: Defending her text represents her first active, sovereign rebellion.
• Unsilenceable Spirit: A voice, once discovered, cannot be dimmed.`;
          }
        }
      } else if (type === 'chapter') {
        if (activeChapter === 1) {
          respTitle = `Chapter 1: "The Colour of Morning" Comprehensive Breakdown`;
          respContent = `CHAPTER OVERVIEW:
Chapter 1 establishes the poignant emotional architecture of Wilting of Words. Set in the quiet riverbank town of Chakdaha, West Bengal, it contrasts Aratrika's intense aesthetic sensitivity with the rigid, utilitarian expectations of her family.

NARRATIVE ARCS:
1. The Awakening: Aratrika perceives mornings through real, living pigments rather than textbook abstractions.
2. The Father's Admonition: A breakfast scene illustrating how conversation is reduced to marks, examinations, and conventional conformity.
3. The Classroom Sanctuary: A noisy corridor where imperfection is allowed, contrasting with the pressure of the domestic sphere.
4. The Inscription of Independence: The closing act where Aratrika inscribes her immortal margin sentence, claiming sovereign authorship over her destiny.

LITERARY SIGNIFICANCE:
Pratyay Saha uses concise, evocative prose to show that words do not wilt when preserved with authentic courage.`;
        } else {
          respTitle = `Chapter 2: "A House Full of Mirrors" Comprehensive Breakdown`;
          respContent = `CHAPTER OVERVIEW:
Chapter 2 explores Aratrika's internal resistance to the suffocating gaze of physical presentability. Against a rainy background, she expands her writing from isolated sentences to complete narratives, marking her emergence as a true writer.

NARRATIVE ARCS:
1. The Omnipresent Mirrors: A description of her home, filled with mirrors and superficial conversations about grooming.
2. The Rainy Evening: A poetic transition where Aratrika writes her first paragraph, contrasting flat mirrors with the endless horizons of books.
3. The Act of Defense: A quiet morning decision where she refuses to tear out her writing, choosing to own and defend her words.
4. The Growing Voice: A return to school where she realizes that her future cannot be reduced to marks, and her voice cannot be silenced.

LITERARY SIGNIFICANCE:
"She did not need to become beautiful. She needed to become free." This defining statement shifts the novel's core search from mere resistance to absolute self-determination.`;
        }
      } else if (type === 'recap') {
        respTitle = `Novel Recap & Genesis Context`;
        respContent = `GENESIS BACKSTORY:
• Chapter 1 established Aratrika's quiet defiance of domestic rules and her core declaration: "If nobody gives you a voice, perhaps you have to write one."
• Chapter 2 deepens her journey by introducing the house of mirrors—symbolizing superficial societal demands.
• We witness Aratrika moving from writing fleeting sentences to full paragraphs of prose, and finding the courage to defend her writing rather than erasing it.`;
      } else if (type === 'iforgot') {
        respTitle = `"I Forgot" Recall Mode (Spoiler-Safe Guide)`;
        if (activeChapter === 1) {
          respContent = `RETURNING READER RECALL:
• Where are we? Chapter 1: The Colour of Morning.
• Who is present? Aratrika (our thoughtful protagonist), her protective mother, and her strict father.
• Key Inscription: "If nobody gives you a voice, perhaps you have to write one."`;
        } else {
          respContent = `RETURNING READER RECALL:
• Where are we? Chapter 2: A House Full of Mirrors.
• What just occurred? Aratrika has drafted her first full paragraph about a girl escaping physical mirrors into books.
• Key Inscription: "She did not need to become beautiful. She needed to become free."`;
        }
      }

      setAiResponse({ title: respTitle, content: respContent });
      setAiLoading(false);
    }, 450);
  };

  const handleCopySummary = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(`${aiResponse.title}\n\n${aiResponse.content}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSpeakSummary = () => {
    if (!aiResponse) return;
    if (isSpeakingSummary) {
      window.speechSynthesis.cancel();
      setIsSpeakingSummary(false);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(aiResponse.content);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeakingSummary(false);
      utterance.onerror = () => setIsSpeakingSummary(false);
      setIsSpeakingSummary(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const triggerCelebration = (title: string) => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    audioSynth.playAchievementSound();
    setCelebrationModal(title);
  };

  // Main Page Aesthetic Themes
  const themeStyles = {
    parchment: {
      canvas: 'bg-[#FAF6EF]',
      text: 'text-[#2D1E16]',
      border: 'border-[#D4AF37]/35',
      subtext: 'text-[#6C5441]',
      cardBg: 'bg-[#F2EADB]'
    },
    obsidian: {
      canvas: 'bg-[#120E0B]',
      text: 'text-[#EDE4D5]',
      border: 'border-[#D4AF37]/25',
      subtext: 'text-[#B8A390]',
      cardBg: 'bg-[#1C1510]'
    },
    sepia: {
      canvas: 'bg-[#F2E8D5]',
      text: 'text-[#362215]',
      border: 'border-[#B93826]/25',
      subtext: 'text-[#7A5B44]',
      cardBg: 'bg-[#EADDC6]'
    },
    ivory: {
      canvas: 'bg-[#FFFDF8]',
      text: 'text-[#231A13]',
      border: 'border-[#D4AF37]/25',
      subtext: 'text-[#695443]',
      cardBg: 'bg-[#F5F0E6]'
    },
    monsoon: {
      canvas: 'bg-[#0B0D13]',
      text: 'text-[#DFE5F2]',
      border: 'border-[#D4AF37]/25',
      subtext: 'text-[#94A3B8]',
      cardBg: 'bg-[#141824]'
    }
  };

  const fontFamilies = {
    cormorant: 'font-serif',
    cinzel: 'font-cinzel',
    serif: 'font-serif',
    sans: 'font-sans'
  };

  const widths = {
    narrow: 'max-w-md',
    medium: 'max-w-2xl',
    wide: 'max-w-4xl'
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#140F0C] text-[#FAF5EE] select-none overflow-hidden animate-fade-in font-serif">
      
      {/* 
        ========================================================================
        TOP ROYAL MAIN PAGE HEADER BAR
        ========================================================================
      */}
      <header className="px-3 sm:px-6 py-3 border-b border-[#D4AF37]/35 bg-[#140F0C] flex items-center justify-between shadow-xl shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-[#221711] text-[#E8DFC8] border border-[#D4AF37]/45 hover:bg-[#34241B] hover:text-[#D4AF37] flex items-center gap-1.5 text-xs font-cinzel font-bold shadow-xs transition-all cursor-pointer"
            title="Return to Main Sanctuary"
          >
            <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>Back</span>
          </button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B2213] via-[#B93826] to-[#D4AF37] text-amber-100 flex items-center justify-center font-black shadow-md border border-[#D4AF37]/50 hidden xs:flex">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-sm sm:text-lg font-bold text-[#D4AF37] tracking-wider uppercase">
                Wilting of Words
              </span>
              <select
                value={activeChapter}
                onChange={(e) => {
                  setActiveChapter(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="bg-[#221711] text-[#E8DFC8] border border-[#D4AF37]/40 rounded-lg px-2 py-0.5 sm:py-1 text-xs font-cinzel font-bold outline-none cursor-pointer hover:bg-[#34241B] transition-all"
              >
                <option value={1}>Chapter 1</option>
                <option value={2}>Chapter 2</option>
                <option value={3}>Chapter 3</option>
                <option value={4}>Chapter 4</option>
                <option value={5}>Chapter 5</option>
                <option value={6}>Chapter 6</option>
                <option value={7}>Chapter 7</option>
              </select>
              <span className="hidden md:inline text-[9px] font-cinzel font-bold uppercase tracking-widest text-amber-200/90 px-2 py-0.5 rounded-full bg-[#8B2213]/40 border border-[#D4AF37]/40 shadow-xs">
                Interactive Edition
              </span>
            </div>
            <p className="text-[10px] text-[#C5B4A0] font-serif">
              {activeChapter === 1 
                ? 'Chapter 1: The Colour of Morning' 
                : activeChapter === 2 
                ? 'Chapter 2: A House Full of Mirrors' 
                : activeChapter === 3 
                ? 'Chapter 3: The Quiet Library' 
                : activeChapter === 4 
                ? 'Chapter 4: The Girl at the Window'
                : activeChapter === 5
                ? 'Chapter 5: What They Called Her'
                : activeChapter === 6
                ? 'Chapter 6: Ink'
                : 'Chapter 7: The Pages Between Them'} &bull; Page {currentPage + 1} of {totalPages}
            </p>
          </div>
        </div>

        {/* Top Control Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Speaker Button: Background Music Control */}
          <button
            onClick={() => {
              const playing = audioSynth.getIsPlaying();
              if (playing) {
                audioSynth.pause();
                setIsMusicPlaying(false);
              } else {
                audioSynth.play();
                setIsMusicPlaying(true);
              }
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer border ${
              isMusicPlaying 
                ? 'bg-[#8B2213] text-white border-[#D4AF37]' 
                : 'bg-[#221711] text-[#E8DFC8] border-[#D4AF37]/35 hover:bg-[#34241B]'
            }`}
            title={isMusicPlaying ? 'Mute Background Music' : 'Play Background Music'}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4 text-amber-200" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Launch Immersive Mode Button */}
          {onLaunchImmersive && (
            <button
              onClick={onLaunchImmersive}
              className="px-3 py-1.5 rounded-full text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#221711] text-[#E8DFC8] hover:text-white hover:bg-[#34241B] border border-[#D4AF37]/30"
              title="Switch to Fullscreen Immersive Canvas"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Immersive Mode</span>
            </button>
          )}

          {/* Bilingual Reading Mode Toggle */}
          <button
            onClick={() => setBilingualMode(!bilingualMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              bilingualMode 
                ? 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/60 shadow-md shadow-[#8B2213]/30' 
                : 'bg-[#221711] text-[#E8DFC8] hover:text-white hover:bg-[#34241B] border-[#D4AF37]/30'
            }`}
            title="Toggle English & Bengali Parallel Reading"
          >
            <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">{bilingualMode ? 'Bilingual: Active' : 'Bilingual Mode'}</span>
          </button>

          {/* Speaker Button: Background Music Control */}
          <button
            onClick={() => {
              const playing = audioSynth.getIsPlaying();
              if (playing) {
                audioSynth.pause();
                setIsMusicPlaying(false);
              } else {
                audioSynth.play();
                setIsMusicPlaying(true);
              }
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer border ${
              isMusicPlaying 
                ? 'bg-[#8B2213] text-white border-[#D4AF37] shadow-xs' 
                : 'bg-[#221711] hover:bg-[#34241B] text-[#D4AF37] hover:text-amber-200 border-[#D4AF37]/35 shadow-xs'
            }`}
            title={isMusicPlaying ? 'Mute Background Music' : 'Play Background Music'}
          >
            {isMusicPlaying ? <Volume2 className="w-4 h-4 text-amber-200" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Quick Reader Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-[#221711] hover:bg-[#34241B] text-[#D4AF37] hover:text-amber-200 transition-colors cursor-pointer border border-[#D4AF37]/35 shadow-xs"
            title="Typography & Appearance"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 3-Dot Options Menu */}
          <div className="relative">
            <button
              onClick={() => setIs3DotMenuOpen(!is3DotMenuOpen)}
              className="p-2 rounded-xl bg-[#221711] hover:bg-[#34241B] text-[#D4AF37] hover:text-amber-200 transition-colors cursor-pointer border border-[#D4AF37]/35 shadow-xs flex items-center justify-center"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* 3-Dot Options Dropdown */}
            {is3DotMenuOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/50 shadow-2xl p-3 z-50 space-y-2 text-left">
                
                {/* 1. Glossary Lookup History */}
                <button
                  onClick={() => {
                    setIsGlossaryHistoryOpen(true);
                    setIs3DotMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-[#2A1E16] text-xs font-cinzel font-bold text-[#FAF5EE] flex items-center gap-2.5 transition-colors border border-transparent hover:border-[#D4AF37]/30"
                >
                  <History className="w-4 h-4 text-[#D4AF37]" />
                  <span>Glossary History Panel</span>
                </button>

                {/* 2. Interactive Pronunciation Guide */}
                <button
                  onClick={() => {
                    setIsPronunciationGuideOpen(true);
                    setIs3DotMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-[#2A1E16] text-xs font-cinzel font-bold text-[#FAF5EE] flex items-center gap-2.5 transition-colors border border-transparent hover:border-[#D4AF37]/30"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Pronunciation Guide</span>
                </button>

                {/* 3. Interactive Map of Chakdaha */}
                <button
                  onClick={() => {
                    setShowChakdahaMap(!showChakdahaMap);
                    setIs3DotMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-[#2A1E16] text-xs font-cinzel font-bold text-[#FAF5EE] flex items-center gap-2.5 transition-colors border border-transparent hover:border-[#D4AF37]/30"
                >
                  <MapPin className="w-4 h-4 text-[#B93826]" />
                  <span>{showChakdahaMap ? 'Hide Chakdaha Map' : 'Interactive Map of Chakdaha'}</span>
                </button>

                {/* 4. Contextual Ambient Soundscapes */}
                <div className="p-2.5 rounded-xl bg-[#140F0C] border border-[#D4AF37]/25 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-cinzel font-bold text-[#D4AF37] uppercase">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Ambient Soundscape</span>
                    </span>
                    <span className="text-amber-200">{ambientMode}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-serif">
                    {[
                      { id: 'none', label: 'Off' },
                      { id: 'rain', label: 'Monsoon Rain' },
                      { id: 'tanpura', label: 'Tanpura Drone' },
                      { id: 'market', label: 'Market & Bells' },
                      { id: 'courtyard', label: 'Petrichor' }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleToggleSoundscape(s.id as any)}
                        className={`p-1.5 rounded-lg border text-center transition-all ${
                          ambientMode === s.id
                            ? 'bg-[#B93826] text-white border-amber-300 font-bold'
                            : 'bg-[#1C1510] text-[#C5B4A0] border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Volume Slider */}
                  {ambientMode !== 'none' && (
                    <div className="pt-1 flex items-center gap-2">
                      <Volume2 className="w-3 h-3 text-[#D4AF37]" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={ambientVolume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-full accent-[#D4AF37] h-1"
                      />
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Close Reader */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#221711] hover:bg-[#8B2213] hover:text-white text-[#C5B4A0] transition-colors cursor-pointer border border-[#D4AF37]/35 ml-1 shadow-xs"
            title="Close Interactive Reader"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 
        ========================================================================
        CATEGORY TABS - Main Page Royal Insignia Navigation
        ========================================================================
      */}
      <nav className="bg-[#1A120D] border-b border-[#D4AF37]/25 px-3 sm:px-6 py-2 flex items-center justify-center gap-1.5 sm:gap-2.5 overflow-x-auto shrink-0 z-20">
        {[
          { id: 'read', label: 'Interactive Reader', icon: BookOpen },
          { id: 'ai-summary', label: 'Chapter Recaps & Recall', icon: BrainCircuit },
          { id: 'dictionary', label: `Lexicon Vault (${savedWords.length})`, icon: Languages },
          { id: 'gamification', label: 'Royal Milestones', icon: Crown },
          { id: 'social', label: 'Sanctum Club', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                isActive 
                  ? 'bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#8B2213] text-white border-[#D4AF37]/60 shadow-md shadow-[#8B2213]/40' 
                  : 'text-[#E8DFC8]/75 hover:text-amber-200 hover:bg-[#281B14] border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/70'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN BODY WORKSPACE */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* ========================================================================= */}
        {/* 1. INTERACTIVE READING CANVAS (With Drop Cap & Universal Lexicon Lookup)   */}
        {/* ========================================================================= */}
        {activeTab === 'read' && (
          <div 
            className={`flex-1 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto transition-colors duration-300 relative ${currentTheme.canvas} ${currentTheme.text}`}
            onMouseMove={(e) => {
              if (showFocusRuler) {
                const rect = e.currentTarget.getBoundingClientRect();
                setRulerPosition(e.clientY - rect.top - 16);
              }
            }}
          >
            {/* Reading Focus Ruler Guide */}
            {showFocusRuler && (
              <div 
                className="absolute left-0 right-0 h-9 bg-amber-500/15 border-y border-[#D4AF37]/50 pointer-events-none z-30 transition-all duration-75 mix-blend-difference"
                style={{ top: `${rulerPosition}px` }}
              />
            )}

            {/* Reading Container */}
            <div className={`mx-auto w-full ${widths[paragraphWidth]} flex-1 flex flex-col`}>
              
              {/* Chapter Header on First Page */}
              {currentPage === 0 && (
                <div className="text-center pb-6 mb-6 border-b border-[#D4AF37]/30 space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B2213]/10 text-[#8B2213] dark:text-[#E5A93C] text-[10px] font-cinzel font-bold tracking-widest uppercase border border-[#D4AF37]/40 mb-1">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>
                      CHAPTER {activeChapter} &bull; {
                        activeChapter === 1 ? 'MANUSCRIPT OPENING' : 
                        activeChapter === 2 ? 'MIRROR PRISON' : 
                        activeChapter === 3 ? 'SANCTUARY STUDY' : 
                        'LITERARY AWAKENING'
                      }
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-cinzel font-extrabold tracking-wide text-[#8B2213] dark:text-[#E5A93C]">
                    {
                      activeChapter === 1 ? 'The Colour of Morning' : 
                      activeChapter === 2 ? 'A House Full of Mirrors' : 
                      activeChapter === 3 ? 'The Quiet Library' : 
                      'The Girl at the Window'
                    }
                  </h1>
                  <p className="text-xs font-serif italic text-stone-600 dark:text-stone-400">
                    Chakdaha, West Bengal &bull; {
                      activeChapter === 1 ? 'The House of Unspoken Things' : 
                      activeChapter === 2 ? 'The Reflection Trap' : 
                      activeChapter === 3 ? 'The Silent Agreement' : 
                      'The India I Want to See'
                    }
                  </p>
                </div>
              )}

              {/* Paragraphs List with Drop Cap, Tap-Targets & Bilingual Mode */}
              <div 
                className={`space-y-6 ${fontFamilies[fontFamily]}`}
                style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
              >
                {currentParagraphs.map((enText, idx) => {
                  const bnText = currentBengaliParagraphs[idx];
                  const words = enText.split(/(\b[\w'-]+\b)/g);
                  const isFirstParagraphOfPage = idx === 0;

                  let firstLetter = '';
                  let firstWordIndex = -1;
                  if (isFirstParagraphOfPage) {
                    const match = enText.match(/[a-zA-Z]/);
                    if (match && match.index !== undefined) {
                      firstLetter = match[0].toUpperCase();
                    }
                    firstWordIndex = words.findIndex(w => /[a-zA-Z]/.test(w));
                  }

                  return (
                    <div key={idx} className="space-y-2 group">
                      {/* English Text with Drop Cap on First Paragraph */}
                      <p className="text-justify leading-relaxed">
                        {isFirstParagraphOfPage && firstLetter && (
                          <span 
                            className="float-left text-4xl sm:text-5xl font-cinzel font-extrabold text-[#8B2213] dark:text-[#E5A93C] mr-3 mb-1 mt-0.5 leading-none select-none px-2.5 py-1 bg-gradient-to-br from-[#D4AF37]/25 to-amber-500/10 border-2 border-[#D4AF37]/70 rounded-xl shadow-md"
                            aria-label={`Drop Cap ${firstLetter}`}
                          >
                            {firstLetter}
                          </span>
                        )}

                        {words.map((word, wIdx) => {
                          const clean = word.toLowerCase().replace(/[^a-z]/g, '');
                          const isSpecial = !!COMPREHENSIVE_LEXICON[clean];
                          const isExcluded = EXCLUDED_LEXICON_WORDS.has(clean) || clean.length <= 1;

                          let displayWord = word;
                          if (isFirstParagraphOfPage && wIdx === firstWordIndex) {
                            displayWord = word.replace(/[a-zA-Z]/, '');
                          }

                          return (
                            <span
                              key={wIdx}
                              onClick={() => {
                                if (clean.length > 0 && !isExcluded) {
                                  handleWordClick(clean);
                                }
                              }}
                              className={`${
                                !isExcluded 
                                  ? 'cursor-pointer hover:bg-[#D4AF37]/20 rounded px-0.5 transition-colors underline decoration-dotted decoration-[#D4AF37]/40' 
                                  : ''
                              }`}
                              title={!isExcluded ? `Tap for multilingual translation of '${clean}'` : undefined}
                            >
                              {displayWord}
                            </span>
                          );
                        })}
                      </p>

                      {/* Parallel Bengali Translation in Bilingual Mode */}
                      {bilingualMode && bnText && (
                        <div className="p-3.5 rounded-2xl bg-[#1C1613]/90 border border-[#D4AF37]/35 text-amber-100 font-serif text-sm leading-relaxed italic animate-fade-in shadow-inner">
                          {isFirstParagraphOfPage && bnText.trim().length > 0 && (
                            <span className="float-left text-3xl sm:text-4xl font-serif font-bold text-[#D4AF37] mr-2.5 mb-0.5 mt-0.5 leading-none select-none px-2 py-0.5 bg-[#8B2213]/30 border border-[#D4AF37]/50 rounded-lg">
                              {bnText.trim().charAt(0)}
                            </span>
                          )}
                          <span>{isFirstParagraphOfPage ? bnText.trim().slice(1) : bnText}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Page Navigation Controls Styled with Main Page Royal Aesthetic */}
            <footer className="mx-auto w-full max-w-2xl pt-6 mt-8 border-t border-[#D4AF37]/30 flex items-center justify-between shrink-0 font-cinzel">
              <button
                onClick={() => currentPage > 0 && setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                  currentPage === 0 
                    ? 'opacity-30 cursor-not-allowed border-transparent text-stone-500' 
                    : 'bg-gradient-to-r from-[#8B2213] to-[#B93826] hover:from-[#A02616] hover:to-[#C9402C] text-white border-[#D4AF37]/50 shadow-md'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </button>

              <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={() => currentPage < totalPages - 1 && setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages - 1}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                  currentPage === totalPages - 1 
                    ? 'opacity-30 cursor-not-allowed border-transparent text-stone-500' 
                    : 'bg-gradient-to-r from-[#8B2213] to-[#B93826] hover:from-[#A02616] hover:to-[#C9402C] text-white border-[#D4AF37]/50 shadow-md'
                }`}
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </footer>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CHAPTER RECAPS & RECALL (Main Page Royal UI)                           */}
        {/* ========================================================================= */}
        {activeTab === 'ai-summary' && (
          <div className="flex-1 bg-[#140F0C] p-4 sm:p-8 text-[#FAF5EE] overflow-y-auto flex flex-col md:flex-row gap-6">
            
            {/* Summary Mode Column */}
            <div className="w-full md:w-80 space-y-4 shrink-0">
              <div className="p-4 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/35 space-y-3 shadow-lg">
                <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Chapter Recaps &amp; Recall Modes
                </span>

                <div className="space-y-2">
                  {/* Page Summary */}
                  <button
                    onClick={() => handleFetchAiSummary('page')}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-cinzel font-bold flex items-center justify-between transition-all cursor-pointer ${
                      aiSummaryType === 'page' 
                        ? 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/60 shadow-md' 
                        : 'bg-[#140F0C] border-[#D4AF37]/20 text-[#E8DFC8] hover:text-white hover:bg-[#251A13]'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Page Summary</span>
                      <span className="text-[10px] opacity-75 font-serif font-normal">Short explanation of current page</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono">Pg {currentPage + 1}</span>
                  </button>

                  {/* Chapter Summary */}
                  <button
                    onClick={() => handleFetchAiSummary('chapter')}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-cinzel font-bold flex items-center justify-between transition-all cursor-pointer ${
                      aiSummaryType === 'chapter' 
                        ? 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/60 shadow-md' 
                        : 'bg-[#140F0C] border-[#D4AF37]/20 text-[#E8DFC8] hover:text-white hover:bg-[#251A13]'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Chapter Summary</span>
                      <span className="text-[10px] opacity-75 font-serif font-normal">Detailed chapter narrative</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono">Ch 1</span>
                  </button>

                  {/* Previous Chapters Recap */}
                  <button
                    onClick={() => handleFetchAiSummary('recap')}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-cinzel font-bold flex items-center justify-between transition-all cursor-pointer ${
                      aiSummaryType === 'recap' 
                        ? 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/60 shadow-md' 
                        : 'bg-[#140F0C] border-[#D4AF37]/20 text-[#E8DFC8] hover:text-white hover:bg-[#251A13]'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Genesis Prologue Recap</span>
                      <span className="text-[10px] opacity-75 font-serif font-normal">Ancestral journal backstory</span>
                    </div>
                    <span className="text-[10px] opacity-75 font-mono">Genesis</span>
                  </button>

                  {/* "I Forgot" Returning Reader Mode */}
                  <button
                    onClick={() => handleFetchAiSummary('iforgot')}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-cinzel font-bold flex items-center justify-between transition-all cursor-pointer ${
                      aiSummaryType === 'iforgot' 
                        ? 'bg-[#8B2213] text-white border-[#D4AF37]' 
                        : 'bg-[#8B2213]/20 border border-[#D4AF37]/30 text-amber-200 hover:bg-[#8B2213]/30'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Returning Reader Recall</span>
                      <span className="text-[10px] opacity-90 font-serif font-normal">Spoiler-safe memory refresh</span>
                    </div>
                    <span className="text-[10px] opacity-90 font-mono">Safe</span>
                  </button>
                </div>
              </div>

              {/* Informative Guidance Card */}
              <div className="p-4 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/30 text-xs text-[#C5B4A0] space-y-2">
                <span className="font-cinzel font-bold text-[#D4AF37] block">Authentic Chapter Insights</span>
                <p className="leading-relaxed font-serif">
                  Every summary honors Pratyay Saha's nuanced prose while strictly guarding against spoilers and accurately reflecting canon chapter text.
                </p>
              </div>
            </div>

            {/* Output Window */}
            <div className="flex-1 flex flex-col justify-between p-6 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/35 shadow-2xl min-h-[420px]">
              {aiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-cinzel font-bold text-[#D4AF37] uppercase tracking-widest animate-pulse">
                    Synthesizing Manuscript Insights...
                  </p>
                </div>
              ) : aiResponse ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-3">
                    <h3 className="text-base font-cinzel font-bold text-[#D4AF37]">{aiResponse.title}</h3>
                    
                    <div className="flex items-center gap-2">
                      {/* Audio Read-Aloud */}
                      <button
                        onClick={handleSpeakSummary}
                        className="px-2.5 py-1 rounded-lg bg-[#251A13] hover:bg-[#34241B] text-xs font-cinzel text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-[#D4AF37]/30"
                        title="Listen to read-aloud"
                      >
                        {isSpeakingSummary ? <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                        <span>{isSpeakingSummary ? "Stop" : "Read Aloud"}</span>
                      </button>

                      {/* Copy Summary */}
                      <button
                        onClick={handleCopySummary}
                        className="px-2.5 py-1 rounded-lg bg-[#251A13] hover:bg-[#34241B] text-xs font-cinzel text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-[#D4AF37]/30"
                        title="Copy summary to clipboard"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
                        <span>{isCopied ? "Copied" : "Copy"}</span>
                      </button>

                      <span className="px-2.5 py-0.5 rounded-full bg-[#8B2213]/40 border border-[#D4AF37]/40 text-[#E5A93C] text-[10px] font-cinzel font-bold uppercase">
                        Sanctuary Insight
                      </span>
                    </div>
                  </div>

                  <div className="font-serif text-sm sm:text-base leading-relaxed text-[#EDE4D5] whitespace-pre-line max-h-[50vh] overflow-y-auto pr-2">
                    {aiResponse.content}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-8">
                  <BrainCircuit className="w-12 h-12 text-[#D4AF37]/40" />
                  <h4 className="text-base font-cinzel font-bold text-[#D4AF37]">Select a Chapter Recall Mode</h4>
                  <p className="text-xs text-[#C5B4A0] max-w-sm font-serif">
                    Choose from Current Page Summary, Full Chapter Breakdown, Genesis Prologue Recap, or Returning Reader Recall Mode.
                  </p>
                </div>
              )}

              {/* Inquiry Input */}
              <div className="mt-6 pt-4 border-t border-[#D4AF37]/25 flex gap-2">
                <input
                  type="text"
                  value={customAiQuery}
                  onChange={(e) => setCustomAiQuery(e.target.value)}
                  placeholder="Ask a question about the characters, themes, or plot of Chapter 1..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#140F0C] border border-[#D4AF37]/35 text-xs text-[#FAF5EE] focus:outline-none focus:border-[#D4AF37] placeholder-stone-500 font-serif"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customAiQuery.trim()) {
                      handleFetchAiSummary('page', customAiQuery);
                      setCustomAiQuery('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customAiQuery.trim()) {
                      handleFetchAiSummary('page', customAiQuery);
                      setCustomAiQuery('');
                    }
                  }}
                  className="px-4 rounded-xl bg-gradient-to-r from-[#8B2213] to-[#B93826] hover:from-[#A02616] hover:to-[#C9402C] text-white flex items-center justify-center transition-all cursor-pointer shadow-md border border-[#D4AF37]/40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DICTIONARY & LANGUAGE VAULT (Universal Translation For ALL Words)     */}
        {/* ========================================================================= */}
        {activeTab === 'dictionary' && (
          <div className="flex-1 bg-[#140F0C] p-4 sm:p-8 text-[#FAF5EE] overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-3">
              <div>
                <h3 className="text-lg font-cinzel font-bold text-[#D4AF37] flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#D4AF37]" />
                  <span>Interactive Dictionary &amp; Lexicon Vault</span>
                </h3>
                <p className="text-xs text-[#C5B4A0] font-serif">
                  Select any word inside the manuscript or search below for definitions, phonetics, and Bengali &amp; Hindi translations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBilingualMode(!bilingualMode)}
                  className={`px-3 py-1.5 rounded-full text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    bilingualMode 
                      ? 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/50' 
                      : 'bg-[#221711] text-[#E8DFC8] border-[#D4AF37]/30'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{bilingualMode ? "Bilingual: On" : "Bilingual Reading"}</span>
                </button>

                <span className="px-3 py-1 rounded-full bg-[#8B2213]/25 border border-[#D4AF37]/40 text-[#E5A93C] font-mono text-xs font-bold">
                  {savedWords.length} words saved
                </span>
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#D4AF37]" />
                <input
                  type="text"
                  value={dictionarySearch}
                  onChange={(e) => setDictionarySearch(e.target.value)}
                  placeholder="Look up any word in the novel (e.g. unfinished, luxuries, voice, margin, silence)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1C1510] border border-[#D4AF37]/35 text-xs text-[#FAF5EE] focus:outline-none focus:border-[#D4AF37] placeholder-stone-500 font-serif"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && dictionarySearch.trim()) {
                      handleWordClick(dictionarySearch.trim());
                    }
                  }}
                />
              </div>
              <button
                onClick={() => {
                  if (dictionarySearch.trim()) {
                    handleWordClick(dictionarySearch.trim());
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B2213] to-[#B93826] hover:from-[#A02616] hover:to-[#C9402C] text-white font-cinzel font-bold text-xs uppercase cursor-pointer transition-colors border border-[#D4AF37]/40"
              >
                Look Up
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Selected Word Details Card */}
              <div className="md:col-span-2 space-y-4">
                {selectedWord ? (
                  <div className="p-6 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/35 space-y-4 shadow-2xl">
                    <div className="flex items-start justify-between border-b border-[#D4AF37]/25 pb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-cinzel font-bold text-[#D4AF37] capitalize">{selectedWord.word}</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#251A13] border border-[#D4AF37]/30 text-[10px] text-amber-200/80 font-mono">
                            {selectedWord.pos}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[#E5A93C] font-mono text-xs">
                          <span>{selectedWord.phonetic}</span>
                          <button
                            onClick={() => handlePronounce(selectedWord.word)}
                            className="p-1 rounded-full hover:bg-[#2A1E17] text-amber-300 hover:text-white transition-colors cursor-pointer"
                            title="Listen to Pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSaveWord(selectedWord.word)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          savedWords.includes(selectedWord.word)
                            ? 'bg-emerald-700/80 border-emerald-400 text-white'
                            : 'bg-gradient-to-r from-[#8B2213] to-[#B93826] border-[#D4AF37]/50 text-white'
                        }`}
                      >
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{savedWords.includes(selectedWord.word) ? 'Saved in Vault' : 'Save Word'}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">Definition</span>
                      <p className="text-sm font-serif leading-relaxed text-[#EDE4D5]">
                        {selectedWord.definition}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">Example Sentence</span>
                      <p className="text-xs font-serif italic text-amber-100 bg-[#140F0C] p-3 rounded-xl border border-[#D4AF37]/25">
                        "{selectedWord.example}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">Synonyms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedWord.synonyms.map((syn, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-md bg-[#251A13] border border-[#D4AF37]/20 text-[11px] font-serif text-[#EDE4D5]">
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Authentic Bengali Translation */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">Bengali Meaning (বাংলা অর্থ)</span>
                      <div className="text-xs">
                        <div className="p-3.5 rounded-xl bg-[#140F0C] border border-[#D4AF37]/30 shadow-xs">
                          <span className="font-serif text-[#EDE4D5] text-sm leading-relaxed block">{selectedWord.translations.bengali}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/35 text-center space-y-3">
                    <Languages className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
                    <h4 className="text-sm font-cinzel font-bold text-[#D4AF37]">Select or Search a Word</h4>
                    <p className="text-xs text-[#C5B4A0] font-serif">
                      Tap any term in the reading canvas or search above to view instant definitions, phonetics, and multilingual translations.
                    </p>
                  </div>
                )}
              </div>

              {/* Saved Words Sidebar */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/35 space-y-3 shadow-lg">
                  <span className="text-xs font-cinzel font-bold text-[#D4AF37] uppercase tracking-wider block">
                    Saved Vocabulary Vault
                  </span>
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                    {savedWords.map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleWordClick(w)}
                        className="w-full text-left p-2.5 rounded-xl bg-[#140F0C] hover:bg-[#251A13] border border-[#D4AF37]/25 text-xs font-serif capitalize text-[#EDE4D5] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span>{w}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. ROYAL GAMIFICATION & MILESTONES (Clean SVG Icons, No Unnecessary Emojis) */}
        {/* ========================================================================= */}
        {activeTab === 'gamification' && (
          <div className="flex-1 bg-[#140F0C] p-4 sm:p-8 text-[#FAF5EE] overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
              <div>
                <h3 className="text-lg font-cinzel font-bold text-[#D4AF37] flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Royal Reading Gamification &amp; Crests</span>
                </h3>
                <p className="text-xs text-[#C5B4A0] font-serif">
                  Earn prestigious literary distinctions, seals, and medals through deep reading engagement.
                </p>
              </div>

              {/* Reading Streak Indicator */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#8B2213]/30 border border-[#D4AF37]/40 text-amber-300">
                <Flame className="w-4 h-4 fill-current text-[#D4AF37]" />
                <span className="text-xs font-cinzel font-bold uppercase tracking-wider">{readingStreak}-Day Reading Streak</span>
              </div>
            </div>

            {/* Milestones & Badges Grid (Rendered with clean Lucide SVG icons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'royal-wax-seal',
                  title: 'Royal Seal of Aratrika',
                  desc: 'Awarded for completing the opening inscription and honoring the silenced voice.',
                  icon: Crown,
                  tier: 'Imperial Distinction',
                  earned: true
                },
                {
                  id: 'konark-sun-wheel',
                  title: 'Golden Konark Sun Wheel Crest',
                  desc: 'Tribute to 24 spokes of timeless heritage and focused literary attention.',
                  icon: Sun,
                  tier: 'Architectural Crest',
                  earned: true
                },
                {
                  id: 'antique-quill-medal',
                  title: "Scribe's Antique Quill Medal",
                  desc: 'Conferred for uncovering Aratrika’s secret margin notes and notebook testament.',
                  icon: Feather,
                  tier: 'Honorary Medal',
                  earned: true
                },
                {
                  id: 'velvet-ribbon-bookplate',
                  title: 'Velvet Ribbon Bookplate',
                  desc: 'Mastered 5 vocabulary definitions in the Lexicon Vault.',
                  icon: Scroll,
                  tier: 'Scholastic Crest',
                  earned: savedWords.length >= 4
                },
                {
                  id: 'conferred-scholars-laurel',
                  title: "Conferred Scholar's Laurel",
                  desc: 'Maintained authentic reading immersion for the author-signed Certificate.',
                  icon: Award,
                  tier: 'Honorary Distinction',
                  earned: false
                },
                {
                  id: 'imperial-archival-crest',
                  title: 'Imperial Archival Shield',
                  desc: 'Shared reflections and engaged in deep contemplation of the Hooghly riverbank.',
                  icon: ShieldCheck,
                  tier: 'Sanctuary Guardian',
                  earned: true
                }
              ].map(crest => {
                const CrestIcon = crest.icon;
                return (
                  <div 
                    key={crest.id} 
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      crest.earned 
                        ? 'bg-[#1C1510] border-[#D4AF37]/50 shadow-lg shadow-[#8B2213]/15' 
                        : 'bg-[#140F0C] border-[#D4AF37]/15 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#8B2213]/25 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                          <CrestIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-cinzel font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          crest.earned ? 'bg-[#8B2213]/40 text-amber-200 border border-[#D4AF37]/40' : 'bg-[#221711] text-stone-500'
                        }`}>
                          {crest.tier}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-cinzel font-bold text-[#FAF5EE] text-base">{crest.title}</h4>
                        <p className="text-xs font-serif text-[#C5B4A0] mt-1 leading-relaxed">{crest.desc}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#D4AF37]/25 mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-cinzel text-[#D4AF37]/80">
                        {crest.earned ? 'Status: Conferred' : 'Status: In Progress'}
                      </span>
                      {crest.earned ? (
                        <button
                          onClick={() => triggerCelebration(crest.title)}
                          className="text-[11px] font-cinzel font-bold text-[#E5A93C] hover:text-white underline cursor-pointer"
                        >
                          Celebrate
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reading Challenges Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#8B2213]/40 via-[#1C1510] to-[#251A13] border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">Active Reading Challenge</span>
                <h4 className="text-base font-cinzel font-bold text-[#FAF5EE]">The Sanctuary Immersion Challenge</h4>
                <p className="text-xs text-[#C5B4A0] max-w-lg font-serif">
                  Complete authentic reading immersion in the reader to qualify for the royal author-signed certificate dispatched to your email.
                </p>
              </div>
              <button
                onClick={() => triggerCelebration("The Scribe Immersion Challenge")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B2213] to-[#B93826] hover:from-[#A02616] hover:to-[#C9402C] text-white text-xs font-cinzel font-bold uppercase tracking-wider shadow-md border border-[#D4AF37]/50 transition-colors cursor-pointer shrink-0"
              >
                Inspect Challenge
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. SOCIAL SANCTUM (Book Club & Canon Reflections)                         */}
        {/* ========================================================================= */}
        {activeTab === 'social' && (
          <div className="flex-1 bg-[#140F0C] p-4 sm:p-8 text-[#FAF5EE] overflow-y-auto max-w-3xl mx-auto w-full space-y-6">
            <div className="border-b border-[#D4AF37]/30 pb-3">
              <h3 className="text-lg font-cinzel font-bold text-[#D4AF37] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4AF37]" />
                <span>Sanctum Readers Book Club</span>
              </h3>
              <p className="text-xs text-[#C5B4A0] font-serif">
                Community discussions strictly based on Chapter 1: The Colour of Morning.
              </p>
            </div>

            <div className="space-y-3">
              {socialComments.map((com, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#1C1510] border border-[#D4AF37]/35 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-cinzel font-bold text-[#D4AF37]">{com.author}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{com.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif text-[#EDE4D5] leading-relaxed">
                    "{com.text}"
                  </p>
                </div>
              ))}
            </div>

            {/* Post comment input */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your reflection on Chapter 1..."
                className="flex-1 px-4 py-2.5 bg-[#1C1510] border border-[#D4AF37]/35 text-xs text-[#FAF5EE] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder-stone-500 font-serif"
              />
              <button
                onClick={() => {
                  if (newComment.trim()) {
                    setSocialComments(prev => [{ author: 'You (Reader)', text: newComment, time: 'Just now' }, ...prev]);
                    setNewComment('');
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B2213] to-[#B93826] hover:from-[#A02616] hover:to-[#C9402C] text-white font-cinzel font-bold text-xs uppercase cursor-pointer transition-colors shadow-md border border-[#D4AF37]/40"
              >
                Post
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Floating Word Card Drawer (Main Page Royal UI) */}
      {selectedWord && activeTab === 'read' && (
        <aside className="fixed sm:absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 w-[92vw] sm:w-[380px] max-w-full p-4 rounded-2xl bg-[#1C1510]/98 border-2 border-[#D4AF37]/50 text-[#FAF5EE] shadow-2xl backdrop-blur-md animate-slide-in">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-2 mb-2">
            <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              <span>Interactive Lexicon Translation</span>
            </span>
            <button onClick={() => setSelectedWord(null)} className="text-stone-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-cinzel font-bold text-[#D4AF37] capitalize leading-none">{selectedWord.word}</h4>
                <div className="flex items-center gap-2 text-[11px] font-mono text-amber-200/90 mt-1">
                  <span>{selectedWord.phonetic}</span>
                  <span className="text-stone-400">&bull;</span>
                  <span className="text-stone-300">{selectedWord.pos}</span>
                </div>
              </div>
              <button
                onClick={() => handlePronounce(selectedWord.word)}
                className="p-1.5 rounded-lg bg-[#251A13] hover:bg-[#34241B] text-[#D4AF37] hover:text-amber-200 cursor-pointer border border-[#D4AF37]/30"
                title="Pronounce"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs font-serif text-[#EDE4D5] leading-relaxed max-h-[75px] overflow-y-auto pr-1">{selectedWord.definition}</p>
            
            <div className="text-[11px] font-serif pt-1">
              <div className="text-amber-200 bg-[#140F0C] p-2.5 rounded-lg border border-[#D4AF37]/25 max-h-[65px] overflow-y-auto">
                <span className="text-[9px] uppercase font-cinzel font-bold block text-[#D4AF37] mb-0.5">বাংলা অর্থ (Bengali Meaning):</span>
                {selectedWord.translations.bengali}
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-2 border-t border-[#D4AF37]/25 flex justify-between gap-2.5">
            <button
              onClick={() => handleToggleSaveWord(selectedWord.word)}
              className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white text-[11px] font-cinzel font-bold cursor-pointer border border-[#D4AF37]/40 shadow-xs"
            >
              {savedWords.includes(selectedWord.word) ? 'Saved in Vault' : 'Save to Vault'}
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className="px-3 py-1.5 rounded-lg bg-[#251A13] text-[#D4AF37] hover:text-white text-[11px] font-cinzel font-bold cursor-pointer border border-[#D4AF37]/30"
            >
              Full Card
            </button>
          </div>
        </aside>
      )}

      {/* Royal Celebration Modal */}
      {celebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="p-6 rounded-3xl bg-[#1C1510] border-2 border-[#D4AF37]/60 text-center max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#8B2213]/40 text-[#D4AF37] border-2 border-[#D4AF37]/50 flex items-center justify-center mx-auto shadow-inner">
              <Crown className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h4 className="text-lg font-cinzel font-bold text-[#D4AF37]">{celebrationModal}</h4>
            <p className="text-xs font-serif text-[#C5B4A0] leading-relaxed">
              Officially conferred by the Technodef Literary Archives to celebrate your authentic scholastic immersion and literary mastery.
            </p>
            <button
              onClick={() => setCelebrationModal(null)}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#8B2213] via-[#B93826] to-[#D4AF37] text-white font-cinzel font-bold text-xs uppercase tracking-wider cursor-pointer border border-[#D4AF37]/50 shadow-md"
            >
              Honors Accepted
            </button>
          </div>
        </div>
      )}

      {/* Settings Flyout Drawer (Main Page Royal UI) */}
      {showSettings && (
        <aside className="absolute top-14 right-4 z-40 w-72 p-4 rounded-2xl bg-[#1C1510] border-2 border-[#D4AF37]/40 shadow-2xl text-[#FAF5EE] space-y-4 animate-fade-in font-serif">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-2">
            <span className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#D4AF37]">Reader Preferences</span>
            <button onClick={() => setShowSettings(false)} className="text-stone-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-cinzel font-bold text-[#D4AF37] uppercase">Reading Theme</label>
            <div className="grid grid-cols-5 gap-1 text-[10px] font-cinzel font-bold">
              {[
                { id: 'parchment', label: 'Parch' },
                { id: 'obsidian', label: 'Dark' },
                { id: 'sepia', label: 'Sepia' },
                { id: 'ivory', label: 'Ivory' },
                { id: 'monsoon', label: 'Night' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`py-1 rounded-lg border uppercase cursor-pointer ${theme === t.id ? 'border-[#D4AF37] bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white' : 'border-[#D4AF37]/20 bg-[#140F0C] text-[#C5B4A0]'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-cinzel font-bold text-[#D4AF37] uppercase">Typography</label>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-cinzel font-bold">
              {[
                { id: 'cormorant', label: 'Classic' },
                { id: 'cinzel', label: 'Cinzel' },
                { id: 'serif', label: 'Serif' },
                { id: 'sans', label: 'Modern' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id as any)}
                  className={`py-1 rounded-lg border uppercase cursor-pointer ${fontFamily === f.id ? 'border-[#D4AF37] bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white' : 'border-[#D4AF37]/20 bg-[#140F0C] text-[#C5B4A0]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-cinzel font-bold text-[#D4AF37] uppercase">
              <span>Font Size: {fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="14" 
              max="26" 
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full accent-[#B93826] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#D4AF37]/25 pt-3">
            <span className="text-[10px] font-cinzel font-bold text-[#D4AF37] uppercase">Focus Line Ruler</span>
            <button
              onClick={() => setShowFocusRuler(!showFocusRuler)}
              className={`px-3 py-1 rounded-full text-[10px] font-cinzel font-bold cursor-pointer border ${showFocusRuler ? 'bg-gradient-to-r from-[#8B2213] to-[#B93826] text-white border-[#D4AF37]/50' : 'bg-[#140F0C] text-[#C5B4A0] border-[#D4AF37]/20'}`}
            >
              {showFocusRuler ? 'Active' : 'Disabled'}
            </button>
          </div>
        </aside>
      )}

      {/* Chakdaha Interactive Map View Modal / Overlay */}
      {showChakdahaMap && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center">
          <div className="relative w-full max-w-5xl bg-[#140F0C] rounded-3xl border-2 border-[#D4AF37]/50 p-4 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowChakdahaMap(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#251A13] text-[#D4AF37] hover:text-white border border-[#D4AF37]/40 z-30"
            >
              <X className="w-5 h-5" />
            </button>
            <ChakdahaInteractiveMap isDark={true} onReadChapter={() => setShowChakdahaMap(false)} />
          </div>
        </div>
      )}

      {/* Glossary Lookup History Drawer */}
      <GlossaryHistoryDrawer
        isOpen={isGlossaryHistoryOpen}
        onClose={() => setIsGlossaryHistoryOpen(false)}
        historyItems={historyItems}
        onClearHistory={() => {
          setHistoryItems([]);
          try { localStorage.removeItem('wow_glossary_history'); } catch {}
        }}
        onSaveToVault={(item) => handleToggleSaveWord(item.word)}
        onOpenPronunciation={(item) => {
          setPronunciationModalWord({
            word: item.word,
            phonetic: item.phonetic,
            bengali: item.bengali,
            definition: item.definition
          });
          setIsPronunciationGuideOpen(true);
        }}
        isDark={true}
      />

      {/* Interactive Pronunciation Guide Modal */}
      <PronunciationGuideModal
        isOpen={isPronunciationGuideOpen}
        onClose={() => setIsPronunciationGuideOpen(false)}
        word={pronunciationModalWord.word}
        phonetic={pronunciationModalWord.phonetic}
        bengaliTranslation={pronunciationModalWord.bengali}
        definition={pronunciationModalWord.definition}
        isDark={true}
      />

    </div>
  );
};
