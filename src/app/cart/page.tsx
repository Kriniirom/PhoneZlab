import { cookies } from "next/headers";
import { getCart } from "@/features/cart/api";
import { CartClient } from "@/components/CartClient";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/utils/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Shopping Cart",
  description: "View the items in your shopping cart and check out securely.",
  canonicalPath: "/cart",
  noIndex: true,
});

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartId = cookieStore.get("shopify_cart_id")?.value || null;

  let cart = null;
  if (cartId) {
    try {
      cart = await getCart(cartId);
    } catch (e) {
      console.error("Failed to fetch cart on page load:", e);
    }
  }

  return (
    <CartClient initialCart={cart} />
  );
}
