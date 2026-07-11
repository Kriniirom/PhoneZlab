/**
 * Why this file exists:
 * Defines GraphQL queries for Collections.
 * Belongs to the GraphQL infrastructure layer.
 */

import { productSnippet, variantSnippet } from '../fragments/product';

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          seo {
            title
            description
          }
          updatedAt
        }
      }
    }
  }
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!, $productsFirst: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        title
        description
      }
      updatedAt
      products(first: $productsFirst) {
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
  }
  ${productSnippet}
  ${variantSnippet}
`;
