import { getProductByHandle, getProducts } from "@/features/product/api";
import { ProductDetailsClient } from "@/components/ProductDetailsClient";
import type { Metadata } from "next";
import type { ShopifyProduct } from "@/types/shopify";
import { generatePageMetadata, getProductSchema, getBreadcrumbSchema } from "@/utils/seo";
import { getProductReviews } from "@/features/reviews/api";
import { StructuredData } from "@/components/StructuredData";

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

  return generatePageMetadata({
    title: product.seo.title || product.title,
    description: product.seo.description || product.description || `Buy ${product.title} from PhoneZlab.`,
    canonicalPath: `/products/${product.handle}`,
    imageUrl: product.featuredImage?.url || undefined,
    imageAlt: product.featuredImage?.altText || product.title,
    ogType: 'website',
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  let product: ShopifyProduct | null = null;
  let relatedProducts: ShopifyProduct[] = [];
  let reviewsData = undefined;
  let error = false;

  try {
    product = await getProductByHandle(resolvedParams.handle);
    
    if (product) {
      // Load other products to show in the related products section
      const allProducts = await getProducts(10);
      relatedProducts = allProducts.filter((p) => p.id !== product?.id);

      // Fetch Judge.me reviews on the server side for schema injection
      try {
        reviewsData = await getProductReviews(product.id, product.handle);
      } catch (reviewsErr) {
        console.error("Failed to fetch product reviews on server:", reviewsErr);
      }
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

  const productSchema = getProductSchema(product, reviewsData);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Products", item: "/products" },
    { name: product.title, item: `/products/${product.handle}` }
  ]);

  return (
    <>
      <StructuredData data={[productSchema, breadcrumbSchema]} />
      <ProductDetailsClient 
        product={product} 
        relatedProducts={relatedProducts} 
        initialReviewsData={reviewsData}
      />
    </>
  );
}
