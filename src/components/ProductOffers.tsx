"use client";

import React, { useState } from "react";
import { Tag, HelpCircle, Copy, Check } from "lucide-react";
import type { ShopifyProduct } from "@/types/shopify";
import { STORE_COUPONS } from "@/config/offers";

interface Offer {
  type: string;
  text: string;
  termsUrl?: string;
}

interface ProductOffersProps {
  product: ShopifyProduct;
}

export function ProductOffers({ product }: ProductOffersProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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

  const bankOffers = parseOffers(product);

  return (
    <div className="mt-6 border border-green-100 bg-green-50/20 p-4 rounded-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-green-100/50 pb-2">
        <Tag className="w-4 h-4 text-green-600 fill-green-600/10" />
        <h3 className="text-sm font-bold text-gray-800">Available Offers & Coupons</h3>
      </div>

      {/* Branded Store Coupons */}
      <div className="mb-5">
        <span className="text-xs font-bold text-gray-500 block mb-2.5 uppercase tracking-wider">Coupons</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STORE_COUPONS.map((coupon) => (
            <div key={coupon.code} className="bg-white border border-gray-150 rounded-sm p-3 flex flex-col justify-between gap-1.5 shadow-sm hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-sm border border-gray-200 text-xs uppercase select-all">
                  {coupon.code}
                </span>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="text-[#2874f0] hover:text-[#1a5ec7] font-bold text-xs cursor-pointer uppercase select-none transition-colors border border-[#2874f0]/20 hover:border-[#2874f0]/40 px-2 py-0.5 rounded-sm flex items-center gap-1"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="mt-0.5">
                <span className="text-xs font-bold text-gray-850 block">
                  {coupon.title} ({coupon.discountValueText})
                </span>
                <p className="text-[11px] text-[#878787] mt-0.5 leading-snug">
                  {coupon.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank & Special Offers */}
      {bankOffers.length > 0 && (
        <div className="border-t border-green-100/30 pt-4">
          <span className="text-xs font-bold text-gray-500 block mb-3 uppercase tracking-wider">Special Bank Deals</span>
          <ul className="space-y-3">
            {bankOffers.map((offer, idx) => (
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
      )}
    </div>
  );
}
