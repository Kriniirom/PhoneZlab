import { getProducts } from "@/features/product/api";
import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export async function FeaturedProducts() {
  let products: ShopifyProduct[] = [];
  let error = false;

  try {
    products = await getProducts(4);
  } catch (e) {
    console.error("Failed to fetch products:", e);
    error = true;
  }

  if (error) {
    return (
      <section className="bg-white shadow-sm mt-4 mx-4 rounded-sm p-8 text-center text-gray-500">
        <p>Failed to load product recommendations. Please try again later.</p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-white shadow-sm mt-4 mx-4 rounded-sm p-8 text-center text-gray-500">
        <p>No product recommendations available at this time.</p>
      </section>
    );
  }

  return (
    <section className="bg-white shadow-sm mt-4 mx-4 rounded-sm p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-red-500 w-6 h-6" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Product Recommendations</h2>
        </div>
        <Link href="/products" className="text-[#2874f0] font-bold text-sm hover:underline shrink-0">
          View All Deals
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
