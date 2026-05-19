"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, PencilLine, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Word } from "@/lib/types";
import { useClickOutside } from "@/hooks/useClickOutside";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  suggestions?: Word[] | undefined;
  suggestionsLoading?: boolean;
  handwritingOpen?: boolean;
  onHandwritingToggle?: () => void;
  onSuggestionSelect?: (word: Word) => void;
  onQueryChange?: (query: string) => void;
}

export default function SearchBar({
  onSearch,
  initialValue = "",
  placeholder = "Search Japanese words...",
  suggestions,
  suggestionsLoading = false,
  handwritingOpen = false,
  onHandwritingToggle,
  onSuggestionSelect,
  onQueryChange,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [locallyClosed, setLocallyClosed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const close = useCallback(() => {
    setLocallyClosed(true);
  }, []);

  useClickOutside(dropdownRef, close);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    onQueryChange?.("");
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setHighlightedIndex(-1);
    setLocallyClosed(false);
    onQueryChange?.(value);
  };

  const handleSuggestionClick = (word: Word) => {
    onSuggestionSelect?.(word);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const list = suggestions || [];

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < list.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case "Enter":
        if (highlightedIndex >= 0 && list[highlightedIndex]) {
          event.preventDefault();
          onSuggestionSelect?.(list[highlightedIndex]);
        }
        break;
      case "Escape":
        close();
        break;
    }
  };

  const showDropdown =
    query.trim().length > 0 && suggestions !== undefined && !locallyClosed;

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-input bg-background py-4 pl-12 pr-24 text-lg shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 rounded-full"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {onHandwritingToggle && (
            <Button
              type="button"
              variant={handwritingOpen ? "default" : "ghost"}
              size="icon"
              onClick={onHandwritingToggle}
              className="h-8 w-8 rounded-full"
              aria-label="Mở viết tay"
              aria-pressed={handwritingOpen}
            >
              <PencilLine className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full z-40 mt-1 max-h-80 overflow-hidden overflow-y-auto rounded-xl border border-outline-variant bg-white shadow-soft"
          >
            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                Không tìm thấy kết quả
              </div>
            ) : (
              suggestions.map((word, index) => (
                <button
                  key={word.id}
                  ref={index === highlightedIndex ? highlightedRef : undefined}
                  type="button"
                  onClick={() => handleSuggestionClick(word)}
                  className={`flex w-full cursor-pointer items-center gap-3 border-b border-outline-variant px-4 py-2.5 text-left transition-colors last:border-b-0 ${
                    index === highlightedIndex ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <span className="shrink-0 font-semibold text-on-surface">
                    {word.kanji}
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {word.kana}
                  </span>
                  <span className="ml-auto truncate text-sm text-on-surface">
                    {word.meaning_vi}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </form>
  );
}
