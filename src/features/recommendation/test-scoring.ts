import { rankRecommendations } from "./scoring";
import type { ShopifyProduct } from "@/types/shopify";
import type { RecentlyViewedProduct } from "@/features/search/tracking/recentlyViewed";

// Mock candidate Shopify products
const candidates: any[] = [
  {
    id: "prod-1",
    title: "Luxury Leather iPhone 15 Pro Max Case",
    handle: "leather-iphone-15-pro-max-case",
    productType: "Cases",
    tags: ["iphone", "case", "leather", "magsafe"],
    vendor: "PhoneZlab Premium",
    variants: { edges: [{ node: { availableForSale: true, price: { amount: "2999", currencyCode: "INR" }, selectedOptions: [] } }] }
  },
  {
    id: "prod-2",
    title: "15W Magnetic Wireless Charging Dock",
    handle: "magnetic-wireless-charging-dock",
    productType: "Power",
    tags: ["charger", "magsafe", "wireless", "dock"],
    vendor: "Anker",
    variants: { edges: [{ node: { availableForSale: true, price: { amount: "3999", currencyCode: "INR" }, selectedOptions: [] } }] }
  },
  {
    id: "prod-3",
    title: "Ultra Thin Hard Shell Case for iPhone 14",
    handle: "thin-case-iphone-14",
    productType: "Cases",
    tags: ["iphone", "case", "thin"],
    vendor: "Spigen",
    variants: { edges: [{ node: { availableForSale: true, price: { amount: "1299", currencyCode: "INR" }, selectedOptions: [] } }] }
  },
  {
    id: "prod-4",
    title: "Heavy Duty Military Grade Armor Case",
    handle: "armor-case-iphone-15",
    productType: "Cases",
    tags: ["case", "armor", "heavy-duty"],
    vendor: "Spigen",
    variants: { edges: [{ node: { availableForSale: true, price: { amount: "1899", currencyCode: "INR" }, selectedOptions: [] } }] }
  },
  {
    id: "prod-5",
    title: "Unrelated Premium Bluetooth Earbuds",
    handle: "premium-bluetooth-earbuds",
    productType: "Audio",
    tags: ["earbuds", "bluetooth", "audio"],
    vendor: "Sony",
    variants: { edges: [{ node: { availableForSale: true, price: { amount: "19999", currencyCode: "INR" }, selectedOptions: [] } }] }
  }
];

// Mock user signals in localStorage
const recentSearches = ["iPhone case", "magsafe"];
const recentlyViewed: RecentlyViewedProduct[] = [
  {
    id: "viewed-1",
    handle: "magsafe-charger-stand",
    title: "MagSafe Charger Stand",
    productType: "Power",
    tags: ["charger", "magsafe", "dock"],
    vendor: "Anker",
    viewedAt: new Date().toISOString()
  }
];

console.log("=== MOCKING RECOMMENDATION SCORING RUN ===");
console.log("Searches:", recentSearches);
console.log("Viewed:", recentlyViewed.map(v => v.title));
console.log("Excluding Current Product: 'prod-4'\n");

const ranked = rankRecommendations({
  candidateProducts: candidates as ShopifyProduct[],
  recentSearches,
  recentlyViewed,
  currentProductId: "prod-4"
});

console.log("\n=== FINAL RANKED RECOMMENDATIONS ===");
ranked.forEach((product, index) => {
  console.log(`${index + 1}. ${product.title} (${product.productType})`);
});
