import { Chapter, Quote } from '../types';

export const NOVEL_META = {
  title: "WILTING OF WORDS",
  tagline: "Some voices are silenced in life, but their words live louder than ever.",
  subtitle: "A poignantly crafted page-by-page digital reading experience exploring voice, survival, and identity of Aratrika.",
  authorName: "Pratyay Saha",
  publisher: "Technodef",
  googleDrivePdfUrl: "https://drive.google.com/file/d/1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR/preview",
  googleDocsViewerUrl: "https://docs.google.com/viewer?srcid=1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR&pid=explorer&efh=false&a=v&chrome=false&embedded=true",
  googleDriveDirectLink: "https://drive.google.com/file/d/1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR/view?usp=drivesdk"
};

export const AUTHOR_BIO = {
  name: "Pratyay Saha",
  role: "Author & Literary Scholar",
  dob: "29 November 2008",
  birthplace: "Chakdaha, Nadia",
  school: "St. Mary’s Arcadian School",
  grade: "Class XI Science",
  academicAchievement: "99.4% achiever in CBSE Class 10",
  bio: "Born on 29 November 2008 in Chakdaha, Pratyay Saha is a Class XI Science student at St. Mary’s Arcadian School. A 99.4% achiever in CBSE Class 10, he is passionate about classical literature, recitation, debating and academics. His dream is to become a doctor and contribute to society through knowledge, compassion and words.",
  achievements: [
    { label: "99.4% CBSE Class 10", icon: "GraduationCap" },
    { label: "Recitation | Debate | Literature", icon: "BookOpen" },
    { label: "St. Mary’s Arcadian School", icon: "Building" },
    { label: "Published by Technodef", icon: "Sparkles" }
  ]
};

export const ABOUT_THE_BOOK = {
  paragraphs: [
    "Wilting of Words is a work of literary fiction that explores the life, dreams, struggles, and voice of Aratrika, a young girl whose writing becomes a powerful means of confronting the world around her.",
    "Set against the realities of family, education, social expectations, and inequality, the story follows Aratrika as she discovers the strength of her own words. Her journey raises questions about how society treats young voices, how prejudice can shape lives, and how a person's ideas can survive even when the person is no longer there.",
    "At its heart, Wilting of Words is a story about voice, memory, injustice, ambition, and the enduring power of writing."
  ],
  quote: "Sometimes words seem to disappear—but the right words can remain long after their writer is gone.",
  
  // Requirement 4: Key Characters & Perspectives
  characterDossier: [
    {
      name: "Aratrika",
      role: "The Voice & Visionary",
      description: "The writer who turns her struggles, dreams, and convictions into a powerful voice."
    },
    {
      name: "Krittika",
      role: "The Successor",
      description: "The classmate whose journey transforms from observer to a leader carrying Aratrika’s legacy."
    },
    {
      name: "Prangik",
      role: "The Preserver",
      description: "The admirer of Aratrika’s writing who later helps preserve and bring her words to the wider world."
    },
    {
      name: "Mr. & Mrs. Saha",
      role: "The Family & Society",
      description: "Aratrika’s parents, representing the complicated influence of family, expectations, and society."
    }
  ],
  
  // Requirement 5: Format and Soundtrack pairing removed
  editionSpecs: [
    { label: "Publisher", value: "Technodef Literary Press" },
    { label: "Genre", value: "Literary Fiction / Social Drama" },
    { label: "Author", value: "Pratyay Saha" },
    { label: "Origin", value: "Chakdaha, West Bengal" }
  ]
};

export interface WritingMilestone {
  date: string;
  isoDate: string;
  title: string;
  stage: string;
  icon: 'Sprout' | 'PenTool' | 'Palette' | 'FileText' | 'RotateCw' | 'BookOpenCheck';
  description: string;
  status: 'completed' | 'milestone' | 'planned';
  progressPercentage: number;
  tags: string[];
  royalAura: string;
}

export const WRITING_JOURNEY: WritingMilestone[] = [
  {
    date: "12 APRIL 2026",
    isoDate: "2026-04-12",
    title: "THE IDEA",
    stage: "Genesis & Literary Spark",
    icon: "Sprout",
    description: "The journey of Wilting of Words began on 12 April 2026, when the idea for the novel first took shape.",
    status: "completed",
    progressPercentage: 15,
    tags: ["Ideation", "Literary Spark", "Chakdaha"],
    royalAura: "from-[#D4AF37] to-[#E5A93C]"
  },
  {
    date: "12 APRIL 2026",
    isoDate: "2026-04-12",
    title: "THE FIRST WORDS",
    stage: "Inception of the Narrative",
    icon: "PenTool",
    description: "On the very same day, the first words of the story were written. An idea had officially begun becoming a novel.",
    status: "completed",
    progressPercentage: 30,
    tags: ["Manuscript", "Sepia Ink", "Opening Line"],
    royalAura: "from-[#B93826] to-[#D85A2A]"
  },
  {
    date: "12 APRIL 2026",
    isoDate: "2026-04-12",
    title: "THE COVER",
    stage: "Visual Identity & Emblem",
    icon: "Palette",
    description: "The visual identity of Wilting of Words also began on 12 April 2026, with the creation of its cover design.",
    status: "completed",
    progressPercentage: 45,
    tags: ["Cover Art", "Aesthetic", "Royal Gold"],
    royalAura: "from-[#E5A93C] to-[#B93826]"
  },
  {
    date: "21 JULY 2026",
    isoDate: "2026-07-21",
    title: "FIRST DRAFT",
    stage: "Manuscript Completion",
    icon: "FileText",
    description: "After months of writing, the first complete draft was finished on 21 July 2026.",
    status: "completed",
    progressPercentage: 70,
    tags: ["219 Pages", "Complete Arc", "Dedication"],
    royalAura: "from-[#8B2213] to-[#D4AF37]"
  },
  {
    date: "25 SEPTEMBER 2026",
    isoDate: "2026-09-25",
    title: "REVISION",
    stage: "Editorial Refinement",
    icon: "RotateCw",
    description: "The manuscript entered a new stage on 25 September 2026. The story was revisited, refined, and revised in preparation for publication.",
    status: "completed",
    progressPercentage: 88,
    tags: ["Refinement", "Prose Polishing", "Structure"],
    royalAura: "from-[#D85A2A] to-[#B93826]"
  },
  {
    date: "29 NOVEMBER 2026",
    isoDate: "2026-11-29",
    title: "PUBLICATION",
    stage: "Planned Publication",
    icon: "BookOpenCheck",
    description: "The journey reaches its next milestone on 29 November 2026, when Wilting of Words is planned to be published.",
    status: "planned",
    progressPercentage: 100,
    tags: ["Technodef Press", "Official Launch", "Official Landmark"],
    royalAura: "from-[#B93826] via-[#D4AF37] to-[#E5A93C]"
  }
];

export const WRITING_JOURNEY_SUMMARY = {
  header: "FROM AN IDEA TO A NOVEL",
  timeframe: "12 APRIL 2026 → 29 NOVEMBER 2026",
  quote: "From the first idea and first words to the finished manuscript and publication — Wilting of Words is a journey of writing, revision, and creation.",
  totalDays: 231
};

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Title & Inscription",
    subtitle: "Technodef Literary Archive Edition",
    pages: [
      {
        pageNumber: 1,
        text: `WILTING OF WORDS\n\nA Novel\nby Pratyay Saha\n\nSome words fade with time.\nOthers wait for someone to carry them.\n\nPublished by TECHNODEF\nHeritage Digital Edition\n\nDedicated to every unspoken thought that refused to die in silence.`,
        verse: `"To every unspoken tremor of the heart that found a sanctuary in ink."`,
        themeNote: "Opening Inscription"
      },
      {
        pageNumber: 2,
        text: `PROLOGUE: THE SILENT COURTYARD\n\nThere is a peculiar fragrance that clings to old red oxide floors right before the Nor'wester strikes. A mingling of scorched dust, wet jasmine, and the petrichor of forgotten years.\n\nIn the quiet ancestral house at Chakdaha, Aratrika stood by the carved mahogany lattice. In her trembling hands lay a brittle diary with yellowed edges. The letters inside were faint—written in sepia fountain ink that had slowly wilted under thirty seasons of humidity and heartbreak.\n\n"If you are reading this," the first entry whispered, "it means the silence in this house has finally found its voice."`,
        verse: `"Language does not die because of silence; it wilts when there is no one left to listen."`,
        themeNote: "Atmospheric Introduction"
      }
    ]
  },
  {
    id: 2,
    title: "Chapter I: Whispers in the Verandah",
    subtitle: "The Awakening of Memories",
    pages: [
      {
        pageNumber: 3,
        text: `Aratrika had always believed that the human voice was a fragile vessel. When her grandmother stopped speaking after the Great Flood of 1978, the villagers thought grief had paralyzed her vocal cords. But as Aratrika turned the second page, she uncovered the truth.\n\n"We do not fall silent out of weakness," Grandma's cursive read. "We silence ourselves because some truths are too heavy for words to carry without breaking."\n\nOutside, the gentle hum of an afternoon tanpura resonated from the neighbouring music academy, blending seamlessly with the rustling mango leaves.`,
        verse: `"In the quietest rooms, history is written not with drums, but with teardrops on paper."`,
        themeNote: "Memory & Heritage"
      },
      {
        pageNumber: 4,
        text: `As twilight settled over the riverbank, the distant sound of conch shells announced the evening rituals. Aratrika traced the dried bougainvillea petals pressed between the pages of the chronicle.\n\nShe remembered her school days in Nadia—how reciting classical verses in the morning assembly had once given her an invincible warmth. Why had she let the corporate hustle in the metropolis silence her poetic soul? Why had she allowed her own words to wilt?\n\nShe took a deep breath, dipped her fountain pen into indigo ink, and made her first marginal notation: 'I am listening.'`,
        verse: `"Return to the root, and the dried branch shall put forth emerald leaves once more."`,
        themeNote: "Identity & Awakening"
      }
    ]
  },
  {
    id: 3,
    title: "Chapter II: Terracotta Shadows",
    subtitle: "Art, Pain and Immortal Craft",
    pages: [
      {
        pageNumber: 5,
        text: `The following morning, Aratrika took the local train through the countryside. The red soil smelled of ancient fired terracotta. Looking at the carvings of the historic temple ruins, she realized that every artisan had poured their unspoken agony into clay.\n\nThe burnt tiles had withstood centuries of torrential monsoons, invasions, and historical decay. Yet the faces carved into the bricks—dancers, warriors, weeping mothers—still radiated life.\n\n"Art is the only rebellion that does not shed blood," Pratyay writes through the protagonist’s journal. "It is the only weapon that conquers mortality without taking a life."`,
        verse: `"Clay in the kiln forgets its weakness to become a monument of eternity."`,
        themeNote: "Terracotta Resilience"
      },
      {
        pageNumber: 6,
        text: `Sitting beneath an ancient tree near the temple ruins, Aratrika unscrewed her fountain pen. A single drop of turquoise ink bloomed upon the pristine white sheet of her sketchbook.\n\nFor the first time in ten years, she was not writing a project proposal or an email. She was writing the chronicle of her ancestors—the silent weavers, the boatmen singing folk melodies across the river, the brave thinkers who fought for illumination.\n\nThe wilting of words was reversing. Every syllable was drinking light.`,
        verse: `"When ink touches truth, silence turns into a roaring symphony."`,
        themeNote: "Catharsis & Creation"
      }
    ]
  },
  {
    id: 4,
    title: "Chapter III: The Quiet Library",
    subtitle: "The Discovery of Mutual Resonance",
    pages: [
      {
        pageNumber: 7,
        text: `The library was the only place in the school where silence was not an instruction; it was an agreement.\n\nEvery afternoon, when the final bell signalled the end of classes and the corridors erupted with running footsteps and loud goodbyes, Aratrika walked toward the library. It smelled of old paper, polished wood, and rain.\n\nMrs. Sen, the librarian, rarely looked up from her desk. She did not ask students why they were there. She did not demand to know their marks. She simply let them read.`,
        verse: `"In the quiet sanctuary of books, words find shelter and minds find peace."`,
        themeNote: "Sanctuary of Silence"
      },
      {
        pageNumber: 8,
        text: `On this particular afternoon, she sat at a corner table near the tall window. Raindrops tapped against the glass.\n\n"It is easier to follow a crowd than to build a road," Prangik said softly, standing beside the table with a book on astronomy.\n\nFor Aratrika, something shifted. For the first time, she realized she wasn't alone in her thoughts. As she left, Prangik said, "Keep writing, Aratrika. Some people need to read things they're too afraid to say."`,
        verse: `"To speak when others whisper is courage; to write when others fall silent is immortality."`,
        themeNote: "Companionship in Thought"
      }
    ]
  },
  {
    id: 5,
    title: "Chapter IV: The Girl at the Window",
    subtitle: "The India I Want to See",
    pages: [
      {
        pageNumber: 9,
        text: `There was a window in Aratrika's room that faced the road. From there, she could watch the world without being required to participate in it. Every morning she saw the ordinary neighbourhood, learning that ordinary places were full of extraordinary stories.\n\nShe opened her notebook and wrote: 'Every window is a library. Every person outside carries a book that nobody else can completely read. Perhaps writing is simply the attempt to read those invisible books.'`,
        verse: `"Every human being is an unread library waiting for an empathetic eye."`,
        themeNote: "The Window of Stories"
      },
      {
        pageNumber: 10,
        text: `The following week, the English teacher announced a writing competition: “The India I Want to See.” Aratrika raised her hand to participate in Bengali—the language of her soul.\n\nShe wrote about people: the girl whose dreams were dismissed as too large, the boy told failure made him worthless, and families measuring children only by marks. Near midnight, placing her pages in a folder, she whispered: “Maybe someday.” For the first time, she was preparing to let her words leave the room.`,
        verse: `"Once words leave their writer, they begin an eternal journey of their own."`,
        themeNote: "Courage to Share"
      }
    ]
  },
  {
    id: 6,
    title: "Chapter V: What They Called Her",
    subtitle: "Friendship and Parental Expectation",
    pages: [
      {
        pageNumber: 11,
        text: `By Monday, the writing competition became the most discussed event in class. Krittika dropped into the seat beside Aratrika. “Are you participating?” “Yes.” “What did you write about?” “The topic.” Krittika laughed. They formed a quiet bond over secret essays and shared jokes.\n\nLater, Mr. Saha read Aratrika's essay on 'The India I Want to See.' He noted she spent too much time thinking beyond her age and told her to concentrate on studies. Mrs. Saha observed her neat handwriting.`,
        verse: `"The journey of youth is measured not in marks, but in the courage to question."`,
        themeNote: "First Friendships"
      },
      {
        pageNumber: 12,
        text: `The teacher returned the essays with a red mark: 'Excellent. Your ideas are mature. Continue writing.' Aratrika stared at the words.\n\nIn the library, she found a loose sheet of paper with a handwritten sentence: 'Words do not disappear merely because nobody hears them.' She copied it into her notebook, adding: 'But sometimes they need someone to carry them.' Across the city, Prangik was beginning to notice the girl who always carried a notebook.`,
        verse: `"Words do not disappear merely because nobody hears them."`,
        themeNote: "The Mysterious Sentence"
      }
    ]
  },
  {
    id: 7,
    title: "Chapter VI: Ink",
    subtitle: "The Power of Handwriting",
    pages: [
      {
        pageNumber: 13,
        text: `The first thing Prangik noticed about Aratrika was her handwriting on the classroom notice board beside the competition results. He had never known that she wrote.\n\nA few days later in the library, Aratrika dropped her pen. Prangik picked it up. “Here.” “Thank you.” Their eyes met briefly. “I saw your name on the writing competition list.” “Oh.” “You write?” “Sometimes.” “That's a lot of pages for sometimes.”`,
        verse: `"A single stroke of ink can bridge the distance between two silent worlds."`,
        themeNote: "The Notice Board"
      }
    ]
  },
  {
    id: 8,
    title: "Chapter VII: The Pages Between Them",
    subtitle: "Trust and Shared Sentences",
    pages: [
      {
        pageNumber: 14,
        text: `After that afternoon, Prangik noticed Aratrika more often—writing in the margins of time, guarding her notebook fiercely. When the teacher announced an assignment on someone who changed your thinking, Prangik found her in the corridor.\n\nLater, in the library, Aratrika quietly pushed one page toward him. “You can read this part.” Prangik read it without speaking. “This is good.” She smiled. Not because he praised her, but because he read without laughing. Trust had begun with a single page.`,
        verse: `"Perhaps trust begins with a single page shared in silence."`,
        themeNote: "The Shared Page"
      }
    ]
  }
];

export const FAMOUS_QUOTES: Quote[] = [
  {
    id: "q1",
    text: "Sometimes words seem to disappear—but the right words can remain long after their writer is gone.",
    speaker: "Wilting of Words",
    chapter: "Core Inscription",
    theme: "Immortal Voice"
  },
  {
    id: "q2",
    text: "Some voices are silenced in life, but their words live louder than ever.",
    speaker: "Aratrika",
    chapter: "Prologue",
    theme: "Immortal Voice"
  },
  {
    id: "q3",
    text: "We do not fall silent out of weakness; we silence ourselves because some truths are too heavy for words to carry without breaking.",
    speaker: "Aratrika’s Reflections",
    chapter: "Chapter I",
    theme: "Truth & Silence"
  },
  {
    id: "q4",
    text: "Art is the only rebellion that does not shed blood, yet reshapes centuries of human consciousness.",
    speaker: "Pratyay Saha",
    chapter: "Chapter II",
    theme: "Creative Rebellion"
  },
  {
    id: "q5",
    text: "Clay in the kiln forgets its fragility to become a monument of eternity.",
    speaker: "Temple Artisan Monologue",
    chapter: "Chapter III",
    theme: "Resilience"
  }
];
