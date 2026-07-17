"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/features/shop/faqData";

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="py-4 first:pt-0 last:pb-0">
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between text-left font-semibold text-gray-800 hover:text-[#2874f0] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2874f0] py-1 cursor-pointer"
            >
              <span className="text-base md:text-[17px] leading-snug pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#2874f0]" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-[500px] opacity-100 mt-2.5" : "max-h-0 opacity-0"
              }`}
            >
              <div className="text-sm md:text-[15px] text-gray-500 dark:text-gray-400 leading-relaxed pr-6">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default FaqAccordion;
