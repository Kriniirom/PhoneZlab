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
  ChevronRight,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomerProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  orders: OrderNode[];
}

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
    IN_PROGRESS: "Processing",
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

const getFulfillmentConfig = (status: string) => {
  const s = status.toUpperCase();
  if (s === "FULFILLED" || s === "DELIVERED") {
    return {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800/50",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }
  if (s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY" || s === "IN_PROGRESS" || s === "PARTIALLY_FULFILLED") {
    return {
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800/50",
      dot: "bg-blue-500",
      icon: Truck,
    };
  }
  return {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/50",
    dot: "bg-amber-500",
    icon: Clock,
  };
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
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
        setError(err.message || "Session expired. Please sign in again.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const getInitials = () => {
    if (!profile) return "U";
    const first = profile.firstName?.charAt(0) || "";
    const last = profile.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Shopify Customer"
    : "";

  const totalSpent = profile?.orders?.reduce((sum, o) => sum + parseFloat(o.totalPrice?.amount || "0"), 0) ?? 0;
  void totalSpent; // retained for potential future use

  /* ── Loading ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center bg-[#f1f3f6] dark:bg-[#0e0e10]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2874f0] to-[#1a5ec7] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">Loading your profile…</p>
        </div>
      </main>
    );
  }

  /* ── Error ────────────────────────────────────────────────────── */
  if (error) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center bg-[#f1f3f6] dark:bg-[#0e0e10] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#1a1a1e] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-8 max-w-sm w-full text-center space-y-5"
        >
          <div className="mx-auto w-14 h-14 bg-amber-50 dark:bg-amber-950/40 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Error</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{error}</p>
          </div>
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={() => router.replace("/login")}
              className="w-full bg-[#2874f0] hover:bg-[#1a5ec7] text-white py-2.5 px-6 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.01]"
            >
              Sign In Again
            </button>
            <button
              onClick={() => logoutCustomer()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs font-medium py-1 transition-colors cursor-pointer bg-transparent border-none"
            >
              Clear Session &amp; Logout
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  /* ── Main Profile ─────────────────────────────────────────────── */
  return (
    <main className="min-h-[80vh] bg-[#f1f3f6] dark:bg-[#0e0e10] pb-16">

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#1a4fd6] via-[#2874f0] to-[#5b8ef5] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-32 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 pt-8 pb-20 md:px-8 relative z-10">
          {/* Back nav */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium mb-6 transition-colors cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Store
          </button>

          {/* Avatar + Name Row */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-18 h-18 rounded-2xl bg-white text-[#2874f0] font-black text-2xl flex items-center justify-center shadow-xl shadow-black/20 border-2 border-white/30 select-none w-[72px] h-[72px]">
                {getInitials()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl leading-tight">{fullName}</h1>
              <p className="text-white/70 text-xs mt-1 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ffc200]" />
                Verified Member
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Tab Nav */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-6">
        <div className="bg-white dark:bg-[#1a1a1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-1.5 flex gap-1.5">
          {(["info", "orders"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer capitalize ${
                activeTab === tab
                  ? "bg-[#2874f0] text-white shadow-md shadow-blue-500/25"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              {tab === "info" ? "My Account" : `Orders (${profile?.orders?.length ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-4">
        <AnimatePresence mode="wait">
          {activeTab === "info" ? (
            <motion.div
              key="info"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {/* Account Info Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1a1a1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
                  <h2 className="font-bold text-gray-900 dark:text-white text-sm">Account Details</h2>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                  {/* Static fields */}
                  {[
                    { icon: User, label: "First Name", value: profile?.firstName || "Not provided" },
                    { icon: User, label: "Last Name", value: profile?.lastName || "Not provided" },
                    { icon: Mail, label: "Email Address", value: profile?.email || "Not provided" },
                  ].map((row, i) => (
                    <a
                      key={i}
                      href={`https://shopify.com/${process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID || "84050804957"}/account/profile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                        <row.icon className="w-4 h-4 text-[#2874f0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{row.label}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5 truncate">{row.value}</p>
                      </div>
                      <span className="text-xs text-[#2874f0] opacity-0 group-hover:opacity-100 transition-opacity font-bold flex items-center gap-1 mr-1">
                        Edit <ExternalLink className="w-3 h-3" />
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    </a>
                  ))}

                    <a
                      href={`https://shopify.com/${process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID || "84050804957"}/account/profile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                        <PhoneIcon className="w-4 h-4 text-[#2874f0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5 truncate">{profile?.phone || "Not provided"}</p>
                      </div>
                      <span className="text-xs text-[#2874f0] opacity-0 group-hover:opacity-100 transition-opacity font-bold flex items-center gap-1 mr-1">
                        Edit <ExternalLink className="w-3 h-3" />
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    </a>
                  </div>
              </motion.div>

              {/* Shopify Security Notice */}
              <motion.div
                variants={itemVariants}
                className="bg-gray-50 dark:bg-white/5 rounded-2xl px-5 py-4 border border-dashed border-gray-200 dark:border-white/10 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Security Setting</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">Secure Account Management</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">
                    Phone number and login credentials are encrypted and verified through your secure Shopify ID. To modify your security settings or change your contact details, please update them directly in your{" "}
                    <a
                      href={`https://shopify.com/${process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_SHOP_ID || "84050804957"}/account/profile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2874f0] hover:underline font-semibold"
                    >
                      Shopify Customer Account portal
                    </a>.
                  </p>
                </div>
              </motion.div>

              {/* Delivery Hint */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1a1a1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 px-5 py-4 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Delivery Region</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">Manipur & Northeast India</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed">Orders are fulfilled from Delhi. Local delivery timelines may vary.</p>
                </div>
              </motion.div>

              {/* Sign Out */}
              <motion.div variants={itemVariants} className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-white dark:bg-[#1a1a1e] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-white/5 shadow-sm"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => logoutCustomer()}
                  className="flex-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-500 border border-red-200 dark:border-red-800/40 hover:border-red-500 text-red-600 dark:text-red-400 hover:text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {!profile?.orders || profile.orders.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-[#1a1a1e] rounded-2xl border border-gray-100 dark:border-white/5 p-12 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="font-bold text-gray-700 dark:text-gray-300">No orders yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-5">When you place an order, it will appear here.</p>
                  <button
                    onClick={() => router.push("/")}
                    className="bg-[#2874f0] text-white py-2.5 px-6 rounded-xl font-semibold text-sm hover:bg-[#1a5ec7] transition-all cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    Start Shopping
                  </button>
                </motion.div>
              ) : (
                profile.orders.map((order, orderIdx) => {
                  const orderDate = new Date(order.processedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const fulfillmentNodes = order.fulfillments?.edges?.map((edge) => edge.node) || [];
                  const statusConfig = getFulfillmentConfig(order.fulfillmentStatus);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={order.id}
                      variants={itemVariants}
                      className="bg-white dark:bg-[#1a1a1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="px-5 py-4 flex items-center justify-between gap-3 bg-gray-50/60 dark:bg-white/2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Order</p>
                          <p className="font-extrabold text-gray-900 dark:text-white text-sm mt-0.5">{order.name}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/8 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium border border-gray-200 dark:border-white/8">
                            <Calendar className="w-3 h-3" />
                            {orderDate}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                            <StatusIcon className="w-3 h-3" />
                            {mapFulfillmentStatus(order.fulfillmentStatus)}
                          </span>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="px-5 py-3 divide-y divide-gray-50 dark:divide-white/5">
                        {order.lineItems.edges.map((lineItemEdge, lineIdx) => {
                          const item = lineItemEdge.node;
                          const itemImage = item.image?.url;
                          return (
                            <div key={lineIdx} className="flex items-center gap-4 py-3 first:pt-1 last:pb-1">
                              <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/8 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                {itemImage ? (
                                  <img
                                    src={itemImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                )}
                                <span className="absolute -top-1.5 -right-1.5 bg-[#2874f0] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1a1a1e] min-w-[18px] min-h-[18px] px-1">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">{item.title}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-mono font-bold text-gray-900 dark:text-white text-sm flex-shrink-0">
                                {formatCurrency(item.totalPrice.amount, item.totalPrice.currencyCode)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Footer — Total & Payment */}
                      <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                          <CreditCard className="w-3.5 h-3.5" />
                          {order.financialStatus.charAt(0) + order.financialStatus.slice(1).toLowerCase()}
                        </span>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">Total Paid</p>
                          <p className="font-black text-[#2874f0] dark:text-[#5b8ef5] text-base font-mono leading-tight">
                            {formatCurrency(order.totalPrice.amount, order.totalPrice.currencyCode)}
                          </p>
                        </div>
                      </div>

                      {/* Tracking Section */}
                      {fulfillmentNodes.length > 0 && (
                        <div className="px-5 pb-4 pt-3 border-t border-gray-100 dark:border-white/5 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            Shipment Tracking
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {fulfillmentNodes.map((ful, idx) => {
                              const uniqueTracking = getUniqueTrackingInfo(ful.trackingInformation || []);
                              const fulConfig = getFulfillmentConfig(ful.status);
                              return (
                                <div
                                  key={ful.id}
                                  className="rounded-xl p-3.5 border bg-gray-50 dark:bg-white/3 border-gray-200 dark:border-white/8 space-y-2.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                      Shipment{fulfillmentNodes.length > 1 ? ` #${idx + 1}` : ""}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${fulConfig.bg} ${fulConfig.color} ${fulConfig.border} border uppercase tracking-wide`}>
                                      {ful.status.toLowerCase()}
                                    </span>
                                  </div>
                                  {uniqueTracking.length > 0 ? (
                                    <div className="space-y-1.5">
                                      {uniqueTracking.map((track, tIdx) => (
                                        <div key={tIdx} className="space-y-1">
                                          {track.company && (
                                            <div className="flex justify-between items-center text-[11px]">
                                              <span className="text-gray-400">Carrier</span>
                                              <span className="font-semibold text-gray-700 dark:text-gray-300">{track.company}</span>
                                            </div>
                                          )}
                                          {track.number && (
                                            <div className="flex justify-between items-center text-[11px]">
                                              <span className="text-gray-400">Tracking #</span>
                                              <span className="font-mono font-bold text-gray-800 dark:text-gray-200 select-all text-[10px]">{track.number}</span>
                                            </div>
                                          )}
                                          {track.url && (
                                            <a
                                              href={track.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="mt-2 flex items-center justify-center gap-1.5 w-full bg-[#2874f0] hover:bg-[#1a5ec7] text-white px-3 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-colors shadow-sm shadow-blue-500/20"
                                            >
                                              Track Package <ExternalLink className="w-3 h-3" />
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">
                                      Shipment processed — tracking link not yet available.
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
