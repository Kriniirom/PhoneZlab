import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/utils/seo';

/**
 * Generates the robots.txt file dynamically.
 * Restricts sensitive checkout, customer account, and admin paths from crawlers.
 * Restricts common AI scraping bots while keeping primary search crawlers allowed.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/products/',
          '/collections',
          '/collections/',
          '/search',
        ],
        disallow: [
          '/admin',
          '/checkout',
          '/cart',
          '/account',
          '/orders',
          '/login',
          '/register',
          '/api/',
          '/auth/',
          '/profile',
          '/*?*preview=*', // Disallow preview versions
        ],
      },
      {
        // Keep AI scrapers from indexing and scraping the store catalog data
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Claude-Web',
          'ClaudeBot',
          'Google-Extended',
          'Anthropic-AI',
          'cohere-ai',
          'OMgili',
          'Applebot-Extended'
        ],
        disallow: ['/'],
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
