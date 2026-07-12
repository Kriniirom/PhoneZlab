"use server";

import { searchProducts } from "./api";

export async function searchProductsAction(query: string, first: number = 6) {
  try {
    const products = await searchProducts(query, first);
    return { success: true, products };
  } catch (error) {
    console.error("Error executing product search action:", error);
    return { success: false, error: String(error) };
  }
}
