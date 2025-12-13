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
  
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  
  // Turbopack configuration for Next.js 16
  // Note: Turbopack is enabled by default in Next.js 16
  // We keep webpack config for compatibility but add empty turbopack to silence the warning
  turbopack: {},
  
  // Webpack configuration to fix Function.prototype.apply errors
  // This will be used if --webpack flag is passed, otherwise Turbopack is used
  webpack: (config, { isServer }) => {
    // Fix for Function.prototype.apply errors in production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ensure proper function binding
    config.optimization = {
      ...config.optimization,
      minimize: true,
      minimizer: config.optimization.minimizer || [],
    };
    
    return config;
  },
  
  // Note: Middleware handles locale routing
  // Rewrites removed - can conflict with middleware in App Router
  
  // !! WARN !! 
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig

