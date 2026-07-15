"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { redirectToShopifyLogin, getCustomerToken, setCustomerToken } from "@/utils/shopifyAuth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If the customer is already logged in, redirect them to their profile immediately
    const token = getCustomerToken();
    if (token) {
      router.replace("/profile");
    }
  }, [router]);

  const handleShopifyLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // If we are simulating in mock mode, bypass real OAuth redirect
      const params = new URLSearchParams(window.location.search);
      if (params.get("mock") === "true") {
        setCustomerToken("mock_customer_token", 7200);
        router.replace("/profile");
        return;
      }
      await redirectToShopifyLogin();
    } catch (err: any) {
      console.error("Shopify login error:", err);
      setError(err.message || "Failed to initiate login with Shopify.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] bg-[#f1f3f6] flex items-center justify-center p-4 md:p-8 relative">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Panel: Brand info / values (Flipkart/PhoneZlap Style) */}
        <div className="w-full md:w-2/5 bg-[#2874f0] p-8 text-white flex flex-col justify-between relative">
          <div>
            <h2 className="text-3xl font-black italic tracking-tight mb-3">PhoneZlap</h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              Unlock a world of premium tech accessories, customized case overlays, and exclusive deals.
            </p>
          </div>

          <div className="my-8 space-y-6 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <ShieldCheck className="w-5 h-5 text-[#ffc200]" />
              </div>
              <div>
                <h4 className="text-sm font-bold">100% Safe Payments</h4>
                <p className="text-xs text-white/70">Secure dynamic tokenization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <Star className="w-5 h-5 text-[#ffc200] fill-[#ffc200]" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Premium Curation</h4>
                <p className="text-xs text-white/70">Top Indian phone accessories</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/50">
            © {new Date().getFullYear()} PhoneZlap. All rights reserved.
          </div>
          
          {/* Background circles for premium styling */}
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Right Panel: Interactive Sign In */}
        <div className="w-full md:w-3/5 p-8 flex flex-col justify-between min-h-[400px]">
          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900">Sign in to Account</h3>
                <p className="text-gray-500 text-sm mt-2">
                  Authenticate securely using Shopify Customer Accounts to view your profile, manage orders, and retrieve saved info.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleShopifyLogin}
                  disabled={loading}
                  className="w-full bg-[#2874f0] text-white py-3.5 px-6 rounded font-semibold flex items-center justify-center gap-3 hover:bg-[#1a5ec7] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-[#ffc200]" />
                      <span>Sign In with Shopify</span>
                    </>
                  )}
                </button>

                {error && (
                  <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2.5 rounded border border-red-200 animate-pulse">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center md:text-left leading-relaxed mt-6">
            By continuing, you agree to PhoneZlap's{" "}
            <Link href="/terms" className="text-[#2874f0] underline hover:text-blue-700">Terms of Use</Link> and{" "}
            <Link href="/privacy" className="text-[#2874f0] underline hover:text-blue-700">Privacy Policy</Link>.
          </p>
        </div>

      </div>
    </main>
  );
}
