'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Shuffle,
  RotateCcw,
  CheckCircle,
  XCircle,
  BookOpen,
  Home,
  Heart,
  Search,
} from 'lucide-react';
import FlashCard from '@/components/FlashCard';
import AppHeader from '@/components/AppHeader';
import { Word, FlashcardData } from '@/lib/types';
import * as api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      const data = await api.getFlashcards();
      setCards(data);
    } catch {
      setError('Không thể tải flashcards. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleMastered = async (word: Word, mastered: boolean) => {
    setSessionStats((prev) => ({
      ...prev,
      [mastered ? 'correct' : 'incorrect']:
        prev[mastered ? 'correct' : 'incorrect'] + 1,
    }));

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  const masteredCount = cards.filter((c) => c.mastered).length;
  const progressValue =
    cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        active="flashcards"
        backHref="/"
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShuffle}
              title="Xáo trộn"
              className="hover:bg-surface-container-low"
            >
              <Shuffle className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="Bắt đầu lại"
              className="hover:bg-surface-container-low"
            >
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <main className="flex-grow max-w-[1100px] mx-auto px-6 py-8 w-full pb-24">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && cards.length === 0 && (
          <Card className="text-center border border-outline-variant">
            <CardContent className="p-12">
              <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-headline-md font-semibold mb-2">Chưa có flashcards</h3>
              <p className="text-muted-foreground mb-6">
                Thêm từ vào yêu thích để tạo flashcards học tập.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                <BookOpen className="w-4 h-4" />
                Tìm kiếm từ vựng
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && !error && cards.length > 0 && (
          <div className="max-w-md mx-auto">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 font-label-md text-label-md text-muted-foreground">
                <span>Tiến độ</span>
                <span className="font-bold text-primary">
                  {Math.min(currentIndex + 1, cards.length)} / {cards.length} cards
                </span>
              </div>
              <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-fixed-dim rounded-full transition-all"
                  style={{ width: `${Math.min(progressValue, 100)}%` }}
                />
              </div>
            </div>

            {/* Session Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex items-center gap-2 text-body-md">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span>{sessionStats.correct} đúng</span>
              </div>
              <div className="flex items-center gap-2 text-body-md">
                <XCircle className="w-5 h-5 text-destructive" />
                <span>{sessionStats.incorrect} sai</span>
              </div>
            </div>

            {/* Flashcard */}
            {currentIndex < cards.length ? (
              <div className="mb-8">
                <FlashCard
                  key={cards[currentIndex].id}
                  word={cards[currentIndex].word}
                  onMastered={handleMastered}
                />
              </div>
            ) : (
              /* Session Complete */
              <Card className="text-center border border-outline-variant shadow-soft">
                <CardContent className="p-12">
                  <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-on-secondary-container" />
                  </div>
                  <h3 className="text-headline-lg font-bold mb-4">Hoàn thành!</h3>
                  <p className="text-muted-foreground mb-6">
                    Bạn đã ôn tập {cards.length} từ.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Ôn lại
                    </Button>
                    <Link
                      href="/search"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <BookOpen className="w-4 h-4" />
                      Tìm kiếm
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev === 0 ? cards.length - 1 : prev - 1
                  )
                }
              >
                Trước
              </Button>
              <Button
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % cards.length)
                }
              >
                Tiếp
              </Button>
            </div>

            {/* Mastered indicator */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {masteredCount} / {cards.length} từ đã thuộc
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface mt-auto">
        <div className="max-w-[1100px] mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Carrot — Japanese-Vietnamese Dictionary
          </p>
        </div>
      </footer>

      {/* BottomNav — mobile only */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 md:hidden bg-surface border-t border-outline-variant shadow-soft">
        <Link href="/" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-label-sm">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Search className="w-5 h-5" />
          <span className="text-label-sm">Search</span>
        </Link>
        <Link href="/favorites" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-5 h-5" />
          <span className="text-label-sm">Favorites</span>
        </Link>
        <span className="flex flex-col items-center text-primary font-bold">
          <Layers className="w-5 h-5" />
          <span className="text-label-sm">Learn</span>
        </span>
      </nav>
    </div>
  );
}

