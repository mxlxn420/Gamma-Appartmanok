/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
    deviceSizes: [640, 1080, 1920],
    imageSizes: [16, 32, 64, 128, 256],
    formats: ["image/webp"],
    minimumCacheTTL: 2592000,
  },
};

module.exports = nextConfig;