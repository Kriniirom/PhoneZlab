import { getProducts } from "@/features/product/api";
import { ProductCard } from "@/components/ProductCard";
import type { Metadata } from "next";
import type { ShopifyProduct } from "@/types/shopify";
import { generatePageMetadata, getBreadcrumbSchema } from "@/utils/seo";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = generatePageMetadata({
  title: "All Products",
  description: "Browse all premium luxury accessories.",
  canonicalPath: "/products",
});

export default async function ProductsPage() {
  let products: ShopifyProduct[] = [];
  let error = false;

  try {
    products = await getProducts(50);
  } catch (e) {
    console.error("Failed to fetch products:", e);
    error = true;
  }

  if (error) {
    return (
      <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto text-center text-gray-500">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Error Loading Products</h1>
        <p>We are having trouble loading our products right now. Please try again later.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto text-center text-gray-500">
        <h1 className="text-3xl font-bold tracking-tight mb-4">No Products Found</h1>
        <p>No products are currently available in the store catalog.</p>
      </div>
    );
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Products", item: "/products" }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">All Products</h1>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            The complete PhoneZlab collection. Uncompromising quality for every device.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
