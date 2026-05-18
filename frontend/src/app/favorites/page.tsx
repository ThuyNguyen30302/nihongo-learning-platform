'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Book, Layers, Home, Search } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import WordCard from '@/components/WordCard';
import { Word } from '@/lib/types';
import * as api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favs = await api.getFavorites();
      const favsWithStatus = favs.map((w) => ({ ...w, isFavorite: true }));
      setFavorites(favsWithStatus);
    } catch {
      setError('Không thể tải danh sách yêu thích.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (word: Word) => {
    try {
      await api.removeFavorite(word.id);
      setFavorites((prev) => prev.filter((w) => w.id !== word.id));
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        active="favorites"
        backHref="/"
        actions={
          <Link
            href="/flashcards"
            className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
            aria-label="Flashcards"
          >
            <Layers className="w-5 h-5 text-muted-foreground" />
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-grow max-w-[1100px] mx-auto px-6 py-8 w-full">
        <section className="flex flex-col gap-2 mb-6">
          <h1 className="font-headline-lg text-headline-lg text-on-background">Từ vựng yêu thích</h1>
          <p className="font-body-md text-body-md text-muted-foreground">
            {favorites.length} từ đã lưu
          </p>
        </section>

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

        {!loading && !error && favorites.length === 0 && (
          <Card className="text-center border border-outline-variant">
            <CardContent className="p-12">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-headline-md font-semibold mb-2">Chưa có từ yêu thích nào</h3>
              <p className="text-muted-foreground mb-6">
                Hãy tìm kiếm và lưu lại những từ bạn muốn học.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Book className="w-5 h-5" />
                  Tìm kiếm từ mới
                </Link>
                <Link
                  href="/flashcards"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Layers className="w-5 h-5" />
                  Học với Flashcards
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && favorites.length > 0 && (
          <div className="space-y-6">
            {favorites.map((word) => (
              <WordCard key={word.id} word={word} onToggleFavorite={handleRemoveFavorite} />
            ))}
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
        <span className="flex flex-col items-center text-primary font-bold">
          <Heart className="w-5 h-5" />
          <span className="text-label-sm">Favorites</span>
        </span>
        <Link href="/flashcards" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Layers className="w-5 h-5" />
          <span className="text-label-sm">Learn</span>
        </Link>
      </nav>
    </div>
  );
}
