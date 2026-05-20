"use client";

import { useEffect, useMemo, useState } from "react";
import { searchWords } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ExampleToken, Word } from "@/lib/types";

interface ExampleSentenceProps {
  sentence: string;
  meaningVi: string;
  tokens?: ExampleToken[];
  className?: string;
}

interface TextSpan {
  id: number | string;
  text: string;
  tokenId?: number;
  title?: string;
}

function normalizeForMatch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildNormalizedMap(value: string) {
  let normalized = "";
  const sourceIndexes: number[] = [];

  for (const [index, char] of Array.from(value).entries()) {
    const normalizedChar = normalizeForMatch(char);
    for (const piece of Array.from(normalizedChar)) {
      normalized += piece;
      sourceIndexes.push(index);
    }
  }

  return { normalized, sourceIndexes };
}

function findAccentInsensitiveSpan(text: string, query: string) {
  const needle = normalizeForMatch(query);
  if (!needle) {
    return null;
  }

  const haystack = buildNormalizedMap(text);
  const start = haystack.normalized.indexOf(needle);
  if (start === -1) {
    return null;
  }

  const end = start + needle.length - 1;
  const startIndex = haystack.sourceIndexes[start];
  const endIndex = haystack.sourceIndexes[end];
  if (startIndex === undefined || endIndex === undefined) {
    return null;
  }

  return {
    start: startIndex,
    end: endIndex + 1,
  };
}

const tokenLookupCache = new Map<string, Promise<Word[]>>();

function segmentSentence(sentence: string) {
  if (!sentence) {
    return [] as Array<{ text: string; start: number; end: number; kind: "word" | "space" | "punctuation" }>;
  }

  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter("ja", { granularity: "word" })
      : null;

  if (segmenter) {
    return [...segmenter.segment(sentence)].map((segment) => {
      const text = segment.segment;
      const kind = /^\s+$/u.test(text)
        ? "space"
        : /^[\p{P}\p{S}]+$/u.test(text)
          ? "punctuation"
          : "word";

      return {
        text,
        start: segment.index,
        end: segment.index + text.length,
        kind,
      };
    });
  }

  const tokens: Array<{ text: string; start: number; end: number; kind: "word" | "space" | "punctuation" }> = [];
  const pattern =
    /(\s+|[\p{P}\p{S}]+|[\p{Script=Han}]+|[\p{Script=Hiragana}]+|[\p{Script=Katakana}]+|[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?|.)/gu;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(sentence)) !== null) {
    const text = match[1];
    const kind = /^\s+$/u.test(text)
      ? "space"
      : /^[\p{P}\p{S}]+$/u.test(text)
        ? "punctuation"
        : "word";

    tokens.push({
      text,
      start: match.index,
      end: match.index + text.length,
      kind,
    });
  }

  return tokens;
}

async function lookupWordCandidates(query: string) {
  const normalized = query.trim();
  if (!normalized) {
    return [] as Word[];
  }

  const cached = tokenLookupCache.get(normalized);
  if (cached) {
    return cached;
  }

  const request = searchWords(normalized)
    .then((response) => response.results ?? [])
    .catch(() => [] as Word[]);

  tokenLookupCache.set(normalized, request);
  return request;
}

async function analyzeSentence(sentence: string, meaningVi: string) {
  const tokens = segmentSentence(sentence);

  return Promise.all(
    tokens.map(async (token, index) => {
      if (token.kind !== "word" || !token.text.trim()) {
        return {
          id: index + 1,
          surface: token.text,
          start: token.start,
          end: token.end,
          part_of_speech: null,
          meaning_vi: null,
        } as ExampleToken;
      }

      const candidates = await lookupWordCandidates(token.text);
      const word =
        candidates.find(
          (candidate) =>
            candidate.kanji === token.text ||
            candidate.kana === token.text ||
            candidate.romaji.toLowerCase() === token.text.toLowerCase(),
        ) ?? candidates[0];

      const meaningMatch = findBestMeaningSpan(meaningVi, word?.meaning_vi);

      return {
        id: index + 1,
        surface: token.text,
        start: token.start,
        end: token.end,
        part_of_speech: word?.part_of_speech || null,
        meaning_vi: meaningMatch?.text ?? null,
      } as ExampleToken;
    }),
  );
}

function findBestMeaningSpan(meaningVi: string, tokenMeaningVi?: string | null) {
  if (!meaningVi || !tokenMeaningVi) {
    return undefined;
  }

  const phrases = tokenMeaningVi
    .split(/[;、,/·•\n]+/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  for (const phrase of phrases) {
    const exactIndex = meaningVi.indexOf(phrase);
    if (exactIndex >= 0) {
      return {
        text: phrase,
        start: exactIndex,
        end: exactIndex + phrase.length,
      };
    }

    const normalizedMatch = findAccentInsensitiveSpan(meaningVi, phrase);
    if (normalizedMatch) {
      return {
        text: meaningVi.slice(normalizedMatch.start, normalizedMatch.end),
        ...normalizedMatch,
      };
    }
  }

  return undefined;
}

function buildJapaneseSegments(sentence: string, tokens: ExampleToken[]) {
  if (tokens.length === 0) {
    return [{ id: "plain", text: sentence }];
  }

  const orderedTokens = [...tokens].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.end - b.end;
  });

  const segments: TextSpan[] = [];
  let cursor = 0;

  orderedTokens.forEach((token, index) => {
    if (token.start > cursor) {
      segments.push({
        id: `gap-${cursor}`,
        text: sentence.slice(cursor, token.start),
      });
    }

    segments.push({
      id: token.id || `token-${index}`,
      text: sentence.slice(token.start, token.end),
      tokenId: token.id,
      title: token.part_of_speech ?? undefined,
    });

    cursor = Math.max(cursor, token.end);
  });

  if (cursor < sentence.length) {
    segments.push({
      id: `gap-${cursor}`,
      text: sentence.slice(cursor),
    });
  }

  return segments;
}

function buildVietnameseSegments(meaningVi: string, tokens: ExampleToken[]) {
  if (!meaningVi.trim() || tokens.length === 0) {
    return [{ id: "plain", text: meaningVi }];
  }

  const spans = tokens
    .filter((token) => token.meaning_vi?.trim())
    .map((token) => {
      const match = findAccentInsensitiveSpan(meaningVi, token.meaning_vi || "");
      if (!match) {
        return null;
      }

      return {
        id: token.id,
        start: match.start,
        end: match.end,
      };
    })
    .filter(
      (span): span is { id: number; start: number; end: number } =>
        span !== null,
    )
    .sort((a, b) => {
      const lengthA = a.end - a.start;
      const lengthB = b.end - b.start;
      if (lengthA !== lengthB) {
        return lengthB - lengthA;
      }
      return a.start - b.start;
    });

  const chosen: { id: number; start: number; end: number }[] = [];
  const occupied = new Array(meaningVi.length).fill(false);

  for (const span of spans) {
    let overlaps = false;
    for (let index = span.start; index < span.end; index += 1) {
      if (occupied[index]) {
        overlaps = true;
        break;
      }
    }

    if (overlaps) {
      continue;
    }

    for (let index = span.start; index < span.end; index += 1) {
      occupied[index] = true;
    }

    chosen.push(span);
  }

  chosen.sort((a, b) => a.start - b.start);

  const segments: TextSpan[] = [];
  let cursor = 0;

  chosen.forEach((span) => {
    if (span.start > cursor) {
      segments.push({
        id: `vi-gap-${cursor}`,
        text: meaningVi.slice(cursor, span.start),
      });
    }

    segments.push({
      id: span.id,
      text: meaningVi.slice(span.start, span.end),
      tokenId: span.id,
    });

    cursor = Math.max(cursor, span.end);
  });

  if (cursor < meaningVi.length) {
    segments.push({
      id: `vi-gap-${cursor}`,
      text: meaningVi.slice(cursor),
    });
  }

  return segments;
}

export default function ExampleSentence({
  sentence,
  meaningVi,
  tokens = [],
  className,
}: ExampleSentenceProps) {
  const [activeTokenId, setActiveTokenId] = useState<number | null>(null);
  const [resolvedTokens, setResolvedTokens] = useState<ExampleToken[] | null>(
    null,
  );
  const activeTokens = useMemo(
    () => (tokens && tokens.length > 0 ? tokens : resolvedTokens ?? []),
    [tokens, resolvedTokens],
  );

  const japaneseSegments = useMemo(
    () => buildJapaneseSegments(sentence, activeTokens),
    [sentence, activeTokens],
  );

  const vietnameseSegments = useMemo(
    () => buildVietnameseSegments(meaningVi, activeTokens),
    [meaningVi, activeTokens],
  );

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      return;
    }

    let cancelled = false;

    analyzeSentence(sentence, meaningVi).then((nextTokens) => {
      if (!cancelled) {
        setResolvedTokens(nextTokens);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sentence, meaningVi, tokens]);

  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex flex-wrap gap-x-1 gap-y-2 text-lg leading-8 text-on-surface">
        {japaneseSegments.map((segment) =>
          segment.tokenId ? (
            <span
              key={String(segment.id)}
              title={segment.title}
              onMouseEnter={() => setActiveTokenId(segment.tokenId ?? null)}
              onMouseLeave={() => setActiveTokenId(null)}
              className={cn(
                "rounded-md px-0.5 transition-colors",
                activeTokenId === segment.tokenId
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-surface-container-low",
              )}
            >
              {segment.text}
            </span>
          ) : (
            <span key={String(segment.id)} className="whitespace-pre-wrap">
              {segment.text}
            </span>
          ),
        )}
      </p>

      {meaningVi.trim() && (
        <p className="flex flex-wrap gap-x-1 gap-y-1 text-sm leading-6 text-muted-foreground">
          {vietnameseSegments.map((segment) =>
            segment.tokenId ? (
              <span
                key={String(segment.id)}
                className={cn(
                  "rounded-md px-0.5 transition-colors",
                  activeTokenId === segment.tokenId
                    ? "bg-primary/15 text-primary font-medium"
                    : "hover:bg-surface-container-low",
                )}
              >
                {segment.text}
              </span>
            ) : (
              <span key={String(segment.id)} className="whitespace-pre-wrap">
                {segment.text}
              </span>
            ),
          )}
        </p>
      )}
    </div>
  );
}
