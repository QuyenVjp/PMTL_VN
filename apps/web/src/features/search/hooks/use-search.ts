"use client";

import { startTransition, useDeferredValue, useEffect, useState } from "react";

import type { SearchResultItem } from "@pmtl/shared";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { searchContent } from "../api/search-content";

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const debouncedQuery = useDebouncedValue(deferredQuery, 250);

  useEffect(() => {
    let isActive = true;

    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    const nextResults = searchContent(debouncedQuery);

    if (isActive) {
      startTransition(() => {
        setResults(nextResults);
      });
      setIsLoading(false);
    }

    return () => {
      isActive = false;
    };
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    isLoading,
  };
}
