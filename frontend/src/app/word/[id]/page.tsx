"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Layers,
  Book,
  Home,
  Volume2,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Info,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Word, KanjiInfo } from "@/lib/types";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import KanjiStrokeOrder from "@/components/KanjiStrokeOrder";
import ExampleSentence from "@/components/ExampleSentence";

function extractKanji(text: string): string[] {
  const kanji: string[] = [];
  for (const char of text) {
    if (/[\u3400-\u9fff]/u.test(char) && !kanji.includes(char)) {
      kanji.push(char);
    }
  }
  return kanji;
}

export default function WordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [kanjiDataMap, setKanjiDataMap] = useState<Record<string, KanjiInfo>>(
    {},
  );
  const [loadingKanji, setLoadingKanji] = useState(false);
  const [selectedKanjiIndex, setSelectedKanjiIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const kanjiList = word ? extractKanji(word.kanji) : [];
  const selectedKanji = kanjiList[selectedKanjiIndex] || kanjiList[0];
  const kanjiData = kanjiDataMap[selectedKanji];

  const loadWord = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, favs] = await Promise.all([
        api.getWordById(id),
        api.getFavorites().catch(() => []),
      ]);
      setWord(w);
      setIsFavorite(favs.some((f) => f.id === w.id));
    } catch {
      setError("Không tìm thấy từ vựng.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadWord();
  }, [id, loadWord]);

  const fetchKanjiData = useCallback(
    async (kanji: string) => {
      if (kanjiDataMap[kanji]) return;
      setLoadingKanji(true);
      try {
        const data = await api.getKanji(kanji);
        setKanjiDataMap((prev) => ({ ...prev, [kanji]: data }));
      } catch (err) {
        console.error("Failed to load kanji data:", err);
      } finally {
        setLoadingKanji(false);
      }
    },
    [kanjiDataMap],
  );

  useEffect(() => {
    if (selectedKanji) {
      fetchKanjiData(selectedKanji);
    }
  }, [selectedKanji, fetchKanjiData]);

  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [selectedKanji]);

  const handleToggleFavorite = async () => {
    if (!word) return;
    try {
      if (isFavorite) {
        await api.removeFavorite(word.id);
        setIsFavorite(false);
      } else {
        await api.addFavorite(word.id);
        setIsFavorite(true);
      }
    } catch {
      // silently fail
    }
  };

  const handleSelectKanji = (index: number) => {
    setSelectedKanjiIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader active="search" backHref="/search" />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader active="search" backHref="/search" />
        <main className="flex-grow max-w-[1100px] mx-auto px-6 py-8 w-full">
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                {error || "Không tìm thấy từ vựng."}
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => router.push("/search")}
              >
                <Book className="w-4 h-4 mr-2" />
                Tìm kiếm
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        active="search"
        backHref="/search"
        actions={
          <>
            <Link
              href="/favorites"
              className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link
              href="/flashcards"
              className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              <Layers className="w-5 h-5 text-muted-foreground" />
            </Link>
          </>
        }
      />

      {/* Main */}
      <main className="flex-grow max-w-[1100px] mx-auto px-6 py-8 w-full pb-24">
        {/* Header Info Card */}
        <section className="bg-white bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-surface-variant mb-10 relative">
          <div className="absolute top-6 right-6 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-[#ff8c42] text-white hover:bg-[#e67e3a] rounded-full shadow-soft"
              title="Phát âm"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full shadow-soft border border-[#ff8c42] ${
                isFavorite
                  ? "bg-[#ff8c42] text-white hover:bg-[#e67e3a]"
                  : "bg-white text-[#ff8c42] hover:bg-surface-container-low"
              }`}
              onClick={handleToggleFavorite}
              title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              {isFavorite ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <span className="text-body-md text-muted-foreground mb-1 text-center">
                  {word.kana}
                </span>
                <span className="text-[64px] leading-none text-on-background font-bold tracking-widest">
                  {word.kanji}
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-headline-lg text-primary mb-2 first-letter:uppercase">
            {word.meaning_vi}
          </h1>
          {word.han_viet && (
            <p className="text-body-md text-muted-foreground">
              Hán Việt: {word.han_viet}
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-surface-variant">
            <h3 className="text-label-md text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Thông tin từ vựng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-label-md text-muted-foreground block mb-1">
                    Loại từ
                  </span>
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-md inline-block">
                    {word.part_of_speech || "Chưa phân loại"}
                  </span>
                </div>
                {word.romaji && (
                  <div>
                    <span className="text-label-md text-muted-foreground block mb-1">
                      Romaji
                    </span>
                    <span className="text-body-lg text-on-surface font-medium">
                      {word.romaji}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stroke Order */}
        {kanjiList.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center mb-4">
              <h2 className="text-headline-md font-semibold text-on-background flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Thứ tự nét
              </h2>
            </div>

            <Card className="border border-outline-variant shadow-soft">
              <CardContent className="p-6">
                {kanjiList.length > 1 && (
                  <div className="flex items-center gap-6 mb-6 border-b border-outline-variant">
                    {kanjiList.map((kanji, index) => (
                      <button
                        key={kanji}
                        onClick={() => handleSelectKanji(index)}
                        className={`pb-2 text-body-md font-medium transition-colors relative ${
                          selectedKanjiIndex === index
                            ? "text-primary"
                            : "text-muted-foreground hover:text-on-surface"
                        }`}
                      >
                        {kanji}
                        {selectedKanjiIndex === index && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-square max-w-[320px] bg-[#fffcf5] border border-outline-variant rounded-2xl relative overflow-hidden shadow-sm">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgb(240,240,240) 1px, transparent 1px), linear-gradient(rgb(240,240,240) 1px, transparent 1px), linear-gradient(to right, rgb(224,224,224) 2px, transparent 2px), linear-gradient(rgb(224,224,224) 2px, transparent 2px)",
                          backgroundSize: "25% 25%, 25% 25%, 50% 50%, 50% 50%",
                        }}
                      />
                      <div className="relative w-full h-full p-8 flex items-center justify-center">
                        {loadingKanji && (
                          <span className="text-muted-foreground">
                            Đang tải...
                          </span>
                        )}
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
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-4"
                      onClick={() => setAnimationKey((k) => k + 1)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Vẽ lại
                    </Button>
                  </div>

                  <div className="space-y-5">
                    {kanjiData?.stroke_count && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1 h-4 bg-primary rounded-full" />
                          <span className="text-label-md text-muted-foreground">
                            Số nét
                          </span>
                        </div>
                        <span className="text-body-lg text-on-surface font-medium">
                          {kanjiData.stroke_count} nét
                        </span>
                      </div>
                    )}
                    {kanjiData?.radical && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1 h-4 bg-primary rounded-full" />
                          <span className="text-label-md text-muted-foreground">
                            Bộ thủ
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center border border-surface-variant">
                            <span className="text-2xl font-bold text-primary">
                              {kanjiData.radical_element || kanjiData.radical}
                            </span>
                          </div>
                          <div>
                            {kanjiData.radical_original && (
                              <p className="text-sm text-on-surface">
                                Gốc: {kanjiData.radical_original}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {kanjiData.radical_meaning}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {kanjiData?.on_reading && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1 h-4 bg-primary rounded-full" />
                          <span className="text-label-md text-muted-foreground">
                            Onyomi
                          </span>
                        </div>
                        <span className="text-body-md text-on-surface">
                          {kanjiData.on_reading}
                        </span>
                      </div>
                    )}
                    {kanjiData?.kun_reading && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1 h-4 bg-primary rounded-full" />
                          <span className="text-label-md text-muted-foreground">
                            Kunyomi
                          </span>
                        </div>
                        <span className="text-body-md text-on-surface">
                          {kanjiData.kun_reading}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Examples */}
        {word.example_sentence && (
          <section className="mb-10">
            <h2 className="text-headline-md font-semibold text-on-background mb-6">
              Ví dụ sử dụng
            </h2>
            <div className="space-y-4">
              <Card className="border border-outline-variant shadow-soft hover:shadow-interaction transition-shadow">
                <CardContent className="p-6 flex items-start gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 border-primary text-primary hover:bg-primary hover:text-on-primary rounded-full shrink-0"
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                  <div>
                    <ExampleSentence
                      sentence={word.example_sentence}
                      meaningVi={word.example_meaning_vi}
                      tokens={word.example_tokens}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
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
        <Link
          href="/"
          className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-label-sm">Home</span>
        </Link>
        <Link
          href="/search"
          className="flex flex-col items-center text-primary font-bold"
        >
          <Book className="w-5 h-5" />
          <span className="text-label-sm">Search</span>
        </Link>
        <Link
          href="/favorites"
          className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <Heart className="w-5 h-5" />
          <span className="text-label-sm">Favorites</span>
        </Link>
        <Link
          href="/flashcards"
          className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <Layers className="w-5 h-5" />
          <span className="text-label-sm">Learn</span>
        </Link>
      </nav>
    </div>
  );
}
