import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";

interface CollectionProductsProps {
  products: ShopifyProduct[];
}

export function CollectionProducts({ products }: CollectionProductsProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>No products found in this collection.</p>
      </div>
    );
  }

  return (
    <section className="pb-32 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
