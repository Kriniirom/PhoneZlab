/**
 * Why this file exists:
 * Defines GraphQL mutations for Cart operations.
 * Belongs to the GraphQL infrastructure layer.
 */

import { cartSnippet } from '../fragments/cart';

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        ...CartSnippet
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartSnippet}
`;

export const addCartItemMutation = /* GraphQL */ `
  mutation addCartItem($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartSnippet
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartSnippet}
`;

export const removeCartItemMutation = /* GraphQL */ `
  mutation removeCartItem($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartSnippet
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartSnippet}
`;

export const updateCartMutation = /* GraphQL */ `
  mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartSnippet
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartSnippet}
`;
