import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';

@Controller('api')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('search')
  search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return { results: [], message: 'Please provide a search query' };
    }
    return this.dictionaryService.search(query.trim());
  }

  @Get('word/:id')
  getWord(@Param('id', ParseIntPipe) id: number) {
    const word = this.dictionaryService.getWordById(id);
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }
}
