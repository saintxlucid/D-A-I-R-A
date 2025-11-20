import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Enable SWR for ISR and data revalidation
  experimental: {
    scrollRestoration: true,
  },

  // Image optimization for Egyptian market
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com', // S3 bucket
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com', // Cloudflare CDN
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern formats for bandwidth efficiency
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Internationalization (English + Arabic)
  i18n: {
    locales: ['en', 'ar-EG'],
    defaultLocale: 'en',
  },

  // Performance optimizations
  compress: true,
  swcMinify: true,

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },

  // Redirects for auth flows
  async redirects() {
    return [
      {
        source: '/auth',
        destination: '/auth/login',
        permanent: false,
      },
    ];
  },

  // Rewrites for API routing
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
