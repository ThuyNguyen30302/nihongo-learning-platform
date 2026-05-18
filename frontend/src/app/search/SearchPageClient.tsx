'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Layers, Book, Home } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import SearchBar from '@/components/SearchBar';
import WordListItem from '@/components/WordListItem';
import { Word } from '@/lib/types';
import * as api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const [autoQuery, setAutoQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Word[] | undefined>(undefined);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debouncedQuery = useDebounce(autoQuery.trim(), 300);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.searchWords(q.trim());
      const wordsWithFavorites = response.results.map((word) => ({
        ...word,
        isFavorite: favorites.has(word.id),
      }));
      setResults(wordsWithFavorites);
    } catch {
      setError('TÃ¬m kiáº¿m tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
    performSearch(initialQuery);
  }, [initialQuery, performSearch]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions(undefined);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);

    api
      .searchWords(debouncedQuery)
      .then((response) => {
        if (!cancelled) {
          setSuggestions(response.results);
          setSuggestionsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions(undefined);
          setSuggestionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const loadFavorites = async () => {
    try {
      const favs = await api.getFavorites();
      const favSet = new Set(favs.map((w) => w.id));
      setFavorites(favSet);
    } catch {
      // silently fail
    }
  };

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleQueryChange = (q: string) => {
    setAutoQuery(q);
  };

  const handleSuggestionSelect = (word: Word) => {
    router.push(`/word/${word.id}`);
  };

  const handleToggleFavorite = async (word: Word) => {
    try {
      if (favorites.has(word.id)) {
        await api.removeFavorite(word.id);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(word.id);
          return next;
        });
      } else {
        await api.addFavorite(word.id);
        setFavorites((prev) => new Set(prev).add(word.id));
      }
      setResults((prev) =>
        prev.map((w) =>
          w.id === word.id
            ? { ...w, isFavorite: !favorites.has(word.id) }
            : w
        )
      );
    } catch {
      // silently fail
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        active="search"
        actions={
          <>
            <Link href="/favorites" className="p-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link href="/flashcards" className="p-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </Link>
          </>
        }
      />

      {/* Main */}
      <main className="flex-grow max-w-[1100px] mx-auto px-6 py-8 w-full pb-24">
        <section className="mb-8 max-w-[800px] mx-auto">
          <div className="text-center mb-6">
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
              Tra cá»©u tá»« Ä‘iá»ƒn
            </h1>
            <p className="text-muted-foreground text-body-md">
              Nháº­p tá»« vá»±ng tiáº¿ng Nháº­t, Kanji hoáº·c nghÄ©a tiáº¿ng Viá»‡t
            </p>
          </div>
          <SearchBar
            onSearch={handleSearch}
            initialValue={query}
            placeholder="TÃ¬m kiáº¿m tá»« vá»±ng, Kanji..."
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            onSuggestionSelect={handleSuggestionSelect}
            onQueryChange={handleQueryChange}
          />
        </section>

        <section className="mt-8">
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

          {!loading && !error && query && results.length === 0 && (
            <Card className="text-center border border-outline-variant">
              <CardContent className="p-12">
                <Book className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-headline-md font-semibold mb-2">KhÃ´ng tÃ¬m tháº¥y káº¿t quáº£</h3>
                <p className="text-muted-foreground">
                  Thá»­ tÃ¬m kiáº¿m vá»›i tá»« khÃ³a khÃ¡c hoáº·c kiá»ƒm tra chÃ­nh táº£.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-label-md font-semibold text-muted-foreground">
                  {results.length} káº¿t quáº£ cho â€œ{query}â€
                </h3>
              </div>
              {results.map((word) => (
                <WordListItem
                  key={word.id}
                  word={word}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-surface mt-auto">
        <div className="max-w-[1100px] mx-auto px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Carrot â€” Japanese-Vietnamese Dictionary
          </p>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 md:hidden bg-surface border-t border-outline-variant shadow-soft">
        <Link href="/" className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
          <Home className="w-5 h-5" />
          <span className="text-label-sm">Home</span>
        </Link>
        <span className="flex flex-col items-center text-primary font-bold">
          <Book className="w-5 h-5" />
          <span className="text-label-sm">Search</span>
        </span>
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
