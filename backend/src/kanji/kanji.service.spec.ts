import { KanjiService } from './kanji.service';

describe('KanjiService', () => {
  const databaseService = {
    getKanji: jest.fn(),
    getAllKanji: jest.fn(),
  };

  const service = new KanjiService(databaseService as unknown as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns undefined when kanji is missing', () => {
    databaseService.getKanji.mockReturnValue(undefined);

    expect(service.getKanji('不存在')).toBeUndefined();
  });

  it('parses stroke paths and stroke numbers', () => {
    databaseService.getKanji.mockReturnValue({
      kanji: '日',
      meaning_vi: 'Ngày',
      meaning_en: 'Sun',
      on_reading: 'ニチ',
      kun_reading: 'ひ',
      stroke_count: 4,
      stroke_paths: 'M0 0 L1 1||M1 1 L2 2',
      stroke_numbers: JSON.stringify([{ x: 10, y: 20 }]),
      radical: '日',
      radical_element: '日',
      radical_original: '',
      radical_meaning: 'mặt trời',
    });

    expect(service.getKanji('日')).toEqual({
      kanji: '日',
      meaning_vi: 'Ngày',
      meaning_en: 'Sun',
      on_reading: 'ニチ',
      kun_reading: 'ひ',
      stroke_count: 4,
      strokes: ['M0 0 L1 1', 'M1 1 L2 2'],
      stroke_numbers: [{ x: 10, y: 20 }],
      radical: '日',
      radical_element: '日',
      radical_original: '',
      radical_meaning: 'mặt trời',
    });
  });

  it('falls back to empty stroke numbers on invalid JSON', () => {
    databaseService.getKanji.mockReturnValue({
      kanji: '水',
      meaning_vi: 'Nước',
      meaning_en: 'Water',
      on_reading: '',
      kun_reading: '',
      stroke_count: 4,
      stroke_paths: '',
      stroke_numbers: '{not-json}',
      radical: '水',
      radical_meaning: 'nước',
    });

    expect(service.getKanji('水')?.stroke_numbers).toEqual([]);
  });
});
