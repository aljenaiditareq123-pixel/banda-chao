/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['zh', 'en', 'ar'],
    defaultLocale: 'zh',
    localeDetection: true,
  },
  images: {
    domains: ['banda-chao-backend.onrender.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig

