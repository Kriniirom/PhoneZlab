// Import Next.js cookies utility to access client-side cart identifier cookies on the server.
import { cookies } from "next/headers";
// Import the API call to read a cart by ID.
import { getCart } from "@/features/cart/api";
// Import the client-side component containing interactive cart UI, quantity counters, and checkout links.
import { CartClient } from "@/components/CartClient";
// Import next.js metadata types.
import type { Metadata } from "next";
// Import SEO utility for setting meta tags, canonical path, and index directions.
import { generatePageMetadata } from "@/utils/seo";

// Set page-level metadata. Cart is set to noIndex to avoid search indexation of empty cart paths.
export const metadata: Metadata = generatePageMetadata({
  title: "Shopping Cart",
  description: "View the items in your shopping cart and check out securely.",
  canonicalPath: "/cart",
  noIndex: true,
});

export default async function CartPage() {
  // Read the active session's cart cookie on the server.
  const cookieStore = await cookies();
  const cartId = cookieStore.get("shopify_cart_id")?.value || null;

  let cart = null;
  // If the user has a cart cookie stored, fetch the associated cart details from Shopify Storefront API.
  if (cartId) {
    try {
      cart = await getCart(cartId);
    } catch (e) {
      console.error("Failed to fetch cart on page load:", e);
    }
  }

  // Pass the initial server-fetched cart state to the dynamic client components.
  return (
    <CartClient initialCart={cart} />
  );
}
