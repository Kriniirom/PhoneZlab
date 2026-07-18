// Import the API call for reading products from Shopify.
import { getProducts } from "@/features/product/api";
// Import Next.js Metadata type.
import type { Metadata } from "next";
// Import Shopify product structure interface.
import type { ShopifyProduct } from "@/types/shopify";
// Import SEO helpers for rendering JSON-LD structure metadata and page meta tags.
import { generatePageMetadata, getBreadcrumbSchema } from "@/utils/seo";
// Import the component to insert JSON-LD data structures directly into the HTML header.
import { StructuredData } from "@/components/StructuredData";
// Import client filter shell that filters active listing products dynamically based on category dropdown selection.
import { CategoryFilterShell } from "@/features/product/CategoryFilterShell";
// Import Suspense component for Next.js async chunk resolution boundaries.
import { Suspense } from "react";
// Import Link component for client-side routing.
import Link from "next/link";

// Generate SEO meta tags for search indexers mapping the canonical path `/products`.
export const metadata: Metadata = generatePageMetadata({
  title: "All Products",
  description: "Browse all premium luxury accessories.",
  canonicalPath: "/products",
});

// Utility to parse URL search parameters into Shopify Storefront API compatible SortKeys and direction.
// Maps frontend custom route parameters to database query properties.
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
  // Extract and resolve the raw string values for sorting parameters from searchParams.
  const searchParams = await props.searchParams;
  const sort    = typeof searchParams.sort    === "string" ? searchParams.sort    : "";
  const reverse = typeof searchParams.reverse === "string" ? searchParams.reverse : "";

  // Parse parameters to obtain the correct database-level key and sort order direction.
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
