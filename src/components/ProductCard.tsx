import Link from "next/link";
import type { ShopifyProduct } from "@/types/shopify";

interface ProductCardProps {
  product: ShopifyProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstVariant = product.variants.edges[0]?.node;
  const priceAmount = parseFloat(firstVariant?.price.amount || "0");
  const compareAtPriceAmount = firstVariant?.compareAtPrice?.amount ? parseFloat(firstVariant.compareAtPrice.amount) : null;
  const currency = firstVariant?.price.currencyCode || "INR";
  const imageUrl = product.featuredImage?.url || "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop";

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0
  });

  const discountPercent = compareAtPriceAmount && compareAtPriceAmount > priceAmount
    ? Math.round(((compareAtPriceAmount - priceAmount) / compareAtPriceAmount) * 100)
    : null;

  return (
    <Link href={`/products/${product.handle}`} className="block h-full">
      <div className="fk-card h-full flex flex-col bg-white">

        <div className="relative aspect-square mb-3 bg-gray-50 flex items-center justify-center p-0 overflow-hidden w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex flex-col flex-grow px-3 pb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {product.productType || "Accessories"}
          </span>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 hover:text-[#2874f0] transition-colors">
            {product.title}
          </h3>
          <div className="mt-auto flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{formatter.format(priceAmount)}</span>
            {compareAtPriceAmount && compareAtPriceAmount > priceAmount && (
              <>
                <span className="text-sm text-gray-500 line-through">{formatter.format(compareAtPriceAmount)}</span>
                {discountPercent && discountPercent > 0 && (
                  <span className="text-xs font-bold text-green-600">{discountPercent}% off</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
