/**
 * Why this file exists:
 * Defines GraphQL queries for Products.
 * Belongs to the GraphQL infrastructure layer.
 */

// Import reusable product fields and variant properties fragments.
import { productSnippet, variantSnippet } from '../fragments/product';

// GraphQL query to retrieve products. Supporting sorting (sortKey, reverse direction) 
// and filter search terms (query) for catalog and search operations.
export const getProductsQuery = /* GraphQL */ `
  query getProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          ...ProductSnippet
          images(first: 2) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                ...VariantSnippet
              }
            }
          }
        }
      }
    }
  }
  ${productSnippet}
  ${variantSnippet}
`;

// GraphQL query to read a single product detail sheet using its slug handle.
// Queries up to 10 images and 100 variants to cover sizing/color configurations.
export const getProductByHandleQuery = /* GraphQL */ `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductSnippet
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            ...VariantSnippet
          }
        }
      }
    }
  }
  ${productSnippet}
  ${variantSnippet}
`;

// GraphQL query targeting Shopify's store search index.
// Executes keyword search matching against vendor, type, title, or tag names.
export const searchProductsQuery = /* GraphQL */ `
  query searchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      edges {
        node {
          ... on Product {
            ...ProductSnippet
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  ...VariantSnippet
                }
              }
            }
          }
        }
      }
    }
  }
  ${productSnippet}
  ${variantSnippet}
`;
