"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HandwritingSearchPanelProps {
  onCharactersSelected: (characters: string) => void;
  onClose: () => void;
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
const CANVAS_SIZE = 260;
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
  return Array.from(
    new Set(
      (rawCandidates ?? "")
        .split(/\s+/)
        .map((candidate) => candidate.trim())
        .filter(Boolean),
    ),
  ).slice(0, 12);
}

export default function HandwritingSearchPanel({
  onCharactersSelected,
  onClose,
}: HandwritingSearchPanelProps) {
  const initializedRef = useRef(false);
  const recognitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const recognizeCandidates = useCallback(() => {
    if (!window.KanjiCanvas || !initializedRef.current) {
      return;
    }

    setCandidates(parseCandidates(window.KanjiCanvas.recognize(CANVAS_ID)));
  }, []);

  const scheduleRecognition = useCallback(() => {
    if (recognitionTimerRef.current) {
      clearTimeout(recognitionTimerRef.current);
    }

    recognitionTimerRef.current = setTimeout(recognizeCandidates, 250);
  }, [recognizeCandidates]);

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
      if (recognitionTimerRef.current) {
        clearTimeout(recognitionTimerRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    window.KanjiCanvas?.erase(CANVAS_ID);
    setCandidates([]);
  };

  const handleUndo = () => {
    window.KanjiCanvas?.deleteLast(CANVAS_ID);
    scheduleRecognition();
  };

  const handleCandidateClick = (value: string) => {
    onCharactersSelected(value);
  };

  return (
    <div className="relative mx-auto mt-3 w-full max-w-4xl overflow-hidden rounded-lg border border-outline-variant bg-surface p-4 shadow-soft">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full border border-outline-variant bg-background/95 shadow-sm"
        aria-label="Tắt khung viết tay"
        title="Tắt"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 pr-10">
        <p className="text-xs text-muted-foreground">Vẽ Hán tự vào đây</p>
        <p className="text-xs text-muted-foreground">Gợi ý kết quả</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <canvas
            id={CANVAS_ID}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            data-stroke-numbers="false"
            onMouseUp={scheduleRecognition}
            onMouseLeave={scheduleRecognition}
            onPointerUp={scheduleRecognition}
            onTouchEnd={scheduleRecognition}
            className="aspect-square w-full touch-none rounded-lg border border-outline-variant bg-[#fffaf2] shadow-sm [background-image:linear-gradient(#e5ded3_1px,transparent_1px),linear-gradient(90deg,#e5ded3_1px,transparent_1px)] [background-size:66px_66px]"
            aria-label="Khung viết tay Hán tự"
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUndo}
              disabled={!libraryReady}
              className="flex-1 border-outline-variant bg-background text-on-surface hover:bg-surface"
              aria-label="Lùi nét"
              title="Lùi"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Lùi lại
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={!libraryReady}
              className="flex-1 border-outline-variant bg-background text-on-surface hover:bg-surface"
              aria-label="Xóa nét"
              title="Xóa"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa hết
            </Button>
          </div>
        </div>

        <div className="min-w-0">
          <div className="min-h-full rounded-md border border-outline-variant bg-background p-3">
            {loadError ? (
              <p className="text-sm text-destructive">{loadError}</p>
            ) : candidates.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                {candidates.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleCandidateClick(value)}
                    className="grid h-16 w-full place-items-center rounded-lg border border-outline-variant bg-surface text-[28px] font-medium text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
                  >
                    {value}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center text-center text-sm text-muted-foreground">
                {libraryReady
                  ? "Vẽ nét rõ ràng để có kết quả chính xác nhất."
                  : "Đang tải bộ nhận diện viết tay..."}
              </div>
            )}

            <p className="mt-2 text-right text-xs text-muted-foreground">
              Mẹo: Vẽ nét rõ ràng để có kết quả chính xác nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
