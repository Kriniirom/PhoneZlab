import { CollectionList } from "@/features/collection/CollectionList";
import { CollectionHeader } from "@/features/collection/CollectionHeader";
import type { Metadata } from "next";
import { generatePageMetadata, getBreadcrumbSchema } from "@/utils/seo";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = generatePageMetadata({
  title: "Collections",
  description: "Browse all premium collections from PhoneZlab.",
  canonicalPath: "/collections",
});

export default function CollectionsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Collections", item: "/collections" }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <CollectionHeader 
        title="Our Collections" 
        description="Explore our meticulously crafted categories of luxury accessories."
      />
      <CollectionList />
    </>
  );
}
