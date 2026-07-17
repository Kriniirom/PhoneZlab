import { CategoriesStrip } from "@/features/shop/CategoriesStrip";
import { Hero } from "@/features/shop/Hero";
import { FeaturedProducts } from "@/features/shop/FeaturedProducts";
import { ProductSection } from "@/features/shop/ProductSection";
import { getCollection } from "@/features/collection/api";

export default async function HomePage() {
  let collectionData = null;
  try {
    collectionData = await getCollection("frontpage", 8);
    if (!collectionData?.collection || collectionData.products.length === 0) {
      collectionData = await getCollection("home-page", 8);
    }
    if (!collectionData?.collection || collectionData.products.length === 0) {
      collectionData = await getCollection("homepage", 8);
    }
  } catch (e) {
    console.error("Failed to fetch homepage collection:", e);
  }

  const hasProducts = !!(collectionData && collectionData.collection && collectionData.products.length > 0);
  const products = hasProducts && collectionData ? collectionData.products : [];
  const title = hasProducts && collectionData && collectionData.collection ? collectionData.collection.title : "Home page";
  const subtitle = hasProducts && collectionData && collectionData.collection ? collectionData.collection.description : undefined;
  const handle = hasProducts && collectionData && collectionData.collection ? collectionData.collection.handle : "frontpage";

  return (
    <div className="pb-16 bg-[#f1f3f6]">
      <CategoriesStrip />
      <div className="max-w-7xl mx-auto">
        <Hero />
        <FeaturedProducts />
        {hasProducts && (
          <ProductSection
            title={title}
            subtitle={subtitle}
            viewAllHref={`/collections/${handle}`}
            products={products}
            iconName="Home"
            iconColorClass="text-[#2874f0]"
          />
        )}
      </div>
    </div>
  );
}
