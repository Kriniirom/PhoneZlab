"use client";

import Link from "next/link";
import { ShoppingBag, Search, Moon, Star, User, Loader2, Sun } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCustomerToken, logoutCustomer } from "@/utils/shopifyAuth";
import { searchProductsAction } from "@/features/product/actions";
import type { ShopifyProduct } from "@/types/shopify";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const lastRequestTime = useRef<number>(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [cartCount, setCartCount] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const activeTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(activeTheme);
    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const fetchCartCount = async () => {
    try {
      let cartId = typeof window !== "undefined" ? localStorage.getItem("shopify_cart_id") : null;
      if (!cartId && typeof document !== "undefined") {
        const match = document.cookie.match(/shopify_cart_id=([^;]+)/);
        cartId = match ? match[1] : null;
      }
      if (cartId) {
        const { getCartAction } = await import("@/features/cart/actions");
        const res = await getCartAction(cartId);
        if (res.success && res.cart) {
          const lines = res.cart.lines?.edges?.map((e: any) => e.node) || [];
          const activeCount = lines.reduce((sum: number, line: any) => sum + line.quantity, 0);
          setCartCount(activeCount);
        } else {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    } catch (e) {
      console.error("Error fetching cart count:", e);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // Check user authentication status on mount
    const token = getCustomerToken();
    setIsLoggedIn(!!token);

    window.addEventListener("cart-updated", fetchCartCount);
    return () => {
      window.removeEventListener("cart-updated", fetchCartCount);
    };
  }, []);

  // Real-time search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setFocusedIndex(-1);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    const debounceTimer = setTimeout(async () => {
      const requestTime = Date.now();
      lastRequestTime.current = requestTime;

      try {
        const res = await searchProductsAction(query.trim(), 6);
        if (requestTime >= lastRequestTime.current) {
          if (res.success && res.products) {
            setResults(res.products);
          } else {
            setResults([]);
          }
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        if (requestTime >= lastRequestTime.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Click outside effect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      setFocusedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setFocusedIndex((prev) => (prev > -1 ? prev - 1 : prev));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < results.length) {
        const selectedProduct = results[focusedIndex];
        router.push(`/products/${selectedProduct.handle}`);
        setIsOpen(false);
        setFocusedIndex(-1);
        e.preventDefault();
      }
    }
  };

  const formatPrice = (amount: string, currencyCode: string) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currencyCode || "INR",
        maximumFractionDigits: 0
      }).format(parseFloat(amount));
    } catch {
      return `Rs. ${amount}`;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const handleLogoutClick = () => {
    logoutCustomer();
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Top Row on Mobile, Left Side on Desktop */}
        <div className="flex items-center justify-between md:w-auto">
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div className="w-8.5 h-8.5 rounded-lg bg-[#2874f0] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-[1.03]">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 8h10l-4.5 4.5" />
                <path d="M11.5 11.5l-4.5 4H17" />
              </svg>
            </div>
            <span className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">PhoneZlab</span>
          </Link>
 
          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-4 text-gray-700 dark:text-gray-200">
            <Link href={isLoggedIn ? "/profile" : "/login"} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-full transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-full transition-colors focus:outline-none cursor-pointer"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <Link href="/cart" className="p-1 relative hover:bg-gray-100 dark:hover:bg-slate-850 rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartCount !== null && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2874f0] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
 
        {/* Search Bar - Full Width on Mobile, Middle on Desktop */}
        <div className="flex-1 max-w-2xl w-full">
          <div ref={searchRef} className="relative w-full">
            <form onSubmit={handleSearch} className="relative flex items-center bg-gray-50 dark:bg-slate-800/80 rounded-md shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700 focus-within:border-[#2874f0] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
              <input 
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => {
                  if (query.trim().length >= 2) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search for accessories, premium cases, charging docks and more..."
                className="w-full bg-transparent text-slate-900 dark:text-white py-2.5 pl-4 pr-12 focus:outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 truncate"
              />
              
              {/* Right container: Loading spinner or search button */}
              <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1.5 gap-1.5">
                {loading && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                )}
                <button 
                  type="submit" 
                  className="h-full px-3 text-[#2874f0] dark:text-[#3b82f6] hover:bg-gray-150 dark:hover:bg-slate-700 transition-colors border-l border-gray-200 dark:border-slate-750 flex items-center justify-center cursor-pointer"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4 font-bold" />
                </button>
              </div>
            </form>
 
            {/* Search Results Dropdown */}
            {isOpen && query.trim().length >= 2 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white text-black rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden max-h-[420px] flex flex-col">
                <div role="listbox" className="overflow-y-auto divide-y divide-gray-50 flex-1">
                  {loading && results.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 text-[#2874f0] animate-spin" />
                      <span>Searching Shopify...</span>
                    </div>
                  ) : results.length > 0 ? (
                    results.map((product, index) => {
                      const variant = product.variants.edges[0]?.node;
                      const price = variant?.price;
                      const image = variant?.image?.url || product.featuredImage?.url;
                      
                      const isFocused = index === focusedIndex;
 
                      return (
                        <div
                          key={product.id}
                          role="option"
                          aria-selected={isFocused}
                          className={`flex items-center gap-4 p-3 transition-colors cursor-pointer select-none ${
                            isFocused ? "bg-gray-50" : "hover:bg-gray-50/70"
                          }`}
                          onMouseEnter={() => setFocusedIndex(index)}
                          onClick={() => {
                            router.push(`/products/${product.handle}`);
                            setIsOpen(false);
                            setFocusedIndex(-1);
                          }}
                        >
                          {/* Thumbnail */}
                          <div className="w-10 h-10 bg-gray-50 flex items-center justify-center p-1 border border-gray-100 rounded-sm flex-shrink-0">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={image} 
                                alt={product.title} 
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <Search className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
 
                          {/* Info */}
                          <div className="flex-grow min-w-0">
                            <span className="block text-sm font-semibold text-gray-800 truncate leading-snug">
                              {product.title}
                            </span>
                            {product.productType && (
                              <span className="text-[10px] text-gray-400 font-medium block">
                                {product.productType}
                              </span>
                            )}
                          </div>
 
                          {/* Price */}
                          {price && (
                            <div className="text-right flex-shrink-0">
                              <span className="text-sm font-bold text-gray-900 block">
                                {formatPrice(price.amount, price.currencyCode)}
                              </span>
                              {variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(price.amount) && (
                                <span className="text-[10px] text-gray-400 line-through block">
                                  {formatPrice(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No results found for &quot;<span className="font-bold text-gray-600">{query}</span>&quot;
                    </div>
                  )}
                </div>
 
                {/* View all results button */}
                {results.length > 0 && (
                  <div className="bg-gray-50 p-2.5 border-t border-gray-100 text-center">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/search?q=${encodeURIComponent(query)}`);
                        setIsOpen(false);
                        setFocusedIndex(-1);
                      }}
                      className="text-xs font-bold text-[#2874f0] hover:underline bg-transparent border-none cursor-pointer w-full py-1 block text-center"
                    >
                      View all results for &quot;{query}&quot;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
 
        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-6 text-gray-700 dark:text-gray-200 font-medium text-sm">
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="hover:bg-gray-105 dark:hover:bg-slate-800 px-4 py-1.5 rounded transition-all flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <button 
                onClick={handleLogoutClick}
                className="bg-red-500 text-white px-5 py-1.5 font-bold rounded-sm hover:bg-red-600 transition-colors cursor-pointer text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-[#2874f0] hover:bg-[#1a5ec7] text-white px-6 py-1.5 font-bold rounded-sm transition-colors dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-white text-center">
              Login
            </Link>
          )}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded transition-all focus:outline-none cursor-pointer"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <>
                <Moon className="w-4 h-4 text-gray-600" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Light Mode</span>
              </>
            )}
          </button>
          <Link href="/cart" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded transition-colors relative">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount !== null && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#2874f0] text-white text-[8px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>
        </div>
 
      </div>
    </header>
  );
}
