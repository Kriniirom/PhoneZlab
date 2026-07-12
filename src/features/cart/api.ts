/**
 * Why this file exists:
 * Exposes reusable, typed API functions for the Cart feature.
 * Connects the cart UI layer with the Shopify GraphQL layer.
 * Belongs to the feature/cart layer.
 */

import { shopifyFetch } from '@/lib/shopify/graphql';
import { getCartQuery } from '@/graphql/queries/cart';
import { createCartMutation, addCartItemMutation, removeCartItemMutation, updateCartMutation, updateCartDiscountCodesMutation } from '@/graphql/mutations/cart';
import type { ShopifyCart } from '@/types/shopify';

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: getCartQuery,
    variables: { cartId },
  });
  return res.body.cart;
}

export async function createCart(lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartCreate: { cart: ShopifyCart | null } }>({
    query: createCartMutation,
    variables: { lineItems: lines },
  });
  return res.body.cartCreate.cart;
}

export async function addCartItem(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart | null } }>({
    query: addCartItemMutation,
    variables: { cartId, lines },
  });
  return res.body.cartLinesAdd.cart;
}

export async function removeCartItem(cartId: string, lineIds: string[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart | null } }>({
    query: removeCartItemMutation,
    variables: { cartId, lineIds },
  });
  return res.body.cartLinesRemove.cart;
}

export async function updateCart(cartId: string, lines: { id: string; merchandiseId: string; quantity: number }[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart | null } }>({
    query: updateCartMutation,
    variables: { cartId, lines },
  });
  return res.body.cartLinesUpdate.cart;
}

export async function updateCartDiscountCodes(cartId: string, discountCodes: string[]): Promise<ShopifyCart | null> {
  const res = await shopifyFetch<{ cartDiscountCodesUpdate: { cart: ShopifyCart | null } }>({
    query: updateCartDiscountCodesMutation,
    variables: { cartId, discountCodes },
  });
  return res.body.cartDiscountCodesUpdate.cart;
}
