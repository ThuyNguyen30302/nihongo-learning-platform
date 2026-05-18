"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Volume2, Layers } from "lucide-react";
import { Word, KanjiInfo } from "@/lib/types";
import { getKanji } from "@/lib/api";
import KanjiStrokeOrder from "./KanjiStrokeOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Extract all kanji characters from a word
function extractKanji(text: string): string[] {
  const kanji: string[] = [];
  for (const char of text) {
    if (/[\u4e00-\u9faf]/.test(char) && !kanji.includes(char)) {
      kanji.push(char);
    }
  }
  return kanji;
}

interface WordCardProps {
  word: Word;
  onToggleFavorite?: (word: Word) => void;
}

export default function WordCard({ word, onToggleFavorite }: WordCardProps) {
  const [kanjiDataMap, setKanjiDataMap] = useState<Record<string, KanjiInfo>>(
    {},
  );
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [loadingKanji, setLoadingKanji] = useState(false);

  // Extract all unique kanji from the word
  const kanjiList = extractKanji(word.kanji);
  const [selectedKanjiIndex, setSelectedKanjiIndex] = useState(0);
  const selectedKanji = kanjiList[selectedKanjiIndex] || kanjiList[0];
  const kanjiData = kanjiDataMap[selectedKanji];

  // Fetch stroke data for a specific kanji
  const fetchKanjiData = useCallback(
    async (kanji: string) => {
      if (kanjiDataMap[kanji]) return; // Already cached

      setLoadingKanji(true);
      try {
        const data = await getKanji(kanji);
        setKanjiDataMap((prev) => ({ ...prev, [kanji]: data }));
      } catch (err) {
        console.error("Failed to load kanji data:", err);
      } finally {
        setLoadingKanji(false);
      }
    },
    [kanjiDataMap],
  );

  // Fetch kanji data when stroke order is shown
  useEffect(() => {
    if (showStrokeOrder && selectedKanji) {
      fetchKanjiData(selectedKanji);
    }
  }, [showStrokeOrder, selectedKanji, fetchKanjiData]);

  // When selected kanji changes, reset animation by forcing re-render
  const [animationKey, setAnimationKey] = useState(0);
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [selectedKanji]);

  const handleSelectKanji = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedKanjiIndex(index);
  };

  const toggleStrokeOrder = () => {
    setShowStrokeOrder(!showStrokeOrder);
  };

  const handleToggleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(word);
  };

  const handleToggleStrokeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStrokeOrder();
  };

  const handleVolumeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link href={`/word/${word.id}`} className="block">
      <Card className="overflow-hidden border border-outline-variant shadow-soft hover:shadow-interaction transition-all">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Kanji */}
              <h2 className="text-display-lg font-bold mb-2">{word.kanji}</h2>

              {/* Kana */}
              <p className="text-body-md text-muted-foreground mb-2">
                {word.kana}
              </p>

              {/* Romaji */}
              {word.romaji && (
                <p className="text-label-md text-muted-foreground mb-3">
                  {word.romaji}
                </p>
              )}

              {/* Meaning */}
              <p className="text-body-lg mb-1">{word.meaning_vi}</p>
              {word.han_viet && (
                <p className="text-label-md text-muted-foreground mb-2">
                  Hán Việt: {word.han_viet}
                </p>
              )}
              {word.part_of_speech && (
                <p className="text-label-sm text-muted-foreground mb-2">
                  ({word.part_of_speech})
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4">
              {kanjiList.length > 0 && (
                <Button
                  variant={showStrokeOrder ? "default" : "ghost"}
                  size="icon"
                  onClick={handleToggleStrokeClick}
                  title="Toggle stroke order"
                >
                  <Layers className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavoriteClick}
                title={
                  word.isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                {word.isFavorite ? (
                  <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVolumeClick}
                title="Listen pronunciation"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stroke Order Animation */}
          {showStrokeOrder && (
            <div className="mt-6 pt-6 border-t border-outline-variant">
              {/* Kanji Selector */}
              {kanjiList.length > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-muted-foreground">
                    Chọn kanji:
                  </span>
                  <div className="flex gap-1">
                    {kanjiList.map((kanji, index) => (
                      <Button
                        key={kanji}
                        variant={
                          selectedKanjiIndex === index ? "default" : "secondary"
                        }
                        size="sm"
                        onClick={(e) => handleSelectKanji(e, index)}
                        className="w-10 h-10 p-0"
                      >
                        {kanji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stroke Info */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Stroke Order - {selectedKanji}
                </h3>
                <div className="text-xs text-muted-foreground">
                  {kanjiData?.stroke_count || 0} strokes
                </div>
              </div>

              {/* Loading state */}
              {loadingKanji && (
                <div className="bg-surface-container-low rounded-lg aspect-square flex items-center justify-center">
                  <span className="text-muted-foreground">
                    Loading stroke data...
                  </span>
                </div>
              )}

              {/* Stroke Animation */}
              {kanjiData && kanjiData.strokes.length > 0 && (
                <KanjiStrokeOrder
                  key={animationKey}
                  kanji={kanjiData.kanji}
                  strokes={kanjiData.strokes}
                  strokeNumbers={kanjiData.stroke_numbers}
                  animationSpeed={500}
                  autoPlay={true}
                />
              )}

              {/* Radical Info */}
              {kanjiData && kanjiData.radical && (
                <div className="mt-6 pt-4 border-t border-outline-variant">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3">
                    BỘ THỦ (RADICAL)
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {kanjiData.radical}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {kanjiData.radical_meaning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Examples */}
          {word.example_sentence && (
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Ví dụ
              </h3>
              <div className="bg-surface-container-low/50 rounded-lg p-3">
                <p className="text-lg">{word.example_sentence}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {word.example_meaning_vi}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
