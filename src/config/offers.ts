export interface CouponOffer {
  code: string;
  title: string;
  description: string;
  minimumOrder: number;
  discountValueText: string;
  terms: string;
}

export const STORE_COUPONS: CouponOffer[] = [
  {
    code: "PHONEZLAB10",
    title: "10% OFF",
    description: "Get 10% off on all products above ₹999 (Max discount ₹200)",
    minimumOrder: 999,
    discountValueText: "10% off",
    terms: "Minimum order ₹999. Maximum discount ₹200."
  },
  {
    code: "ZLABPLUS",
    title: "Flat ₹150 OFF",
    description: "Get flat ₹150 off on premium cases on orders above ₹1,999",
    minimumOrder: 1999,
    discountValueText: "₹150 off",
    terms: "Minimum order ₹1,999. Applicable on premium cases."
  },
  {
    code: "FREESHIP",
    title: "Free Shipping",
    description: "Unlock free shipping on orders above ₹1,499",
    minimumOrder: 1499,
    discountValueText: "Free Shipping",
    terms: "Minimum order ₹1,499. Automatically applied to delivery charges."
  }
];
