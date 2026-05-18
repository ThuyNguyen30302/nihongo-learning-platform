"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Word } from "@/lib/types";
import { useClickOutside } from "@/hooks/useClickOutside";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  suggestions?: Word[] | undefined;
  suggestionsLoading?: boolean;
  onSuggestionSelect?: (word: Word) => void;
  onQueryChange?: (query: string) => void;
}

export default function SearchBar({
  onSearch,
  initialValue = "",
  placeholder = "Search Japanese words...",
  suggestions,
  suggestionsLoading = false,
  onSuggestionSelect,
  onQueryChange,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [locallyClosed, setLocallyClosed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLButtonElement | null>(null);

  // Scroll highlighted item into view
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = suggestions || [];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < list.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case "Enter":
        if (highlightedIndex >= 0 && list[highlightedIndex]) {
          e.preventDefault();
          onSuggestionSelect?.(list[highlightedIndex]);
        }
        // else: let form handle submission
        break;
      case "Escape":
        close();
        break;
    }
  };

  const showDropdown =
    query.trim().length > 0 && suggestions !== undefined && !locallyClosed;

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-white w-full pl-12 pr-12 py-4 text-lg rounded-xl border-2 border-input
                     focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-colors
                     bg-background shadow-sm"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Autocomplete dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1 z-40
                       bg-white border border-outline-variant
                       rounded-xl shadow-soft overflow-hidden
                       max-h-80 overflow-y-auto"
          >
            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No results found
              </div>
            ) : (
              suggestions.map((word, index) => (
                <button
                  key={word.id}
                  ref={index === highlightedIndex ? highlightedRef : undefined}
                  type="button"
                  onClick={() => handleSuggestionClick(word)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5
                             text-left cursor-pointer
                             border-b border-outline-variant last:border-b-0
                             transition-colors
                             ${
                               index === highlightedIndex
                                 ? "bg-gray-100"
                                 : "hover:bg-gray-50"
                             }`}
                >
                  <span className="font-semibold text-on-surface shrink-0">
                    {word.kanji}
                  </span>
                  <span className="text-sm text-muted-foreground shrink-0">
                    {word.kana}
                  </span>
                  <span className="text-sm text-on-surface truncate ml-auto">
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
