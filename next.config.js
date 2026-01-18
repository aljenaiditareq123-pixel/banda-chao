const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    document: '/offline',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Optimize for Render: Use standalone output to reduce build size and memory usage
  // This creates a minimal server build that only includes necessary files
  output: 'standalone',
  
  // Ensure trailing slash is handled correctly for Render
  trailingSlash: false,
  
  // Optimize images for production
  // Mirror System: Allow images from external platforms to reduce hosting costs
  images: {
    remotePatterns: [
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      // Render deployments
      {
        protocol: 'https',
        hostname: 'banda-chao-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'banda-chao-frontend.onrender.com',
      },
      // External CDNs - Mirror System (Image Proxy)
      {
        protocol: 'https',
        hostname: '**.alicdn.com', // AliExpress CDN
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn.com', // TikTok CDN
      },
      {
        protocol: 'https',
        hostname: '**.tiktok.com', // TikTok
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Google/YouTube CDN
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com', // YouTube thumbnails
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net', // Facebook/Instagram CDN
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com', // Instagram CDN
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com', // Unsplash
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com', // Cloudinary
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com', // Imgur
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com', // AWS S3
      },
      {
        protocol: 'https',
        hostname: '**.storage.googleapis.com', // Google Cloud Storage
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache images for 60 seconds
  },
  
  // Disable source maps in production to reduce build size
  productionBrowserSourceMaps: false,
  
  // Turbopack configuration for Next.js 16
  // Note: Turbopack is enabled by default in Next.js 16
  // We keep webpack config for compatibility but add empty turbopack to silence the warning
  turbopack: {},
  
  // Webpack configuration (for compatibility, but Turbopack is default in Next.js 16)
  // Note: We removed --webpack flag from build script, so Turbopack is used by default
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
    
    // Ensure path aliases work correctly with webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './'),
    };
    
    // Ensure proper function binding
    config.optimization = {
      ...config.optimization,
      minimize: true,
      minimizer: config.optimization.minimizer || [],
    };
    
    return config;
  },
  
  // Note: Middleware handles locale routing
  // API Proxy Rewrite: Proxy API requests to main service to bypass CORS
  // CRITICAL: Backend routes are mounted at /api/v1/* (see server/src/index.ts)
  // Proxy rewrites /api/proxy/* to https://banda-chao.onrender.com/api/v1/*
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://banda-chao.onrender.com/api/v1/:path*',
      },
    ];
  },
  
  // !! WARN !! 
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = withPWA(nextConfig)

// Force rebuild: 2026-01-11T08:10:00Z - Trigger new build with HomePageClientWrapper fix
// Force deploy refresh - 2026-01-11
// Force Rebuild: Clear Cache Timestamp - 2026-01-11T12:00:00Z