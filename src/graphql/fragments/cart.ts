/**
 * Why this file exists:
 * Contains reusable GraphQL fragments for the Cart.
 * Belongs to the GraphQL infrastructure layer.
 */

// Import the variantSnippet for displaying line item specifications inside cart nodes.
import { variantSnippet } from './product';

// Reusable GraphQL fragment defining Shopify's Cart properties returned in cart fetch operations.
// Maps checkout redirection links, quantities, costs, applied coupon validations, and cart product fields.
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
                tags
                offersMetafield: metafield(namespace: "custom", key: "offers") {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
  ${variantSnippet}
`;
