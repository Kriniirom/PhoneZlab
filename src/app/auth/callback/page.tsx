"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeCodeForToken, setCustomerToken } from "@/utils/shopifyAuth";
import { Loader2, ShieldAlert } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const exchangeStarted = useRef(false);

  useEffect(() => {
    // Only execute the exchange once in strict mode
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (errorParam) {
      setError(errorDesc || `Authentication failed: ${errorParam}`);
      return;
    }

    if (!code || !state) {
      setError("Invalid authentication callback. Missing code or state.");
      return;
    }

    // Verify OAuth CSRF state
    const savedState = sessionStorage.getItem("shopify_auth_state");
    if (state !== savedState) {
      setError("Security check failed: State mismatch. Please try signing in again.");
      return;
    }

    // Retrieve PKCE verifier
    const verifier = sessionStorage.getItem("shopify_auth_verifier");
    if (!verifier) {
      setError("Authentication session expired or invalid. Please try again.");
      return;
    }

    const performExchange = async () => {
      try {
        const tokenData = await exchangeCodeForToken(code, verifier);
        
        // Save the access token in cookie (falls back to 7200 seconds if not provided)
        setCustomerToken(tokenData.access_token, tokenData.expires_in || 7200);

        // Clear verification keys from session storage
        sessionStorage.removeItem("shopify_auth_state");
        sessionStorage.removeItem("shopify_auth_verifier");

        // Redirect to protected profile page
        router.replace("/profile");
      } catch (err: any) {
        console.error("Callback token exchange failed:", err);
        setError(err.message || "Failed to exchange verification code for account access.");
      }
    };

    performExchange();
  }, [router, searchParams]);

  return error ? (
    <div className="space-y-4">
      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Authentication Failed</h3>
      <p className="text-gray-600 text-sm">{error}</p>
      <button
        onClick={() => router.replace("/login")}
        className="mt-4 bg-[#2874f0] text-white py-2 px-6 rounded font-semibold hover:bg-[#1a5ec7] transition-all cursor-pointer text-sm"
      >
        Back to Sign In
      </button>
    </div>
  ) : (
    <div className="space-y-4">
      <Loader2 className="w-10 h-10 text-[#2874f0] animate-spin mx-auto" />
      <h3 className="text-lg font-bold text-gray-900">Verifying Authorization</h3>
      <p className="text-gray-500 text-sm">
        Securely connecting with Shopify. Please do not close or refresh this page.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-[75vh] bg-[#f1f3f6] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <Suspense fallback={
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#2874f0] animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">Loading Callback</h3>
            <p className="text-gray-500 text-sm">Initializing secure authentication...</p>
          </div>
        }>
          <CallbackHandler />
        </Suspense>
      </div>
    </main>
  );
}
