"use client";

import React, { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { ShopifyProduct } from "@/types/shopify";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { getPersonalizedRecommendationsAction } from "@/features/recommendation/actions";
import type { RecentlyViewedProduct } from "@/features/search/tracking/recentlyViewed";

export function FeaturedProducts() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        let recentSearches: string[] = [];
        let recentlyViewed: RecentlyViewedProduct[] = [];

        if (typeof window !== "undefined") {
          try {
            const searches = localStorage.getItem("phonezlab_recent_searches");
            if (searches) {
              recentSearches = JSON.parse(searches);
            }
            const viewed = localStorage.getItem("phonezlab_recently_viewed");
            if (viewed) {
              recentlyViewed = JSON.parse(viewed);
            }
          } catch (storageErr) {
            console.warn("Failed to access localStorage for recommendations:", storageErr);
          }
        }

        // Call the server action to fetch and rank products
        const data = await getPersonalizedRecommendationsAction({
          recentSearches,
          recentlyViewed,
          limit: 4,
        });

        setProducts(data);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  // Show 4 lightweight skeleton placeholders while loading to prevent CLS
  if (loading) {
    return (
      <section className="bg-white shadow-sm mt-4 mx-4 rounded-sm p-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-red-500 w-6 h-6 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 animate-pulse">Product Recommendations</h2>
          </div>
          <div className="w-24 h-4 bg-gray-100 animate-pulse rounded"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="fk-card h-full flex flex-col bg-white animate-pulse">
              <div className="aspect-square bg-gray-100 w-full mb-3 rounded-sm"></div>
              <div className="px-3 pb-3 space-y-2 flex-grow">
                <div className="h-3 bg-gray-200 w-1/3 rounded"></div>
                <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                <div className="h-5 bg-gray-200 w-1/2 rounded mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Gracefully handle empty states by rendering nothing
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white shadow-sm mt-4 mx-4 rounded-sm p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3 font-semibold">
          <TrendingUp className="text-red-500 w-6 h-6" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Product Recommendations</h2>
        </div>
        <Link href="/products" className="text-[#2874f0] font-bold text-sm hover:underline shrink-0">
          View All Deals
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
export default FeaturedProducts;
