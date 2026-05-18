'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Layers, Book, Search, Star, History, Lightbulb, Home } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import SearchBar from '@/components/SearchBar';
import { Word } from '@/lib/types';
import * as api from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [recentWords, setRecentWords] = useState<Word[]>([]);
  const [favPreview, setFavPreview] = useState<Word[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.getFavorites().catch(() => []), api.getRandomWords(4)])
      .then(([favs, random]) => {
        if (cancelled) return;
        setFavPreview(favs.slice(0, 4));
        setRecentWords(random);
      })
      .catch(() => {
        // silently fail
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        active="home"
        actions={
          <>
            <Link
              href="/favorites"
              className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
              aria-label="Favorites"
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link
              href="/flashcards"
              className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
              aria-label="Flashcards"
            >
              <Layers className="w-5 h-5 text-muted-foreground" />
            </Link>
          </>
        }
      />

      {/* Main */}
      <main className="flex-grow max-w-[1100px] mx-auto px-6 py-8 w-full pb-24">
        {/* Hero Search */}
        <section className="mb-12 relative max-w-[800px] mx-auto z-40 text-center pt-12">
          <h1 className="font-headline-lg text-headline-lg text-on-background mb-8">
            Tra cứu từ điển
          </h1>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Tìm kiếm từ vựng, Kanji..."
          />
        </section>

        {/* Two columns: History + Favorites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Recent / Suggestions */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-soft p-6 flex flex-col gap-4">
            <h2 className="font-headline-md text-[20px] text-on-surface flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-primary" />
              Lịch sử tìm kiếm
            </h2>
            <div className="flex flex-col gap-2">
              {recentWords.length > 0 ? (
                recentWords.map((word) => (
                  <Link
                    key={word.id}
                    href={`/word/${word.id}`}
                    className="flex items-center justify-between py-3 px-4 hover:bg-surface-container-low rounded-lg transition-colors border border-transparent hover:border-outline-variant"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-headline-md text-[18px] text-on-surface">{word.kanji}</span>
                      <span className="text-body-md text-muted-foreground text-sm">{word.kana}</span>
                      <span className="text-body-md text-on-surface text-sm truncate max-w-[200px]">{word.meaning_vi}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center">
                  <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Bắt đầu tìm kiếm để xem gợi ý</p>
                </div>
              )}
            </div>
          </div>

          {/* Favorites Preview */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-soft p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-headline-md text-[20px] text-on-surface flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Từ vựng yêu thích
              </h2>
              <Link href="/favorites" className="text-primary font-label-md hover:underline text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {favPreview.length > 0 ? (
                favPreview.map((word) => (
                  <Link
                    key={word.id}
                    href={`/word/${word.id}`}
                    className="flex items-center justify-between py-3 px-4 hover:bg-surface-container-low rounded-lg transition-colors border border-transparent hover:border-outline-variant"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-headline-md text-[18px] text-on-surface">{word.kanji}</span>
                      <span className="text-body-md text-muted-foreground text-sm">{word.kana}</span>
                      <span className="text-body-md text-on-surface text-sm truncate max-w-[200px]">{word.meaning_vi}</span>
                    </div>
                    <Star className="w-4 h-4 text-primary" />
                  </Link>
                ))
              ) : (
                <div className="py-6 text-center">
                  <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Chưa có từ yêu thích nào</p>
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    <Search className="w-4 h-4" />
                    Tìm kiếm từ mới
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
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
        <span className="flex flex-col items-center text-primary font-bold">
          <Home className="w-5 h-5" />
          <span className="text-label-sm">Home</span>
        </span>
        <Link href="/search" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Book className="w-5 h-5" />
          <span className="text-label-sm">Search</span>
        </Link>
        <Link href="/favorites" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Heart className="w-5 h-5" />
          <span className="text-label-sm">Favorites</span>
        </Link>
        <Link href="/flashcards" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Layers className="w-5 h-5" />
          <span className="text-label-sm">Learn</span>
        </Link>
      </nav>
    </div>
  );
}
