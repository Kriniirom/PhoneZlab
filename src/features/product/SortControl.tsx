"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

// Define the client-facing sort options mapping to Shopify Storefront API SortKeys and reverse query configurations.
const SORT_OPTIONS = [
  { label: "Featured",           sortKey: undefined,       reverse: undefined },
  { label: "Price: Low to High", sortKey: "PRICE",         reverse: false     },
  { label: "Price: High to Low", sortKey: "PRICE",         reverse: true      },
  { label: "Newest",             sortKey: "CREATED_AT",    reverse: true      },
  { label: "Best Selling",       sortKey: "BEST_SELLING",  reverse: false     },
] as const;

// Helper to determine the active readable label matching the current URL query parameters.
// Compares stringified sort keys and boolean reverse parameters from URL with SORT_OPTIONS definitions.
function getActiveLabel(sort: string, rev: string): string {
  const found = SORT_OPTIONS.find(
    (o) =>
      (o.sortKey ?? "") === sort &&
      String(o.reverse ?? "") === (rev === "true" ? "true" : rev === "false" ? "false" : "")
  );
  return found?.label ?? "Featured";
}

export function SortControl() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Extract sorting query params from URL state to identify the currently active sort configuration.
  const currentSort = searchParams.get("sort") ?? "";
  const currentRev  = searchParams.get("reverse") ?? "";
  const activeLabel = getActiveLabel(currentSort, currentRev);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Handles updating the browser's URL search parameters to trigger Next.js route refresh 
  // and load new products matching the selected sorting criteria.
  function select(sortKey: string | undefined, reverse: boolean | undefined) {
    const params = new URLSearchParams();
    if (sortKey)               params.set("sort",    sortKey);
    if (reverse !== undefined) params.set("reverse", String(reverse));
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
    setOpen(false);
  }

  // Render just the dropdown — layout is owned by the parent (CategoryFilterShell toolbar)
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort products: ${activeLabel}`}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2874f0]"
      >
        <span className="text-xs font-normal text-gray-400 dark:text-gray-500 hidden sm:inline">
          Sort:
        </span>
        <span>{activeLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1.5 overflow-hidden"
        >
          {SORT_OPTIONS.map((opt) => {
            const isActive =
              (opt.sortKey ?? "") === currentSort &&
              String(opt.reverse ?? "") ===
                (currentRev === "true" ? "true" : currentRev === "false" ? "false" : "");
            return (
              <li key={opt.label} role="option" aria-selected={isActive}>
                <button
                  onClick={() => select(opt.sortKey, opt.reverse)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                    isActive
                      ? "font-semibold text-gray-900 bg-gray-50"
                      : "font-medium text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
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
  );
}
