"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Book, Heart, Home, Layers } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import HandwritingSearchPanel from "@/components/HandwritingSearchPanel";
import SearchBar from "@/components/SearchBar";
import WordListItem from "@/components/WordListItem";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import * as api from "@/lib/api";
import { Word } from "@/lib/types";

const searchPlaceholder =
  "Tìm từ vựng, kana, romaji, Hán tự hoặc nghĩa tiếng Việt...";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [showHandwriting, setShowHandwriting] = useState(false);
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [autoQuery, setAutoQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Word[] | undefined>(undefined);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debouncedQuery = useDebounce(autoQuery.trim(), 300);

  const performSearch = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.searchWords(value.trim());
        const wordsWithFavorites = response.results.map((word) => ({
          ...word,
          isFavorite: favorites.has(word.id),
        }));
        setResults(wordsWithFavorites);
      } catch {
        setError("Tìm kiếm thất bại. Vui lòng thử lại.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [favorites],
  );

  const loadFavorites = async () => {
    try {
      const favs = await api.getFavorites();
      setFavorites(new Set(favs.map((word) => word.id)));
    } catch {
      // Favorites are optional for search rendering.
    }
  };

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

  const handleSearch = (value: string) => {
    const normalizedQuery = value.trim();
    if (normalizedQuery) {
      router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setAutoQuery(value);
  };

  const handleHandwritingCharacters = (characters: string) => {
    const nextQuery = `${query}${characters}`;
    setQuery(nextQuery);
    setAutoQuery(nextQuery);
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
        prev.map((item) =>
          item.id === word.id
            ? { ...item, isFavorite: !favorites.has(word.id) }
            : item,
        ),
      );
    } catch {
      // Keep search usable even if favorite sync fails.
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader
        active="search"
        actions={
          <>
            <Link
              href="/favorites"
              className="rounded-lg p-2 transition-colors hover:bg-surface-container-low"
            >
              <Heart className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link
              href="/flashcards"
              className="rounded-lg p-2 transition-colors hover:bg-surface-container-low"
            >
              <Layers className="h-5 w-5 text-muted-foreground" />
            </Link>
          </>
        }
      />

      <main className="mx-auto w-full max-w-[1100px] flex-grow px-6 py-8 pb-24">
        <section className="mx-auto mb-8 max-w-[800px]">
          <div className="mb-6 text-center">
            <h1 className="font-headline-lg text-headline-lg mb-2 text-on-background">
              Tra cứu từ điển
            </h1>
            <p className="text-body-md text-muted-foreground">
              Nhập từ vựng tiếng Nhật, kana, romaji, Hán tự hoặc nghĩa tiếng Việt
            </p>
          </div>

          <SearchBar
            onSearch={handleSearch}
            initialValue={query}
            placeholder={searchPlaceholder}
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            handwritingOpen={showHandwriting}
            onHandwritingToggle={() => setShowHandwriting((visible) => !visible)}
            onSuggestionSelect={handleSuggestionSelect}
            onQueryChange={handleQueryChange}
          />

          {showHandwriting && (
            <HandwritingSearchPanel
              selectedText={query}
              onCharactersSelected={handleHandwritingCharacters}
              onClose={() => setShowHandwriting(false)}
            />
          )}
        </section>

        <section className="mt-8">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {error && (
            <Card className="border-destructive/20 bg-destructive/10">
              <CardContent className="p-6 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && query && results.length === 0 && (
            <Card className="border border-outline-variant text-center">
              <CardContent className="p-12">
                <Book className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-headline-md mb-2 font-semibold">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-muted-foreground">
                  Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-label-md font-semibold text-muted-foreground">
                  {results.length} kết quả cho &quot;{query}&quot;
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

      <footer className="mt-auto border-t border-outline-variant bg-surface">
        <div className="mx-auto max-w-[1100px] px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Carrot - Japanese-Vietnamese Dictionary
          </p>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant bg-surface px-4 py-3 shadow-soft md:hidden">
        <Link
          href="/"
          className="flex flex-col items-center text-muted-foreground transition-colors hover:text-primary"
        >
          <Home className="h-5 w-5" />
          <span className="text-label-sm">Home</span>
        </Link>
        <span className="flex flex-col items-center font-bold text-primary">
          <Book className="h-5 w-5" />
          <span className="text-label-sm">Search</span>
        </span>
        <Link
          href="/favorites"
          className="flex flex-col items-center text-muted-foreground transition-colors hover:text-primary"
        >
          <Heart className="h-5 w-5" />
          <span className="text-label-sm">Favorites</span>
        </Link>
        <Link
          href="/flashcards"
          className="flex flex-col items-center text-muted-foreground transition-colors hover:text-primary"
        >
          <Layers className="h-5 w-5" />
          <span className="text-label-sm">Learn</span>
        </Link>
      </nav>
    </div>
  );
}
