import { shopifyFetch } from '@/lib/shopify/graphql';

export interface ShopPolicy {
  title: string;
  body: string;
}

const HandleToPolicyMap = {
  'terms-of-service': 'termsOfService',
  'privacy-policy': 'privacyPolicy',
  'refund-policy': 'refundPolicy',
  'shipping-policy': 'shippingPolicy',
} as const;

export type PolicyHandle = keyof typeof HandleToPolicyMap;

export async function getShopPolicy(handle: PolicyHandle): Promise<ShopPolicy | null> {
  const policyField = HandleToPolicyMap[handle];
  if (!policyField) return null;

  const query = `
    query getShopPolicy {
      shop {
        ${policyField} {
          title
          body
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch<{ shop: Record<string, ShopPolicy | null> }>({
      query,
    });
    return res.body.shop[policyField];
  } catch (err) {
    console.error(`Failed to fetch shop policy field "${policyField}" for handle "${handle}":`, err);
    return null;
  }
}
