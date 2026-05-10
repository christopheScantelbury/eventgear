import path from 'path';
import { fileURLToPath } from 'url';
import withSerwistInit from '@serwist/next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Em monorepo, aponta a raiz do tracing pra cima de apps/web
  // pra que node_modules raiz seja incluído no .next/standalone.
  outputFileTracingRoot: path.join(__dirname, '../../'),
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
      {
        protocol: 'https',
        hostname: '*.easypanel.host',
      },
    ],
  },
};

export default withSerwist(nextConfig);
