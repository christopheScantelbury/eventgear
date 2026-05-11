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

// No Vercel, output standalone não é necessário (Vercel gerencia o build).
// Em Docker (Railway/local), standalone é necessário para o server.js.
const isVercel = process.env.VERCEL === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isVercel ? {} : {
    output: 'standalone',
    // Em monorepo, aponta a raiz do tracing pra cima de apps/web
    // pra que node_modules raiz seja incluído no .next/standalone.
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
  transpilePackages: ['@eventgear/shared', '@eventgear/ui'],
  images: {
    // AVIF é ~50% menor que WebP; WebP ~30% menor que JPEG.
    // Next.js converte automaticamente ao servir as imagens.
    formats: ['image/avif', 'image/webp'],
    // TTL de 1 ano para imagens com hash (materiais, fotos de evento).
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: '*.eventgear.com.br',
      },
      {
        // MinIO no Railway
        protocol: 'https',
        hostname: '*.up.railway.app',
      },
    ],
  },
};

export default withSerwist(nextConfig);
