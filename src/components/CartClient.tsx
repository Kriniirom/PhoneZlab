"use client";

import React, { useState, useEffect } from "react";
import type { ShopifyCart } from "@/types/shopify";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  RotateCcw,
  Tag
} from "lucide-react";
import { updateCartItemAction, removeCartItemAction, updateCartDiscountCodesAction } from "@/features/cart/actions";
import { STORE_COUPONS } from "@/config/offers";

interface CartClientProps {
  initialCart: ShopifyCart | null;
}

export function CartClient({ initialCart }: CartClientProps) {
  const [cart, setCart] = useState<ShopifyCart | null>(initialCart);
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null);
  const [removingLineId, setRemovingLineId] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Sync cartId dynamically on mount
  useEffect(() => {
    if (cart) {
      localStorage.setItem("shopify_cart_id", cart.id);
      document.cookie = `shopify_cart_id=${cart.id}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [cart]);

  const handleUpdateQuantity = async (lineId: string, merchandiseId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(lineId);
      return;
    }
    setUpdatingLineId(lineId);
    try {
      const cartId = cart?.id;
      if (cartId) {
        const res = await updateCartItemAction(cartId, lineId, merchandiseId, newQuantity);
        if (res.success && res.cart) {
          setCart(res.cart);
          window.dispatchEvent(new Event("cart-updated"));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingLineId(null);
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    setRemovingLineId(lineId);
    try {
      const cartId = cart?.id;
      if (cartId) {
        const res = await removeCartItemAction(cartId, [lineId]);
        if (res.success && res.cart) {
          setCart(res.cart);
          window.dispatchEvent(new Event("cart-updated"));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingLineId(null);
    }
  };

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError(null);
    try {
      const cartId = cart?.id;
      if (cartId) {
        const currentCodes = cart?.discountCodes?.map(dc => dc.code) || [];
        const newCodes = [...currentCodes, discountCode.trim().toUpperCase()];
        
        const res = await updateCartDiscountCodesAction(cartId, newCodes);
        if (res.success && res.cart) {
          setCart(res.cart);
          setDiscountCode("");
          window.dispatchEvent(new Event("cart-updated"));
          
          const newlyApplied = res.cart.discountCodes?.find(
            dc => dc.code === discountCode.trim().toUpperCase()
          );
          if (newlyApplied && !newlyApplied.applicable) {
            setDiscountError(`Code "${discountCode.trim().toUpperCase()}" is invalid or not applicable.`);
          }
        } else {
          setDiscountError(res.error || "Failed to apply discount code.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setDiscountError("An error occurred while applying discount.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = async (codeToRemove: string) => {
    setIsApplyingDiscount(true);
    setDiscountError(null);
    try {
      const cartId = cart?.id;
      if (cartId) {
        const currentCodes = cart?.discountCodes?.map(dc => dc.code) || [];
        const newCodes = currentCodes.filter(code => code !== codeToRemove);
        
        const res = await updateCartDiscountCodesAction(cartId, newCodes);
        if (res.success && res.cart) {
          setCart(res.cart);
          window.dispatchEvent(new Event("cart-updated"));
        } else {
          setDiscountError(res.error || "Failed to remove discount code.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setDiscountError("An error occurred while removing discount.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleApplyDiscountWithCode = async (code: string) => {
    setIsApplyingDiscount(true);
    setDiscountError(null);
    try {
      const cartId = cart?.id;
      if (cartId) {
        const res = await updateCartDiscountCodesAction(cartId, [code.toUpperCase()]);
        if (res.success && res.cart) {
          setCart(res.cart);
          window.dispatchEvent(new Event("cart-updated"));
          
          const newlyApplied = res.cart.discountCodes?.find(
            dc => dc.code === code.toUpperCase()
          );
          if (newlyApplied && !newlyApplied.applicable) {
            setDiscountError(`Code "${code.toUpperCase()}" is invalid or not applicable.`);
          }
        } else {
          setDiscountError(res.error || "Failed to apply discount code.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setDiscountError("An error occurred while applying discount.");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const currency = cart?.cost.totalAmount.currencyCode || "INR";
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0
  });

  const cartLines = (cart?.lines.edges.map(edge => edge.node) || []).filter(
    line => line?.merchandise?.product && line?.merchandise?.price
  );

  const totalQuantity = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  
  const totalOriginalSubtotal = cartLines.reduce((sum, line) => {
    const price = parseFloat(line.merchandise.price.amount || "0");
    return sum + (price * line.quantity);
  }, 0);

  const shopifySubtotal = cart?.cost?.subtotalAmount ? parseFloat(cart.cost.subtotalAmount.amount) : totalOriginalSubtotal;
  const discountAmount = Math.max(0, totalOriginalSubtotal - shopifySubtotal);
  const taxAmount = cart?.cost.totalTaxAmount ? parseFloat(cart.cost.totalTaxAmount.amount) : 0;
  const totalAmount = cart?.cost.totalAmount ? parseFloat(cart.cost.totalAmount.amount) : (shopifySubtotal + taxAmount);

  if (!cart || cartLines.length === 0) {
    return (
      <div className="pt-24 pb-32 px-4 max-w-7xl mx-auto text-center">
        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Explore our premium collections to add accessory items to your cart.
        </p>
        <a 
          href="/products" 
          className="inline-block bg-[#2874f0] text-white px-8 py-3 rounded-sm font-semibold hover:bg-[#2874f0]/95 transition-colors shadow-sm text-sm uppercase tracking-wide"
        >
          Shop Products
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] pb-24 pt-6">
      <div className="max-w-[1240px] mx-auto px-2 md:px-4">
        
        <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>Shopping Cart</span>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">
            {totalQuantity} {totalQuantity === 1 ? "Item" : "Items"}
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* LEFT: Items List (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {cartLines.map((line) => {
              const product = line.merchandise.product;
              const variant = line.merchandise;
              const price = parseFloat(variant.price.amount);
              const comparePrice = variant.compareAtPrice ? parseFloat(variant.compareAtPrice.amount) : null;
              const image = variant.image?.url || product.handle; // fallback if no variant image
              
              const isUpdating = updatingLineId === line.id;
              const isRemoving = removingLineId === line.id;

              return (
                <div key={line.id} className="bg-white p-4 rounded-sm shadow-sm flex flex-col sm:flex-row gap-4 relative transition-opacity duration-200">
                  
                  {/* Product Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 flex items-center justify-center p-2 rounded-sm border border-gray-100 flex-shrink-0 mx-auto sm:mx-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={image} 
                      alt={product.title} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col text-center sm:text-left">
                    <a 
                      href={`/products/${product.handle}`}
                      className="text-sm font-semibold text-gray-800 hover:text-[#2874f0] transition-colors line-clamp-2"
                    >
                      {product.title}
                    </a>
                    
                    {/* Selected Options / Subtitles */}
                    {variant.title && variant.title !== "Default Title" && (
                      <span className="text-xs text-gray-500 mt-1">
                        Variant: <span className="font-medium text-gray-700">{variant.title}</span>
                      </span>
                    )}

                    {/* Price Block */}
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-2">
                      <span className="text-base font-bold text-gray-900">
                        {formatter.format(price)}
                      </span>
                      {comparePrice && comparePrice > price && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            {formatter.format(comparePrice)}
                          </span>
                          <span className="text-xs font-bold text-green-600">
                            {Math.round(((comparePrice - price) / comparePrice) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>

                    {/* Quantity Selector & Action row */}
                    <div className="mt-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-50">
                      
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-gray-200 rounded-sm bg-white">
                        <button 
                          onClick={() => handleUpdateQuantity(line.id, variant.id, line.quantity - 1)}
                          disabled={isUpdating || isRemoving}
                          className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs font-bold text-gray-800 w-10 text-center">
                          {line.quantity}
                        </span>
                        <button 
                          onClick={() => handleUpdateQuantity(line.id, variant.id, line.quantity + 1)}
                          disabled={isUpdating || isRemoving}
                          className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleRemoveItem(line.id)}
                        disabled={isRemoving}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 uppercase tracking-wide cursor-pointer py-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRemoving ? "Removing..." : "Remove"}
                      </button>

                    </div>
                  </div>

                  {/* Absolute Loader Overlay */}
                  {(isUpdating || isRemoving) && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-sm">
                      <div className="w-5 h-5 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                </div>
              );
            })}

            {/* Mobile Coupon Trigger Row (Visible on Mobile only) */}
            <div className="block lg:hidden bg-white p-3.5 rounded-sm shadow-sm">
              <button 
                onClick={() => setShowCouponModal(true)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#2874f0]" />
                  <span>Apply Coupon / Offers</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* RIGHT: Summary Details (4 cols) */}
          <div className="lg:col-span-4 sticky top-20 flex flex-col gap-3">
            
            {/* Coupon Card */}
            <div className="bg-white p-4 rounded-sm shadow-sm">
              <h2 className="text-xs font-bold text-[#878787] uppercase border-b border-gray-100 pb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>Apply Coupon</span>
              </h2>
              
              <form onSubmit={handleApplyDiscount} className="flex gap-2 mt-4">
                <input 
                  type="text"
                  placeholder="Enter coupon code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={isApplyingDiscount}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2874f0] uppercase placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={isApplyingDiscount || !discountCode.trim()}
                  className="bg-[#2874f0] hover:bg-[#1a5ec7] text-white text-xs font-bold px-4 py-2 rounded-sm disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isApplyingDiscount ? "Applying..." : "Apply"}
                </button>
              </form>

              {discountError && (
                <p className="text-xs text-red-500 font-semibold mt-2">{discountError}</p>
              )}

              {/* Display applied discount codes */}
              {cart?.discountCodes && cart.discountCodes.length > 0 && (
                <div className="mt-3 space-y-2">
                  {cart.discountCodes.map((dc) => (
                    <div 
                      key={dc.code} 
                      className={`flex items-center justify-between p-2.5 rounded-sm border text-xs font-semibold ${
                        dc.applicable 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{dc.code}</span>
                        <span>{dc.applicable ? "(Applied)" : "(Invalid)"}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveDiscount(dc.code)}
                        disabled={isApplyingDiscount}
                        className="text-gray-400 hover:text-gray-600 font-bold bg-transparent border-none cursor-pointer text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Browse available coupons */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 block mb-2.5 uppercase tracking-wider">Available Coupons</span>
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {STORE_COUPONS.map((coupon) => {
                    const isApplied = cart?.discountCodes?.some(dc => dc.code === coupon.code && dc.applicable);
                    
                    return (
                      <div key={coupon.code} className="border border-gray-100 rounded-sm bg-gray-50/50 p-2.5 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => isApplied ? handleRemoveDiscount(coupon.code) : handleApplyDiscountWithCode(coupon.code)}
                            disabled={isApplyingDiscount}
                            className={`font-bold uppercase tracking-wider cursor-pointer text-[10px] select-none ${
                              isApplied 
                                ? "text-red-500 hover:text-red-700" 
                                : "text-[#2874f0] hover:text-[#1a5ec7] disabled:opacity-40"
                            }`}
                          >
                            {isApplied ? "Remove" : "Apply"}
                          </button>
                        </div>
                        <span className="font-bold text-gray-800 mt-1">{coupon.title}</span>
                        <p className="text-[#878787] mt-0.5 leading-snug">{coupon.description}</p>
                        
                        {totalOriginalSubtotal < coupon.minimumOrder ? (
                          <span className="text-[10px] text-amber-600 font-medium mt-1 bg-amber-50 px-1 py-0.5 rounded-sm w-fit leading-none">
                            Add {formatter.format(coupon.minimumOrder - totalOriginalSubtotal)} more to unlock
                          </span>
                        ) : (
                          isApplied && discountAmount > 0 && (
                            <span className="text-[10px] text-green-600 font-bold mt-1 bg-green-50 px-1 py-0.5 rounded-sm w-fit leading-none">
                              ✓ You saved {formatter.format(discountAmount)}!
                            </span>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price details card */}
            <div className="bg-white p-4 rounded-sm shadow-sm">
              <h2 className="text-xs font-bold text-[#878787] uppercase border-b border-gray-100 pb-3">Price Details</h2>
              
              <div className="space-y-3.5 mt-4 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Price ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})</span>
                  <span>{formatter.format(totalOriginalSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>- {formatter.format(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Delivery Charges</span>
                  <span>FREE</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax Amount</span>
                    <span>{formatter.format(taxAmount)}</span>
                  </div>
                )}
                
                <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>{formatter.format(totalAmount)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <a
                href={cart.checkoutUrl}
                className="mt-6 w-full bg-[#fb641b] hover:bg-[#e05615] text-white py-3.5 rounded-sm font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md text-center"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </a>

            </div>

            {/* Safety Badges */}
            <div className="text-[11px] text-gray-500 flex flex-col gap-2 px-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2874f0] flex-shrink-0" />
                <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#2874f0] flex-shrink-0" />
                <span>Quick shipping. Free delivery eligible items.</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Mobile Bottom slide-up Coupon Drawer Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 lg:hidden">
          {/* Backdrop click close */}
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowCouponModal(false)} />
          
          <div className="bg-white w-full rounded-t-xl max-h-[85vh] flex flex-col p-4 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#2874f0]" />
                <span className="text-sm font-bold text-gray-900">Coupons & Offers</span>
              </div>
              <button 
                onClick={() => setShowCouponModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm bg-transparent border-none cursor-pointer p-1"
              >
                Close
              </button>
            </div>

            {/* Modal Scroll Container */}
            <div className="overflow-y-auto space-y-4 flex-grow pb-6 pr-1 scrollbar-thin">
              {/* Form Input */}
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Enter coupon code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={isApplyingDiscount}
                  className="flex-grow bg-gray-50 border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#2874f0] uppercase placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={isApplyingDiscount || !discountCode.trim()}
                  className="bg-[#2874f0] hover:bg-[#1a5ec7] text-white text-xs font-bold px-4 py-2 rounded-sm disabled:opacity-50 cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {discountError && (
                <p className="text-xs text-red-500 font-semibold">{discountError}</p>
              )}

              {/* Applied codes */}
              {cart?.discountCodes && cart.discountCodes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">Applied Coupons</span>
                  {cart.discountCodes.map((dc) => (
                    <div 
                      key={dc.code} 
                      className={`flex items-center justify-between p-2.5 rounded-sm border text-xs font-semibold ${
                        dc.applicable 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{dc.code}</span>
                        <span>{dc.applicable ? "(Applied)" : "(Invalid)"}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveDiscount(dc.code)}
                        disabled={isApplyingDiscount}
                        className="text-gray-400 hover:text-gray-600 font-bold bg-transparent border-none cursor-pointer text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupons List */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">Available Coupons</span>
                <div className="space-y-2.5">
                  {STORE_COUPONS.map((coupon) => {
                    const isApplied = cart?.discountCodes?.some(dc => dc.code === coupon.code && dc.applicable);
                    
                    return (
                      <div key={coupon.code} className="border border-gray-100 rounded-sm bg-gray-50/50 p-3.5 flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => {
                              if (isApplied) {
                                handleRemoveDiscount(coupon.code);
                              } else {
                                handleApplyDiscountWithCode(coupon.code);
                              }
                            }}
                            disabled={isApplyingDiscount}
                            className={`font-bold uppercase tracking-wider cursor-pointer text-xs select-none ${
                              isApplied 
                                ? "text-red-500 hover:text-red-700" 
                                : "text-[#2874f0] hover:text-[#1a5ec7] disabled:opacity-40"
                            }`}
                          >
                            {isApplied ? "Remove" : "Apply"}
                          </button>
                        </div>
                        <span className="font-bold text-gray-800 mt-1">{coupon.title}</span>
                        <p className="text-[#878787] mt-0.5 leading-snug">{coupon.description}</p>
                        
                        {totalOriginalSubtotal < coupon.minimumOrder ? (
                          <span className="text-[10px] text-amber-600 font-medium mt-1 bg-amber-50 px-1 py-0.5 rounded-sm w-fit leading-none">
                            Add {formatter.format(coupon.minimumOrder - totalOriginalSubtotal)} more to unlock
                          </span>
                        ) : (
                          isApplied && discountAmount > 0 && (
                            <span className="text-[10px] text-green-600 font-bold mt-1 bg-green-50 px-1 py-0.5 rounded-sm w-fit leading-none">
                              ✓ You saved {formatter.format(discountAmount)}!
                            </span>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
