/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 16, no need to specify
  
  // Ensure trailing slash is handled correctly for Render
  trailingSlash: false,
  
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
  
  // Rewrites for proper routing on Render
  async rewrites() {
    return [
      // Rewrite root to default locale
      {
        source: '/',
        destination: '/ar',
      },
    ];
  },
}

module.exports = nextConfig

