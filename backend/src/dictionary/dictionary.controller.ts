import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { DictionaryService } from './dictionary.service';
import { SearchType } from '../database/database.service';

const SEARCH_TYPES = ['auto', 'romaji', 'vietnamese', 'kana', 'kanji'] as const;

function normalizeSearchType(type?: string): SearchType {
  return SEARCH_TYPES.includes(type as SearchType)
    ? (type as SearchType)
    : 'auto';
}

@Controller('api')
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get('search')
  search(@Query('q') query: string, @Query('type') type?: string) {
    if (!query || query.trim().length === 0) {
      return { results: [], message: 'Please provide a search query' };
    }
    return this.dictionaryService.search(
      query.trim(),
      normalizeSearchType(type),
    );
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
