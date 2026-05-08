/** @type {import('next').NextConfig} */
const nextConfig = {
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
