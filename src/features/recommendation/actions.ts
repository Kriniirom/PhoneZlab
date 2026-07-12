"use server";

import { searchProducts, getProducts } from "@/features/product/api";
import { rankRecommendations } from "./scoring";
import type { ShopifyProduct } from "@/types/shopify";
import type { RecentlyViewedProduct } from "@/features/search/tracking/recentlyViewed";

export interface GetPersonalizedRecommendationsParams {
  recentSearches: string[];
  recentlyViewed: RecentlyViewedProduct[];
  currentProductId?: string | null;
  limit?: number;
}

export async function getPersonalizedRecommendationsAction({
  recentSearches = [],
  recentlyViewed = [],
  currentProductId = null,
  limit = 4,
}: GetPersonalizedRecommendationsParams): Promise<ShopifyProduct[]> {
  try {
    let candidatePool: ShopifyProduct[] = [];
    const keywordsSet = new Set<string>();

    // 1. Gather keywords from recent searches
    recentSearches.forEach((search) => {
      if (!search) return;
      const clean = search.trim();
      if (clean) keywordsSet.add(clean);
    });

    // 2. Gather tags/product types from recently viewed items
    recentlyViewed.forEach((viewed) => {
      if (viewed.productType) {
        keywordsSet.add(viewed.productType.trim());
      }
      if (Array.isArray(viewed.tags)) {
        viewed.tags.forEach((tag) => {
          if (tag) keywordsSet.add(tag.trim());
        });
      }
    });

    const keywords = Array.from(keywordsSet).filter(Boolean);

    // 3. Fetch candidates based on keywords
    if (keywords.length > 0) {
      // Build a safe query string using logical operators (OR)
      // E.g. "iphone OR case OR magsafe"
      const safeQuery = keywords
        .map((k) => k.replace(/[^a-zA-Z0-9\s-]/g, "")) // sanitize input
        .filter(Boolean)
        .join(" OR ");

      if (safeQuery) {
        try {
          // Fetch up to 24 relevant candidates from Shopify
          candidatePool = await searchProducts(safeQuery, 24);
        } catch (searchError) {
          console.error("Shopify search failed for recommendations:", searchError);
        }
      }
    }

    // 4. Fallback Strategy: Fetch fallback products to ensure we have enough items
    let fallbackProducts: ShopifyProduct[] = [];
    try {
      fallbackProducts = await getProducts(20);
    } catch (fallbackError) {
      console.error("Shopify fallback fetch failed:", fallbackError);
    }

    // Combine candidate pool and fallback products
    const combinedCandidates = [...candidatePool, ...fallbackProducts];

    // 5. Rank combined candidate pool using the existing algorithm
    const rankedCandidates = rankRecommendations({
      candidateProducts: combinedCandidates,
      recentSearches,
      recentlyViewed,
      currentProductId,
    });

    // Limit to the requested number
    return rankedCandidates.slice(0, limit);
  } catch (err) {
    console.error("Failed to generate personalized recommendations:", err);
    // Return empty list or fallback to empty array safely to prevent page crash
    return [];
  }
}
