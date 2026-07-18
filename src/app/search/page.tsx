// Import the client search component that executes relevance queries and lists results.
import { SearchResults } from "@/features/search/SearchResults";
// Import Next.js Metadata type.
import type { Metadata } from "next";
// Import SEO metadata generator helper.
import { generatePageMetadata } from "@/utils/seo";

// Setup page-level SEO config.
export const metadata: Metadata = generatePageMetadata({
  title: "Search",
  description: "Search for premium luxury accessories on PhoneZlab.",
  canonicalPath: "/search",
});

export default async function SearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Await Next.js search parameters from the request URL context.
  const searchParams = await props.searchParams;
  // Safely check and read 'q' parameter containing the search keywords entered by the customer.
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  // Render the core SearchResults panel which fetches matching records client-side.
  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
      <SearchResults query={query} />
    </div>
  );
}
