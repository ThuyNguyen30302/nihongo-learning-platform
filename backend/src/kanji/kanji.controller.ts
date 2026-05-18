import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { KanjiService } from './kanji.service';

@Controller('api/kanji')
export class KanjiController {
  constructor(private readonly kanjiService: KanjiService) {}

  @Get()
  getKanji(@Query('char') char: string) {
    const normalizedChar =
      Array.from(char?.trim() ?? '').find((value) =>
        /[\u3400-\u9fff]/u.test(value),
      ) ?? '';
    if (!normalizedChar) {
      throw new NotFoundException('Character parameter required');
    }
    const kanjiData = this.kanjiService.getKanji(normalizedChar);
    if (!kanjiData) {
      throw new NotFoundException('Kanji not found');
    }
    return kanjiData;
  }
}
