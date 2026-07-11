/**
 * Why this file exists:
 * Defines GraphQL queries for the Cart.
 * Belongs to the GraphQL infrastructure layer.
 */

import { cartSnippet } from '../fragments/cart';

export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartSnippet
    }
  }
  ${cartSnippet}
`;
