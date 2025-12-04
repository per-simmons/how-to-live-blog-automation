import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // For audio file uploads to Whisper
    },
  },
};

export default nextConfig;
