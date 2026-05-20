import { Injectable } from '@nestjs/common';
import { DatabaseService, Kanji } from '../database/database.service';

export interface StrokeNumber {
  x: number;
  y: number;
}

export interface KanjiResponse {
  kanji: string;
  meaning_en: string;
  on_reading: string;
  kun_reading: string;
  stroke_count: number;
  strokes: string[];
  stroke_numbers: StrokeNumber[];
  radical?: string;
  radical_element?: string;
  radical_original?: string;

  radical_meaning?: string;
}

@Injectable()
export class KanjiService {
  constructor(private readonly databaseService: DatabaseService) {}

  getKanji(kanji: string): KanjiResponse | undefined {
    const kanjiData = this.databaseService.getKanji(kanji);
    if (!kanjiData) {
      return undefined;
    }
    return this.parseKanjiData(kanjiData);
  }

  getAllKanji(): KanjiResponse[] {
    const allKanji = this.databaseService.getAllKanji();
    return allKanji.map((k) => this.parseKanjiData(k));
  }

  private parseKanjiData(kanjiData: Kanji): KanjiResponse {
    const strokes = kanjiData.stroke_paths
      ? kanjiData.stroke_paths.split('||')
      : [];

    let stroke_numbers: StrokeNumber[] = [];
    if (kanjiData.stroke_numbers) {
      try {
        stroke_numbers = JSON.parse(kanjiData.stroke_numbers) as StrokeNumber[];
      } catch {
        stroke_numbers = [];
      }
    }

    return {
      kanji: kanjiData.kanji,
      meaning_en: kanjiData.meaning_en,
      on_reading: kanjiData.on_reading || '',
      kun_reading: kanjiData.kun_reading || '',
      stroke_count: kanjiData.stroke_count || 0,
      strokes,
      stroke_numbers,
      radical: kanjiData.radical,
      radical_element: kanjiData.radical_element,
      radical_original: kanjiData.radical_original,
      radical_meaning: this.resolveRadicalMeaning(kanjiData),
    };
  }

  private resolveRadicalMeaning(kanjiData: Kanji) {
    const radicalBase =
      kanjiData.radical_original ||
      kanjiData.radical_element ||
      kanjiData.radical;

    if (radicalBase) {
      const radicalWord = this.databaseService
        .searchWords(radicalBase)
        .find((word) => word.kanji === radicalBase);

      if (radicalWord?.han_viet) {
        return radicalWord.han_viet;
      }

      if (radicalWord?.meaning_vi) {
        return radicalWord.meaning_vi;
      }
    }

    return kanjiData.radical_meaning;
  }
}
