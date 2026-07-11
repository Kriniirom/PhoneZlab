/**
 * Why this file exists:
 * Exposes reusable, typed API functions for the Product feature.
 * Connects the product UI layer with the Shopify GraphQL layer.
 * Belongs to the feature/product layer.
 */

import { shopifyFetch } from '@/lib/shopify/graphql';
import { getProductsQuery, getProductByHandleQuery, searchProductsQuery } from '@/graphql/queries/product';
import type { ShopifyProduct } from '@/types/shopify';

export async function getProducts(first: number = 10, sortKey?: string, reverse?: boolean): Promise<ShopifyProduct[]> {
  const res = await shopifyFetch<{ products: { edges: { node: ShopifyProduct }[] } }>({
    query: getProductsQuery,
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
  const res = await shopifyFetch<{ search: { edges: { node: ShopifyProduct }[] } }>({
    query: searchProductsQuery,
    variables: { query, first },
  });
  return res.body.search.edges.map(edge => edge.node);
}
