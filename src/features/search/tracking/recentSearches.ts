"use client";

const LOCAL_STORAGE_KEY = "phonezlab_recent_searches";

export function trackRecentSearch(searchTerm: string): void {
  if (typeof window === "undefined" || !searchTerm) return;

  const trimmed = searchTerm.trim();
  if (!trimmed) return;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let searches: string[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          searches = parsed.filter((item): item is string => typeof item === "string");
        }
      } catch (e) {
        console.warn("Parsing search history failed. Resetting history.", e);
      }
    }

    const normalizedLower = trimmed.toLowerCase();

    // Remove duplicates case-insensitively
    searches = searches.filter((term) => term.trim().toLowerCase() !== normalizedLower);

    // Add current search term to the top
    searches.unshift(trimmed);

    // Limit to latest 10 unique searches
    searches = searches.slice(0, 10);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(searches));
  } catch (err) {
    console.error("Failed to write to search history:", err);
  }
}
