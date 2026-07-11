import { CollectionList } from "@/features/collection/CollectionList";
import { CollectionHeader } from "@/features/collection/CollectionHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections | PhoneZlab",
  description: "Browse all premium collections from PhoneZlab.",
};

export default function CollectionsPage() {
  return (
    <>
      <CollectionHeader 
        title="Our Collections" 
        description="Explore our meticulously crafted categories of luxury accessories."
      />
      <CollectionList />
    </>
  );
}
