import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  Word,
} from '../database/database.service';

export interface SearchResult {
  id: number;
  kanji: string;
  kana: string;
  romaji: string;
  meaning_vi: string;
  han_viet?: string;
  meaning_en: string;
  part_of_speech: string;
  example_sentence?: string;
  example_meaning_vi?: string;
  example_tokens?: Word['example_tokens'];
}

@Injectable()
export class DictionaryService {
  constructor(private readonly databaseService: DatabaseService) {}

  search(query: string): { results: SearchResult[] } {
    const words = this.databaseService.searchWords(query);
    return {
      results: words.map((word) => ({
        id: word.id,
        kanji: word.kanji,
        kana: word.kana,
        romaji: word.romaji,
        meaning_vi: word.meaning_vi,
        han_viet: word.han_viet || '',
        meaning_en: word.meaning_en,
        part_of_speech: word.part_of_speech,
        example_sentence: word.example_sentence || '',
        example_meaning_vi: word.example_meaning_vi || '',
        ...(word.example_tokens ? { example_tokens: word.example_tokens } : {}),
      })),
    };
  }

  getWordById(id: number): Word | undefined {
    return this.databaseService.getWordById(id);
  }
}
