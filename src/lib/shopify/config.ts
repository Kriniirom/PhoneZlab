/**
 * Why this file exists:
 * This file centralizes the configuration settings for the Shopify Storefront API client.
 * It connects to Shopify by providing the domain and API versions required.
 * It belongs to the infrastructure layer (lib).
 */

export const SHOPIFY_CONFIG = {
  domain: process.env.SHOPIFY_STORE_DOMAIN || '',
  storefrontToken: process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN || '',
  apiVersion: '2024-04',
};
