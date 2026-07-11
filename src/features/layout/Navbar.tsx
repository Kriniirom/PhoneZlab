"use client";

import Link from "next/link";
import { ShoppingBag, Search, Moon, Star, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCustomerToken, logoutCustomer } from "@/utils/shopifyAuth";

export function Navbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [cartCount, setCartCount] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleLogoutClick = () => {
    logoutCustomer();
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#2874f0] shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Top Row on Mobile, Left Side on Desktop */}
        <div className="flex items-center justify-between md:w-auto">
          <Link href="/" className="flex flex-col">
            <span className="text-white text-2xl font-bold italic tracking-tight leading-none">PhoneZlab</span>
            <span className="text-white/90 text-xs italic flex items-center gap-1 mt-0.5">
              Explore <span className="text-[#ffe500] font-bold">Plus</span>
              <Star className="w-3 h-3 text-[#ffe500] fill-[#ffe500]" />
            </span>
          </Link>

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-4 text-white">
            <Link href={isLoggedIn ? "/profile" : "/login"} className="p-1">
              <User className="w-5 h-5" />
            </Link>
            <button className="p-1">
              <Moon className="w-5 h-5" />
            </button>
            <Link href="/cart" className="p-1 relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount !== null && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#2874f0]">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar - Full Width on Mobile, Middle on Desktop */}
        <div className="flex-1 max-w-2xl w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for accessories, premium cases, charging docks and more..."
              className="w-full bg-white text-black py-2.5 px-4 rounded shadow-sm focus:outline-none text-sm placeholder:text-gray-500"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2874f0]">
              <Search className="w-5 h-5 font-bold" />
            </button>
          </form>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-6 text-white font-medium">
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="hover:bg-white/10 px-4 py-1.5 rounded transition-all flex items-center gap-2">
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
            <Link href="/login" className="bg-white text-[#2874f0] px-8 py-1.5 font-bold rounded-sm hover:bg-gray-50 transition-colors">
              Login
            </Link>
          )}
          <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded transition-colors">
            <Moon className="w-5 h-5" />
          </button>
          <Link href="/cart" className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded transition-colors relative">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount !== null && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#2874f0]">
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
