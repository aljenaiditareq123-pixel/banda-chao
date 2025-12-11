/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize for Render: Use standalone output to reduce build size and memory usage
  // This creates a minimal server build that only includes necessary files
  output: 'standalone',
  
  // Ensure trailing slash is handled correctly for Render
  trailingSlash: false,
  
  // Optimize images for production
  images: {
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
        hostname: 'banda-chao-frontend.onrender.com',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimize compilation
  swcMinify: true,
  
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  
  // Note: Middleware handles locale routing
  // Rewrites removed - can conflict with middleware in App Router
}

module.exports = nextConfig

