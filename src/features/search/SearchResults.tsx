import { searchProducts } from "@/features/product/api";
import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";
import { SearchTracker } from "./tracking/SearchTracker";

export async function SearchResults({ query }: { query: string }) {
  let products: ShopifyProduct[] = [];
  let error = false;

  if (query) {
    try {
      products = await searchProducts(query, 20);
    } catch (e) {
      console.error("Search failed:", e);
      error = true;
    }
  }



  if (!query) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p>Please enter a search term to find products.</p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <SearchTracker query={query} />
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-medium">Search results for &quot;{query}&quot;</h2>
        <p className="text-gray-500 mt-2">{products.length} {products.length === 1 ? 'result' : 'results'} found</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <p>No products match your search.</p>
        </div>
      )}
    </section>
  );
}
