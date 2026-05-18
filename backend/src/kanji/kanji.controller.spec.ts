import { NotFoundException } from '@nestjs/common';
import { KanjiController } from './kanji.controller';

describe('KanjiController', () => {
  const kanjiService = {
    getKanji: jest.fn(),
  };

  const controller = new KanjiController(kanjiService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the first CJK character from a mixed input value', () => {
    kanjiService.getKanji.mockReturnValue({ kanji: '日' });

    expect(controller.getKanji('日本')).toEqual({ kanji: '日' });
    expect(kanjiService.getKanji).toHaveBeenCalledWith('日');
  });

  it('rejects input without a CJK character', () => {
    expect(() => controller.getKanji('abc')).toThrow(NotFoundException);
    expect(kanjiService.getKanji).not.toHaveBeenCalled();
  });
});
