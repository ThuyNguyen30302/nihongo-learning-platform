"use client";

import { useState, useEffect, useRef } from "react";

interface KanjiStrokeOrderProps {
  kanji: string;
  strokes: string[];
  strokeNumbers?: { x: number; y: number }[];
  animationSpeed?: number;
  autoPlay?: boolean;
}

export default function KanjiStrokeOrder({
  strokes,
  strokeNumbers = [],
  animationSpeed = 500,
  autoPlay = true,
}: KanjiStrokeOrderProps) {
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const [currentStroke, setCurrentStroke] = useState(
    autoPlay && strokes.length > 0 ? 0 : -1,
  );
  const [isPlaying, setIsPlaying] = useState(autoPlay && strokes.length > 0);
  const [pathLengths, setPathLengths] = useState<number[]>(
    strokes.map(() => 300),
  );
  const [strokeProgress, setStrokeProgress] = useState(0);

  const viewBoxSize = 109;

  const strokeColors = [
    "#dc2626",
    "#ea580c",
    "#ca8a04",
    "#16a34a",
    "#0891b2",
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#059669",
    "#d97706",
    "#6366f1",
    "#dc2626",
  ];

  useEffect(() => {
    pathRefs.current = pathRefs.current.slice(0, strokes.length);
    setPathLengths(
      strokes.map((_, index) => {
        const measuredLength = pathRefs.current[index]?.getTotalLength();
        return measuredLength && Number.isFinite(measuredLength)
          ? measuredLength
          : 300;
      }),
    );
  }, [strokes]);

  useEffect(() => {
    if (!isPlaying || currentStroke < 0 || strokes.length === 0) {
      return;
    }

    let startTime: number | null = null;
    let frameId = 0;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const pathLength = pathLengths[currentStroke] ?? 300;
      const progress = Math.min(elapsed / animationSpeed, 1);

      setStrokeProgress(progress * pathLength);

      if (progress < 1 && isPlaying) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      if (progress >= 1 && isPlaying) {
        if (currentStroke < strokes.length - 1) {
          setStrokeProgress(0);
          setCurrentStroke((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isPlaying, currentStroke, strokes.length, animationSpeed, pathLengths]);

  if (strokes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No stroke data</span>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className="w-full h-full"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Grid lines */}
      {/* <line
        x1="54.5"
        y1="0"
        x2="54.5"
        y2={viewBoxSize}
        stroke="#f0f0f0"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="54.5"
        x2={viewBoxSize}
        y2="54.5"
        stroke="#f0f0f0"
        strokeWidth="0.5"
      /> */}

      {/* Strokes */}
      {strokes.map((strokePath, index) => {
        const isCompleted = index < currentStroke;
        const isCurrent = index === currentStroke;
        const animationComplete =
          !isPlaying && currentStroke === strokes.length - 1;
        const pathLength = pathLengths[index] ?? 300;

        let dashOffset = pathLength;
        if (isCompleted || animationComplete) {
          dashOffset = 0;
        } else if (isCurrent) {
          dashOffset = pathLength - strokeProgress;
        }

        const strokeColor = strokeColors[index % strokeColors.length];

        return (
          <path
            key={index}
            ref={(element) => {
              pathRefs.current[index] = element;
            }}
            d={strokePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
          />
        );
      })}

      {/* Stroke numbers — appear sequentially with each stroke */}
      {strokeNumbers.map((pos, index) => {
        const numColor = strokeColors[index % strokeColors.length];
        const visible = index <= currentStroke;
        return (
          <text
            key={`num-${index}`}
            x={pos.x}
            y={pos.y}
            fontSize="8"
            fill={numColor}
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            opacity={visible ? 1 : 0}
            style={{ transition: "opacity 0.15s ease-in" }}
          >
            {index + 1}
          </text>
        );
      })}
    </svg>
  );
}
