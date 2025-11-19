import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';
  
  const locales = ['zh', 'ar', 'en'];
  
  const routes = [
    '',
    '/products',
    '/makers',
    '/videos',
    '/feed',
    '/login',
    '/register',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale and route
  locales.forEach((locale) => {
    routes.forEach((route) => {
      const url = `${baseUrl}/${locale}${route}`;
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  // Add non-locale routes
  const nonLocaleRoutes = [
    '/founder',
    '/founder/assistant',
  ];

  nonLocaleRoutes.forEach((route) => {
    sitemapEntries.push({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  return sitemapEntries;
}

