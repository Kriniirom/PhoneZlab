"use server";

import { createCart, addCartItem, getCart } from "./api";

export async function createCartAction(merchandiseId: string, quantity: number) {
  try {
    const cart = await createCart([{ merchandiseId, quantity }]);
    return { success: true, cart };
  } catch (error) {
    console.error("Error creating cart:", error);
    return { success: false, error: String(error) };
  }
}

export async function addCartItemAction(cartId: string, merchandiseId: string, quantity: number) {
  try {
    const cart = await addCartItem(cartId, [{ merchandiseId, quantity }]);
    return { success: true, cart };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: String(error) };
  }
}

export async function getCartAction(cartId: string) {
  try {
    const cart = await getCart(cartId);
    return { success: true, cart };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, error: String(error) };
  }
}

export async function removeCartItemAction(cartId: string, lineIds: string[]) {
  try {
    const { removeCartItem } = await import("./api");
    const cart = await removeCartItem(cartId, lineIds);
    return { success: true, cart };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateCartItemAction(cartId: string, lineId: string, merchandiseId: string, quantity: number) {
  try {
    const { updateCart } = await import("./api");
    const cart = await updateCart(cartId, [{ id: lineId, merchandiseId, quantity }]);
    return { success: true, cart };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateCartDiscountCodesAction(cartId: string, discountCodes: string[]) {
  try {
    const { updateCartDiscountCodes } = await import("./api");
    const cart = await updateCartDiscountCodes(cartId, discountCodes);
    return { success: true, cart };
  } catch (error) {
    console.error("Error updating cart discount codes:", error);
    return { success: false, error: String(error) };
  }
}
