"use client";

import { useEffect } from "react";
import { trackRecentSearch } from "./recentSearches";

interface SearchTrackerProps {
  query: string;
}

export function SearchTracker({ query }: SearchTrackerProps) {
  useEffect(() => {
    if (query) {
      const trimmed = query.trim();
      if (trimmed) {
        trackRecentSearch(trimmed);
      }
    }
  }, [query]);

  return null;
}
