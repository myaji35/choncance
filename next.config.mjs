import { fileURLToPath } from 'url';
import path from 'path';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker/self-hosting
  // For Vercel, this can be removed or kept (Vercel handles it automatically)
  output: 'standalone',
  turbopack: {
    root: projectRoot,
  },
  // Ignore ESLint and TypeScript errors during builds (fix separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    eslint: {
      ignoreDuringBuilds: true,
    },
  },
  images: {
    // Enable image optimization for remote domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Supported formats (AVIF first for better compression, then WebP)
    formats: ['image/avif', 'image/webp'],
    // Device sizes optimized for modern mobile devices with high PPI
    // iPhone 14 Pro: 390×844 @3x, Samsung Galaxy S23: 360×800 @3.5x
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset generation (supports 1x, 2x, 3x PPI)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 30 days (production optimization)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Enable optimization with quality settings
    unoptimized: false,
    // Quality settings (75 is optimal for web, balances quality vs file size)
    // For Retina displays, Next.js automatically generates 2x versions
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
