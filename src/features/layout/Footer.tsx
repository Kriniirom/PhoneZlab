import Link from "next/link";
import { ShieldCheck, Truck, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
        {/* Brand Info Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 hover:text-[#2874f0] transition-colors duration-150">
            PhoneZlab
          </Link>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            Premium accessories built for modern devices.
          </p>
        </div>

        {/* Shop Links Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold tracking-wider text-gray-900 uppercase">
            Shop
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/products" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?sort=CREATED_AT&reverse=true" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/products?sort=BEST_SELLING" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                Best Sellers
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold tracking-wider text-gray-900 uppercase">
            Support
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/faq" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/policies/refund-policy" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                Shipping & Returns
              </Link>
            </li>
            <li>
              <Link href="#" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Links Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold tracking-wider text-gray-900 uppercase">
            Legal
          </h4>
          <ul className="space-y-2.5">
            <li>
              <Link href="/policies/privacy-policy" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms-of-service" className="text-[15px] text-gray-500 hover:text-[#2874f0] transition-colors duration-150">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar Container */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Copyright info */}
        <div className="text-xs text-gray-400">
          &copy; 2026 PhoneZlab. All rights reserved.
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            Secure Checkout
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-gray-400" />
            Fast Shipping
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-gray-400" />
            Customer Support
          </span>
        </div>

      </div>
    </footer>
  );
}
export default Footer;
