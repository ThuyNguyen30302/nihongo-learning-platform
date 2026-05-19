"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, PencilLine, RotateCcw, Search, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HandwritingSearchPanelProps {
  onSearch: (kanji: string) => void;
}

interface KanjiCanvasApi {
  init: (canvasId: string) => void;
  erase: (canvasId: string) => void;
  deleteLast: (canvasId: string) => void;
  recognize: (canvasId: string) => string | undefined;
}

declare global {
  interface Window {
    KanjiCanvas?: KanjiCanvasApi;
  }
}

const CANVAS_ID = "kanji-handwriting-canvas";
const CANVAS_SIZE = 280;
const KANJICANVAS_SCRIPT_ID = "kanjicanvas-script";
const KANJICANVAS_PATTERNS_ID = "kanjicanvas-patterns";

function loadScript(id: string, src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = false;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function parseCandidates(rawCandidates: string | undefined) {
  return (rawCandidates ?? "")
    .split(/\s+/)
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export default function HandwritingSearchPanel({
  onSearch,
}: HandwritingSearchPanelProps) {
  const initializedRef = useRef(false);
  const [candidate, setCandidate] = useState("");
  const [candidates, setCandidates] = useState<string[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initKanjiCanvas() {
      try {
        await loadScript(
          KANJICANVAS_SCRIPT_ID,
          "/vendor/kanjicanvas/kanji-canvas.min.js",
        );
        await loadScript(
          KANJICANVAS_PATTERNS_ID,
          "/vendor/kanjicanvas/ref-patterns.js",
        );
        if (cancelled || !window.KanjiCanvas || initializedRef.current) {
          return;
        }
        window.KanjiCanvas.init(CANVAS_ID);
        initializedRef.current = true;
        setLibraryReady(true);
      } catch {
        if (!cancelled) {
          setLoadError("Không tải được bộ nhận diện viết tay.");
        }
      }
    }

    initKanjiCanvas();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClear = () => {
    window.KanjiCanvas?.erase(CANVAS_ID);
    setCandidate("");
    setCandidates([]);
  };

  const handleUndo = () => {
    window.KanjiCanvas?.deleteLast(CANVAS_ID);
    setCandidates([]);
  };

  const handleRecognize = () => {
    if (!window.KanjiCanvas) return;
    setRecognizing(true);
    try {
      const recognizedCandidates = parseCandidates(
        window.KanjiCanvas.recognize(CANVAS_ID),
      );
      setCandidates(recognizedCandidates);
      setCandidate(recognizedCandidates[0] ?? "");
    } finally {
      setRecognizing(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCandidate = candidate.trim();
    if (normalizedCandidate) {
      onSearch(normalizedCandidate);
    }
  };

  const handleCandidateSearch = (value: string) => {
    setCandidate(value);
    onSearch(value);
  };

  return (
    <div className="mx-auto mt-5 w-full max-w-2xl rounded-lg border border-outline-variant bg-surface p-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <canvas
          id={CANVAS_ID}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          data-stroke-numbers="false"
          className="aspect-square w-full max-w-[280px] touch-none rounded-lg border border-outline-variant bg-[#fffaf2] shadow-sm [background-image:linear-gradient(#e5ded3_1px,transparent_1px),linear-gradient(90deg,#e5ded3_1px,transparent_1px)] [background-size:70px_70px]"
          aria-label="Handwriting input canvas"
        />

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2 text-label-md font-semibold text-muted-foreground">
            <PencilLine className="h-4 w-4" />
            Viết tay
          </div>

          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRecognize}
              disabled={!libraryReady || recognizing}
              className="w-fit"
            >
              {recognizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Nhận diện
            </Button>
          )}

          {candidates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {candidates.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCandidateSearch(value)}
                  className={`grid h-10 w-10 place-items-center rounded-md border text-lg font-semibold transition-colors ${
                    candidate === value
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant bg-background text-on-surface hover:border-primary hover:text-primary"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          <input
            value={candidate}
            onChange={(event) => setCandidate(event.target.value)}
            placeholder="Nhập hán tự ứng viên"
            className="rounded-lg border border-input bg-background px-3 py-2 text-body-md outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-primary/20"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleUndo}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Lùi nét
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
            <Button type="submit" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Tìm
            </Button>
          </div>

          <a
            href="https://github.com/asdfjkl/kanjicanvas"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            kanjicanvas
          </a>
        </form>
      </div>
    </div>
  );
}
