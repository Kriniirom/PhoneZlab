/**
 * Why this file exists:
 * Exposes reusable, typed API functions for the Collection feature.
 * Connects the collection UI layer with the Shopify GraphQL layer.
 * Belongs to the feature/collection layer.
 */

import { shopifyFetch } from '@/lib/shopify/graphql';
import { getCollectionsQuery, getCollectionQuery } from '@/graphql/queries/collection';
import type { ShopifyCollection, ShopifyProduct } from '@/types/shopify';

export async function getCollections(first: number = 10): Promise<ShopifyCollection[]> {
  const res = await shopifyFetch<{ collections: { edges: { node: ShopifyCollection }[] } }>({
    query: getCollectionsQuery,
    variables: { first },
  });
  return res.body.collections.edges.map(edge => edge.node);
}

export async function getCollection(handle: string, productsFirst: number = 20): Promise<{ collection: ShopifyCollection | null; products: ShopifyProduct[] }> {
  const res = await shopifyFetch<{ collection: (ShopifyCollection & { products: { edges: { node: ShopifyProduct }[] } }) | null }>({
    query: getCollectionQuery,
    variables: { handle, productsFirst },
  });
  
  if (!res.body.collection) {
    return { collection: null, products: [] };
  }

  const { products, ...collectionData } = res.body.collection;
  return {
    collection: collectionData,
    products: products.edges.map(edge => edge.node),
  };
}
