import Link from "next/link";
import { getCollections } from "@/features/collection/api";
import type { ShopifyCollection } from "@/types/shopify";

export async function CollectionList() {
  let collections: ShopifyCollection[] = [];
  let error = false;

  try {
    collections = await getCollections(10);
  } catch (e) {
    console.error("Failed to fetch collections:", e);
    error = true;
  }

  // Fallback mock data if Shopify is not connected
  if (error || collections.length === 0) {
    collections = [
      { id: "1", handle: "cases", title: "Premium Cases", description: "Precision engineered protection.", seo: { title: "", description: "" }, updatedAt: "" },
      { id: "2", handle: "accessories", title: "Accessories", description: "The perfect companions for your devices.", seo: { title: "", description: "" }, updatedAt: "" },
      { id: "3", handle: "leather-goods", title: "Leather Goods", description: "Handcrafted Italian leather.", seo: { title: "", description: "" }, updatedAt: "" },
      { id: "4", handle: "straps", title: "Watch Straps", description: "Elevate your wrist game.", seo: { title: "", description: "" }, updatedAt: "" },
    ];
  }

  return (
    <section className="py-20 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {collections.map((collection, index) => (
          <Link 
            key={collection.id} 
            href={`/collections/${collection.handle}`}
            className="group block relative aspect-[16/9] md:aspect-[4/3] bg-[#111] rounded-2xl overflow-hidden"
          >
            {/* 
              Placeholder Image 
              In production, fetch from collection.image.url
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop&sig=${index}`}
              alt={collection.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <h2 className="text-3xl font-medium tracking-tight mb-2">{collection.title}</h2>
              <p className="text-gray-300 font-light">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
