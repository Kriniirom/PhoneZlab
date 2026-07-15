"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCustomerToken,
  fetchCustomerProfile,
  logoutCustomer,
  OrderNode,
  FulfillmentTrackingInfo,
} from "@/utils/shopifyAuth";
import {
  User,
  Mail,
  Phone as PhoneIcon,
  LogOut,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Package,
  ExternalLink,
  Calendar,
  CreditCard,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";

interface CustomerProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  orders: OrderNode[];
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
          const orderNodes = cust.orders?.edges?.map((edge: any) => edge.node) || [];
          setProfile({
            firstName: cust.firstName || "",
            lastName: cust.lastName || "",
            email: cust.emailAddress?.emailAddress || "",
            phone: cust.phoneNumber?.phoneNumber || "",
            orders: orderNodes,
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

            {/* My Orders Section */}
            <div className="pt-6 border-t border-gray-150 dark:border-slate-800">
              <h3 className="text-gray-900 dark:text-white font-bold text-lg border-b border-gray-100 dark:border-slate-800 pb-3 mb-5 flex items-center justify-between">
                <span>My Orders</span>
                <span className="bg-[#2874f0]/10 text-[#2874f0] text-xs font-bold px-2 py-0.5 rounded-full">
                  {profile?.orders?.length || 0} Orders
                </span>
              </h3>

              {!profile?.orders || profile.orders.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No orders found</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => router.push("/")}
                    className="bg-[#2874f0] text-white py-2 px-6 rounded font-semibold text-xs hover:bg-[#1a5ec7] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {profile.orders.map((order) => {
                    const orderDate = new Date(order.processedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                    
                    const fulfillmentNodes = order.fulfillments?.edges?.map((edge) => edge.node) || [];
                    
                    const formatCurrency = (amount: string, currencyCode: string) => {
                      const val = parseFloat(amount);
                      if (currencyCode === "INR" || currencyCode === "inr") {
                        return "₹" + val.toLocaleString("en-IN", { minimumFractionDigits: 2 });
                      }
                      return val.toLocaleString("en-US", { style: "currency", currency: currencyCode });
                    };

                    const mapFulfillmentStatus = (status: string) => {
                      const mapping: Record<string, string> = {
                        UNFULFILLED: "Unfulfilled",
                        IN_PROGRESS: "In Progress",
                        FULFILLED: "Fulfilled",
                        IN_TRANSIT: "In Transit",
                        OUT_FOR_DELIVERY: "Out for Delivery",
                        DELIVERED: "Delivered",
                        RESTOCKED: "Restocked",
                        ON_HOLD: "On Hold",
                        PARTIALLY_FULFILLED: "Partially Fulfilled",
                      };
                      return mapping[status.toUpperCase()] || status;
                    };

                    const getFulfillmentBadgeClass = (status: string) => {
                      const s = status.toUpperCase();
                      if (s === "FULFILLED" || s === "DELIVERED") {
                        return "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800/40";
                      }
                      if (s === "UNFULFILLED" || s === "ON_HOLD") {
                        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40";
                      }
                      return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40";
                    };

                    const getUniqueTrackingInfo = (trackingList: FulfillmentTrackingInfo[]) => {
                      const seen = new Set<string>();
                      const unique: FulfillmentTrackingInfo[] = [];
                      for (const track of trackingList) {
                        const key = `${track.company || ""}-${track.number || ""}`;
                        if (track.number || track.company || track.url) {
                          if (!seen.has(key)) {
                            seen.add(key);
                            unique.push(track);
                          }
                        }
                      }
                      return unique;
                    };

                    return (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
                      >
                        {/* Order Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                          <div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 block font-semibold uppercase tracking-wider">Order Reference</span>
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                              {order.name}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" /> {orderDate}
                            </span>
                            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 flex items-center gap-1 font-medium">
                              <CreditCard className="w-3.5 h-3.5 text-gray-400" /> {order.financialStatus.toLowerCase()}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${getFulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                              {mapFulfillmentStatus(order.fulfillmentStatus)}
                            </span>
                          </div>
                        </div>

                        {/* Order Card Line Items */}
                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                          {order.lineItems.edges.map((lineItemEdge, lineIdx) => {
                            const item = lineItemEdge.node;
                            const itemImage = item.image?.url;
                            const itemPrice = item.totalPrice;
                            
                            return (
                              <div key={lineIdx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-start">
                                <div className="w-16 h-20 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 relative">
                                  {itemImage ? (
                                    <img
                                      src={itemImage}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-gray-300" />
                                  )}
                                  <span className="absolute -top-1 -right-1 bg-gray-850 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                                    {item.quantity}
                                  </span>
                                </div>

                                <div className="flex-grow min-w-0 text-xs">
                                  <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                                    {item.title}
                                  </h4>
                                  <div className="flex justify-between items-baseline mt-2">
                                    <span className="text-gray-400 font-medium">Qty: {item.quantity}</span>
                                    {itemPrice && (
                                      <span className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                                        {formatCurrency(itemPrice.amount, itemPrice.currencyCode)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Total */}
                        <div className="flex justify-between items-baseline pt-3 border-t border-gray-100 dark:border-slate-800 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          <span>Total Amount Paid:</span>
                          <span className="font-mono text-base font-black text-[#2874f0] dark:text-[#3b82f6]">
                            {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
                          </span>
                        </div>

                        {/* Fulfillment Shipment details with real tracking */}
                        {fulfillmentNodes.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-gray-400" />
                              Shipment Status & Tracking
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {fulfillmentNodes.map((ful, idx) => {
                                const uniqueTracking = getUniqueTrackingInfo(ful.trackingInfo || []);
                                
                                return (
                                  <div
                                    key={ful.id}
                                    className="p-3.5 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 rounded-lg text-xs space-y-2.5 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-slate-800/40">
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                          Shipment {fulfillmentNodes.length > 1 ? `#${idx + 1}` : ""}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                          ful.status.toUpperCase() === "SUCCESS"
                                            ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200/30"
                                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/30"
                                        }`}>
                                          {ful.status.toLowerCase()}
                                        </span>
                                      </div>

                                      {uniqueTracking.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                          {uniqueTracking.map((track, tIdx) => (
                                            <div key={tIdx} className="space-y-1 text-[11px]">
                                              {track.company && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-400 font-medium">Carrier:</span>
                                                  <span className="font-semibold text-gray-800 dark:text-gray-200">{track.company}</span>
                                                </div>
                                              )}
                                              {track.number && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-400 font-medium">Tracking #:</span>
                                                  <span className="font-mono font-semibold text-gray-850 dark:text-gray-250 select-all">{track.number}</span>
                                                </div>
                                              )}
                                              {track.url && (
                                                <div className="pt-2">
                                                  <a
                                                    href={track.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center gap-1.5 bg-[#2874f0] hover:bg-[#1a5ec7] text-white px-3.5 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm w-full sm:w-auto"
                                                  >
                                                    Track Order <ExternalLink className="w-3.5 h-3.5" />
                                                  </a>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-gray-450 dark:text-gray-500 text-[11px] mt-2 italic">
                                          Shipment processed. No tracking link available.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions Section */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
                Securely logs out of this device and terminates the active session on Shopify's authentication servers.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-650 text-gray-700 dark:text-gray-350 font-bold py-2.5 px-6 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 hover:scale-[1.01] transition-all cursor-pointer shadow-sm text-sm"
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
