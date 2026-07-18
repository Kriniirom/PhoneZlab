/**
 * Why this file exists:
 * Exposes reusable, typed API functions for the Cart feature.
 * Connects the cart UI layer with the Shopify GraphQL layer.
 * Belongs to the feature/cart layer.
 */

// Import the general Shopify fetch utility that sends GraphQL queries and manages error formatting.
import { shopifyFetch } from '@/lib/shopify/graphql';
// Import the GraphQL query string for reading cart state.
import { getCartQuery } from '@/graphql/queries/cart';
// Import mutations for performing write operations (create, add, remove, update lines, update discounts).
import { createCartMutation, addCartItemMutation, removeCartItemMutation, updateCartMutation, updateCartDiscountCodesMutation } from '@/graphql/mutations/cart';
// Import typescript interface representing Shopify's storefront Cart object model.
import type { ShopifyCart } from '@/types/shopify';

// Retrieves a customer's cart state by its unique alphanumeric session ID.
export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: getCartQuery,
    variables: { cartId },
  });
  return res.body.cart;
}

// Spawns a new cart instance in Shopify prefilled with initial line items.
export async function createCart(lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartCreate: { cart: ShopifyCart | null } }>({
    query: createCartMutation,
    variables: { lineItems: lines },
  });
  return res.body.cartCreate.cart;
}

// Appends extra product variants/merchandise items to an existing cart list.
export async function addCartItem(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart | null } }>({
    query: addCartItemMutation,
    variables: { cartId, lines },
  });
  return res.body.cartLinesAdd.cart;
}

// Deletes specific item line sequences from the cart using their line IDs.
export async function removeCartItem(cartId: string, lineIds: string[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart | null } }>({
    query: removeCartItemMutation,
    variables: { cartId, lineIds },
  });
  return res.body.cartLinesRemove.cart;
}

// Modifies quantity counters or changes the variant items of active line items inside the cart.
export async function updateCart(cartId: string, lines: { id: string; merchandiseId: string; quantity: number }[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart | null } }>({
    query: updateCartMutation,
    variables: { cartId, lines },
  });
  return res.body.cartLinesUpdate.cart;
}

// Updates the promotional/discount code array applied on the checkout subtotal.
export async function updateCartDiscountCodes(cartId: string, discountCodes: string[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartDiscountCodesUpdate: { cart: ShopifyCart | null } }>({
    query: updateCartDiscountCodesMutation,
    variables: { cartId, discountCodes },
  });
  return res.body.cartDiscountCodesUpdate.cart;
}
