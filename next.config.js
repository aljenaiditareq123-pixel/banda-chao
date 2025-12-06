/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 16, no need to specify
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
}

module.exports = nextConfig

