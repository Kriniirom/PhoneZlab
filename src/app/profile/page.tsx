"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomerToken, fetchCustomerProfile, logoutCustomer } from "@/utils/shopifyAuth";
import { User, Mail, Phone as PhoneIcon, LogOut, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface CustomerProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      // If no token exists, redirect to login page
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchCustomerProfile(token);
        if (data && data.customer) {
          const cust = data.customer;
          setProfile({
            firstName: cust.firstName || "",
            lastName: cust.lastName || "",
            email: cust.emailAddress?.emailAddress || "",
            phone: cust.phoneNumber?.phoneNumber || "",
          });
        } else {
          throw new Error("No customer details returned from Shopify.");
        }
      } catch (err: any) {
        console.error("Error loading profile:", err);
        // If the token is invalid or expired, we should log them out locally
        setError(err.message || "Failed to load customer profile. Session may have expired.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    logoutCustomer();
  };

  if (loading) {
    return (
      <main className="min-h-[80vh] bg-[#f1f3f6] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#2874f0] animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Fetching profile details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[80vh] bg-[#f1f3f6] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Session Error</h3>
          <p className="text-gray-600 text-sm">{error}</p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => router.replace("/login")}
              className="bg-[#2874f0] text-white py-2 px-6 rounded font-semibold hover:bg-[#1a5ec7] transition-all cursor-pointer text-sm"
            >
              Sign In Again
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 text-xs font-semibold py-1 hover:underline bg-transparent border-none cursor-pointer"
            >
              Clear Session & Logout
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Create friendly display initials
  const getInitials = () => {
    if (!profile) return "U";
    const first = profile.firstName?.charAt(0) || "";
    const last = profile.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <main className="min-h-[80vh] bg-[#f1f3f6] py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-[#878787] mb-4">
          <a href="/" className="hover:text-[#2874f0] transition-colors">Home</a>
          <span className="text-[#878787] select-none">/</span>
          <span className="text-gray-900 font-medium">My Profile</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header Banner */}
          <div className="bg-[#2874f0] p-6 text-white relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Profile Avatar */}
              <div className="w-20 h-20 rounded-full bg-white text-[#2874f0] font-black text-2xl flex items-center justify-center border-4 border-white/20 shadow-md">
                {getInitials()}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {profile?.firstName || profile?.lastName
                    ? `${profile.firstName} ${profile.lastName}`.trim()
                    : "Shopify Customer"}
                </h2>
                <p className="text-white/80 text-sm flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#ffc200]" /> Verified Store Member
                </p>
              </div>
            </div>
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-gray-900 font-bold text-lg border-b border-gray-100 pb-3 mb-5">
                Account Credentials
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* First Name */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="bg-blue-100 text-[#2874f0] p-2.5 rounded-lg">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">First Name</span>
                    <span className="text-gray-800 font-semibold text-base mt-0.5 block">
                      {profile?.firstName || "Not provided"}
                    </span>
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="bg-blue-100 text-[#2874f0] p-2.5 rounded-lg">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Last Name</span>
                    <span className="text-gray-800 font-semibold text-base mt-0.5 block">
                      {profile?.lastName || "Not provided"}
                    </span>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 md:col-span-2">
                  <div className="bg-blue-100 text-[#2874f0] p-2.5 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="break-all">
                    <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</span>
                    <span className="text-gray-800 font-semibold text-base mt-0.5 block">
                      {profile?.email || "Not provided"}
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 md:col-span-2">
                  <div className="bg-blue-100 text-[#2874f0] p-2.5 rounded-lg">
                    <PhoneIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Phone Number</span>
                    <span className="text-gray-800 font-semibold text-base mt-0.5 block">
                      {profile?.phone || "Not provided"}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Actions Section */}
            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs text-gray-400 max-w-md">
                Securely logs out of this device and terminates the active session on Shopify's authentication servers.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-2.5 px-6 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 hover:scale-[1.01] transition-all cursor-pointer shadow-sm text-sm"
                >
                  Go to Home
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer shadow-sm text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
