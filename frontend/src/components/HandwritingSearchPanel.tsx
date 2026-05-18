"use client";

import { useEffect, useRef, useState } from "react";
import { PencilLine, RotateCcw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Point {
  x: number;
  y: number;
}

interface HandwritingSearchPanelProps {
  onSearch: (kanji: string) => void;
}

const CANVAS_SIZE = 280;

export default function HandwritingSearchPanel({
  onSearch,
}: HandwritingSearchPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [candidate, setCandidate] = useState("");
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = "#fffaf2";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = "#e5ded3";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i += 1) {
      const position = (CANVAS_SIZE / 4) * i;
      ctx.beginPath();
      ctx.moveTo(position, 0);
      ctx.lineTo(position, CANVAS_SIZE);
      ctx.moveTo(0, position);
      ctx.lineTo(CANVAS_SIZE, position);
      ctx.stroke();
    }

    ctx.strokeStyle = "#24211d";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    [...strokes, currentStroke].forEach((stroke) => {
      if (stroke.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      stroke.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    });
  }, [currentStroke, strokes]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    setCurrentStroke([getPoint(event)]);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    setCurrentStroke((prev) => [...prev, getPoint(event)]);
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    setStrokes((prev) =>
      currentStroke.length > 1 ? [...prev, currentStroke] : prev,
    );
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setCandidate("");
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedCandidate = candidate.trim();
    if (normalizedCandidate) {
      onSearch(normalizedCandidate);
    }
  };

  return (
    <div className="mx-auto mt-5 w-full max-w-2xl rounded-lg border border-outline-variant bg-surface p-4">
      <div className="flex flex-col gap-4 md:flex-row">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="aspect-square w-full max-w-[280px] touch-none rounded-lg border border-outline-variant shadow-sm"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          aria-label="Handwriting input canvas"
        />

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2 text-label-md font-semibold text-muted-foreground">
            <PencilLine className="h-4 w-4" />
            Viết tay
          </div>
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
        </form>
      </div>
    </div>
  );
}
