import { getCollection } from "@/features/collection/api";
import { CollectionHeader } from "@/features/collection/CollectionHeader";
import { CollectionProducts } from "@/features/collection/CollectionProducts";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.handle} | PhoneZlab`,
    description: `Browse the ${resolvedParams.handle} collection at PhoneZlab.`,
  };
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

  return (
    <>
      <CollectionHeader 
        title={collectionData.collection.title} 
        description={collectionData.collection.description}
      />
      <CollectionProducts products={collectionData.products} />
    </>
  );
}
