/**
 * Why this file exists:
 * Defines GraphQL queries for the Cart.
 * Belongs to the GraphQL infrastructure layer.
 */

// Import the reusable cart fields fragment.
import { cartSnippet } from '../fragments/cart';

// GraphQL query to retrieve cart state details using the cart ID key.
// Unpacks lines, pricing sums, checkout URLs, and dynamic discount structures using the snippet.
export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartSnippet
    }
  }
  ${cartSnippet}
`;
