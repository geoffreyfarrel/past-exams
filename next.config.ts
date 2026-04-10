import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Allows Supabase storage/avatars
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev', // Allows Cloudflare R2 public bucket URLs
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
