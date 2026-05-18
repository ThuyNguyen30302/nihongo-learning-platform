import { DictionaryService } from './dictionary.service';

describe('DictionaryService', () => {
  const databaseService = {
    searchWords: jest.fn(),
    getWordById: jest.fn(),
  };

  const service = new DictionaryService(databaseService as unknown as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps database words into search results', () => {
    databaseService.searchWords.mockReturnValue([
      {
        id: 1,
        kanji: '日本',
        kana: 'にほん',
        romaji: 'nihon',
        meaning_vi: 'Nhật Bản',
        han_viet: 'Nhật Bản',
        meaning_en: 'Japan',
        part_of_speech: 'danh từ',
        example_sentence: '',
        example_meaning_vi: '',
      },
    ]);

    expect(service.search('nihon')).toEqual({
      results: [
        {
          id: 1,
          kanji: '日本',
          kana: 'にほん',
          romaji: 'nihon',
          meaning_vi: 'Nhật Bản',
          han_viet: 'Nhật Bản',
          meaning_en: 'Japan',
          part_of_speech: 'danh từ',
          example_sentence: '',
          example_meaning_vi: '',
        },
      ],
    });
    expect(databaseService.searchWords).toHaveBeenCalledWith('nihon', 'auto');
  });

  it('passes explicit search type to the database service', () => {
    databaseService.searchWords.mockReturnValue([]);

    expect(service.search('nihon', 'romaji')).toEqual({ results: [] });
    expect(databaseService.searchWords).toHaveBeenCalledWith('nihon', 'romaji');
  });

  it('returns the word by id from the database service', () => {
    databaseService.getWordById.mockReturnValue({
      id: 2,
      kanji: '水',
      kana: 'みず',
      romaji: 'mizu',
      meaning_vi: 'Nước',
      meaning_en: 'Water',
      part_of_speech: 'danh từ',
      example_sentence: '水を飲みます。',
      example_meaning_vi: 'Uống nước.',
    });

    expect(service.getWordById(2)).toEqual({
      id: 2,
      kanji: '水',
      kana: 'みず',
      romaji: 'mizu',
      meaning_vi: 'Nước',
      meaning_en: 'Water',
      part_of_speech: 'danh từ',
      example_sentence: '水を飲みます。',
      example_meaning_vi: 'Uống nước.',
    });
  });
});
