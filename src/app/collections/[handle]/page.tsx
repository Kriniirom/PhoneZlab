import { getCollection } from "@/features/collection/api";
import { CollectionHeader } from "@/features/collection/CollectionHeader";
import { CollectionProducts } from "@/features/collection/CollectionProducts";
import type { Metadata } from "next";
import { generatePageMetadata, getBreadcrumbSchema } from "@/utils/seo";
import { StructuredData } from "@/components/StructuredData";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  let title = resolvedParams.handle;
  let description = `Browse the ${resolvedParams.handle} collection at PhoneZlab.`;

  try {
    const collectionData = await getCollection(resolvedParams.handle, 1);
    if (collectionData?.collection) {
      title = collectionData.collection.seo?.title || collectionData.collection.title || title;
      description = collectionData.collection.seo?.description || collectionData.collection.description || description;
    }
  } catch (e) {
    console.error("Failed to fetch collection for metadata:", e);
  }

  return generatePageMetadata({
    title,
    description,
    canonicalPath: `/collections/${resolvedParams.handle}`,
  });
}

export default async function CollectionDetailPage({ params }: Props) {
  const resolvedParams = await params;
  let collectionData = null;
  let error = false;

  try {
    collectionData = await getCollection(resolvedParams.handle, 20);
  } catch (e) {
    console.error("Failed to fetch collection:", e);
    error = true;
  }

  if (error || !collectionData?.collection) {
    return (
      <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto text-center text-gray-500">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Collection Not Found</h1>
        <p>The collection you are looking for could not be found or failed to load. Please check the URL or try again later.</p>
      </div>
    );
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Collections", item: "/collections" },
    { name: collectionData.collection.title, item: `/collections/${resolvedParams.handle}` }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <CollectionHeader 
        title={collectionData.collection.title} 
        description={collectionData.collection.description}
      />
      <CollectionProducts products={collectionData.products} />
    </>
  );
}
