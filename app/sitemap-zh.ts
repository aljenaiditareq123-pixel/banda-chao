import { MetadataRoute } from 'next';

/**
 * Baidu-optimized sitemap for Chinese (/zh) routes only
 * 
 * Baidu prefers:
 * - daily changefreq
 * - priority 0.9 for main pages
 * - explicit lastmod dates
 */
export default function sitemapZh(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';
  
  // Chinese routes only
  const routes = [
    { path: '/zh', priority: 1.0 },
    { path: '/zh/products', priority: 0.9 },
    { path: '/zh/videos', priority: 0.9 },
    { path: '/zh/makers', priority: 0.9 },
    { path: '/zh/profile', priority: 0.7 },
    { path: '/zh/orders', priority: 0.7 },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route.priority,
  }));

  return sitemapEntries;
}

