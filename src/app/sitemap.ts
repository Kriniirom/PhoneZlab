import type { MetadataRoute } from 'next';
import { getProducts } from '@/features/product/api';
import { getCollections } from '@/features/collection/api';
import { getSiteUrl } from '@/utils/seo';

/**
 * Generates the dynamic sitemap.xml for search engines.
 * Queries Shopify to construct entries for all products and collections.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  let products: any[] = [];
  let collections: any[] = [];

  try {
    // Fetch a healthy subset of products and collections
    products = await getProducts(100);
  } catch (err) {
    console.error("Error fetching products for sitemap:", err);
  }

  try {
    collections = await getCollections(100);
  } catch (err) {
    console.error("Error fetching collections for sitemap:", err);
  }

  // 1. Static Store Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // 2. Dynamic Product Pages
  const productEntries: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${siteUrl}/products/${prod.handle}`,
    lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 3. Dynamic Collection Pages
  const collectionEntries: MetadataRoute.Sitemap = collections.map((coll) => ({
    url: `${siteUrl}/collections/${coll.handle}`,
    lastModified: coll.updatedAt ? new Date(coll.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...productEntries, ...collectionEntries];
}
