/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@daira/ui"],
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
