export interface CouponOffer {
  code: string;
  title: string;
  description: string;
  minimumOrder: number;
}

/**
 * Parses coupon offers dynamically from a Shopify Product's tags or metafield values.
 * Format for product tags: "coupon:CODE | TITLE | DESCRIPTION | MINIMUM_ORDER"
 * Format for custom.offers JSON metafield: array of objects containing code, title, description, minimumOrder
 */
export function parseCouponsFromProduct(product: any): CouponOffer[] {
  const coupons: CouponOffer[] = [];
  if (!product) return coupons;

  // 1. Parse from tags (e.g. "coupon:PHONEZLAB10 | 10% OFF | 10% off up to ₹200 | 999")
  if (product.tags && Array.isArray(product.tags)) {
    product.tags.forEach((tag: string) => {
      if (tag.startsWith("coupon:")) {
        const content = tag.substring(7).trim();
        const parts = content.split("|");
        if (parts.length >= 3) {
          coupons.push({
            code: parts[0].trim().toUpperCase(),
            title: parts[1].trim(),
            description: parts[2].trim(),
            minimumOrder: parts[3] ? parseFloat(parts[3].trim()) || 0 : 0
          });
        }
      }
    });
  }

  // 2. Parse from custom.offers metafield
  const metafieldValue = product.offersMetafield?.value || product.offersMetafield;
  if (metafieldValue && typeof metafieldValue === "string") {
    try {
      const val = metafieldValue.trim();
      if (val.startsWith("[") && val.endsWith("]")) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (item && typeof item === "object" && item.code) {
              coupons.push({
                code: item.code.trim().toUpperCase(),
                title: item.title || item.code,
                description: item.description || "",
                minimumOrder: item.minimumOrder ? parseFloat(item.minimumOrder) || 0 : 0
              });
            }
          });
        }
      } else {
        val.split("\n").forEach((line: string) => {
          if (line.trim().startsWith("coupon:")) {
            const content = line.substring(7).trim();
            const parts = content.split("|");
            if (parts.length >= 3) {
              coupons.push({
                code: parts[0].trim().toUpperCase(),
                title: parts[1].trim(),
                description: parts[2].trim(),
                minimumOrder: parts[3] ? parseFloat(parts[3].trim()) || 0 : 0
              });
            }
          }
        });
      }
    } catch (e) {
      console.error("Failed to parse coupons metafield value:", e);
    }
  }

  return coupons;
}
