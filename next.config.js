/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 16, no need to specify
  
  // Ensure trailing slash is handled correctly for Render
  trailingSlash: false,
  
  // IMPORTANT: Do NOT use output: 'export' - it disables Server-Side Rendering
  // and breaks dynamic routes like /[locale] on Render
  // output: 'export', // ❌ REMOVED - breaks i18n routing
  
  images: {
    // domains is deprecated, using remotePatterns only
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'https',
        hostname: 'banda-chao-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'banda-chao.onrender.com',
      },
    ],
  },
  
  // Note: Rewrites removed - middleware handles locale routing
  // Rewrites can conflict with middleware in App Router
}

module.exports = nextConfig

