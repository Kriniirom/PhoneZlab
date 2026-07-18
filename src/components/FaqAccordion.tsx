"use client";

// Import React and useState hook to manage accordion panel expansion state.
import React, { useState } from "react";
// Import standard arrow icon indicating expanded or collapsed states.
import { ChevronDown } from "lucide-react";
// Import typing interface defining FAQ items data shape (id, question, answer).
import type { FaqItem } from "@/features/shop/faqData";

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  // Track the ID of the currently expanded FAQ item. 
  // Set to null when all items are closed.
  const [openId, setOpenId] = useState<string | null>(null);

  // Toggle accordion expansion: opens item if closed, closes item if clicked again.
  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="py-4 first:pt-0 last:pb-0">
            {/* Clickable heading trigger that toggles the answer visibility */}
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between text-left font-semibold text-gray-800 hover:text-[#2874f0] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2874f0] py-1 cursor-pointer"
            >
              <span className="text-base md:text-[17px] leading-snug pr-4">
                {item.question}
              </span>
              {/* Rotates icon 180 degrees dynamically when the accordion item is opened */}
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-[#2874f0]" : ""
                }`}
              />
            </button>
            {/* Animates the height and opacity values to expand or collapse the answer panel */}
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
