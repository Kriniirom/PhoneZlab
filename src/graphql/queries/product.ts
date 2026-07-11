/**
 * Why this file exists:
 * Defines GraphQL queries for Products.
 * Belongs to the GraphQL infrastructure layer.
 */

import { productSnippet, variantSnippet } from '../fragments/product';

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
