import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { KanjiModule } from './kanji/kanji.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [DatabaseModule, DictionaryModule, KanjiModule, FavoritesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
