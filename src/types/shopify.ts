/**
 * Why this file exists:
 * Global TypeScript definitions for Shopify Storefront API entities.
 * Ensures strict typing across all features relying on Shopify data.
 * It belongs to the shared types layer.
 */

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  image?: ShopifyImage;
  sku?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  options: {
    id: string;
    name: string;
    values: string[];
  }[];
  featuredImage: ShopifyImage | null;
  images: {
    edges: { node: ShopifyImage }[];
  };
  variants: {
    edges: { node: ShopifyVariant }[];
  };
  seo: {
    title: string | null;
    description: string | null;
  };
  productType: string;
  vendor: string;
  tags: string[];
  offersMetafield?: {
    value: string;
  } | null;
  updatedAt: string;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: {
    title: string | null;
    description: string | null;
  };
  updatedAt: string;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: ShopifyMoney;
  };
  merchandise: ShopifyVariant & {
    product: {
      id: string;
      handle: string;
      title: string;
      tags?: string[];
      offersMetafield?: {
        value: string;
      } | null;
    };
  };
  discountAllocations?: {
    discountedAmount: ShopifyMoney;
  }[];
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount: ShopifyMoney | null;
  };
  lines: {
    edges: { node: ShopifyCartLine }[];
  };
  discountCodes?: {
    code: string;
    applicable: boolean;
  }[];
}

export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}
