import { getProductByHandle, getProducts } from "@/features/product/api";
import { ProductDetailsClient } from "@/components/ProductDetailsClient";
import type { Metadata } from "next";
import type { ShopifyProduct } from "@/types/shopify";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let product: ShopifyProduct | null = null;
  
  try {
    product = await getProductByHandle(resolvedParams.handle);
  } catch (e) {
    console.error("Error fetching product for metadata:", e);
  }

  if (!product) {
    return {
      title: "Product Not Found | PhoneZlab",
    };
  }

  return {
    title: `${product.title} | PhoneZlab`,
    description: product.seo.description || product.description || `Buy ${product.title} from PhoneZlab.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  let product: ShopifyProduct | null = null;
  let relatedProducts: ShopifyProduct[] = [];
  let error = false;

  try {
    product = await getProductByHandle(resolvedParams.handle);
    
    if (product) {
      // Load other products to show in the related products section
      const allProducts = await getProducts(10);
      relatedProducts = allProducts.filter((p) => p.id !== product?.id);
    }
  } catch (e) {
    console.error("Error loading product detail page:", e);
    error = true;
  }

  if (error || !product) {
    return (
      <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto text-center text-gray-500">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Product Not Found</h1>
        <p>The product you are looking for could not be found or failed to load. Please check the URL or try again later.</p>
        <a href="/products" className="mt-6 inline-block bg-[#2874f0] text-white px-6 py-2.5 rounded font-medium hover:bg-[#2874f0]/90 transition-colors">
          Browse All Products
        </a>
      </div>
    );
  }

  return (
    <ProductDetailsClient product={product} relatedProducts={relatedProducts} />
  );
}
