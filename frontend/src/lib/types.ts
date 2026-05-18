export interface Word {
  id: number;
  kanji: string;
  kana: string;
  romaji: string;
  meaning_vi: string;
  han_viet?: string;
  meaning_en: string;
  part_of_speech: string;
  example_sentence: string;
  example_meaning_vi: string;
  isFavorite?: boolean;
}

export interface Example {
  sentence: string;
  reading?: string;
  meaning: string;
  meaningVi?: string;
}

export interface StrokeNumber {
  x: number;
  y: number;
}

export interface KanjiInfo {
  kanji: string;
  meaning_vi: string;
  meaning_en: string;
  on_reading: string;
  kun_reading: string;
  stroke_count: number;
  strokes: string[]; // SVG path data for each stroke
  stroke_numbers: StrokeNumber[]; // Position of stroke numbers
  radical?: string;        // Primary radical symbol
  radical_element?: string;
  radical_original?: string;

  radical_meaning?: string; // Vietnamese meaning of radical
}

export interface Radical {
  symbol: string;
  name: string;
  meaning: string;
  strokeCount: number;
}

export interface SearchResponse {
  results: Word[];
}

// Backend returns favorites as: { id, word_id, created_at, ...wordFields }
export interface FavoriteWord extends Word {
  id: number;
  word_id: number;
  created_at: string;
}

export interface FlashcardData {
  id: number;
  word: Word;
  mastered: boolean;
  lastReviewed?: string;
}
