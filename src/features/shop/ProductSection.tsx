import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";
import { Sparkles, Flame, Tag, TrendingUp, Home } from "lucide-react";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  products: ShopifyProduct[];
  iconName?: "Sparkles" | "Flame" | "Tag" | "TrendingUp" | "Home";
  iconColorClass?: string;
  hideHeader?: boolean;
}

const IconMap = {
  Sparkles,
  Flame,
  Tag,
  TrendingUp,
  Home,
};

export function ProductSection({
  title,
  subtitle,
  viewAllHref,
  products,
  iconName = "Home",
  iconColorClass = "text-blue-500",
  hideHeader = false,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  const IconComponent = IconMap[iconName];

  return (
    <section className="bg-white shadow-sm mt-4 mx-2 sm:mx-4 rounded-sm p-2 sm:p-4">
      {!hideHeader && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3 font-semibold">
              {IconComponent && <IconComponent className={`w-6 h-6 ${iconColorClass}`} />}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 font-medium md:pl-9 pl-0">
                {subtitle}
              </p>
            )}
          </div>
          <Link href={viewAllHref} className="text-[#2874f0] font-bold text-sm hover:underline shrink-0">
            View All
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
export default ProductSection;
