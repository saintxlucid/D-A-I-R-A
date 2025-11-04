/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@daira/ui"],
  images: {
    domains: ["localhost"],
  },
  output: "standalone",
};

module.exports = nextConfig;
