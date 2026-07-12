import { shopifyFetch } from "@/lib/shopify/graphql";
import { HeroCarousel } from "./HeroCarousel";

export const revalidate = 0;

const GET_BANNERS_AND_OFFERS = `
  query GetBannersAndOffers($first: Int!) {
    heroBanners: metaobjects(type: "hero_banner", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
              }
            }
            ... on GenericFile {
              url
            }
            ... on Collection {
              handle
            }
          }
        }
      }
    }
    offers: metaobjects(type: "offer", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
              }
            }
            ... on GenericFile {
              url
            }
          }
        }
      }
    }
  }
`;

export interface HeroBanner {
  id: string;
  handle: string;
  title?: string;
  subtitle?: string;
  discount?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  desktopImage?: string;
  mobileImage?: string;
  badge?: string;
  textColor?: string;
  ctaColor?: string;
  priority?: number;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  // Compatibility with mock/discount fields:
  code?: string;
  discountText?: string;
  minimumOrderText?: string;
  isAutomatic?: boolean;
}

export function getHeroBanners(nodes: any[]): HeroBanner[] {
  return nodes.map((node: any) => {
    const fields: Record<string, any> = {};
    node.fields.forEach((f: any) => {
      fields[f.key] = {
        value: f.value,
        reference: f.reference,
      };
    });

    const getVal = (key: string) => fields[key]?.value || undefined;

    const getFileUrl = (key: string) => {
      const ref = fields[key]?.reference;
      if (!ref) return undefined;
      if (ref.image?.url) return ref.image.url;
      if (ref.url) return ref.url;
      return undefined;
    };

    const getCollectionPath = (key: string) => {
      const ref = fields[key]?.reference;
      if (ref && ref.handle) {
        return `/collections/${ref.handle}`;
      }
      return undefined;
    };

    return {
      id: node.id,
      handle: node.handle,
      title: getVal("title"),
      subtitle: getVal("subtitle"),
      discount: getVal("discount"),
      discountText: getVal("discount") || getVal("subtitle") || "",
      description: getVal("description"),
      buttonText: getVal("button_text"),
      buttonUrl: getVal("link_url") || getCollectionPath("button_url") || getVal("button_url"),
      desktopImage: getFileUrl("desktop_image"),
      mobileImage: getFileUrl("mobile_image"),
      badge: getVal("badge"),
      textColor: getVal("text_color"),
      ctaColor: getVal("cta_color"),
      priority: getVal("priority") ? parseInt(getVal("priority"), 10) : undefined,
      active: getVal("active") !== "false",
      startDate: getVal("start_date"),
      endDate: getVal("end_date"),
    };
  });
}

export async function Hero() {
  let banners: HeroBanner[] = [];
  try {
    const res = await shopifyFetch<any>({
      query: GET_BANNERS_AND_OFFERS,
      variables: { first: 10 }
    });

    const heroBannersNodes = res.body?.heroBanners?.nodes || [];
    const offersNodes = res.body?.offers?.nodes || [];
    const combinedNodes = [...heroBannersNodes, ...offersNodes];
    const parsed = getHeroBanners(combinedNodes);

    const now = new Date();
    banners = parsed
      .filter((banner) => {
        if (banner.active === false) return false;
        
        // Filter out any banner using the accessories-hero image
        const imgUrl = banner.desktopImage || banner.mobileImage || "";
        if (imgUrl.includes("accessories-hero")) return false;

        if (banner.startDate) {
          const start = new Date(banner.startDate);
          if (!isNaN(start.getTime()) && start > now) return false;
        }
        if (banner.endDate) {
          const end = new Date(banner.endDate);
          if (!isNaN(end.getTime()) && end < now) return false;
        }
        return true;
      })
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  } catch (err) {
    console.error("Failed to query Hero Banners from Shopify Metaobjects:", err);
  }

  if (banners.length === 0) {
    return null;
  }

  return <HeroCarousel initialDiscounts={banners} />;
}
