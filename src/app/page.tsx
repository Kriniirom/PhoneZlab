import { CategoriesStrip } from "@/features/shop/CategoriesStrip";
import { Hero } from "@/features/shop/Hero";
import { FeaturedProducts } from "@/features/shop/FeaturedProducts";

export default function HomePage() {
  return (
    <div className="pb-16 bg-[#f1f3f6]">
      <CategoriesStrip />
      <div className="max-w-7xl mx-auto">
        <Hero />
        <FeaturedProducts />
      </div>
    </div>
  );
}
