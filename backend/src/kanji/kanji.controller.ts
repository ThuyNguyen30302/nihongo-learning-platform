import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { KanjiService } from './kanji.service';

@Controller('api/kanji')
export class KanjiController {
  constructor(private readonly kanjiService: KanjiService) {}

  @Get()
  getKanji(@Query('char') char: string) {
    console.log(
      'KanjiController received:',
      char,
      'unicode:',
      char?.charCodeAt(0).toString(16),
    );
    if (!char) {
      throw new NotFoundException('Character parameter required');
    }
    const kanjiData = this.kanjiService.getKanji(char);
    if (!kanjiData) {
      throw new NotFoundException('Kanji not found');
    }
    return kanjiData;
  }
}
