'use client';

import { useState } from 'react';
import { Volume2, Check, X, RotateCcw, BookOpen } from 'lucide-react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  word: Word;
  onMastered?: (word: Word, mastered: boolean) => void;
}

export default function FlashCard({ word, onMastered }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMastered = (mastered: boolean) => {
    onMastered?.(word, mastered);
  };

  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto">
      <div
        onClick={handleFlip}
        className={cn(
          "relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-red-50/50 rounded-2xl shadow-lg border border-border
                     flex flex-col items-center justify-center p-6 backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Kanji */}
          <h2 className="text-7xl font-bold text-foreground mb-4">{word.kanji}</h2>

          {/* Kana hint */}
          <p className="text-xl text-muted-foreground mb-2">{word.kana}</p>

          {/* Hint text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <BookOpen className="w-4 h-4" />
            <span>Click to reveal</span>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/5 to-white rounded-2xl shadow-lg border border-border
                     flex flex-col items-center justify-center p-6"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Meaning */}
          <p className="text-2xl font-semibold text-foreground mb-2 text-center">{word.meaning_vi}</p>

          {/* Example */}
          {word.example_sentence && (
            <div className="mt-4 text-center">
              <p className="text-lg text-muted-foreground italic mb-1">{word.example_sentence}</p>
              <p className="text-sm text-muted-foreground">{word.example_meaning_vi}</p>
            </div>
          )}

          {/* Kana */}
          <p className="text-lg text-muted-foreground mt-4">{word.kana}</p>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleMastered(false);
              }}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="rounded-full"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
              className="rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleMastered(true);
              }}
              className="rounded-full hover:bg-green-100 hover:text-green-600"
            >
              <Check className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
