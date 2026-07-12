"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { ShopifyProduct, ShopifyVariant } from "@/types/shopify";
import { 
  ShoppingBag, 
  Zap, 
  Star, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  Heart, 
  Share2, 
  Tag,
  Check,
  Plus,
  Minus,
  Info
} from "lucide-react";
import { createCartAction, addCartItemAction } from "@/features/cart/actions";
import { ProductOffers } from "./ProductOffers";
import { trackRecentlyViewed } from "@/features/search/tracking/recentlyViewed";

interface ProductDetailsClientProps {
  product: ShopifyProduct;
  relatedProducts?: ShopifyProduct[];
}

export function ProductDetailsClient({ product, relatedProducts = [] }: ProductDetailsClientProps) {
  const images = useMemo(() => product.images.edges.map((edge) => edge.node), [product.images.edges]);
  const variants = useMemo(() => product.variants.edges.map((edge) => edge.node), [product.variants.edges]);

  // Fallback image
  const defaultImage = product.featuredImage?.url || "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop";

  // Initial State: Find the first available variant, or fallback to the first variant
  const initialVariant = variants.find((v) => v.availableForSale) || variants[0];

  // Set up selected options state based on initial variant
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const opts: Record<string, string> = {};
    if (initialVariant) {
      initialVariant.selectedOptions.forEach((opt) => {
        opts[opt.name] = opt.value;
      });
    } else {
      product.options.forEach((opt) => {
        if (opt.values.length > 0) {
          opts[opt.name] = opt.values[0];
        }
      });
    }
    return opts;
  });

  const [activeVariant, setActiveVariant] = useState<ShopifyVariant | undefined>(initialVariant);
  const [activeImageUrl, setActiveImageUrl] = useState<string>(activeVariant?.image?.url || defaultImage);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  
  // Loading and notification states
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Hook to select matching variant whenever selected options change
  useEffect(() => {
    const matchingVariant = variants.find((variant) => {
      return variant.selectedOptions.every((opt) => {
        return selectedOptions[opt.name] === opt.value;
      });
    });

    setActiveVariant(matchingVariant);
    if (matchingVariant?.image?.url) {
      setActiveImageUrl(matchingVariant.image.url);
    }
  }, [selectedOptions, variants]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Track recently viewed product on mount/change
  useEffect(() => {
    if (product && product.id) {
      trackRecentlyViewed(product);
    }
  }, [product]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  // Cart operations
  const handleAddToCart = async () => {
    if (!activeVariant) {
      showToast("Please select options first", "error");
      return;
    }
    if (!activeVariant.availableForSale) {
      showToast("Selected item is out of stock", "error");
      return;
    }

    setAddingToCart(true);
    try {
      let cartId = localStorage.getItem("shopify_cart_id");
      if (!cartId) {
        const match = document.cookie.match(/shopify_cart_id=([^;]+)/);
        cartId = match ? match[1] : null;
      }

      let res;
      if (cartId) {
        res = await addCartItemAction(cartId, activeVariant.id, quantity);
      } else {
        res = await createCartAction(activeVariant.id, quantity);
      }

      if (res.success && res.cart) {
        localStorage.setItem("shopify_cart_id", res.cart.id);
        document.cookie = `shopify_cart_id=${res.cart.id}; path=/; max-age=31536000; SameSite=Lax`;
        showToast("Added to Cart successfully! 🛒");
        
        // Dispatch custom event to let Navbar or other components listen to cart updates
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        showToast(res.error || "Failed to add to cart. Please try again.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error adding to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!activeVariant) {
      showToast("Please select options first", "error");
      return;
    }
    if (!activeVariant.availableForSale) {
      showToast("Selected item is out of stock", "error");
      return;
    }

    setBuyingNow(true);
    try {
      // Create a new direct checkout cart
      const res = await createCartAction(activeVariant.id, quantity);
      if (res.success && res.cart?.checkoutUrl) {
        showToast("Redirecting to Shopify checkout...");
        window.location.href = res.cart.checkoutUrl;
      } else {
        showToast("Checkout failed. Please try again.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error initiating checkout", "error");
    } finally {
      setBuyingNow(false);
    }
  };

  // Price formatting
  const priceAmount = parseFloat(activeVariant?.price.amount || product.variants.edges[0]?.node.price.amount || "0");
  const compareAtPriceAmount = activeVariant?.compareAtPrice?.amount 
    ? parseFloat(activeVariant.compareAtPrice.amount) 
    : product.variants.edges[0]?.node.compareAtPrice?.amount 
      ? parseFloat(product.variants.edges[0].node.compareAtPrice.amount)
      : null;

  const currency = activeVariant?.price.currencyCode || product.variants.edges[0]?.node.price.currencyCode || "INR";
  
  const formatter = new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: currency, 
    maximumFractionDigits: 0 
  });

  const discountPercent = compareAtPriceAmount && compareAtPriceAmount > priceAmount
    ? Math.round(((compareAtPriceAmount - priceAmount) / compareAtPriceAmount) * 100)
    : null;

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-16 pt-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 ${
          toastType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toastType === "success" ? <Check className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto px-2 md:px-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-[11px] text-[#878787] mb-3 overflow-x-auto whitespace-nowrap py-1">
          <a href="/" className="hover:text-[#2874f0]">Home</a>
          <ChevronRight className="w-3 h-3 text-[#878787]" />
          <a href="/products" className="hover:text-[#2874f0]">Products</a>
          <ChevronRight className="w-3 h-3 text-[#878787]" />
          <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* Main Product Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white p-3 md:p-6 rounded-sm shadow-sm">
          
          {/* LEFT COLUMN: Gallery & Buttons (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="sticky top-20 flex flex-col gap-4">
              
              {/* Media Gallery Grid */}
              <div className="flex flex-col-reverse md:flex-row gap-3">
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[450px] scrollbar-thin py-1 md:py-0">
                    {images.map((img, i) => (
                      <button 
                        key={i}
                        onClick={() => setActiveImageUrl(img.url)}
                        className={`w-14 h-14 md:w-16 md:h-16 border rounded p-1 flex-shrink-0 flex items-center justify-center bg-white transition-all cursor-pointer ${
                          activeImageUrl === img.url 
                            ? "border-[#2874f0] ring-1 ring-[#2874f0]/20 scale-102" 
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img.url} 
                          alt={img.altText || `Thumbnail ${i+1}`}
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Large Image Container */}
                <div className="flex-1 relative aspect-square border border-gray-100 flex items-center justify-center p-6 bg-white select-none group">
                  <div className="absolute top-3 left-3 bg-[#2874f0] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 z-10 shadow-sm">
                    ASSURED <span className="text-white">+</span>
                  </div>
                  
                  <button 
                    onClick={() => setWishlisted(!wishlisted)} 
                    className="absolute top-3 right-3 p-2 bg-white rounded-full border border-gray-200 shadow-sm text-gray-400 hover:text-red-500 hover:scale-105 transition-all z-10 cursor-pointer"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  </button>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeImageUrl} 
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !activeVariant?.availableForSale}
                  className={`flex-1 py-3.5 px-4 rounded-sm font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shadow transition-colors ${
                    !activeVariant?.availableForSale
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#ffc200] hover:bg-[#f0b600] text-black"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 fill-current" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow || !activeVariant?.availableForSale}
                  className={`flex-1 py-3.5 px-4 rounded-sm font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer shadow transition-colors ${
                    !activeVariant?.availableForSale
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-[#fb641b] hover:bg-[#e05615] text-white"
                  }`}
                >
                  <Zap className="w-5 h-5 fill-current" />
                  {buyingNow ? "Redirecting..." : "Buy Now"}
                </button>
              </div>

              {/* Assured text and quick benefits */}
              <div className="mt-4 text-xs text-gray-500 flex justify-between px-2 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#2874f0]" /> Free Delivery</span>
                <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-[#2874f0]" /> 7 Days Replacement</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#2874f0]" /> 1 Year Warranty</span>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Product Info & Selectors (7 cols) */}
          <div className="lg:col-span-7 flex flex-col lg:pl-4 mt-6 lg:mt-0">
            
            {/* Title / Header */}
            <div>
              <span className="text-[#878787] text-xs font-semibold uppercase tracking-wider">
                {product.vendor || "PhoneZlab"}{product.productType ? ` • ${product.productType}` : ""}
              </span>
              <h1 className="text-xl md:text-2xl font-medium text-gray-900 mt-1 leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Price display */}
            <div className="mt-4 bg-gray-50 p-4 rounded-sm border border-gray-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatter.format(priceAmount)}
                </span>
                {compareAtPriceAmount && compareAtPriceAmount > priceAmount && (
                  <>
                    <span className="text-base text-gray-500 line-through">
                      {formatter.format(compareAtPriceAmount)}
                    </span>
                    {discountPercent && discountPercent > 0 && (
                      <span className="text-base font-bold text-green-600">
                        {discountPercent}% off
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Inclusive of all taxes
              </div>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              <span className="text-sm font-semibold text-gray-700 mr-2">Availability:</span>
              {activeVariant?.availableForSale ? (
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">In Stock</span>
              ) : (
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {activeVariant?.availableForSale && (
              <div className="mt-6 flex items-center gap-4 border-b border-gray-100 pb-5">
                <span className="text-sm font-bold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 text-gray-600 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-sm text-gray-800">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 text-gray-600 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Variant Options Selectors */}
            {product.options && product.options.length > 0 && product.options.map((option) => (
              // If it's a default title option with value "Default Title", hide selector
              !(option.name === "Title" && option.values.includes("Default Title")) && (
                <div key={option.id} className="mt-6 border-b border-gray-100 pb-5">
                  <span className="text-sm font-bold text-gray-700 block mb-2">{option.name}:</span>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((val) => {
                      const isSelected = selectedOptions[option.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleOptionChange(option.name, val)}
                          className={`px-4 py-2 text-xs font-semibold border rounded-sm tracking-wide cursor-pointer transition-all ${
                            isSelected 
                              ? "border-[#2874f0] bg-[#2874f0]/5 text-[#2874f0] font-bold shadow-sm" 
                              : "border-gray-200 hover:border-gray-400 text-gray-700 bg-white"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ))}

            {/* Product Offers Component */}
            <ProductOffers product={product} />

            {/* Description accordion / section */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Product Description</h2>
              <div 
                className="text-sm text-gray-600 leading-relaxed space-y-2 product-description-html"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
              />
            </div>

            {/* Custom Specifications table from Shopify data */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Specifications</h2>
              <div className="border border-gray-100 rounded-sm">
                <div className="grid grid-cols-3 border-b border-gray-50 bg-gray-50/50 p-2.5 text-xs font-bold text-[#878787]">
                  <span className="col-span-1">Attribute</span>
                  <span className="col-span-2">Details</span>
                </div>
                {product.vendor && (
                  <div className="grid grid-cols-3 border-b border-gray-50 p-2.5 text-xs text-gray-800">
                    <span className="col-span-1 font-semibold text-gray-500">Brand</span>
                    <span className="col-span-2">{product.vendor}</span>
                  </div>
                )}
                {product.productType && (
                  <div className="grid grid-cols-3 border-b border-gray-50 p-2.5 text-xs text-gray-800">
                    <span className="col-span-1 font-semibold text-gray-500">Category</span>
                    <span className="col-span-2">{product.productType}</span>
                  </div>
                )}
                {product.options && product.options.map((opt) => (
                  !(opt.name === "Title" && opt.values.includes("Default Title")) && (
                    <div key={opt.id} className="grid grid-cols-3 border-b border-gray-50 p-2.5 text-xs text-gray-800">
                      <span className="col-span-1 font-semibold text-gray-500">{opt.name} Options</span>
                      <span className="col-span-2">{opt.values.join(", ")}</span>
                    </div>
                  )
                ))}
                {activeVariant?.sku && (
                  <div className="grid grid-cols-3 border-b border-gray-50 p-2.5 text-xs text-gray-800">
                    <span className="col-span-1 font-semibold text-gray-500">SKU</span>
                    <span className="col-span-2">{activeVariant.sku}</span>
                  </div>
                )}
                {activeVariant?.weight && activeVariant.weight > 0 ? (
                  <div className="grid grid-cols-3 border-b border-gray-50 p-2.5 text-xs text-gray-800">
                    <span className="col-span-1 font-semibold text-gray-500">Weight</span>
                    <span className="col-span-2">{activeVariant.weight} {activeVariant.weightUnit ? activeVariant.weightUnit.toLowerCase() : "kg"}</span>
                  </div>
                ) : null}
                <div className="grid grid-cols-3 p-2.5 text-xs text-gray-800">
                  <span className="col-span-1 font-semibold text-gray-500">Warranty</span>
                  <span className="col-span-2">Standard Manufacturer Warranty</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-5">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relProduct) => {
                const relPrice = parseFloat(relProduct.variants.edges[0]?.node.price.amount || "0");
                const relImg = relProduct.featuredImage?.url || defaultImage;
                return (
                  <a 
                    href={`/products/${relProduct.handle}`} 
                    key={relProduct.id}
                    className="group border border-gray-100 hover:border-gray-200 p-3 rounded-sm flex flex-col h-full bg-white transition-all hover:shadow-sm"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-2 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={relImg} 
                        alt={relProduct.title} 
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-102 transition-transform"
                      />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#2874f0] transition-colors mb-2">
                      {relProduct.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900">{formatter.format(relPrice)}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
