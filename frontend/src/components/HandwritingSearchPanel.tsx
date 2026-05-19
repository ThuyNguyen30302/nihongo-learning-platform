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
  ).slice(0, 16);
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
    <div className="mx-auto mt-3 w-full max-w-2xl rounded-lg border border-outline-variant bg-surface p-3 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[260px_minmax(0,1fr)]">
        <div className="space-y-2">
          <div className="relative">
            <canvas
              id={CANVAS_ID}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              data-stroke-numbers="false"
              onMouseUp={scheduleRecognition}
              onMouseLeave={scheduleRecognition}
              onPointerUp={scheduleRecognition}
              onTouchEnd={scheduleRecognition}
              className="aspect-square w-full touch-none rounded-lg border border-outline-variant bg-[#fffaf2] shadow-sm [background-image:linear-gradient(#e5ded3_1px,transparent_1px),linear-gradient(90deg,#e5ded3_1px,transparent_1px)] [background-size:65px_65px]"
              aria-label="Khung viết tay Hán tự"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-2 top-2 h-8 w-8 rounded-full border border-outline-variant bg-background/95 shadow-sm"
              aria-label="Tắt khung viết tay"
              title="Tắt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={!libraryReady}
              className="h-9 w-9"
              aria-label="Lùi nét"
              title="Lùi"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClear}
              disabled={!libraryReady}
              className="h-9 w-9"
              aria-label="Xóa nét"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="min-h-[166px] rounded-md border border-outline-variant bg-background p-3">
            {loadError ? (
              <p className="text-sm text-destructive">{loadError}</p>
            ) : candidates.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5">
                {candidates.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleCandidateClick(value)}
                    className="grid h-11 w-full place-items-center rounded-md border border-outline-variant bg-surface text-xl font-semibold text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
                  >
                    {value}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[138px] items-center justify-center text-center text-sm text-muted-foreground">
                {libraryReady
                  ? "Viết Hán tự trên canvas để xem ký tự gần giống."
                  : "Đang tải bộ nhận diện viết tay..."}
              </div>
            )}
          </div>

          <a
            href="https://github.com/asdfjkl/kanjicanvas"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            kanjicanvas
          </a>
        </div>
      </div>
    </div>
  );
}
