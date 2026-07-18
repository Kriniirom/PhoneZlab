"use client";

// Import standard Shopify product type schema.
import type { ShopifyProduct } from "@/types/shopify";

// Key utilized to fetch/save browsed history JSON array in localStorage.
const LOCAL_STORAGE_KEY = "phonezlab_recently_viewed";

export interface RecentlyViewedProduct {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  vendor: string;
  viewedAt: string;
}

// Records a product interaction inside client-side localStorage.
// Ensures that browsing activities are saved for recommending related options.
export function trackRecentlyViewed(product: ShopifyProduct): void {
  // Safe-guard to prevent execution on Next.js server-side render environments where window/localStorage are absent.
  if (typeof window === "undefined" || !product || !product.id) return;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: RecentlyViewedProduct[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate that parsed storage structure matches expected array of recently viewed objects.
        if (Array.isArray(parsed)) {
          list = parsed.filter(
            (item): item is RecentlyViewedProduct => 
              typeof item === "object" && 
              item !== null && 
              typeof item.id === "string" &&
              typeof item.handle === "string" &&
              typeof item.title === "string"
          );
        }
      } catch (e) {
        console.warn("Parsing recently viewed history failed. Resetting history.", e);
      }
    }

    // Map necessary ShopifyProduct metadata fields needed for scoring recommendation intersections.
    const viewedProduct: RecentlyViewedProduct = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      productType: product.productType || "",
      tags: product.tags || [],
      vendor: product.vendor || "",
      viewedAt: new Date().toISOString(),
    };

    // Remove duplicates safely (based on ID) to prevent double entry in list.
    list = list.filter((item) => item.id !== product.id);

    // Add new viewed item at the top of the list (index 0).
    list.unshift(viewedProduct);

    // Limit tracking size list to latest 20 unique products to keep localStorage payload light.
    list = list.slice(0, 20);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // Fail-safe: fail silently to prevent product page crashes on browser cookies/storage permissions blocks.
    console.error("Failed to write to recently viewed products:", err);
  }
}
