/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@daira/ui'],
  experimental: {
    typedRoutes: true,
  },
};

module.exports = withPWA(nextConfig);
