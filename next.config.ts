import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 828, 1080, 1200, 1920, 2560, 3840],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
