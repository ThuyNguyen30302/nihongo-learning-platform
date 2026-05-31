'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck, Volume2 } from 'lucide-react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import ExampleSentence from './ExampleSentence';

interface WordListItemProps {
  word: Word;
  onToggleFavorite?: (word: Word) => void;
}

export default function WordListItem({ word, onToggleFavorite }: WordListItemProps) {
  const handleToggleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(word);
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link href={`/word/${word.id}`} className="block">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-soft hover:shadow-interaction transition-all p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3 flex-1 min-w-0">
            <span className="font-headline-md text-[20px] text-on-surface font-semibold shrink-0">
              {word.kanji}
            </span>
            <span className="text-body-md text-muted-foreground text-sm shrink-0">
              {word.kana}
            </span>
            <span className="text-body-md text-on-surface text-sm truncate hidden sm:inline">
              {word.meaning_vi}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {word.part_of_speech && (
              <span className="hidden md:inline text-label-sm bg-surface-container text-on-surface px-2.5 py-1 rounded-full">
                {word.part_of_speech}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVolumeClick}
              className="w-8 h-8 text-muted-foreground hover:text-primary"
              title="Phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavoriteClick}
              className={`w-8 h-8 ${
                word.isFavorite
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              title={word.isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              {word.isFavorite ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile meaning */}
        <div className="sm:hidden mt-1">
          <p className="text-body-md text-on-surface text-sm truncate">{word.meaning_vi}</p>
        </div>
        {word.han_viet && (
          <p className="mt-2 text-label-sm text-muted-foreground">
            Hán Việt: {word.han_viet}
          </p>
        )}

        {word.example_sentence && (
          <div className="mt-3 border-t border-outline-variant pt-3">
            <ExampleSentence
              sentence={word.example_sentence}
              meaningVi={word.example_meaning_vi}
              tokens={word.example_tokens}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
