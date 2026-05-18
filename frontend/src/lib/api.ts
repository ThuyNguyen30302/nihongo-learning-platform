import axios from 'axios';
import { Word, SearchResponse, FlashcardData, KanjiInfo, SearchType } from './types';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchWords = async (
  query: string,
  type: SearchType = 'auto',
): Promise<SearchResponse> => {
  const response = await api.get<SearchResponse>('/api/search', {
    params: { q: query, type },
  });
  return response.data;
};

export const getWordById = async (id: string): Promise<Word> => {
  const response = await api.get<Word>(`/api/word/${id}`);
  return response.data;
};

export const getRandomWords = async (count: number = 10): Promise<Word[]> => {
  const response = await api.get<SearchResponse>('/api/search', {
    params: { q: '' },
  });
  return response.data.results?.slice(0, count) || [];
};

export const getFavorites = async (): Promise<Word[]> => {
  const response = await api.get<{ favorites: Array<{ id: number; word_id: number; kanji: string; kana: string; romaji: string; meaning_vi: string; han_viet?: string; meaning_en: string; part_of_speech: string; example_sentence: string; example_meaning_vi: string }> }>('/api/favorites');
  return response.data.favorites.map(fav => ({
    id: fav.word_id,
    kanji: fav.kanji,
    kana: fav.kana,
    romaji: fav.romaji,
    meaning_vi: fav.meaning_vi,
    han_viet: fav.han_viet,
    meaning_en: fav.meaning_en,
    part_of_speech: fav.part_of_speech,
    example_sentence: fav.example_sentence,
    example_meaning_vi: fav.example_meaning_vi,
  }));
};

export const addFavorite = async (wordId: number): Promise<void> => {
  await api.post('/api/favorites', { wordId });
};

export const removeFavorite = async (wordId: number): Promise<void> => {
  await api.delete(`/api/favorites/${wordId}`);
};

export const getFlashcards = async (): Promise<FlashcardData[]> => {
  const response = await api.get<{ favorites: Array<{ id: number; word_id: number; created_at: string; kanji: string; kana: string; romaji: string; meaning_vi: string; han_viet?: string; meaning_en: string; part_of_speech: string; example_sentence: string; example_meaning_vi: string }> }>('/api/favorites');
  return response.data.favorites.map(fav => ({
    id: fav.id,
    word: {
      id: fav.word_id,
      kanji: fav.kanji,
      kana: fav.kana,
      romaji: fav.romaji,
      meaning_vi: fav.meaning_vi,
      han_viet: fav.han_viet,
      meaning_en: fav.meaning_en,
      part_of_speech: fav.part_of_speech,
      example_sentence: fav.example_sentence,
      example_meaning_vi: fav.example_meaning_vi,
    },
    mastered: false,
  }));
};

export const getKanji = async (kanji: string): Promise<KanjiInfo> => {
  // Use query parameter for reliability with Unicode characters
  const url = `http://localhost:3001/api/kanji?char=${encodeURIComponent(kanji)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch kanji: ${response.status}`);
  }
  return response.json();
};

export default api;
