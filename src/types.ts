export type ReadingTheme = 'light' | 'sepia' | 'dark';

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  pages: {
    pageNumber: number;
    text: string;
    verse?: string;
    themeNote?: string;
  }[];
}

export interface Quote {
  id: string;
  text: string;
  speaker: string;
  chapter: string;
  theme: string;
}

export interface Bookmark {
  pageNumber: number;
  chapterId: number;
  chapterTitle: string;
  snippet: string;
  timestamp: string;
}

export interface ReaderNote {
  id: string;
  pageNumber: number;
  chapterId: number;
  selectedText: string;
  userNote: string;
  timestamp: string;
}

export interface TrackInfo {
  id: string;
  title: string;
  subtitle: string;
  type: 'flute' | 'chopin' | 'ambient' | 'tanpura';
}
