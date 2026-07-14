import type { Metadata } from 'next';
import type { ShopifyProduct } from '@/types/shopify';
import type { JudgemeReviewsData } from '@/features/reviews/api';

/**
 * Resolves the primary production site URL.
 * Falls back to the storefront domain environment variable, or a default domain.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (shopifyDomain) {
    return `https://${shopifyDomain}`;
  }
  
  return 'https://phonezlab.com';
}

interface MetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath: string; // Absolute path starting with /, e.g. "/products/my-product" or "/"
  imageUrl?: string;
  imageAlt?: string;
  noIndex?: boolean;
  ogType?: 'website' | 'article';
}

/**
 * Reusable metadata generator for standardizing document head tags.
 */
export function generatePageMetadata(options: MetadataOptions): Metadata {
  const siteUrl = getSiteUrl();
  const absoluteUrl = `${siteUrl}${options.canonicalPath}`;
  const defaultTitle = "PhoneZlab | Luxury Accessories";
  const defaultDescription = "Premium luxury accessories and cases for the modern elite.";
  
  const title = options.title ? `${options.title} | PhoneZlab` : defaultTitle;
  const description = options.description || defaultDescription;
  
  const meta: Metadata = {
    title,
    description,
    keywords: options.keywords || [
      "luxury cases",
      "premium accessories",
      "iphone accessories",
      "luxury phone covers",
      "premium phone skins",
      "phonezlab"
    ],
    alternates: {
      canonical: absoluteUrl,
    },
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      type: (options.ogType === 'article' ? 'article' : 'website'),
      siteName: 'PhoneZlab',
      images: options.imageUrl 
        ? [
            {
              url: options.imageUrl,
              alt: options.imageAlt || title,
              width: 800,
              height: 600,
            }
          ]
        : [
            {
              url: `${siteUrl}/og-image.png`,
              alt: 'PhoneZlab Luxury Accessories',
              width: 1200,
              height: 630,
            }
          ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: options.imageUrl ? [options.imageUrl] : [`${siteUrl}/og-image.png`],
    }
  };
  
  return meta;
}

/**
 * Generates Organization schema markup.
 */
export function getOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": "PhoneZlab",
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/logo.png`,
      "caption": "PhoneZlab Logo"
    },
    "sameAs": [
      "https://facebook.com/phonezlab",
      "https://instagram.com/phonezlab",
      "https://twitter.com/phonezlab"
    ]
  };
}

/**
 * Generates Website schema markup with SearchAction.
 */
export function getWebsiteSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "url": siteUrl,
    "name": "PhoneZlab",
    "publisher": {
      "@id": `${siteUrl}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

interface BreadcrumbItem {
  name: string;
  item: string; // URL path relative, e.g. "/products"
}

/**
 * Generates Breadcrumb Schema markup dynamically.
 */
export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item.startsWith('http') ? item.item : `${siteUrl}${item.item}`
    }))
  };
}

/**
 * Generates Product Schema markup dynamically, incorporating variant details,
 * pricing limits, stock availability, and reviews (if provided).
 */
export function getProductSchema(product: ShopifyProduct, reviewsData?: JudgemeReviewsData) {
  const siteUrl = getSiteUrl();
  const variants = product.variants?.edges?.map(edge => edge.node) || [];
  const mainVariant = variants.find(v => v.availableForSale) || variants[0];
  const images = product.images?.edges?.map(edge => edge.node.url) || [];
  const brandName = product.vendor || 'PhoneZlab';

  const lowPrice = variants.length > 0 
    ? Math.min(...variants.map(v => parseFloat(v.price.amount) || 0)) 
    : 0;
  const highPrice = variants.length > 0 
    ? Math.max(...variants.map(v => parseFloat(v.price.amount) || 0)) 
    : 0;

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/products/${product.handle}#product`,
    "name": product.title,
    "description": product.description || `Buy ${product.title} from PhoneZlab.`,
    "image": images.length > 0 ? images : [product.featuredImage?.url || `${siteUrl}/og-image.png`],
    "sku": mainVariant?.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": mainVariant?.price?.currencyCode || "INR",
      "lowPrice": lowPrice,
      "highPrice": highPrice,
      "offerCount": variants.length,
      "offers": variants.map(v => ({
        "@type": "Offer",
        "url": `${siteUrl}/products/${product.handle}?variant=${v.id.replace('gid://shopify/ProductVariant/', '')}`,
        "price": v.price.amount,
        "priceCurrency": v.price.currencyCode,
        "availability": v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }))
    }
  };

  // Add AggregateRating and Reviews if available
  if (reviewsData && reviewsData.reviewCount > 0 && reviewsData.averageRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": reviewsData.averageRating,
      "reviewCount": reviewsData.reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    };

    if (reviewsData.reviews && reviewsData.reviews.length > 0) {
      schema.review = reviewsData.reviews.slice(0, 5).map(rev => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": rev.reviewerName || "Verified Buyer"
        },
        "datePublished": rev.createdAt,
        "reviewBody": rev.body || "",
        "name": rev.title || "Product Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": rev.rating,
          "bestRating": "5",
          "worstRating": "1"
        }
      }));
    }
  }

  return schema;
}
