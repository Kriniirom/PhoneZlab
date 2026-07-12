"use client";

import type { ShopifyProduct } from "@/types/shopify";

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

export function trackRecentlyViewed(product: ShopifyProduct): void {
  if (typeof window === "undefined" || !product || !product.id) return;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: RecentlyViewedProduct[] = [];

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
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

    const viewedProduct: RecentlyViewedProduct = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      productType: product.productType || "",
      tags: product.tags || [],
      vendor: product.vendor || "",
      viewedAt: new Date().toISOString(),
    };

    // Remove duplicates safely (based on ID)
    list = list.filter((item) => item.id !== product.id);

    // Add to the top of the list
    list.unshift(viewedProduct);

    // Limit to latest 20 unique products
    list = list.slice(0, 20);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // Fail-safe: fail silently to prevent product page crashes
    console.error("Failed to write to recently viewed products:", err);
  }
}
