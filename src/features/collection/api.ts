/**
 * Why this file exists:
 * Exposes reusable, typed API functions for the Collection feature.
 * Connects the collection UI layer with the Shopify GraphQL layer.
 * Belongs to the feature/collection layer.
 */

// Import the Shopify utility to execute Shopify Storefront GraphQL query requests.
import { shopifyFetch } from '@/lib/shopify/graphql';
// Import the query definitions for fetching lists of collections and detail fields for a single collection.
import { getCollectionsQuery, getCollectionQuery } from '@/graphql/queries/collection';
// Import TypeScript interfaces representing Shopify collection and product schemas.
import type { ShopifyCollection, ShopifyProduct } from '@/types/shopify';

// Retrieves a list of active collection schemas from Shopify for categorization.
export async function getCollections(first: number = 10): Promise<ShopifyCollection[]> {
  const res = await shopifyFetch<{ collections: { edges: { node: ShopifyCollection }[] } }>({
    query: getCollectionsQuery,
    variables: { first },
  });
  return res.body.collections.edges.map(edge => edge.node);
}

// Retrieves a specific collection's metadata and its nested page of products by slug handle.
// Unpacks the nested products edges from the GraphQL collection node into a flat array.
export async function getCollection(handle: string, productsFirst: number = 20): Promise<{ collection: ShopifyCollection | null; products: ShopifyProduct[] }> {
  const res = await shopifyFetch<{ collection: (ShopifyCollection & { products: { edges: { node: ShopifyProduct }[] } }) | null }>({
    query: getCollectionQuery,
    variables: { handle, productsFirst },
  });
  
  if (!res.body.collection) {
    return { collection: null, products: [] };
  }

  // Destructure the products property off the response and map the edges to flat ShopifyProduct nodes.
  const { products, ...collectionData } = res.body.collection;
  return {
    collection: collectionData,
    products: products.edges.map(edge => edge.node),
  };
}
