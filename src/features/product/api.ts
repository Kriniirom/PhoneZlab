/**
 * Why this file exists:
 * Exposes reusable, typed API functions for the Product feature.
 * Connects the product UI layer with the Shopify GraphQL layer.
 * Belongs to the feature/product layer.
 */

import { shopifyFetch } from '@/lib/shopify/graphql';
import { getProductsQuery, getProductByHandleQuery, searchProductsQuery } from '@/graphql/queries/product';
import type { ShopifyProduct } from '@/types/shopify';

// Fetches product records by forward-passing sorting parameters directly to Shopify's products endpoint.
export async function getProducts(first: number = 10, sortKey?: string, reverse?: boolean): Promise<ShopifyProduct[]> {
  const res = await shopifyFetch<{ products: { edges: { node: ShopifyProduct }[] } }>({
    query: getProductsQuery,
    // Pass sortKey (e.g. "PRICE", "CREATED_AT") and reverse flag directly as GraphQL variables
    variables: { first, sortKey, reverse },
  });
  return res.body.products.edges.map(edge => edge.node);
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const res = await shopifyFetch<{ product: ShopifyProduct | null }>({
    query: getProductByHandleQuery,
    variables: { handle },
  });
  return res.body.product;
}

export async function searchProducts(query: string, first: number = 10): Promise<ShopifyProduct[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const words = cleanQuery.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  // Build a structured search query for Shopify Storefront API.
  // Each word is formatted with a wildcard to match title, tags, type, or vendor.
  const shopifySearchQuery = words
    .map(word => {
      const escapedWord = word.replace(/[:"()]/g, '');
      return `(title:${escapedWord}* OR tag:${escapedWord}* OR product_type:${escapedWord}* OR vendor:${escapedWord}*)`;
    })
    .join(' AND ');

  // Fetch a larger candidate pool to ensure we have enough matches for relevance sorting.
  const candidateLimit = Math.min(Math.max(first * 3, 12), 24);

  const res = await shopifyFetch<{ search: { edges: { node: ShopifyProduct }[] } }>({
    query: searchProductsQuery,
    variables: { query: shopifySearchQuery, first: candidateLimit },
  });

  const products = res.body.search.edges.map(edge => edge.node);

  const queryLower = cleanQuery.toLowerCase();

  // Score each product based on relevance
  const scored = products.map((product, index) => {
    let score = 0;
    const title = product.title.toLowerCase();

    // 1. Exact title match
    if (title === queryLower) {
      score += 1000;
    }

    // 2. Title starts with query
    if (title.startsWith(queryLower)) {
      score += 500;
    }

    // 3. Title contains query
    if (title.includes(queryLower)) {
      score += 100;
    }

    // Individual word matches in title
    words.forEach(word => {
      const wordLower = word.toLowerCase();
      if (title.includes(wordLower)) {
        score += 20 * (wordLower.length / queryLower.length);
      }
    });

    // 4. Product type matches
    if (product.productType) {
      const productType = product.productType.toLowerCase();
      if (productType === queryLower) {
        score += 50;
      } else if (productType.includes(queryLower)) {
        score += 10;
      }
    }

    // 5. Tags match
    if (product.tags && Array.isArray(product.tags)) {
      const matchesTag = product.tags.some(tag => tag.toLowerCase() === queryLower);
      const containsTag = product.tags.some(tag => tag.toLowerCase().includes(queryLower));
      if (matchesTag) {
        score += 40;
      } else if (containsTag) {
        score += 10;
      }
    }

    // 6. Handle matches
    if (product.handle) {
      const handle = product.handle.toLowerCase();
      if (handle === queryLower) {
        score += 30;
      } else if (handle.includes(queryLower)) {
        score += 5;
      }
    }

    // 7. Vendor matches
    if (product.vendor) {
      const vendor = product.vendor.toLowerCase();
      if (vendor === queryLower) {
        score += 10;
      } else if (vendor.includes(queryLower)) {
        score += 5;
      }
    }

    return { product, score, originalIndex: index };
  });

  // Sort by calculated search relevance score descending.
  // If the calculated scores are identical, falls back to sorting by the original index
  // returned from Shopify to preserve the default search precedence.
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.originalIndex - b.originalIndex;
  });

  // Return only the top 'first' ranked products matching the sliced list.
  return scored.slice(0, first).map(item => item.product);
}

