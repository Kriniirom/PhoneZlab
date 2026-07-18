/**
 * Why this file exists:
 * Defines GraphQL mutations for Cart operations.
 * Belongs to the GraphQL infrastructure layer.
 */

// Import the reusable cart fields fragment configuration.
import { cartSnippet } from '../fragments/cart';

// GraphQL mutation to initialize a new checkout cart instance in Shopify.
// Returns userErrors list if validation fails (e.g. out of stock products) or the populated cart.
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

// GraphQL mutation to append extra product variants to an existing customer cart.
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

// GraphQL mutation to delete specific line items from a customer cart by line IDs.
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

// GraphQL mutation to modify quantity counts or options for active items in the cart.
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

// GraphQL mutation to apply or delete promotional codes on the checkout subtotal.
export const updateCartDiscountCodesMutation = /* GraphQL */ `
  mutation updateCartDiscountCodes($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
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
