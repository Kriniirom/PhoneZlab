/**
 * Why this file exists:
 * This file creates the Shopify Storefront API client using the official @shopify/storefront-api-client.
 * It connects to Shopify to execute queries and mutations securely.
 * It belongs to the infrastructure layer (lib).
 */

// Import storefront API client creator from Shopify client library.
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
// Import connection settings (domain, api version, and public token) loaded from environment config.
import { SHOPIFY_CONFIG } from './config';

// Use fallbacks if env vars are missing to prevent crash on module load. 
// Network requests will fail, but our api.ts catches errors and returns mock data.
// Initializes the client interface using custom Shopify config params or simulated sandbox defaults.
export const storefrontClient = createStorefrontApiClient({
  storeDomain: SHOPIFY_CONFIG.domain || "https://mock-shop.myshopify.com",
  apiVersion: SHOPIFY_CONFIG.apiVersion || "2024-01",
  publicAccessToken: SHOPIFY_CONFIG.storefrontToken || "mock-token",
});
