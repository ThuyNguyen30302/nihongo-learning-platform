"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ExampleToken } from "@/lib/types";

interface ExampleSentenceProps {
  sentence: string;
  meaningVi: string;
  tokens?: ExampleToken[];
  className?: string;
}

interface TextSpan {
  id: number | string;
  text: string;
  token?: ExampleToken;
  posLabel?: string;
  posGroup?: NonNullable<ExampleToken["pos_group"]>;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .trim();
}

function isParticle(surface: string) {
  return /^(は|が|を|に|へ|と|で|や|も|の|か|ね|よ|な|ぞ|さ)$/u.test(surface);
}

function isVerbLike(surface: string) {
  return /^(する|し|して|してい|て|てい|ます|ました|ない|なかっ|だった|です|だ|いる|いく|くる|れる|られる|た)$/u.test(
    surface,
  );
}

function resolvePosLabel(token: ExampleToken) {
  if (token.pos_label) {
    return token.pos_label;
  }

  const source = normalize(token.part_of_speech ?? "");
  const surface = token.surface.replace(/\s+/g, "");

  if (source.includes("tro dong tu") || source.includes("aux")) {
    return "trợ động từ";
  }
  if (
    source.includes("dong tu") ||
    source.includes("verb") ||
    /^v\d|^vs|^vk|^vn|^aux-v/u.test(source)
  ) {
    return "động từ";
  }
  if (
    source.includes("danh tu") ||
    source.includes("noun") ||
    source.includes("n-suf")
  ) {
    return "danh từ";
  }
  if (source.includes("tinh tu") || source.includes("adjective")) {
    return "tính từ";
  }
  if (source.includes("pho tu") || source.includes("adverb")) {
    return "trạng từ";
  }
  if (source.includes("tro tu") || source.includes("particle")) {
    return "trợ từ";
  }
  if (source.includes("hau to") || source.includes("suffix")) {
    return "hậu tố";
  }
  if (source.includes("ky hieu") || source.includes("symbol")) {
    return "ký hiệu";
  }
  if (isParticle(surface)) {
    return "trợ từ";
  }
  if (isVerbLike(surface)) {
    return "động từ";
  }
  return "từ";
}

function resolvePosGroup(
  token: ExampleToken,
): NonNullable<ExampleToken["pos_group"]> {
  if (token.pos_group) {
    return token.pos_group;
  }

  const label = normalize(resolvePosLabel(token));
  if (label.includes("danh tu") || label.includes("noun")) return "noun";
  if (label.includes("dong tu") || label.includes("verb")) return "verb";
  if (
    label.includes("tinh tu") ||
    label.includes("trang tu") ||
    label.includes("pho tu")
  ) {
    return "modifier";
  }
  if (
    label.includes("tro tu") ||
    label.includes("lien tu") ||
    label.includes("lien the")
  ) {
    return "particle";
  }
  if (label.includes("hau to") || label.includes("suffix")) return "suffix";
  if (
    label.includes("tro dong tu") ||
    label.includes("tien to") ||
    label.includes("he tu")
  ) {
    return "auxiliary";
  }
  if (label.includes("ky hieu") || label.includes("symbol")) return "symbol";
  return "other";
}

function posToneClass(group: NonNullable<ExampleToken["pos_group"]>) {
  switch (group) {
    case "noun":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "verb":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "modifier":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "particle":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "suffix":
      return "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800";
    case "auxiliary":
      return "border-teal-200 bg-teal-50 text-teal-800";
    case "symbol":
      return "border-outline-variant bg-surface-container-low text-muted-foreground";
    default:
      return "border-primary/20 bg-white text-primary";
  }
}

function activeTokenClass(group: NonNullable<ExampleToken["pos_group"]>) {
  switch (group) {
    case "noun":
      return "border-sky-300 bg-sky-100 text-sky-900";
    case "verb":
      return "border-rose-300 bg-rose-100 text-rose-900";
    case "modifier":
      return "border-amber-300 bg-amber-100 text-amber-900";
    case "particle":
      return "border-violet-300 bg-violet-100 text-violet-900";
    case "suffix":
      return "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-900";
    case "auxiliary":
      return "border-teal-300 bg-teal-100 text-teal-900";
    default:
      return "border-primary/20 bg-primary/10 text-primary";
  }
}

function isInteractiveToken(token: ExampleToken) {
  if (token.kind === "space" || token.kind === "punctuation") {
    return false;
  }

  return Boolean(
    token.part_of_speech ||
    token.pos_label ||
    token.meaning_vi ||
    token.basic_form ||
    token.reading,
  );
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

    const text = sentence.slice(token.start, token.end);
    if (!isInteractiveToken(token)) {
      segments.push({
        id: `plain-token-${token.id || index}`,
        text,
      });
      cursor = Math.max(cursor, token.end);
      return;
    }

    const posGroup = resolvePosGroup(token);
    segments.push({
      id: token.id || `token-${index}`,
      text,
      token,
      posLabel: resolvePosLabel(token),
      posGroup,
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

function tokenSummary(token: ExampleToken) {
  const detailLabel = token.pos_detail_label;
  const details = [
    token.basic_form && token.basic_form !== token.surface
      ? `Gốc: ${token.basic_form}`
      : null,
    token.reading ? `Đọc: ${token.reading}` : null,
    detailLabel ? `Chi tiết: ${detailLabel}` : null,
    token.meaning_vi ? `Nghĩa: ${token.meaning_vi}` : null,
  ].filter(Boolean);

  return details.join(" · ");
}

function renderTokenText(token: ExampleToken, text: string) {
  const reading = token.reading?.trim();
  if (!reading || reading === text) {
    return text;
  }

  return (
    <ruby>
      {text}
      <rt className="text-[10px] text-muted-foreground">{reading}</rt>
    </ruby>
  );
}

export default function ExampleSentence({
  sentence,
  meaningVi,
  tokens = [],
  className,
}: ExampleSentenceProps) {
  const [activeTokenId, setActiveTokenId] = useState<number | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  const japaneseSegments = useMemo(
    () => buildJapaneseSegments(sentence, tokens),
    [sentence, tokens],
  );

  const selectedToken = useMemo(
    () => tokens.find((token) => token.id === selectedTokenId),
    [selectedTokenId, tokens],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex flex-wrap items-start gap-x-1 gap-y-2 text-lg leading-8 text-on-surface">
        {japaneseSegments.map((segment) => {
          if (!segment.token) {
            return (
              <span key={String(segment.id)} className="whitespace-pre-wrap">
                {segment.text}
              </span>
            );
          }

          const isActive = activeTokenId === segment.token.id;
          const posGroup = segment.posGroup ?? resolvePosGroup(segment.token);

          return (
            <span key={String(segment.id)} className="relative inline-flex">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  setSelectedTokenId((current) =>
                    current === segment.token?.id
                      ? null
                      : (segment.token?.id ?? null),
                  );
                }}
                onFocus={() => setActiveTokenId(segment.token?.id ?? null)}
                onBlur={() => setActiveTokenId(null)}
                onMouseEnter={() => setActiveTokenId(segment.token?.id ?? null)}
                onMouseLeave={() => setActiveTokenId(null)}
                className={cn(
                  "rounded-md border px-1 py-0.5 text-left transition-colors",
                  isActive
                    ? activeTokenClass(posGroup)
                    : "border-transparent hover:border-outline-variant hover:bg-surface-container-low",
                  posGroup === "verb" && "font-semibold",
                )}
              >
                {renderTokenText(segment.token, segment.text)}
              </button>

              {isActive && segment.posLabel && (
                <span
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium shadow-soft",
                    posToneClass(posGroup),
                  )}
                >
                  {segment.posLabel}
                </span>
              )}
            </span>
          );
        })}
      </p>

      {selectedToken && (
        <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface shadow-soft">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold">{selectedToken.surface}</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                posToneClass(resolvePosGroup(selectedToken)),
              )}
            >
              {resolvePosLabel(selectedToken)}
            </span>
          </div>
          {tokenSummary(selectedToken) && (
            <p className="mt-1 text-muted-foreground">
              {tokenSummary(selectedToken)}
            </p>
          )}
        </div>
      )}

      {meaningVi.trim() && (
        <p className="flex flex-wrap gap-x-1 gap-y-1 text-sm leading-6 text-muted-foreground">
          <span className="whitespace-pre-wrap">{meaningVi}</span>
        </p>
      )}
    </div>
  );
}
