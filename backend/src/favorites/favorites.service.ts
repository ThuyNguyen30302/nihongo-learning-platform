import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  Favorite,
  FavoriteWordRow,
  Word,
} from '../database/database.service';

export interface FavoriteWithWord extends Favorite {
  word: Word;
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
  favorite?: FavoriteWithWord;
}

@Injectable()
export class FavoritesService {
  constructor(private readonly databaseService: DatabaseService) {}

  getFavorites(): { favorites: FavoriteWordRow[] } {
    const favorites = this.databaseService.getFavorites();
    return { favorites };
  }

  addFavorite(wordId: number): FavoriteResponse {
    const word = this.databaseService.getWordById(wordId);
    if (!word) {
      return { success: false, message: 'Word not found' };
    }

    const favorite = this.databaseService.addFavorite(wordId);
    return {
      success: true,
      message: 'Added to favorites',
      favorite: {
        ...favorite,
        word,
      },
    };
  }

  removeFavorite(wordId: number): { success: boolean; message: string } {
    const removed = this.databaseService.removeFavorite(wordId);
    if (removed) {
      return { success: true, message: 'Removed from favorites' };
    }
    return { success: false, message: 'Favorite not found' };
  }

  isFavorite(wordId: number): { isFavorite: boolean } {
    return { isFavorite: this.databaseService.isFavorite(wordId) };
  }
}
