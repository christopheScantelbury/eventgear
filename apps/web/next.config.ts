import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@eventgear/shared', '@eventgear/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.MINIO_ENDPOINT ?? 'localhost',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: '*.eventgear.com.br',
      },
    ],
  },
};

export default nextConfig;
