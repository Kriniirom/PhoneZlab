/**
 * Why this file exists:
 * Defines GraphQL queries for Collections.
 * Belongs to the GraphQL infrastructure layer.
 */

// Import reuseable product metadata and variant query snippets to compile GraphQL query compositions.
import { productSnippet, variantSnippet } from '../fragments/product';

// GraphQL query to read a paginated list of product collections.
// Returns core identifiers, SEO tags, and updated timestamps for menu lists.
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

// GraphQL query to fetch collection properties and its related product items by collection slug handle.
// Unpacks product details using fragments to match unified listing specifications.
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
