import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavorites() {
    return this.favoritesService.getFavorites();
  }

  @Post()
  addFavorite(@Body('wordId', ParseIntPipe) wordId: number) {
    return this.favoritesService.addFavorite(wordId);
  }

  @Delete(':wordId')
  removeFavorite(@Param('wordId', ParseIntPipe) wordId: number) {
    return this.favoritesService.removeFavorite(wordId);
  }

  @Get('check/:wordId')
  isFavorite(@Param('wordId', ParseIntPipe) wordId: number) {
    return this.favoritesService.isFavorite(wordId);
  }
}
