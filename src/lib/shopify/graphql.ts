/**
 * Why this file exists:
 * This file serves as the main entry point for executing Shopify GraphQL operations.
 * It provides a wrapper around the storefrontClient to handle request formatting and error throwing securely.
 * It belongs to the infrastructure layer (lib).
 */

// Import the storefrontClient from our client setup which handles authenticated Shopify requests.
import { storefrontClient } from './client';

export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ status: number; body: T }> {
  try {
    // Execute query using the storefront client with optional parameters/variables.
    const response = await storefrontClient.request(query, { variables });
    
    // Check for GraphQL errors returned in the response payload.
    // Shopify returns 200 OK even when queries fail, so we must manually parse and throw on the errors array.
    const errors = response.errors as any[] | undefined;
    if (errors && errors.length > 0) {
      console.error('Shopify GraphQL Errors:', JSON.stringify(errors, null, 2));
      throw new Error(`Shopify GraphQL error: ${errors[0].message}`);
    }

    // Verify presence of return data to prevent undefined accesses downstream.
    if (!response.data) {
      throw new Error('Shopify GraphQL error: No data returned from the request');
    }

    return {
      status: 200,
      body: response.data as T,
    };
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    throw error;
  }
}
