import { getProducts } from "@/features/product/api";
import type { Metadata } from "next";
import type { ShopifyProduct } from "@/types/shopify";
import { generatePageMetadata, getBreadcrumbSchema } from "@/utils/seo";
import { StructuredData } from "@/components/StructuredData";
import { CategoryFilterShell } from "@/features/product/CategoryFilterShell";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "All Products",
  description: "Browse all premium luxury accessories.",
  canonicalPath: "/products",
});

function parseSortParam(sort: string, rev: string): { sortKey?: string; reverse?: boolean } {
  switch (sort) {
    case "PRICE":        return { sortKey: "PRICE",        reverse: rev === "true" };
    case "CREATED_AT":   return { sortKey: "CREATED_AT",   reverse: rev === "true" };
    case "BEST_SELLING": return { sortKey: "BEST_SELLING",  reverse: false };
    default:             return {};
  }
}

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sort    = typeof searchParams.sort    === "string" ? searchParams.sort    : "";
  const reverse = typeof searchParams.reverse === "string" ? searchParams.reverse : "";

  const { sortKey, reverse: rev } = parseSortParam(sort, reverse);

  let products: ShopifyProduct[] = [];
  let error = false;

  try {
    products = await getProducts(50, sortKey, rev);
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
      <div className="pt-16 pb-10 px-3 md:px-5 max-w-7xl mx-auto">

        {/* ── Professional compact header ─────────────────────────────── */}
        <div className="mb-3 pb-3 border-b border-gray-100">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-700 font-medium">All Products</span>
          </nav>

          {/* Title row */}
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              All Products
            </h1>
            <span className="text-sm text-gray-400 font-medium whitespace-nowrap">
              {products.length} items
            </span>
          </div>
        </div>

        {/* ── Category + Sort toolbar + filtered grid ──────────────────── */}
        <Suspense fallback={null}>
          <CategoryFilterShell products={products} />
        </Suspense>

      </div>
    </>
  );
}
