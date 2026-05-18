import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  const databaseService = {
    getFavorites: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    isFavorite: jest.fn(),
    getWordById: jest.fn(),
  };

  const service = new FavoritesService(databaseService as unknown as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds a favorite when the word exists', () => {
    databaseService.getWordById.mockReturnValue({
      id: 1,
      kanji: '日本',
      kana: 'にほん',
      romaji: 'nihon',
      meaning_vi: 'Nhật Bản',
      meaning_en: 'Japan',
      part_of_speech: 'danh từ',
      example_sentence: '',
      example_meaning_vi: '',
    });
    databaseService.addFavorite.mockReturnValue({
      id: 10,
      word_id: 1,
      created_at: '2026-05-18T00:00:00.000Z',
    });

    expect(service.addFavorite(1)).toEqual({
      success: true,
      message: 'Added to favorites',
      favorite: {
        id: 10,
        word_id: 1,
        created_at: '2026-05-18T00:00:00.000Z',
        word: {
          id: 1,
          kanji: '日本',
          kana: 'にほん',
          romaji: 'nihon',
          meaning_vi: 'Nhật Bản',
          meaning_en: 'Japan',
          part_of_speech: 'danh từ',
          example_sentence: '',
          example_meaning_vi: '',
        },
      },
    });
  });

  it('rejects missing words when adding a favorite', () => {
    databaseService.getWordById.mockReturnValue(undefined);

    expect(service.addFavorite(999)).toEqual({
      success: false,
      message: 'Word not found',
    });
  });

  it('removes a favorite and reports state', () => {
    databaseService.removeFavorite.mockReturnValue(true);

    expect(service.removeFavorite(1)).toEqual({
      success: true,
      message: 'Removed from favorites',
    });
  });

  it('reports whether a word is favorite', () => {
    databaseService.isFavorite.mockReturnValue(true);

    expect(service.isFavorite(1)).toEqual({ isFavorite: true });
  });
});
