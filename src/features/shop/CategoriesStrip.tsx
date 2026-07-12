import Link from "next/link";
import { Smartphone, BatteryCharging, Headphones, Shield, Box } from "lucide-react";

const categories = [
  { name: "All Tech", icon: Box, href: "/collections/all", bg: "bg-blue-50 border border-blue-200", color: "text-[#2874f0]" },
  { name: "Cases", icon: Smartphone, href: "/collections/cases", bg: "bg-gray-100", color: "text-gray-600" },
  { name: "Power & Mounts", icon: BatteryCharging, href: "/collections/power", bg: "bg-gray-100", color: "text-orange-500" },
  { name: "Premium Gear", icon: Shield, href: "/collections/premium", bg: "bg-gray-100", color: "text-red-400" },
  { name: "Acoustics & Storage", icon: Headphones, href: "/collections/audio", bg: "bg-gray-100", color: "text-teal-500" },
];

export function CategoriesStrip() {
  return (
    <div className="fk-navbar-strip bg-white shadow-xs border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-start lg:justify-center overflow-x-auto no-scrollbar gap-6 md:gap-10 pb-1">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link key={idx} href={cat.href} className="flex flex-col items-center shrink-0 group">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${cat.bg}`}>
                  <Icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <span className={`text-xs whitespace-nowrap font-semibold ${idx === 0 ? "text-[#2874f0]" : "text-gray-700"}`}>
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
