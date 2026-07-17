"use client";

import React, { useState } from "react";
import { Search, HelpCircle, Mail, ChevronRight } from "lucide-react";
import { faqData } from "@/features/shop/faqData";
import { FaqAccordion } from "@/components/FaqAccordion";

const CATEGORIES = [
  "Shipping",
  "Payments",
  "Orders",
  "Returns",
  "Warranty",
  "Products",
  "Customer Account",
  "Contact"
] as const;

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter FAQ data based on search input
  const filteredFaqs = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = filteredFaqs.length > 0;

  return (
    <div className="bg-white min-h-screen pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Help Center Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2874f0]">
            PhoneZlab Help Center
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Find answers to common questions about orders, shipping, payments, returns, warranties and more.
          </p>
        </div>

        {/* Dynamic Real-Time FAQ Search */}
        <div className="relative max-w-lg mx-auto mb-16">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#2874f0] focus:ring-2 focus:ring-[#2874f0]/10 outline-none text-sm md:text-base text-gray-800 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Accordion Sections Grouped by Category */}
        {hasResults ? (
          <div className="space-y-12">
            {CATEGORIES.map((category) => {
              const categoryItems = filteredFaqs.filter(
                (item) => item.category === category
              );

              if (categoryItems.length === 0) return null;

              return (
                <section
                  key={category}
                  className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm space-y-6"
                >
                  <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
                    <HelpCircle className="w-5 h-5 text-[#2874f0]" />
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      {category}
                    </h2>
                  </div>
                  <FaqAccordion items={categoryItems} />
                </section>
              );
            })}
          </div>
        ) : (
          /* Clean Empty Search State */
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
            <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-700 mb-1">
              No answers match your search
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              We couldn&apos;t find any FAQs for &ldquo;{searchQuery}&rdquo;. Try using different terms.
            </p>
          </div>
        )}

        {/* Contact Help Center Section */}
        <div className="mt-20 pt-12 border-t border-gray-100 text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              Still need help?
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              If you couldn&apos;t find an answer to your question, feel free to contact our customer support team directly.
            </p>
          </div>
          <a
            href="mailto:support@phonezlab.com"
            className="inline-flex items-center gap-2 bg-[#2874f0] hover:bg-[#1a5ec7] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:ring-offset-2 cursor-pointer shadow-sm"
          >
            <Mail className="w-4 h-4" />
            Contact Us
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
