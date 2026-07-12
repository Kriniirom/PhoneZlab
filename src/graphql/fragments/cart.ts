/**
 * Why this file exists:
 * Contains reusable GraphQL fragments for the Cart.
 * Belongs to the GraphQL infrastructure layer.
 */

import { variantSnippet } from './product';

export const cartSnippet = /* GraphQL */ `
  fragment CartSnippet on Cart {
    id
    checkoutUrl
    totalQuantity
    discountCodes {
      code
      applicable
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          discountAllocations {
            discountedAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              ...VariantSnippet
              product {
                id
                handle
                title
              }
            }
          }
        }
      }
    }
  }
  ${variantSnippet}
`;
