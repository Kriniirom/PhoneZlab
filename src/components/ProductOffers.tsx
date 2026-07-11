"use client";

import React from "react";
import { Tag, HelpCircle } from "lucide-react";
import type { ShopifyProduct } from "@/types/shopify";

interface Offer {
  type: string;
  text: string;
  termsUrl?: string;
}

interface ProductOffersProps {
  product: ShopifyProduct;
}

export function ProductOffers({ product }: ProductOffersProps) {
  const parseOffers = (prod: ShopifyProduct): Offer[] => {
    const list: Offer[] = [];

    // 1. Parse from product tags (e.g., "offer:Bank Offer | 10% off up to ₹1,500")
    if (prod.tags) {
      prod.tags.forEach((tag) => {
        if (tag.startsWith("offer:")) {
          const content = tag.substring(6).trim();
          if (content.includes("|")) {
            const parts = content.split("|");
            list.push({ 
              type: parts[0].trim(), 
              text: parts.slice(1).join("|").trim() 
            });
          } else if (content.includes(":")) {
            const parts = content.split(":");
            list.push({ 
              type: parts[0].trim(), 
              text: parts.slice(1).join(":").trim() 
            });
          } else {
            list.push({ 
              type: "Special Offer", 
              text: content 
            });
          }
        }
      });
    }

    // 2. Parse from metafield "custom.offers"
    if (prod.offersMetafield?.value) {
      try {
        const val = prod.offersMetafield.value;
        if (val.trim().startsWith("[") && val.trim().endsWith("]")) {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (typeof item === "string") {
                if (item.includes(":")) {
                  const parts = item.split(":");
                  list.push({ 
                    type: parts[0].trim(), 
                    text: parts.slice(1).join(":").trim() 
                  });
                } else {
                  list.push({ 
                    type: "Offer", 
                    text: item 
                  });
                }
              } else if (item && typeof item === "object" && item.text) {
                list.push({
                  type: item.type || "Offer",
                  text: item.text,
                  termsUrl: item.termsUrl
                });
              }
            });
          }
        } else {
          // split multi-line string
          val.split("\n").forEach((line) => {
            if (line.trim()) {
              if (line.includes(":")) {
                const parts = line.split(":");
                list.push({ 
                  type: parts[0].trim(), 
                  text: parts.slice(1).join(":").trim() 
                });
              } else {
                list.push({ 
                  type: "Offer", 
                  text: line.trim() 
                });
              }
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse offers metafield:", e);
      }
    }

    return list;
  };

  const offers = parseOffers(product);

  // If there are no offers, we do not render anything to keep the UI clean
  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border border-green-100 bg-green-50/20 p-4 rounded-sm">
      <div className="flex items-center gap-2 mb-3 border-b border-green-100/50 pb-2">
        <Tag className="w-4 h-4 text-green-600 fill-green-600/10" />
        <h3 className="text-sm font-bold text-gray-800">Available Offers</h3>
      </div>
      <ul className="space-y-3">
        {offers.map((offer, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-700 leading-snug">
            <span className="bg-green-600/10 text-green-700 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 tracking-wide">
              {offer.type}
            </span>
            <div className="flex-1">
              <span>{offer.text}</span>
              {offer.termsUrl ? (
                <a 
                  href={offer.termsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#2874f0] font-semibold hover:underline ml-1.5 inline-flex items-center gap-0.5"
                >
                  T&C <HelpCircle className="w-3 h-3 text-[#2874f0]" />
                </a>
              ) : (
                <span className="text-[#2874f0] font-semibold cursor-pointer hover:underline ml-1.5">T&C</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
