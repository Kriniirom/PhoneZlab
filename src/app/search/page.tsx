import { SearchResults } from "@/features/search/SearchResults";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/utils/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Search",
  description: "Search for premium luxury accessories on PhoneZlab.",
  canonicalPath: "/search",
});

export default async function SearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
      <SearchResults query={query} />
    </div>
  );
}
