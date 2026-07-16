"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useEffect, useState } from "react";
import { ChevronDown, Check, Package } from "lucide-react";
import type { ShopifyProduct } from "@/types/shopify";
import { ProductCard } from "@/components/ProductCard";
import { SortControl } from "@/features/product/SortControl";

interface CategoryFilterShellProps {
  products: ShopifyProduct[];
}

/**
 * Normalize a raw Shopify productType string to Title Case.
 * Returns empty string if the type is missing/blank.
 */
function normalizeType(type: string | null | undefined): string {
  if (!type?.trim()) return "";
  return type
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function CategoryFilterShell({ products }: CategoryFilterShellProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const activeCategory = searchParams.get("category") ?? "";

  // ── Derive real categories from Shopify productType (no extra API call) ──
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const c = normalizeType(p.productType);
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [products]);

  // ── Client-side filter — instant, zero network ────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter(
      (p) => normalizeType(p.productType) === activeCategory
    );
  }, [products, activeCategory]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setCatOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /** Navigate to /products preserving existing sort params, setting category */
  function selectCategory(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    setCatOpen(false);
  }

  const activeCatLabel = activeCategory || "All Categories";
  const hasFilter = Boolean(activeCategory);

  return (
    <>
      {/* ── Toolbar: [Category ▾]  ·  [Sort ▾] ─────────────────────────── */}
      <div className="flex items-center justify-between mb-4" role="toolbar" aria-label="Product filters">

        {/* Category dropdown — left */}
        <div className="relative" ref={catRef}>
          <button
            onClick={() => setCatOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={catOpen}
            aria-label={`Filter by category: ${activeCatLabel}`}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-semibold cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2874f0] ${
              hasFilter
                ? "border-[#2874f0] bg-[#2874f0] text-white hover:bg-[#1a5ec7]"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <span
              className={`text-xs font-normal hidden sm:inline ${
                hasFilter ? "text-white/80" : "text-gray-400"
              }`}
            >
              Category:
            </span>
            <span>{activeCatLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${catOpen ? "rotate-180" : ""} ${
                hasFilter ? "text-white/80" : "text-gray-400"
              }`}
              aria-hidden="true"
            />
          </button>

          {catOpen && (
            <ul
              role="listbox"
              aria-label="Category options"
              className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1.5 overflow-hidden"
            >
              {/* "All Categories" option */}
              <li role="option" aria-selected={!hasFilter}>
                <button
                  onClick={() => selectCategory("")}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                    !hasFilter
                      ? "font-semibold text-gray-900 bg-gray-50"
                      : "font-medium text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                  {!hasFilter && (
                    <Check className="w-3.5 h-3.5 text-[#2874f0]" aria-hidden="true" />
                  )}
                </button>
              </li>

              {/* Real categories from Shopify productType — never hardcoded */}
              {categories.map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <li key={cat} role="option" aria-selected={isActive}>
                    <button
                      onClick={() => selectCategory(cat)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                        isActive
                          ? "font-semibold text-gray-900 bg-gray-50"
                          : "font-medium text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                      {isActive && (
                        <Check className="w-3.5 h-3.5 text-[#2874f0]" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Sort control — right (existing SortControl, unchanged) */}
        <SortControl />
      </div>

      {/* ── Product grid OR empty state ───────────────────────────────────── */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 dark:border-[#2d2d2d] rounded-2xl">
          <Package
            className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-4"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
            No products in &ldquo;{activeCategory}&rdquo;
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 max-w-xs">
            No products found for this category. Try a different one or clear the filter.
          </p>
          <button
            onClick={() => selectCategory("")}
            className="px-5 py-2.5 bg-[#2874f0] hover:bg-[#1a5ec7] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2874f0] focus-visible:ring-offset-2"
          >
            Clear Filter
          </button>
        </div>
      ) : (
        /* Existing grid — identical classes, existing ProductCard — zero design change */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
