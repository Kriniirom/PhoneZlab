// Import Shopify Product type definitions.
import type { ShopifyProduct } from "@/types/shopify";
// Import search tracking types for previously viewed items.
import type { RecentlyViewedProduct } from "@/features/search/tracking/recentlyViewed";

// Interface defining arguments passed to the recommendation ranking engine.
export interface RankRecommendationsParams {
  candidateProducts: ShopifyProduct[]; // Pool of candidate items fetched from Shopify
  recentSearches: string[];            // List of raw text strings searched by the user recently
  recentlyViewed: RecentlyViewedProduct[]; // Chronological list of items browsed by user
  currentProductId?: string | null;    // Active product ID (to exclude from recommendations)
}

export interface ScoredProduct {
  product: ShopifyProduct;
  score: number;
  reasons: string[];
}

export function rankRecommendations({
  candidateProducts,
  recentSearches = [],
  recentlyViewed = [],
  currentProductId = null,
}: RankRecommendationsParams): ShopifyProduct[] {
  if (!Array.isArray(candidateProducts)) return [];

  const seenIds = new Set<string>();
  const scored: ScoredProduct[] = [];

  for (const product of candidateProducts) {
    // Exclude null/undefined entries
    if (!product || !product.id) continue;

    // Exclude duplicate products
    if (seenIds.has(product.id)) continue;
    seenIds.add(product.id);

    // Exclude current product being viewed
    if (currentProductId && product.id === currentProductId) continue;

    // Exclude unavailable products if availability data exists
    const isAvailable = product.variants?.edges?.some((edge) => edge?.node?.availableForSale !== false) ?? true;
    if (!isAvailable) continue;

    let score = 0;
    const reasons: string[] = [];

    // 1. Product title strongly matches a recent search (+10)
    recentSearches.forEach((searchQuery, idx) => {
      if (!searchQuery) return;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      if (!normalizedQuery) return;

      const productTitleLower = product.title.toLowerCase();
      if (productTitleLower.includes(normalizedQuery)) {
        // Newer user activity gets more weight
        const recencyWeight = Math.max(0.1, 1.0 - idx * 0.1);
        const points = 10 * recencyWeight;
        score += points;
        reasons.push(`Title match with "${searchQuery}" (+${points.toFixed(1)})`);
      }
    });

    // 2. Product tags match recent search terms (+8)
    recentSearches.forEach((searchQuery, idx) => {
      if (!searchQuery) return;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      if (!normalizedQuery) return;

      const productTags = product.tags || [];
      const hasTagMatch = productTags.some((tag) => tag.toLowerCase() === normalizedQuery);
      if (hasTagMatch) {
        const recencyWeight = Math.max(0.1, 1.0 - idx * 0.1);
        const points = 8 * recencyWeight;
        score += points;
        reasons.push(`Tag match with search "${searchQuery}" (+${points.toFixed(1)})`);
      }
    });

    // 3. Same product type as recently viewed products (+7)
    if (product.productType) {
      const normalizedType = product.productType.trim().toLowerCase();
      recentlyViewed.forEach((viewed, idx) => {
        if (viewed.productType && viewed.productType.trim().toLowerCase() === normalizedType) {
          const recencyWeight = Math.max(0.1, 1.0 - idx * 0.05);
          const points = 7 * recencyWeight;
          score += points;
          reasons.push(`Matches productType "${viewed.productType}" of viewed "${viewed.title}" (+${points.toFixed(1)})`);
        }
      });
    }

    // 4. Matching tags with recently viewed products (+6)
    const productTags = product.tags || [];
    if (productTags.length > 0) {
      recentlyViewed.forEach((viewed, idx) => {
        const viewedTags = viewed.tags || [];
        const intersection = productTags.filter((tag) =>
          viewedTags.some((vTag) => vTag.toLowerCase() === tag.toLowerCase())
        );

        if (intersection.length > 0) {
          const recencyWeight = Math.max(0.1, 1.0 - idx * 0.05);
          const points = 6 * recencyWeight * intersection.length;
          score += points;
          reasons.push(`Matches tags [${intersection.join(", ")}] of viewed "${viewed.title}" (+${points.toFixed(1)})`);
        }
      });
    }

    // 5. Same vendor/brand as recently viewed products (+4)
    if (product.vendor) {
      const normalizedVendor = product.vendor.trim().toLowerCase();
      recentlyViewed.forEach((viewed, idx) => {
        if (viewed.vendor && viewed.vendor.trim().toLowerCase() === normalizedVendor) {
          const recencyWeight = Math.max(0.1, 1.0 - idx * 0.05);
          const points = 4 * recencyWeight;
          score += points;
          reasons.push(`Matches vendor "${viewed.vendor}" of viewed "${viewed.title}" (+${points.toFixed(1)})`);
        }
      });
    }

    // Development environment debug logging
    if (process.env.NODE_ENV !== "production" && score > 0) {
      console.log(`[Recommendation Engine] Product: "${product.title}" - Score: ${score.toFixed(2)} - Reasons:`, reasons);
    }

    scored.push({
      product,
      score,
      reasons,
    });
  }

  // Sort products based on computed recommendation score in descending order (highest score first).
  // This ranks the most relevant matches (based on recent searches and viewed items) at the top of the list.
  scored.sort((a, b) => b.score - a.score);

  // Return the raw ShopifyProduct records extracted from the sorted wrapper objects.
  return scored.map((item) => item.product);
}
